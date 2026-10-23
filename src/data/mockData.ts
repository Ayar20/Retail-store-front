import { Product, Sale, Expense, StoreSettings } from '../types';

export const defaultSettings: StoreSettings = {
  storeName: 'Cornerstone Provisions & Retail',
  tagline: 'Fresh Goods, Daily Essentials & Local Quality',
  address: '428 Heritage Boulevard, Suite 101',
  phone: '(555) 382-9901',
  email: 'hello@cornerstonestore.com',
  currencySymbol: '₦',
  taxEnabled: true,
  taxRatePercent: 7.5,
  lowStockThresholdDefault: 8,
  receiptFooterNote: 'Thank you for shopping local! Returns accepted within 14 days with receipt.',
};

export const initialProducts: Product[] = [
  {
    id: 'prod-01',
    sku: 'BEV-001',
    barcode: '89012345601',
    name: 'Artisan Cold Brew Coffee',
    category: 'Beverages',
    costPrice: 2100,
    sellingPrice: 4500,
    stock: 24,
    minStockAlert: 10,
    unit: 'bottle',
    description: 'Single-origin Ethiopian roast, slow-steeped 18 hours',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-20T10:00:00.000Z',
  },
  {
    id: 'prod-02',
    sku: 'BEV-002',
    barcode: '89012345602',
    name: 'Sparkling Mineral Water 750ml',
    category: 'Beverages',
    costPrice: 1200,
    sellingPrice: 2500,
    stock: 48,
    minStockAlert: 15,
    unit: 'bottle',
    description: 'Naturally effervescent mountain spring water',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-20T10:00:00.000Z',
  },
  {
    id: 'prod-03',
    sku: 'BAK-001',
    barcode: '89012345603',
    name: 'Country Sourdough Loaf',
    category: 'Bakery & Deli',
    costPrice: 2400,
    sellingPrice: 5500,
    stock: 5, // Below reorder threshold!
    minStockAlert: 8,
    unit: 'loaf',
    description: 'Wild yeast sourdough baked fresh daily with stoneground flour',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-23T06:00:00.000Z',
  },
  {
    id: 'prod-04',
    sku: 'BAK-002',
    barcode: '89012345604',
    name: 'Almond Croissant 2-Pack',
    category: 'Bakery & Deli',
    costPrice: 2800,
    sellingPrice: 6200,
    stock: 12,
    minStockAlert: 6,
    unit: 'pack',
    description: 'All-butter flaky pastry filled with frangipane cream',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-22T06:00:00.000Z',
  },
  {
    id: 'prod-05',
    sku: 'DAI-001',
    barcode: '89012345605',
    name: 'Organic Whole Milk 1 Gallon',
    category: 'Dairy & Eggs',
    costPrice: 3200,
    sellingPrice: 5800,
    stock: 18,
    minStockAlert: 10,
    unit: 'jug',
    description: 'Pasteurized non-homogenized farm fresh whole milk',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-21T07:00:00.000Z',
  },
  {
    id: 'prod-06',
    sku: 'DAI-002',
    barcode: '89012345606',
    name: 'Pasture-Raised Brown Eggs (Dozen)',
    category: 'Dairy & Eggs',
    costPrice: 3500,
    sellingPrice: 6500,
    stock: 4, // Below reorder threshold!
    minStockAlert: 12,
    unit: 'carton',
    description: 'Grade A large brown eggs from free-roaming hens',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-23T07:00:00.000Z',
  },
  {
    id: 'prod-07',
    sku: 'DAI-003',
    barcode: '89012345607',
    name: 'Cultured Salted Butter 250g',
    category: 'Dairy & Eggs',
    costPrice: 2750,
    sellingPrice: 5200,
    stock: 22,
    minStockAlert: 8,
    unit: 'pack',
    description: 'European-style 84% butterfat with sea salt crystals',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z',
  },
  {
    id: 'prod-08',
    sku: 'GRO-001',
    barcode: '89012345608',
    name: 'Extra Virgin Olive Oil 500ml',
    category: 'Groceries & Pantry',
    costPrice: 8500,
    sellingPrice: 16900,
    stock: 15,
    minStockAlert: 5,
    unit: 'bottle',
    description: 'Cold-pressed early harvest Koroneiki olives',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-15T11:00:00.000Z',
  },
  {
    id: 'prod-09',
    sku: 'GRO-002',
    barcode: '89012345609',
    name: 'Organic Basmati Rice 2kg',
    category: 'Groceries & Pantry',
    costPrice: 4200,
    sellingPrice: 8750,
    stock: 30,
    minStockAlert: 10,
    unit: 'bag',
    description: 'Aged Himalayan long-grain fragrant rice',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-10T12:00:00.000Z',
  },
  {
    id: 'prod-10',
    sku: 'GRO-003',
    barcode: '89012345610',
    name: 'Artisanal Bronze-Cut Pasta 500g',
    category: 'Groceries & Pantry',
    costPrice: 1800,
    sellingPrice: 4250,
    stock: 35,
    minStockAlert: 12,
    unit: 'box',
    description: 'Rough surface extruded durum wheat semolina rigatoni',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-12T14:00:00.000Z',
  },
  {
    id: 'prod-11',
    sku: 'SNK-001',
    barcode: '89012345611',
    name: 'Kettle Cooked Sea Salt Chips',
    category: 'Snacks & Confectionery',
    costPrice: 1200,
    sellingPrice: 2950,
    stock: 28,
    minStockAlert: 10,
    unit: 'bag',
    description: 'Thick cut potato chips batch fried in avocado oil',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-19T09:00:00.000Z',
  },
  {
    id: 'prod-12',
    sku: 'SNK-002',
    barcode: '89012345612',
    name: 'Dark Chocolate Bar 72% Sea Salt',
    category: 'Snacks & Confectionery',
    costPrice: 2100,
    sellingPrice: 4800,
    stock: 3, // Below reorder threshold!
    minStockAlert: 8,
    unit: 'bar',
    description: 'Fair trade single-origin cacao with Maldon sea salt flakes',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-23T08:00:00.000Z',
  },
  {
    id: 'prod-13',
    sku: 'PRO-001',
    barcode: '89012345613',
    name: 'Honeycrisp Apples (Bag of 6)',
    category: 'Produce & Fresh',
    costPrice: 3100,
    sellingPrice: 6200,
    stock: 14,
    minStockAlert: 8,
    unit: 'bag',
    description: 'Crisp, juicy orchard-fresh apples',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-21T08:00:00.000Z',
  },
  {
    id: 'prod-14',
    sku: 'PRO-002',
    barcode: '89012345614',
    name: 'Organic Hass Avocados (4-Pack)',
    category: 'Produce & Fresh',
    costPrice: 2900,
    sellingPrice: 5900,
    stock: 0, // Out of stock & below threshold!
    minStockAlert: 6,
    unit: 'pack',
    description: 'Ripe and ready to eat rich creamy avocados',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-22T16:00:00.000Z',
  },
  {
    id: 'prod-15',
    sku: 'HOU-001',
    barcode: '89012345615',
    name: 'Plant-Based Dish Soap 500ml',
    category: 'Household & Cleaning',
    costPrice: 2200,
    sellingPrice: 4900,
    stock: 19,
    minStockAlert: 5,
    unit: 'bottle',
    description: 'Biodegradable lavender and tea tree grease-cutting formula',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-14T10:00:00.000Z',
  },
  {
    id: 'prod-16',
    sku: 'HOU-002',
    barcode: '89012345616',
    name: 'Recycled Paper Towels (2 Rolls)',
    category: 'Household & Cleaning',
    costPrice: 1900,
    sellingPrice: 3950,
    stock: 25,
    minStockAlert: 10,
    unit: 'pack',
    description: '100% unbleached post-consumer recycled absorbent paper',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-16T15:00:00.000Z',
  },
  {
    id: 'prod-17',
    sku: 'PER-001',
    barcode: '89012345617',
    name: 'Botanical Hand Wash 300ml',
    category: 'Personal Care',
    costPrice: 3800,
    sellingPrice: 8500,
    stock: 16,
    minStockAlert: 6,
    unit: 'bottle',
    description: 'Nourishing cedarwood, eucalyptus and vitamin E formula',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-11T13:00:00.000Z',
  },
  {
    id: 'prod-18',
    sku: 'PER-002',
    barcode: '89012345618',
    name: 'Natural Beeswax Lip Balm',
    category: 'Personal Care',
    costPrice: 1300,
    sellingPrice: 3500,
    stock: 42,
    minStockAlert: 12,
    unit: 'tube',
    description: 'Organic peppermint and coconut oil soothing balm',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-17T11:00:00.000Z',
  },
];

