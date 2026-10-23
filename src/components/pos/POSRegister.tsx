import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory, SaleItem, PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  RotateCcw,
  Receipt,
  User,
  ShoppingBag,
  AlertTriangle,
  History,
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

export const POSRegister: React.FC = () => {
  const { products, completeSale, settings, sales } = useStore();

  // Search & Category
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeFeedback, setBarcodeFeedback] = useState<string | null>(null);

  // Cart / Register state
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [showCustomerFields, setShowCustomerFields] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cashierNotes, setCashierNotes] = useState('');

  // Payment Drawer state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [showRecentSalesModal, setShowRecentSalesModal] = useState(false);
  const [viewingPastReceipt, setViewingPastReceipt] = useState<any | null>(null);

  // Completed sale receipt state
  const [completedSale, setCompletedSale] = useState<any | null>(null);

  // Categories list
  const categories: string[] = [
    'All',
    'Beverages',
    'Bakery & Deli',
    'Dairy & Eggs',
    'Groceries & Pantry',
    'Snacks & Confectionery',
    'Produce & Fresh',
    'Household & Cleaning',
    'Personal Care',
  ];

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart math
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.total, 0);
  }, [cartItems]);

  const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const taxRate = settings.taxEnabled ? settings.taxRatePercent : 0;
  const cartTax = Number(((discountedSubtotal * taxRate) / 100).toFixed(2));
  const cartTotal = Number((discountedSubtotal + cartTax).toFixed(2));

  // Add product to cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          // Cannot exceed available stock
          return prev;
        }
        return prev.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: Number(((item.quantity + 1) * item.unitPrice).toFixed(2)),
              }
            : item
        );
      } else {
        const newItem: SaleItem = {
          productId: product.id,
          sku: product.sku,
          barcode: product.barcode,
          name: product.name,
          category: product.category,
          costPrice: product.costPrice,
          unitPrice: product.sellingPrice,
          quantity: 1,
          total: product.sellingPrice,
        };
        return [...prev, newItem];
      }
    });
  };

  // Modify quantity
  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQty > product.stock) {
      newQty = product.stock;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQty,
              total: Number((newQty * item.unitPrice).toFixed(2)),
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountAmount(0);
    setCustomerName('');
    setCustomerPhone('');
    setCashierNotes('');
    setIsCheckoutOpen(false);
  };

  // Handle barcode quick scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    const matched = products.find(
      p => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
    );

    if (matched) {
      if (matched.stock <= 0) {
        setBarcodeFeedback(`"${matched.name}" is out of stock!`);
      } else {
        addToCart(matched);
        setBarcodeFeedback(`Added: ${matched.name}`);
      }
    } else {
      setBarcodeFeedback(`No product found with code: "${code}"`);
    }

    setBarcodeInput('');
    setTimeout(() => {
      setBarcodeFeedback(null);
    }, 3000);
  };

  // Open Checkout Drawer
  const openCheckout = () => {
    if (cartItems.length === 0) return;
    setAmountTendered(cartTotal.toFixed(2));
    setIsCheckoutOpen(true);
  };

  // Submit and finalize sale
  const handleCompleteSale = () => {
    const tendered =
      paymentMethod === 'cash' ? Number(amountTendered) || cartTotal : cartTotal;

    if (paymentMethod === 'cash' && tendered < cartTotal) {
      alert(`Amount tendered is less than the total due of ${formatCurrency(cartTotal, settings.currencySymbol)}`);
      return;
    }

    const sale = completeSale({
      items: cartItems,
      discount: discountAmount,
      paymentMethod,
      amountTendered: tendered,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      notes: cashierNotes.trim() || undefined,
    });

    setCompletedSale(sale);
    clearCart();
  };

  const changeDue =
    paymentMethod === 'cash'
      ? Math.max(0, (Number(amountTendered) || 0) - cartTotal)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner & Quick Barcode entry */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-display">
            Point of Sale Register
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Scan barcode or tap products to build customer tickets and process checkout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Barcode Quick Entry Form */}
          <form
            onSubmit={handleBarcodeSubmit}
            className="flex items-center bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 shadow-2xs focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900"
          >
            <Barcode className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
            <input
              type="text"
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              placeholder="Scan Barcode / SKU..."
              className="text-xs font-mono w-40 sm:w-48 outline-none text-neutral-900 placeholder:text-neutral-400"
            />
            <button
              type="submit"
              className="text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2 py-1 rounded transition-colors ml-1 cursor-pointer"
            >
              Scan
            </button>
          </form>

          {/* Recent receipts button */}
          <button
            onClick={() => setShowRecentSalesModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
            title="View recent transactions"
          >
            <History className="w-4 h-4 text-neutral-500" />
            <span className="hidden sm:inline">Recent Sales</span>
          </button>
        </div>
      </div>

      {barcodeFeedback && (
        <div className="mb-4 px-3 py-2 bg-neutral-900 text-white text-xs font-medium rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <span>{barcodeFeedback}</span>
          <button
            onClick={() => setBarcodeFeedback(null)}
            className="text-neutral-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Catalog & Search (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search bar & Category filter */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products by name, SKU, or category..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Segmented Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredProducts.map(product => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
              const inCartItem = cartItems.find(i => i.productId === product.id);

              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={isOutOfStock}
                  className={`group relative text-left bg-white p-3 rounded-xl border transition-all flex flex-col justify-between ${
                    isOutOfStock
                      ? 'opacity-55 cursor-not-allowed border-neutral-200 bg-neutral-50'
                      : 'border-neutral-200 hover:border-neutral-400 hover:shadow-xs active:scale-[0.99] cursor-pointer'
                  }`}
                >
                  <div>
                    {/* Category & SKU metadata (unboxed text) */}
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                      <span className="truncate">{product.category}</span>
                      <span className="font-mono text-[10px] text-neutral-400">{product.sku}</span>
                    </div>

                    <h3 className="font-semibold text-neutral-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-100 flex items-baseline justify-between">
                    <div>
                      <span className="font-bold text-neutral-900 text-sm sm:text-base tabular-nums">
                        {formatCurrency(product.sellingPrice, settings.currencySymbol)}
                      </span>
                      <span className="text-[10px] text-neutral-500 ml-1">/{product.unit}</span>
                    </div>

                    {/* Stock status indicator */}
                    <div className="text-[11px] text-right">
                      {isOutOfStock ? (
                        <span className="text-red-600 font-medium">Out of stock</span>
                      ) : isLowStock ? (
                        <span className="text-amber-600 font-medium">
                          {product.stock} left
                        </span>
                      ) : (
                        <span className="text-neutral-500 tabular-nums">
                          {product.stock} in stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity badge if already in cart */}
                  {inCartItem && (
                    <div className="absolute top-2 right-2 bg-neutral-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                      ×{inCartItem.quantity}
                    </div>
                  )}
                </button>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-xl border border-neutral-200 text-neutral-500">
                <Search className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm font-medium">No products match your criteria</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Try adjusting your search query or category filter
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Ticket / Cart (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col h-[740px]">
          {/* Ticket Header */}
          <div className="px-5 py-3.5 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-neutral-700" />
              <h2 className="font-bold text-neutral-900 text-sm">Active Ticket</h2>
              <span className="text-xs text-neutral-500 font-mono">
                ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)
              </span>
            </div>

            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-neutral-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear ticket"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Ticket Line Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cartItems.map(item => {
              const matchedProduct = products.find(p => p.id === item.productId);
              const maxStock = matchedProduct ? matchedProduct.stock : 999;

              return (
                <div
                  key={item.productId}
                  className="p-2.5 rounded-lg border border-neutral-100 bg-neutral-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-neutral-900 truncate">{item.name}</div>
                    <div className="text-[11px] text-neutral-500 tabular-nums">
                      {formatCurrency(item.unitPrice, settings.currencySymbol)} × {item.quantity}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-md p-0.5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 hover:bg-neutral-100 rounded text-neutral-600 transition-colors cursor-pointer"
                      title="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-neutral-900 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= maxStock}
                      className="p-1 hover:bg-neutral-100 disabled:opacity-30 rounded text-neutral-600 transition-colors cursor-pointer"
                      title="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right w-16">
                    <div className="font-bold text-neutral-900 tabular-nums">
                      {formatCurrency(item.total, settings.currencySymbol)}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-neutral-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {cartItems.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                <ShoppingBag className="w-10 h-10 stroke-1 text-neutral-300 mb-2" />
                <p className="text-sm font-medium text-neutral-700">Ticket is empty</p>
                <p className="text-xs text-neutral-400 max-w-xs mt-1">
                  Select products from the catalog on the left or scan a barcode to add items.
                </p>
              </div>
            )}
          </div>

          {/* Ticket Calculations & Customer Fields */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50/60 space-y-3">
            {/* Optional Customer toggle */}
            <div>
              <button
                onClick={() => setShowCustomerFields(!showCustomerFields)}
                className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1 font-medium cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>
                  {showCustomerFields ? 'Hide Customer Details' : '+ Add Customer Details'}
                </span>
                {customerName && <span className="text-neutral-900 font-semibold">({customerName})</span>}
              </button>

              {showCustomerFields && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-neutral-200">
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md focus:border-neutral-900 outline-none"
                  />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md focus:border-neutral-900 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-neutral-600 pt-1 border-t border-neutral-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-neutral-900">
                  {formatCurrency(cartSubtotal, settings.currencySymbol)}
                </span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>Discount</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-neutral-400">-</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={discountAmount || ''}
                    onChange={e => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                    placeholder="0.00"
                    className="w-16 text-right text-xs px-1.5 py-0.5 bg-white border border-neutral-300 rounded font-mono"
                  />
                </div>
              </div>

              {settings.taxEnabled && (
                <div className="flex justify-between">
                  <span>Sales Tax ({settings.taxRatePercent}%)</span>
                  <span className="tabular-nums font-medium text-neutral-900">
                    {formatCurrency(cartTax, settings.currencySymbol)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-neutral-200 text-base font-bold text-neutral-900">
                <span>Total Due</span>
                <span className="tabular-nums text-xl font-mono">
                  {formatCurrency(cartTotal, settings.currencySymbol)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={openCheckout}
              disabled={cartItems.length === 0}
              className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <CreditCard className="w-4 h-4" />
              <span>Charge {formatCurrency(cartTotal, settings.currencySymbol)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Tender Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-base font-display">
                  Process Payment
                </h3>
                <p className="text-xs text-neutral-500">
                  Select customer payment method and confirm tender
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-500">Total Due</div>
                <div className="text-lg font-bold text-neutral-900 font-mono tabular-nums">
                  {formatCurrency(cartTotal, settings.currencySymbol)}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs font-medium">Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('cash');
                      setAmountTendered(cartTotal.toFixed(2));
                    }}
                    className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="text-xs font-medium">Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mobile_transfer')}
                    className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'mobile_transfer'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="text-xs font-medium">Mobile / Transfer</span>
                  </button>
                </div>
              </div>

              {/* Cash Tender Calculation */}
              {paymentMethod === 'cash' && (
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-800">
                      Cash Tendered
                    </label>
                    {/* Preset bill shortcuts */}
                    <div className="flex items-center gap-1">
                      {[500, 1000, 2000, 5000, 10000].map(bill => (
                        <button
                          key={bill}
                          type="button"
                          onClick={() => setAmountTendered(String(bill))}
                          className="px-2 py-0.5 text-[11px] font-mono bg-white border border-neutral-300 rounded hover:bg-neutral-100 text-neutral-700 cursor-pointer"
                        >
                          {settings.currencySymbol}{bill.toLocaleString()}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setAmountTendered(cartTotal.toFixed(2))}
                        className="px-2 py-0.5 text-[11px] bg-white border border-neutral-300 rounded hover:bg-neutral-100 text-neutral-700 cursor-pointer"
                      >
                        Exact
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">
                      {settings.currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={amountTendered}
                      onChange={e => setAmountTendered(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 text-base font-mono bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none font-bold"
                    />
                  </div>

                  {/* Change calculation */}
                  <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-600">Change Due:</span>
                    <span className={`text-base font-bold font-mono tabular-nums ${
                      changeDue >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(changeDue, settings.currencySymbol)}
                    </span>
                  </div>

                  {Number(amountTendered) < cartTotal && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Tendered amount is below total due</span>
                    </div>
                  )}
                </div>
              )}

              {/* Transaction Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Cashier Notes (Optional)
                </label>
                <input
                  type="text"
                  value={cashierNotes}
                  onChange={e => setCashierNotes(e.target.value)}
                  placeholder="e.g. In-store customer pickup, gift receipt requested..."
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
                />
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Back to Ticket
              </button>
              <button
                type="button"
                onClick={handleCompleteSale}
                className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
              >
                Confirm & Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Sale Receipt Modal */}
      {completedSale && (
        <ReceiptModal
          sale={completedSale}
          onClose={() => setCompletedSale(null)}
          isNewSale={true}
        />
      )}

      {/* Past Receipt Inspection Modal */}
      {viewingPastReceipt && (
        <ReceiptModal
          sale={viewingPastReceipt}
          onClose={() => setViewingPastReceipt(null)}
          isNewSale={false}
        />
      )}

      {/* Recent Sales Drawer / Modal */}
      {showRecentSalesModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm font-display">
                  Recent Sales Transactions
                </h3>
                <p className="text-xs text-neutral-500">
                  Showing last {Math.min(15, sales.length)} recorded transactions
                </p>
              </div>
              <button
                onClick={() => setShowRecentSalesModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto divide-y divide-neutral-100">
              {sales.slice(0, 15).map(sale => (
                <div
                  key={sale.id}
                  className="p-4 hover:bg-neutral-50/80 transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-neutral-900">
                        {sale.receiptNumber}
                      </span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500">
                        {new Date(sale.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-neutral-400">·</span>
                      <span className="uppercase text-neutral-500 text-[10px]">
                        {sale.paymentMethod}
                      </span>
                    </div>
                    <div className="text-neutral-500 text-[11px] mt-0.5">
                      {sale.items.length} item{sale.items.length > 1 ? 's' : ''} (
                      {sale.items.map(i => i.name).slice(0, 2).join(', ')}
                      {sale.items.length > 2 ? '...' : ''})
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-neutral-900 tabular-nums">
                        {formatCurrency(sale.total, settings.currencySymbol)}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Profit: {formatCurrency(sale.grossProfit, settings.currencySymbol)}
                      </div>
                    </div>
                    <button
                      onClick={() => setViewingPastReceipt(sale)}
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded border border-neutral-200 transition-colors cursor-pointer"
                      title="View receipt"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 text-right">
              <button
                onClick={() => setShowRecentSalesModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 cursor-pointer"
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
