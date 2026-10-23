import React, { useState } from 'react';
import { Product, ProductCategory } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';
import { X } from 'lucide-react';

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Groceries & Pantry',
  'Beverages',
  'Bakery & Deli',
  'Dairy & Eggs',
  'Snacks & Confectionery',
  'Household & Cleaning',
  'Personal Care',
  'Produce & Fresh',
];

const UNITS = ['pcs', 'bottle', 'pack', 'bag', 'box', 'carton', 'kg', 'loaf', 'bar', 'tube', 'jug'];

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addProduct, updateProduct, settings } = useStore();

  const isEditing = !!product;

  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || `SKU-${Date.now().toString().slice(-4)}`);
  const [barcode, setBarcode] = useState(
    product?.barcode || `${Math.floor(10000000000 + Math.random() * 90000000000)}`
  );
  const [category, setCategory] = useState<ProductCategory>(
    product?.category || 'Groceries & Pantry'
  );
  const [costPrice, setCostPrice] = useState<string>(
    product ? String(product.costPrice) : '2500'
  );
  const [sellingPrice, setSellingPrice] = useState<string>(
    product ? String(product.sellingPrice) : '5000'
  );
  const [stock, setStock] = useState<string>(
    product ? String(product.stock) : '20'
  );
  const [minStockAlert, setMinStockAlert] = useState<string>(
    product ? String(product.minStockAlert) : String(settings.lowStockThresholdDefault)
  );
  const [unit, setUnit] = useState(product?.unit || 'pcs');
  const [description, setDescription] = useState(product?.description || '');

  // Calculate live margin preview
  const numCost = Number(costPrice) || 0;
  const numPrice = Number(sellingPrice) || 0;
  const profitPerUnit = numPrice - numCost;
  const marginPercent = numPrice > 0 ? (profitPerUnit / numPrice) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Product name is required');
      return;
    }

    const payload = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      barcode: barcode.trim(),
      category,
      costPrice: Math.max(0, Number(costPrice) || 0),
      sellingPrice: Math.max(0, Number(sellingPrice) || 0),
      stock: Math.max(0, Math.floor(Number(stock) || 0)),
      minStockAlert: Math.max(0, Math.floor(Number(minStockAlert) || 0)),
      unit,
      description: description.trim() || undefined,
    };

    if (isEditing && product) {
      updateProduct(product.id, payload);
    } else {
      addProduct(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm font-display">
              {isEditing ? 'Edit Product Item' : 'Add New Inventory Item'}
            </h3>
            <p className="text-xs text-neutral-500">
              Provide wholesale costs, retail pricing, and alert thresholds.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Organic Whole Milk 1 Gallon"
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Unit of Measure
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SKU and Barcode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="e.g. DAI-001"
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Barcode / UPC
              </label>
              <input
                type="text"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                placeholder="e.g. 89012345678"
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              />
            </div>
          </div>

          {/* Pricing Row: Wholesale Cost, Selling Price, and Live Margin Preview */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Wholesale Cost Price ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={costPrice}
                  onChange={e => setCostPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Retail Selling Price ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={sellingPrice}
                  onChange={e => setSellingPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
                />
              </div>
            </div>

            {/* Margin Calculation Preview */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-200">
              <span className="text-neutral-500">Gross Margin Preview:</span>
              <div className="space-x-2 font-mono">
                <span className="text-neutral-700 font-medium">
                  Profit: {formatCurrency(profitPerUnit, settings.currencySymbol)}
                </span>
                <span className="text-neutral-400">·</span>
                <span className={`font-semibold ${marginPercent >= 25 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {marginPercent.toFixed(1)}% margin
                </span>
              </div>
            </div>
          </div>

          {/* Inventory Stock & Min Alert */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Current Stock Level
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={e => setStock(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                min="0"
                required
                value={minStockAlert}
                onChange={e => setMinStockAlert(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Description / Supplier Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Supplier pack of 12, delivered every Tuesday"
              className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
            />
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
            >
              {isEditing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