// Helper to generate realistic historical sales and expenses in Naira
export function generateSeedSalesAndExpenses(): { sales: Sale[]; expenses: Expense[] } {
  const sales: Sale[] = [];
  const expenses: Expense[] = [];

  // Today is 2026-10-23
  const baseDate = new Date('2026-10-23T10:30:00.000Z');

  // Generate 28 days of realistic sales (from Sep 26 to Oct 23)
  let receiptCounter = 1040;

  for (let daysAgo = 27; daysAgo >= 0; daysAgo--) {
    const dayDate = new Date(baseDate);
    dayDate.setDate(dayDate.getDate() - daysAgo);

    // Day of week: 0 is Sun, 6 is Sat. Weekends have more sales
    const dayOfWeek = dayDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isToday = daysAgo === 0;

    // Number of transactions today: 5 to 14 transactions per day
    const transactionsCount = isToday ? 6 : isWeekend ? 10 + (receiptCounter % 5) : 6 + (receiptCounter % 4);

    for (let t = 0; t < transactionsCount; t++) {
      receiptCounter++;

      // Spread timestamps between 8:30 AM and 8:30 PM
      const hour = 8 + Math.floor((t / transactionsCount) * 11) + (receiptCounter % 2);
      const minute = (receiptCounter * 17) % 60;
      const transTime = new Date(dayDate);
      transTime.setHours(hour, minute, 0, 0);

      // Pick 1 to 4 distinct items for this basket
      const itemCount = 1 + (receiptCounter % 3);
      const chosenProducts: Product[] = [];
      for (let i = 0; i < itemCount; i++) {
        const p = initialProducts[(receiptCounter + i * 3) % initialProducts.length];
        if (!chosenProducts.some(cp => cp.id === p.id)) {
          chosenProducts.push(p);
        }
      }

      let subtotal = 0;
      let totalCost = 0;
      const items = chosenProducts.map(p => {
        const qty = 1 + (receiptCounter % 2 === 0 && p.sellingPrice < 5000 ? 1 : 0);
        const itemTotal = Number((p.sellingPrice * qty).toFixed(2));
        const itemCost = Number((p.costPrice * qty).toFixed(2));
        subtotal += itemTotal;
        totalCost += itemCost;
        return {
          productId: p.id,
          sku: p.sku,
          barcode: p.barcode,
          name: p.name,
          category: p.category,
          costPrice: p.costPrice,
          unitPrice: p.sellingPrice,
          quantity: qty,
          total: itemTotal,
        };
      });

      subtotal = Number(subtotal.toFixed(2));
      totalCost = Number(totalCost.toFixed(2));

      // Occasional small discount (₦500 off)
      const discount = receiptCounter % 7 === 0 ? 500 : 0;
      const taxableAmount = Math.max(0, subtotal - discount);
      const tax = Number((taxableAmount * 0.075).toFixed(2));
      const total = Number((taxableAmount + tax).toFixed(2));
      const grossProfit = Number((subtotal - discount - totalCost).toFixed(2));

      const paymentMethods: ('cash' | 'card' | 'mobile_transfer')[] = ['card', 'cash', 'card', 'mobile_transfer', 'card'];
      const paymentMethod = paymentMethods[receiptCounter % paymentMethods.length];

      let amountTendered = total;
      let changeGiven = 0;
      if (paymentMethod === 'cash') {
        const bills = [500, 1000, 2000, 5000, 10000, 20000, 50000];
        amountTendered = bills.find(b => b >= total) || Math.ceil(total / 1000) * 1000;
        changeGiven = Number((amountTendered - total).toFixed(2));
      }

      sales.push({
        id: `sale-${receiptCounter}`,
        receiptNumber: `REC-${receiptCounter}`,
        items,
        subtotal,
        tax,
        taxRatePercent: 7.5,
        discount,
        total,
        totalCost,
        grossProfit,
        paymentMethod,
        amountTendered,
        changeGiven,
        customerName: receiptCounter % 4 === 0 ? `Customer #${100 + (receiptCounter % 50)}` : undefined,
        cashierName: receiptCounter % 2 === 0 ? 'Alex Rivera' : 'Jordan Smith',
        timestamp: transTime.toISOString(),
      });
    }
  }

  // Generate realistic operating expenses for October 2026 and prior in Naira
  expenses.push(
    {
      id: 'exp-01',
      date: '2026-10-01',
      category: 'Rent & Lease',
      description: 'Storefront Retail Lease - October 2026',
      amount: 450000.00,
      paymentMethod: 'bank_transfer',
      payee: 'Heritage Commercial Properties Ltd',
      referenceNo: 'RENT-OCT26',
      createdAt: '2026-10-01T09:00:00.000Z',
    },
    {
      id: 'exp-02',
      date: '2026-10-04',
      category: 'Utilities & Power',
      description: 'Electric & Commercial Generator Diesel / Grid Power',
      amount: 85400.00,
      paymentMethod: 'bank_transfer',
      payee: 'Metro Power & Energy Distribution',
      referenceNo: 'UTIL-8821',
      createdAt: '2026-10-04T11:00:00.000Z',
    },
    {
      id: 'exp-03',
      date: '2026-10-06',
      category: 'Inventory Restock',
      description: 'Artisan Beverage & Dairy Weekly Wholesale Restock',
      amount: 120000.00,
      paymentMethod: 'card',
      payee: 'Valley Organic Distributors',
      referenceNo: 'INV-4091',
      createdAt: '2026-10-06T14:30:00.000Z',
    },
    {
      id: 'exp-04',
      date: '2026-10-10',
      category: 'Packaging & Supplies',
      description: 'Biodegradable Kraft Shopping Bags & Thermal Paper Rolls',
      amount: 32500.00,
      paymentMethod: 'card',
      payee: 'EcoPack Supply Co.',
      referenceNo: 'SUP-1102',
      createdAt: '2026-10-10T10:15:00.000Z',
    },
    {
      id: 'exp-05',
      date: '2026-10-14',
      category: 'Inventory Restock',
      description: 'Pantry, Grains & Specialty Confectionery Wholesale Delivery',
      amount: 145000.00,
      paymentMethod: 'bank_transfer',
      payee: 'Summit Foodservice Co-op',
      referenceNo: 'INV-5519',
      createdAt: '2026-10-14T13:45:00.000Z',
    },
    {
      id: 'exp-06',
      date: '2026-10-15',
      category: 'Staff & Wages',
      description: 'Mid-Month Store Staff Payroll (2 Retail Associates)',
      amount: 280000.00,
      paymentMethod: 'bank_transfer',
      payee: 'Staff Payroll Disbursement',
      referenceNo: 'PAY-OCT-1',
      createdAt: '2026-10-15T09:00:00.000Z',
    },
    {
      id: 'exp-07',
      date: '2026-10-18',
      category: 'Maintenance & Repairs',
      description: 'Refrigerated Display Case Thermostat Calibration & Inverter Check',
      amount: 45000.00,
      paymentMethod: 'card',
      payee: 'CoolTech Commercial HVAC',
      referenceNo: 'SRV-3310',
      createdAt: '2026-10-18T16:00:00.000Z',
    },
    {
      id: 'exp-08',
      date: '2026-10-21',
      category: 'Inventory Restock',
      description: 'Fresh Bakery & Produce Mid-Week Replenishment',
      amount: 68500.00,
      paymentMethod: 'cash',
      payee: 'Greenway Farm Fresh Goods',
      referenceNo: 'INV-6022',
      createdAt: '2026-10-21T08:15:00.000Z',
    },
    {
      id: 'exp-09',
      date: '2026-10-22',
      category: 'POS & Software Fees',
      description: 'POS Terminal Network Gateway & Settlement Fee',
      amount: 15200.00,
      paymentMethod: 'card',
      payee: 'Payment Processing Network',
      referenceNo: 'FEE-9912',
      createdAt: '2026-10-22T23:00:00.000Z',
    },
    {
      id: 'exp-10',
      date: '2026-10-23',
      category: 'Miscellaneous',
      description: 'Store Sanitation, Sanitizers & Cleaning Essentials',
      amount: 12500.00,
      paymentMethod: 'cash',
      payee: 'Corner Hardware & Goods',
      referenceNo: 'RCP-0192',
      createdAt: '2026-10-23T09:30:00.000Z',
    }
  );

  return { sales, expenses };
}
