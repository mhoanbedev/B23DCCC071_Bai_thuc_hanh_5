import { limitToLast, onValue, orderByChild, query, ref, update } from 'firebase/database';

import { AppNotification } from '../types/models';
import { db } from './firebase';

const NOTIFICATION_LIMIT = 100;

export function subscribeNotifications(uid: string, callback: (items: AppNotification[]) => void): () => void {
  const notificationsQuery = query(
    ref(db, `notifications/${uid}`),
    orderByChild('createdAt'),
    limitToLast(NOTIFICATION_LIMIT),
  );
  return onValue(
    notificationsQuery,
    snapshot => {
      const items: AppNotification[] = [];
      snapshot.forEach(child => {
        items.push({ id: child.key as string, ...(child.val() as Omit<AppNotification, 'id'>) });
      });
      items.reverse();
      callback(items);
    },
    () => callback([]),
  );
}

export function markNotificationsRead(uid: string, ids: string[]): Promise<void> {
  if (ids.length === 0) {
    return Promise.resolve();
  }
  const updates: Record<string, boolean> = {};
  ids.forEach(id => {
    updates[`${id}/read`] = true;
  });
  return update(ref(db, `notifications/${uid}`), updates);
}
