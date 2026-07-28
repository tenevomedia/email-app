"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useEmail } from "@/lib/emailContext";
import { 
  ArrowLeft, 
  Search, 
  Settings as SettingsIcon, 
  HelpCircle, 
  ChevronDown, 
  CreditCard, 
  Users, 
  Globe, 
  Palette, 
  Sliders, 
  Bell, 
  Hand, 
  WifiOff, 
  ShieldCheck, 
  ArrowLeftRight, 
  RotateCcw, 
  Mail, 
  Tag, 
  Filter, 
  Sun, 
  Moon, 
  Check, 
  Plus, 
  Trash2,
  Server
} from "lucide-react";

export default function FastmailSettingsPage() {
  const { settings, updateSettings, addIdentity, deleteIdentity, addAccount } = useEmail();
  const [activeSection, setActiveSection] = useState<string>("theme");
  const [settingsSearch, setSettingsSearch] = useState("");

  // Form states for adding Custom From / Identities
  const [newIdName, setNewIdName] = useState("");
  const [newIdEmail, setNewIdEmail] = useState("");
  const [newIdSig, setNewIdSig] = useState("");

  // Form states for Accounts
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
    <div className="app-root" style={{ background: "var(--bg-app)" }}>
      {/* TopBar Header (Fastmail Settings Header) */}
      <header className="v-PageHeader">
        <div style={{ width: "170px", display: "flex", alignItems: "center", gap: "8px" }}>
          <button className="v-Button v-Button--subtle" style={{ gap: "6px", fontWeight: 700, fontSize: "15px" }}>
            {/* Fastmail Logo */}
            <svg viewBox="0 0 1024 1024" width="22" height="22" role="presentation">
              <path d="M512.61 512.61 274.88 349.17v326.89l148.58-44.58 89.15-118.87Z" fill="#ffc107" />
              <path d="M274.88 676.06h445.75a29.72 29.72 0 0 0 29.72-29.72V349.17L274.88 676.06Z" fill="currentColor" />
              <path d="M840.48 287.2a395.95 395.95 0 0 1 70.13 225.41c0 219.8-178.2 398-398 398-136.08 0-256.1-68.4-327.86-172.59l-91.8 63.12c91.86 133.36 245.47 220.9 419.66 220.9 281.35 0 509.44-228.08 509.44-509.43a506.82 506.82 0 0 0-89.77-288.52l-91.8 63.12Z" fill="#69b3e7" />
              <path d="M114.62 512.61c0-219.8 178.19-398 398-398 136.08 0 256.09 68.4 327.86 172.6l91.8-63.12C840.41 90.73 686.8 3.2 512.61 3.2 231.26 3.18 3.18 231.25 3.18 512.6a506.82 506.82 0 0 0 89.76 288.53l91.8-63.12a395.95 395.95 0 0 1-70.12-225.4Z" fill="#0067b9" />
            </svg>
            <span>Einstellungen</span>
            <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {/* Search Bar in Settings */}
        <div style={{ flex: 1, maxWidth: "420px", position: "relative" }}>
          <div style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
            <Search size={15} />
          </div>
          <input
            type="text"
            className="v-TextInput-input"
            style={{ paddingLeft: "32px" }}
            placeholder="Einstellungen durchsuchen"
            value={settingsSearch}
            onChange={(e) => setSettingsSearch(e.target.value)}
          />
        </div>

        {/* Right Header Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
          <button className="v-Button v-Button--subtle v-Button--iconOnly" title="Einstellungen">
            <SettingsIcon size={18} />
          </button>
          <button className="v-Button v-Button--subtle" title="Hilfe">
            <HelpCircle size={18} />
            <ChevronDown size={14} />
          </button>
          <div className="v-Avatar" style={{ backgroundColor: "#0067b9" }}>AO</div>
        </div>
      </header>

      {/* Main 2-Column Settings Layout */}
      <main className="v-Page-main">
        {/* Left Settings Sidebar (Width 170px - matching HTML) */}
        <aside className="v-Split--sidebar" style={{ width: "185px", borderRight: "1px solid var(--border-subtle)", overflowY: "auto", padding: "10px 6px" }}>
          
          {/* Back to Email link */}
          <div style={{ marginBottom: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
            <Link 
              href="/" 
              className="v-Button v-Button--subtle" 
              style={{ width: "100%", justifyContent: "flex-start", gap: "8px", color: "var(--accent-primary)", fontWeight: 600, fontSize: "13px" }}
            >
              <ArrowLeft size={16} />
              <span>Zurück zu E-Mail</span>
            </Link>
          </div>

          {/* Group: Admin */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ padding: "4px 8px", fontSize: "11px", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
              Admin
            </div>
            <button className="v-Button v-Button--subtle" style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}>
              <CreditCard size={15} />
              <span>Abrechnung & Plan</span>
            </button>
            <button className="v-Button v-Button--subtle" style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}>
              <Users size={15} />
              <span>Benutzer & Teilen</span>
            </button>
            <button className="v-Button v-Button--subtle" style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}>
              <Globe size={15} />
              <span>Domains</span>
            </button>
          </div>

          {/* Group: Einstellungen */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ padding: "4px 8px", fontSize: "11px", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
              Einstellungen
            </div>
            <button 
              onClick={() => setActiveSection("theme")}
              className={`v-Button ${activeSection === "theme" ? "v-Button--cta" : "v-Button--subtle"}`} 
              style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}
            >
              <Palette size={15} />
              <span>Anzeigeeinstellungen</span>
            </button>
            <button 
              onClick={() => setActiveSection("email-prefs")}
              className={`v-Button ${activeSection === "email-prefs" ? "v-Button--cta" : "v-Button--subtle"}`} 
              style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}
            >
              <Sliders size={15} />
              <span>E-Mail-Einstellungen</span>
            </button>
            <button className="v-Button v-Button--subtle" style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}>
              <Bell size={15} />
              <span>Benachrichtigungen</span>
            </button>
            <button className="v-Button v-Button--subtle" style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}>
              <Hand size={15} />
              <span>Eigene Wischgesten</span>
            </button>
            <button className="v-Button v-Button--subtle" style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}>
              <WifiOff size={15} />
              <span>Offline</span>
            </button>
          </div>

          {/* Group: Konto */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ padding: "4px 8px", fontSize: "11px", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
              Konto
            </div>
            <button className="v-Button v-Button--subtle" style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}>
              <ShieldCheck size={15} />
              <span>Privatsphäre & Sicherheit</span>
            </button>
            <button className="v-Button v-Button--subtle" style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}>
              <ArrowLeftRight size={15} />
              <span>Migration</span>
            </button>
            <button className="v-Button v-Button--subtle" style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}>
              <RotateCcw size={15} />
              <span>Daten wiederherstellen</span>
            </button>
          </div>

          {/* Group: Einrichtung */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ padding: "4px 8px", fontSize: "11px", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
              Einrichtung
            </div>
            <button 
              onClick={() => setActiveSection("addresses")}
              className={`v-Button ${activeSection === "addresses" ? "v-Button--cta" : "v-Button--subtle"}`} 
              style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}
            >
              <Mail size={15} />
              <span>Meine E-Mail-Adressen</span>
            </button>
            <button 
              onClick={() => setActiveSection("accounts")}
              className={`v-Button ${activeSection === "accounts" ? "v-Button--cta" : "v-Button--subtle"}`} 
              style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}
            >
              <Server size={15} />
              <span>Verbundene Konten</span>
            </button>
            <button className="v-Button v-Button--subtle" style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}>
              <Tag size={15} />
              <span>Labels</span>
            </button>
            <button className="v-Button v-Button--subtle" style={{ width: "100%", justifyContent: "flex-start", gap: "8px", fontSize: "13px" }}>
              <Filter size={15} />
              <span>Filter & Regeln</span>
            </button>
          </div>
        </aside>

        {/* Right Settings Content Pane */}
        <section className="v-Split--readingpane" style={{ flex: 1, overflowY: "auto", padding: "24px 36px", backgroundColor: "var(--bg-reading-pane)" }}>
          
          {/* SECTION: ANZEIGEEINSTELLUNGEN & THEMA */}
          {activeSection === "theme" && (
            <div style={{ maxWidth: "780px", display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Region */}
              <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "24px" }}>
                <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>Region</h1>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Sprache</label>
                    <select className="v-TextInput-input" defaultValue="Deutsch">
                      <option>Deutsch</option>
                      <option>English (United Kingdom)</option>
                      <option>English (United States)</option>
                      <option>Español</option>
                      <option>Français</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Woche beginnt am</label>
                    <select className="v-TextInput-input" defaultValue="Montag">
                      <option>Montag</option>
                      <option>Samstag</option>
                      <option>Sonntag</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Zeitformat</label>
                    <select className="v-TextInput-input" defaultValue="13:00">
                      <option>13:00 (24 Std.)</option>
                      <option>1:00 PM (12 Std.)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Thema & Darstellung */}
              <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "24px" }}>
                <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>Thema</h1>
                
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "10px" }}>Darstellung</label>
                  <div style={{ display: "flex", gap: "16px" }}>
                    {/* Light Theme Card */}
                    <div 
                      onClick={() => updateSettings({ theme: "light" })}
                      style={{ 
                        border: settings.theme === "light" ? "2px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "16px",
                        backgroundColor: "#ffffff",
                        cursor: "pointer",
                        width: "180px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px"
                      }}
                    >
                      <Sun size={24} style={{ color: "#e8ae0c" }} />
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#111" }}>Hell</span>
                    </div>

                    {/* Dark Theme Card */}
                    <div 
                      onClick={() => updateSettings({ theme: "dark" })}
                      style={{ 
                        border: settings.theme === "dark" ? "2px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "16px",
                        backgroundColor: "#1e1e1e",
                        cursor: "pointer",
                        width: "180px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px"
                      }}
                    >
                      <Moon size={24} style={{ color: "#38bdf8" }} />
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>Dunkel</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barrierefreiheit & Schriftgröße */}
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>Barrierefreiheit & Schriftart</h1>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Schriftgröße</label>
                    <select className="v-TextInput-input" defaultValue="Standard">
                      <option>Klein (12px)</option>
                      <option>Standard (14px)</option>
                      <option>Groß (16px)</option>
                      <option>XL (18px)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>UI-Schriftart</label>
                    <select className="v-TextInput-input" defaultValue="Proxima Nova">
                      <option>Proxima Nova (Fastmail Standard)</option>
                      <option>System-Schriftart</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* SECTION: MEINE E-MAIL-ADRESSEN & CUSTOM FROM */}
          {activeSection === "addresses" && (
            <div style={{ maxWidth: "780px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>Meine E-Mail-Adressen & Custom From</h1>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Verwalte deine Hauptadressen und Wildcard-Absender (`*@deinedomain.cc`). 
                  Du kannst jeden beliebigen Namen vor dem @ eingeben.
                </p>
              </div>

              {/* Identity List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {settings.identities.map((id) => (
                  <div 
                    key={id.id}
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
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "15px" }}>{id.name}</strong>
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
                          Signatur: {id.signature}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {!id.isDefault && (
                        <button 
                          className="v-Button v-Button--subtle" 
                          style={{ fontSize: "12px" }}
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

              {/* Add Identity Form */}
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

          {/* SECTION: VERBUNDENE KONTEN */}
          {activeSection === "accounts" && (
            <div style={{ maxWidth: "780px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>Verbundene E-Mail-Konten</h1>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Verwalte deine Fastmail JMAP-, Gmail-, Outlook- und IMAP/SMTP-Verbindungen.
                </p>
              </div>

              {/* Accounts List */}
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
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Konto-Name</label>
                    <input
                      type="text"
                      className="v-TextInput-input"
                      placeholder="z. B. Fastmail Hauptkonto"
                      value={accName}
                      onChange={(e) => setAccName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>E-Mail-Adresse</label>
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
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Provider Typ</label>
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

          {/* SECTION: E-MAIL PREFERENCES */}
          {activeSection === "email-prefs" && (
            <div style={{ maxWidth: "780px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>E-Mail-Einstellungen</h1>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Standard-Verhalten beim Senden, Antworten und Lesen.
                </p>
              </div>

              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Standard-Signatur
                  </label>
                  <textarea
                    style={{ width: "100%", height: "90px", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "13px", background: "var(--bg-hover)", color: "var(--text-main)" }}
                    value={settings.defaultSignature}
                    onChange={(e) => updateSettings({ defaultSignature: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Undo Send (Rückgängig-Verzögerung)
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

        </section>
      </main>
    </div>
  );
}
