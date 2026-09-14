// export interface Product {
//   id?: number;
//   name: string;
//   description: string;
//   price: number;
//   originalPrice?: number;
//   onSale?: boolean;
//   discountPercent?: number;
//   category: string;
//   categoryId: number;
//   imageUrl: string;
//   bgColor?: string;
//   featured?: boolean;
//   pdfUrl?: string;
// }

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
  category: string;
  categoryId: number;
}
