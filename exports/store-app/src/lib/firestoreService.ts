import { Order, FruitProduct, StoreSettings, Coupon, AdminDriver, PaymentTransactionRecord } from '../types';
import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  getDocs,
  getDocFromServer
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  
  // Gracefully handle transient connection errors in preview environments
  if (errMessage.includes('unavailable') || errMessage.includes('offline') || errMessage.includes('Could not reach')) {
    console.warn(`Firestore operating in offline/local mode for path: ${path} (${operationType})`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Validate connection on startup (as specified in Firebase skill)
export async function validateFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is in offline mode.");
    }
  }
}
validateFirestoreConnection();

// Helper to recursively remove all undefined values so Firestore never errors on undefined
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as any;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as any;
  }
  const cleanObj: any = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      cleanObj[key] = sanitizeForFirestore(value);
    }
  }
  return cleanObj;
}

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';
const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'store_config';

// -------------------------------------------------------------
// Orders Cloud Persistence & Real-time Synchronization
// -------------------------------------------------------------

export const saveOrderToCloud = async (order: Order) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    const sanitizedOrder = sanitizeForFirestore(order);
    await setDoc(docRef, {
      ...sanitizedOrder,
      syncedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`Order ${order.orderNumber} successfully saved to Firebase.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ORDERS_COLLECTION}/${order.id}`);
  }
};

export const updateOrderStatusInCloud = async (orderId: string, status: Order['status']) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
};

export const assignDriverInCloud = async (orderId: string, driverId: string, driverName: string) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      'driver.name': driverName,
      'driver.phone': '+965 96971613',
      status: 'on_way',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
};

export const subscribeToCloudOrders = (
  initialOrders: Order[], 
  onOrdersUpdated: (orders: Order[]) => void
) => {
  try {
    const colRef = collection(db, ORDERS_COLLECTION);
    const q = query(colRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        onOrdersUpdated([]);
        return;
      }

      const cloudOrders: Order[] = [];
      snapshot.forEach((docSnap) => {
        cloudOrders.push(docSnap.data() as Order);
      });

      // Sort by latest order ID or date
      cloudOrders.sort((a, b) => b.id.localeCompare(a.id));
      onOrdersUpdated(cloudOrders);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
    });

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
    return () => {};
  }
};

/**
 * Reset and clear all admin orders, active sessions, and payments from Firestore and LocalStorage
 */
export const clearAllAdminOrdersAndPayments = async () => {
  try {
    const deletePromises: Promise<any>[] = [];

    // 1. Delete all orders from Firestore
    try {
      const ordersSnap = await getDocs(collection(db, ORDERS_COLLECTION));
      ordersSnap.forEach((d) => deletePromises.push(deleteDoc(d.ref)));
    } catch (e) {
      console.warn('Orders delete error:', e);
    }

    // 2. Delete all otp_sessions from Firestore
    try {
      const otpSnap = await getDocs(collection(db, 'otp_sessions'));
      otpSnap.forEach((d) => deletePromises.push(deleteDoc(d.ref)));
    } catch (e) {
      console.warn('OTP sessions delete error:', e);
    }

    // 3. Delete all payments from Firestore
    try {
      const paySnap = await getDocs(collection(db, PAYMENTS_COLLECTION));
      paySnap.forEach((d) => deletePromises.push(deleteDoc(d.ref)));
    } catch (e) {
      console.warn('Payments delete error:', e);
    }

    await Promise.all(deletePromises);

    // 4. Wipe LocalStorage completely
    if (typeof window !== 'undefined') {
      localStorage.removeItem('deera_orders');
      localStorage.removeItem('thenayan_orders');
      localStorage.removeItem('thenayan_v5_orders');
      localStorage.removeItem('deera_active_otp_sessions');
      localStorage.removeItem('thenayan_payments');
      window.dispatchEvent(new CustomEvent('deera_otp_event', { detail: { type: 'synced', sessions: [] } }));
    }
  } catch (err) {
    console.error('Failed to clear admin data:', err);
  }
};

// -------------------------------------------------------------
// Products Catalog Cloud Persistence
// -------------------------------------------------------------

export const saveProductToCloud = async (product: FruitProduct) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    const sanitizedProduct = sanitizeForFirestore(product);
    await setDoc(docRef, {
      ...sanitizedProduct,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PRODUCTS_COLLECTION}/${product.id}`);
  }
};

export const deleteProductFromCloud = async (productId: string) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
};

export const subscribeToCloudProducts = (
  initialProducts: FruitProduct[],
  onProductsUpdated: (products: FruitProduct[]) => void
) => {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (snapshot.empty) {
        // Seed catalog to Cloud Firestore on first setup
        initialProducts.forEach(prod => {
          saveProductToCloud(prod);
        });
        return;
      }

      const cloudProducts: FruitProduct[] = [];
      snapshot.forEach((docSnap) => {
        const prodData = docSnap.data() as FruitProduct;
        cloudProducts.push(prodData);
      });

      if (cloudProducts.length > 0) {
        onProductsUpdated(cloudProducts);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
    });

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
    return () => {};
  }
};

// -------------------------------------------------------------
// Store Settings Cloud Persistence
// -------------------------------------------------------------

export const saveSettingsToCloud = async (settings: StoreSettings) => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const sanitizedSettings = sanitizeForFirestore(settings);
    await setDoc(docRef, {
      ...sanitizedSettings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`);
  }
};

