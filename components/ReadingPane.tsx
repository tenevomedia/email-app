"use client";

import React, { useEffect, useRef, useState } from "react";
import { EmailMessage } from "@/lib/mockData";
import { useEmail } from "@/lib/emailContext";
import { flattenLabels } from "@/lib/labelUtils";
import { 
  Archive, 
  Trash2, 
  Tag, 
  MoreHorizontal, 
  Printer, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Pin, 
  Reply, 
  ReplyAll, 
  Forward,
  Mail,
  MailOpen,
  X,
  Check
} from "lucide-react";

interface ReadingPaneProps {
  email: EmailMessage | null;
  onOpenComposeWithReply?: (type: 'reply' | 'replyAll' | 'forward', email: EmailMessage) => void;
}

export const ReadingPane: React.FC<ReadingPaneProps> = ({ email, onOpenComposeWithReply }) => {
  const { 
    archiveEmail, 
    deleteEmail, 
    togglePinEmail, 
    toggleReadState, 
    toggleTagOnEmail, 
    removeTagFromEmail,
    getTagsForEmail,
    labels 
  } = useEmail();

  const [detailsOpen, setDetailsOpen] = useState(true);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const labelMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showLabelMenu) return;
    const onPointerDown = (event: MouseEvent) => {
      if (labelMenuRef.current && !labelMenuRef.current.contains(event.target as Node)) {
        setShowLabelMenu(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [showLabelMenu]);

  if (!email) {
    return (
      <div className="v-Split--readingpane" style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
          <p>Wähle eine E-Mail aus, um sie zu lesen</p>
        </div>
      </div>
    );
  }

  const emailTags = getTagsForEmail(email);
  const flatLabels = flattenLabels(labels);
  const assigned = new Set(email.tagIds || []);

  return (
    <div className="v-Split--readingpane">
      <div 
        style={{ 
          height: "var(--toolbar-height)", 
          borderBottom: "1px solid var(--border-subtle)", 
          display: "flex", 
          alignItems: "center", 
          padding: "0 12px", 
          gap: "6px",
          backgroundColor: "var(--bg-card)",
          position: "relative"
        }}
      >
        <button className="v-Button v-Button--subtle" title="Archivieren" onClick={() => archiveEmail(email.id)}>
          <Archive size={15} />
          <span>Archiv</span>
        </button>

        <span style={{ height: "16px", width: "1px", backgroundColor: "var(--border-subtle)" }} />

        <button className="v-Button v-Button--subtle" title="Löschen" onClick={() => deleteEmail(email.id)}>
          <Trash2 size={15} />
          <span>Löschen</span>
        </button>

        <span style={{ height: "16px", width: "1px", backgroundColor: "var(--border-subtle)" }} />

        <button 
          className="v-Button v-Button--subtle" 
          title={email.isPinned ? "Pin aufheben" : "Anpinnen"} 
          onClick={() => togglePinEmail(email.id)}
        >
          <Pin size={15} style={{ color: email.isPinned ? "var(--accent-primary)" : "inherit" }} />
          <span>{email.isPinned ? "Angepinnt" : "Anpinnen"}</span>
        </button>

        <span style={{ height: "16px", width: "1px", backgroundColor: "var(--border-subtle)" }} />

        <div style={{ position: "relative" }} ref={labelMenuRef}>
          <button 
            className="v-Button v-Button--subtle" 
            title="Labels" 
            onClick={() => setShowLabelMenu(!showLabelMenu)}
          >
            <Tag size={15} />
            <span>Labels</span>
            <ChevronDown size={13} />
          </button>

          {showLabelMenu && (
            <div 
              style={{ 
                position: "absolute", 
                top: "100%", 
                left: 0, 
                marginTop: "4px", 
                backgroundColor: "var(--bg-card)", 
                border: "1px solid var(--border-medium)", 
                borderRadius: "var(--radius-md)", 
                boxShadow: "var(--shadow-dropdown)", 
                zIndex: 50, 
                minWidth: "220px",
                maxHeight: "280px",
                overflowY: "auto",
                padding: "6px 0"
              }}
            >
              <div style={{ padding: "4px 12px", fontSize: "11px", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
                Labels zuweisen
              </div>

              {flatLabels.map(l => {
                const isOn = assigned.has(l.id);
                const indent = (l.depth || 0) * 12;
                return (
                  <button
                    key={l.id}
                    style={{
                      width: "100%",
                      padding: "6px 12px",
                      paddingLeft: `${12 + indent}px`,
                      textAlign: "left",
                      background: isOn ? "var(--bg-selected)" : "none",
                      border: "none",
                      fontSize: "12px",
                      color: "var(--text-main)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                    className="v-Button--subtle"
                    onClick={() => toggleTagOnEmail(email.id, l.id)}
                  >
                    <span style={{ width: "14px", display: "inline-flex", justifyContent: "center" }}>
                      {isOn ? <Check size={13} style={{ color: "var(--accent-primary)" }} /> : null}
                    </span>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: l.colorText || "var(--accent-primary)", flexShrink: 0 }} />
                    <span className="u-truncate">{l.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <span style={{ height: "16px", width: "1px", backgroundColor: "var(--border-subtle)" }} />

        <button className="v-Button v-Button--subtle" title="Als ungelesen markieren" onClick={() => toggleReadState(email.id)}>
          {email.isRead ? <Mail size={15} /> : <MailOpen size={15} />}
          <span>{email.isRead ? "Ungelesen" : "Gelesen"}</span>
        </button>

        <div style={{ flex: 1 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-main)", lineHeight: 1.3 }}>
            {email.subject}
          </h1>

          <div style={{ display: "flex", gap: "4px" }}>
            <button className="v-Button v-Button--subtle v-Button--iconOnly" title="Drucken">
              <Printer size={16} />
            </button>
            <button className="v-Button v-Button--subtle v-Button--iconOnly" title="In neuem Fenster öffnen">
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
          <span className="u-badge" style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}>
            {email.badge?.text === 'Papierkorb' ? 'Papierkorb'
              : email.badge?.text === 'Archiv' ? 'Archiv'
              : email.badge?.text === 'Gesendet' ? 'Gesendet'
              : email.badge?.text === 'Entwurf' ? 'Entwurf'
              : 'Posteingang'}
          </span>
          {emailTags.map(tag => (
            <span 
              key={tag.id}
              className="u-badge" 
              style={{ color: tag.colorText, backgroundColor: tag.colorBg, display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <span>{tag.path}</span>
              <span 
                style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }} 
                onClick={() => removeTagFromEmail(email.id, tag.id)}
                title="Label entfernen"
              >
                <X size={12} />
              </span>
            </span>
          ))}
        </div>

        <div 
          style={{ 
            backgroundColor: "var(--bg-card)", 
            border: "1px solid var(--border-subtle)", 
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden"
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div 
                className="v-Avatar" 
                style={{ 
                  backgroundColor: email.avatarColorClass || "#0067b9", 
                  width: "36px", 
                  height: "36px",
                  fontSize: "13px"
                }}
              >
                {email.avatarInitials || "AO"}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <strong style={{ fontSize: "15px", color: "var(--text-main)" }}>
                    {email.fromName}
                  </strong>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    &lt;{email.fromEmail}&gt;
                  </span>
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-subtle)", marginTop: "2px" }}>
                  an <span style={{ color: "var(--text-main)" }}>{email.toEmail}</span>
                  {email.cc && email.cc.length > 0 && (
                    <>, cc {email.cc.join(", ")}</>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-subtle)", marginRight: "8px" }}>
                  {email.formattedTime}
                </span>

                <button 
                  className="v-Button v-Button--subtle v-Button--iconOnly"
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  title={detailsOpen ? "Details ausblenden" : "Details anzeigen"}
                >
                  {detailsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <button 
                  className="v-Button v-Button--cta" 
                  style={{ height: "30px", fontSize: "12px" }}
                  onClick={() => onOpenComposeWithReply?.('reply', email)}
                >
                  <Reply size={14} />
                  <span>Antworten</span>
                </button>

                <button className="v-Button v-Button--subtle v-Button--iconOnly" title="Aktionen">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {detailsOpen && (
              <div 
                style={{ 
                  marginTop: "14px", 
                  paddingTop: "12px", 
                  borderTop: "1px dashed var(--border-subtle)", 
                  fontSize: "12px", 
                  display: "grid",
                  gridTemplateColumns: "80px 1fr",
                  rowGap: "6px",
                  color: "var(--text-muted)"
                }}
              >
                <div>Von:</div>
                <div style={{ color: "var(--text-main)" }}><strong>{email.fromName}</strong> &lt;{email.fromEmail}&gt;</div>

                <div>An:</div>
                <div style={{ color: "var(--text-main)" }}>&lt;{email.toEmail}&gt;</div>

                {email.cc && (
                  <>
                    <div>Cc:</div>
                    <div style={{ color: "var(--text-main)" }}>{email.cc.join(", ")}</div>
                  </>
                )}

                <div>Betreff:</div>
                <div style={{ color: "var(--text-main)" }}>{email.subject}</div>

                <div>Datum:</div>
                <div>{email.date}</div>

                <div>Größe:</div>
                <div>{email.size}</div>
              </div>
            )}
          </div>

          <div 
            style={{ padding: "24px", color: "var(--text-main)", fontSize: "14px", lineHeight: "1.6" }}
            dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
          />

          <div 
            style={{ 
              padding: "14px 20px", 
              backgroundColor: "var(--bg-hover)", 
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              gap: "8px"
            }}
          >
            <button 
              className="v-Button v-Button--subtle" 
              onClick={() => onOpenComposeWithReply?.('reply', email)}
            >
              <Reply size={14} />
              <span>Antworten</span>
            </button>

            <button 
              className="v-Button v-Button--subtle" 
              onClick={() => onOpenComposeWithReply?.('replyAll', email)}
            >
              <ReplyAll size={14} />
              <span>Antwort an alle</span>
            </button>

            <button 
              className="v-Button v-Button--subtle" 
              onClick={() => onOpenComposeWithReply?.('forward', email)}
            >
              <Forward size={14} />
              <span>Weiterleiten</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
