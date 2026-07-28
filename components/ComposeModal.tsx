"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Send, 
  Paperclip, 
  Clock, 
  Trash2, 
  Save,
  HelpCircle
} from "lucide-react";
import { EmailMessage } from "@/lib/mockData";
import { useEmail } from "@/lib/emailContext";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyToMessage?: {
    type: 'reply' | 'replyAll' | 'forward';
    email: EmailMessage;
  } | null;
  draftToEdit?: EmailMessage | null;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  replyToMessage,
  draftToEdit
}) => {
  const { settings, sendEmail, saveDraft, showToast } = useEmail();

  const defaultId = settings.identities.find(i => i.isDefault) || settings.identities[0];
  const [fromAddress, setFromAddress] = useState(defaultId ? defaultId.email : "aaron@olcaysu.cc");
  const [isCustomFrom, setIsCustomFrom] = useState(false);
  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (draftToEdit) {
      setFromAddress(draftToEdit.fromEmail || defaultId?.email || "aaron@olcaysu.cc");
      setToInput(draftToEdit.toEmail || "");
      setSubject(draftToEdit.subject || "");
      setBody(draftToEdit.snippet || "");
    } else if (replyToMessage) {
      setFromAddress(defaultId ? defaultId.email : "aaron@olcaysu.cc");
      setToInput(replyToMessage.email.fromEmail);
      setSubject(
        replyToMessage.type === 'forward'
          ? `Fwd: ${replyToMessage.email.subject}`
          : `Re: ${replyToMessage.email.subject}`
      );
      setBody(
        `\n\n--- Ursprüngliche Nachricht ---\nVon: ${replyToMessage.email.fromName} <${replyToMessage.email.fromEmail}>\nDatum: ${replyToMessage.email.date}\nBetreff: ${replyToMessage.email.subject}\n`
      );
    } else {
      setFromAddress(defaultId ? defaultId.email : "aaron@olcaysu.cc");
      setToInput("");
      setSubject("");
      setBody(settings.defaultSignature ? `\n\n${settings.defaultSignature}` : "");
    }
  }, [replyToMessage, draftToEdit, settings.defaultSignature, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toInput.trim()) {
      showToast("Bitte gib eine Empfänger E-Mail an");
      return;
    }

    await sendEmail({
      fromEmail: fromAddress,
      toEmail: toInput,
      cc: ccInput || undefined,
      subject,
      bodyText: body
    });
    onClose();
  };

  const handleSaveDraftClick = () => {
    saveDraft({
      id: draftToEdit?.id,
      fromEmail: fromAddress,
      toEmail: toInput,
      subject,
      bodyHtml: `<p style="font-family: sans-serif; line-height: 1.6;">${body.replace(/\n/g, '<br/>')}</p>`,
      snippet: body
    });
    onClose();
  };

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px"
      }}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: "760px",
          height: "85vh",
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-dropdown)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid var(--border-medium)"
        }}
      >
        {/* Header Bar */}
        <div 
          style={{
            height: "44px",
            backgroundColor: "var(--bg-header)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px"
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>
            {draftToEdit ? "Entwurf bearbeiten" : replyToMessage ? "Antworten / Weiterleiten" : "Neue Nachricht verfassen"}
          </span>

          <button 
            className="v-Button v-Button--subtle v-Button--iconOnly" 
            onClick={onClose}
            title="Schließen"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: "16px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
            
            {/* Custom From Address Picker (Wildcard / Fastmail Feature) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                  Absender (From):
                </label>

                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "11px", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => setIsCustomFrom(!isCustomFrom)}
                >
                  {isCustomFrom ? "Gespeicherte Identität wählen" : "+ Freie Absenderadresse eingeben (*@domain.cc)"}
                </button>
              </div>

              {isCustomFrom ? (
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    className="v-TextInput-input"
                    value={fromAddress}
                    onChange={(e) => setFromAddress(e.target.value)}
                    placeholder="beliebige-adresse@deinedomain.cc"
                  />
                  <div style={{ fontSize: "11px", color: "var(--label-teal-text)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <HelpCircle size={13} />
                    Custom From aktiv: Du kannst jeden Namen vor dem @ eingeben.
                  </div>
                </div>
              ) : (
                <select
                  className="v-TextInput-input"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  {settings.identities.map(id => (
                    <option key={id.id} value={id.email}>
                      {id.name} &lt;{id.email}&gt; {id.isDefault ? "(Standard)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* To Input */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
              <span style={{ width: "60px", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>An (To):</span>
              <input
                type="email"
                required
                className="v-TextInput-input"
                style={{ flex: 1, border: "none", background: "transparent" }}
                placeholder="empfaenger@beispiel.de"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
              />
              {!showCc && (
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "var(--text-subtle)", fontSize: "12px", cursor: "pointer" }}
                  onClick={() => setShowCc(true)}
                >
                  Cc
                </button>
              )}
            </div>

            {/* CC Input */}
            {showCc && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                <span style={{ width: "60px", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>Cc:</span>
                <input
                  type="text"
                  className="v-TextInput-input"
                  style={{ flex: 1, border: "none", background: "transparent" }}
                  placeholder="kopie@beispiel.de"
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                />
              </div>
            )}

            {/* Subject Input */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
              <span style={{ width: "60px", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>Betreff:</span>
              <input
                type="text"
                required
                className="v-TextInput-input"
                style={{ flex: 1, border: "none", background: "transparent" }}
                placeholder="Betreffzeile"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Body */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <textarea
                style={{
                  width: "100%",
                  flex: 1,
                  minHeight: "220px",
                  border: "none",
                  outline: "none",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  color: "var(--text-main)",
                  background: "transparent",
                  resize: "none",
                  padding: "8px 0"
                }}
                placeholder="E-Mail verfassen..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div 
            style={{
              padding: "12px 16px",
              backgroundColor: "var(--bg-header)",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button type="submit" className="v-Button v-Button--cta" style={{ height: "34px", padding: "0 16px" }}>
                <Send size={15} />
                <span>Senden</span>
              </button>

              <button 
                type="button" 
                className="v-Button v-Button--subtle" 
                onClick={handleSaveDraftClick}
                title="Als Entwurf speichern"
              >
                <Save size={16} />
                <span>Als Entwurf speichern</span>
              </button>

              <button type="button" className="v-Button v-Button--subtle" title="Anhänge hinzufügen">
                <Paperclip size={16} />
                <span>Anhang</span>
              </button>

              <button type="button" className="v-Button v-Button--subtle" title="Später senden">
                <Clock size={16} />
              </button>
            </div>

            <button type="button" className="v-Button v-Button--subtle v-Button--iconOnly" onClick={onClose} title="Verwerfen">
              <Trash2 size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
