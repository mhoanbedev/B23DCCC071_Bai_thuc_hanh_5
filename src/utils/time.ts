const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function daysBetween(from: number, to: number): number {
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY);
}

export function formatClock(timestamp: number): string {
  const date = new Date(timestamp);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatConversationTime(timestamp: number, now: number = Date.now()): string {
  const days = daysBetween(timestamp, now);
  if (days <= 0) {
    return formatClock(timestamp);
  }
  if (days === 1) {
    return 'Hôm qua';
  }
  if (days < 7) {
    return WEEKDAYS[new Date(timestamp).getDay()];
  }
  const date = new Date(timestamp);
  if (date.getFullYear() === new Date(now).getFullYear()) {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
  }
  return formatDate(timestamp);
}

export function formatDayLabel(timestamp: number, now: number = Date.now()): string {
  const days = daysBetween(timestamp, now);
  if (days <= 0) {
    return 'Hôm nay';
  }
  if (days === 1) {
    return 'Hôm qua';
  }
  return formatDate(timestamp);
}

export function formatRelative(timestamp: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  if (diff < MINUTE) {
    return 'Vừa xong';
  }
  if (diff < HOUR) {
    return `${Math.floor(diff / MINUTE)} phút trước`;
  }
  if (diff < DAY) {
    return `${Math.floor(diff / HOUR)} giờ trước`;
  }
  const days = daysBetween(timestamp, now);
  if (days === 1) {
    return `Hôm qua lúc ${formatClock(timestamp)}`;
  }
  if (days < 7) {
    return `${days} ngày trước`;
  }
  return formatDate(timestamp);
}

export function formatLastSeen(timestamp: number | undefined, now: number = Date.now()): string {
  if (!timestamp) {
    return 'Ngoại tuyến';
  }
  const relative = formatRelative(timestamp, now);
  if (relative === 'Vừa xong') {
    return 'Hoạt động vừa xong';
  }
  return `Hoạt động ${relative.charAt(0).toLowerCase()}${relative.slice(1)}`;
}

export function isSameDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b);
}
