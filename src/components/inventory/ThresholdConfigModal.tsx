import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Sliders, CheckCircle2 } from 'lucide-react';

interface ThresholdConfigModalProps {
  onClose: () => void;
}

export const ThresholdConfigModal: React.FC<ThresholdConfigModalProps> = ({ onClose }) => {
  const { settings, products, setGlobalReorderThreshold } = useStore();

  const [threshold, setThreshold] = useState<number>(settings.lowStockThresholdDefault || 8);
  const [applyToAll, setApplyToAll] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState(false);

  // Calculate how many items will be low stock with this threshold
  const projectedLowCount = products.filter(
    p => p.stock > 0 && p.stock <= threshold
  ).length;

  const projectedOutCount = products.filter(p => p.stock === 0).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalReorderThreshold(threshold, applyToAll);
    setSuccessMsg(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-neutral-800" />
            <h3 className="font-bold text-neutral-900 text-sm font-display">
              Configure Reorder Threshold
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-neutral-600 leading-relaxed">
            The low stock alert triggers whenever an item&apos;s remaining inventory drops to or below this reorder threshold.
          </p>

          {/* Stepper / Input */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
            <label className="block text-xs font-semibold text-neutral-800">
              Minimum Safety Stock Level (Units)
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setThreshold(Math.max(1, threshold - 1))}
                className="w-10 h-10 bg-white border border-neutral-300 rounded-lg text-neutral-700 font-bold hover:bg-neutral-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                -
              </button>

              <input
                type="number"
                min="1"
                max="500"
                value={threshold}
                onChange={e => setThreshold(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                className="flex-1 text-center font-mono font-bold text-lg py-2 bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none tabular-nums"
              />

              <button
                type="button"
                onClick={() => setThreshold(threshold + 1)}
                className="w-10 h-10 bg-white border border-neutral-300 rounded-lg text-neutral-700 font-bold hover:bg-neutral-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                +
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-200">
              <span className="text-neutral-500 text-[11px]">Quick presets:</span>
              <div className="flex items-center gap-1.5">
                {[5, 8, 10, 15, 20].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setThreshold(val)}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded cursor-pointer transition-colors ${
                      threshold === val
                        ? 'bg-neutral-900 text-white font-bold'
                        : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Impact preview */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1">
            <div className="font-semibold text-amber-900">
              Alert Impact with Threshold = {threshold} units:
            </div>
            <div className="text-amber-800 text-[11px]">
              • <strong>{projectedLowCount}</strong> items currently have low stock (≤{threshold} units).
            </div>
            {projectedOutCount > 0 && (
              <div className="text-red-700 text-[11px]">
                • <strong>{projectedOutCount}</strong> items are completely out of stock.
              </div>
            )}
          </div>

          {/* Apply to existing products option */}
          <label className="flex items-start gap-2.5 text-xs text-neutral-800 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={applyToAll}
              onChange={e => setApplyToAll(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-neutral-900 rounded border-neutral-300 focus:ring-neutral-900"
            />
            <span>
              <strong>Apply to all existing catalog items ({products.length} products)</strong>
              <span className="block text-[11px] text-neutral-500 mt-0.5">
                Overwrites individual thresholds with {threshold} units for consistent store-wide monitoring.
              </span>
            </span>
          </label>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Threshold updated successfully!</span>
            </div>
          )}

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
              Save Alert Threshold
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
