import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/common/Navbar';
import { POSRegister } from './components/pos/POSRegister';
import { InventoryManager } from './components/inventory/InventoryManager';
import { ExpensesManager } from './components/expenses/ExpensesManager';
import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { SettingsManager } from './components/settings/SettingsManager';
import { ReceiptModal } from './components/pos/ReceiptModal';

const AppContent: React.FC = () => {
  const { activeTab, activeReceipt, setActiveReceipt, settings } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Top Bar Navigation adhering to 3-zone contract */}
      <Navbar />

      {/* Main Viewport */}
      <main className="flex-1 pb-12">
        {activeTab === 'pos' && <POSRegister />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'expenses' && <ExpensesManager />}
        {activeTab === 'reports' && <ReportsDashboard />}
        {activeTab === 'settings' && <SettingsManager />}
      </main>

      {/* Global Receipt Modal (e.g. from POS checkout) */}
      {activeReceipt && (
        <ReceiptModal
          sale={activeReceipt}
          onClose={() => setActiveReceipt(null)}
          isNewSale={true}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            <span className="font-semibold text-neutral-800">{settings.storeName}</span>
            <span className="mx-2">·</span>
            <span>Retail Operations &amp; Financial Ledger</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Local Database Active</span>
            <span aria-hidden="true">·</span>
            <span>Currency: {settings.currencySymbol}</span>
            <span aria-hidden="true">·</span>
            <span>Tax: {settings.taxEnabled ? `${settings.taxRatePercent}%` : 'Exempt'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
