import React, { useState } from 'react';
import { SaleRecord, Product } from '../types';
import { formatCFA, CURRENCY_LABEL } from '../utils/currency';

interface SalesRegisterViewProps {
  sales: SaleRecord[];
  products: Product[];
  onOpenRecordSale: () => void;
  onSelectCustomerByName?: (customerName: string) => void;
}

export const SalesRegisterView: React.FC<SalesRegisterViewProps> = ({
  sales,
  products,
  onOpenRecordSale,
  onSelectCustomerByName
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState<SaleRecord | null>(null);

  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalItemsSold = sales.reduce((acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  const averageSaleValue = sales.length > 0 ? totalSalesRevenue / sales.length : 0;

  return (
    <div className="space-y-6">
      {/* Sales Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Total Sales Revenue</span>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800 truncate" title={formatCFA(totalSalesRevenue)}>
              {formatCFA(totalSalesRevenue)}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">From {sales.length} completed transactions</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Total Bottles / Items Sold</span>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-primary">
              {totalItemsSold} <span className="text-sm font-normal text-on-surface-variant">units</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">Deducted from inventory</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Average Order Value</span>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface truncate" title={formatCFA(averageSaleValue)}>
              {formatCFA(averageSaleValue)}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">Per transaction in {CURRENCY_LABEL}</p>
          </div>
        </div>
      </div>

      {/* Sales Action Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-title-md font-semibold text-on-surface">Recorded Sales Ledger</h2>
          <p className="text-xs text-on-surface-variant">Whenever you record a sale, inventory stock and customer purchase history update automatically.</p>
        </div>
        <button
          type="button"
          onClick={onOpenRecordSale}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
        >
          <span className="material-symbols-outlined text-[1.125rem]">add_shopping_cart</span>
          <span>Record New Sale</span>
        </button>
      </div>

      {/* Sales Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
        {sales.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant space-y-2">
            <span className="material-symbols-outlined text-[3rem] text-on-surface-variant/40">receipt_long</span>
            <p className="font-semibold text-on-surface">No sales recorded yet</p>
            <p className="text-xs">Click &quot;Record New Sale&quot; to log your first customer purchase.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/20">
                <tr>
                  <th className="py-3.5 px-4">Receipt &amp; Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items Sold</th>
                  <th className="py-3.5 px-4">Payment &amp; Status</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                {sales.map((sale) => {
                  const receiptNo = sale.receiptNumber || `REC-${sale.id.replace('sale-', '').slice(-6)}`;
                  const orderStatus = sale.status || 'Completed';

                  return (
                    <tr key={sale.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-xs text-on-surface">{receiptNo}</div>
                        <div className="text-[0.6875rem] text-on-surface-variant">{sale.date}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {sale.customerName ? (
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[1rem] text-primary">person</span>
                            <span className="font-semibold text-xs text-on-surface">
                              {sale.customerName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-on-surface-variant italic">Guest Walk-in</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {sale.items.map((item, idx) => (
                            <div key={idx} className="font-semibold text-on-surface text-xs">
                              {item.quantity}x {item.productName} ({formatCFA(item.price)} each)
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-on-surface">
                            {sale.paymentMethod}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[0.625rem] font-bold bg-emerald-100 text-emerald-800">
                            {orderStatus}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-base text-emerald-800 whitespace-nowrap">
                        {formatCFA(sale.totalAmount)}
                        {sale.discount && sale.discount > 0 && (
                          <div className="text-[0.625rem] text-amber-800 font-sans">
                            Disc: -{formatCFA(sale.discount)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(sale)}
                          className="px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-medium cursor-pointer transition-colors"
                        >
                          View Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simple Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm border border-outline-variant/30 p-6 space-y-4">
            <div className="text-center space-y-1 border-b border-outline-variant/20 pb-4">
              <h3 className="font-headline-md font-bold text-on-surface text-lg">Faith Fragrance Management System</h3>
              <p className="text-xs text-on-surface-variant">Sales Receipt &amp; Voucher</p>
              <div className="pt-1 flex items-center justify-center gap-2 text-[0.6875rem] font-mono text-on-surface-variant">
                <span className="font-bold text-primary">
                  {selectedReceipt.receiptNumber || `REC-${selectedReceipt.id.replace('sale-', '').slice(-6)}`}
                </span>
                <span>•</span>
                <span>{selectedReceipt.date}</span>
              </div>
              {selectedReceipt.customerName && (
                <div className="pt-1 text-xs font-semibold text-primary">
                  Client: {selectedReceipt.customerName}
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-[0.6875rem] font-bold uppercase tracking-wider text-on-surface-variant pb-1">
                Purchased Fragrances
              </div>
              {selectedReceipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-0.5 border-b border-outline-variant/5">
                  <div>
                    <span className="font-semibold">{it.quantity}x {it.productName}</span>
                    <span className="text-[0.6875rem] text-on-surface-variant block">@{formatCFA(it.price)} each</span>
                  </div>
                  <span className="font-mono font-bold">{formatCFA(it.quantity * it.price)}</span>
                </div>
              ))}
            </div>

            {selectedReceipt.discount && selectedReceipt.discount > 0 && (
              <div className="flex justify-between text-xs text-amber-900 pt-1">
                <span>Discount Applied:</span>
                <span className="font-mono font-bold">-{formatCFA(selectedReceipt.discount)}</span>
              </div>
            )}

            <div className="border-t border-outline-variant/20 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-sm">Total Paid ({selectedReceipt.paymentMethod}):</span>
              <span className="font-mono font-bold text-xl text-primary">{formatCFA(selectedReceipt.totalAmount)}</span>
            </div>

            <div className="pt-2 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-surface-container-low text-xs font-semibold hover:bg-surface-container cursor-pointer transition-colors"
              >
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
