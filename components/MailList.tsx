"use client";

import React, { useMemo, useState } from "react";
import { EmailMessage } from "@/lib/mockData";
import { useEmail } from "@/lib/emailContext";
import { 
  Filter, 
  ArrowUpDown, 
  MoreHorizontal, 
  Paperclip, 
  Archive, 
  Trash2, 
  Pin, 
  CheckSquare, 
  Square,
  Mail,
  MailOpen
} from "lucide-react";

interface MailListProps {
  emails: EmailMessage[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  folderName: string;
  onOpenDraft?: (email: EmailMessage) => void;
}

export const MailList: React.FC<MailListProps> = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  folderName,
  onOpenDraft,
}) => {
  const { togglePinEmail, deleteEmail, archiveEmail, toggleReadState, getTagsForEmail } = useEmail();
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [allChecked, setAllChecked] = useState(false);

  const selectedIds = useMemo(() => Object.keys(checkedIds).filter((id) => checkedIds[id]), [checkedIds]);

  const toggleCheckAll = () => {
    const next = !allChecked;
    setAllChecked(next);
    const newChecked: Record<string, boolean> = {};
    emails.forEach(e => { newChecked[e.id] = next; });
    setCheckedIds(newChecked);
  };

  const toggleChecked = (id: string) => {
    setCheckedIds((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  const applyToSelection = (action: (id: string) => void) => {
    selectedIds.forEach(action);
    setCheckedIds({});
    setAllChecked(false);
  };

  // Sort: Pinned emails stay at the top!
  const sortedEmails = [...emails].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const handleItemClick = (email: EmailMessage) => {
    if (email.badge?.text === 'Entwurf') {
      onOpenDraft?.(email);
    } else {
      onSelectEmail(email.id);
    }
  };

  return (
    <div className="v-Split--maillist">
      {/* Mailbox Toolbar */}
      <div 
        style={{ 
          height: "var(--toolbar-height)", 
          borderBottom: "1px solid var(--border-subtle)", 
          display: "flex", 
          alignItems: "center", 
          padding: "0 10px", 
          gap: "8px", 
          fontSize: "var(--font-size-sm)",
          backgroundColor: "var(--bg-maillist)"
        }}
      >
        <button 
          className="v-Button v-Button--subtle v-Button--iconOnly" 
          onClick={toggleCheckAll}
          title="Alle auswählen"
        >
          {allChecked ? <CheckSquare size={16} style={{ color: "var(--accent-primary)" }} /> : <Square size={16} />}
        </button>

        <div style={{ flex: 1, fontWeight: 600, fontSize: "12px", color: "var(--text-subtle)" }}>
          {selectedIds.length ? `${selectedIds.length} ausgewählt` : folderName}
        </div>

        {selectedIds.length > 0 && <>
          <button className="v-Button v-Button--subtle v-Button--iconOnly" title="Ausgewählte archivieren" onClick={() => applyToSelection(archiveEmail)}><Archive size={15} /></button>
          <button className="v-Button v-Button--subtle v-Button--iconOnly" title="Ausgewählte löschen" onClick={() => applyToSelection(deleteEmail)}><Trash2 size={15} /></button>
          <button className="v-Button v-Button--subtle v-Button--iconOnly" title="Lesestatus umschalten" onClick={() => applyToSelection(toggleReadState)}><Mail size={15} /></button>
        </>}

        <button className="v-Button v-Button--subtle v-Button--iconOnly" title="Filter">
          <Filter size={15} />
        </button>
        <button className="v-Button v-Button--subtle v-Button--iconOnly" title="Sortierung">
          <ArrowUpDown size={15} />
        </button>
        <button className="v-Button v-Button--subtle v-Button--iconOnly" title="Mehr Aktionen">
          <MoreHorizontal size={15} />
        </button>
      </div>

      {/* Email List Items */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {sortedEmails.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
            Hier ist nichts
          </div>
        ) : (
          sortedEmails.map((email) => {
            const isSelected = selectedEmailId === email.id;
            const emailTags = getTagsForEmail(email);

            return (
              <div
                key={email.id}
                onClick={() => handleItemClick(email)}
                className={`v-MailboxItem ${isSelected ? "is-selected is-focused" : ""} ${email.isRead ? "is-read" : ""}`}
              >
                {/* Header row: Sender + Pin Indicator + Thread count + Date */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                  <button
                    className="v-Button v-Button--subtle v-Button--iconOnly"
                    style={{ padding: "2px" }}
                    title={checkedIds[email.id] ? "Auswahl aufheben" : "E-Mail auswählen"}
                    aria-label={checkedIds[email.id] ? "Auswahl aufheben" : "E-Mail auswählen"}
                    onClick={(event) => { event.stopPropagation(); toggleChecked(email.id); }}
                  >
                    {checkedIds[email.id] ? <CheckSquare size={14} style={{ color: "var(--accent-primary)" }} /> : <Square size={14} />}
                  </button>
                  {/* Avatar */}
                  <div 
                    className="v-Avatar" 
                    style={{ 
                      backgroundColor: email.avatarColorClass || "#0067b9", 
                      width: "24px", 
                      height: "24px", 
                      fontSize: "10px" 
                    }}
                  >
                    {email.avatarInitials || "AO"}
                  </div>

                  <span className="u-truncate" style={{ flex: 1, fontSize: "13px" }}>
                    {email.fromName}
                  </span>

                  {email.isPinned && (
                    <span title="Angepinnt">
                      <Pin size={13} style={{ color: "var(--accent-primary)", fill: "var(--accent-primary)" }} />
                    </span>
                  )}

                  {email.threadCount && email.threadCount > 1 && (
                    <span 
                      style={{ 
                        fontSize: "11px", 
                        backgroundColor: "var(--bg-hover)", 
                        padding: "1px 5px", 
                        borderRadius: "10px", 
                        color: "var(--text-muted)" 
                      }}
                    >
                      {email.threadCount}
                    </span>
                  )}

                  <span style={{ fontSize: "11px", color: "var(--text-subtle)", whiteSpace: "nowrap" }}>
                    {email.formattedTime}
                  </span>
                </div>

                {/* Subject row */}
                <div 
                  className="u-truncate" 
                  style={{ 
                    fontSize: "13px", 
                    marginTop: "2px",
                    fontWeight: email.isRead ? 400 : 700 
                  }}
                >
                  {email.subject}
                </div>

                {/* Snippet preview row */}
                <div 
                  className="u-truncate" 
                  style={{ 
                    fontSize: "12px", 
                    color: "var(--text-muted)", 
                    marginTop: "2px" 
                  }}
                >
                  {email.snippet}
                </div>

                {/* Bottom row: Tags / folder badge, attachments, size */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
                  {email.badge && ['Gesendet', 'Entwurf', 'Papierkorb', 'Archiv'].includes(email.badge.text) && (
                    <span 
                      className="u-badge" 
                      style={{ color: email.badge.colorText, backgroundColor: email.badge.colorBg }}
                    >
                      {email.badge.text}
                    </span>
                  )}
                  {emailTags.slice(0, 2).map(tag => (
                    <span
                      key={tag.id}
                      className="u-badge"
                      style={{ color: tag.colorText, backgroundColor: tag.colorBg }}
                    >
                      {tag.name}
                    </span>
                  ))}
                  {emailTags.length > 2 && (
                    <span className="u-badge" style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-hover)" }}>
                      +{emailTags.length - 2}
                    </span>
                  )}

                  <div style={{ flex: 1 }} />

                  {email.hasAttachment && (
                    <Paperclip size={13} style={{ color: "var(--text-subtle)" }} />
                  )}

                  <span style={{ fontSize: "10px", color: "var(--text-subtle)" }}>
                    {email.size}
                  </span>
                </div>

                {/* Floating Action Buttons on Hover */}
                <div className="v-MailboxItem-hoverActions" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="v-Button v-Button--subtle v-Button--iconOnly" 
                    title={email.isPinned ? "Pin aufheben" : "Anpinnen"}
                    onClick={() => togglePinEmail(email.id)}
                  >
                    <Pin size={14} style={{ color: email.isPinned ? "var(--accent-primary)" : "inherit" }} />
                  </button>

                  <button 
                    className="v-Button v-Button--subtle v-Button--iconOnly" 
                    title={email.isRead ? "Als ungelesen markieren" : "Als gelesen markieren"}
                    onClick={() => toggleReadState(email.id)}
                  >
                    {email.isRead ? <Mail size={14} /> : <MailOpen size={14} />}
                  </button>

                  <button 
                    className="v-Button v-Button--subtle v-Button--iconOnly" 
                    title="Archivieren"
                    onClick={() => archiveEmail(email.id)}
                  >
                    <Archive size={14} />
                  </button>

                  <button 
                    className="v-Button v-Button--subtle v-Button--iconOnly" 
                    title="Löschen"
                    onClick={() => deleteEmail(email.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mailbox Status Bar */}
      <div 
        style={{ 
          height: "var(--statusbar-height)", 
          borderTop: "1px solid var(--border-subtle)", 
          display: "flex", 
          alignItems: "center", 
          padding: "0 12px", 
          fontSize: "11px", 
          color: "var(--text-muted)",
          backgroundColor: "var(--bg-maillist)"
        }}
      >
        1–{sortedEmails.length} von {sortedEmails.length}
      </div>
    </div>
  );
};
