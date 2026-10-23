import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ActiveTab } from '../../types';
import { ShoppingCart } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab } = useStore();

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'pos', label: 'POS Register' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'reports', label: 'Revenue Reports' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, single line text */}
        <button
          onClick={() => setActiveTab('pos')}
          className="text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 font-display hover:text-neutral-700 transition-colors cursor-pointer text-left"
        >
          Cornerstone Retail
        </button>

        {/* Zone 2: 4-5 concise single-line nav items */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-neutral-900 text-neutral-900 font-semibold'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Open Register</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar for small viewports */}
      <div className="md:hidden flex items-center overflow-x-auto border-t border-neutral-100 px-4 py-2 gap-2 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 bg-neutral-100 hover:bg-neutral-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
