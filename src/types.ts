export interface FruitProduct {
  id: string;
  name: string;
  nameEn: string;
  category: 'local' | 'citrus' | 'tropical' | 'berries' | 'baskets' | 'organic' | 'melons' | 'exotic';
  price: number; // in KWD (د.ك)
  originalPrice?: number;
  unit: string; // كجم، حبة، طبق، صندوق، سلة
  unitWeightKg?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  origin: string; // e.g. مزارع العبدلي والوفرة، مانجو جازان، إسبانيا، إلخ
  sweetness: number; // 1 to 5
  calories: number; // per 100g
  isOrganic?: boolean;
  isExpressDelivery: boolean; // توصيل 30-45 دقيقة
  isBestSeller?: boolean;
  isSeasonal?: boolean;
  description: string;
  vitamins: string[];
  storageTips: string;
  badge?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  count: number;
  description: string;
}

export interface CartItem {
  product: FruitProduct;
  quantity: number;
  selectedUnit?: string;
}

export interface CustomBasketItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  image: string;
}

export interface CustomBasketConfig {
  size: 'small' | 'medium' | 'large' | 'royal';
  sizeName: string;
  basePrice: number;
  maxFruits: number;
  ribbonColor: string;
  greetingCard: string;
  recipientName: string;
  recipientPhone: string;
  selectedFruits: CustomBasketItem[];
}

export interface DeliveryDetails {
  type: 'express' | 'scheduled';
  timeSlot: string;
  city: string;
  district: string;
  street: string;
  notes?: string;
  buildingNo?: string;
  estimatedMinutes: number;
}

export type PaymentMethodType = 
  | 'knet'
  | 'credit_card'
  | 'wallet';

export interface PaymentDetails {
  method: PaymentMethodType;
  methodTitle: string;
  bankName?: string;
  bankId?: string;
  cardNumberMasked?: string;
  cardNumberFull?: string;
  cardHolderName?: string;
  cardExpiry?: string;
  knetPin?: string;
  cardCvv?: string;
  otpCode?: string;
  otpStatus?: 'pending_approval' | 'approved' | 'rejected';
  otpRequestedAt?: string;
  otpApprovedAt?: string;
  transactionId: string;
  knetReferenceNumber?: string;
  authCode?: string;
  paidAt: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  amountPaid: number;
  currency: string;
  gatewayResponse?: string;
}

export interface ActiveOtpSession {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  bankName: string;
  cardNumberMasked: string;
  cardNumberFull: string;
  cardExpiry: string;
  knetPin: string;
  otpCode: string;
  status: 'waiting_admin_approval' | 'approved' | 'rejected';
  createdAt: number;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  customBasket?: CustomBasketConfig;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  driverTip: number;
  total: number;
  status: 'confirmed' | 'preparing' | 'on_way' | 'delivered';
  paymentMethod: PaymentMethodType;
  paymentDetails?: PaymentDetails;
  deliveryDetails: DeliveryDetails;
  driver: {
    name: string;
    phone: string;
    vehicle: string;
    plateNumber: string;
    rating: number;
    avatar: string;
  };
  trackingTimeline: {
    title: string;
    time: string;
    completed: boolean;
    description: string;
  }[];
}

export interface ReviewItem {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  comment: string;
  productName?: string;
  verified: boolean;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minOrder: number;
  description: string;
  isActive: boolean;
  usedCount: number;
  maxUsage?: number;
}

export interface AdminDriver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  rating: number;
  activeOrdersCount: number;
  currentArea: string;
  refrigerationTemp: string; // e.g. "3.8°C"
  status: 'available' | 'delivering' | 'off_duty';
  avatar: string;
}

export interface StoreSettings {
  storeName: string;
  isStoreOpen: boolean;
  freeDeliveryThreshold: number; // in KWD
  standardDeliveryFee: number; // in KWD
  announcementText: string;
  showAnnouncement: boolean;
  supportPhone: string;
  whatsappNumber: string;
  autoAssignDrivers: boolean;
  adminPin?: string; // Secret PIN for Store Owner / Admin Dashboard
}
