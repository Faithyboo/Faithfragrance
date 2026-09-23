export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  minStockAlert: number;
  costPrice: number;
  sellingPrice: number;
  imageUrl: string;
  volumeOrSize?: string;
  description?: string;
}

export type LogType = 'restock' | 'sale' | 'adjustment' | 'damaged';

export interface StockLog {
  id: string;
  date: string;
  timestamp?: number;
  productId: string;
  productName: string;
  type: LogType;
  quantityChange: number; // e.g. +20 or -2
  resultingStock: number;
  note?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface SaleRecord {
  id: string;
  date: string;
  timestamp?: number;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: string;
}
