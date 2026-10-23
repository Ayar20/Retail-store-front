import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Expense, ExpenseCategory } from '../../types';
import {
  formatCurrency,
  formatDate,
  downloadCSV,
  getStartOfWeek,
  getEndOfWeek,
  toDateInputValue,
} from '../../utils/formatters';
import {
  Plus,
  Search,
  Download,
  Receipt,
  Edit2,
  Trash2,
  CreditCard,
  Building,
  Banknote,
} from 'lucide-react';
import { ExpenseModal } from './ExpenseModal';

export const ExpensesManager: React.FC = () => {
  const { expenses, deleteExpense, settings } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'this_month' | 'this_week' | 'today'>('this_month');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Today reference
  const now = new Date('2026-10-23T10:30:00.000Z');
  const todayStr = toDateInputValue(now);
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(now);
  const currentMonthPrefix = todayStr.slice(0, 7); // '2026-10'

  // Categories list
  const categories: ExpenseCategory[] = [
    'Rent & Lease',
    'Utilities & Power',
    'Inventory Restock',
    'Staff & Wages',
    'Packaging & Supplies',
    'Maintenance & Repairs',
    'Marketing & Ads',
    'Taxes & Licenses',
    'POS & Software Fees',
    'Miscellaneous',
  ];

  // KPIs
  const expensesThisMonth = useMemo(() => {
    return expenses
      .filter(e => e.date.startsWith(currentMonthPrefix))
      .reduce((acc, e) => acc + e.amount, 0);
  }, [expenses, currentMonthPrefix]);

  const expensesThisWeek = useMemo(() => {
    return expenses
      .filter(e => {
        const d = new Date(e.date + 'T00:00:00');
        return d >= startOfWeek && d <= endOfWeek;
      })
      .reduce((acc, e) => acc + e.amount, 0);
  }, [expenses, startOfWeek, endOfWeek]);

  const expensesToday = useMemo(() => {
    return expenses
      .filter(e => e.date === todayStr)
      .reduce((acc, e) => acc + e.amount, 0);
  }, [expenses, todayStr]);

  // Largest expense category this month
  const topCategoryThisMonth = useMemo(() => {
    const map: Record<string, number> = {};
    expenses
      .filter(e => e.date.startsWith(currentMonthPrefix))
      .forEach(e => {
        map[e.category] = (map[e.category] || 0) + e.amount;
      });
    let topCat = 'None';
    let maxVal = 0;
    Object.entries(map).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        topCat = cat;
      }
    });
    return { category: topCat, amount: maxVal };
  }, [expenses, currentMonthPrefix]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        // Category filter
        if (categoryFilter !== 'All' && e.category !== categoryFilter) {
          return false;
        }

        // Date range
        if (dateRangeFilter === 'today' && e.date !== todayStr) return false;
        if (dateRangeFilter === 'this_month' && !e.date.startsWith(currentMonthPrefix)) return false;
        if (dateRangeFilter === 'this_week') {
          const d = new Date(e.date + 'T00:00:00');
          if (d < startOfWeek || d > endOfWeek) return false;
        }

        // Query
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
          e.description.toLowerCase().includes(q) ||
          e.payee.toLowerCase().includes(q) ||
          (e.referenceNo && e.referenceNo.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, categoryFilter, dateRangeFilter, searchQuery, todayStr, currentMonthPrefix, startOfWeek, endOfWeek]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  }, [filteredExpenses]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Category',
      'Description',
      'Payee',
      'Payment Method',
      'Reference No',
      'Amount',
      'Notes',
    ];

    const rows = filteredExpenses.map(e => [
      e.date,
      e.category,
      e.description,
      e.payee,
      e.paymentMethod,
      e.referenceNo || '',
      e.amount.toFixed(2),
      e.notes || '',
    ]);

    downloadCSV(
      `store_expenses_${new Date().toISOString().slice(0, 10)}.csv`,
      [headers, ...rows]
    );
  };

  const handleDelete = (id: string, desc: string) => {
    if (window.confirm(`Delete expense record "${desc}"?`)) {
      deleteExpense(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-display">
            Operating Expenses
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Log overhead costs, supplier invoices, utilities, rent, and payroll to ensure accurate net profit reporting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">This Month's Expenses</div>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {formatCurrency(expensesThisMonth, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">October 2026 to date</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">This Week's Expenses</div>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {formatCurrency(expensesThisWeek, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Past 7 calendar days</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Today's Expenses</div>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {formatCurrency(expensesToday, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Recorded today</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Top Outflow Category</div>
          <div className="text-base font-bold text-neutral-900 truncate mt-1">
            {topCategoryThisMonth.category}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5 font-mono tabular-nums">
            {formatCurrency(topCategoryThisMonth.amount, settings.currencySymbol)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by description, payee, or reference #..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* Timeframe Segmented Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setDateRangeFilter('this_month')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                dateRangeFilter === 'this_month'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateRangeFilter('this_week')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                dateRangeFilter === 'this_week'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateRangeFilter('today')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                dateRangeFilter === 'today'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRangeFilter('all')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                dateRangeFilter === 'all'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Records
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-3 bg-neutral-50/50 border-b border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
          <span>
            Showing <strong className="text-neutral-900">{filteredExpenses.length}</strong> expense entries
          </span>
          <span>
            Total in view: <strong className="font-mono text-neutral-900 tabular-nums">{formatCurrency(filteredTotal, settings.currencySymbol)}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description & Payee</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 font-mono">Reference #</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredExpenses.map(e => (
                <tr key={e.id} className="hover:bg-neutral-50/60 transition-colors">
                  {/* Date */}
                  <td className="py-3.5 px-4 font-mono text-neutral-700 whitespace-nowrap">
                    {formatDate(e.date)}
                  </td>

                  {/* Category (unboxed clean text) */}
                  <td className="py-3.5 px-4 font-medium text-neutral-800">
                    {e.category}
                  </td>

                  {/* Description & Payee */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-neutral-900">{e.description}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Payee: {e.payee}
                    </div>
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4 text-neutral-600">
                    <span className="capitalize">
                      {e.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Reference # */}
                  <td className="py-3.5 px-4 font-mono text-neutral-500 text-[11px]">
                    {e.referenceNo || '—'}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-neutral-900 text-sm">
                    {formatCurrency(e.amount, settings.currencySymbol)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingExpense(e);
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer rounded"
                        title="Edit expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(e.id, e.description)}
                        className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer rounded"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExpenses.length === 0 && (
          <div className="p-12 text-center text-neutral-500">
            <Receipt className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-medium">No expenses logged for this filter</p>
            <p className="text-xs text-neutral-400 mt-1">
              Click &quot;Log Expense&quot; above to add overhead or utility costs.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => {
            setIsModalOpen(false);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
};
