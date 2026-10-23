import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';
import {
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  Store,
  DollarSign,
  Receipt,
  Database,
} from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToSampleData,
    clearAllData,
    exportDatabaseJSON,
    importDatabaseJSON,
  } = useStore();

  const [form, setForm] = useState<StoreSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabaseJSON(content);
        if (success) {
          alert('Database restored successfully!');
        } else {
          alert('Failed to parse backup file. Please ensure it is a valid Cornerstone JSON backup.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-display">
          Store &amp; Register Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Configure business details, currency, tax rates, thermal receipt layout, and data backups.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Store Identity */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Store className="w-4 h-4 text-neutral-700" />
            <h2 className="font-bold text-neutral-900 text-sm font-display">
              Store Identity &amp; Contact
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={e => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={e => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Currency & Sales Tax */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <DollarSign className="w-4 h-4 text-neutral-700" />
            <h2 className="font-bold text-neutral-900 text-sm font-display">
              Currency &amp; Sales Tax
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Currency Symbol
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={form.currencySymbol}
                  onChange={e => setForm({ ...form, currencySymbol: e.target.value })}
                  className="w-20 px-3 py-2 text-xs font-mono font-bold bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
                />
                <div className="flex items-center gap-1">
                  {['₦', '$', '£', '€', '₵'].map(sym => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setForm({ ...form, currencySymbol: sym })}
                      className={`px-2 py-1 text-xs font-bold rounded cursor-pointer transition-colors ${
                        form.currencySymbol === sym
                          ? 'bg-neutral-900 text-white shadow-2xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Sales Tax Status
              </label>
              <div className="flex items-center h-9">
                <label className="flex items-center gap-2 text-xs text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.taxEnabled}
                    onChange={e => setForm({ ...form, taxEnabled: e.target.checked })}
                    className="w-4 h-4 text-neutral-900 rounded border-neutral-300 focus:ring-neutral-900"
                  />
                  <span>Charge Sales Tax at Checkout</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                disabled={!form.taxEnabled}
                value={form.taxRatePercent}
                onChange={e => setForm({ ...form, taxRatePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none disabled:opacity-40"
              />
            </div>
          </div>
        </div>

        {/* 3. Receipts & Alerts */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Receipt className="w-4 h-4 text-neutral-700" />
            <h2 className="font-bold text-neutral-900 text-sm font-display">
              Receipt &amp; Alert Preferences
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Default Low Stock Alert Threshold
              </label>
              <input
                type="number"
                min="1"
                value={form.lowStockThresholdDefault}
                onChange={e => setForm({ ...form, lowStockThresholdDefault: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Receipt Footer Note
              </label>
              <input
                type="text"
                value={form.receiptFooterNote}
                onChange={e => setForm({ ...form, receiptFooterNote: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>

      {/* 4. Data Management & Portability */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4 mt-8">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
          <Database className="w-4 h-4 text-neutral-700" />
          <h2 className="font-bold text-neutral-900 text-sm font-display">
            Data Backup &amp; System Maintenance
          </h2>
        </div>

        <p className="text-xs text-neutral-500">
          Your inventory, sales transactions, and expense records are stored securely in local browser storage. You can backup your database to JSON or restore anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={exportDatabaseJSON}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Database (JSON)</span>
          </button>

          {/* Import JSON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restore Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Reload Sample Data */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset store to pre-loaded sample retail dataset (24 items, historical October sales & expenses)? Current changes will be replaced.')) {
                resetToSampleData();
                setForm({ ...settings });
                alert('Sample dataset reloaded!');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload Sample Retail Data</span>
          </button>

          {/* Clear All */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('WARNING: This will erase all inventory, sales, and expense records. Are you sure?')) {
                clearAllData();
                alert('All store records cleared.');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
