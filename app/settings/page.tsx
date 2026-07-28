"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useEmail } from "@/lib/emailContext";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Server, 
  Palette, 
  Shield, 
  Plus, 
  Trash2, 
  Check, 
  HelpCircle,
  Key,
  Globe
} from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings, addIdentity, deleteIdentity, addAccount, showToast } = useEmail();
  const [activeTab, setActiveTab] = useState<'identities' | 'accounts' | 'profile' | 'appearance'>('identities');

  // Form states for new Identity
  const [newIdName, setNewIdName] = useState("");
  const [newIdEmail, setNewIdEmail] = useState("");
  const [newIdSig, setNewIdSig] = useState("");

  // Form states for new Account
  const [accName, setAccName] = useState("");
  const [accEmail, setAccEmail] = useState("");
  const [accProvider, setAccProvider] = useState<'fastmail' | 'gmail' | 'outlook' | 'custom'>('fastmail');

  const handleAddIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdEmail.trim()) return;
    addIdentity({
      name: newIdName || newIdEmail.split('@')[0],
      email: newIdEmail,
      signature: newIdSig,
      isDefault: false
    });
    setNewIdName("");
    setNewIdEmail("");
    setNewIdSig("");
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accEmail.trim()) return;
    addAccount({
      name: accName || accEmail,
      email: accEmail,
      provider: accProvider,
      imapHost: accProvider === 'fastmail' ? 'imap.fastmail.com' : 'imap.custom.de',
      imapPort: 993,
      smtpHost: accProvider === 'fastmail' ? 'smtp.fastmail.com' : 'smtp.custom.de',
      smtpPort: 465,
      authType: 'token',
      isConnected: true
    });
    setAccName("");
    setAccEmail("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "var(--bg-app)", color: "var(--text-main)" }}>
      {/* Header Bar */}
      <header 
        style={{ 
          height: "var(--header-height)", 
          backgroundColor: "var(--bg-header)", 
          borderBottom: "1px solid var(--border-subtle)", 
          display: "flex", 
          alignItems: "center", 
          padding: "0 16px", 
          gap: "16px" 
        }}
      >
        <Link href="/" className="v-Button v-Button--subtle" style={{ gap: "6px" }}>
          <ArrowLeft size={16} />
          <span>Zurück zur Inbox</span>
        </Link>

        <h1 style={{ fontSize: "16px", fontWeight: 700 }}>Einstellungen & Optionen</h1>
      </header>

      {/* Main Content Layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Navigation Sidebar */}
        <div 
          style={{ 
            width: "220px", 
            backgroundColor: "var(--bg-sidebar)", 
            borderRight: "1px solid var(--border-subtle)", 
            padding: "16px 10px", 
            display: "flex", 
            flexDirection: "column", 
            gap: "4px" 
          }}
        >
          <button
            onClick={() => setActiveTab('identities')}
            className={`v-Button ${activeTab === 'identities' ? 'v-Button--cta' : 'v-Button--subtle'}`}
            style={{ width: "100%", justifyContent: "flex-start", gap: "10px", height: "36px" }}
          >
            <Mail size={16} />
            <span>Absender-Identitäten</span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`v-Button ${activeTab === 'accounts' ? 'v-Button--cta' : 'v-Button--subtle'}`}
            style={{ width: "100%", justifyContent: "flex-start", gap: "10px", height: "36px" }}
          >
            <Server size={16} />
            <span>Verbundene Konten</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`v-Button ${activeTab === 'profile' ? 'v-Button--cta' : 'v-Button--subtle'}`}
            style={{ width: "100%", justifyContent: "flex-start", gap: "10px", height: "36px" }}
          >
            <User size={16} />
            <span>Profil & Signatur</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`v-Button ${activeTab === 'appearance' ? 'v-Button--cta' : 'v-Button--subtle'}`}
            style={{ width: "100%", justifyContent: "flex-start", gap: "10px", height: "36px" }}
          >
            <Palette size={16} />
            <span>Erscheinungsbild</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "30px 40px", maxWidth: "860px" }}>
          
          {/* TAB 1: IDENTITIES / CUSTOM FROM */}
          {activeTab === 'identities' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>Custom From Adressen & Identitäten</h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Hier kannst du beliebige Absenderadressen (Wildcard `*@deinedomain.cc`) verwalten.
                  In Kombination mit Fastmail oder Amazon SES kannst du mit jedem Präfix E-Mails versenden.
                </p>
              </div>

              {/* List of Identities */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {settings.identities.map((id) => (
                  <div 
                    key={id.id}
                    style={{ 
                      backgroundColor: "var(--bg-card)", 
                      border: "1px solid var(--border-subtle)", 
                      borderRadius: "var(--radius-md)", 
                      padding: "14px 18px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between" 
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "14px" }}>{id.name}</strong>
                        <span className="u-badge" style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}>
                          {id.email}
                        </span>
                        {id.isDefault && (
                          <span className="u-badge" style={{ backgroundColor: "var(--label-blue-bg)", color: "var(--label-blue-text)" }}>
                            Standard
                          </span>
                        )}
                      </div>
                      {id.signature && (
                        <div style={{ fontSize: "12px", color: "var(--text-subtle)", marginTop: "4px", whiteSpace: "pre-line" }}>
                          Signatur: {id.signature.substring(0, 60)}...
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {!id.isDefault && (
                        <button 
                          className="v-Button v-Button--subtle" 
                          style={{ fontSize: "11px" }}
                          onClick={() => {
                            const updated = settings.identities.map(i => ({ ...i, isDefault: i.id === id.id }));
                            updateSettings({ identities: updated });
                          }}
                        >
                          Als Standard setzen
                        </button>
                      )}
                      {settings.identities.length > 1 && (
                        <button 
                          className="v-Button v-Button--subtle v-Button--iconOnly" 
                          onClick={() => deleteIdentity(id.id)}
                          title="Löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Identity Form */}
              <form 
                onSubmit={handleAddIdentitySubmit}
                style={{ 
                  backgroundColor: "var(--bg-card)", 
                  border: "1px solid var(--border-medium)", 
                  borderRadius: "var(--radius-md)", 
                  padding: "20px", 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "14px" 
                }}
              >
                <h3 style={{ fontSize: "15px", fontWeight: 700 }}>+ Neue Custom Absenderadresse hinzufügen</h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      Absendername (z. B. Support / Kundenservice)
                    </label>
                    <input
                      type="text"
                      className="v-TextInput-input"
                      placeholder="z. B. Shop Support"
                      value={newIdName}
                      onChange={(e) => setNewIdName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      Absender E-Mail (z. B. shop-123@deinedomain.cc)
                    </label>
                    <input
                      type="email"
                      required
                      className="v-TextInput-input"
                      placeholder="irgendwas@deinedomain.cc"
                      value={newIdEmail}
                      onChange={(e) => setNewIdEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Standard-Signatur für diese Adresse
                  </label>
                  <textarea
                    style={{ width: "100%", height: "60px", padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "13px", background: "var(--bg-hover)" }}
                    placeholder="E-Mail Signatur hier eingeben..."
                    value={newIdSig}
                    onChange={(e) => setNewIdSig(e.target.value)}
                  />
                </div>

                <button type="submit" className="v-Button v-Button--cta" style={{ width: "max-content" }}>
                  <Plus size={16} />
                  <span>Absender-Adresse Speichern</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ACCOUNTS */}
          {activeTab === 'accounts' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>Verbundene E-Mail-Konten</h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Verwalte deine IMAP/SMTP, Fastmail JMAP oder Cloud Email API Verbindungen.
                </p>
              </div>

              {/* Connected Accounts */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {settings.accounts.map((acc) => (
                  <div 
                    key={acc.id}
                    style={{ 
                      backgroundColor: "var(--bg-card)", 
                      border: "1px solid var(--border-subtle)", 
                      borderRadius: "var(--radius-md)", 
                      padding: "16px 20px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between" 
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <strong style={{ fontSize: "15px" }}>{acc.name}</strong>
                        <span className="u-badge" style={{ backgroundColor: "var(--label-blue-bg)", color: "var(--label-blue-text)" }}>
                          {acc.provider.toUpperCase()}
                        </span>
                        <span style={{ fontSize: "12px", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Check size={14} /> Verbunden
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                        {acc.email} · IMAP: {acc.imapHost}:{acc.imapPort} · SMTP: {acc.smtpHost}:{acc.smtpPort}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Account Form */}
              <form 
                onSubmit={handleAddAccountSubmit}
                style={{ 
                  backgroundColor: "var(--bg-card)", 
                  border: "1px solid var(--border-medium)", 
                  borderRadius: "var(--radius-md)", 
                  padding: "20px", 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "14px" 
                }}
              >
                <h3 style={{ fontSize: "15px", fontWeight: 700 }}>+ Neues E-Mail-Konto verbinden</h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      Konto-Name
                    </label>
                    <input
                      type="text"
                      className="v-TextInput-input"
                      placeholder="z. B. Fastmail Privat"
                      value={accName}
                      onChange={(e) => setAccName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      E-Mail-Adresse
                    </label>
                    <input
                      type="email"
                      required
                      className="v-TextInput-input"
                      placeholder="user@fastmail.com"
                      value={accEmail}
                      onChange={(e) => setAccEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      Provider Typ
                    </label>
                    <select
                      className="v-TextInput-input"
                      value={accProvider}
                      onChange={(e) => setAccProvider(e.target.value as any)}
                    >
                      <option value="fastmail">Fastmail (JMAP / SMTP)</option>
                      <option value="gmail">Google Workspace / Gmail</option>
                      <option value="outlook">Microsoft Outlook 365</option>
                      <option value="custom">Eigener IMAP/SMTP Server</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="v-Button v-Button--cta" style={{ width: "max-content" }}>
                  <Plus size={16} />
                  <span>Konto verbinden</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === 'profile' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>Benutzerprofil & Einstellungen</h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Persönliche Angaben und Standard-Signatur.
                </p>
              </div>

              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Standard Signatur (HTML / Text)
                  </label>
                  <textarea
                    style={{ width: "100%", height: "100px", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "13px", background: "var(--bg-hover)", color: "var(--text-main)" }}
                    value={settings.defaultSignature}
                    onChange={(e) => updateSettings({ defaultSignature: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Undo Send Verzögerung (Sekunden)
                  </label>
                  <select
                    className="v-TextInput-input"
                    style={{ width: "200px" }}
                    value={settings.sendDelaySeconds}
                    onChange={(e) => updateSettings({ sendDelaySeconds: Number(e.target.value) })}
                  >
                    <option value={5}>5 Sekunden</option>
                    <option value={10}>10 Sekunden</option>
                    <option value={15}>15 Sekunden (Standard)</option>
                    <option value={30}>30 Sekunden</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>Erscheinungsbild</h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Farbschema und Dichte der E-Mail-Liste anpassen.
                </p>
              </div>

              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                    Theme wählen
                  </label>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      className={`v-Button ${settings.theme === 'light' ? 'v-Button--cta' : 'v-Button--subtle'}`}
                      onClick={() => updateSettings({ theme: 'light' })}
                    >
                      ☀️ Light Mode
                    </button>

                    <button
                      className={`v-Button ${settings.theme === 'dark' ? 'v-Button--cta' : 'v-Button--subtle'}`}
                      onClick={() => updateSettings({ theme: 'dark' })}
                    >
                      🌙 Dark Mode
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
