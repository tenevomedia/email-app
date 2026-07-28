import { EmailMessage, Folder } from "./mockData";

export const LABEL_COLOR_PRESETS = [
  { colorText: "var(--label-yellow-text)", colorBg: "var(--label-yellow-bg)" },
  { colorText: "var(--label-red-text)", colorBg: "var(--label-red-bg)" },
  { colorText: "var(--label-green-text)", colorBg: "var(--label-green-bg)" },
  { colorText: "var(--label-blue-text)", colorBg: "var(--label-blue-bg)" },
  { colorText: "var(--label-pink-text)", colorBg: "var(--label-pink-bg)" },
  { colorText: "var(--label-purple-text)", colorBg: "var(--label-purple-bg)" },
  { colorText: "var(--label-gray-text)", colorBg: "var(--label-gray-bg)" },
  { colorText: "var(--label-teal-text)", colorBg: "var(--label-teal-bg)" },
] as const;

const SYSTEM_FOLDER_BADGES = new Set(['Papierkorb', 'Gesendet', 'Entwurf', 'Archiv', 'Spam']);

export function flattenLabels(labels: Folder[]): Folder[] {
  const result: Folder[] = [];
  for (const label of labels) {
    result.push(label);
    if (label.children?.length) {
      result.push(...flattenLabels(label.children));
    }
  }
  return result;
}

export function findLabelById(labels: Folder[], id: string): Folder | null {
  for (const label of labels) {
    if (label.id === id) return label;
    if (label.children?.length) {
      const found = findLabelById(label.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function getLabelPath(labels: Folder[], id: string, parents: string[] = []): string | null {
  for (const label of labels) {
    const path = [...parents, label.name];
    if (label.id === id) return path.join("/");
    if (label.children?.length) {
      const found = getLabelPath(label.children, id, path);
      if (found) return found;
    }
  }
  return null;
}

export function getLabelDescendantIds(label: Folder): string[] {
  const ids = [label.id];
  for (const child of label.children || []) {
    ids.push(...getLabelDescendantIds(child));
  }
  return ids;
}

export function isLabelId(labels: Folder[], id: string): boolean {
  return findLabelById(labels, id) !== null;
}

export function emailMatchesFolder(email: EmailMessage, folderId: string): boolean {
  switch (folderId) {
    case 'inbox':
      return !email.badge || !SYSTEM_FOLDER_BADGES.has(email.badge.text);
    case 'drafts':
      return email.badge?.text === 'Entwurf';
    case 'sent':
      return email.badge?.text === 'Gesendet';
    case 'trash':
      return email.badge?.text === 'Papierkorb';
    case 'archive':
      return email.badge?.text === 'Archiv';
    case 'spam':
      return email.badge?.text === 'Spam';
    case 'scheduled':
      return false;
    default:
      return false;
  }
}

/** Label-Zähler = Anzahl Mails, die beim Klick auf das Label sichtbar wären (inkl. Unterlabels) */
export function withUpdatedLabelCounts(labels: Folder[], emails: EmailMessage[]): Folder[] {
  const mapLabel = (label: Folder): Folder => {
    const matchingIds = new Set(getLabelDescendantIds(label));
    const count = emails.filter(e => (e.tagIds || []).some(id => matchingIds.has(id))).length;
    return {
      ...label,
      count,
      children: label.children?.map(mapLabel),
    };
  };

  return labels.map(mapLabel);
}

/** Ordner-Zähler live aus den vorhandenen E-Mails */
export function withUpdatedFolderCounts(folders: Folder[], emails: EmailMessage[]): Folder[] {
  const mapFolder = (folder: Folder): Folder => {
    const matching = emails.filter(e => emailMatchesFolder(e, folder.id));
    return {
      ...folder,
      count: matching.length,
      unreadCount: matching.filter(e => !e.isRead).length,
      children: folder.children?.map(mapFolder),
    };
  };

  return folders.map(mapFolder);
}
