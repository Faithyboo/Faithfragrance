import React, { useState } from 'react';
import { Product, LogType, StockLog } from '../types';

interface StockAdjustModalProps {
  isOpen: boolean;
  product: Product | null;
  initialMode?: 'add' | 'reduce';
  onClose: () => void;
  onConfirm: (productId: string, delta: number, log: StockLog) => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  product,
  initialMode = 'add',
  onClose,
  onConfirm
}) => {
  const [mode, setMode] = useState<'add' | 'reduce'>(initialMode);
  const [quantity, setQuantity] = useState<number>(5);
  const [note, setNote] = useState<string>('');

  // Update mode when initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setQuantity(5);
    setNote(initialMode === 'add' ? 'Supplier restock' : 'Sold in boutique');
  }, [initialMode, product]);

  if (!isOpen || !product) return null;

  const delta = mode === 'add' ? quantity : -quantity;
  const newStock = Math.max(0, product.stock + delta);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      alert('Please enter a quantity greater than 0.');
      return;
    }

    let logType: LogType = mode === 'add' ? 'restock' : 'sale';
    if (note.toLowerCase().includes('damage') || note.toLowerCase().includes('broken')) {
      logType = 'damaged';
    } else if (note.toLowerCase().includes('adjust') || note.toLowerCase().includes('count')) {
      logType = 'adjustment';
    }

    const log: StockLog = {
      id: 'log-' + Date.now(),
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      productId: product.id,
      productName: product.name,
      type: logType,
      quantityChange: delta,
      resultingStock: newStock,
      note: note || (mode === 'add' ? 'Stock addition' : 'Stock reduction')
    };

    onConfirm(product.id, delta, log);
    onClose();
  };

  const quickNotesAdd = ['Supplier shipment', 'Warehouse restock', 'Found inventory', 'Customer return'];
  const quickNotesReduce = ['Sold in boutique', 'Damaged / broken flacon', 'Tester bottle', 'Inventory count adjustment'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-4">
      <div 
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md border border-outline-variant/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-10 h-10 rounded-lg object-cover bg-surface-container" 
            />
            <div>
              <h2 className="font-title-md font-semibold text-on-surface line-clamp-1">{product.name}</h2>
              <p className="text-xs text-on-surface-variant">Current Stock: <strong className="text-on-surface">{product.stock} units</strong></p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[1.25rem]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
            <button
              type="button"
              onClick={() => {
                setMode('add');
                if (!note || quickNotesReduce.includes(note)) setNote('Supplier shipment');
              }}
              className={`py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'add'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[1.125rem]">add_circle</span>
              <span>+ Add Stock</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('reduce');
                if (!note || quickNotesAdd.includes(note)) setNote('Sold in boutique');
              }}
              className={`py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'reduce'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[1.125rem]">remove_circle</span>
              <span>- Reduce Stock</span>
            </button>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Quantity to {mode === 'add' ? 'Add' : 'Deduct'}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="w-12 h-12 rounded-xl bg-surface-container-low text-on-surface font-bold text-xl hover:bg-surface-container flex items-center justify-center border border-outline-variant/20 cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="flex-1 h-12 px-4 rounded-xl bg-surface-container-low text-center font-bold text-2xl font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/20"
              />
              <button
                type="button"
                onClick={() => setQuantity(prev => prev + 1)}
                className="w-12 h-12 rounded-xl bg-surface-container-low text-on-surface font-bold text-xl hover:bg-surface-container flex items-center justify-center border border-outline-variant/20 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Calculated Preview Box */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">New Total Stock:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-on-surface-variant line-through">{product.stock}</span>
              <span className="text-xs text-on-surface-variant">→</span>
              <span className="text-lg font-bold font-mono text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                {newStock} units
              </span>
            </div>
          </div>

          {/* Reason / Note */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Reason / Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Received new shipment from lab"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/20"
            />
            {/* Quick Note Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(mode === 'add' ? quickNotesAdd : quickNotesReduce).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNote(preset)}
                  className={`text-[0.6875rem] px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                    note === preset 
                      ? 'bg-on-surface text-on-primary font-semibold' 
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
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
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[1.125rem]">check</span>
              <span>Update Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
