"use client";

import React, { useState } from "react";
import { Folder } from "@/lib/mockData";
import { useEmail } from "@/lib/emailContext";
import { 
  SquarePen, 
  Inbox, 
  FileText, 
  Clock, 
  Send, 
  ShieldAlert, 
  Trash2, 
  Archive, 
  Tag, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Search,
  X
} from "lucide-react";

interface SidebarProps {
  folders: Folder[];
  labels: Folder[];
  activeFolderId: string;
  onSelectFolder: (id: string) => void;
  onOpenCompose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  labels,
  activeFolderId,
  onSelectFolder,
  onOpenCompose,
}) => {
  const { createLabel, deleteLabel } = useEmail();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    drafts: true,
    private: true,
    other: true,
  });
  const [labelSearch, setLabelSearch] = useState("");
  const [showLabelSearch, setShowLabelSearch] = useState(false);
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getFolderIcon = (type: Folder['type']) => {
    switch (type) {
      case 'inbox': return <Inbox size={16} />;
      case 'drafts': return <FileText size={16} />;
      case 'scheduled': return <Clock size={16} />;
      case 'sent': return <Send size={16} />;
      case 'junk': return <ShieldAlert size={16} />;
      case 'trash': return <Trash2 size={16} />;
      case 'archive': return <Archive size={16} />;
      default:
        return <Tag size={16} />;
    }
  };

  const matchesSearch = (item: Folder): boolean => {
    if (!labelSearch.trim()) return true;
    const q = labelSearch.toLowerCase();
    if (item.name.toLowerCase().includes(q)) return true;
    return (item.children || []).some(matchesSearch);
  };

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) return;
    createLabel(newLabelName);
    setNewLabelName("");
    setIsCreatingLabel(false);
  };

  const renderFolderItem = (item: Folder, isLabel = false) => {
    if (isLabel && !matchesSearch(item)) return null;

    const isSelected = activeFolderId === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedFolders[item.id] || Boolean(labelSearch.trim());
    const depthPadding = (item.depth || 0) * 16 + 12;

    return (
      <React.Fragment key={item.id}>
        <div
          onClick={() => onSelectFolder(item.id)}
          style={{
            height: "var(--folder-item-height)",
            display: "flex",
            alignItems: "center",
            paddingLeft: `${depthPadding}px`,
            paddingRight: "10px",
            fontSize: "var(--font-size-sm)",
            fontWeight: isSelected ? 700 : 400,
            color: isSelected ? "var(--accent-primary)" : "var(--text-main)",
            backgroundColor: isSelected ? "var(--bg-selected)" : "transparent",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            position: "relative",
            userSelect: "none",
            gap: "8px"
          }}
          className="v-MailboxSource"
        >
          <span style={{ color: item.colorText || "inherit", display: "flex", alignItems: "center" }}>
            {getFolderIcon(item.type)}
          </span>

          <span style={{ flex: 1 }} className="u-truncate">{item.name}</span>

          {item.count !== undefined && item.count > 0 && (
            <span style={{ 
              fontSize: "11px", 
              color: isSelected ? "var(--accent-primary)" : "var(--text-muted)",
              fontWeight: item.unreadCount ? 700 : 400 
            }}>
              {item.count}
            </span>
          )}

          {isLabel && !hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Label „${item.name}“ wirklich löschen?`)) {
                  deleteLabel(item.id);
                }
              }}
              title="Label löschen"
              style={{
                background: "none",
                border: "none",
                color: "var(--text-subtle)",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
                opacity: 0.5,
              }}
              className="v-LabelDelete"
            >
              <X size={12} />
            </button>
          )}

          {hasChildren && (
            <button
              onClick={(e) => toggleExpand(item.id, e)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-subtle)",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center"
              }}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="v-FolderChildren">
            {item.children!.map(child => renderFolderItem(child, isLabel))}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <aside className="v-Split--sidebar">
      <div style={{ padding: "10px" }}>
        <button
          className="v-Button v-Button--cta"
          style={{ width: "100%", justifyContent: "space-between", height: "36px" }}
          onClick={onOpenCompose}
          title="Tastenkürzel: c"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <SquarePen size={16} />
            <span>Verfassen</span>
          </div>
          <ChevronDown size={14} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 6px" }}>
        <div style={{ marginBottom: "12px" }}>
          {folders.map(folder => renderFolderItem(folder))}
        </div>

        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 6px 8px" }}>
            <h2 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-subtle)", textTransform: "uppercase" }}>
              Labels
            </h2>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                className="v-Button v-Button--subtle v-Button--iconOnly"
                style={{ padding: "2px" }}
                title="Labels suchen"
                onClick={() => {
                  setShowLabelSearch(v => !v);
                  if (showLabelSearch) setLabelSearch("");
                }}
              >
                <Search size={14} />
              </button>
              <button
                className="v-Button v-Button--subtle v-Button--iconOnly"
                style={{ padding: "2px" }}
                title="Label erstellen"
                onClick={() => setIsCreatingLabel(true)}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {showLabelSearch && (
            <div style={{ padding: "0 6px 8px" }}>
              <input
                autoFocus
                value={labelSearch}
                onChange={(e) => setLabelSearch(e.target.value)}
                placeholder="Label suchen…"
                style={{
                  width: "100%",
                  height: "28px",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0 8px",
                  fontSize: "12px",
                  background: "var(--bg-card)",
                  color: "var(--text-main)",
                }}
              />
            </div>
          )}

          {isCreatingLabel && (
            <div style={{ padding: "0 6px 8px", display: "flex", gap: "4px" }}>
              <input
                autoFocus
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateLabel();
                  if (e.key === "Escape") {
                    setIsCreatingLabel(false);
                    setNewLabelName("");
                  }
                }}
                placeholder="Neues Label…"
                style={{
                  flex: 1,
                  height: "28px",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0 8px",
                  fontSize: "12px",
                  background: "var(--bg-card)",
                  color: "var(--text-main)",
                }}
              />
              <button className="v-Button v-Button--cta" style={{ height: "28px", padding: "0 8px", fontSize: "11px" }} onClick={handleCreateLabel}>
                OK
              </button>
            </div>
          )}

          <div>
            {labels.map(label => renderFolderItem(label, true))}
          </div>
        </div>
      </div>

      <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-muted)" }}>
        <div style={{ height: "4px", backgroundColor: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden", marginBottom: "6px" }}>
          <div style={{ width: "7%", height: "100%", backgroundColor: "var(--accent-primary)" }}></div>
        </div>
        <div>
          <strong style={{ color: "var(--text-main)" }}>7%</strong> von 50 GB verwendet
        </div>
      </div>
    </aside>
  );
};
