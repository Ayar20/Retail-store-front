import React from 'react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, formatPercent, downloadCSV } from '../../utils/formatters';
import { Printer, Download, X } from 'lucide-react';

interface IncomeStatementModalProps {
  title: string;
  periodLabel: string;
  grossSales: number;
  discounts: number;
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: Record<string, number>;
  totalExpenses: number;
  netProfit: number;
  transactionsCount: number;
  totalUnitsSold: number;
  onClose: () => void;
}

export const IncomeStatementModal: React.FC<IncomeStatementModalProps> = ({
  title,
  periodLabel,
  grossSales,
  discounts,
  netRevenue,
  cogs,
  grossProfit,
  operatingExpenses,
  totalExpenses,
  netProfit,
  transactionsCount,
  totalUnitsSold,
  onClose,
}) => {
  const { settings } = useStore();

  const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const netMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;
  const avgBasket = transactionsCount > 0 ? netRevenue / transactionsCount : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = [
      ['INCOME STATEMENT / PROFIT & LOSS REPORT'],
      ['Store:', settings.storeName],
      ['Period:', periodLabel],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['FINANCIAL LINE ITEM', `AMOUNT (${settings.currencySymbol})`],
      ['Gross Sales', grossSales.toFixed(2)],
      ['Less: Discounts & Concessions', (-discounts).toFixed(2)],
      ['Net Sales Revenue', netRevenue.toFixed(2)],
      ['Less: Cost of Goods Sold (COGS)', (-cogs).toFixed(2)],
      ['Gross Profit', grossProfit.toFixed(2)],
      ['Gross Profit Margin (%)', `${grossMargin.toFixed(2)}%`],
      [''],
      ['OPERATING EXPENSES'],
      ...Object.entries(operatingExpenses).map(([cat, amt]) => [
        `  ${cat}`,
        amt.toFixed(2),
      ]),
      ['Total Operating Expenses', totalExpenses.toFixed(2)],
      [''],
      ['NET OPERATING PROFIT / (LOSS)', netProfit.toFixed(2)],
      ['Net Profit Margin (%)', `${netMargin.toFixed(2)}%`],
      [''],
      ['OPERATIONAL METRICS'],
      ['Completed Transactions', String(transactionsCount)],
      ['Total Items/Units Sold', String(totalUnitsSold)],
      ['Average Basket Size', avgBasket.toFixed(2)],
    ];

    downloadCSV(
      `income_statement_${periodLabel.replace(/\s+/g, '_')}.csv`,
      rows
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header (Screen only) */}
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between no-print">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm font-display">
              Formal Income Statement (P&amp;L)
            </h3>
            <p className="text-xs text-neutral-500">{periodLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Statement Document */}
        <div className="p-8 overflow-y-auto max-h-[75vh] space-y-6">
          {/* Document Heading */}
          <div className="text-center pb-4 border-b border-neutral-200">
            <h2 className="text-xl font-bold font-display text-neutral-900 tracking-tight">
              {settings.storeName}
            </h2>
            <div className="text-sm font-semibold text-neutral-700 mt-1 uppercase tracking-wider">
              Statement of Income &amp; Expenses
            </div>
            <div className="text-xs text-neutral-500 mt-0.5 font-mono">
              Period: {periodLabel}
            </div>
          </div>

          {/* Core P&L Table */}
          <div className="space-y-4 font-mono text-xs">
            {/* Section 1: Revenue */}
            <div>
              <div className="font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-300 pb-1 mb-2 font-display">
                1. Revenue &amp; Sales
              </div>
              <div className="space-y-1.5 pl-3">
                <div className="flex justify-between text-neutral-600">
                  <span>Gross Sales</span>
                  <span className="tabular-nums font-medium text-neutral-900">
                    {formatCurrency(grossSales, settings.currencySymbol)}
                  </span>
                </div>
                {discounts > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Less: Discounts Allowed</span>
                    <span className="tabular-nums text-red-600">
                      -{formatCurrency(discounts, settings.currencySymbol)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-neutral-900 pt-1 border-t border-neutral-200">
                  <span>Net Sales Revenue</span>
                  <span className="tabular-nums">
                    {formatCurrency(netRevenue, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Cost of Goods Sold */}
            <div>
              <div className="font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-300 pb-1 mb-2 font-display">
                2. Cost of Goods Sold (COGS)
              </div>
              <div className="space-y-1.5 pl-3">
                <div className="flex justify-between text-neutral-600">
                  <span>Wholesale Inventory Cost of Items Sold</span>
                  <span className="tabular-nums text-neutral-900">
                    {formatCurrency(cogs, settings.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-neutral-900 pt-1 border-t border-neutral-200 bg-neutral-50/80 p-2 rounded">
                  <span>Gross Profit</span>
                  <div className="space-x-3 text-right">
                    <span className="tabular-nums">
                      {formatCurrency(grossProfit, settings.currencySymbol)}
                    </span>
                    <span className="text-emerald-700 font-semibold text-[11px]">
                      ({formatPercent(grossMargin)} margin)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Operating Expenses */}
            <div>
              <div className="font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-300 pb-1 mb-2 font-display">
                3. Operating Expenses
              </div>
              <div className="space-y-1.5 pl-3">
                {Object.keys(operatingExpenses).length === 0 ? (
                  <div className="text-neutral-400 italic">No expenses recorded for this period</div>
                ) : (
                  Object.entries(operatingExpenses).map(([category, amt]) => (
                    <div key={category} className="flex justify-between text-neutral-600">
                      <span>{category}</span>
                      <span className="tabular-nums text-neutral-900">
                        {formatCurrency(amt, settings.currencySymbol)}
                      </span>
                    </div>
                  ))
                )}
                <div className="flex justify-between font-bold text-neutral-900 pt-1 border-t border-neutral-200">
                  <span>Total Operating Expenses</span>
                  <span className="tabular-nums">
                    {formatCurrency(totalExpenses, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4: Net Operating Profit */}
            <div className="pt-2">
              <div className="p-3 bg-neutral-900 text-white rounded-lg flex justify-between items-baseline font-mono">
                <div>
                  <div className="font-bold text-sm uppercase">Net Operating Profit / (Loss)</div>
                  <div className="text-[11px] text-neutral-400">
                    Net Margin: {formatPercent(netMargin)}
                  </div>
                </div>
                <div className={`text-lg font-bold tabular-nums ${
                  netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {formatCurrency(netProfit, settings.currencySymbol)}
                </div>
              </div>
            </div>

            {/* Section 5: Key Store Operational Ratios */}
            <div className="pt-2">
              <div className="font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-300 pb-1 mb-2 font-display">
                4. Activity &amp; Throughput
              </div>
              <div className="grid grid-cols-3 gap-3 text-center pl-1">
                <div className="p-2 border border-neutral-200 rounded">
                  <div className="text-neutral-500 text-[10px]">Total Sales</div>
                  <div className="font-bold text-neutral-900 mt-0.5">{transactionsCount} orders</div>
                </div>
                <div className="p-2 border border-neutral-200 rounded">
                  <div className="text-neutral-500 text-[10px]">Units Sold</div>
                  <div className="font-bold text-neutral-900 mt-0.5">{totalUnitsSold} items</div>
                </div>
                <div className="p-2 border border-neutral-200 rounded">
                  <div className="text-neutral-500 text-[10px]">Avg Basket Size</div>
                  <div className="font-bold text-neutral-900 mt-0.5">
                    {formatCurrency(avgBasket, settings.currencySymbol)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Screen Only) */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statement</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
