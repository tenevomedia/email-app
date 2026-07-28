"use client";
/* eslint-disable react-hooks/set-state-in-effect -- Persisted client state must be restored after hydration. */

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { EmailMessage, Folder, DEFAULT_EMAILS, DEFAULT_FOLDERS, DEFAULT_LABELS } from "./mockData";
import {
  findLabelById,
  flattenLabels,
  getLabelDescendantIds,
  getLabelPath,
  isLabelId,
  LABEL_COLOR_PRESETS,
  withUpdatedFolderCounts,
  withUpdatedLabelCounts,
} from "./labelUtils";
import { escapeHtml, parseRecipients } from "./mailValidation";

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
  defaultSignature: '',
  smtpRelayProvider: 'provider',
  identities: [],
  accounts: [],
};

const SYSTEM_BADGE_TEXTS = new Set(['Gesendet', 'Entwurf', 'Papierkorb', 'Archiv', 'Spam']);

/** Erhöhen, um gespeicherte Demo-/Alt-Daten einmalig zu verwerfen */
const DATA_VERSION = '3-no-demo';
const STORAGE_KEYS = {
  version: 'email_app_data_version',
  emails: 'email_app_emails',
  labels: 'email_app_labels',
  settings: 'email_app_settings',
} as const;

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
  const [emails, setEmails] = useState<EmailMessage[]>(DEFAULT_EMAILS);
  const [folders] = useState<Folder[]>(DEFAULT_FOLDERS);
  const [labels, setLabels] = useState<Folder[]>(DEFAULT_LABELS);
  const [activeFolderId, setActiveFolderId] = useState("inbox");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasLoadedPersistedState, setHasLoadedPersistedState] = useState(false);

  // Load from localStorage on client mount (Demo-Daten einmalig verwerfen)
  useEffect(() => {
    try {
      const storedVersion = localStorage.getItem(STORAGE_KEYS.version);
      if (storedVersion !== DATA_VERSION) {
        localStorage.removeItem(STORAGE_KEYS.emails);
        localStorage.removeItem(STORAGE_KEYS.labels);
        localStorage.removeItem(STORAGE_KEYS.settings);
        localStorage.setItem(STORAGE_KEYS.version, DATA_VERSION);
        setHasLoadedPersistedState(true);
        return;
      }

      const savedEmails = localStorage.getItem(STORAGE_KEYS.emails);
      if (savedEmails) {
        const parsed = JSON.parse(savedEmails) as EmailMessage[];
        setEmails(parsed.map(normalizeEmail));
      }

      const savedLabels = localStorage.getItem(STORAGE_KEYS.labels);
      if (savedLabels) setLabels(JSON.parse(savedLabels));

      const savedSettings = localStorage.getItem(STORAGE_KEYS.settings);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        if (parsed.theme) {
          document.documentElement.setAttribute("data-theme", parsed.theme);
        }
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    } finally {
      setHasLoadedPersistedState(true);
    }
  }, []);

  // Persist emails, labels & settings to localStorage
  useEffect(() => {
    if (!hasLoadedPersistedState) return;
    try {
      localStorage.setItem(STORAGE_KEYS.emails, JSON.stringify(emails));
    } catch {}
  }, [emails, hasLoadedPersistedState]);

  useEffect(() => {
    if (!hasLoadedPersistedState) return;
    try {
      localStorage.setItem(STORAGE_KEYS.labels, JSON.stringify(labels));
    } catch {}
  }, [labels, hasLoadedPersistedState]);

  useEffect(() => {
    if (!hasLoadedPersistedState) return;
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch {}
  }, [settings, hasLoadedPersistedState]);

  const foldersWithCounts = useMemo(
    () => withUpdatedFolderCounts(folders, emails),
    [folders, emails]
  );

  const labelsWithCounts = useMemo(
    () => withUpdatedLabelCounts(labels, emails),
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
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error || "Die E-Mail konnte nicht versendet werden.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Die E-Mail konnte nicht versendet werden.";
      showToast(message);
      throw error;
    }

    const recipients = parseRecipients(data.toEmail);
    const ccRecipients = data.cc?.trim() ? parseRecipients(data.cc) : [];

    const newEmail: EmailMessage = {
      id: `msg-${Date.now()}`,
      threadId: `th-${Date.now()}`,
      fromName: 'Aaron Olcaysu',
      fromEmail: data.fromEmail,
      toName: recipients[0].split('@')[0],
      toEmail: recipients.join(', '),
      cc: ccRecipients.length ? ccRecipients : undefined,
      subject: data.subject || '(Kein Betreff)',
      snippet: data.bodyText.substring(0, 100),
      bodyHtml: `<p style="font-family: sans-serif; line-height: 1.6;">${escapeHtml(data.bodyText).replace(/\n/g, '<br/>')}</p>`,
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
        folders: foldersWithCounts,
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
