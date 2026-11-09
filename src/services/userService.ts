import { onValue, ref } from 'firebase/database';

import { UserProfile } from '../types/models';
import { db } from './firebase';

export function subscribeUsers(callback: (users: UserProfile[]) => void): () => void {
  return onValue(
    ref(db, 'users'),
    snapshot => {
      const value = (snapshot.val() as Record<string, UserProfile> | null) ?? {};
      const users = Object.values(value).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      callback(users);
    },
    () => callback([]),
  );
}

export function subscribeUser(uid: string, callback: (user: UserProfile | null) => void): () => void {
  return onValue(
    ref(db, `users/${uid}`),
    snapshot => callback(snapshot.val() as UserProfile | null),
    () => callback(null),
  );
}
