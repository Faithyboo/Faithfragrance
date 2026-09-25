import React, { useState, useEffect } from 'react';

export type ActiveTab = 'inventory' | 'sales' | 'history' | 'overview';

interface SimpleHeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddProduct: () => void;
  onOpenRecordSale: () => void;
  lowStockCount: number;
  totalProductsCount?: number;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddProduct,
  onOpenRecordSale,
  lowStockCount,
  totalProductsCount = 0
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  const handleActionAddProduct = () => {
    setIsMenuOpen(false);
    onOpenAddProduct();
  };

  const handleActionRecordSale = () => {
    setIsMenuOpen(false);
    onOpenRecordSale();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-3">
            {/* Brand Title (Two Lines) */}
            <div 
              onClick={() => handleNavClick('inventory')}
              className="flex flex-col cursor-pointer group select-none shrink-0"
              title="Faith Fragrance Management System - Go to Inventory"
            >
              <span className="font-headline-md text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-on-surface tracking-tight leading-tight group-hover:text-primary transition-colors">
                Faith Fragrance
              </span>
              <span className="font-headline-md text-xs sm:text-sm md:text-base font-semibold text-primary tracking-tight leading-tight">
                Management System
              </span>
            </div>

            {/* Desktop Navigation Pills */}
            <nav className="hidden lg:flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
              <button
                type="button"
                onClick={() => handleNavClick('inventory')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body-md text-[0.875rem] font-medium transition-all cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[1.125rem] text-primary">inventory_2</span>
                <span>Inventory</span>
                {lowStockCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[0.625rem] font-bold bg-amber-100 text-amber-900">
                    {lowStockCount} low
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('sales')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body-md text-[0.875rem] font-medium transition-all cursor-pointer ${
                  activeTab === 'sales'
                    ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[1.125rem] text-secondary">point_of_sale</span>
                <span>Sales Register</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body-md text-[0.875rem] font-medium transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[1.125rem] text-tertiary">history</span>
                <span>Stock History</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('overview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body-md text-[0.875rem] font-medium transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[1.125rem] text-emerald-700">insights</span>
                <span>Overview</span>
              </button>
            </nav>

            {/* Quick Actions & Hamburger Menu Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onOpenRecordSale}
                className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-md text-[0.8125rem] sm:text-[0.875rem] font-semibold transition-all border border-outline-variant/30 cursor-pointer shadow-xs active:scale-95"
              >
                <span className="material-symbols-outlined text-[1.125rem] text-secondary">add_shopping_cart</span>
                <span>Record Sale</span>
              </button>

              <button
                type="button"
                onClick={onOpenAddProduct}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-[0.8125rem] sm:text-[0.875rem] font-semibold transition-all shadow-sm cursor-pointer active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-[1.125rem]">add</span>
                <span className="hidden sm:inline">Add Product</span>
                <span className="sm:hidden">Add</span>
              </button>

              {/* Hamburger Menu Toggle Button (Mobile Only) */}
              <button
                type="button"
                onClick={() => setIsMenuOpen(prev => !prev)}
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="lg:hidden relative flex items-center justify-center p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/30 cursor-pointer shadow-xs active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <div className="w-5 h-5 flex flex-col justify-center items-center gap-1">
                  <span
                    className={`block h-0.5 w-5 bg-on-surface rounded-full transition-transform duration-300 ease-in-out ${
                      isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-5 bg-on-surface rounded-full transition-opacity duration-300 ${
                      isMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-5 bg-on-surface rounded-full transition-transform duration-300 ease-in-out ${
                      isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                    }`}
                  />
                </div>

                {/* Badge alert on hamburger if low stock exists */}
                {lowStockCount > 0 && !isMenuOpen && (
                  <span 
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[0.5625rem] font-extrabold text-white ring-2 ring-surface shadow-xs animate-pulse"
                    title={`${lowStockCount} items low on stock`}
                  >
                    !
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hamburger Menu Backdrop Overlay (Mobile Only) */}
      <div
        onClick={() => setIsMenuOpen(false)}
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Hamburger Menu Slide-Out Drawer (Mobile Only) */}
      <aside
        className={`lg:hidden fixed top-0 right-0 h-full w-[88vw] max-w-sm sm:max-w-md bg-surface-container-lowest shadow-2xl z-50 flex flex-col border-l border-outline-variant/30 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Navigation Menu"
      >
        {/* Drawer Header (Two Lines) */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20 bg-surface-container-low/60">
          <div>
            <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface leading-tight">
              Faith Fragrance
            </h2>
            <p className="font-headline-md text-xs sm:text-sm font-semibold text-primary tracking-tight leading-tight mt-0.5">
              Management System
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer ml-2 shrink-0"
          >
            <span className="material-symbols-outlined text-[1.5rem]">close</span>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {/* Low Stock Warning Banner if applicable */}
          {lowStockCount > 0 ? (
            <div 
              onClick={() => handleNavClick('inventory')}
              className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 cursor-pointer hover:bg-amber-100 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-amber-600 text-[1.375rem] shrink-0 mt-0.5">warning</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Low Stock Alert</span>
                  <span className="px-2 py-0.5 rounded-full text-[0.625rem] font-black bg-amber-600 text-white">
                    {lowStockCount} {lowStockCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <p className="text-xs text-amber-900/90 mt-1 leading-snug">
                  Some perfumes are running low. Tap to review inventory and restock.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs">
              <span className="material-symbols-outlined text-emerald-600 text-[1.25rem]">check_circle</span>
              <span className="font-medium">All perfume stocks healthy & active</span>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <div className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider mb-2.5 px-1">
              Quick Actions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleActionAddProduct}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-sm transition-all cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-[1.25rem]">add</span>
                <span>Add Product</span>
              </button>

              <button
                type="button"
                onClick={handleActionRecordSale}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-sm border border-outline-variant/30 shadow-xs transition-all cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-[1.25rem] text-secondary">add_shopping_cart</span>
                <span>Record Sale</span>
              </button>
            </div>
          </div>

          {/* Main Navigation Menu Links */}
          <div>
            <div className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider mb-2.5 px-1">
              Store Sections
            </div>
            <nav className="space-y-2">
              {/* Inventory */}
              <button
                type="button"
                onClick={() => handleNavClick('inventory')}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all cursor-pointer text-left ${
                  activeTab === 'inventory'
                    ? 'bg-primary/10 border-2 border-primary text-on-surface font-semibold shadow-xs'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-transparent'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${activeTab === 'inventory' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-primary'}`}>
                  <span className="material-symbols-outlined text-[1.375rem] block">inventory_2</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Inventory Catalog</span>
                    {lowStockCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[0.625rem] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {lowStockCount} low
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">
                    Perfumes, full bottle photos & stock
                  </p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[1.25rem]">chevron_right</span>
              </button>

              {/* Sales Register */}
              <button
                type="button"
                onClick={() => handleNavClick('sales')}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all cursor-pointer text-left ${
                  activeTab === 'sales'
                    ? 'bg-primary/10 border-2 border-primary text-on-surface font-semibold shadow-xs'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-transparent'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${activeTab === 'sales' ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-secondary'}`}>
                  <span className="material-symbols-outlined text-[1.375rem] block">point_of_sale</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm">Sales Register</span>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">
                    Orders, customer receipts & logs
                  </p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[1.25rem]">chevron_right</span>
              </button>

              {/* Stock History */}
              <button
                type="button"
                onClick={() => handleNavClick('history')}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all cursor-pointer text-left ${
                  activeTab === 'history'
                    ? 'bg-primary/10 border-2 border-primary text-on-surface font-semibold shadow-xs'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-transparent'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${activeTab === 'history' ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container-highest text-tertiary'}`}>
                  <span className="material-symbols-outlined text-[1.375rem] block">history</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm">Stock History</span>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">
                    Restocks, sales & adjustment audit trail
                  </p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[1.25rem]">chevron_right</span>
              </button>

              {/* Store Overview */}
              <button
                type="button"
                onClick={() => handleNavClick('overview')}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all cursor-pointer text-left ${
                  activeTab === 'overview'
                    ? 'bg-primary/10 border-2 border-primary text-on-surface font-semibold shadow-xs'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-transparent'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${activeTab === 'overview' ? 'bg-emerald-700 text-white' : 'bg-surface-container-highest text-emerald-700'}`}>
                  <span className="material-symbols-outlined text-[1.375rem] block">insights</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm">Store Overview & Analytics</span>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">
                    Stock valuation, revenue & checklist
                  </p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[1.25rem]">chevron_right</span>
              </button>
            </nav>
          </div>

          {/* Store Details & Status Card */}
          <div className="p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 space-y-2.5 text-xs text-on-surface-variant">
            <div className="font-bold text-on-surface text-[0.8125rem] flex items-center justify-between">
              <span>Boutique Summary</span>
              <span className="font-mono text-primary font-bold">{totalProductsCount} Products</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-outline-variant/20">
              <span>Currency</span>
              <span className="font-semibold text-on-surface">FCFA (XAF)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Photo Upload</span>
              <span className="font-semibold text-primary">Choose from Photos</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-outline-variant/20 bg-surface-container-low/40 flex items-center justify-between">
          <div className="text-[0.6875rem] text-on-surface-variant">
            Faith Fragrance Management System © {new Date().getFullYear()}
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Close Menu
          </button>
        </div>
      </aside>
    </>
  );
};

