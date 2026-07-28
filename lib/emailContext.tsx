"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { EmailMessage, Folder, MOCK_EMAILS, MOCK_FOLDERS, MOCK_LABELS } from "./mockData";
import {
  findLabelById,
  flattenLabels,
  getLabelDescendantIds,
  getLabelPath,
  isLabelId,
  LABEL_COLOR_PRESETS,
  withUpdatedLabelCounts,
} from "./labelUtils";

export interface Identity {
  id: string;
  name: string;
  email: string;
  signature: string;
  isDefault: boolean;
}

export interface AccountSetting {
  id: string;
  name: string;
  email: string;
  provider: 'fastmail' | 'gmail' | 'outlook' | 'custom';
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  authType: 'password' | 'oauth2' | 'token';
  isConnected: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  density: 'compact' | 'comfortable';
  sendDelaySeconds: number; // For Undo Send
  defaultSignature: string;
  smtpRelayProvider: 'provider' | 'resend' | 'amazon_ses';
  resendApiKey?: string;
  identities: Identity[];
  accounts: AccountSetting[];
}

interface EmailContextType {
  emails: EmailMessage[];
  folders: Folder[];
  labels: Folder[];
  activeFolderId: string;
  selectedEmailId: string | null;
  searchQuery: string;
  settings: AppSettings;
  toastMessage: string | null;
  
  // State setters
  setActiveFolderId: (id: string) => void;
  setSelectedEmailId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  showToast: (msg: string) => void;
  
  // Actions
  togglePinEmail: (id: string) => void;
  deleteEmail: (id: string) => void;
  archiveEmail: (id: string) => void;
  toggleReadState: (id: string) => void;
  toggleStarState: (id: string) => void;
  moveEmailToFolder: (id: string, targetFolderId: string) => void;
  toggleTagOnEmail: (emailId: string, tagId: string) => void;
  removeTagFromEmail: (emailId: string, tagId: string) => void;
  createLabel: (name: string, parentId?: string) => void;
  deleteLabel: (tagId: string) => void;
  getTagsForEmail: (email: EmailMessage) => Array<{ id: string; name: string; path: string; colorText: string; colorBg: string }>;
  saveDraft: (draft: Partial<EmailMessage>) => void;
  sendEmail: (data: { fromEmail: string; toEmail: string; cc?: string; subject: string; bodyText: string }) => Promise<void>;
  
  // Settings Actions
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addIdentity: (identity: Omit<Identity, 'id'>) => void;
  deleteIdentity: (id: string) => void;
  addAccount: (account: Omit<AccountSetting, 'id'>) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  density: 'comfortable',
  sendDelaySeconds: 15,
  defaultSignature: 'Mit freundlichen Grüßen,\nAaron Olcaysu',
  smtpRelayProvider: 'provider',
  identities: [
    { id: 'id-1', name: 'Aaron Olcaysu', email: 'aaron@olcaysu.cc', signature: 'Beste Grüße,\nAaron', isDefault: true },
    { id: 'id-2', name: 'Aaron Olcaysu (Scout24)', email: 'aaron.olcaysu@scout24.com', signature: 'Regards,\nAaron Olcaysu | Scout24', isDefault: false },
    { id: 'id-3', name: 'Aaron Olcaysu (Privat)', email: 'aaron@olcaysu.com', signature: 'Grüße, Aaron', isDefault: false },
    { id: 'id-4', name: 'Support Team', email: 'support@deinedomain.cc', signature: 'Dein Support-Team', isDefault: false },
  ],
  accounts: [
    { id: 'acc-1', name: 'Fastmail Hauptkonto', email: 'aaron@olcaysu.cc', provider: 'fastmail', imapHost: 'imap.fastmail.com', imapPort: 993, smtpHost: 'smtp.fastmail.com', smtpPort: 465, authType: 'token', isConnected: true },
    { id: 'acc-2', name: 'Scout24 Business', email: 'aaron.olcaysu@scout24.com', provider: 'outlook', imapHost: 'outlook.office365.com', imapPort: 993, smtpHost: 'smtp.office365.com', smtpPort: 587, authType: 'oauth2', isConnected: true },
  ]
};

