'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Users,
  Award,
  UserCheck,
  Settings,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Coffee,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BrewFlowLogo } from '@/components/ui/BrewFlowLogo';

const SALES_DATA = [
  { date: 'Apr 21', sales: 1400, orders: 22 },
  { date: 'Apr 22', sales: 1650, orders: 26 },
  { date: 'Apr 23', sales: 1520, orders: 24 },
  { date: 'Apr 24', sales: 1890, orders: 30 },
  { date: 'Apr 25', sales: 2100, orders: 34 },
  { date: 'Apr 26', sales: 1980, orders: 31 },
  { date: 'Apr 27', sales: 2440, orders: 39 },
];

const TOP_SELLING_ITEMS = [
  {
    rank: 1,
    name: 'Iced Latte',
    count: 42,
    imageUrl: '/images/iced-latte.jpg',
  },
  {
    rank: 2,
    name: 'Spanish Latte',
    count: 28,
    imageUrl: '/images/spanish-latte.jpg',
  },
  {
    rank: 3,
    name: 'Matcha Latte',
    count: 24,
    imageUrl: '/images/matcha-latte.jpg',
  },
  {
    rank: 4,
    name: 'Caramel Macchiato',
    count: 18,
    imageUrl: '/images/caramel-macchiato.jpg',
  },
  {
    rank: 5,
    name: 'Blueberry Muffin',
    count: 16,
    imageUrl: '/images/blueberry-muffin.jpg',
  },
];

export function BrewFlowOwnerDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('Last 7 days');

  return (
    <div className="flex flex-col lg:flex-row min-h-[820px] rounded-3xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-md overflow-hidden">
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Dark Charcoal / Forest Green)           */}
      {/* ========================================================= */}
      <aside className="w-full lg:w-64 bg-[#111827] text-white p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="px-2">
            <BrewFlowLogo size="md" variant="light" />
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveNav('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeNav === 'dashboard'
                  ? 'bg-[#133E2B] text-white'
                  : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveNav('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeNav === 'orders'
                  ? 'bg-[#133E2B] text-white'
                  : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Orders</span>
            </button>

            <button
              onClick={() => setActiveNav('menu')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeNav === 'menu'
                  ? 'bg-[#133E2B] text-white'
                  : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Menu</span>
            </button>

            <button
              onClick={() => setActiveNav('customers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeNav === 'customers'
                  ? 'bg-[#133E2B] text-white'
                  : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Customers</span>
            </button>

            <button
              onClick={() => setActiveNav('loyalty')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeNav === 'loyalty'
                  ? 'bg-[#133E2B] text-white'
                  : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Loyalty</span>
            </button>

            <button
              onClick={() => setActiveNav('staff')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeNav === 'staff'
                  ? 'bg-[#133E2B] text-white'
                  : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Staff</span>
            </button>

            <button
              onClick={() => setActiveNav('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeNav === 'settings'
                  ? 'bg-[#133E2B] text-white'
                  : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Owner Profile Card (Maria Santos) */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#133E2B] text-white font-bold text-xs">
            MS
          </div>
          <div>
            <div className="text-xs font-bold text-white">Maria Santos</div>
            <div className="text-[11px] text-[#9CA3AF]">Owner</div>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN DASHBOARD CONTENT (Showcase Middle-Right)         */}
      {/* ========================================================= */}
      <main className="flex-1 p-6 lg:p-8 space-y-8 bg-[#F8F6F0] overflow-y-auto">
        {/* Top Header with Date Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            Dashboard
          </h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] text-xs font-semibold text-[#111827] shadow-xs hover:bg-[#F9F9F8] transition-colors cursor-pointer"
            >
              <span>{timeRange}</span>
              <ChevronDown className="h-4 w-4 text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Sales */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
            <span className="text-xs font-semibold text-[#6B7280]">
              Total Sales
            </span>
            <div className="text-2xl font-bold tracking-tight text-[#111827]">
              P12,480
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#15803D]">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>12% vs last week</span>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
            <span className="text-xs font-semibold text-[#6B7280]">
              Total Orders
            </span>
            <div className="text-2xl font-bold tracking-tight text-[#111827]">
              186
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#15803D]">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>18% vs last week</span>
            </div>
          </div>

          {/* Card 3: Active Customers */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
            <span className="text-xs font-semibold text-[#6B7280]">
              Active Customers
            </span>
            <div className="text-2xl font-bold tracking-tight text-[#111827]">
              142
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#15803D]">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>25% vs last week</span>
            </div>
          </div>

          {/* Card 4: Loyalty Redemptions */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
            <span className="text-xs font-semibold text-[#6B7280]">
              Loyalty Redemptions
            </span>
            <div className="text-2xl font-bold tracking-tight text-[#111827]">
              32
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#15803D]">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>45% vs last week</span>
            </div>
          </div>
        </div>

        {/* 2 Main Visual Widgets (Sales Overview & Top Selling Items) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Widget: Sales Overview Line Chart (7 Cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#111827]">
                Sales Overview
              </h3>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#06B6D4]" />
                  <span className="text-[#6B7280]">Sales</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                  <span className="text-[#6B7280]">Orders</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SALES_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3EFEA" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#06B6D4"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#06B6D4' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10B981' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Widget: Top Selling Items (5 Cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-5">
            <h3 className="text-base font-bold text-[#111827]">
              Top Selling Items
            </h3>

            <div className="space-y-3">
              {TOP_SELLING_ITEMS.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-[#F8F6F0] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#9CA3AF] w-4">
                      {item.rank}
                    </span>
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#F3EFEA]">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <span className="text-xs font-bold text-[#111827]">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-[#6B7280]">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
