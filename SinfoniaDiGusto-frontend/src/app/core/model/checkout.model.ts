import { CartItem } from "../services/cart.services";

export interface ShippingDetails{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    notes?: string;
}

export type PaymentMethod = 'card' | 'paypal' | 'cash_on_delivery';


export interface Order{
    id?: string;
    items: CartItem[];
    shipping: ShippingDetails;
    paymentMethod: PaymentMethod;
    subTotal: number;
    shippingCost: number;
    total: number;
    createdAt: Date;
}

export interface OrderResponse {
  orderId: string;
  success: boolean;
  message?: string;
}