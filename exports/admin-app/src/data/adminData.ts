import { Coupon, AdminDriver, StoreSettings, Order } from '../types';

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'THENAYAN10',
    discountPercent: 10,
    minOrder: 8.0,
    description: 'خصم 10% لعملاء مزارع الثنيan + توصيل مبرد مجاني',
    isActive: true,
    usedCount: 340,
    maxUsage: 1000,
  },
  {
    code: 'HONEY15',
    discountPercent: 15,
    minOrder: 15.0,
    description: 'خصم 15% على مناحل وعسل الثنيان وبوكسات التوفير',
    isActive: true,
    usedCount: 215,
    maxUsage: 500,
  },
  {
    code: 'FARMS20',
    discountPercent: 20,
    minOrder: 25.0,
    description: 'خصم 20% على طلبات الذبائح والبوكسات العائلية الكبرى',
    isActive: true,
    usedCount: 110,
    maxUsage: 300,
  }
];

export const INITIAL_DRIVERS: AdminDriver[] = [
  {
    id: 'drv-1',
    name: 'سالم الكندري',
    phone: '+965 99123456',
    vehicle: 'فان تويوتا هايس مبردة (مزارع الثنيان)',
    plateNumber: 'كويت 14/8920',
    rating: 4.98,
    activeOrdersCount: 2,
    currentArea: 'العاصمة (الشرق / دسمان / الروضة)',
    refrigerationTemp: '3.2°C',
    status: 'delivering',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'drv-2',
    name: 'مشعل الهاجري',
    phone: '+965 66781234',
    vehicle: 'مرسيدس سبرينتر مبردة للأسماك واللحوم',
    plateNumber: 'كويت 9/4521',
    rating: 4.95,
    activeOrdersCount: 1,
    currentArea: 'حولي (السالمية / الجابرية / بيان)',
    refrigerationTemp: '2.8°C',
    status: 'delivering',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'drv-3',
    name: 'أحمد الفضلي',
    phone: '+965 55432198',
    vehicle: 'نيسان مبردة مخصصة لمناحل الثنيان',
    plateNumber: 'كويت 18/3012',
    rating: 4.9,
    activeOrdersCount: 0,
    currentArea: 'الفروانية (إشبيلية / خيطان)',
    refrigerationTemp: '4.0°C',
    status: 'available',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'drv-4',
    name: 'بدر العجمي',
    phone: '+965 97890123',
    vehicle: 'فان ثيرمو مبرد للمزارع',
    plateNumber: 'كويت 22/7711',
    rating: 4.94,
    activeOrdersCount: 0,
    currentArea: 'الأحمدي ومبارك الكبير',
    refrigerationTemp: '3.5°C',
    status: 'available',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'مزارع ومناحل الثنيان - الكويت',
  isStoreOpen: true,
  freeDeliveryThreshold: 8.0,
  standardDeliveryFee: 1.0,
  announcementText: '🌿 مزارع ومناحل الثنيان الكويتية: توصيل مبرد وسريع لجميع مناطق الكويت | خصم خاص على عسل السدر والبلطي الطازج',
  showAnnouncement: true,
  supportPhone: '+965 96971613',
  whatsappNumber: '+965 96971613',
  autoAssignDrivers: true,
  adminPin: '2025',
};

export const INITIAL_DEMO_ORDERS: Order[] = [];
