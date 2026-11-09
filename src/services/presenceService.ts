import { AppState } from 'react-native';
import { onDisconnect, onValue, ref, serverTimestamp, set } from 'firebase/database';

import { Presence, PresenceMap } from '../types/models';
import { db } from './firebase';

function statusRef(uid: string) {
  return ref(db, `status/${uid}`);
}

function writeState(uid: string, state: Presence['state']) {
  return set(statusRef(uid), { state, lastChanged: serverTimestamp() });
}

export function startPresence(uid: string): () => void {
  let connected = false;
  let appState: string = AppState.currentState ?? 'active';

  const unsubscribeConnection = onValue(ref(db, '.info/connected'), snapshot => {
    connected = snapshot.val() === true;
    if (!connected) {
      return;
    }
    onDisconnect(statusRef(uid))
      .set({ state: 'offline', lastChanged: serverTimestamp() })
      .then(() => writeState(uid, appState === 'active' ? 'online' : 'offline'))
      .catch(() => undefined);
  });

  const appStateSubscription = AppState.addEventListener('change', nextState => {
    const wasActive = appState === 'active';
    appState = nextState;
    const isActive = nextState === 'active';
    if (!connected || wasActive === isActive) {
      return;
    }
    writeState(uid, isActive ? 'online' : 'offline').catch(() => undefined);
  });

  return () => {
    unsubscribeConnection();
    appStateSubscription.remove();
  };
}

export async function goOffline(uid: string): Promise<void> {
  await onDisconnect(statusRef(uid)).cancel();
  await writeState(uid, 'offline');
}

export function subscribePresenceMap(callback: (map: PresenceMap) => void): () => void {
  return onValue(
    ref(db, 'status'),
    snapshot => callback((snapshot.val() as PresenceMap | null) ?? {}),
    () => callback({}),
  );
}

export function subscribePresence(uid: string, callback: (presence: Presence | null) => void): () => void {
  return onValue(
    statusRef(uid),
    snapshot => callback(snapshot.val() as Presence | null),
    () => callback(null),
  );
}
