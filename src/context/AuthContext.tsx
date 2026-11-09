import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';

import { subscribeAuth } from '../services/authService';
import { startPresence } from '../services/presenceService';
import { subscribeUser } from '../services/userService';
import { UserProfile } from '../types/models';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  initializing: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuth(nextUser => {
      setUser(nextUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const uid = user?.uid;

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      return;
    }
    const unsubscribeProfile = subscribeUser(uid, setProfile);
    const stopPresence = startPresence(uid);
    return () => {
      unsubscribeProfile();
      stopPresence();
    };
  }, [uid]);

  const value = useMemo(() => ({ user, profile, initializing }), [user, profile, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

export function useCurrentUid(): string {
  const { user } = useAuth();
  return user?.uid ?? '';
}
