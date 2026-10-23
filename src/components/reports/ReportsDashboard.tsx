import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, formatPercent, formatDate, toDateInputValue, downloadCSV } from '../../utils/formatters';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Download,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowUpRight,
  ReceiptText,
} from 'lucide-react';
import { MultiBarChart, TrendAreaChart, CategoryShareChart } from './ChartComponents';
import { IncomeStatementModal } from './IncomeStatementModal';

type ReportCadence = 'daily' | 'weekly' | 'monthly';

export const ReportsDashboard: React.FC = () => {
  const { sales, expenses, products, settings } = useStore();

  const [cadence, setCadence] = useState<ReportCadence>('daily');

  // Selected date anchor (defaults to 2026-10-23)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-23');

  // Modal for formal P&L
  const [showIncomeStatement, setShowIncomeStatement] = useState(false);

  // Parse anchor date
  const anchorDate = useMemo(() => {
    return new Date(`${selectedDateStr}T12:00:00`);
  }, [selectedDateStr]);

  // Navigate dates
  const handlePrev = () => {
    const d = new Date(anchorDate);
    if (cadence === 'daily') {
      d.setDate(d.getDate() - 1);
    } else if (cadence === 'weekly') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setSelectedDateStr(toDateInputValue(d));
  };

  const handleNext = () => {
    const d = new Date(anchorDate);
    if (cadence === 'daily') {
      d.setDate(d.getDate() + 1);
    } else if (cadence === 'weekly') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setSelectedDateStr(toDateInputValue(d));
  };

  // Time boundaries based on Cadence
  const { filteredSales, filteredExpenses, periodTitle } = useMemo(() => {
    if (cadence === 'daily') {
      const daySales = sales.filter(s => s.timestamp.startsWith(selectedDateStr));
      const dayExpenses = expenses.filter(e => e.date === selectedDateStr);
      const title = formatDate(selectedDateStr);
      return { filteredSales: daySales, filteredExpenses: dayExpenses, periodTitle: `Daily Report — ${title}` };
    }

    if (cadence === 'weekly') {
      // Calculate start (Monday) and end (Sunday) of current week
      const currentDay = anchorDate.getDay();
      const diffToMonday = anchorDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
      const monday = new Date(anchorDate);
      monday.setDate(diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const monStr = toDateInputValue(monday);
      const sunStr = toDateInputValue(sunday);

      const weekSales = sales.filter(s => {
        const d = new Date(s.timestamp);
        return d >= monday && d <= sunday;
      });

      const weekExpenses = expenses.filter(e => {
        const d = new Date(e.date + 'T00:00:00');
        return d >= monday && d <= sunday;
      });

      const title = `Week of ${formatDate(monStr)} – ${formatDate(sunStr)}`;
      return { filteredSales: weekSales, filteredExpenses: weekExpenses, periodTitle: title };
    }

    // Monthly cadence
    const yearMonth = selectedDateStr.slice(0, 7); // e.g. '2026-10'
    const monthSales = sales.filter(s => s.timestamp.startsWith(yearMonth));
    const monthExpenses = expenses.filter(e => e.date.startsWith(yearMonth));

    const monthName = anchorDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return {
      filteredSales: monthSales,
      filteredExpenses: monthExpenses,
      periodTitle: `Monthly Report — ${monthName}`,
    };
  }, [cadence, selectedDateStr, anchorDate, sales, expenses]);

  // Aggregate Calculations
  const grossSales = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.subtotal, 0);
  }, [filteredSales]);

  const discountsTotal = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.discount, 0);
  }, [filteredSales]);

  const netRevenue = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.total, 0);
  }, [filteredSales]);

  const totalCOGS = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.totalCost, 0);
  }, [filteredSales]);

  const grossProfit = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.grossProfit, 0);
  }, [filteredSales]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  }, [filteredExpenses]);

  const netOperatingProfit = grossProfit - totalExpenses;
  const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const netMargin = netRevenue > 0 ? (netOperatingProfit / netRevenue) * 100 : 0;
  const ordersCount = filteredSales.length;
  const avgBasketSize = ordersCount > 0 ? netRevenue / ordersCount : 0;

  const totalUnitsSold = useMemo(() => {
    return filteredSales.reduce(
      (acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0),
      0
    );
  }, [filteredSales]);

  // Operating Expenses by Category breakdown
  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [filteredExpenses]);

  // Sales by Category
  const categoryShares = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach(s => {
      s.items.forEach(item => {
        map[item.category] = (map[item.category] || 0) + item.total;
      });
    });

    const palette = [
      '#171717', // neutral-900
      '#059669', // emerald-600
      '#2563EB', // blue-600
      '#D97706', // amber-600
      '#7C3AED', // violet-600
      '#DB2777', // pink-600
      '#4B5563', // gray-600
      '#0D9488', // teal-600
    ];

    const totalCatSales = Object.values(map).reduce((a, b) => a + b, 0) || 1;

    return Object.entries(map)
      .map(([name, rev], idx) => ({
        name,
        revenue: rev,
        percentage: (rev / totalCatSales) * 100,
        color: palette[idx % palette.length],
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  // Top 5 Best Selling Items
  const topSellingProducts = useMemo(() => {
    const map: Record<string, { name: string; category: string; quantity: number; revenue: number }> = {};
    filteredSales.forEach(s => {
      s.items.forEach(item => {
        if (!map[item.productId]) {
          map[item.productId] = {
            name: item.name,
            category: item.category,
            quantity: 0,
            revenue: 0,
          };
        }
        map[item.productId].quantity += item.quantity;
        map[item.productId].revenue += item.total;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredSales]);

  // Payment Methods breakdown
  const paymentMethodShares = useMemo(() => {
    const counts = { card: 0, cash: 0, mobile_transfer: 0 };
    const amounts = { card: 0, cash: 0, mobile_transfer: 0 };

    filteredSales.forEach(s => {
      counts[s.paymentMethod] = (counts[s.paymentMethod] || 0) + 1;
      amounts[s.paymentMethod] = (amounts[s.paymentMethod] || 0) + s.total;
    });

    return { counts, amounts };
  }, [filteredSales]);

  // Chart data for Daily: Hourly distribution
  const hourlyChartData = useMemo(() => {
    if (cadence !== 'daily') return [];
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    return hours.map(h => {
      const label = `${h % 12 === 0 ? 12 : h % 12}${h >= 12 ? 'pm' : 'am'}`;
      const rev = filteredSales
        .filter(s => new Date(s.timestamp).getHours() === h)
        .reduce((sum, s) => sum + s.total, 0);
      return { label, value: rev };
    });
  }, [cadence, filteredSales]);

  // Chart data for Weekly: Day by day multi bar chart
  const weeklyDayByDayData = useMemo(() => {
    if (cadence !== 'weekly') return [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Start with Monday of the current week
    const currentDay = anchorDate.getDay();
    const diffToMonday = anchorDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(anchorDate);
    monday.setDate(diffToMonday);

    return days.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dStr = toDateInputValue(d);

      const daySales = filteredSales.filter(s => s.timestamp.startsWith(dStr));
      const dayExpenses = filteredExpenses.filter(e => e.date === dStr);

      const dayRev = daySales.reduce((acc, s) => acc + s.total, 0);
      const dayExp = dayExpenses.reduce((acc, e) => acc + e.amount, 0);
      const dayProfit = daySales.reduce((acc, s) => acc + s.grossProfit, 0) - dayExp;

      return {
        label: dayName,
        subLabel: dStr.slice(5),
        revenue: dayRev,
        expenses: dayExp,
        profit: dayProfit,
      };
    });
  }, [cadence, anchorDate, filteredSales, filteredExpenses]);

  // Chart data for Monthly: 30-day area trend
  const monthlyTrendData = useMemo(() => {
    if (cadence !== 'monthly') return [];
    const yearMonth = selectedDateStr.slice(0, 7);
    const [y, m] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();

    const points = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayFormatted = `${yearMonth}-${String(day).padStart(2, '0')}`;
      const dayRev = filteredSales
        .filter(s => s.timestamp.startsWith(dayFormatted))
        .reduce((sum, s) => sum + s.total, 0);

      points.push({
        label: `Oct ${day}`,
        value: dayRev,
      });
    }
    return points;
  }, [cadence, selectedDateStr, filteredSales]);

  // Export full report to CSV
  const handleExportReportCSV = () => {
    const summaryRows = [
      ['REVENUE & FINANCIAL PERFORMANCE REPORT'],
      ['Store:', settings.storeName],
      ['Cadence:', cadence.toUpperCase()],
      ['Period:', periodTitle],
      ['Report Generated:', new Date().toLocaleString()],
      [''],
      ['FINANCIAL SUMMARY METRICS'],
      ['Gross Sales', grossSales.toFixed(2)],
      ['Discounts Granted', discountsTotal.toFixed(2)],
      ['Net Sales Revenue', netRevenue.toFixed(2)],
      ['Cost of Goods Sold (COGS)', totalCOGS.toFixed(2)],
      ['Gross Profit', grossProfit.toFixed(2)],
      ['Gross Margin (%)', `${grossMargin.toFixed(2)}%`],
      ['Total Operating Expenses', totalExpenses.toFixed(2)],
      ['Net Operating Income', netOperatingProfit.toFixed(2)],
      ['Net Margin (%)', `${netMargin.toFixed(2)}%`],
      ['Orders Processed', String(ordersCount)],
      ['Total Items Sold', String(totalUnitsSold)],
      ['Average Basket Size', avgBasketSize.toFixed(2)],
      [''],
      ['TOP SELLING PRODUCTS'],
      ['Product Name', 'Category', 'Units Sold', 'Total Revenue'],
      ...topSellingProducts.map(p => [
        p.name,
        p.category,
        String(p.quantity),
        p.revenue.toFixed(2),
      ]),
    ];

    downloadCSV(
      `revenue_report_${cadence}_${selectedDateStr}.csv`,
      summaryRows
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-display">
            Financial &amp; Revenue Reports
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Audit store performance across Daily, Weekly, and Monthly cycles with P&amp;L margin analysis.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportReportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <button
            onClick={() => setShowIncomeStatement(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
          >
            <ReceiptText className="w-3.5 h-3.5" />
            <span>Official P&amp;L Statement</span>
          </button>
        </div>
      </div>

      {/* Cadence Segmented Tabs & Date Navigation Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Cadence Selector Tabs */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setCadence('daily')}
            className={`px-4 py-1.5 font-semibold rounded-md transition-colors cursor-pointer ${
              cadence === 'daily'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setCadence('weekly')}
            className={`px-4 py-1.5 font-semibold rounded-md transition-colors cursor-pointer ${
              cadence === 'weekly'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setCadence('monthly')}
            className={`px-4 py-1.5 font-semibold rounded-md transition-colors cursor-pointer ${
              cadence === 'monthly'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md transition-colors cursor-pointer"
            title="Previous period"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 border border-neutral-200 rounded-lg text-xs">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <input
              type="date"
              value={selectedDateStr}
              onChange={e => e.target.value && setSelectedDateStr(e.target.value)}
              className="bg-transparent font-medium text-neutral-900 outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleNext}
            className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md transition-colors cursor-pointer"
            title="Next period"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-neutral-800 ml-2 hidden lg:inline font-mono">
            {periodTitle}
          </span>
        </div>
      </div>

      {/* Primary Financial Metric Cards (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Net Revenue */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Net Revenue</div>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {formatCurrency(netRevenue, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            Gross: {formatCurrency(grossSales, settings.currencySymbol)}
          </div>
        </div>

        {/* Cost of Goods Sold */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Wholesale COGS</div>
          <div className="text-xl font-bold text-neutral-700 font-mono tabular-nums mt-1">
            {formatCurrency(totalCOGS, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Product purchase cost</div>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Gross Profit</div>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {formatCurrency(grossProfit, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            {formatPercent(grossMargin)} gross margin
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Operating Expenses</div>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {formatCurrency(totalExpenses, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Rent, power, payroll, etc.</div>
        </div>

        {/* Net Operating Profit */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Net Profit</div>
          <div className={`text-xl font-bold font-mono tabular-nums mt-1 ${
            netOperatingProfit >= 0 ? 'text-emerald-700' : 'text-red-600'
          }`}>
            {formatCurrency(netOperatingProfit, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            {formatPercent(netMargin)} net margin
          </div>
        </div>

        {/* Orders & Basket */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Transactions</div>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {ordersCount}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Avg: {formatCurrency(avgBasketSize, settings.currencySymbol)}
          </div>
        </div>
      </div>

      {/* Cadence Specific Visualizations */}
      {cadence === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Hourly Sales Activity (7 cols) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm font-display">
                  Hourly Sales Volume
                </h3>
                <p className="text-xs text-neutral-500">
                  Customer checkout rhythm across retail operating hours
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-neutral-800">
                {ordersCount} orders today
              </span>
            </div>

            <TrendAreaChart data={hourlyChartData} currencySymbol={settings.currencySymbol} height={200} />

            {/* Today's Transactions Log */}
            <div className="pt-3 border-t border-neutral-100">
              <h4 className="text-xs font-bold text-neutral-800 mb-2">
                Today&apos;s Itemized Transactions
              </h4>
              <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 text-xs">
                {filteredSales.map(sale => (
                  <div key={sale.id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-neutral-900">
                        {sale.receiptNumber} · {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate max-w-xs">
                        {sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-neutral-900 font-mono tabular-nums">
                        {formatCurrency(sale.total, settings.currencySymbol)}
                      </div>
                      <div className="text-[10px] text-neutral-400 capitalize">
                        {sale.paymentMethod}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredSales.length === 0 && (
                  <div className="py-8 text-center text-neutral-400">
                    No transactions recorded for this day yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Category Split & Expenses Log for the Day (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Category Share */}
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-neutral-900 text-sm font-display">
                Sales by Category
              </h3>
              <CategoryShareChart shares={categoryShares} currencySymbol={settings.currencySymbol} />
            </div>

            {/* Daily Expenses */}
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 text-sm font-display">
                  Today&apos;s Operating Outflows
                </h3>
                <span className="text-xs font-mono font-bold text-neutral-900 tabular-nums">
                  {formatCurrency(totalExpenses, settings.currencySymbol)}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {filteredExpenses.map(e => (
                  <div key={e.id} className="p-2 bg-neutral-50 rounded border border-neutral-200 flex justify-between">
                    <div>
                      <div className="font-medium text-neutral-900">{e.description}</div>
                      <div className="text-[11px] text-neutral-500">{e.category}</div>
                    </div>
                    <div className="font-bold font-mono text-neutral-900 tabular-nums">
                      {formatCurrency(e.amount, settings.currencySymbol)}
                    </div>
                  </div>
                ))}
                {filteredExpenses.length === 0 && (
                  <div className="text-neutral-400 text-center py-4 text-xs">
                    No expenses logged for this day.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {cadence === 'weekly' && (
        <div className="space-y-6">
          {/* Weekly Day-by-Day Revenue vs Expenses Bar Chart */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-neutral-900 text-base font-display">
                7-Day Revenue vs. Expenses vs. Profit
              </h3>
              <p className="text-xs text-neutral-500">
                Direct comparison of daily intake against overhead outflows and gross profits.
              </p>
            </div>

            <MultiBarChart data={weeklyDayByDayData} currencySymbol={settings.currencySymbol} height={240} />
          </div>

          {/* Day by Day Breakdown Table */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 bg-neutral-50/70 border-b border-neutral-200 font-semibold text-xs text-neutral-900">
              Day-by-Day Performance Ledger
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50/50 border-b border-neutral-200 text-neutral-500 font-semibold">
                    <th className="py-3 px-4">Day &amp; Date</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4 text-right">Gross Revenue</th>
                    <th className="py-3 px-4 text-right">Operating Expenses</th>
                    <th className="py-3 px-4 text-right">Net Operating Profit</th>
                    <th className="py-3 px-4 text-right">Net Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {weeklyDayByDayData.map(d => {
                    const margin = d.revenue > 0 ? (d.profit / d.revenue) * 100 : 0;
                    return (
                      <tr key={d.label} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3 px-4 font-sans font-semibold text-neutral-900">
                          {d.label} <span className="text-neutral-400 font-normal">({d.subLabel})</span>
                        </td>
                        <td className="py-3 px-4 text-center text-neutral-600">
                          {filteredSales.filter(s => s.timestamp.includes(d.subLabel)).length}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-neutral-900 tabular-nums">
                          {formatCurrency(d.revenue, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-600 tabular-nums">
                          {formatCurrency(d.expenses, settings.currencySymbol)}
                        </td>
                        <td className={`py-3 px-4 text-right font-bold tabular-nums ${
                          d.profit >= 0 ? 'text-emerald-700' : 'text-red-600'
                        }`}>
                          {formatCurrency(d.profit, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-500 tabular-nums">
                          {formatPercent(margin)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {cadence === 'monthly' && (
        <div className="space-y-6">
          {/* Monthly Revenue Trend Curve */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-base font-display">
                  30-Day Daily Sales Trajectory
                </h3>
                <p className="text-xs text-neutral-500">
                  Daily fluctuations and high-volume sales peaks across the month.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-900">
                Total Month: {formatCurrency(netRevenue, settings.currencySymbol)}
              </span>
            </div>

            <TrendAreaChart data={monthlyTrendData} currencySymbol={settings.currencySymbol} height={200} />
          </div>

          {/* 3-Column Split for Monthly Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Category Revenue Share */}
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-neutral-900 text-sm font-display">
                Revenue by Category
              </h3>
              <CategoryShareChart shares={categoryShares} currencySymbol={settings.currencySymbol} />
            </div>

            {/* 2. Top 5 Best-Selling Products */}
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-neutral-900 text-sm font-display">
                Top 5 Best-Sellers
              </h3>
              <div className="space-y-3 text-xs">
                {topSellingProducts.map((p, idx) => (
                  <div key={p.name} className="flex items-center justify-between p-2 rounded bg-neutral-50/60 border border-neutral-100">
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-neutral-900 truncate">
                        {idx + 1}. {p.name}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {p.quantity} units sold · {p.category}
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-neutral-900 tabular-nums">
                      {formatCurrency(p.revenue, settings.currencySymbol)}
                    </div>
                  </div>
                ))}
                {topSellingProducts.length === 0 && (
                  <div className="text-xs text-neutral-400 py-4 text-center">No sales recorded</div>
                )}
              </div>
            </div>

            {/* 3. Payment Methods Breakdown */}
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-neutral-900 text-sm font-display">
                Payment Methods Split
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-neutral-700" />
                    <div>
                      <div className="font-semibold text-neutral-900">Card Payments</div>
                      <div className="text-[11px] text-neutral-500">
                        {paymentMethodShares.counts.card} transactions
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-neutral-900 tabular-nums">
                    {formatCurrency(paymentMethodShares.amounts.card, settings.currencySymbol)}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Banknote className="w-4 h-4 text-neutral-700" />
                    <div>
                      <div className="font-semibold text-neutral-900">Cash Register</div>
                      <div className="text-[11px] text-neutral-500">
                        {paymentMethodShares.counts.cash} transactions
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-neutral-900 tabular-nums">
                    {formatCurrency(paymentMethodShares.amounts.cash, settings.currencySymbol)}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-neutral-700" />
                    <div>
                      <div className="font-semibold text-neutral-900">Mobile / Digital</div>
                      <div className="text-[11px] text-neutral-500">
                        {paymentMethodShares.counts.mobile_transfer} transactions
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-neutral-900 tabular-nums">
                    {formatCurrency(paymentMethodShares.amounts.mobile_transfer, settings.currencySymbol)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Income Statement / P&L Modal */}
      {showIncomeStatement && (
        <IncomeStatementModal
          title={`Profit & Loss Statement — ${cadence.toUpperCase()}`}
          periodLabel={periodTitle}
          grossSales={grossSales}
          discounts={discountsTotal}
          netRevenue={netRevenue}
          cogs={totalCOGS}
          grossProfit={grossProfit}
          operatingExpenses={expensesByCategory}
          totalExpenses={totalExpenses}
          netProfit={netOperatingProfit}
          transactionsCount={ordersCount}
          totalUnitsSold={totalUnitsSold}
          onClose={() => setShowIncomeStatement(false)}
        />
      )}
    </div>
  );
};
