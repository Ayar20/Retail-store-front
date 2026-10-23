import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { X, Plus, Minus } from 'lucide-react';

interface StockAdjustModalProps {
  product: Product;
  initialQuantity?: number;
  initialType?: 'add' | 'remove';
  initialReason?: string;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  product,
  initialQuantity,
  initialType = 'add',
  initialReason,
  onClose,
}) => {
  const { adjustStock } = useStore();
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>(initialType);
  const [quantity, setQuantity] = useState<string>(
    initialQuantity ? String(initialQuantity) : '10'
  );
  const [reason, setReason] = useState<string>(
    initialReason || (initialType === 'add' ? 'Supplier Restock' : 'Damaged / Broken in Store')
  );

  const reasonsAdd = [
    'Supplier Restock',
    'Customer Return',
    'Inventory Count Discrepancy (+)',
    'Transfer In',
    'Found Stock',
  ];

  const reasonsRemove = [
    'Damaged / Broken in Store',
    'Expired / Spoiled Goods',
    'Inventory Count Discrepancy (-)',
    'Theft / Loss',
    'Store Sample / Demo Use',
  ];

  const currentReasons = adjustmentType === 'add' ? reasonsAdd : reasonsRemove;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Math.max(1, Math.floor(Number(quantity) || 0));
    const delta = adjustmentType === 'add' ? qty : -qty;

    adjustStock(product.id, delta, reason);
    onClose();
  };

  const parsedQty = Math.max(0, Math.floor(Number(quantity) || 0));
  const newProjectedStock =
    adjustmentType === 'add'
      ? product.stock + parsedQty
      : Math.max(0, product.stock - parsedQty);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm font-display">
              Adjust Stock Level
            </h3>
            <p className="text-xs text-neutral-500 font-mono mt-0.5">
              {product.name} ({product.sku})
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
          {/* Current Stock Banner */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500">Current Stock</span>
              <div className="text-lg font-bold text-neutral-900 font-mono tabular-nums">
                {product.stock} {product.unit}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-500">Projected Stock</span>
              <div className="text-lg font-bold text-neutral-900 font-mono tabular-nums">
                {newProjectedStock} {product.unit}
              </div>
            </div>
          </div>

          {/* Action Type: Add vs Remove */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('add');
                  setReason('Supplier Restock');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  adjustmentType === 'add'
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stock (+)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('remove');
                  setReason('Damaged / Broken in Store');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  adjustmentType === 'remove'
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Remove Stock (-)</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Quantity to {adjustmentType === 'add' ? 'Add' : 'Remove'} ({product.unit})
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Reason for Adjustment
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
            >
              {currentReasons.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
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
              Apply Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
