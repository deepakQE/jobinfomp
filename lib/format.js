const PLACEHOLDER_VALUES = new Set(['n/a', 'na', 'null', 'undefined', '']);

export function cleanText(value) {
  if (value === null || value === undefined) return null;
  let text = String(value).trim();
  if (/^n\/a\b/i.test(text)) {
    text = text.replace(/^n\/a\b\s*/i, '').trim();
    text = text.replace(/^[-:]+\s*/, '').trim();
    if (text.startsWith('(') && text.endsWith(')')) text = text.slice(1, -1).trim();
  }
  return PLACEHOLDER_VALUES.has(text.toLowerCase()) ? null : text;
}

export function formatDate(value) {
  const text = cleanText(value);
  if (!text) return null;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

export function formatOrganization(value) {
  const text = cleanText(value);
  return text ? text.toUpperCase() : null;
}

export function formatVacancies(value) {
  const text = cleanText(value);
  if (!text) return null;
  return text.replace(/\bposts?\b/gi, 'posts');
}

export function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getDeadline(post) {
  const explicit = cleanText(post?.application_deadline);
  if (explicit) return explicit;
  const dates = parseJsonArray(post?.important_dates);
  const deadline = dates.find((item) => /last date|deadline|closing/i.test(item?.label || ''));
  return cleanText(deadline?.date);
}

export function getStatus(post, now = new Date()) {
  const deadline = getDeadline(post);
  const created = new Date(post?.created_at || '');
  const ageHours = (now.getTime() - created.getTime()) / 3_600_000;
  if (deadline) {
    const end = new Date(deadline);
    if (!Number.isNaN(end.getTime())) {
      const days = (end.getTime() - now.getTime()) / 86_400_000;
      if (days < 0) return { label: 'Closed', tone: 'closed' };
      if (days <= 7) return { label: 'Closing soon', tone: 'closing' };
    }
  }
  if (ageHours >= 0 && ageHours <= 48) return { label: 'New', tone: 'open' };
  return { label: 'Open', tone: 'open' };
}

export function getPostTypeLabel(type) {
  return {
    'latest-job': 'Latest Jobs',
    'admit-card': 'Admit Cards',
    result: 'Results',
    'answer-key': 'Answer Keys',
    notification: 'Notifications',
    'upcoming-job': 'Upcoming Jobs',
    'notice-cancellation': 'Notices',
  }[type] || 'Updates';
}
