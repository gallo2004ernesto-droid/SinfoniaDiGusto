import { Badge } from './badge.model';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  isOffer?: boolean;       // Calcolato dal backend: vero se ha il badge "In Offerta"
  discountPercent?: number;
  featured?: boolean;      // Calcolato dal backend: vero se ha il badge "In Evidenza"
  imageUrl?: string;
  bgColor?: string;
  pdfUrl?: string;
  categoryId: number;
  categoryName?: string;   // Nome della categoria collegata
  badges?: Badge[];        // Badge assegnati al prodotto

  category?: string;       // Alias per categoryName
  onSale?: boolean;        // Alias per isOffer
}