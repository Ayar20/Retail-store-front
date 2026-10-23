export type ProductCategory =
  | 'Groceries & Pantry'
  | 'Beverages'
  | 'Bakery & Deli'
  | 'Dairy & Eggs'
  | 'Snacks & Confectionery'
  | 'Household & Cleaning'
  | 'Personal Care'
  | 'Produce & Fresh';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  costPrice: number;       // Wholesale cost to store (COGS)
  sellingPrice: number;    // Retail price charged to customer
  stock: number;           // Current inventory on hand
  minStockAlert: number;   // Low stock threshold
  unit: string;            // 'pcs', 'pack', 'kg', 'bottle', 'box'
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  sku: string;
  barcode?: string;
  name: string;
  category: ProductCategory;
  costPrice: number;
  unitPrice: number;
  quantity: number;
  total: number;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile_transfer';

export interface Sale {
  id: string;
  receiptNumber: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  taxRatePercent: number;
  discount: number;
  total: number;
  totalCost: number;
  grossProfit: number;
  paymentMethod: PaymentMethod;
  amountTendered: number;
  changeGiven: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  cashierName: string;
  timestamp: string; // ISO string
}

export type ExpenseCategory =
  | 'Rent & Lease'
  | 'Utilities & Power'
  | 'Inventory Restock'
  | 'Staff & Wages'
  | 'Packaging & Supplies'
  | 'Maintenance & Repairs'
  | 'Marketing & Ads'
  | 'Taxes & Licenses'
  | 'POS & Software Fees'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'card';
  payee: string;
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  currencySymbol: string;
  taxEnabled: boolean;
  taxRatePercent: number;
  lowStockThresholdDefault: number;
  receiptFooterNote: string;
}

export type ActiveTab = 'pos' | 'inventory' | 'expenses' | 'reports' | 'settings';
