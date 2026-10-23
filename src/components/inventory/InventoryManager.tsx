import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { formatCurrency, formatPercent, downloadCSV } from '../../utils/formatters';
import {
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  SlidersHorizontal,
  Package,
  AlertTriangle,
  XCircle,
  Sliders,
} from 'lucide-react';
import { ProductModal } from './ProductModal';
import { StockAdjustModal } from './StockAdjustModal';
import { ThresholdConfigModal } from './ThresholdConfigModal';

export const InventoryManager: React.FC = () => {
  const { products, deleteProduct, settings, updateProduct, setGlobalReorderThreshold } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out' | 'in'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<Product | null>(null);
  const [stockAdjustInitialQty, setStockAdjustInitialQty] = useState<number | undefined>(undefined);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  // Active default threshold from settings
  const activeThreshold = settings.lowStockThresholdDefault || 8;

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Low stock and out-of-stock items
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock > 0 && p.stock <= p.minStockAlert);
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter(p => p.stock <= 0);
  }, [products]);

  const alertProducts = useMemo(() => {
    return products.filter(p => p.stock <= p.minStockAlert);
  }, [products]);

  // Aggregate replenishment calculation (Units & Capital in Naira)
  const totalReplenishmentNeeded = useMemo(() => {
    let units = 0;
    let cost = 0;
    alertProducts.forEach(p => {
      const deficit = Math.max(0, p.minStockAlert - p.stock);
      // Bring up to safety threshold plus small buffer of 5
      const targetQty = deficit > 0 ? deficit : 5;
      units += targetQty;
      cost += targetQty * p.costPrice;
    });
    return { units, cost };
  }, [alertProducts]);

  // KPIs
  const totalItemsCount = products.length;
  const totalCostValue = useMemo(() => {
    return products.reduce((acc, p) => acc + p.stock * p.costPrice, 0);
  }, [products]);

  const totalRetailValue = useMemo(() => {
    return products.reduce((acc, p) => acc + p.stock * p.sellingPrice, 0);
  }, [products]);

  const lowStockCount = lowStockProducts.length;
  const outOfStockCount = outOfStockProducts.length;

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (categoryFilter !== 'All' && p.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'out' && p.stock > 0) return false;
      if (statusFilter === 'low' && (p.stock > p.minStockAlert)) return false;
      if (statusFilter === 'in' && p.stock <= p.minStockAlert) return false;

      // Text query
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, categoryFilter, statusFilter, searchQuery]);

  // Quick Threshold Stepper
  const handleQuickThresholdStep = (delta: number) => {
    const newVal = Math.max(1, activeThreshold + delta);
    setGlobalReorderThreshold(newVal, false);
  };

  // Quick Reorder Action
  const handleQuickReorder = (product: Product) => {
    const deficit = Math.max(1, product.minStockAlert - product.stock);
    setStockAdjustProduct(product);
    setStockAdjustInitialQty(deficit);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Barcode',
      'Product Name',
      'Category',
      'Unit',
      'Current Stock',
      'Reorder Threshold',
      'Stock Alert Status',
      'Units Deficit',
      'Cost Price (NGN)',
      'Selling Price (NGN)',
      'Total Asset Cost',
      'Total Asset Retail',
    ];

    const rows = products.map(p => {
      const isOut = p.stock <= 0;
      const isLow = p.stock > 0 && p.stock <= p.minStockAlert;
      const status = isOut ? 'Out of Stock' : isLow ? 'Low Stock Alert' : 'Normal';
      const deficit = Math.max(0, p.minStockAlert - p.stock);

      return [
        p.sku,
        p.barcode,
        p.name,
        p.category,
        p.unit,
        String(p.stock),
        String(p.minStockAlert),
        status,
        String(deficit),
        p.costPrice.toFixed(2),
        p.sellingPrice.toFixed(2),
        (p.stock * p.costPrice).toFixed(2),
        (p.stock * p.sellingPrice).toFixed(2),
      ];
    });

    downloadCSV(
      `inventory_catalog_${new Date().toISOString().slice(0, 10)}.csv`,
      [headers, ...rows]
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-display">
            Inventory Management
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Monitor stock levels, reorder alerts in Naira ({settings.currencySymbol}), wholesale valuation, and profit margins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsThresholdModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer shadow-2xs"
            title="Configure global reorder threshold"
          >
            <Sliders className="w-3.5 h-3.5 text-neutral-600" />
            <span>Configure Threshold (≤{activeThreshold})</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsAddEditModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Catalog Items</div>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {totalItemsCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Distinct SKUs listed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Inventory Wholesale Value</div>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {formatCurrency(totalCostValue, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Total stock purchase cost</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Retail Potential Value</div>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
            {formatCurrency(totalRetailValue, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            Gross potential: {formatCurrency(totalRetailValue - totalCostValue, settings.currencySymbol)}
          </div>
        </div>

        {/* Low Stock Alerts Card (Clickable Filter) */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'low'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-neutral-200 hover:border-amber-300 shadow-2xs'
          }`}
        >
          <div className="text-xs text-neutral-500 font-medium flex items-center justify-between">
            <span className="font-semibold text-neutral-800">Low Stock Alerts</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${lowStockCount > 0 ? 'text-amber-600' : 'text-neutral-400'}`} />
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums mt-1 ${
            lowStockCount > 0 ? 'text-amber-600' : 'text-neutral-900'
          }`}>
            {lowStockCount}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            ≤{activeThreshold} units threshold · Click to filter
          </div>
        </button>

        {/* Out of Stock Card (Clickable Filter) */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'out' ? 'all' : 'out')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer col-span-2 md:col-span-1 ${
            statusFilter === 'out'
              ? 'bg-red-50/80 border-red-300 ring-2 ring-red-400'
              : 'bg-white border-neutral-200 hover:border-red-300 shadow-2xs'
          }`}
        >
          <div className="text-xs text-neutral-500 font-medium flex items-center justify-between">
            <span className="font-semibold text-neutral-800">Out of Stock</span>
            <XCircle className={`w-3.5 h-3.5 ${outOfStockCount > 0 ? 'text-red-600' : 'text-neutral-400'}`} />
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums mt-1 ${
            outOfStockCount > 0 ? 'text-red-600' : 'text-neutral-900'
          }`}>
            {outOfStockCount}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            0 units remaining · Click to filter
          </div>
        </button>
      </div>

      {/* DEDICATED LOW STOCK ALERT BANNER */}
      {alertProducts.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-4 shadow-xs animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-amber-950 text-sm font-display">
                    Low Stock Alert Triggered ({alertProducts.length} items below reorder threshold)
                  </h3>
                </div>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Active reorder threshold is set at <strong>≤{activeThreshold} units</strong>. A total deficit of{' '}
                  <strong>{totalReplenishmentNeeded.units} units</strong> is required to return all items to safe inventory levels.
                </p>
                <div className="text-xs font-mono font-semibold text-amber-950 mt-1">
                  Estimated Restock Capital Required: {formatCurrency(totalReplenishmentNeeded.cost, settings.currencySymbol)}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons on Alert Banner */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
                  statusFilter === 'low'
                    ? 'bg-amber-900 text-white border-amber-900 shadow-xs'
                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100/60'
                }`}
              >
                {statusFilter === 'low' ? 'Show All Products' : `View Low Stock Items (${lowStockCount})`}
              </button>

              <button
                onClick={() => setIsThresholdModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium text-amber-950 bg-amber-100/80 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer"
              >
                Tweak Threshold
              </button>
            </div>
          </div>

          {/* Quick Item Deficit Chips */}
          <div className="mt-3 pt-3 border-t border-amber-200/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] text-amber-800 font-semibold uppercase tracking-wider shrink-0">
              Needs Attention:
            </span>
            {alertProducts.map(item => {
              const deficit = Math.max(0, item.minStockAlert - item.stock);
              const isOut = item.stock <= 0;
              return (
                <button
                  key={item.id}
                  onClick={() => handleQuickReorder(item)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer border ${
                    isOut
                      ? 'bg-red-100/90 text-red-900 border-red-300 hover:bg-red-200'
                      : 'bg-white text-neutral-800 border-amber-300 hover:bg-amber-100'
                  }`}
                  title={`Click to reorder ${item.name}`}
                >
                  <span className="font-semibold">{item.name}</span>
                  <span className="font-mono text-[10px] text-amber-900">
                    ({item.stock}/{item.minStockAlert} {item.unit})
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 ml-0.5">
                    +{deficit || 5}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar with Configurable Reorder Threshold Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products by title, SKU, barcode, or category..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* Status Filter Tabs (Buttons) */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All ({totalItemsCount})
            </button>
            <button
              onClick={() => setStatusFilter('low')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === 'low'
                  ? 'bg-amber-500 text-white shadow-2xs font-bold'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Low Stock ({lowStockCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('out')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === 'out'
                  ? 'bg-red-600 text-white shadow-2xs font-bold'
                  : 'text-red-700 hover:text-red-900'
              }`}
            >
              <XCircle className="w-3 h-3" />
              <span>Out of Stock ({outOfStockCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('in')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'in'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Adequate Stock
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none cursor-pointer"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Configurable Threshold Stepper Strip */}
        <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">Store Reorder Threshold:</span>
            <div className="flex items-center gap-1 bg-neutral-100 border border-neutral-200 rounded-md p-0.5 font-mono">
              <button
                type="button"
                onClick={() => handleQuickThresholdStep(-1)}
                className="w-5 h-5 flex items-center justify-center bg-white rounded text-neutral-700 hover:bg-neutral-200 cursor-pointer font-bold"
                title="Decrease threshold"
              >
                -
              </button>
              <span className="px-2 font-bold text-neutral-900 tabular-nums">
                ≤{activeThreshold} units
              </span>
              <button
                type="button"
                onClick={() => handleQuickThresholdStep(1)}
                className="w-5 h-5 flex items-center justify-center bg-white rounded text-neutral-700 hover:bg-neutral-200 cursor-pointer font-bold"
                title="Increase threshold"
              >
                +
              </button>
            </div>
            <span className="text-[11px] text-neutral-400 hidden sm:inline">
              (Adjusting updates alert triggers in real time)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setIsThresholdModalOpen(true)}
              className="text-neutral-700 hover:text-neutral-950 underline font-medium cursor-pointer"
            >
              Configure &amp; Apply Threshold to All Products
            </button>
          </div>
        </div>
      </div>

      {/* Products Table with Enhanced Alert Highlighting */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-semibold">
                <th className="py-3 px-4">Item &amp; Identifiers</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Stock Level &amp; Alerts</th>
                <th className="py-3 px-4 text-center">Reorder Threshold</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Retail Price</th>
                <th className="py-3 px-4 text-right">Gross Margin</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map(p => {
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= p.minStockAlert;
                const isAlertTriggered = isOutOfStock || isLowStock;
                const deficit = Math.max(0, p.minStockAlert - p.stock);
                const profitPerUnit = p.sellingPrice - p.costPrice;
                const marginPercent = p.sellingPrice > 0 ? (profitPerUnit / p.sellingPrice) * 100 : 0;

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors group ${
                      isOutOfStock
                        ? 'bg-red-50/60 hover:bg-red-50/80 border-l-4 border-red-500'
                        : isLowStock
                        ? 'bg-amber-50/60 hover:bg-amber-50/80 border-l-4 border-amber-500'
                        : 'hover:bg-neutral-50/60'
                    }`}
                  >
                    {/* Item Name & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {isOutOfStock ? (
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        ) : isLowStock ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : null}
                        <div>
                          <div className="font-semibold text-neutral-900">{p.name}</div>
                          <div className="text-[11px] text-neutral-500 font-mono space-x-1.5 mt-0.5">
                            <span>SKU: {p.sku}</span>
                            <span aria-hidden="true">·</span>
                            <span>UPC: {p.barcode}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-neutral-600">
                      <span>{p.category}</span>
                    </td>

                    {/* Stock status with prominent deficit highlighting */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                        {p.stock} <span className="font-normal text-neutral-500 text-xs">{p.unit}</span>
                      </div>

                      {/* Explicit Text Alert Label */}
                      <div className="text-[11px] mt-0.5 font-medium">
                        {isOutOfStock ? (
                          <div className="text-red-700 font-bold flex items-center justify-center gap-1">
                            <span>OUT OF STOCK</span>
                            <span className="font-normal text-[10px]">(-{deficit || activeThreshold} needed)</span>
                          </div>
                        ) : isLowStock ? (
                          <div className="text-amber-800 font-semibold flex items-center justify-center gap-1">
                            <span>LOW STOCK ALERT</span>
                            <span className="text-[10px] text-amber-900">(-{deficit} needed)</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 font-normal">Normal Stock</span>
                        )}
                      </div>
                    </td>

                    {/* Configurable Reorder Threshold for this product */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      <div className="inline-flex items-center gap-1 bg-white border border-neutral-200 rounded px-1.5 py-0.5 shadow-2xs">
                        <span className="text-xs font-semibold text-neutral-800 tabular-nums">
                          ≤{p.minStockAlert} {p.unit}
                        </span>
                        <button
                          onClick={() => {
                            const newMin = prompt(
                              `Set reorder alert threshold for "${p.name}":`,
                              String(p.minStockAlert)
                            );
                            if (newMin !== null) {
                              const parsed = Math.max(1, Math.floor(Number(newMin) || 1));
                              updateProduct(p.id, { minStockAlert: parsed });
                            }
                          }}
                          className="text-neutral-400 hover:text-neutral-800 p-0.5"
                          title="Change alert threshold for this item"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </td>

                    {/* Cost in Naira */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-600">
                      {formatCurrency(p.costPrice, settings.currencySymbol)}
                    </td>

                    {/* Retail Price in Naira */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-neutral-900">
                      {formatCurrency(p.sellingPrice, settings.currencySymbol)}
                    </td>

                    {/* Margin */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <div className="font-medium text-neutral-900">
                        {formatCurrency(profitPerUnit, settings.currencySymbol)}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {formatPercent(marginPercent)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* High-priority Restock Button for Low Stock Alert items */}
                        {isAlertTriggered ? (
                          <button
                            onClick={() => handleQuickReorder(p)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                            title={`Add stock to reach threshold (Deficit: ${deficit})`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>Restock (+{deficit || 5})</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setStockAdjustProduct(p);
                              setStockAdjustInitialQty(10);
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors cursor-pointer flex items-center gap-1"
                            title="Quick stock adjustment"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            <span>Adjust</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsAddEditModalOpen(true);
                          }}
                          className="p-1 text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer rounded"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer rounded"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-neutral-500">
            <Package className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-medium">No inventory items matched your filter</p>
            <p className="text-xs text-neutral-400 mt-1">
              Try resetting your search query or adjusting your stock filter.
            </p>
          </div>
        )}
      </div>

      {/* Product Add / Edit Modal */}
      {isAddEditModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setIsAddEditModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Stock Adjustment Modal */}
      {stockAdjustProduct && (
        <StockAdjustModal
          product={stockAdjustProduct}
          initialQuantity={stockAdjustInitialQty}
          initialType="add"
          initialReason="Supplier Restock"
          onClose={() => {
            setStockAdjustProduct(null);
            setStockAdjustInitialQty(undefined);
          }}
        />
      )}

      {/* Threshold Configuration Modal */}
      {isThresholdModalOpen && (
        <ThresholdConfigModal
          onClose={() => setIsThresholdModalOpen(false)}
        />
      )}
    </div>
  );
};
