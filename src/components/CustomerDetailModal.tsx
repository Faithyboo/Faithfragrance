import React, { useState, useMemo } from 'react';
import { Customer, SaleRecord } from '../types';
import { formatCFA, CURRENCY_LABEL } from '../utils/currency';

interface CustomerDetailModalProps {
  customer: Customer | null;
  sales: SaleRecord[];
  isOpen: boolean;
  onClose: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onRecordSaleForCustomer: (customer: Customer) => void;
  onViewReceipt: (sale: SaleRecord) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  sales,
  isOpen,
  onClose,
  onEditCustomer,
  onDeleteCustomer,
  onRecordSaleForCustomer,
  onViewReceipt
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState<SaleRecord | null>(null);

  // Filter purchases for this specific customer
  const customerPurchases = useMemo(() => {
    if (!customer) return [];
    return sales
      .filter((s) => s.customerId === customer.id || (s.customerName && s.customerName.toLowerCase() === customer.fullName.toLowerCase()))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [customer, sales]);

  // Compute metrics: purchases count, total spent, last purchase, favorite category
  const metrics = useMemo(() => {
    if (!customerPurchases.length) {
      return {
        purchaseCount: 0,
        totalSpent: 0,
        lastPurchaseDate: 'None yet',
        favoriteCategory: 'None yet',
        avgOrderValue: 0
      };
    }

    const purchaseCount = customerPurchases.length;
    const totalSpent = customerPurchases.reduce((acc, s) => acc + s.totalAmount, 0);
    const avgOrderValue = totalSpent / purchaseCount;
    const lastPurchaseDate = customerPurchases[0]?.date || 'Recent';

    // Calculate favorite category based on item categories or product names
    const categoryCount: Record<string, number> = {};
    customerPurchases.forEach((sale) => {
      sale.items.forEach((item) => {
        const cat = item.category || 'Personal Fragrance';
        categoryCount[cat] = (categoryCount[cat] || 0) + item.quantity;
      });
    });

    let topCategory = 'Personal Fragrance';
    let maxCount = 0;
    Object.entries(categoryCount).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCategory = cat;
      }
    });

