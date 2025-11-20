import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, onAuth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuth(async (u) => {
      setUser(u);
      if (u) {
        const t = await u.getIdToken();
        setIdToken(t);
      } else {
        setIdToken(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo(() => ({
    user,
    idToken,
    loading,
    signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
    register: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    signOut: () => signOut(auth),
  }), [user, idToken, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

