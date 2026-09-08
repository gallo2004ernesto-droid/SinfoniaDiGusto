// export interface Product {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
//   originalPrice?: number; // Prezzo prima dello sconto
//   onSale?: boolean;        // Flag per identificare le promozioni
//   discountPercent?: number;
//   category: string;
//   imageUrl: string;
//   bgColor?: string;
//   featured?: boolean;
//   pdfUrl?: string;
// }

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  isOffer?: boolean;       // Mappa 'isOffer' ritornato dal DB
  discountPercent?: number;
  featured?: boolean;
  imageUrl?: string;
  bgColor?: string;
  pdfUrl?: string;
  categoryId: number;
  categoryName?: string;  // Nome della categoria collegata
  
  // Getter/proprietà opzionali di compatibilità per i componenti
  category?: string;      // Alias per categoryName
  onSale?: boolean;        // Alias per isOffer
}