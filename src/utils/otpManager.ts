import { ActiveOtpSession } from '../types';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreService';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY = 'deera_active_otp_sessions';
const EVENT_KEY = 'deera_otp_event';
const OTP_COLLECTION = 'otp_sessions';

export const getActiveOtpSessions = (): ActiveOtpSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading OTP sessions:', e);
    return [];
  }
};

export const saveActiveOtpSession = async (session: ActiveOtpSession) => {
  try {
    // 1. Save locally for instant UI response
    const current = getActiveOtpSessions().filter(s => s.id !== session.id);
    const updated = [session, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: { type: 'updated', session } }));

    // 2. Persist to Firestore cloud database in real-time
    const docRef = doc(db, OTP_COLLECTION, session.id);
    await setDoc(docRef, {
      ...session,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${OTP_COLLECTION}/${session.id}`);
  }
};

export const approveOtpSession = async (sessionId: string) => {
  try {
    // 1. Update locally
    const current = getActiveOtpSessions();
    const updated = current.map(s => {
      if (s.id === sessionId) {
        return { ...s, status: 'approved' as const };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const targetSession = updated.find(s => s.id === sessionId);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: { type: 'approved', session: targetSession, sessionId } }));

    // 2. Update Firestore document in real-time
    const docRef = doc(db, OTP_COLLECTION, sessionId);
    await updateDoc(docRef, {
      status: 'approved',
      approvedAt: new Date().toISOString()
    });
    return targetSession;
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `${OTP_COLLECTION}/${sessionId}`);
  }
};

export const rejectOtpSession = async (sessionId: string) => {
  try {
    // 1. Update locally
    const current = getActiveOtpSessions();
    const updated = current.map(s => {
      if (s.id === sessionId) {
        return { ...s, status: 'rejected' as const };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const targetSession = updated.find(s => s.id === sessionId);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: { type: 'rejected', session: targetSession, sessionId } }));

    // 2. Update Firestore document
    const docRef = doc(db, OTP_COLLECTION, sessionId);
    await updateDoc(docRef, {
      status: 'rejected',
      rejectedAt: new Date().toISOString()
    });
    return targetSession;
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `${OTP_COLLECTION}/${sessionId}`);
  }
};

export const removeOtpSession = async (sessionId: string) => {
  try {
    const current = getActiveOtpSessions().filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: { type: 'removed', sessionId } }));

    // Remove from Firestore
    const docRef = doc(db, OTP_COLLECTION, sessionId);
    await deleteDoc(docRef);
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${OTP_COLLECTION}/${sessionId}`);
  }
};

// Subscribe to real-time Cloud OTP sessions from Firestore
export const subscribeToCloudOtpSessions = (onUpdate: (sessions: ActiveOtpSession[]) => void) => {
  try {
    const colRef = collection(db, OTP_COLLECTION);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const cloudSessions: ActiveOtpSession[] = [];
      snapshot.forEach(docSnap => {
        cloudSessions.push(docSnap.data() as ActiveOtpSession);
      });
      if (cloudSessions.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudSessions));
        window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: { type: 'synced', sessions: cloudSessions } }));
      }
      onUpdate(cloudSessions);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, OTP_COLLECTION);
    });
    return unsubscribe;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, OTP_COLLECTION);
    return () => {};
  }
};
