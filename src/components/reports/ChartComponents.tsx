import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface BarDataPoint {
  label: string;
  subLabel?: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface MultiBarChartProps {
  data: BarDataPoint[];
  currencySymbol: string;
  height?: number;
}

export const MultiBarChart: React.FC<MultiBarChartProps> = ({
  data,
  currencySymbol,
  height = 220,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-neutral-400">
        No transaction data for this timeframe.
      </div>
    );
  }

  // Find maximum value for scaling
  const maxVal = Math.max(
    ...data.map(d => Math.max(d.revenue, d.expenses, Math.max(0, d.profit))),
    100
  );

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center justify-end gap-5 text-xs text-neutral-600 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-neutral-900 inline-block" />
          <span>Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-neutral-400 inline-block" />
          <span>Expenses</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
          <span>Net Profit</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative border-b border-neutral-200" style={{ height: `${height}px` }}>
        {/* Subtle Horizontal Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-dashed border-neutral-200 w-full" />
          <div className="border-b border-dashed border-neutral-200 w-full" />
          <div className="border-b border-dashed border-neutral-200 w-full" />
          <div className="border-b border-neutral-200 w-full" />
        </div>

        {/* Bars Container */}
        <div className="absolute inset-0 flex items-end justify-between gap-1 sm:gap-3 px-2">
          {data.map((item, idx) => {
            const revHeight = Math.max(2, (item.revenue / maxVal) * (height - 30));
            const expHeight = Math.max(2, (item.expenses / maxVal) * (height - 30));
            const profitHeight = item.profit > 0 ? (item.profit / maxVal) * (height - 30) : 0;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-20 z-20 bg-neutral-900 text-white text-[11px] font-mono py-1.5 px-2.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none transform -translate-x-1/2 left-1/2 animate-in fade-in zoom-in-95">
                    <div className="font-semibold text-neutral-200 mb-0.5">{item.label}</div>
                    <div>Rev: {formatCurrency(item.revenue, currencySymbol)}</div>
                    <div>Exp: {formatCurrency(item.expenses, currencySymbol)}</div>
                    <div className="text-emerald-400 font-bold">
                      Profit: {formatCurrency(item.profit, currencySymbol)}
                    </div>
                  </div>
                )}

                {/* Bars Group */}
                <div className="flex items-end gap-0.5 sm:gap-1 w-full justify-center">
                  {/* Revenue Bar */}
                  <div
                    style={{ height: `${revHeight}px` }}
                    className={`w-full max-w-[14px] bg-neutral-900 rounded-t-xs transition-all ${
                      isHovered ? 'bg-neutral-800 ring-2 ring-neutral-400' : ''
                    }`}
                  />
                  {/* Expenses Bar */}
                  <div
                    style={{ height: `${expHeight}px` }}
                    className={`w-full max-w-[14px] bg-neutral-400 rounded-t-xs transition-all ${
                      isHovered ? 'bg-neutral-500 ring-2 ring-neutral-300' : ''
                    }`}
                  />
                  {/* Profit Bar */}
                  <div
                    style={{ height: `${profitHeight}px` }}
                    className={`w-full max-w-[14px] bg-emerald-600 rounded-t-xs transition-all ${
                      isHovered ? 'bg-emerald-500 ring-2 ring-emerald-300' : ''
                    }`}
                  />
                </div>

                {/* X Axis Label */}
                <div className="mt-2 text-[11px] font-medium text-neutral-600 text-center truncate w-full">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Trend Curve for Daily / Monthly distribution
interface TrendPoint {
  label: string;
  value: number;
}

interface TrendAreaChartProps {
  data: TrendPoint[];
  currencySymbol: string;
  height?: number;
}

export const TrendAreaChart: React.FC<TrendAreaChartProps> = ({
  data,
  currencySymbol,
  height = 180,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-xs text-neutral-400">No trend data</div>;
  }

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 50);
  const minVal = 0;
  const paddingX = 24;
  const paddingY = 20;
  const width = 640;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  // Build points
  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * plotWidth;
    const y = height - paddingY - ((d.value - minVal) / (maxVal - minVal)) * plotHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        style={{ height: `${height}px` }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#171717" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#171717" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="#e5e5e5"
          strokeWidth="1"
        />
        <line
          x1={paddingX}
          y1={paddingY}
          x2={width - paddingX}
          y2={paddingY}
          stroke="#f0f0f0"
          strokeDasharray="3 3"
        />

        {/* Shaded Area */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Line Stroke */}
        <path d={pathD} fill="none" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" />

        {/* Interactive Circles */}
        {points.map((pt, idx) => (
          <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === idx ? 5 : 3}
              fill="#ffffff"
              stroke="#171717"
              strokeWidth={hoveredIdx === idx ? 2.5 : 1.5}
            />
          </g>
        ))}
      </svg>

      {/* Floating tooltip */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <div
          className="absolute z-20 bg-neutral-900 text-white text-[11px] font-mono py-1 px-2 rounded-md shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-8"
          style={{
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100}%`,
          }}
        >
          <div className="font-semibold text-neutral-300">{points[hoveredIdx].label}</div>
          <div className="tabular-nums">{formatCurrency(points[hoveredIdx].value, currencySymbol)}</div>
        </div>
      )}

      {/* X Labels */}
      <div className="flex justify-between px-3 text-[10px] text-neutral-400 font-mono mt-1">
        <span>{data[0]?.label}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.label}</span>}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
};

// Donut / Category Breakdown
interface CategoryShare {
  name: string;
  revenue: number;
  percentage: number;
  color: string;
}

export const CategoryShareChart: React.FC<{
  shares: CategoryShare[];
  currencySymbol: string;
}> = ({ shares, currencySymbol }) => {
  return (
    <div className="space-y-3">
      {shares.map(cat => (
        <div key={cat.name} className="text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-neutral-800 truncate">{cat.name}</span>
            <div className="space-x-2 font-mono tabular-nums text-neutral-600">
              <span>{formatCurrency(cat.revenue, currencySymbol)}</span>
              <span className="text-neutral-400">·</span>
              <span className="font-bold text-neutral-900">{cat.percentage.toFixed(1)}%</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, cat.percentage)}%`, backgroundColor: cat.color }}
              className="h-full rounded-full transition-all duration-300"
            />
          </div>
        </div>
      ))}
      {shares.length === 0 && (
        <div className="text-xs text-neutral-400 py-4 text-center">No category sales recorded</div>
      )}
    </div>
  );
};
