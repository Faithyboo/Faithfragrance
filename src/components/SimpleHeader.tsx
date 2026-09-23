import React from 'react';
import { BRAND_LOGO_URL } from '../data/initialData';

export type ActiveTab = 'inventory' | 'sales' | 'history' | 'overview';

interface SimpleHeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddProduct: () => void;
  onOpenRecordSale: () => void;
  lowStockCount: number;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddProduct,
  onOpenRecordSale,
  lowStockCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo & Title */}
          <div 
            onClick={() => onSelectTab('inventory')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <img 
              src={BRAND_LOGO_URL} 
              alt="Faith Fragrance Logo" 
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" 
            />
            <div className="flex flex-col">
              <span className="font-headline-md text-title-md sm:text-headline-md font-semibold text-on-surface tracking-tight leading-tight">
                Faith Fragrance
              </span>
              <span className="text-[0.6875rem] text-primary font-bold uppercase tracking-wider">
                Inventory Manager
              </span>
            </div>
          </div>

          {/* Navigation Pills */}
          <nav className="hidden md:flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
            <button
              type="button"
              onClick={() => onSelectTab('inventory')}
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
              onClick={() => onSelectTab('sales')}
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
              onClick={() => onSelectTab('history')}
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
              onClick={() => onSelectTab('overview')}
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

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenRecordSale}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-md text-[0.8125rem] sm:text-[0.875rem] font-semibold transition-all border border-outline-variant/30 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[1.125rem] text-secondary">add_shopping_cart</span>
              <span className="hidden sm:inline">Record Sale</span>
              <span className="sm:hidden">Sale</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddProduct}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-[0.8125rem] sm:text-[0.875rem] font-semibold transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[1.125rem]">add</span>
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-outline-variant/20 text-xs">
          <button
            type="button"
            onClick={() => onSelectTab('inventory')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'inventory' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[1.25rem]">inventory_2</span>
            <span>Inventory</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('sales')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'sales' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[1.25rem]">point_of_sale</span>
            <span>Sales</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('history')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'history' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[1.25rem]">history</span>
            <span>History</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('overview')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'overview' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[1.25rem]">insights</span>
            <span>Overview</span>
          </button>
        </div>
      </div>
    </header>
  );
};
