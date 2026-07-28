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

export const MOCK_FOLDERS: Folder[] = [
  { id: 'inbox', name: 'Posteingang', type: 'inbox', count: 26, unreadCount: 0, depth: 0 },
  { id: 'drafts', name: 'Entwürfe', type: 'drafts', count: 0, depth: 0, children: [
    { id: 'templates', name: 'Template', type: 'custom', count: 0, depth: 1 }
  ]},
  { id: 'scheduled', name: 'Geplant', type: 'scheduled', count: 0, depth: 0 },
  { id: 'sent', name: 'Gesendet', type: 'sent', count: 255, depth: 0 },
  { id: 'spam', name: 'Spam', type: 'junk', count: 0, depth: 0 },
  { id: 'trash', name: 'Papierkorb', type: 'trash', count: 414, depth: 0 },
  { id: 'archive', name: 'Alle E-Mails', type: 'archive', count: 0, depth: 0 },
];

export const MOCK_LABELS: Folder[] = [
  { id: 'blog', name: 'Blog', type: 'custom', count: 0, colorText: 'var(--label-yellow-text)', colorBg: 'var(--label-yellow-bg)' },
  { id: 'purchases', name: 'Käufe', type: 'custom', count: 11, colorText: 'var(--label-red-text)', colorBg: 'var(--label-red-bg)' },
  { id: 'private', name: 'Privat', type: 'custom', count: 0, colorText: 'var(--label-yellow-text)', colorBg: 'var(--label-yellow-bg)', children: [
    { id: 'priv-fastmail', name: 'Fastmail', type: 'custom', count: 17, depth: 1, colorText: 'var(--label-gray-text)', colorBg: 'var(--label-gray-bg)' },
    { id: 'priv-icloud', name: 'iCloud', type: 'custom', count: 4, depth: 1, colorText: 'var(--label-gray-text)', colorBg: 'var(--label-gray-bg)' },
    { id: 'priv-iu', name: 'IU', type: 'custom', count: 81, depth: 1, colorText: 'var(--label-blue-text)', colorBg: 'var(--label-blue-bg)' },
    { id: 'priv-olcaysu-cc', name: 'Olcaysu.cc', type: 'custom', count: 5286, depth: 1, colorText: 'var(--label-gray-text)', colorBg: 'var(--label-gray-bg)' },
    { id: 'priv-olcaysu-com', name: 'Olcaysu.com', type: 'custom', count: 176, depth: 1, colorText: 'var(--label-green-text)', colorBg: 'var(--label-green-bg)' },
    { id: 'priv-shoppen', name: 'Shoppen', type: 'custom', count: 6993, depth: 1, colorText: 'var(--label-purple-text)', colorBg: 'var(--label-purple-bg)' },
    { id: 'priv-yahoo', name: 'Yahoo', type: 'custom', count: 31, depth: 1, colorText: 'var(--label-gray-text)', colorBg: 'var(--label-gray-bg)' }
  ]},
  { id: 'invoices', name: 'Rechnungen', type: 'custom', count: 26, colorText: 'var(--label-green-text)', colorBg: 'var(--label-green-bg)' },
  { id: 'important', name: 'Wichtig', type: 'custom', count: 8, colorText: 'var(--label-pink-text)', colorBg: 'var(--label-pink-bg)' },
  { id: 'other', name: 'z.Andere', type: 'custom', count: 0, colorText: 'var(--label-gray-text)', colorBg: 'var(--label-gray-bg)', children: [
    { id: 'other-oma', name: 'Oma', type: 'custom', count: 335, depth: 1, colorText: 'var(--label-gray-text)', colorBg: 'var(--label-gray-bg)' }
  ]}
];

