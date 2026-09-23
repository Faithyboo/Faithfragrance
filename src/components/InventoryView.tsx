import React, { useState } from 'react';
import { Product } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialData';
import { formatCFA, CURRENCY_LABEL } from '../utils/currency';

interface InventoryViewProps {
  products: Product[];
  onOpenAddStock: (product: Product, mode: 'add' | 'reduce') => void;
  onOpenQuickSaleForProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onOpenAddNewProduct: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onOpenAddStock,
  onOpenQuickSaleForProduct,
  onEditProduct,
  onDeleteProduct,
  onOpenAddNewProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const allCategories = React.useMemo(() => {
    const cats = new Set(INITIAL_CATEGORIES);
    products.forEach(p => {
      if (p.category && p.category.trim()) cats.add(p.category.trim());
    });
    return Array.from(cats);
  }, [products]);

  // Metrics in CFA
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);
  const totalCostValue = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
  const potentialProfit = totalRetailValue - totalCostValue;

  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.minStockAlert);
  const outOfStockItems = products.filter(p => p.stock === 0);
  const alertCount = lowStockItems.length + outOfStockItems.length;

  // Filtered list
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    let matchesStatus = true;
    if (stockStatusFilter === 'in_stock') matchesStatus = p.stock > p.minStockAlert;
    if (stockStatusFilter === 'low_stock') matchesStatus = p.stock > 0 && p.stock <= p.minStockAlert;
    if (stockStatusFilter === 'out_of_stock') matchesStatus = p.stock === 0;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Total In Stock</span>
            <span className="p-2 rounded-xl bg-primary/10 text-primary material-symbols-outlined text-[1.25rem]">inventory_2</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
              {totalStockUnits} <span className="text-sm font-normal text-on-surface-variant">units</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">Across {products.length} products</p>
          </div>
        </div>

        {/* Total Retail Value in CFA */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Retail Value</span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 material-symbols-outlined text-[1.25rem]">payments</span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-800 truncate" title={formatCFA(totalRetailValue)}>
              {formatCFA(totalRetailValue)}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">Total inventory at selling price</p>
          </div>
        </div>

        {/* Expected Profit in CFA */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Expected Profit</span>
            <span className="p-2 rounded-xl bg-secondary/10 text-secondary material-symbols-outlined text-[1.25rem]">trending_up</span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-primary truncate" title={formatCFA(potentialProfit)}>
              +{formatCFA(potentialProfit)}
            </div>
            <p className="text-xs text-on-surface-variant mt-1 truncate">
              Cost: {formatCFA(totalCostValue)}
            </p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => setStockStatusFilter(stockStatusFilter === 'low_stock' ? 'all' : 'low_stock')}
          className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
            alertCount > 0 
              ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400' 
              : 'bg-surface-container-lowest border-outline-variant/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-900">Restock Needed</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-900 material-symbols-outlined text-[1.25rem]">warning</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-900">
              {alertCount} <span className="text-sm font-normal text-amber-800">items</span>
            </div>
            <p className="text-xs text-amber-800 mt-1">
              {outOfStockItems.length > 0 ? `${outOfStockItems.length} out of stock, ` : ''}
              {lowStockItems.length} low stock. Click to filter.
            </p>
          </div>
        </div>
      </div>

      {/* Restock Notification Banner if any alert */}
      {alertCount > 0 && stockStatusFilter !== 'low_stock' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-[1.5rem]">notification_important</span>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                You have {alertCount} fragrance items running low or out of stock.
              </p>
              <p className="text-xs text-amber-800">
                {[...outOfStockItems, ...lowStockItems].map(i => i.name).slice(0, 3).join(', ')}
                {alertCount > 3 ? ` and ${alertCount - 3} more` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStockStatusFilter('low_stock')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
          >
            Show Low Stock Items
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-on-surface-variant text-[1.25rem]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, SKU, or fragrance notes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/20"
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

          {/* Status Filter & View Mode */}
          <div className="flex items-center gap-2">
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-surface-container-low text-xs font-medium text-on-surface border border-outline-variant/20 focus:outline-none cursor-pointer"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (Healthy)</option>
              <option value="low_stock">Low Stock Alerts (≤ Alert)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>

            {/* Grid / Table Toggle */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'
                }`}
                title="Grid View"
              >
                <span className="material-symbols-outlined text-[1.125rem]">grid_view</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'
                }`}
                title="Table List View"
              >
                <span className="material-symbols-outlined text-[1.125rem]">view_list</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {allCategories.map((cat) => {
            const count = cat === 'All' 
              ? products.length 
              : products.filter(p => p.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-on-primary font-semibold shadow-xs'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[0.625rem] ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Zero State */}
      {products.length === 0 ? (
        <div className="p-12 sm:p-16 text-center rounded-3xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-4 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
            <span className="material-symbols-outlined text-[3rem]">inventory_2</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-on-surface">Your Store is Completely Empty</h3>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Welcome! You can now add your own fragrance products, prices in FCFA, photos from your PC, and starting stock levels.
            </p>
          </div>
          <div className="pt-3">
            <button
              type="button"
              onClick={onOpenAddNewProduct}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold shadow-md inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
            >
              <span className="material-symbols-outlined text-[1.25rem]">add_circle</span>
              <span>Add Your First Product</span>
            </button>
          </div>
        </div>
      ) : filteredProducts.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-3">
          <span className="material-symbols-outlined text-[3rem] text-on-surface-variant/40">search_off</span>
          <h3 className="text-lg font-semibold text-on-surface">No matching products found</h3>
          <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
            Try adjusting your search keywords or resetting the category filter.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setStockStatusFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-sm font-semibold"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={onOpenAddNewProduct}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[1.125rem]">add</span>
              <span>Add New Product</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const isOut = product.stock === 0;
            const isLow = product.stock > 0 && product.stock <= product.minStockAlert;
            const profit = product.sellingPrice - product.costPrice;

            return (
              <div
                key={product.id}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                {/* Photo with Overlay Badge */}
                <div className="relative h-48 bg-surface-container overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Stock Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 ${
                      isOut ? 'bg-error text-white' :
                      isLow ? 'bg-amber-500 text-white' :
                      'bg-emerald-600 text-white'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      {isOut ? 'Out of Stock (0)' : isLow ? `${product.stock} left (Low!)` : `${product.stock} in stock`}
                    </span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-lowest/90 backdrop-blur-xs text-[0.6875rem] font-bold text-on-surface">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-primary font-bold">{product.sku}</span>
                      {product.volumeOrSize && (
                        <span className="text-xs text-on-surface-variant font-medium">{product.volumeOrSize}</span>
                      )}
                    </div>
                    <h3 className="font-title-md font-semibold text-on-surface text-base line-clamp-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-on-surface-variant line-clamp-1">{product.description}</p>
                    )}
                  </div>

                  {/* Pricing info in CFA */}
                  <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-on-surface-variant">Selling Price</div>
                      <div className="text-lg font-bold font-mono text-on-surface">
                        {formatCFA(product.sellingPrice)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-on-surface-variant">Cost: {formatCFA(product.costPrice)}</div>
                      <div className="text-xs font-semibold text-emerald-800">
                        +{formatCFA(profit)} profit
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="pt-2 border-t border-outline-variant/20 grid grid-cols-3 gap-2">
                    {/* Add Stock */}
                    <button
                      type="button"
                      onClick={() => onOpenAddStock(product, 'add')}
                      className="py-2 px-1 rounded-xl bg-surface-container-low hover:bg-emerald-50 hover:text-emerald-800 text-on-surface text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Add more stock units"
                    >
                      <span className="material-symbols-outlined text-[1rem]">add</span>
                      <span>+ Stock</span>
                    </button>

                    {/* Quick Sell */}
                    <button
                      type="button"
                      disabled={isOut}
                      onClick={() => onOpenQuickSaleForProduct(product)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        isOut
                          ? 'bg-surface-container text-on-surface-variant/40 cursor-not-allowed'
                          : 'bg-primary/10 hover:bg-primary hover:text-on-primary text-primary'
                      }`}
                      title="Sell this item"
                    >
                      <span className="material-symbols-outlined text-[1rem]">point_of_sale</span>
                      <span>Sell</span>
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => onEditProduct(product)}
                      className="py-2 px-1 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Edit product info"
                    >
                      <span className="material-symbols-outlined text-[1rem]">edit</span>
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredProducts.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/20">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Stock Level</th>
                  <th className="py-3.5 px-4 text-right">Cost Price ({CURRENCY_LABEL})</th>
                  <th className="py-3.5 px-4 text-right">Selling Price ({CURRENCY_LABEL})</th>
                  <th className="py-3.5 px-4 text-right">Unit Profit</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                {filteredProducts.map((product) => {
                  const isOut = product.stock === 0;
                  const isLow = product.stock > 0 && product.stock <= product.minStockAlert;
                  const profit = product.sellingPrice - product.costPrice;

                  return (
                    <tr key={product.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-surface-container shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-on-surface">{product.name}</div>
                            <div className="text-xs text-on-surface-variant">{product.volumeOrSize || product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-xs text-primary">{product.sku}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-xs font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isOut ? 'bg-error/15 text-error' :
                          isLow ? 'bg-amber-100 text-amber-900' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-on-surface-variant">
                        {formatCFA(product.costPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-on-surface">
                        {formatCFA(product.sellingPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800 text-xs">
                        +{formatCFA(profit)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenAddStock(product, 'add')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs cursor-pointer transition-colors"
                          >
                            + Stock
                          </button>
                          <button
                            type="button"
                            disabled={isOut}
                            onClick={() => onOpenQuickSaleForProduct(product)}
                            className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary font-semibold text-xs cursor-pointer transition-colors disabled:opacity-40"
                          >
                            Sell
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditProduct(product)}
                            className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[1.125rem]">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
