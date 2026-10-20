import { Badge } from '../../../core/model/badge.model';

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  isOffer: boolean;
  discountPercent?: number;
  featured: boolean;
  imageUrl?: string;
  bgColor?: string;
  pdfUrl?: string;
  categoryId: number;
  categoryName?: string;
  badges?: Badge[];
}
