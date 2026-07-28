export interface Folder {
  id: string;
  name: string;
  type: 'inbox' | 'drafts' | 'scheduled' | 'sent' | 'junk' | 'trash' | 'archive' | 'custom';
  iconName?: string;
  count?: number;
  unreadCount?: number;
  depth?: number;
  colorText?: string;
  colorBg?: string;
  children?: Folder[];
}

export interface Label {
  id: string;
  name: string;
  colorText: string;
  colorBg: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  cc?: string[];
  subject: string;
  snippet: string;
  bodyHtml: string;
  date: string;
  formattedTime: string;
  size: string;
  isRead: boolean;
  isStarred: boolean;
  isPinned: boolean;
  hasAttachment: boolean;
  threadCount?: number;
  /** System-Ordnerstatus (Gesendet, Entwurf, Papierkorb, Archiv) — getrennt von Tags */
  badge?: {
    text: string;
    colorText: string;
    colorBg: string;
  };
  /** IDs der zugewiesenen Labels/Tags (Mehrfachzuweisung) */
  tagIds: string[];
  avatarUrl?: string;
  avatarInitials?: string;
  avatarColorClass?: string;
}

/** Systemordner ohne Demo-Zähler — Counts werden live aus den E-Mails berechnet */
export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'inbox', name: 'Posteingang', type: 'inbox', count: 0, unreadCount: 0, depth: 0 },
  { id: 'drafts', name: 'Entwürfe', type: 'drafts', count: 0, depth: 0 },
  { id: 'scheduled', name: 'Geplant', type: 'scheduled', count: 0, depth: 0 },
  { id: 'sent', name: 'Gesendet', type: 'sent', count: 0, depth: 0 },
  { id: 'spam', name: 'Spam', type: 'junk', count: 0, depth: 0 },
  { id: 'trash', name: 'Papierkorb', type: 'trash', count: 0, depth: 0 },
  { id: 'archive', name: 'Alle E-Mails', type: 'archive', count: 0, depth: 0 },
];

/** Keine Demo-Labels — Nutzer legt sie in den Einstellungen an */
export const DEFAULT_LABELS: Folder[] = [];

/** Keine Demo-Mails */
export const DEFAULT_EMAILS: EmailMessage[] = [];

/** @deprecated Alias für Abwärtskompatibilität */
export const MOCK_FOLDERS = DEFAULT_FOLDERS;
/** @deprecated Alias für Abwärtskompatibilität */
export const MOCK_LABELS = DEFAULT_LABELS;
/** @deprecated Alias für Abwärtskompatibilität */
export const MOCK_EMAILS = DEFAULT_EMAILS;
