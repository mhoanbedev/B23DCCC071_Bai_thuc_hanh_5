import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getReactNativePersistence } from '@firebase/auth';
import { Auth, connectAuthEmulator, getAuth, initializeAuth } from 'firebase/auth';
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';

import { emulatorConfig, firebaseConfig } from './firebaseConfig';

const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

function createAuth(): Auth {
  if (!isFirstInit) {
    return getAuth(app);
  }
  return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
}

export const auth = createAuth();
export const db = getDatabase(app);

if (isFirstInit && emulatorConfig.enabled) {
  connectAuthEmulator(auth, `http://${emulatorConfig.host}:${emulatorConfig.authPort}`, {
    disableWarnings: true,
  });
  connectDatabaseEmulator(db, emulatorConfig.host, emulatorConfig.databasePort);
}

export default app;
