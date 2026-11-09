import { Presence } from '../types/models';
import { formatLastSeen } from './time';

export function isOnline(presence?: Presence | null): boolean {
  return presence?.state === 'online';
}

export function getPresenceLabel(presence: Presence | null | undefined, now: number): string {
  if (isOnline(presence)) {
    return 'Đang hoạt động';
  }
  return formatLastSeen(presence?.lastChanged, now);
}