export const subscribeToCloudSettings = (
  initialSettings: StoreSettings,
  onSettingsUpdated: (settings: StoreSettings) => void
) => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) {
        saveSettingsToCloud(initialSettings);
        return;
      }
      onSettingsUpdated(docSnap.data() as StoreSettings);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`);
    });

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`);
    return () => {};
  }
};

// -------------------------------------------------------------
// Coupons Cloud Persistence
// -------------------------------------------------------------

const COUPONS_COLLECTION = 'coupons';

export const saveCouponToCloud = async (coupon: Coupon) => {
  try {
    const docRef = doc(db, COUPONS_COLLECTION, coupon.code);
    const sanitized = sanitizeForFirestore(coupon);
    await setDoc(docRef, {
      ...sanitized,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COUPONS_COLLECTION}/${coupon.code}`);
  }
};

export const deleteCouponFromCloud = async (code: string) => {
  try {
    const docRef = doc(db, COUPONS_COLLECTION, code);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COUPONS_COLLECTION}/${code}`);
  }
};

export const subscribeToCloudCoupons = (
  initialCoupons: Coupon[],
  onCouponsUpdated: (coupons: Coupon[]) => void
) => {
  try {
    const colRef = collection(db, COUPONS_COLLECTION);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (snapshot.empty) {
        initialCoupons.forEach(c => saveCouponToCloud(c));
        return;
      }
      const cloudCoupons: Coupon[] = [];
      snapshot.forEach(docSnap => cloudCoupons.push(docSnap.data() as Coupon));
      if (cloudCoupons.length > 0) {
        onCouponsUpdated(cloudCoupons);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, COUPONS_COLLECTION);
    });
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COUPONS_COLLECTION);
    return () => {};
  }
};

// -------------------------------------------------------------
// Drivers / Fleet Cloud Persistence
// -------------------------------------------------------------

const DRIVERS_COLLECTION = 'drivers';

export const saveDriverToCloud = async (driver: AdminDriver) => {
  try {
    const docRef = doc(db, DRIVERS_COLLECTION, driver.id);
    const sanitized = sanitizeForFirestore(driver);
    await setDoc(docRef, {
      ...sanitized,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${DRIVERS_COLLECTION}/${driver.id}`);
  }
};

export const deleteDriverFromCloud = async (driverId: string) => {
  try {
    const docRef = doc(db, DRIVERS_COLLECTION, driverId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${DRIVERS_COLLECTION}/${driverId}`);
  }
};

export const subscribeToCloudDrivers = (
  initialDrivers: AdminDriver[],
  onDriversUpdated: (drivers: AdminDriver[]) => void
) => {
  try {
    const colRef = collection(db, DRIVERS_COLLECTION);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (snapshot.empty) {
        initialDrivers.forEach(d => saveDriverToCloud(d));
        return;
      }
      const cloudDrivers: AdminDriver[] = [];
      snapshot.forEach(docSnap => cloudDrivers.push(docSnap.data() as AdminDriver));
      if (cloudDrivers.length > 0) {
        onDriversUpdated(cloudDrivers);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, DRIVERS_COLLECTION);
    });
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, DRIVERS_COLLECTION);
    return () => {};
  }
};

// -------------------------------------------------------------
// Payment Transactions & Customer Addresses Cloud Persistence
// -------------------------------------------------------------

const PAYMENTS_COLLECTION = 'payments';

export const savePaymentRecordToCloud = async (record: PaymentTransactionRecord) => {
  try {
    const docRef = doc(db, PAYMENTS_COLLECTION, record.id);
    const sanitized = sanitizeForFirestore(record);
    await setDoc(docRef, {
      ...sanitized,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PAYMENTS_COLLECTION}/${record.id}`);
  }
};

export const subscribeToCloudPayments = (
  onPaymentsUpdated: (payments: PaymentTransactionRecord[]) => void
) => {
  try {
    const colRef = collection(db, PAYMENTS_COLLECTION);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const payments: PaymentTransactionRecord[] = [];
      snapshot.forEach(docSnap => {
        payments.push(docSnap.data() as PaymentTransactionRecord);
      });
      payments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onPaymentsUpdated(payments);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, PAYMENTS_COLLECTION);
    });
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, PAYMENTS_COLLECTION);
    return () => {};
  }
};
