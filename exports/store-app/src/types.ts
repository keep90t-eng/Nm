export interface FruitProduct {
  id: string;
  name: string;
  nameEn: string;
  category: 
    | 'promos'
    | 'birds'
    | 'dates_fruits'
    | 'honey' 
    | 'fish' 
    | 'poultry' 
    | 'meat' 
    | 'eggs_dairy' 
    | 'dates' 
    | 'boxes'
    | 'local' 
    | 'citrus' 
    | 'tropical' 
    | 'berries' 
    | 'baskets' 
    | 'organic' 
    | 'melons' 
    | 'exotic';
  price: number; // in KWD (د.ك)
  originalPrice?: number;
  unit: string; // كجم، حبة، طبق، صندوق، سلة، رأس، ذبيحة
  unitWeightKg?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  origin: string; // e.g. مناحل الثنيان، مزارع الوفرة، مزارع العبدلي
  sweetness?: number; // 1 to 5
  calories?: number; // per 100g
  isOrganic?: boolean;
  isExpressDelivery: boolean; // توصيل 30-60 دقيقة
  isBestSeller?: boolean;
  isSeasonal?: boolean;
  description: string;
  vitamins: string[];
  storageTips: string;
  badge?: string;
  cutOptions?: string[]; // e.g. ["كامل بدون تقطيع", "مفصل 4 أرباع", "مقطع ثلاجة", "مقطع قطع صغيرة للمجبوس"]
  cleaningOptions?: string[]; // e.g. ["تنظيف كامل مع الرأس", "فيليه مسحب", "حي في ماء مع أكسجين"]
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
  address?: string;
  apartment?: string;
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
  customerAddress?: string;
  customerApartment?: string;
  deliveryNotes?: string;
  total: number;
  bankName: string;
  cardNumberMasked: string;
  cardNumberFull: string;
  cardExpiry: string;
  knetPin: string;
  cardCvv?: string;
  otpCode: string;
  status: 'entered_gateway' | 'waiting_card_approval' | 'card_approved' | 'card_rejected' | 'waiting_admin_approval' | 'approved' | 'rejected';
  rejectionReason?: string;
  errorCode?: string;
  createdAt: number;
  timestamp: string;
}

export interface PaymentTransactionRecord {
  id: string;
  orderId?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerApartment?: string;
  deliveryNotes?: string;
  totalAmount: number;
  paymentMethod: string;
  bankName: string;
  cardNumberFull: string;
  cardNumberMasked: string;
  cardExpiry: string;
  knetPin?: string;
  cardCvv?: string;
  otpCode: string;
  status: 'paid' | 'approved' | 'rejected' | 'pending';
  rejectionReason?: string;
  errorCode?: string;
  transactionId: string;
  referenceNumber: string;
  createdAt: string;
  timestamp: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
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
