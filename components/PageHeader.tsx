"use client";

import React from "react";
import Link from "next/link";
import { 
  PanelLeftClose, 
  PanelLeft, 
  Search, 
  Settings, 
  HelpCircle, 
  ChevronDown 
} from "lucide-react";

interface PageHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentTheme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenCompose: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  currentTheme,
  onToggleTheme,
}) => {
  return (
    <header className="v-PageHeader">
      {/* Brand & App Switcher */}
      <div style={{ width: "185px", display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          className="v-Button v-Button--subtle"
          style={{ padding: "4px 8px", gap: "8px" }}
          title="Hauptmenü öffnen (⇧G)"
        >
          {/* Fastmail-style multicolor SVG logo */}
          <svg viewBox="0 0 1024 1024" width="22" height="22" role="presentation">
            <path d="M512.61 512.61 274.88 349.17v326.89l148.58-44.58 89.15-118.87Z" fill="#ffc107" />
            <path d="M274.88 676.06h445.75a29.72 29.72 0 0 0 29.72-29.72V349.17L274.88 676.06Z" fill="currentColor" />
            <path d="M840.48 287.2a395.95 395.95 0 0 1 70.13 225.41c0 219.8-178.2 398-398 398-136.08 0-256.1-68.4-327.86-172.59l-91.8 63.12c91.86 133.36 245.47 220.9 419.66 220.9 281.35 0 509.44-228.08 509.44-509.43a506.82 506.82 0 0 0-89.77-288.52l-91.8 63.12Z" fill="#69b3e7" />
            <path d="M114.62 512.61c0-219.8 178.19-398 398-398 136.08 0 256.09 68.4 327.86 172.6l91.8-63.12C840.41 90.73 686.8 3.2 512.61 3.2 231.26 3.18 3.18 231.25 3.18 512.6a506.82 506.82 0 0 0 89.76 288.53l91.8-63.12a395.95 395.95 0 0 1-70.12-225.4Z" fill="#0067b9" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: "15px" }}>E-Mail</span>
          <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
        </button>

        <button
          className="v-Button v-Button--subtle v-Button--iconOnly"
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Seitenleiste ausblenden" : "Seitenleiste einblenden"}
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </button>
      </div>

      {/* Global Search Input */}
      <div style={{ flex: 1, maxWidth: "540px", position: "relative" }}>
        <div style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
          <Search size={16} />
        </div>
        <input
          type="text"
          className="v-TextInput-input"
          style={{ paddingLeft: "34px" }}
          placeholder="Mails suchen"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Header Actions (Settings, Help, Account) */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
        <button
          className="v-Button v-Button--subtle"
          onClick={onToggleTheme}
          title="Dark/Light Mode umschalten"
          style={{ fontSize: "12px" }}
        >
          {currentTheme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>

        <Link
          href="/settings"
          className="v-Button v-Button--subtle v-Button--iconOnly"
          title="Einstellungen"
          aria-label="Einstellungen"
        >
          <Settings size={18} />
        </Link>

        <button className="v-Button v-Button--subtle" title="Hilfe">
          <HelpCircle size={18} />
          <ChevronDown size={14} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
          <div className="v-Avatar" style={{ backgroundColor: "#0067b9" }}>
            AO
          </div>
          <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
        </div>
      </div>
    </header>
  );
};
