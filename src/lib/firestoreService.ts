import { Order, FruitProduct, StoreSettings } from '../types';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query 
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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
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
    await setDoc(docRef, {
      ...order,
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
        // If cloud collection is brand new, seed with existing sample orders to initialize
        if (initialOrders.length > 0) {
          initialOrders.forEach(ord => {
            saveOrderToCloud(ord);
          });
        }
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

// -------------------------------------------------------------
// Products Catalog Cloud Persistence
// -------------------------------------------------------------

export const saveProductToCloud = async (product: FruitProduct) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(docRef, {
      ...product,
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
        // If initial product has an updated image, sync it
        const matchingInit = initialProducts.find(p => p.id === prodData.id);
        if (matchingInit && matchingInit.image && matchingInit.image !== prodData.image && matchingInit.id === 'dates-sukari-al-qassim') {
          prodData.image = matchingInit.image;
          saveProductToCloud(prodData);
        }
        cloudProducts.push(prodData);
      });

      onProductsUpdated(cloudProducts);
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
    await setDoc(docRef, {
      ...settings,
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
