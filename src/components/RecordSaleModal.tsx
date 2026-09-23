import React, { useState, useEffect } from 'react';
import { Product, SaleRecord, StockLog } from '../types';
import { formatCFA, CURRENCY_LABEL } from '../utils/currency';

interface RecordSaleModalProps {
  isOpen: boolean;
  products: Product[];
  selectedProductId?: string;
  onClose: () => void;
  onCompleteSale: (sale: SaleRecord, logs: StockLog[]) => void;
  onOpenAddNewProduct?: () => void;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({
  isOpen,
  products,
  selectedProductId,
  onClose,
  onCompleteSale,
  onOpenAddNewProduct
}) => {
  const [productId, setProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [customerNote, setCustomerNote] = useState<string>('');

  useEffect(() => {
    if (selectedProductId) {
      setProductId(selectedProductId);
    } else if (products.length > 0 && !productId) {
      setProductId(products[0].id);
    }
  }, [selectedProductId, products, isOpen]);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === productId) || products[0];
  const maxStock = currentProduct ? currentProduct.stock : 0;
  const unitPrice = currentProduct ? currentProduct.sellingPrice : 0;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    if (currentProduct.stock <= 0) {
      alert(`"${currentProduct.name}" is currently out of stock!`);
      return;
    }

    if (quantity > currentProduct.stock) {
      alert(`Only ${currentProduct.stock} units available in stock.`);
      return;
    }

    const sale: SaleRecord = {
      id: 'sale-' + Date.now(),
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      items: [
        {
          productId: currentProduct.id,
          productName: currentProduct.name,
          quantity: quantity,
          price: currentProduct.sellingPrice
        }
      ],
      totalAmount: totalPrice,
      paymentMethod
    };

    const newStock = Math.max(0, currentProduct.stock - quantity);
    const log: StockLog = {
      id: 'log-' + Date.now(),
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      productId: currentProduct.id,
      productName: currentProduct.name,
      type: 'sale',
      quantityChange: -quantity,
      resultingStock: newStock,
      note: customerNote ? `Sale: ${customerNote}` : `Sold via ${paymentMethod}`
    };

    onCompleteSale(sale, [log]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-4">
      <div 
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md border border-outline-variant/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[1.5rem]">point_of_sale</span>
            <h2 className="font-title-md font-semibold text-on-surface">Record a Quick Sale</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[1.25rem]">close</span>
          </button>
        </div>

        {/* Form Body or Empty State */}
        {products.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[2.25rem]">inventory_2</span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-on-surface">Your Store is Empty</h3>
              <p className="text-xs text-on-surface-variant mt-1.5 max-w-xs mx-auto">
                There are no products in your inventory yet. Add your perfumes or scented goods first to start recording sales.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-on-surface-variant hover:bg-surface-container"
              >
                Close
              </button>
              {onOpenAddNewProduct && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddNewProduct();
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[1rem]">add</span>
                  <span>Add First Product</span>
                </button>
              )}
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface">
              Select Product Sold
            </label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setQuantity(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/20 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.stock} in stock) - {formatCFA(p.sellingPrice)}
                </option>
              ))}
            </select>
          </div>

          {/* Product Stock Card Preview */}
          {currentProduct && (
            <div className="p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/20 flex items-center gap-3">
              <div className="w-12 h-14 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center p-1 shrink-0">
                <img 
                  src={currentProduct.imageUrl} 
                  alt={currentProduct.name} 
                  className="max-h-full max-w-full object-contain" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-on-surface truncate">{currentProduct.name}</div>
                <div className="text-xs text-on-surface-variant font-mono">
                  {formatCFA(currentProduct.sellingPrice)} • {currentProduct.volumeOrSize || currentProduct.category}
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  currentProduct.stock === 0 ? 'bg-error-container text-on-error-container' :
                  currentProduct.stock <= currentProduct.minStockAlert ? 'bg-amber-100 text-amber-900' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {currentProduct.stock} in stock
                </span>
              </div>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface">
              Quantity Sold
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="w-11 h-11 rounded-xl bg-surface-container-low text-on-surface font-bold text-lg hover:bg-surface-container flex items-center justify-center border border-outline-variant/20 cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={maxStock}
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(maxStock, parseInt(e.target.value, 10) || 1)))}
                className="flex-1 h-11 px-4 rounded-xl bg-surface-container-low text-center font-bold text-xl font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/20"
              />
              <button
                type="button"
                disabled={quantity >= maxStock}
                onClick={() => setQuantity(prev => Math.min(maxStock, prev + 1))}
                className="w-11 h-11 rounded-xl bg-surface-container-low text-on-surface font-bold text-lg hover:bg-surface-container flex items-center justify-center border border-outline-variant/20 cursor-pointer disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Cash', 'Card', 'Transfer', 'Mobile'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-on-surface text-on-primary shadow-xs'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Customer / Receipt Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface">
              Client / Sale Note (Optional)
            </label>
            <input
              type="text"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="e.g. Boutique walk-in or phone order"
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-xs text-on-surface border border-outline-variant/20"
            />
          </div>

          {/* Total Summary in CFA */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
            <span className="text-sm font-semibold text-on-surface">Total Amount:</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-primary truncate" title={formatCFA(totalPrice)}>
              {formatCFA(totalPrice)}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={maxStock <= 0}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[1.125rem]">check_circle</span>
              <span>Confirm &amp; Deduct Stock</span>
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
