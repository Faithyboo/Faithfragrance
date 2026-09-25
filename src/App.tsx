import React, { useState, useEffect } from 'react';
import { Product, StockLog, SaleRecord, Customer } from './types';
import { INITIAL_PRODUCTS, INITIAL_STOCK_LOGS, INITIAL_SALES, INITIAL_CUSTOMERS } from './data/initialData';
import { SimpleHeader, ActiveTab } from './components/SimpleHeader';
import { InventoryView } from './components/InventoryView';
import { CustomersView } from './components/CustomersView';
import { SalesRegisterView } from './components/SalesRegisterView';
import { StockHistoryView } from './components/StockHistoryView';
import { OverviewView } from './components/OverviewView';
import { StockAdjustModal } from './components/StockAdjustModal';
import { ProductFormModal } from './components/ProductFormModal';
import { CustomerFormModal } from './components/CustomerFormModal';
import { RecordSaleModal } from './components/RecordSaleModal';
import { formatCFA } from './utils/currency';

const STORAGE_KEYS = {
  PRODUCTS: 'faith_fragrance_products_empty_v7',
  LOGS: 'faith_fragrance_logs_empty_v7',
  SALES: 'faith_fragrance_sales_empty_v7',
  CUSTOMERS: 'faith_fragrance_customers_v1'
};

// Purge legacy demo data caches so user gets a completely empty store
try {
  [
    'faith_fragrance_products_v1',
    'faith_fragrance_products_v2',
    'faith_fragrance_logs_v2',
    'faith_fragrance_sales_v2',
    'faith_fragrance_products_cfa_v4',
    'faith_fragrance_logs_cfa_v4',
    'faith_fragrance_sales_cfa_v4'
  ].forEach(k => localStorage.removeItem(k));
} catch (e) {
  // Ignore in restricted environments
}

