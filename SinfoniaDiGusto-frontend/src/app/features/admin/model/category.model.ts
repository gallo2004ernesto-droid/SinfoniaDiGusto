export interface Category {
    id?: number;
    name: string;
    imgeUrl?: string;
}

export interface AdminCategory extends Category {
  productCount: number;
}