const SYSTEM_BADGE_TEXTS = new Set(['Gesendet', 'Entwurf', 'Papierkorb', 'Archiv']);

function normalizeEmail(email: EmailMessage): EmailMessage {
  const tagIds = Array.isArray(email.tagIds) ? email.tagIds : [];
  // Migration: früheres Badge-als-Label in Tags übernehmen, wenn kein System-Status
  if (tagIds.length === 0 && email.badge?.text && !SYSTEM_BADGE_TEXTS.has(email.badge.text)) {
    return { ...email, tagIds: [], badge: undefined };
  }
  return { ...email, tagIds };
}

const EmailContext = createContext<EmailContextType | null>(null);

export const EmailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emails, setEmails] = useState<EmailMessage[]>(MOCK_EMAILS);
  const [folders] = useState<Folder[]>(MOCK_FOLDERS);
  const [labels, setLabels] = useState<Folder[]>(MOCK_LABELS);
  const [activeFolderId, setActiveFolderId] = useState("inbox");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>("msg-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedEmails = localStorage.getItem("email_app_emails");
      if (savedEmails) {
        const parsed = JSON.parse(savedEmails) as EmailMessage[];
        setEmails(parsed.map(normalizeEmail));
      }

      const savedLabels = localStorage.getItem("email_app_labels");
      if (savedLabels) setLabels(JSON.parse(savedLabels));

      const savedSettings = localStorage.getItem("email_app_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        if (parsed.theme) {
          document.documentElement.setAttribute("data-theme", parsed.theme);
        }
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
  }, []);

  // Persist emails, labels & settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("email_app_emails", JSON.stringify(emails));
    } catch (e) {}
  }, [emails]);

  useEffect(() => {
    try {
      localStorage.setItem("email_app_labels", JSON.stringify(labels));
    } catch (e) {}
  }, [labels]);

  useEffect(() => {
    try {
      localStorage.setItem("email_app_settings", JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  const labelsWithCounts = useMemo(
    () => withUpdatedLabelCounts(labels, emails.map(e => e.tagIds || [])),
    [labels, emails]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const getTagsForEmail = (email: EmailMessage) => {
    return (email.tagIds || [])
      .map(tagId => {
        const label = findLabelById(labels, tagId);
        if (!label) return null;
        return {
          id: label.id,
          name: label.name,
          path: getLabelPath(labels, label.id) || label.name,
          colorText: label.colorText || "var(--text-main)",
          colorBg: label.colorBg || "var(--bg-hover)",
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);
  };

  // Actions implementation
  const togglePinEmail = (id: string) => {
    setEmails(prev => prev.map(e => {
      if (e.id === id) {
        const isPinned = !e.isPinned;
        showToast(isPinned ? "E-Mail angepinnt" : "Pin aufgehoben");
        return { ...e, isPinned };
      }
      return e;
    }));
  };

  const deleteEmail = (id: string) => {
    setEmails(prev => prev.map(e => {
      if (e.id === id) {
        const isTrash = e.badge?.text === 'Papierkorb';
        if (isTrash) {
          showToast("E-Mail dauerhaft gelöscht");
          return null as unknown as EmailMessage;
        }
        showToast("E-Mail in den Papierkorb verschoben");
        return {
          ...e,
          badge: { text: 'Papierkorb', colorText: 'var(--label-red-text)', colorBg: 'var(--label-red-bg)' }
        };
      }
      return e;
    }).filter(Boolean));

    if (selectedEmailId === id) {
      setSelectedEmailId(null);
    }
  };

  const archiveEmail = (id: string) => {
    setEmails(prev => prev.map(e => {
      if (e.id === id) {
        showToast("E-Mail archiviert");
        return {
          ...e,
          badge: { text: 'Archiv', colorText: 'var(--label-gray-text)', colorBg: 'var(--label-gray-bg)' }
        };
      }
      return e;
    }));
  };

  const toggleReadState = (id: string) => {
    setEmails(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, isRead: !e.isRead };
      }
      return e;
    }));
  };

  const toggleStarState = (id: string) => {
    setEmails(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, isStarred: !e.isStarred };
      }
      return e;
    }));
  };

  const moveEmailToFolder = (id: string, targetFolderId: string) => {
    setEmails(prev => prev.map(e => {
      if (e.id === id) {
        showToast(`In Ordner "${targetFolderId}" verschoben`);
        return {
          ...e,
          badge: { text: targetFolderId, colorText: 'var(--label-blue-text)', colorBg: 'var(--label-blue-bg)' }
        };
      }
      return e;
    }));
  };

  const toggleTagOnEmail = (emailId: string, tagId: string) => {
    const label = findLabelById(labels, tagId);
    if (!label) return;

    setEmails(prev => prev.map(e => {
      if (e.id !== emailId) return e;
      const current = e.tagIds || [];
      const hasTag = current.includes(tagId);
      const tagIds = hasTag
        ? current.filter(id => id !== tagId)
        : [...current, tagId];
      showToast(hasTag ? `Label „${label.name}“ entfernt` : `Label „${label.name}“ zugewiesen`);
      return { ...e, tagIds };
    }));
  };

  const removeTagFromEmail = (emailId: string, tagId: string) => {
    const label = findLabelById(labels, tagId);
    setEmails(prev => prev.map(e => {
      if (e.id !== emailId) return e;
      return { ...e, tagIds: (e.tagIds || []).filter(id => id !== tagId) };
    }));
    showToast(label ? `Label „${label.name}“ entfernt` : "Label entfernt");
  };

  const createLabel = (name: string, parentId?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const existing = flattenLabels(labels).some(
      l => l.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      showToast(`Label „${trimmed}“ existiert bereits`);
      return;
    }

    const colors = LABEL_COLOR_PRESETS[Math.floor(Math.random() * LABEL_COLOR_PRESETS.length)];
    const newLabel: Folder = {
      id: `label-${Date.now()}`,
      name: trimmed,
      type: 'custom',
      count: 0,
      colorText: colors.colorText,
      colorBg: colors.colorBg,
      depth: parentId ? 1 : 0,
    };

    setLabels(prev => {
      if (!parentId) return [...prev, newLabel];

      const addChild = (items: Folder[]): Folder[] =>
        items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), { ...newLabel, depth: (item.depth || 0) + 1 }],
            };
          }
          if (item.children?.length) {
            return { ...item, children: addChild(item.children) };
          }
          return item;
        });

      return addChild(prev);
    });

    showToast(`Label „${trimmed}“ erstellt`);
  };

  const deleteLabel = (tagId: string) => {
    const label = findLabelById(labels, tagId);
    if (!label) return;

    const idsToRemove = new Set(getLabelDescendantIds(label));

    const removeFromTree = (items: Folder[]): Folder[] =>
      items
        .filter(item => !idsToRemove.has(item.id))
        .map(item => ({
          ...item,
          children: item.children ? removeFromTree(item.children) : undefined,
        }));

    setLabels(prev => removeFromTree(prev));
    setEmails(prev => prev.map(e => ({
      ...e,
      tagIds: (e.tagIds || []).filter(id => !idsToRemove.has(id)),
    })));

    if (isLabelId(labels, activeFolderId) && idsToRemove.has(activeFolderId)) {
      setActiveFolderId('inbox');
    }

    showToast(`Label „${label.name}“ gelöscht`);
  };

  const saveDraft = (draft: Partial<EmailMessage>) => {
    const existingIndex = emails.findIndex(e => e.id === draft.id);
    if (existingIndex >= 0) {
      setEmails(prev => {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], ...draft, tagIds: draft.tagIds ?? copy[existingIndex].tagIds };
        return copy;
      });
    } else {
      const newDraft: EmailMessage = {
        id: `draft-${Date.now()}`,
        threadId: `th-draft-${Date.now()}`,
        fromName: 'Aaron Olcaysu',
        fromEmail: draft.fromEmail || 'aaron@olcaysu.cc',
        toName: draft.toEmail ? draft.toEmail.split('@')[0] : 'Unbekannt',
        toEmail: draft.toEmail || '',
        subject: draft.subject || '(Kein Betreff)',
        snippet: (draft.snippet || draft.bodyHtml || '').substring(0, 100),
        bodyHtml: draft.bodyHtml || '',
        date: new Date().toLocaleString('de-DE'),
        formattedTime: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        size: '4 KB',
        isRead: true,
        isStarred: false,
        isPinned: false,
        hasAttachment: false,
        tagIds: draft.tagIds || [],
        badge: { text: 'Entwurf', colorText: 'var(--label-yellow-text)', colorBg: 'var(--label-yellow-bg)' }
      };
      setEmails(prev => [newDraft, ...prev]);
    }
    showToast("Entwurf gespeichert");
  };

  const sendEmail = async (data: { fromEmail: string; toEmail: string; cc?: string; subject: string; bodyText: string }) => {
    try {
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {}

    const newEmail: EmailMessage = {
      id: `msg-${Date.now()}`,
      threadId: `th-${Date.now()}`,
      fromName: 'Aaron Olcaysu',
      fromEmail: data.fromEmail,
      toName: data.toEmail.split('@')[0],
      toEmail: data.toEmail,
      cc: data.cc ? [data.cc] : undefined,
      subject: data.subject || '(Kein Betreff)',
      snippet: data.bodyText.substring(0, 100),
      bodyHtml: `<p style="font-family: sans-serif; line-height: 1.6;">${data.bodyText.replace(/\n/g, '<br/>')}</p>`,
      date: new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      formattedTime: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      size: '14 KB',
      isRead: true,
      isStarred: false,
      isPinned: false,
      hasAttachment: false,
      tagIds: [],
      badge: { text: 'Gesendet', colorText: 'var(--label-blue-text)', colorBg: 'var(--label-blue-bg)' },
      avatarInitials: 'AO',
      avatarColorClass: '#0067b9'
    };

    setEmails(prev => [newEmail, ...prev]);
    setSelectedEmailId(newEmail.id);
    showToast(`E-Mail gesendet von "${data.fromEmail}" an "${data.toEmail}"`);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.theme) {
        document.documentElement.setAttribute("data-theme", newSettings.theme);
      }
      return updated;
    });
    showToast("Einstellungen gespeichert");
  };

  const addIdentity = (identity: Omit<Identity, 'id'>) => {
    const newId = `id-${Date.now()}`;
    setSettings(prev => ({
      ...prev,
      identities: [...prev.identities, { ...identity, id: newId }]
    }));
    showToast(`Absender-Adresse "${identity.email}" hinzugefügt`);
  };

  const deleteIdentity = (id: string) => {
    setSettings(prev => ({
      ...prev,
      identities: prev.identities.filter(i => i.id !== id)
    }));
    showToast("Absender-Adresse entfernt");
  };

  const addAccount = (account: Omit<AccountSetting, 'id'>) => {
    const newId = `acc-${Date.now()}`;
    setSettings(prev => ({
      ...prev,
      accounts: [...prev.accounts, { ...account, id: newId }]
    }));
    showToast(`Konto "${account.name}" hinzugefügt`);
  };

  return (
    <EmailContext.Provider
      value={{
        emails,
        folders,
        labels: labelsWithCounts,
        activeFolderId,
        selectedEmailId,
        searchQuery,
        settings,
        toastMessage,
        setActiveFolderId,
        setSelectedEmailId,
        setSearchQuery,
        showToast,
        togglePinEmail,
        deleteEmail,
        archiveEmail,
        toggleReadState,
        toggleStarState,
        moveEmailToFolder,
        toggleTagOnEmail,
        removeTagFromEmail,
        createLabel,
        deleteLabel,
        getTagsForEmail,
        saveDraft,
        sendEmail,
        updateSettings,
        addIdentity,
        deleteIdentity,
        addAccount
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) throw new Error("useEmail must be used within an EmailProvider");
  return context;
};