export const App: React.FC = () => {
  // 1. Initial State with LocalStorage fallbacks
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS;
  });

  const [logs, setLogs] = useState<StockLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STOCK_LOGS;
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SALES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SALES;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CUSTOMERS;
  });

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Save to LocalStorage with error safety
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e: any) {
      console.error('Failed to save products:', e);
      if (e?.name === 'QuotaExceededError' || e?.code === 22) {
        showToast('Storage limit reached on this phone/browser. Images are automatically compressed to prevent this.');
      }
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    } catch (e) {
      console.error(e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.error(e);
    }
  }, [customers]);

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('inventory');

  // Modals state
  const [stockModal, setStockModal] = useState<{
    isOpen: boolean;
    product: Product | null;
    mode: 'add' | 'reduce';
  }>({
    isOpen: false,
    product: null,
    mode: 'add'
  });

  const [productForm, setProductForm] = useState<{
    isOpen: boolean;
    productToEdit: Product | null;
  }>({
    isOpen: false,
    productToEdit: null
  });

  const [customerForm, setCustomerForm] = useState<{
    isOpen: boolean;
    customerToEdit: Customer | null;
  }>({
    isOpen: false,
    customerToEdit: null
  });

  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [saleInitialProductId, setSaleInitialProductId] = useState<string | undefined>(undefined);
  const [saleInitialCustomerId, setSaleInitialCustomerId] = useState<string | undefined>(undefined);
  const [standaloneReceipt, setStandaloneReceipt] = useState<SaleRecord | null>(null);

  // Stock Adjustment Handler
  const handleConfirmStockAdjustment = (productId: string, delta: number, log: StockLog) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updated = Math.max(0, p.stock + delta);
        return { ...p, stock: updated };
      }
      return p;
    }));

    setLogs(prev => [log, ...prev]);

    const targetProduct = products.find(p => p.id === productId);
    const actionWord = delta > 0 ? `Added ${delta} units to` : `Deducted ${Math.abs(delta)} units from`;
    showToast(`${actionWord} ${targetProduct?.name || 'product'}.`);
  };

  // Record Sale Handler
  const handleCompleteSale = (newSale: SaleRecord, newLogs: StockLog[]) => {
    setSales(prev => [newSale, ...prev]);
    setLogs(prev => [...newLogs, ...prev]);

    // Deduct stock
    setProducts(prev => prev.map(p => {
      const soldItem = newSale.items.find(item => item.productId === p.id);
      if (soldItem) {
        return {
          ...p,
          stock: Math.max(0, p.stock - soldItem.quantity)
        };
      }
      return p;
    }));

    const clientMsg = newSale.customerName ? ` for ${newSale.customerName}` : '';
    showToast(`Sale recorded${clientMsg} (${formatCFA(newSale.totalAmount)}). Stock & customer ledger updated.`);
  };

  // Add or Edit Product Handler
  const handleSaveProduct = (savedProduct: Product) => {
    const existingIndex = products.findIndex(p => p.id === savedProduct.id);

    if (existingIndex >= 0) {
      // Edit
      const oldStock = products[existingIndex].stock;
      setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));

      if (oldStock !== savedProduct.stock) {
        const delta = savedProduct.stock - oldStock;
        const log: StockLog = {
          id: 'log-' + Date.now(),
          date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          productId: savedProduct.id,
          productName: savedProduct.name,
          type: 'adjustment',
          quantityChange: delta,
          resultingStock: savedProduct.stock,
          note: 'Stock adjusted via Product Edit'
        };
        setLogs(prev => [log, ...prev]);
      }

      showToast(`Updated "${savedProduct.name}".`);
    } else {
      // New
      setProducts(prev => [savedProduct, ...prev]);
      const log: StockLog = {
        id: 'log-' + Date.now(),
        date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        productId: savedProduct.id,
        productName: savedProduct.name,
        type: 'restock',
        quantityChange: savedProduct.stock,
        resultingStock: savedProduct.stock,
        note: 'Initial inventory entry'
      };
      setLogs(prev => [log, ...prev]);
      showToast(`Added "${savedProduct.name}" to inventory.`);
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (confirm(`Are you sure you want to remove "${product.name}" from inventory?`)) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      showToast(`Removed "${product.name}" from inventory.`);
    }
  };

  // Add or Edit Customer Handler
  const handleSaveCustomer = (savedCustomer: Customer) => {
    const existingIndex = customers.findIndex(c => c.id === savedCustomer.id);
    if (existingIndex >= 0) {
      setCustomers(prev => prev.map(c => c.id === savedCustomer.id ? savedCustomer : c));
      showToast(`Updated profile for ${savedCustomer.fullName}.`);
    } else {
      setCustomers(prev => [savedCustomer, ...prev]);
      showToast(`Registered new customer: ${savedCustomer.fullName} (${savedCustomer.id}).`);
    }
  };

  // Delete Customer Handler
  const handleDeleteCustomer = (customerId: string) => {
    const target = customers.find(c => c.id === customerId);
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    showToast(`Removed ${target?.fullName || 'customer'} from database.`);
  };

  // Open Sale modal pre-selected for specific product
  const handleQuickSaleForProduct = (product: Product) => {
    setSaleInitialProductId(product.id);
    setSaleInitialCustomerId(undefined);
    setIsRecordSaleOpen(true);
  };

  // Open Sale modal pre-selected for specific customer
  const handleRecordSaleForCustomer = (customer: Customer) => {
    setSaleInitialCustomerId(customer.id);
    setSaleInitialProductId(undefined);
    setIsRecordSaleOpen(true);
  };

  // Low stock count for badges
  const lowStockCount = products.filter(p => p.stock <= p.minStockAlert).length;

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col antialiased">
      {/* Friendly, Simple Top Header */}
      <SimpleHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddProduct={() => setProductForm({ isOpen: true, productToEdit: null })}
        onOpenRecordSale={() => {
          setSaleInitialProductId(undefined);
          setSaleInitialCustomerId(undefined);
          setIsRecordSaleOpen(true);
        }}
        lowStockCount={lowStockCount}
        totalProductsCount={products.length}
        totalCustomersCount={customers.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'inventory' && (
          <InventoryView
            products={products}
            onOpenAddStock={(product, mode) => setStockModal({ isOpen: true, product, mode })}
            onOpenQuickSaleForProduct={handleQuickSaleForProduct}
            onEditProduct={(product) => setProductForm({ isOpen: true, productToEdit: product })}
            onDeleteProduct={handleDeleteProduct}
            onOpenAddNewProduct={() => setProductForm({ isOpen: true, productToEdit: null })}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersView
            customers={customers}
            sales={sales}
            onOpenAddCustomer={() => setCustomerForm({ isOpen: true, customerToEdit: null })}
            onEditCustomer={(customer) => setCustomerForm({ isOpen: true, customerToEdit: customer })}
            onDeleteCustomer={handleDeleteCustomer}
            onRecordSaleForCustomer={handleRecordSaleForCustomer}
            onViewReceipt={(sale) => setStandaloneReceipt(sale)}
          />
        )}

        {activeTab === 'sales' && (
          <SalesRegisterView
            sales={sales}
            products={products}
            onOpenRecordSale={() => {
              setSaleInitialProductId(undefined);
              setSaleInitialCustomerId(undefined);
              setIsRecordSaleOpen(true);
            }}
          />
        )}

        {activeTab === 'history' && (
          <StockHistoryView
            logs={logs}
          />
        )}

        {activeTab === 'overview' && (
          <OverviewView
            products={products}
            sales={sales}
            onRestockProduct={(product) => setStockModal({ isOpen: true, product, mode: 'add' })}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="px-4 py-3 rounded-xl bg-on-surface text-on-primary text-sm font-semibold shadow-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-[1.25rem]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-outline-variant/20 text-center text-xs text-on-surface-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Faith Fragrance Management System. All inventory and customer data stored locally.</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-primary font-bold">{products.length} Products</span>
            <span className="font-mono text-secondary font-bold">{customers.length} Clients</span>
            {(products.length > 0 || customers.length > 0 || sales.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset the store to empty? This will clear all products, customer records, and sales history.')) {
                    setProducts([]);
                    setLogs([]);
                    setSales([]);
                    setCustomers([]);
                    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
                    localStorage.removeItem(STORAGE_KEYS.LOGS);
                    localStorage.removeItem(STORAGE_KEYS.SALES);
                    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
                    showToast('Store & customer database reset to completely empty.');
                  }
                }}
                className="text-error hover:underline cursor-pointer text-[0.6875rem]"
              >
                Clear Database
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StockAdjustModal
        isOpen={stockModal.isOpen}
        product={stockModal.product}
        initialMode={stockModal.mode}
        onClose={() => setStockModal({ isOpen: false, product: null, mode: 'add' })}
        onConfirm={handleConfirmStockAdjustment}
      />

      <ProductFormModal
        isOpen={productForm.isOpen}
        productToEdit={productForm.productToEdit}
        onClose={() => setProductForm({ isOpen: false, productToEdit: null })}
        onSave={handleSaveProduct}
      />

      <CustomerFormModal
        isOpen={customerForm.isOpen}
        customerToEdit={customerForm.customerToEdit}
        existingCount={customers.length}
        onClose={() => setCustomerForm({ isOpen: false, customerToEdit: null })}
        onSave={handleSaveCustomer}
      />

      <RecordSaleModal
        isOpen={isRecordSaleOpen}
        products={products}
        customers={customers}
        selectedProductId={saleInitialProductId}
        initialCustomerId={saleInitialCustomerId}
        onClose={() => {
          setIsRecordSaleOpen(false);
          setSaleInitialProductId(undefined);
          setSaleInitialCustomerId(undefined);
        }}
        onCompleteSale={handleCompleteSale}
        onOpenAddNewProduct={() => setProductForm({ isOpen: true, productToEdit: null })}
        onOpenAddCustomer={() => setCustomerForm({ isOpen: true, customerToEdit: null })}
      />

      {/* Standalone Receipt Modal from Customer Orders */}
      {standaloneReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm border border-outline-variant/30 p-6 space-y-4">
            <div className="text-center space-y-1 border-b border-outline-variant/20 pb-4">
              <h3 className="font-headline-md font-bold text-on-surface text-lg">Faith Fragrance Management System</h3>
              <p className="text-xs text-on-surface-variant">Sales Receipt &amp; Voucher</p>
              <div className="pt-1 flex items-center justify-center gap-2 text-[0.6875rem] font-mono text-on-surface-variant">
                <span className="font-bold text-primary">
                  {standaloneReceipt.receiptNumber || `REC-${standaloneReceipt.id.replace('sale-', '').slice(-6)}`}
                </span>
                <span>•</span>
                <span>{standaloneReceipt.date}</span>
              </div>
              {standaloneReceipt.customerName && (
                <div className="pt-1 text-xs font-semibold text-primary">
                  Customer: {standaloneReceipt.customerName}
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs">
              {standaloneReceipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-0.5 border-b border-outline-variant/5">
                  <div>
                    <span className="font-semibold">{it.quantity}x {it.productName}</span>
                    <span className="text-[0.6875rem] text-on-surface-variant block">@{formatCFA(it.price)} each</span>
                  </div>
                  <span className="font-mono font-bold">{formatCFA(it.quantity * it.price)}</span>
                </div>
              ))}
            </div>

            {standaloneReceipt.discount && standaloneReceipt.discount > 0 && (
              <div className="flex justify-between text-xs text-amber-900 pt-1">
                <span>Discount:</span>
                <span className="font-mono font-bold">-{formatCFA(standaloneReceipt.discount)}</span>
              </div>
            )}

            <div className="border-t border-outline-variant/20 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-sm">Total Paid ({standaloneReceipt.paymentMethod}):</span>
              <span className="font-mono font-bold text-xl text-primary">{formatCFA(standaloneReceipt.totalAmount)}</span>
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
                onClick={() => setStandaloneReceipt(null)}
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

export default App;
