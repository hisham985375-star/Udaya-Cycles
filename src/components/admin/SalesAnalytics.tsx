"use client";

import { useState, useMemo } from "react";
import { TrendingUp, BarChart3, IndianRupee, ShoppingBag, CheckCircle2, Clock } from "lucide-react";

export interface IDayData {
  date: string;
  label: string;
  fullDate: string;
  allRevenue: number;
  paidRevenue: number;
  allOrders: number;
  paidOrders: number;
}

export interface ITopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface ISalesAnalyticsProps {
  initialDailyData: IDayData[];
  topProducts: ITopProduct[];
  kpis: {
    totalGross: number;
    totalPaid: number;
    totalOrders: number;
    paidOrdersCount: number;
    avgOrderValue: number;
  };
}

export default function SalesAnalytics({
  initialDailyData,
  topProducts,
  kpis,
}: ISalesAnalyticsProps) {
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
  const [filter, setFilter] = useState<"all" | "paid">("all");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Determine active values based on filters
  const chartData = useMemo(() => {
    return initialDailyData.map((d) => ({
      ...d,
      value:
        metric === "revenue"
          ? filter === "paid"
            ? d.paidRevenue
            : d.allRevenue
          : filter === "paid"
          ? d.paidOrders
          : d.allOrders,
    }));
  }, [initialDailyData, metric, filter]);

  // Max value for scaling
  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.value), 0);
    return max === 0 ? 10 : max;
  }, [chartData]);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const step = maxValue / 4;
    return [maxValue, step * 3, step * 2, step, 0];
  }, [maxValue]);

  const activeHoverData = hoveredIndex !== null ? chartData[hoveredIndex] : null;

  return (
    <div className="bg-surface-raised rounded-2xl border border-border shadow-sm p-6 flex flex-col h-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-accent/10 text-accent">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-text-primary uppercase tracking-wide">
              Sales Analytics
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-accent/15 text-accent border border-accent/30 uppercase tracking-widest">
              Live Data
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Aggregated order revenue and volume across {kpis.totalOrders} test orders
          </p>
        </div>

        {/* Controls: Metric & Filter Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Revenue vs Orders Toggle */}
          <div className="inline-flex rounded-xl p-1 bg-surface border border-border text-xs">
            <button
              onClick={() => setMetric("revenue")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                metric === "revenue"
                  ? "bg-accent text-text-inverse shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Revenue (₹)
            </button>
            <button
              onClick={() => setMetric("orders")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                metric === "orders"
                  ? "bg-accent text-text-inverse shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Orders (Qty)
            </button>
          </div>

          {/* All Orders vs Paid Only */}
          <div className="inline-flex rounded-xl p-1 bg-surface border border-border text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                filter === "all"
                  ? "bg-surface-overlay text-text-primary border border-border"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="Include all confirmed & pending test orders"
            >
              All Orders ({kpis.totalOrders})
            </button>
            <button
              onClick={() => setFilter("paid")}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                filter === "paid"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="Show only payment-confirmed paid orders"
            >
              Paid Only ({kpis.paidOrdersCount})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-surface p-3.5 rounded-xl border border-border">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Total Gross</span>
            <IndianRupee className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="text-xl font-mono font-bold text-text-primary">
            ₹{kpis.totalGross.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">All 17 test orders</div>
        </div>

        <div className="bg-surface p-3.5 rounded-xl border border-border">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Paid Revenue</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          </div>
          <div className="text-xl font-mono font-bold text-green-400">
            ₹{kpis.totalPaid.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">
            {kpis.paidOrdersCount} orders confirmed
          </div>
        </div>

        <div className="bg-surface p-3.5 rounded-xl border border-border">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Total Volume</span>
            <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-mono font-bold text-text-primary">
            {kpis.totalOrders}{" "}
            <span className="text-xs font-normal text-text-muted">orders</span>
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">
            Avg: ₹{Math.round(kpis.avgOrderValue).toLocaleString("en-IN")} / order
          </div>
        </div>

        <div className="bg-surface p-3.5 rounded-xl border border-border">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Pending Pymt</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-bold text-amber-400">
            {kpis.totalOrders - kpis.paidOrdersCount}{" "}
            <span className="text-xs font-normal text-text-muted">orders</span>
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">COD / Test pending</div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 w-full bg-surface rounded-xl border border-border p-4 relative flex flex-col justify-between min-h-[260px]">
        {/* Hover Tooltip Overlay */}
        {activeHoverData && (
          <div className="absolute top-4 right-4 z-20 bg-surface-raised/95 border border-accent/40 rounded-xl p-3 shadow-2xl backdrop-blur-md pointer-events-none text-xs min-w-[180px] animate-fade-in">
            <div className="font-bold text-accent mb-1">{activeHoverData.fullDate}</div>
            <div className="space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-text-muted">Total Revenue:</span>
                <span className="font-mono font-bold text-text-primary">
                  ₹{activeHoverData.allRevenue.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-muted">Paid Revenue:</span>
                <span className="font-mono font-bold text-green-400">
                  ₹{activeHoverData.paidRevenue.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between gap-4 pt-1 border-t border-border">
                <span className="text-text-muted">Total Orders:</span>
                <span className="font-mono font-bold text-text-primary">
                  {activeHoverData.allOrders} orders
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-muted">Paid Orders:</span>
                <span className="font-mono font-bold text-green-400">
                  {activeHoverData.paidOrders}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SVG Chart */}
        <div className="w-full flex-1 flex flex-col justify-end relative mt-2 mb-2">
          {/* Horizontal Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-25">
            {yTicks.map((tick, i) => (
              <div key={i} className="w-full flex items-center gap-2 border-b border-border/60">
                <span className="text-[9px] font-mono text-text-muted w-10 text-right shrink-0">
                  {metric === "revenue"
                    ? `₹${Math.round(tick >= 1000 ? tick / 1000 : tick)}${tick >= 1000 ? "k" : ""}`
                    : Math.round(tick)}
                </span>
                <div className="w-full h-px" />
              </div>
            ))}
          </div>

          {/* Bar Columns Container */}
          <div className="w-full h-full flex items-end justify-around pl-12 pr-4 pt-6 z-10 gap-2 sm:gap-4">
            {chartData.map((d, index) => {
              const heightPct = maxValue > 0 ? (d.value / maxValue) * 100 : 0;
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={d.date}
                  className="flex-1 max-w-[80px] h-full flex flex-col items-center justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Bar Value on top */}
                  <div
                    className={`text-[10px] font-mono font-bold mb-1 transition-opacity ${
                      isHovered ? "text-accent opacity-100" : "text-text-muted opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {metric === "revenue"
                      ? `₹${d.value >= 1000 ? `${Math.round(d.value / 1000)}k` : d.value}`
                      : d.value}
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-full flex items-end justify-center">
                    <div
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 relative ${
                        filter === "paid"
                          ? isHovered
                            ? "bg-gradient-to-t from-green-600 to-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                            : "bg-gradient-to-t from-green-900/60 to-green-500/80 border-t border-green-400"
                          : isHovered
                          ? "bg-gradient-to-t from-accent/60 to-accent shadow-[0_0_20px_rgba(239,255,64,0.5)]"
                          : "bg-gradient-to-t from-accent/20 to-accent/80 border-t-2 border-accent"
                      }`}
                    >
                      {/* Highlight cap */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-t-lg" />
                    </div>
                  </div>

                  {/* Day label */}
                  <span
                    className={`text-[11px] font-bold mt-2 uppercase tracking-wider transition-colors ${
                      isHovered ? "text-accent" : "text-text-muted group-hover:text-text-primary"
                    }`}
                  >
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products Quick Footer */}
        {topProducts.length > 0 && (
          <div className="pt-3 border-t border-border/80 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-[11px] uppercase tracking-wider font-bold text-text-muted flex items-center gap-1.5 shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
              Top Cycles in Test Orders:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {topProducts.map((p) => (
                <div
                  key={p.name}
                  className="px-2.5 py-1 rounded-lg bg-surface-raised border border-border flex items-center gap-1.5"
                >
                  <span className="font-semibold text-text-primary">{p.name}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-accent/15 text-accent">
                    {p.quantity} sold
                  </span>
                  <span className="text-[10px] text-text-muted">
                    (₹{(p.revenue).toLocaleString("en-IN")})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
