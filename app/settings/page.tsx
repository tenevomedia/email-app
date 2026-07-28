"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useEmail } from "@/lib/emailContext";
import { flattenLabels, getLabelPath } from "@/lib/labelUtils";
import { Folder } from "@/lib/mockData";
import {
  ArrowLeft, Search, Settings as SettingsIcon, HelpCircle, ChevronDown,
  CreditCard, Users, Globe, Palette, Sliders, Bell, Hand, WifiOff,
  ShieldCheck, ArrowLeftRight, RotateCcw, Calendar, Mail, Tag, Filter,
  Umbrella, Sun, Moon, Check, Plus, Trash2, Server
} from "lucide-react";

type SidebarItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  group: string;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  // Admin
  { id: "plan", label: "Abrechnung & Plan", icon: <CreditCard size={16} />, group: "Admin" },
  { id: "team", label: "Benutzer & Teilen", icon: <Users size={16} />, group: "Admin" },
  { id: "domains", label: "Domains", icon: <Globe size={16} />, group: "Admin" },
  // Einstellungen
  { id: "theme", label: "Anzeigeeinstellungen", icon: <Palette size={16} />, group: "Einstellungen" },
  { id: "preferences", label: "E-Mail-Einstellungen", icon: <Sliders size={16} />, group: "Einstellungen" },
  { id: "notifications", label: "Benachrichtigungen", icon: <Bell size={16} />, group: "Einstellungen" },
  { id: "actions", label: "Eigene Wischgesten", icon: <Hand size={16} />, group: "Einstellungen" },
  { id: "offline", label: "Offline", icon: <WifiOff size={16} />, group: "Einstellungen" },
  // Konto
  { id: "security", label: "Privatsphäre und Sicherheit", icon: <ShieldCheck size={16} />, group: "Konto" },
  { id: "migration", label: "Migration", icon: <ArrowLeftRight size={16} />, group: "Konto" },
  { id: "restore", label: "Daten wiederherstellen", icon: <RotateCcw size={16} />, group: "Konto" },
  // Einrichtung
  { id: "calendar", label: "Kalender", icon: <Calendar size={16} />, group: "Einrichtung" },
  { id: "addresses", label: "Meine E-Mail-Adressen", icon: <Mail size={16} />, group: "Einrichtung" },
  { id: "accounts", label: "Verbundene Konten", icon: <Server size={16} />, group: "Einrichtung" },
  { id: "folders", label: "Labels", icon: <Tag size={16} />, group: "Einrichtung" },
  { id: "filters", label: "Filter & Regeln", icon: <Filter size={16} />, group: "Einrichtung" },
  { id: "vacation", label: "Urlaubsantwort", icon: <Umbrella size={16} />, group: "Einrichtung" },
];

const THEME_SWATCHES = [
  { id: "default", light: ["#d6d8da", "#f4f5f5"], dark: ["#121416", "#24282b"] },
  { id: "warm", light: ["#ffe69b", "#fff2cd"], dark: ["#33290b", "#4c3d11"] },
  { id: "green", light: ["#b8d7ce", "#e5f0d9"], dark: ["#253614", "#2d463f"] },
  { id: "sage", light: ["#b8d7ce", "#dde3f9"], dark: ["#22342f", "#303a5d"] },
  { id: "sky", light: ["#a5d1f0", "#e1effa"], dark: ["#15242e", "#2a485c"] },
  { id: "lavender", light: ["#bbc7f4", "#f2e8f9"], dark: ["#2d133c", "#3c1a51"] },
  { id: "rose", light: ["#ffbdd5", "#ffecf3"], dark: ["#3c2a31", "#664752"] },
  { id: "midnight", light: ["#121416", "#24282b"], dark: ["#121416", "#24282b"] },
  { id: "sunset", light: ["#5b277a", "#ba481e"], dark: ["#3c1a51", "#803c22"] },
  { id: "teal", light: ["#004d3f", "#00897b"], dark: ["#002019", "#00524a"] },
  { id: "forest", light: ["#4e9b85", "#5565a4"], dark: ["#4f7a6e", "#5565a4"] },
  { id: "ocean", light: ["#243959", "#1a77c0"], dark: ["#303a49", "#1f5077"] },
  { id: "violet", light: ["#49578d", "#7934a3"], dark: ["#303a5d", "#5b277a"] },
  { id: "berry", light: ["#5b277a", "#c23a6d"], dark: ["#3c1a51", "#7b3a53"] },
];

