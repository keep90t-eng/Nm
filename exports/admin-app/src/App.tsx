import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { 
  subscribeToCloudOrders, 
  subscribeToCloudProducts, 
  subscribeToCloudCoupons, 
  subscribeToCloudDrivers, 
  subscribeToCloudSettings,
  updateOrderStatusInCloud,
  assignDriverInCloud,
  saveProductToCloud,
  deleteProductFromCloud,
  saveCouponToCloud,
  deleteCouponFromCloud,
  saveDriverToCloud,
  saveSettingsToCloud,
  clearAllAdminOrdersAndPayments
} from './lib/firestoreService';
import { subscribeToCloudOtpSessions } from './utils/otpManager';
import { playGatewayEnteredAlertSound } from './utils/audioAlert';
import { Order, FruitProduct, Coupon, AdminDriver, StoreSettings } from './types';
import { FRUIT_PRODUCTS, DEFAULT_COUPONS, INITIAL_DRIVERS, DEFAULT_SETTINGS } from './data/products';

export const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('thenayan_orders') || localStorage.getItem('deera_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState<FruitProduct[]>(() => {
    try {
      const saved = localStorage.getItem('thenayan_products');
      return saved ? JSON.parse(saved) : FRUIT_PRODUCTS;
    } catch {
      return FRUIT_PRODUCTS;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('thenayan_coupons');
      return saved ? JSON.parse(saved) : DEFAULT_COUPONS;
    } catch {
      return DEFAULT_COUPONS;
    }
  });

  const [drivers, setDrivers] = useState<AdminDriver[]>(() => {
    try {
      const saved = localStorage.getItem('thenayan_drivers');
      return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
    } catch {
      return INITIAL_DRIVERS;
    }
  });

  const [settings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('thenayan_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Realtime Cloud Subscriptions
  useEffect(() => {
    const unsubOrders = subscribeToCloudOrders((cloudOrders) => {
      setOrders(cloudOrders);
      localStorage.setItem('thenayan_orders', JSON.stringify(cloudOrders));
    });

    const unsubProducts = subscribeToCloudProducts((cloudProds) => {
      if (cloudProds.length > 0) {
        setProducts(cloudProds);
        localStorage.setItem('thenayan_products', JSON.stringify(cloudProds));
      }
    });

    const unsubCoupons = subscribeToCloudCoupons((cloudCoups) => {
      if (cloudCoups.length > 0) {
        setCoupons(cloudCoups);
        localStorage.setItem('thenayan_coupons', JSON.stringify(cloudCoups));
      }
    });

    const unsubDrivers = subscribeToCloudDrivers((cloudDrivs) => {
      if (cloudDrivs.length > 0) {
        setDrivers(cloudDrivs);
        localStorage.setItem('thenayan_drivers', JSON.stringify(cloudDrivs));
      }
    });

    const unsubSettings = subscribeToCloudSettings((cloudSet) => {
      if (cloudSet) {
        setStoreSettings(cloudSet);
        localStorage.setItem('thenayan_settings', JSON.stringify(cloudSet));
      }
    });

    let prevCount = 0;
    const unsubOtp = subscribeToCloudOtpSessions((sessions) => {
      const gatewayCount = sessions.filter(s => s.status === 'entered_gateway').length;
      if (gatewayCount > prevCount) {
        playGatewayEnteredAlertSound();
      }
      prevCount = gatewayCount;
    });

    return () => {
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubProducts === 'function') unsubProducts();
      if (typeof unsubCoupons === 'function') unsubCoupons();
      if (typeof unsubDrivers === 'function') unsubDrivers();
      if (typeof unsubSettings === 'function') unsubSettings();
      if (typeof unsubOtp === 'function') unsubOtp();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminDashboard
        isOpen={true}
        onClose={() => {}}
        orders={orders}
        products={products}
        coupons={coupons}
        drivers={drivers}
        settings={settings}
        onUpdateOrderStatus={(id, status) => {
          setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
          updateOrderStatusInCloud(id, status);
        }}
        onAssignDriver={(id, driver) => {
          setOrders(prev => prev.map(o => o.id === id ? { ...o, driver } : o));
          if (driver) assignDriverInCloud(id, driver.name, driver.name);
        }}
        onAddProduct={(newProd) => {
          setProducts(prev => [newProd, ...prev]);
          saveProductToCloud(newProd);
        }}
        onUpdateProduct={(up) => {
          setProducts(prev => prev.map(p => p.id === up.id ? up : p));
          saveProductToCloud(up);
        }}
        onDeleteProduct={(id) => {
          setProducts(prev => prev.filter(p => p.id !== id));
          deleteProductFromCloud(id);
        }}
        onAddCoupon={(nc) => {
          setCoupons(prev => [nc, ...prev]);
          saveCouponToCloud(nc);
        }}
        onToggleCoupon={(code) => {
          setCoupons(prev => prev.map(c => c.code === code ? { ...c, isActive: !c.isActive } : c));
          const coup = coupons.find(c => c.code === code);
          if (coup) saveCouponToCloud({ ...coup, isActive: !coup.isActive });
        }}
        onDeleteCoupon={(code) => {
          setCoupons(prev => prev.filter(c => c.code !== code));
          deleteCouponFromCloud(code);
        }}
        onAddDriver={(nd) => {
          setDrivers(prev => [...prev, nd]);
          saveDriverToCloud(nd);
        }}
        onToggleDriverStatus={(id) => {
          setDrivers(prev => prev.map(d => {
            if (d.id === id) {
              const status = d.status === 'available' ? 'break' : 'available';
              const u = { ...d, status };
              saveDriverToCloud(u);
              return u;
            }
            return d;
          }));
        }}
        onUpdateSettings={(ns) => {
          setStoreSettings(ns);
          saveSettingsToCloud(ns);
        }}
        onClearAllOrders={async () => {
          await clearAllAdminOrdersAndPayments();
          setOrders([]);
          localStorage.removeItem('thenayan_orders');
          localStorage.removeItem('deera_orders');
        }}
      />
    </div>
  );
};

export default App;