    return {
      purchaseCount,
      totalSpent,
      lastPurchaseDate,
      favoriteCategory: topCategory,
      avgOrderValue
    };
  }, [customerPurchases]);

  if (!isOpen || !customer) return null;

  // Clean phone for WhatsApp link
  const cleanPhoneForWhatsApp = (phoneStr: string) => {
    const digits = phoneStr.replace(/\D/g, '');
    return digits;
  };

  const whatsappLink = `https://wa.me/${cleanPhoneForWhatsApp(customer.whatsappNumber || customer.phoneNumber)}?text=${encodeURIComponent(
    `Hello ${customer.fullName}, greetings from Faith Fragrance Management!`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-3xl border border-outline-variant/30 my-6 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-5 bg-surface-container-low border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary font-headline-md font-bold text-xl flex items-center justify-center shadow-sm">
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface">
                  {customer.fullName}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  customer.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}>
                  {customer.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-on-surface-variant font-mono mt-0.5">
                <span className="font-bold text-primary">{customer.id}</span>
                <span>•</span>
                <span>Registered: {customer.dateRegistered}</span>
                <span>•</span>
                <span className="text-secondary font-semibold">Prefers {customer.preferredContactMethod}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRecordSaleForCustomer(customer)}
              className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[1.125rem]">add_shopping_cart</span>
              <span>+ Record Sale</span>
            </button>
            <button
              type="button"
              onClick={() => onEditCustomer(customer)}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium cursor-pointer transition-colors"
              title="Edit Profile"
            >
              <span className="material-symbols-outlined text-[1.25rem]">edit</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[1.25rem]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Executive Overview KPI Highlight (Matches user example) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Purchases Count */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
              <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-on-surface-variant">
                Purchase History
              </span>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-bold font-mono text-on-surface">
                  {metrics.purchaseCount} {metrics.purchaseCount === 1 ? 'purchase' : 'purchases'}
                </div>
                <span className="text-[0.6875rem] text-on-surface-variant">Total orders placed</span>
              </div>
            </div>

            {/* 2. Total Spent in FCFA */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between">
              <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-emerald-800">
                Total Spent
              </span>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-900 truncate" title={formatCFA(metrics.totalSpent)}>
                  {formatCFA(metrics.totalSpent)}
                </div>
                <span className="text-[0.6875rem] text-emerald-700">Lifetime revenue in {CURRENCY_LABEL}</span>
              </div>
            </div>

            {/* 3. Last Purchase */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
              <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-on-surface-variant">
                Last Purchase
              </span>
              <div className="mt-2">
                <div className="text-base sm:text-lg font-bold text-on-surface truncate">
                  {metrics.lastPurchaseDate}
                </div>
                <span className="text-[0.6875rem] text-on-surface-variant">Most recent activity</span>
              </div>
            </div>

            {/* 4. Favorite Category */}
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col justify-between">
              <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-primary">
                Favorite Category
              </span>
              <div className="mt-2">
                <div className="text-base sm:text-lg font-bold text-on-surface truncate" title={metrics.favoriteCategory}>
                  {metrics.favoriteCategory}
                </div>
                <span className="text-[0.6875rem] text-primary/80">Most loved fragrance type</span>
              </div>
            </div>
          </div>

          {/* Contact Details & Direct Outreach */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Information */}
            <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/20 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[1.125rem] text-primary">contact_phone</span>
                <span>Contact Channels</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant font-medium">Phone:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-on-surface">{customer.phoneNumber}</span>
                    <a
                      href={`tel:${customer.phoneNumber}`}
                      className="p-1 rounded-md bg-surface-container text-primary hover:bg-primary hover:text-on-primary transition-colors"
                      title="Call Phone"
                    >
                      <span className="material-symbols-outlined text-[1rem]">call</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant font-medium">WhatsApp:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-emerald-800">{customer.whatsappNumber}</span>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-semibold flex items-center gap-1 hover:bg-emerald-700 transition-colors shadow-xs"
                      title="Chat on WhatsApp"
                    >
                      <span className="material-symbols-outlined text-[0.875rem]">chat</span>
                      <span>Chat</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant font-medium">Email:</span>
                  {customer.email ? (
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {customer.email}
                    </a>
                  ) : (
                    <span className="text-on-surface-variant italic">Not provided</span>
                  )}
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-on-surface-variant font-medium">Address / Quarter:</span>
                  <span className="text-on-surface font-semibold text-right max-w-[60%] truncate">
                    {customer.address || 'Boutique Pickup / Local'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes & Fragrance Preferences */}
            <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/20 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5 mb-2.5">
                  <span className="material-symbols-outlined text-[1.125rem] text-secondary">sentiment_satisfied</span>
                  <span>Notes &amp; Scent Profile</span>
                </h3>
                {customer.notes ? (
                  <p className="text-xs text-on-surface bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20 italic leading-relaxed whitespace-pre-line">
                    &ldquo;{customer.notes}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant italic bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10">
                    No special notes recorded. Tap &quot;Edit&quot; to note favourite fragrances, perfume bottles, or VIP preferences.
                  </p>
                )}
              </div>

              <div className="pt-3 text-[0.6875rem] text-on-surface-variant flex items-center justify-between border-t border-outline-variant/10 mt-3">
                <span>Preferred Contact: <strong>{customer.preferredContactMethod}</strong></span>
                <button
                  type="button"
                  onClick={() => onEditCustomer(customer)}
                  className="text-primary font-semibold hover:underline cursor-pointer"
                >
                  Edit notes
                </button>
              </div>
            </div>
          </div>

          {/* Complete Purchase History Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-title-md font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[1.25rem]">receipt_long</span>
                  <span>Every Order &amp; Purchase History</span>
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Detailed ledger of every transaction made by {customer.fullName}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRecordSaleForCustomer(customer)}
                className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-[1rem] text-primary">add</span>
                <span>New Order</span>
              </button>
            </div>

            {customerPurchases.length === 0 ? (
              <div className="p-8 rounded-2xl bg-surface-container-low/50 border border-outline-variant/20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[1.75rem]">shopping_bag</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">No purchases recorded yet</h4>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
                    When you record a sale and link {customer.fullName}, every bottle, unit price, discount, and receipt appears right here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRecordSaleForCustomer(customer)}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 cursor-pointer hover:bg-primary-container"
                >
                  <span className="material-symbols-outlined text-[1rem]">add_shopping_cart</span>
                  <span>Record First Purchase</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {customerPurchases.map((purchase) => {
                  const receiptNo = purchase.receiptNumber || `REC-${purchase.id.replace('sale-', '').slice(-6)}`;
                  const orderStatus = purchase.status || 'Completed';

                  return (
                    <div
                      key={purchase.id}
                      className="p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20 hover:border-outline-variant/50 transition-all space-y-3"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/10 pb-2.5">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-surface-container font-mono text-xs font-bold text-on-surface">
                            {receiptNo}
                          </span>
                          <span className="text-xs text-on-surface-variant font-medium">
                            {purchase.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold bg-emerald-100 text-emerald-800">
                            {orderStatus}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold bg-surface-container text-on-surface">
                            {purchase.paymentMethod}
                          </span>
                          <button
                            type="button"
                            onClick={() => onViewReceipt(purchase)}
                            className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-primary cursor-pointer transition-colors"
                          >
                            Receipt
                          </button>
                        </div>
                      </div>

                      {/* Products List Breakdown */}
                      <div className="space-y-1.5 text-xs">
                        <div className="grid grid-cols-12 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider pb-1">
                          <div className="col-span-6">Products Purchased</div>
                          <div className="col-span-2 text-center">Quantity</div>
                          <div className="col-span-2 text-right">Unit Price</div>
                          <div className="col-span-2 text-right">Total</div>
                        </div>

                        {purchase.items.map((item, idx) => {
                          const itemTotal = item.quantity * item.price;
                          return (
                            <div key={idx} className="grid grid-cols-12 items-center py-1 border-t border-outline-variant/5 text-on-surface">
                              <div className="col-span-6 font-semibold truncate" title={item.productName}>
                                {item.productName}
                              </div>
                              <div className="col-span-2 text-center font-mono font-bold">
                                {item.quantity}
                              </div>
                              <div className="col-span-2 text-right font-mono text-on-surface-variant">
                                {formatCFA(item.price)}
                              </div>
                              <div className="col-span-2 text-right font-mono font-bold text-on-surface">
                                {formatCFA(itemTotal)}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Order Footer with Total Paid & Discount */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-outline-variant/15 text-xs">
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <span>Method: <strong>{purchase.paymentMethod}</strong></span>
                          {purchase.discount && purchase.discount > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[0.6875rem]">
                              Discount: -{formatCFA(purchase.discount)}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-on-surface-variant font-medium">Total Paid:</span>
                          <span className="font-mono font-bold text-base sm:text-lg text-emerald-800">
                            {formatCFA(purchase.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete customer ${customer.fullName}? Past sales records will be kept.`)) {
                onDeleteCustomer(customer.id);
                onClose();
              }
            }}
            className="text-xs text-error hover:underline font-semibold cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[1rem]">delete</span>
            <span>Delete Customer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onRecordSaleForCustomer(customer)}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer hover:bg-primary-container active:scale-98"
            >
              <span className="material-symbols-outlined text-[1rem]">add_shopping_cart</span>
              <span>+ Record Sale for {customer.fullName.split(' ')[0]}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
