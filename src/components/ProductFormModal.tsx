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

const PRESET_IMAGES = [
  { label: 'Black Glass Flacon', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2sxZz3N9NBgwhzWyVKzzDpl8sF3tgMj8o1Maact6NP7Esi_UZyCniMH_ifB0gBEJAeuCEoUOxdJ4m0F0eyunB5CnIt5DEMFFZmyy-9MGh0un1VQVKXVtSQ4OGsG_tz6kyPDOaKVuAvT9G1J8TVJsu8GQYqVNtCSyeg8lzux5YXT-cIKZTMkFGyoYq_PjweKwp1groueddYCRfSokEehYNaUb-oUHIthjThOzB4TOHXRIewXWQ4r5mHg' },
  { label: 'Amber / Rose Gold Flacon', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlNafNaQdaJz4B7E7fJn3SbRPtQkKQzsrbd1ldoP-xNlIP1icImv5lR8rY4A7SuL7c1myf0KabUw42RzSEZBblN6VsnZRT3FVIaQqZ85P9IFRnIPBe47Tx_Hu0kzUtjaCklLNCDenPBwoIj6hgP8r4jcqIqHsal-hyrGX2dy0tQ6L-dnEbwTn2erYBtlxm1ftRsJqnQgrpNCawEZSX1qXvUm19kYwEtHacFuXcaEF_vPh-Amg2wqGHjw' },
  { label: 'Oud Noir Crystal Flacon', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDX-QLWjVSPbLppxiAkXw5HBerfrmxsmB7TH87nm8rwnt0ibttQT76WibOfEy34EOTNO9CWstRGr6cYIUWy9WfdRyi11H8Kt8-r3fENL_b8AqoZWoOWzDv6d84ZsnwNeiOQfsxnvIhpK9af6BgyFDa9KxHzQCfjBaoWzTmqOLPHojRh8JPuB9uYb_ZY0kJ2Ei3ouEiOx4JtrIRX7L-5Jf-2-1skqMhvgFek7Y17rOd4BVCLCC0FS1j5ew' },
  { label: 'Gold Shimmer Mist Bottle', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALk1fx2O9WvfR5wLaSdWxcZBM9EsoIL6RoY1VepSaxk0RCk49sA4KT3Zd35zbmTgf3Wsvic_Qa57b8rIRuMhHTGaat2ZXeOJ6kFDWrXNH4M3KWrE3Q9KxnqWnrIXExhcKcxtqYmR8B4fWIIrYSAfn2XgbdIjWT0qYcuxZiK4huBemvpE7AsmhRxBWpMaVJGTwGv8IG1wNdyTD3jpYf87ilOSWOhOpZEx91qJR942s-Qm9sNOVTomIU8w' },
  { label: 'Lip Treatment Tin', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy1SnkBeYbffqN28tZS0YjEy-3dIgjAd0DnvjBeirrmLtunSR5DxOeIJmvB_iRReTbrh8DhNxU6VkzBSrrqg0WFFxaK9CoDaUDnsWQ5A_4KNrfXlPbC6PgQ86mlbbhyUaAJIXXSxGcKPaaSZBuDLUMPF_HO13LZl9Hv-wQgXmQ4XrbkRbUYXHcUidBMtc1bca4PmjkLZ-ENc5CLfOsbriZ7lb7slWhfk4EeOtPRDfWLycmu2CJOzmZLA' },
  { label: 'Berry Shimmer Tube', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAiNLpNcaDoct3407oDruTVWl0nZ_n4AInENYlEVoPy84l97kFtuCrQW7ov2NLUJrkPhuTWGRooN8W14VOXX7KNXAw3WdrXlYWCls66AuZHylPNAounNvASf8hW7B4_dW-M3v3gYJ7dua3t2BLzJLqH4SeWCZ3GuZWxcI1bdu4mx_xVpZUIrG91psst3Q0Xxiqqv59r-Ijz_mdMIXyxB5RWBTD6e4lQi0oUvF_kQHflsYPhSfXenVD2A' }
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  productToEdit,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Perfumes');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState(20);
  const [minStockAlert, setMinStockAlert] = useState(10);
  const [costPrice, setCostPrice] = useState(15000);
  const [sellingPrice, setSellingPrice] = useState(35000);
  const [volumeOrSize, setVolumeOrSize] = useState('50ml');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [imageTab, setImageTab] = useState<'upload' | 'preset'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setSku(productToEdit.sku);
      setStock(productToEdit.stock);
      setMinStockAlert(productToEdit.minStockAlert);
      setCostPrice(productToEdit.costPrice);
      setSellingPrice(productToEdit.sellingPrice);
      setVolumeOrSize(productToEdit.volumeOrSize || '50ml');
      setDescription(productToEdit.description || '');
      setImageUrl(productToEdit.imageUrl);
      setUploadedFileName(productToEdit.imageUrl.startsWith('data:') ? 'Custom uploaded image' : null);
      setImageTab(productToEdit.imageUrl.startsWith('data:') ? 'upload' : 'preset');
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
      setImageUrl(PRESET_IMAGES[0].url);
      setUploadedFileName(null);
      setImageTab('upload');
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
      setImageTab('upload');
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageFile(file);
    }
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
      imageUrl: imageUrl || PRESET_IMAGES[0].url
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

          {/* Product Image: Upload from Phone / Camera / PC vs Preset library */}
          <div className="space-y-2 pt-2 border-t border-outline-variant/20">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-on-surface">
                Product Photo
              </label>
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/20 text-xs">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    imageTab === 'upload' ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold' : 'text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[1rem]">add_a_photo</span>
                  <span>Camera &amp; Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('preset')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    imageTab === 'preset' ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold' : 'text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[1rem]">collections</span>
                  <span>Presets</span>
                </button>
              </div>
            </div>

            {/* Error Message if any */}
            {uploadError && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[1.125rem] shrink-0">error</span>
                <span>{uploadError}</span>
              </div>
            )}

            {/* Upload / Camera Tab */}
            {imageTab === 'upload' && (
              <div className="space-y-3">
                {/* Standard Photo Picker (Gallery / Files / PC) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Direct Camera Shutter on Phones */}
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />

                {/* Quick Action Buttons for Mobile Phone */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isOptimizing}
                    className="py-2.5 px-3 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">photo_camera</span>
                    <span>Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isOptimizing}
                    className="py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">photo_library</span>
                    <span>Choose from Photos</span>
                  </button>
                </div>

                {/* Drag & Drop or Preview Card */}
                {isOptimizing ? (
                  <div className="border-2 border-dashed border-primary/50 rounded-xl p-6 text-center bg-primary/5 flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[2rem] text-primary">progress_activity</span>
                    <p className="text-xs font-semibold text-primary">Optimizing photo for fast mobile display...</p>
                    <p className="text-[0.6875rem] text-on-surface-variant">Compressing high-resolution camera photo</p>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-outline-variant/40 hover:border-primary/60 bg-surface-container-low/50 hover:bg-surface-container-low'
                    }`}
                  >
                    {imageUrl && imageUrl !== PRESET_IMAGES[0].url ? (
                      <div className="flex items-center gap-3 w-full">
                        <img
                          src={imageUrl}
                          alt="Product preview"
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-surface-container shadow-sm border border-outline-variant/30 shrink-0"
                        />
                        <div className="text-left flex-1 min-w-0">
                          <div className="text-xs font-semibold text-on-surface truncate">
                            {uploadedFileName || 'Photo loaded successfully'}
                          </div>
                          <p className="text-[0.6875rem] text-on-surface-variant mt-0.5">
                            Tap either button above or click here to change photo.
                          </p>
                          <span className="inline-flex items-center gap-1 text-[0.6875rem] font-bold text-emerald-800 mt-1">
                            <span className="material-symbols-outlined text-[0.875rem]">check_circle</span>
                            Photo ready &amp; optimized
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface border border-outline-variant/30 shrink-0"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[1.5rem] sm:text-[1.75rem]">add_photo_alternate</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-on-surface">
                            Tap to browse photos or drag &amp; drop from PC
                          </p>
                          <p className="text-[0.6875rem] text-on-surface-variant mt-0.5">
                            Supports camera photos, iPhone HEIC, JPG, PNG &amp; WEBP
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Presets Tab */}
            {imageTab === 'preset' && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setImageUrl(img.url);
                        setUploadedFileName(null);
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        imageUrl === img.url
                          ? 'border-primary ring-2 ring-primary/40'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={img.label}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
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
