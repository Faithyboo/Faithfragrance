import React, { useState, useMemo } from 'react';
import { Customer, SaleRecord } from '../types';
import { formatCFA, CURRENCY_LABEL } from '../utils/currency';
import { CustomerDetailModal } from './CustomerDetailModal';

interface CustomersViewProps {
  customers: Customer[];
  sales: SaleRecord[];
  onOpenAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onRecordSaleForCustomer: (customer: Customer) => void;
  onViewReceipt: (sale: SaleRecord) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  sales,
  onOpenAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onRecordSaleForCustomer,
  onViewReceipt
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [sortBy, setSortBy] = useState<'spent' | 'purchases' | 'recent' | 'name'>('spent');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Pre-calculate purchase statistics per customer
  const customerStatsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        purchaseCount: number;
        totalSpent: number;
        lastPurchaseDate: string;
        lastPurchaseTimestamp: number;
        favoriteCategory: string;
      }
    >();

    customers.forEach((c) => {
      const custSales = sales.filter(
        (s) => s.customerId === c.id || (s.customerName && s.customerName.toLowerCase() === c.fullName.toLowerCase())
      );

      const purchaseCount = custSales.length;
      const totalSpent = custSales.reduce((acc, s) => acc + s.totalAmount, 0);

      // Sort to get latest purchase
      const sortedSales = [...custSales].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      const lastPurchase = sortedSales[0];
      const lastPurchaseDate = lastPurchase ? lastPurchase.date : 'Never';
      const lastPurchaseTimestamp = lastPurchase?.timestamp || 0;

      // Find top category
      const categoryTally: Record<string, number> = {};
      custSales.forEach((s) => {
        s.items.forEach((it) => {
          const cat = it.category || 'Personal Fragrance';
          categoryTally[cat] = (categoryTally[cat] || 0) + it.quantity;
        });
      });

      let favoriteCategory = 'None yet';
      let highestQty = 0;
      Object.entries(categoryTally).forEach(([cat, qty]) => {
        if (qty > highestQty) {
          highestQty = qty;
          favoriteCategory = cat;
        }
      });

      map.set(c.id, {
        purchaseCount,
        totalSpent,
        lastPurchaseDate,
        lastPurchaseTimestamp,
        favoriteCategory: purchaseCount > 0 ? (favoriteCategory !== 'None yet' ? favoriteCategory : 'Personal Fragrance') : 'None yet'
      });
    });

    return map;
  }, [customers, sales]);

  // Overall Top Metrics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === 'Active').length;
  const repeatBuyers = customers.filter((c) => (customerStatsMap.get(c.id)?.purchaseCount || 0) >= 2).length;
  const totalCustomerRevenue = Array.from(customerStatsMap.values()).reduce((sum, s) => sum + s.totalSpent, 0);

  // Find VIP client
  const topClient = useMemo<{ customer: Customer; spent: number } | null>(() => {
    let top: { customer: Customer; spent: number } | null = null;
    customers.forEach((c) => {
      const spent = customerStatsMap.get(c.id)?.totalSpent || 0;
      if (spent > 0 && (!top || spent > top.spent)) {
        top = { customer: c, spent };
      }
    });
    return top;
  }, [customers, customerStatsMap]);

  // Filtered & Sorted Customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          c.fullName.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.phoneNumber.toLowerCase().includes(query) ||
          c.whatsappNumber.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.address.toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        const statsA = customerStatsMap.get(a.id) || {
          purchaseCount: 0,
          totalSpent: 0,
          lastPurchaseTimestamp: 0,
          lastPurchaseDate: '',
          favoriteCategory: ''
        };
        const statsB = customerStatsMap.get(b.id) || {
          purchaseCount: 0,
          totalSpent: 0,
          lastPurchaseTimestamp: 0,
          lastPurchaseDate: '',
          favoriteCategory: ''
        };

        if (sortBy === 'spent') {
          return statsB.totalSpent - statsA.totalSpent;
        }
        if (sortBy === 'purchases') {
          return statsB.purchaseCount - statsA.purchaseCount;
        }
        if (sortBy === 'recent') {
          return statsB.lastPurchaseTimestamp - statsA.lastPurchaseTimestamp;
        }
        return a.fullName.localeCompare(b.fullName);
      });
  }, [customers, searchQuery, statusFilter, sortBy, customerStatsMap]);

  // Clean phone helper for WhatsApp
  const cleanPhoneForWhatsApp = (phoneStr: string) => {
    return phoneStr.replace(/\D/g, '');
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Registered Clients
            </span>
            <span className="material-symbols-outlined text-primary text-[1.25rem]">group</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
              {totalCustomers}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              <span className="text-emerald-700 font-semibold">{activeCustomers} Active</span> • {totalCustomers - activeCustomers} Inactive
            </p>
          </div>
        </div>

        {/* Repeat Buyers */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Repeat Loyalists
            </span>
            <span className="material-symbols-outlined text-secondary text-[1.25rem]">loyalty</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-secondary">
              {repeatBuyers}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Clients with 2+ boutique purchases
            </p>
          </div>
        </div>

        {/* Total Customer Revenue */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Client Revenue
            </span>
            <span className="material-symbols-outlined text-emerald-700 text-[1.25rem]">payments</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800 truncate" title={formatCFA(totalCustomerRevenue)}>
              {formatCFA(totalCustomerRevenue)}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Recorded in {CURRENCY_LABEL}
            </p>
          </div>
        </div>

        {/* Top VIP Spender */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Top VIP Client
            </span>
            <span className="material-symbols-outlined text-amber-600 text-[1.25rem]">stars</span>
          </div>
          <div className="mt-3">
            {topClient ? (
              <>
                <div className="text-lg font-bold text-on-surface truncate" title={topClient.customer.fullName}>
                  {topClient.customer.fullName}
                </div>
                <p className="text-xs text-amber-800 font-mono font-bold mt-1">
                  {formatCFA(topClient.spent)} total spend
                </p>
              </>
            ) : (
              <>
                <div className="text-base font-semibold text-on-surface-variant">
                  No VIP yet
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Record sales to rank spenders</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Header & Search Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-title-md font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[1.375rem]">contacts</span>
              <span>Customer Database</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Profiles, scent preferences, WhatsApp outreach, and complete purchase history.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAddCustomer}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[1.125rem]">person_add</span>
            <span>+ Add New Customer</span>
          </button>
        </div>

        {/* Search, Status & Sort Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t border-outline-variant/15">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-on-surface-variant text-[1.125rem]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, WhatsApp, email, ID, or location..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[1rem]">close</span>
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3 flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
            {(['All', 'Active', 'Inactive'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-medium"
            >
              <option value="spent">Sort: Highest Total Spent</option>
              <option value="purchases">Sort: Most Purchases</option>
              <option value="recent">Sort: Most Recent Purchase</option>
              <option value="name">Sort: Name (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Cards Grid or Empty State */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[2.5rem]">person_search</span>
          </div>

          {customers.length === 0 ? (
            <div>
              <h3 className="text-base font-semibold text-on-surface">Customer Database is Empty</h3>
              <p className="text-xs text-on-surface-variant mt-1.5 max-w-md mx-auto">
                No customer profiles have been registered yet. Click &quot;+ Add First Customer&quot; or link a client whenever you record a sale.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onOpenAddCustomer}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs shadow-xs inline-flex items-center gap-1.5 hover:bg-primary-container cursor-pointer transition-all active:scale-98"
                >
                  <span className="material-symbols-outlined text-[1.125rem]">person_add</span>
                  <span>+ Add First Customer</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-base font-semibold text-on-surface">No matching customers</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                No customer matches your search filter &quot;{searchQuery}&quot;.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-xs font-semibold hover:bg-surface-container text-on-surface cursor-pointer"
                >
                  Reset Search Filters
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => {
            const stats = customerStatsMap.get(customer.id) || {
              purchaseCount: 0,
              totalSpent: 0,
              lastPurchaseDate: 'Never',
              lastPurchaseTimestamp: 0,
              favoriteCategory: 'None yet'
            };

            const whatsappUrl = `https://wa.me/${cleanPhoneForWhatsApp(customer.whatsappNumber || customer.phoneNumber)}?text=${encodeURIComponent(
              `Hello ${customer.fullName}, greetings from Faith Fragrance Management!`
            )}`;

            return (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Card Header: Avatar, Name, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-headline-md font-bold text-lg flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        {customer.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-headline-md font-bold text-base text-on-surface truncate group-hover:text-primary transition-colors">
                          {customer.fullName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono mt-0.5">
                          <span className="font-semibold text-primary">{customer.id}</span>
                          {customer.address && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[120px]">{customer.address}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold shrink-0 ${
                        customer.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </div>

                  {/* Customer Purchase Stats Box (Matches User Example exactly) */}
                  <div className="mt-4 p-3.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/20 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant font-medium">Purchases:</span>
                      <span className="font-mono font-bold text-on-surface">
                        {stats.purchaseCount} {stats.purchaseCount === 1 ? 'purchase' : 'purchases'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant font-medium">Total spent:</span>
                      <span className="font-mono font-bold text-emerald-800">
                        {formatCFA(stats.totalSpent)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant font-medium">Last purchase:</span>
                      <span className="font-medium text-on-surface">
                        {stats.lastPurchaseDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-outline-variant/10">
                      <span className="text-on-surface-variant font-medium">Favorite category:</span>
                      <span className="font-semibold text-primary truncate max-w-[55%] text-right" title={stats.favoriteCategory}>
                        {stats.favoriteCategory}
                      </span>
                    </div>
                  </div>

                  {/* Contact Chips */}
                  <div className="mt-3 flex items-center justify-between text-xs pt-1" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-1 text-[0.6875rem] font-bold border border-emerald-200"
                        title="Open WhatsApp Chat"
                      >
                        <span className="material-symbols-outlined text-[0.875rem]">chat</span>
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${customer.phoneNumber}`}
                        className="p-1 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface transition-colors"
                        title={`Call ${customer.phoneNumber}`}
                      >
                        <span className="material-symbols-outlined text-[0.9375rem]">call</span>
                      </a>
                    </div>

                    <span className="text-[0.6875rem] text-on-surface-variant font-medium">
                      Prefers {customer.preferredContactMethod}
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-4 pt-3 border-t border-outline-variant/15 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(customer)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>View Orders</span>
                    <span className="material-symbols-outlined text-[0.9375rem]">chevron_right</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEditCustomer(customer)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                      title="Edit Customer"
                    >
                      <span className="material-symbols-outlined text-[1.125rem]">edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRecordSaleForCustomer(customer)}
                      className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-semibold text-xs shadow-xs flex items-center gap-1 hover:bg-primary-container cursor-pointer transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[0.875rem]">add_shopping_cart</span>
                      <span>+ Sale</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Detail & Orders History Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          sales={sales}
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onEditCustomer={(cust) => {
            setSelectedCustomer(null);
            onEditCustomer(cust);
          }}
          onDeleteCustomer={(id) => {
            setSelectedCustomer(null);
            onDeleteCustomer(id);
          }}
          onRecordSaleForCustomer={(cust) => {
            setSelectedCustomer(null);
            onRecordSaleForCustomer(cust);
          }}
          onViewReceipt={onViewReceipt}
        />
      )}
    </div>
  );
};
