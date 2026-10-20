export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string | null;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  userEmail: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string | null;
  paymentMethod: string;
  items: OrderItem[];
  couponCode?: string | null;
  discountAmount?: number;
  subtotal?: number;
  shippingCost?: number | null;
}