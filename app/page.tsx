"use client";

import React, { useState } from "react";
import { useEmail } from "@/lib/emailContext";
import { PageHeader } from "@/components/PageHeader";
import { Sidebar } from "@/components/Sidebar";
import { MailList } from "@/components/MailList";
import { ReadingPane } from "@/components/ReadingPane";
import { ComposeModal } from "@/components/ComposeModal";
import { EmailMessage } from "@/lib/mockData";
import { findLabelById, getLabelDescendantIds, getLabelPath, isLabelId } from "@/lib/labelUtils";

export default function MailAppHome() {
  const { 
    emails, 
    folders, 
    labels, 
    activeFolderId, 
    selectedEmailId, 
    searchQuery, 
    settings, 
    toastMessage, 
    setActiveFolderId, 
    setSelectedEmailId, 
    setSearchQuery, 
    updateSettings, 
    showToast 
  } = useEmail();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyPayload, setReplyPayload] = useState<{
    type: 'reply' | 'replyAll' | 'forward';
    email: EmailMessage;
  } | null>(null);
  const [draftToEdit, setDraftToEdit] = useState<EmailMessage | null>(null);

  const toggleTheme = () => {
    const nextTheme = settings.theme === "light" ? "dark" : "light";
    updateSettings({ theme: nextTheme });
  };

  const handleOpenCompose = () => {
    setReplyPayload(null);
    setDraftToEdit(null);
    setIsComposeOpen(true);
  };

  const handleOpenReply = (type: 'reply' | 'replyAll' | 'forward', email: EmailMessage) => {
    setDraftToEdit(null);
    setReplyPayload({ type, email });
    setIsComposeOpen(true);
  };

  const handleOpenDraft = (draft: EmailMessage) => {
    setReplyPayload(null);
    setDraftToEdit(draft);
    setIsComposeOpen(true);
  };

  // Filter emails based on folder, label/tag, or search query
  const filteredEmails = emails.filter(email => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        email.subject.toLowerCase().includes(q) ||
        email.fromName.toLowerCase().includes(q) ||
        email.fromEmail.toLowerCase().includes(q) ||
        email.snippet.toLowerCase().includes(q)
      );
    }

    if (isLabelId(labels, activeFolderId)) {
      const label = findLabelById(labels, activeFolderId);
      if (!label) return false;
      const matchingIds = new Set(getLabelDescendantIds(label));
      return (email.tagIds || []).some(id => matchingIds.has(id));
    }

    if (activeFolderId === 'sent') {
      return email.badge?.text === 'Gesendet';
    }
    if (activeFolderId === 'drafts') {
      return email.badge?.text === 'Entwurf';
    }
    if (activeFolderId === 'trash') {
      return email.badge?.text === 'Papierkorb';
    }
    if (activeFolderId === 'archive') {
      return email.badge?.text === 'Archiv';
    }

    // Default inbox excludes trash / sent / drafts / archive
    return !email.badge || !['Papierkorb', 'Gesendet', 'Entwurf', 'Archiv'].includes(email.badge.text);
  });

  const selectedEmail = emails.find(e => e.id === selectedEmailId) || null;

  const currentFolderName =
    folders.find(f => f.id === activeFolderId)?.name ||
    getLabelPath(labels, activeFolderId) ||
    "Posteingang";

  return (
    <div className="app-root">
      {/* Top Header Bar */}
      <PageHeader
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentTheme={settings.theme}
        onToggleTheme={toggleTheme}
        onOpenCompose={handleOpenCompose}
      />

      {/* Main 3-Column Layout */}
      <main className="v-Page-main">
        {/* Column 1: Sidebar */}
        {sidebarOpen && (
          <Sidebar
            folders={folders}
            labels={labels}
            activeFolderId={activeFolderId}
            onSelectFolder={setActiveFolderId}
            onOpenCompose={handleOpenCompose}
          />
        )}

        {/* Column 2: Mail List */}
        <MailList
          emails={filteredEmails}
          selectedEmailId={selectedEmailId}
          onSelectEmail={setSelectedEmailId}
          folderName={currentFolderName}
          onOpenDraft={handleOpenDraft}
        />

        {/* Column 3: Reading Pane */}
        <ReadingPane
          email={selectedEmail}
          onOpenComposeWithReply={handleOpenReply}
        />
      </main>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        replyToMessage={replyPayload}
        draftToEdit={draftToEdit}
      />

      {/* Toast Notifications */}
      {toastMessage && (
        <div 
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1e293b",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            fontWeight: 500,
            boxShadow: "var(--shadow-md)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <span>{toastMessage}</span>
          <button 
            style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontWeight: 700, fontSize: "12px" }}
            onClick={() => showToast("Aktion rückgängig gemacht.")}
          >
            Rückgängig (Undo)
          </button>
        </div>
      )}
    </div>
  );
}
