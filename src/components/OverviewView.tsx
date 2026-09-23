import React, { useMemo, useState } from 'react';
import { Product, SaleRecord } from '../types';
import { formatCFA, formatCFAShort, CURRENCY_LABEL } from '../utils/currency';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart
} from 'recharts';

interface OverviewViewProps {
  products: Product[];
  sales: SaleRecord[];
  onRestockProduct: (product: Product) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  products,
  sales,
  onRestockProduct
}) => {
  const [chartView, setChartView] = useState<'revenue' | 'both'>('revenue');

  // Categories & Units
  const categories = Array.from(new Set(products.map(p => p.category)));
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);

  const lowStockProducts = products.filter(p => p.stock <= p.minStockAlert);
  const healthyCount = products.filter(p => p.stock > p.minStockAlert).length;
  const healthPercentage = products.length > 0 ? Math.round((healthyCount / products.length) * 100) : 100;

  // Compute 7-day sales data
  const last7DaysData = useMemo(() => {
    const days: {
      dateKey: string;
      dayLabel: string;
      fullDate: string;
      revenue: number;
      units: number;
      transactionCount: number;
    }[] = [];

    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayLabel =
        i === 0
          ? 'Today'
          : i === 1
          ? 'Yesterday'
          : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;

      let dayRevenue = 0;
      let dayUnits = 0;
      let count = 0;

      sales.forEach((sale) => {
        let isMatch = false;

        if (sale.timestamp) {
          const saleDate = new Date(sale.timestamp);
          const saleKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}-${String(
            saleDate.getDate()
          ).padStart(2, '0')}`;
          if (saleKey === dateKey) isMatch = true;
        } else {
          // Fallback parsing for text dates
          if (i === 0 && (sale.date.startsWith('Today') || sale.date.includes('Today'))) isMatch = true;
          if (i === 1 && (sale.date.startsWith('Yesterday') || sale.date.includes('Yesterday'))) isMatch = true;
          if (i === 2 && sale.date.includes('2 days ago')) isMatch = true;
          if (i === 3 && sale.date.includes('3 days ago')) isMatch = true;
          if (i === 4 && sale.date.includes('4 days ago')) isMatch = true;
          if (i === 5 && sale.date.includes('5 days ago')) isMatch = true;
          if (i === 6 && sale.date.includes('6 days ago')) isMatch = true;
        }

        if (isMatch) {
          dayRevenue += sale.totalAmount;
          dayUnits += sale.items.reduce((s, it) => s + it.quantity, 0);
          count += 1;
        }
      });

      days.push({
        dateKey,
        dayLabel,
        fullDate: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' }),
        revenue: dayRevenue,
        units: dayUnits,
        transactionCount: count
      });
    }

    return days;
  }, [sales]);

  // 7-day stats
  const total7DayRevenue = last7DaysData.reduce((sum, d) => sum + d.revenue, 0);
  const total7DayUnits = last7DaysData.reduce((sum, d) => sum + d.units, 0);
  const averageDailyRevenue = Math.round(total7DayRevenue / 7);
  const highestDay = [...last7DaysData].sort((a, b) => b.revenue - a.revenue)[0];

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-surface-container-lowest/95 backdrop-blur-md p-3.5 rounded-xl border border-outline-variant/30 shadow-xl space-y-1.5 text-xs">
          <div className="font-semibold text-on-surface capitalize border-b border-outline-variant/20 pb-1 flex items-center justify-between gap-4">
            <span>{dataPoint.fullDate}</span>
            <span className="text-[0.6875rem] font-normal text-on-surface-variant">
              {dataPoint.transactionCount} sale{dataPoint.transactionCount === 1 ? '' : 's'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
              Sales Revenue:
            </span>
            <span className="font-mono font-bold text-on-surface text-sm">
              {formatCFA(dataPoint.revenue)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              Bottles / Units:
            </span>
            <span className="font-mono font-semibold text-emerald-800">
              {dataPoint.units} unit{dataPoint.units === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Business Intelligence</span>
          <h2 className="text-2xl font-bold text-on-surface mt-1">Overview &amp; Revenue Trends</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Real-time sales velocity in {CURRENCY_LABEL}, 7-day revenue performance, and inventory health.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-emerald-800">{healthPercentage}%</div>
            <div className="text-[0.6875rem] text-on-surface-variant font-medium">Stock Health</div>
          </div>
          <div className="h-8 w-px bg-outline-variant/40"></div>
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-on-surface">{products.length}</div>
            <div className="text-[0.6875rem] text-on-surface-variant font-medium">Active Items</div>
          </div>
        </div>
      </div>

      {/* 7-DAY SALES REVENUE TREND (RECHARTS LINE CHART) */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary material-symbols-outlined text-[1.25rem]">
                show_chart
              </span>
              <h3 className="font-title-md font-semibold text-on-surface text-lg">
                7-Day Sales Revenue Trend
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Daily revenue progression over the past week in {CURRENCY_LABEL}
            </p>
          </div>

          {/* Toggle View & Quick Stats */}
          <div className="flex items-center gap-2">
            <div className="bg-surface-container-low p-1 rounded-xl border border-outline-variant/20 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setChartView('revenue')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  chartView === 'revenue'
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Revenue Only
              </button>
              <button
                type="button"
                onClick={() => setChartView('both')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  chartView === 'both'
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Revenue + Units
              </button>
            </div>
          </div>
        </div>

        {/* 3 Metric Pills for 7-Day Performance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant">
              7-Day Total Revenue
            </span>
            <div className="text-2xl font-bold font-mono text-primary mt-1">
              {formatCFA(total7DayRevenue)}
            </div>
            <div className="text-[0.6875rem] text-on-surface-variant mt-0.5">
              {total7DayUnits} fragrance units sold
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant">
              Daily Average
            </span>
            <div className="text-2xl font-bold font-mono text-on-surface mt-1">
              {formatCFA(averageDailyRevenue)}
            </div>
            <div className="text-[0.6875rem] text-on-surface-variant mt-0.5">
              Across past 7 calendar days
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant">
              Highest Sales Day
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
              {highestDay ? formatCFA(highestDay.revenue) : '0 FCFA'}
            </div>
            <div className="text-[0.6875rem] text-emerald-800 font-medium mt-0.5">
              {highestDay ? `${highestDay.dayLabel} (${highestDay.units} units)` : '—'}
            </div>
          </div>
        </div>

        {/* Recharts Chart Area */}
        <div className="h-72 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={last7DaysData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8A4A58" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8A4A58" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                opacity={0.7}
              />

              <XAxis
                dataKey="dayLabel"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />

              <YAxis
                yAxisId="revenue"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCFAShort(val)}
              />

              {chartView === 'both' && (
                <YAxis
                  yAxisId="units"
                  orientation="right"
                  stroke="#059669"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val} u`}
                />
              )}

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              />

              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                name={`Revenue (${CURRENCY_LABEL})`}
                stroke="#8A4A58"
                strokeWidth={3}
                dot={{ r: 4, fill: '#8A4A58', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 7, fill: '#6B3441', stroke: '#ffffff', strokeWidth: 2 }}
              />

              {chartView === 'both' && (
                <Line
                  yAxisId="units"
                  type="monotone"
                  dataKey="units"
                  name="Bottles Sold"
                  stroke="#059669"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3.5, fill: '#059669', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#047857', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md font-semibold text-on-surface">Stock by Category</h3>
            <span className="text-xs text-on-surface-variant">{totalUnits} total units</span>
          </div>

          {categories.length === 0 ? (
            <div className="py-8 text-center text-xs text-on-surface-variant font-medium">
              <span className="material-symbols-outlined text-[2rem] text-on-surface-variant/40 block mb-1">category</span>
              No categories yet. Add your products to view category stock distribution.
            </div>
          ) : (
          <div className="space-y-3">
            {categories.map((cat) => {
              const catProducts = products.filter(p => p.category === cat);
              const catStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
              const percent = totalUnits > 0 ? Math.round((catStock / totalUnits) * 100) : 0;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-on-surface">{cat} ({catProducts.length} items)</span>
                    <span className="font-mono text-on-surface-variant">{catStock} units ({percent}%)</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Priority Restock Checklist */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md font-semibold text-on-surface">Restock Checklist</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              lowStockProducts.length > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {lowStockProducts.length} needed
            </span>
          </div>

          {products.length === 0 ? (
            <div className="py-8 text-center text-xs text-on-surface-variant font-medium">
              <span className="material-symbols-outlined text-[2rem] text-on-surface-variant/40 block mb-1">inventory</span>
              No products in store yet. Add products to monitor stock and restock alerts.
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-emerald-800 font-medium">
              <span className="material-symbols-outlined text-[2rem] text-emerald-600 block mb-1">check_circle</span>
              All products have sufficient stock! No restock needed right now.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {lowStockProducts.map((p) => (
                <div 
                  key={p.id}
                  className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between gap-3 border border-outline-variant/10"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-surface-container shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold text-xs text-on-surface truncate">{p.name}</div>
                      <div className="text-[0.6875rem] text-amber-900 font-bold">
                        {p.stock === 0 ? 'Out of stock (0)' : `Only ${p.stock} left (Alert at ${p.minStockAlert})`}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRestockProduct(p)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                  >
                    + Restock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