export const MOCK_EMAILS: EmailMessage[] = [
  {
    id: 'msg-1',
    threadId: 'th-1',
    fromName: 'Aaron Olcaysu',
    fromEmail: 'aaron.olcaysu@scout24.com',
    toName: 'atakan@olcaysu.de',
    toEmail: 'atakan@olcaysu.de',
    cc: ['aaron.olcaysu@scout24.com', 'aaron@olcaysu.cc'],
    subject: 'Outlook Email Test 2',
    snippet: 'TREASURY Neuer Zahlungsprozess Gültig ab Juli 2026 AUF EINEN BLICK REGULÄRE ZAHLLÄUFE Di & Do jeweils vormittags TAGES-CUTOFF 10:00 Uhr Unterlagen im Ordner',
    date: 'Dienstag, 28. Juli 2026 11:13',
    formattedTime: '11:13',
    size: '189 KB',
    isRead: true,
    isStarred: false,
    isPinned: false,
    hasAttachment: false,
    tagIds: ['priv-olcaysu-cc', 'important'],
    avatarInitials: 'AO',
    avatarColorClass: '#ff9626',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; background-color: #EEF1F4; padding: 20px; border-radius: 8px;">
        <div style="background-color: #333333; color: white; padding: 30px; border-radius: 8px 8px 0 0;">
          <p style="color: #FF9626; font-size: 11px; font-weight: bold; letter-spacing: 2px;">TREASURY</p>
          <h1 style="font-size: 32px; margin: 10px 0;">Neuer Zahlungsprozess</h1>
          <span style="background: #FF9626; color: #111; padding: 6px 14px; font-weight: bold; border-radius: 4px; font-size: 12px; display: inline-block;">Gültig ab Juli 2026</span>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; color: #333;">
          <h2 style="font-size: 14px; letter-spacing: 1px; color: #555; margin-bottom: 15px;">AUF EINEN BLICK</h2>
          <div style="display: flex; gap: 15px; margin-bottom: 25px;">
            <div style="background: #FF9626; padding: 15px; border-radius: 12px; flex: 1;">
              <div style="font-size: 10px; font-weight: bold;">REGULÄRE ZAHLLÄUFE</div>
              <div style="font-size: 20px; font-weight: bold; margin-top: 4px;">Di & Do</div>
              <div style="font-size: 12px;">jeweils vormittags</div>
            </div>
            <div style="background: #FF9626; padding: 15px; border-radius: 12px; flex: 1;">
              <div style="font-size: 10px; font-weight: bold;">TAGES-CUTOFF</div>
              <div style="font-size: 20px; font-weight: bold; margin-top: 4px;">10:00 Uhr</div>
              <div style="font-size: 12px;">Unterlagen im Ordner</div>
            </div>
            <div style="background: #FF9626; padding: 15px; border-radius: 12px; flex: 1;">
              <div style="font-size: 10px; font-weight: bold;">JEDER BELEG</div>
              <div style="font-size: 20px; font-weight: bold; margin-top: 4px;">PDF</div>
              <div style="font-size: 12px;">Empfänger · IBAN · Betrag</div>
            </div>
          </div>
          <p style="line-height: 1.6; font-size: 14px; color: #333;">
            Hallo Zusammen,<br/><br/>
            im Zuge der Integration weiterer Gesellschaften haben wir unsere Prozesse im Zahlungsverkehr weiterentwickelt und angepasst. Bitte beachtet die neuen Fristen und Vorgaben für Zahlungsfreigaben.
          </p>
        </div>
      </div>
    `
  },
  {
    id: 'msg-2',
    threadId: 'th-2',
    fromName: 'Aaron O, Shop4Tesla',
    fromEmail: 'support@shop4tesla.com',
    toName: 'Aaron Olcaysu',
    toEmail: 'shop4tesla@olcaysu.cc',
    subject: 'Rückgabe Bestellung #S4T109192',
    snippet: 'Sehr geehrter Herr Olcaysu, vielen Dank für Ihre Nachricht. Ihre Bestellung #S4T109192 wurde noch nicht an Sie versendet, da die Snuuzu Camping Matratze derzeit bedauerlicherweise nicht auf Lager ist.',
    date: 'Dienstag, 28. Juli 2026 09:56',
    formattedTime: '09:56',
    size: '51 KB',
    isRead: true,
    isStarred: false,
    isPinned: false,
    hasAttachment: false,
    threadCount: 2,
    tagIds: ['priv-olcaysu-cc', 'purchases'],
    avatarInitials: 'ST',
    avatarColorClass: '#0067b9',
    bodyHtml: `
      <p style="font-family: Arial, sans-serif; line-height: 1.6;">
        Sehr geehrter Herr Olcaysu,<br/><br/>
        vielen Dank für Ihre Nachricht.<br/><br/>
        Ihre Bestellung <strong>#S4T109192</strong> wurde noch nicht an Sie versendet, da die Snuuzu Camping Matratze derzeit bedauerlicherweise nicht auf Lager ist. Aus diesem Grund konnten Sie auch keine Rücksendung in Ihrem Kundenkonto anmelden.<br/><br/>
        Herzliche Grüße,<br/>
        Ihr Shop4Tesla Team
      </p>
    `
  },
  {
    id: 'msg-3',
    threadId: 'th-3',
    fromName: 'Aaron O, Daniel O',
    fromEmail: 'daniel.oberpichler@tecis.de',
    toName: 'Aaron Olcaysu',
    toEmail: 'aaron@olcaysu.com',
    subject: 'Einschätzung Unfallversicherung',
    snippet: 'Hier die Kündigung noch als Word, falls du eine Formulierung ändern willst. Diese bitte per Mail unterschrieben an info@sia.digital schicken. Grüße Daniel',
    date: 'Samstag, 25. Juli 2026 11:46',
    formattedTime: '25. Jul',
    size: '6,4 MB',
    isRead: true,
    isStarred: true,
    isPinned: false,
    hasAttachment: true,
    threadCount: 3,
    tagIds: ['priv-olcaysu-com', 'important'],
    avatarInitials: 'DO',
    avatarColorClass: '#388e3c',
    bodyHtml: `
      <p style="font-family: Arial, sans-serif; line-height: 1.6;">
        Hallo Aaron,<br/><br/>
        hier die Kündigung noch als Word-Dokument, falls du eine Formulierung ändern willst.<br/>
        Diese bitte per E-Mail unterschrieben an info@sia.digital schicken.<br/><br/>
        Grüße,<br/>
        Daniel
      </p>
    `
  },
  {
    id: 'msg-4',
    threadId: 'th-4',
    fromName: 'APCOA Parking Deutschland',
    fromEmail: 'service@apcoa.de',
    toName: 'Aaron Olcaysu',
    toEmail: 'aaron@olcaysu.cc',
    subject: '[##949263##] Your ticket has been created',
    snippet: 'Sehr geehrte Damen und Herren, vielen Dank für Ihre Nachricht. Wir bearbeiten Ihren Vorgang mit der Ticket ID 949263 und dem Betreff Anfrage zur Unterstützung der Sitzungs-ID 75934228.',
    date: 'Freitag, 24. Juli 2026 16:15',
    formattedTime: '24. Jul',
    size: '15 KB',
    isRead: true,
    isStarred: false,
    isPinned: false,
    hasAttachment: false,
    tagIds: ['priv-olcaysu-cc'],
    avatarInitials: 'AP',
    avatarColorClass: '#e12162',
    bodyHtml: `
      <p style="font-family: Arial, sans-serif; line-height: 1.6;">
        Sehr geehrte Damen und Herren,<br/><br/>
        vielen Dank für Ihre Nachricht. Wir bearbeiten Ihren Vorgang mit der <strong>Ticket ID 949263</strong>.<br/><br/>
        Mit freundlichen Grüßen,<br/>
        APCOA Customer Service
      </p>
    `
  },
  {
    id: 'msg-5',
    threadId: 'th-5',
    fromName: 'Epikur Portal',
    fromEmail: 'noreply@epikur-portal.de',
    toName: 'Aaron Olcaysu',
    toEmail: 'aaron@yahoo.de',
    subject: 'Terminbestätigung für den 26.08.2026 um 13:00 Uhr',
    snippet: 'Ihre Terminanfrage Liebe:r Aaron Olcaysu, Ihr Termin bei 360° Psychotherapie mit Dipl.-Psych. Brit Kahnt findet am 26.08.2026 um 13:00 Uhr in der Gormannstraße 14, 10119 Berlin statt.',
    date: 'Donnerstag, 23. Juli 2026 13:33',
    formattedTime: '23. Jul',
    size: '19 KB',
    isRead: true,
    isStarred: false,
    isPinned: false,
    hasAttachment: false,
    tagIds: ['priv-yahoo'],
    avatarInitials: 'EP',
    avatarColorClass: '#5e174d',
    bodyHtml: `
      <p style="font-family: Arial, sans-serif; line-height: 1.6;">
        Liebe:r Aaron Olcaysu,<br/><br/>
        Ihr Termin bei 360° Psychotherapie mit Dipl.-Psych. Brit Kahnt findet am <strong>26.08.2026 um 13:00 Uhr</strong> in der Gormannstraße 14, 10119 Berlin statt.<br/><br/>
        Herzliche Grüße,<br/>
        Epikur Portal Team
      </p>
    `
  },
  {
    id: 'msg-6',
    threadId: 'th-6',
    fromName: 'StromNow',
    fromEmail: 'noreply@mail.stromnow.app',
    toName: 'Aaron Olcaysu',
    toEmail: 'aaron@olcaysu.de',
    subject: 'Upgrade deinen Black Pass kostenlos auf Pro',
    snippet: 'Upgrade deinen Black Pass kostenlos auf Pro Hallo Aaron, wir freuen uns, dir ein kostenloses Upgrade von deinem aktuellen Black Pass auf StromNow Pro anbieten zu können.',
    date: 'Montag, 20. Juli 2026 12:07',
    formattedTime: '20. Jul',
    size: '33 KB',
    isRead: true,
    isStarred: false,
    isPinned: false,
    hasAttachment: false,
    tagIds: ['invoices'],
    avatarInitials: 'SN',
    avatarColorClass: '#04917f',
    bodyHtml: `
      <p style="font-family: Arial, sans-serif; line-height: 1.6;">
        Hallo Aaron,<br/><br/>
        wir freuen uns, dir ein kostenloses Upgrade von deinem aktuellen Black Pass auf <strong>StromNow Pro</strong> anbieten zu können. Pro ist unser Haupttarif für das beste StromNow Erlebnis.<br/><br/>
        Viele Grüße,<br/>
        Dein StromNow Team
      </p>
    `
  }
];
