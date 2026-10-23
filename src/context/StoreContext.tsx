import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Sale, Expense, StoreSettings, ActiveTab, SaleItem } from '../types';
import { defaultSettings, initialProducts, generateSeedSalesAndExpenses } from '../data/mockData';

interface StoreContextType {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  settings: StoreSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeReceipt: Sale | null;
  setActiveReceipt: (sale: Sale | null) => void;

  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number, reason?: string) => void;

  // Sales Actions
  completeSale: (saleData: {
    items: SaleItem[];
    discount: number;
    paymentMethod: 'cash' | 'card' | 'mobile_transfer';
    amountTendered: number;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    cashierName?: string;
  }) => Sale;
  voidSale: (saleId: string) => void;

  // Expenses Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Settings Actions
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  setGlobalReorderThreshold: (threshold: number, applyToAllProducts?: boolean) => void;

  // Maintenance & Portability
  resetToSampleData: () => void;
  clearAllData: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonString: string) => boolean;
}

const STORAGE_KEY_PRODUCTS = 'cornerstone_retail_products_v1';
const STORAGE_KEY_SALES = 'cornerstone_retail_sales_v1';
const STORAGE_KEY_EXPENSES = 'cornerstone_retail_expenses_v1';
const STORAGE_KEY_SETTINGS = 'cornerstone_retail_settings_v1';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);

  // Settings state (defaults to Naira ₦)
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...defaultSettings,
          ...parsed,
          currencySymbol: parsed.currencySymbol === '$' ? '₦' : (parsed.currencySymbol || '₦'),
        };
      }
    } catch {
      // fallback
    }
    return defaultSettings;
  });

  // Products state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return initialProducts;
  });

  // Sales and Expenses states
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SALES);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    const seed = generateSeedSalesAndExpenses();
    return seed.sales;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EXPENSES);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    const seed = generateSeedSalesAndExpenses();
    return seed.expenses;
  });

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products:', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales));
    } catch (e) {
      console.error('Failed to save sales:', e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses:', e);
    }
  }, [expenses]);

  // Product Methods
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const adjustStock = (id: string, delta: number, _reason?: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  // Sales Methods
  const completeSale = (saleData: {
    items: SaleItem[];
    discount: number;
    paymentMethod: 'cash' | 'card' | 'mobile_transfer';
    amountTendered: number;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    cashierName?: string;
  }): Sale => {
    let subtotal = 0;
    let totalCost = 0;

    saleData.items.forEach(item => {
      subtotal += item.total;
      totalCost += item.costPrice * item.quantity;
    });

    subtotal = Number(subtotal.toFixed(2));
    totalCost = Number(totalCost.toFixed(2));

    const discountedSubtotal = Math.max(0, subtotal - (saleData.discount || 0));
    const taxRate = settings.taxEnabled ? settings.taxRatePercent : 0;
    const tax = Number(((discountedSubtotal * taxRate) / 100).toFixed(2));
    const total = Number((discountedSubtotal + tax).toFixed(2));
    const grossProfit = Number((discountedSubtotal - totalCost).toFixed(2));

    let changeGiven = 0;
    if (saleData.paymentMethod === 'cash') {
      changeGiven = Math.max(0, Number((saleData.amountTendered - total).toFixed(2)));
    }

    const nextReceiptNum = `REC-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      receiptNumber: nextReceiptNum,
      items: saleData.items,
      subtotal,
      tax,
      taxRatePercent: taxRate,
      discount: saleData.discount || 0,
      total,
      totalCost,
      grossProfit,
      paymentMethod: saleData.paymentMethod,
      amountTendered: saleData.amountTendered,
      changeGiven,
      customerName: saleData.customerName,
      customerPhone: saleData.customerPhone,
      notes: saleData.notes,
      cashierName: saleData.cashierName || 'Cashier Desk 1',
      timestamp: nowIso,
    };

    // Deduct stock from inventory
    setProducts(prev => {
      const updated = [...prev];
      saleData.items.forEach(soldItem => {
        const prodIndex = updated.findIndex(p => p.id === soldItem.productId);
        if (prodIndex !== -1) {
          const prod = updated[prodIndex];
          const updatedStock = Math.max(0, prod.stock - soldItem.quantity);
          updated[prodIndex] = {
            ...prod,
            stock: updatedStock,
            updatedAt: nowIso,
          };
        }
      });
      return updated;
    });

    // Record sale
    setSales(prev => [newSale, ...prev]);

    // Set active receipt modal
    setActiveReceipt(newSale);

    return newSale;
  };

  const voidSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    // Restore stock
    setProducts(prev => {
      const updated = [...prev];
      sale.items.forEach(soldItem => {
        const prodIndex = updated.findIndex(p => p.id === soldItem.productId);
        if (prodIndex !== -1) {
          const prod = updated[prodIndex];
          updated[prodIndex] = {
            ...prod,
            stock: prod.stock + soldItem.quantity,
            updatedAt: new Date().toISOString(),
          };
        }
      });
      return updated;
    });

    // Remove sale
    setSales(prev => prev.filter(s => s.id !== saleId));
  };

  // Expense Methods
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setGlobalReorderThreshold = (threshold: number, applyToAllProducts: boolean = false) => {
    const validThreshold = Math.max(1, Math.floor(threshold));
    setSettings(prev => ({ ...prev, lowStockThresholdDefault: validThreshold }));

    if (applyToAllProducts) {
      const nowIso = new Date().toISOString();
      setProducts(prev =>
        prev.map(p => ({
          ...p,
          minStockAlert: validThreshold,
          updatedAt: nowIso,
        }))
      );
    }
  };

  // Maintenance & Portability
  const resetToSampleData = () => {
    const seed = generateSeedSalesAndExpenses();
    setProducts(initialProducts);
    setSales(seed.sales);
    setExpenses(seed.expenses);
    setSettings(defaultSettings);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(initialProducts));
    localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(seed.sales));
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(seed.expenses));
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(defaultSettings));
  };

  const clearAllData = () => {
    setProducts([]);
    setSales([]);
    setExpenses([]);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_SALES);
    localStorage.removeItem(STORAGE_KEY_EXPENSES);
  };

  const exportDatabaseJSON = () => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      storeSettings: settings,
      products,
      sales,
      expenses,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cornerstone_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importDatabaseJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.products) && Array.isArray(data.sales) && Array.isArray(data.expenses)) {
        setProducts(data.products);
        setSales(data.sales);
        setExpenses(data.expenses);
        if (data.storeSettings) {
          setSettings(data.storeSettings);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        sales,
        expenses,
        settings,
        activeTab,
        setActiveTab,
        activeReceipt,
        setActiveReceipt,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        completeSale,
        voidSale,
        addExpense,
        updateExpense,
        deleteExpense,
        updateSettings,
        setGlobalReorderThreshold,
        resetToSampleData,
        clearAllData,
        exportDatabaseJSON,
        importDatabaseJSON,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
