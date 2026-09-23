export type NavigationTab = 
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'sales'
  | 'purchases'
  | 'customers'
  | 'suppliers'
  | 'expenses'
  | 'reports'
  | 'settings';

export type ProductCategory = 
  | 'Personal Fragrance'
  | 'Lip Care'
  | 'Hygiene'
  | 'Home & Car Fragrance';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  signature: string;
  volume: string;
  olfactoryNotes?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  maxStock: number;
  unitFormat: string;
  imageUrl: string;
  status: 'active' | 'low_stock' | 'out_of_stock' | 'inactive';
}

export type MovementType = 
  | 'Sale'
  | 'Stock Received'
  | 'Customer Return'
  | 'Damaged'
  | 'Lost'
  | 'Manual Adjustment';

export interface StockMovement {
  id: string;
  movementId: string;
  dateTime: string;
  productId: string;
  productName: string;
  sku: string;
  volume: string;
  type: MovementType;
  qtyChange: number; // e.g. -1 or +50
  prevStock: number;
  newStock: number;
  reason: string;
  referenceDoc: string;
  authorizedBy: string;
  authorizedRole: string;
  authorizerInitials: string;
  status: 'Verified' | 'Logged' | 'Alert Triggered' | 'Approved' | 'Restocked';
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  volume: string;
  unitPrice: number;
  quantity: number;
}

export interface SaleTransaction {
  id: string;
  saleNumber: string;
  customerName: string;
  customerPhone?: string;
  customerTier?: string;
  dateTime: string;
  items: SaleItem[];
  itemCountSummary: string;
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  paymentMethod: 'Mobile Money' | 'Card' | 'Cash' | 'Bank Transfer';
  status: 'Paid' | 'Pending' | 'Refunded';
  terminalId: string;
  cashierName: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: 'Gold Tier VIP' | 'Silver Client' | 'Platinum Atelier' | 'Standard Retail';
  discountPercent: number;
  lifetimeSpend: number;
  ordersCount: number;
  lastVisit: string;
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  activeOrders: number;
  rating: number;
  complianceDoc: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  itemsCount: number;
  totalAmount: number;
  status: 'Pending' | 'Shipped' | 'Received' | 'Quality Check';
  batchCode: string;
}

export interface ExpenseRecord {
  id: string;
  code: string;
  category: 'COGS (Oils & Bottles)' | 'Packaging & Boxes' | 'Atelier Rent & Utilities' | 'Marketing & Samples' | 'Staff Payroll';
  description: string;
  amount: number;
  date: string;
  recordedBy: string;
  status: 'Settled' | 'Approved' | 'Review';
}
