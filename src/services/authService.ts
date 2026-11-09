import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { ref, serverTimestamp, set } from 'firebase/database';

import { auth, db } from './firebase';
import { goOffline } from './presenceService';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export async function register({ name, email, password }: RegisterPayload): Promise<User> {
  const displayName = name.trim().replace(/\s+/g, ' ');
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(credential.user, { displayName });
  await set(ref(db, `users/${credential.user.uid}`), {
    uid: credential.user.uid,
    name: displayName,
    nameLower: displayName.toLowerCase(),
    email: credential.user.email,
    createdAt: serverTimestamp(),
  });
  return credential.user;
}

export async function login(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function logout(): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (uid) {
    await goOffline(uid).catch(() => undefined);
  }
  await signOut(auth);
}

export function subscribeAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
