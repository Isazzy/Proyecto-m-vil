// src/hooks/useUserDoc.js
import { useEffect, useState, useCallback } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';

export default function useUserDoc({ realtime = true } = {}) {
  const [user, setUser] = useState(() => auth.currentUser || null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(null);

  // Cambios de sesión
  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
    });
    return off;
  }, []);

  // Carga o suscripción al doc users/{uid}
  useEffect(() => {
    let unsub = null;
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        if (!user?.uid) {
          setUserDoc(null);
          setLoading(false);
          return;
        }
        const ref = doc(db, 'users', user.uid);
        if (realtime) {
          unsub = onSnapshot(
            ref,
            (snap) => {
              setUserDoc(snap.exists() ? snap.data() : null);
              setLoading(false);
            },
            (e) => {
              setErr(e);
              setLoading(false);
            }
          );
        } else {
          const snap = await getDoc(ref);
          setUserDoc(snap.exists() ? snap.data() : null);
          setLoading(false);
        }
      } catch (e) {
        setErr(e);
        setLoading(false);
      }
    };
    run();
    return () => unsub && unsub();
  }, [user?.uid, realtime]);

  // Forzar recarga manual (útil con realtime=false)
  const refresh = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      setUserDoc(snap.exists() ? snap.data() : null);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Atajo para actualizar el doc y (si corresponde) también Auth
  const updateUserDoc = useCallback(
    async (partial) => {
      if (!user?.uid) throw new Error('No hay usuario autenticado');
      const ref = doc(db, 'users', user.uid);
      const payload = { ...partial, updatedAt: Timestamp.now() };
      await setDoc(ref, payload, { merge: true });

      const authPatch = {};
      if (typeof partial.displayName === 'string') authPatch.displayName = partial.displayName;
      if (typeof partial.photoURL === 'string') authPatch.photoURL = partial.photoURL;
      if (Object.keys(authPatch).length) {
        await updateProfile(user, authPatch);
      }
    },
    [user?.uid]
  );

  return { user, userDoc, loading, error, refresh, updateUserDoc };
}
