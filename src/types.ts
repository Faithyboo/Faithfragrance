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
  price: number; // unit price
  category?: string;
  discount?: number;
}

export type OrderStatus = 'Completed' | 'Pending' | 'Delivered' | 'Cancelled';

export interface SaleRecord {
  id: string;
  receiptNumber?: string;
  date: string;
  timestamp?: number;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: string;
  customerId?: string;
  customerName?: string;
  discount?: number;
  status?: OrderStatus;
  notes?: string;
}

export type CustomerStatus = 'Active' | 'Inactive';
export type PreferredContactMethod = 'WhatsApp' | 'Phone Call' | 'SMS' | 'Email';

export interface Customer {
  id: string; // Customer ID e.g. "CUST-1001"
  fullName: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  address: string;
  dateRegistered: string;
  status: CustomerStatus;
  notes: string;
  preferredContactMethod: PreferredContactMethod;
}
