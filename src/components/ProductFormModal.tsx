import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialData';
import { formatCFA, CURRENCY_LABEL } from '../utils/currency';
import { optimizeImageFile } from '../utils/imageOptimizer';

interface ProductFormModalProps {
  isOpen: boolean;
  productToEdit: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const DEFAULT_PERFUME_PLACEHOLDER = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDX-QLWjVSPbLppxiAkXw5HBerfrmxsmB7TH87nm8rwnt0ibttQT76WibOfEy34EOTNO9CWstRGr6cYIUWy9WfdRyi11H8Kt8-r3fENL_b8AqoZWoOWzDv6d84ZsnwNeiOQfsxnvIhpK9af6BgyFDa9KxHzQCfjBaoWzTmqOLPHojRh8JPuB9uYb_ZY0kJ2Ei3ouEiOx4JtrIRX7L-5Jf-2-1skqMhvgFek7Y17rOd4BVCLCC0FS1j5ew';

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  productToEdit,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Perfumes');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState(1);
  const [minStockAlert, setMinStockAlert] = useState(5);
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [volumeOrSize, setVolumeOrSize] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setSku(productToEdit.sku);
      setStock(productToEdit.stock);
      setMinStockAlert(productToEdit.minStockAlert);
      setCostPrice(productToEdit.costPrice);
      setSellingPrice(productToEdit.sellingPrice);
      setVolumeOrSize(productToEdit.volumeOrSize || '');
      setDescription(productToEdit.description || '');
      setImageUrl(productToEdit.imageUrl || '');
      setUploadedFileName(null);
    } else {
      setName('');
      setCategory('Perfumes');
      setSku('');
      setStock(1);
      setMinStockAlert(5);
      setCostPrice(0);
      setSellingPrice(0);
      setVolumeOrSize('');
      setDescription('');
      setImageUrl('');
      setUploadedFileName(null);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Auto generate SKU if empty
  const handleNameBlur = () => {
    if (!sku && name) {
      const parts = name.split(' ').map(p => p[0]?.toUpperCase()).filter(Boolean).slice(0, 3).join('');
      const randomNum = Math.floor(100 + Math.random() * 900);
      setSku(`${parts || 'SKU'}-${randomNum}`);
    }
  };

  // Image file handler with auto-compression for phone camera & PC uploads
  const handleImageFile = async (file: File) => {
    setUploadError(null);
    setIsOptimizing(true);

    try {
      const optimized = await optimizeImageFile(file, 1000, 0.82);
      setImageUrl(optimized.dataUrl);
      const displayKb = Math.round(optimized.optimizedSize / 1024);
      setUploadedFileName(`${file.name || 'Photo'} (~${displayKb} KB)`);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setUploadError(err.message || 'Could not load this photo. Please try choosing another image.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
    // Reset value so selecting the same file again still fires change
    e.target.value = '';
  };

  const unitProfit = sellingPrice - costPrice;
  const profitMargin = sellingPrice > 0 ? ((unitProfit / sellingPrice) * 100).toFixed(0) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name.');
      return;
    }

    const finalProduct: Product = {
      id: productToEdit ? productToEdit.id : 'prod-' + Date.now(),
      name: name.trim(),
      category: category || 'Perfumes',
      sku: sku.trim() || `SKU-${Math.floor(100 + Math.random() * 900)}`,
      stock: Number(stock) || 0,
      minStockAlert: Number(minStockAlert) || 5,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      volumeOrSize: volumeOrSize.trim() || 'Standard',
      description: description.trim(),
      imageUrl: imageUrl || DEFAULT_PERFUME_PLACEHOLDER
    };

    onSave(finalProduct);
    onClose();
  };

  const categories = INITIAL_CATEGORIES.filter(c => c !== 'All');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-xl border border-outline-variant/30 my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
          <div>
            <h2 className="font-title-md font-semibold text-on-surface">
              {productToEdit ? 'Edit Product' : 'Add New Product to Inventory'}
            </h2>
            <p className="text-xs text-on-surface-variant">
              Fill in product details, initial stock level, and price in {CURRENCY_LABEL}.
            </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface">
              Product Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              placeholder="e.g. Vanilla Amber Extrait"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/20"
            />
          </div>

          {/* Category & Volume / Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-on-surface">
                  Category
                </label>
                <span className="text-[0.625rem] text-on-surface-variant">Pick or type custom</span>
              </div>
              <input
                type="text"
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Perfumes, Body Mists, Candles..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/20"
              />
              <datalist id="category-suggestions">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Size / Volume
              </label>
              <input
                type="text"
                value={volumeOrSize}
                onChange={(e) => setVolumeOrSize(e.target.value)}
                placeholder="e.g. 50ml, 100ml, 15g"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/20"
              />
            </div>
          </div>

          {/* Stock & Low Stock Alert */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/20">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Current Stock (Units in Hand)
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 rounded-lg bg-surface-container-lowest font-mono font-bold text-base text-on-surface border border-outline-variant/20"
              />
              <span className="text-[0.6875rem] text-on-surface-variant">Available for sale right now</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-amber-900">
                Low Stock Warning Level
              </label>
              <input
                type="number"
                min="1"
                required
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2 rounded-lg bg-surface-container-lowest font-mono font-bold text-base text-on-surface border border-outline-variant/20"
              />
              <span className="text-[0.6875rem] text-on-surface-variant">Alert me when stock falls to this number</span>
            </div>
          </div>

          {/* Cost Price, Selling Price & Profit Calculation (in CFA) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/20">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Cost Price ({CURRENCY_LABEL})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="500"
                  min="0"
                  required
                  value={costPrice}
                  onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 15000"
                  className="w-full px-3.5 py-2 rounded-lg bg-surface-container-lowest font-mono font-bold text-sm text-on-surface border border-outline-variant/20"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-on-surface-variant">
                  {CURRENCY_LABEL}
                </span>
              </div>
              <span className="text-[0.6875rem] text-on-surface-variant">
                Cost to acquire / craft: {formatCFA(costPrice)}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Selling Price ({CURRENCY_LABEL})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="500"
                  min="0"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 35000"
                  className="w-full px-3.5 py-2 rounded-lg bg-surface-container-lowest font-mono font-bold text-sm text-on-surface border border-outline-variant/20"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-on-surface-variant">
                  {CURRENCY_LABEL}
                </span>
              </div>
              <div className="flex items-center justify-between text-[0.6875rem] pt-0.5">
                <span className="text-emerald-800 font-semibold">
                  Profit: +{formatCFA(unitProfit)}
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-1.5 rounded font-bold">
                  {profitMargin}% margin
                </span>
              </div>
            </div>
          </div>

          {/* SKU & Short Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="block text-xs font-semibold text-on-surface">
                Item Code / SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. MO-100"
                className="w-full px-3 py-2 rounded-xl bg-surface-container-low font-mono text-xs text-on-surface border border-outline-variant/20 uppercase"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold text-on-surface">
                Fragrance Notes / Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Damask Rose, Vanilla, Smoked Oud"
                className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-xs text-on-surface border border-outline-variant/20"
              />
            </div>
          </div>

          {/* Product Image: Only Choose from Photos */}
          <div className="space-y-2 pt-2 border-t border-outline-variant/20">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-on-surface">
                Product Photo
              </label>
              <span className="text-[0.6875rem] text-on-surface-variant font-medium">Full bottle view</span>
            </div>

            {/* Error Message if any */}
            {uploadError && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[1.125rem] shrink-0">error</span>
                <span>{uploadError}</span>
              </div>
            )}

            {/* Hidden File Picker: Works for phone photos & PC */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              className="hidden"
            />

            {/* Loading / Optimizing state */}
            {isOptimizing ? (
              <div className="border border-dashed border-primary/50 rounded-2xl p-8 text-center bg-primary/5 flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-[2.25rem] text-primary">progress_activity</span>
                <p className="text-xs font-semibold text-primary">Optimizing photo for fast display...</p>
                <p className="text-[0.6875rem] text-on-surface-variant">Compressing fragrance photo</p>
              </div>
            ) : imageUrl ? (
              /* Selected Image Card with FULL BOTTLE VIEW */
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low/60 overflow-hidden flex flex-col">
                <div className="w-full h-56 sm:h-64 flex items-center justify-center p-3 bg-surface-container-lowest">
                  <img
                    src={imageUrl}
                    alt="Perfume bottle preview"
                    className="max-h-full max-w-full object-contain drop-shadow-md"
                  />
                </div>
                <div className="p-3 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-outline-variant/20">
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                      <span className="material-symbols-outlined text-[1rem]">check_circle</span>
                      Entire bottle visible
                    </span>
                    {uploadedFileName && (
                      <p className="text-[0.6875rem] text-on-surface-variant truncate mt-0.5">{uploadedFileName}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[1.125rem]">photo_library</span>
                    <span>Choose from Photos</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Empty State: Direct Choose from Photos */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-outline-variant/50 hover:border-primary/60 rounded-2xl p-6 sm:p-8 text-center bg-surface-container-low/40 hover:bg-surface-container-low transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[2rem]">photo_library</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-on-surface">Choose a photo of the perfume</p>
                  <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                    The entire bottle from cap to base will be displayed neatly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-xs inline-flex items-center gap-2 cursor-pointer hover:bg-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[1.125rem]">photo_library</span>
                  <span>Choose from Photos</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-sm cursor-pointer"
            >
              {productToEdit ? 'Save Changes' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