export default function FastmailSettingsPage() {
  const {
    settings, updateSettings, addIdentity, deleteIdentity, addAccount,
    labels, createLabel, deleteLabel,
  } = useEmail();
  const [activeSection, setActiveSection] = useState("theme");
  const [settingsSearch, setSettingsSearch] = useState("");
  const [selectedThemeSwatch, setSelectedThemeSwatch] = useState("default");
  const [systemTheme, setSystemTheme] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Identity form
  const [newIdName, setNewIdName] = useState("");
  const [newIdEmail, setNewIdEmail] = useState("");
  const [newIdSig, setNewIdSig] = useState("");

  // Account form
  const [accName, setAccName] = useState("");
  const [accEmail, setAccEmail] = useState("");
  const [accProvider, setAccProvider] = useState<'fastmail' | 'gmail' | 'outlook' | 'custom'>('fastmail');

  // Label form
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelParentId, setNewLabelParentId] = useState("");

  const flatLabels = flattenLabels(labels);

  const handleAddIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdEmail.trim()) return;
    addIdentity({ name: newIdName || newIdEmail.split('@')[0], email: newIdEmail, signature: newIdSig, isDefault: false });
    setNewIdName(""); setNewIdEmail(""); setNewIdSig("");
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accEmail.trim()) return;
    addAccount({
      name: accName || accEmail, email: accEmail, provider: accProvider,
      imapHost: accProvider === 'fastmail' ? 'imap.fastmail.com' : accProvider === 'gmail' ? 'imap.gmail.com' : accProvider === 'outlook' ? 'outlook.office365.com' : 'imap.custom.de',
      imapPort: 993,
      smtpHost: accProvider === 'fastmail' ? 'smtp.fastmail.com' : accProvider === 'gmail' ? 'smtp.gmail.com' : accProvider === 'outlook' ? 'smtp.office365.com' : 'smtp.custom.de',
      smtpPort: 465, authType: 'token', isConnected: true
    });
    setAccName(""); setAccEmail("");
  };

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    createLabel(newLabelName, newLabelParentId || undefined);
    setNewLabelName("");
    setNewLabelParentId("");
  };

  const handleDeleteLabel = (label: Folder) => {
    const path = getLabelPath(labels, label.id) || label.name;
    const hasChildren = Boolean(label.children?.length);
    const msg = hasChildren
      ? `Label „${path}“ und alle Unterlabels wirklich löschen?`
      : `Label „${path}“ wirklich löschen?`;
    if (window.confirm(msg)) {
      deleteLabel(label.id);
    }
  };

  // Scroll to section when sidebar item is clicked
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`s-${id}`);
    if (el && contentRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    // accounts / security etc. from Account-Menü
    const timer = window.setTimeout(() => scrollToSection(hash), 50);
    return () => window.clearTimeout(timer);
  }, []);

  // Build grouped sidebar
  const groups = SIDEBAR_ITEMS.reduce<Record<string, SidebarItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const filteredGroups = settingsSearch.trim()
    ? Object.fromEntries(
        Object.entries(groups).map(([g, items]) => [
          g, items.filter(i => i.label.toLowerCase().includes(settingsSearch.toLowerCase()))
        ]).filter(([, items]) => (items as SidebarItem[]).length > 0)
      )
    : groups;

  return (
    <div className="app-root" style={{ background: "var(--bg-app)" }}>
      {/* === HEADER === */}
      <header className="v-PageHeader">
        <div style={{ width: "170px", display: "flex", alignItems: "center", paddingLeft: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "15px", color: "var(--text-main)" }}>
            <svg viewBox="0 0 1024 1024" width="22" height="22">
              <path d="M512.61 512.61 274.88 349.17v326.89l148.58-44.58 89.15-118.87Z" fill="#ffc107" />
              <path d="M274.88 676.06h445.75a29.72 29.72 0 0 0 29.72-29.72V349.17L274.88 676.06Z" fill="currentColor" />
              <path d="M840.48 287.2a395.95 395.95 0 0 1 70.13 225.41c0 219.8-178.2 398-398 398-136.08 0-256.1-68.4-327.86-172.59l-91.8 63.12c91.86 133.36 245.47 220.9 419.66 220.9 281.35 0 509.44-228.08 509.44-509.43a506.82 506.82 0 0 0-89.77-288.52l-91.8 63.12Z" fill="#69b3e7" />
              <path d="M114.62 512.61c0-219.8 178.19-398 398-398 136.08 0 256.09 68.4 327.86 172.6l91.8-63.12C840.41 90.73 686.8 3.2 512.61 3.2 231.26 3.18 3.18 231.25 3.18 512.6a506.82 506.82 0 0 0 89.76 288.53l91.8-63.12a395.95 395.95 0 0 1-70.12-225.4Z" fill="#0067b9" />
            </svg>
            <span>Einstellungen</span>
            <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
          </div>
        </div>

        <div style={{ flex: "1", maxWidth: "400px", position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            type="text" className="v-TextInput-input" style={{ paddingLeft: "32px" }}
            placeholder="Einstellungen durchsuchen" value={settingsSearch}
            onChange={(e) => setSettingsSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto", flex: "1 0 170px", justifyContent: "flex-end" }}>
          <button className="v-Button v-Button--subtle v-Button--iconOnly" title="Einstellungen"><SettingsIcon size={18} /></button>
          <button className="v-Button v-Button--subtle v-Button--iconOnly" title="Hilfe"><HelpCircle size={18} /></button>
          <div className="v-Avatar" style={{ backgroundColor: "#0067b9", marginLeft: "4px" }}>AO</div>
        </div>
      </header>

      {/* === MAIN === */}
      <main className="v-Page-main settings-layout">
        {/* --- Sidebar 170px --- */}
        <nav className="v-Settings-sidebar">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} />
            Zurück zu E-Mail
          </Link>

          {Object.entries(filteredGroups).map(([groupName, items]) => (
            <div key={groupName} className="v-Sources-group">
              <h2 className="v-Sources-title">{groupName}</h2>
              <ul style={{ listStyle: "none" }}>
                {(items as SidebarItem[]).map((item) => (
                  <li key={item.id}>
                    <button
                      className={`app-source${activeSection === item.id ? ' is-selected' : ''}`}
                      onClick={() => scrollToSection(item.id)}
                    >
                      {item.icon}
                      <span className="u-truncate">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* --- Content Pane --- */}
        <div className="v-SettingsPane" ref={contentRef}>

          {/* ── REGION ── */}
          <div className="v-SettingsPane-section" id="s-theme">
            <div className="v-SettingsPane-row">
              <div className="v-SettingsPane-label">
                <h2>Region</h2>
              </div>
              <div className="v-SettingsPane-controls">
                <div className="v-Select">
                  <label>Sprache</label>
                  <select className="v-Select-input" defaultValue="2">
                    <option value="0">Čeština</option><option value="1">Dansk</option>
                    <option value="2">Deutsch</option><option value="3">English (United Kingdom)</option>
                    <option value="4">English (United States)</option><option value="5">Español</option>
                    <option value="6">Français</option><option value="7">Italiano</option>
                    <option value="8">日本語</option>
                  </select>
                </div>
                <div className="v-Select-row">
                  <div className="v-Select">
                    <label>Woche beginnt am</label>
                    <select className="v-Select-input" defaultValue="0">
                      <option value="0">Montag</option>
                      <option value="1">Samstag</option>
                      <option value="2">Sonntag</option>
                    </select>
                  </div>
                  <div className="v-Select">
                    <label>Zeitformat</label>
                    <select className="v-Select-input" defaultValue="1">
                      <option value="0">1:00 PM</option>
                      <option value="1">13:00</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── THEMA ── */}
          <div className="v-SettingsPane-section" id="s-appearance">
            <div className="v-SettingsPane-row">
              <div className="v-SettingsPane-label">
                <h2>Thema</h2>
              </div>
              <div className="v-SettingsPane-controls">
                {/* Darstellung: Hell / Dunkel */}
                <fieldset className="v-RadioBlocks">
                  <legend>Darstellung</legend>
                  <div className="v-RadioBlocks-options">
                    <div
                      className={`v-RadioBlocks-option${settings.theme === 'light' ? ' is-selected' : ''}`}
                      onClick={() => updateSettings({ theme: 'light' })}
                    >
                      <div className="v-RadioBlocks-block" style={{ background: "linear-gradient(180deg, #f4f5f5 60%, #d6d8da 100%)" }}>
                        <Sun size={28} style={{ color: "#e8ae0c" }} />
                      </div>
                      <div className="v-RadioBlocks-label">
                        <div className="v-RadioBlocks-radio" />
                        <span>Hell</span>
                      </div>
                    </div>
                    <div
                      className={`v-RadioBlocks-option${settings.theme === 'dark' ? ' is-selected' : ''}`}
                      onClick={() => updateSettings({ theme: 'dark' })}
                    >
                      <div className="v-RadioBlocks-block" style={{ background: "linear-gradient(180deg, #1b1e20 60%, #121416 100%)" }}>
                        <Moon size={28} style={{ color: "#69b3e7" }} />
                      </div>
                      <div className="v-RadioBlocks-label">
                        <div className="v-RadioBlocks-radio" />
                        <span>Dunkel</span>
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* System toggle */}
                <div
                  className={`v-Toggle${systemTheme ? ' is-checked' : ''}`}
                  onClick={() => setSystemTheme(!systemTheme)}
                >
                  <div className="v-Toggle-track" />
                  <div className="v-Toggle-text">
                    <span className="label-primary">Dem System entsprechend zwischen hell/dunkel wechseln</span>
                  </div>
                </div>

                {/* Farbe (theme swatches) */}
                <fieldset style={{ border: "none", padding: 0 }}>
                  <legend style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Farbe</legend>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
                    Wählen Sie eines unserer altbewährten Themen.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxWidth: "400px" }}>
                    {THEME_SWATCHES.map((swatch) => (
                      <div
                        key={swatch.id}
                        className={`v-ThemeOption${selectedThemeSwatch === swatch.id ? ' is-selected' : ''}`}
                        onClick={() => setSelectedThemeSwatch(swatch.id)}
                        title={swatch.id}
                      >
                        <div
                          className="v-ThemeOption-color"
                          style={{ background: `linear-gradient(290deg, ${swatch.light[0]} 5%, ${swatch.light[1]} 95%)` }}
                        >
                          light
                        </div>
                        <div
                          className="v-ThemeOption-color"
                          style={{ background: `linear-gradient(290deg, ${swatch.dark[0]} 5%, ${swatch.dark[1]} 95%)` }}
                        >
                          dark
                        </div>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

          {/* ── NAVIGATION ── */}
          <div className="v-SettingsPane-section" id="s-navigation">
            <div className="v-SettingsPane-row">
              <div className="v-SettingsPane-label">
                <h2>Navigation</h2>
              </div>
              <div className="v-SettingsPane-controls">
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Wählen Sie aus, was in der Navigationsleiste links angezeigt werden soll, oder deaktivieren Sie alles, um sie vollständig auszublenden.
                </p>
                {["E-Mail", "Kontakte", "Kalender", "Notizen", "Dateien"].map((label) => (
                  <div key={label} className="v-Toggle" onClick={() => {}}>
                    <div className="v-Toggle-track" />
                    <div className="v-Toggle-text">
                      <span className="label-primary">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── BARRIEREFREIHEIT ── */}
          <div className="v-SettingsPane-section" id="s-accessibility">
            <div className="v-SettingsPane-row">
              <div className="v-SettingsPane-label">
                <h2>Barrierefreiheit</h2>
              </div>
              <div className="v-SettingsPane-controls">
                <div className="v-Select">
                  <label>Schriftgröße</label>
                  <select className="v-Select-input" defaultValue="1">
                    <option value="0">Klein</option>
                    <option value="1">Standard</option>
                    <option value="2">Groß</option>
                    <option value="3">XL</option>
                    <option value="4">XXL</option>
                    <option value="5">XXXL</option>
                  </select>
                </div>

                <fieldset style={{ border: "none", padding: 0 }}>
                  <legend style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>UI-Schriftart</legend>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                      <input type="radio" name="ui-font" defaultChecked style={{ accentColor: "var(--accent-primary)" }} />
                      Proxima Nova
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                      <input type="radio" name="ui-font" style={{ accentColor: "var(--accent-primary)" }} />
                      System-Schriftart
                    </label>
                  </div>
                </fieldset>

                <div className="v-Toggle" onClick={() => {}}>
                  <div className="v-Toggle-track" />
                  <div className="v-Toggle-text">
                    <span className="label-primary">Nichtproportionale Schriftart für einfachen Text verwenden</span>
                  </div>
                </div>

                <div className="v-Toggle" onClick={() => {}}>
                  <div className="v-Toggle-track" />
                  <div className="v-Toggle-text">
                    <span className="label-primary">Trennlinie zwischen Zeilen anzeigen</span>
                  </div>
                </div>

                <div className="v-Toggle is-checked" onClick={() => {}}>
                  <div className="v-Toggle-track" />
                  <div className="v-Toggle-text">
                    <span className="label-primary">Tastaturkürzel aktivieren</span>
                    <span className="label-secondary">
                      <a href="https://www.fastmail.help/hc/en-us/articles/360058753534" target="_blank" rel="noreferrer" style={{ color: "var(--accent-primary)" }}>
                        Sehen Sie alle Tastenkombinationen
                      </a>.
                    </span>
                  </div>
                </div>

                <div className="v-Select">
                  <label>Verzögerung für Ziehen/Halten-Aktivierung</label>
                  <select className="v-Select-input" defaultValue="0">
                    <option value="0">Aus</option>
                    <option value="1">Kurz (250 ms)</option>
                    <option value="2">Mittel (500 ms)</option>
                    <option value="3">Lang (1 s)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── E-MAIL-EINSTELLUNGEN ── */}
          <div className="v-SettingsPane-section" id="s-preferences">
            <div className="v-SettingsPane-row">
              <div className="v-SettingsPane-label">
                <h2>E-Mail-Einstellungen</h2>
              </div>
              <div className="v-SettingsPane-controls">
                <div className="v-Select">
                  <label>Standard-Signatur</label>
                  <textarea
                    className="v-Select-input"
                    style={{ height: "80px", resize: "vertical", padding: "8px 10px" }}
                    value={settings.defaultSignature}
                    onChange={(e) => updateSettings({ defaultSignature: e.target.value })}
                  />
                </div>
                <div className="v-Select">
                  <label>Undo Send (Rückgängig-Verzögerung)</label>
                  <select
                    className="v-Select-input" style={{ maxWidth: "220px" }}
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
          </div>

          {/* ── MEINE E-MAIL-ADRESSEN ── */}
          <div className="v-SettingsPane-section" id="s-addresses">
            <div className="v-SettingsPane-row">
              <div className="v-SettingsPane-label">
                <h2>Meine E-Mail-Adressen</h2>
              </div>
              <div className="v-SettingsPane-controls">
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Verwalte deine Absender-Identitäten und Wildcard-Adressen (*@deinedomain.cc).
                </p>

                {settings.identities.map((id) => (
                  <div key={id.id} className="v-SettingsCard">
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <strong style={{ fontSize: "14px" }}>{id.name}</strong>
                        <span className="u-badge" style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}>{id.email}</span>
                        {id.isDefault && (
                          <span className="u-badge" style={{ background: "var(--label-blue-bg)", color: "var(--label-blue-text)" }}>Standard</span>
                        )}
                      </div>
                      {id.signature && (
                        <div style={{ fontSize: "12px", color: "var(--text-subtle)", marginTop: "4px" }}>Signatur: {id.signature}</div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      {!id.isDefault && (
                        <button className="v-Button v-Button--subtle" style={{ fontSize: "12px" }}
                          onClick={() => {
                            const updated = settings.identities.map(i => ({ ...i, isDefault: i.id === id.id }));
                            updateSettings({ identities: updated });
                          }}>
                          Als Standard
                        </button>
                      )}
                      {settings.identities.length > 1 && (
                        <button className="v-Button v-Button--subtle v-Button--iconOnly" onClick={() => deleteIdentity(id.id)}><Trash2 size={15} /></button>
                      )}
                    </div>
                  </div>
                ))}

                <form className="v-SettingsForm" onSubmit={handleAddIdentity}>
                  <h3>Neue Absenderadresse hinzufügen</h3>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Absendername</label>
                      <input type="text" placeholder="z. B. Shop Support" value={newIdName} onChange={(e) => setNewIdName(e.target.value)} />
                    </div>
                    <div className="form-field">
                      <label>Absender E-Mail</label>
                      <input type="email" required placeholder="name@deinedomain.cc" value={newIdEmail} onChange={(e) => setNewIdEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-field" style={{ marginTop: "12px" }}>
                    <label>Signatur</label>
                    <textarea placeholder="E-Mail Signatur..." value={newIdSig} onChange={(e) => setNewIdSig(e.target.value)} />
                  </div>
                  <button type="submit" className="v-Button v-Button--cta" style={{ marginTop: "14px" }}>
                    <Plus size={15} /> Speichern
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* ── VERBUNDENE KONTEN ── */}
          <div className="v-SettingsPane-section" id="s-accounts">
            <div className="v-SettingsPane-row">
              <div className="v-SettingsPane-label">
                <h2>Verbundene Konten</h2>
              </div>
              <div className="v-SettingsPane-controls">
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Verwalte deine Fastmail JMAP-, Gmail-, Outlook- und IMAP/SMTP-Verbindungen.
                </p>

                {settings.accounts.map((acc) => (
                  <div key={acc.id} className="v-SettingsCard">
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <strong style={{ fontSize: "14px" }}>{acc.name}</strong>
                        <span className="u-badge" style={{ background: "var(--label-blue-bg)", color: "var(--label-blue-text)" }}>{acc.provider.toUpperCase()}</span>
                        <span style={{ fontSize: "12px", color: "#16a34a", display: "flex", alignItems: "center", gap: "3px" }}>
                          <Check size={13} /> Verbunden
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                        {acc.email} · IMAP: {acc.imapHost}:{acc.imapPort} · SMTP: {acc.smtpHost}:{acc.smtpPort}
                      </div>
                    </div>
                  </div>
                ))}

                <form className="v-SettingsForm" onSubmit={handleAddAccount}>
                  <h3>Neues E-Mail-Konto verbinden</h3>
                  <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <div className="form-field">
                      <label>Konto-Name</label>
                      <input type="text" placeholder="z. B. Fastmail" value={accName} onChange={(e) => setAccName(e.target.value)} />
                    </div>
                    <div className="form-field">
                      <label>E-Mail-Adresse</label>
                      <input type="email" required placeholder="user@fastmail.com" value={accEmail} onChange={(e) => setAccEmail(e.target.value)} />
                    </div>
                    <div className="form-field">
                      <label>Provider</label>
                      <select value={accProvider} onChange={(e) => setAccProvider(e.target.value as 'fastmail' | 'gmail' | 'outlook' | 'custom')}>
                        <option value="fastmail">Fastmail (JMAP)</option>
                        <option value="gmail">Gmail / Workspace</option>
                        <option value="outlook">Outlook 365</option>
                        <option value="custom">IMAP/SMTP</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="v-Button v-Button--cta" style={{ marginTop: "14px" }}>
                    <Plus size={15} /> Konto verbinden
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* ── LABELS ── */}
          <div className="v-SettingsPane-section" id="s-folders">
            <div className="v-SettingsPane-row">
              <div className="v-SettingsPane-label">
                <h2>Labels</h2>
              </div>
              <div className="v-SettingsPane-controls">
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Labels erstellen und löschen. In der Sidebar kannst du Labels nur zuweisen und filtern.
                </p>

                {flatLabels.map((label) => {
                  const path = getLabelPath(labels, label.id) || label.name;
                  return (
                    <div key={label.id} className="v-SettingsCard">
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: label.colorText || "var(--accent-primary)",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: "14px" }}>{path}</strong>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                            {(label.count || 0)} E-Mail{(label.count || 0) === 1 ? "" : "s"}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="v-Button v-Button--subtle"
                        title="Label löschen"
                        onClick={() => handleDeleteLabel(label)}
                        style={{ color: "var(--label-red-text)" }}
                      >
                        <Trash2 size={15} />
                        <span>Löschen</span>
                      </button>
                    </div>
                  );
                })}

                <form className="v-SettingsForm" onSubmit={handleAddLabel}>
                  <h3>Neues Label erstellen</h3>
                  <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div className="form-field">
                      <label>Name</label>
                      <input
                        type="text"
                        required
                        placeholder="z. B. Projekte"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Übergeordnetes Label (optional)</label>
                      <select
                        value={newLabelParentId}
                        onChange={(e) => setNewLabelParentId(e.target.value)}
                      >
                        <option value="">Kein Parent (Top-Level)</option>
                        {flatLabels.map((label) => (
                          <option key={label.id} value={label.id}>
                            {getLabelPath(labels, label.id) || label.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="v-Button v-Button--cta" style={{ marginTop: "14px" }}>
                    <Plus size={15} /> Label erstellen
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
