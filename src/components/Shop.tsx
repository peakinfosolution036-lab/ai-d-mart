'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingCart, Star, ChevronRight } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import UpiPayment from '@/components/UpiPayment';

interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
    category: string;
    status: string;
}

interface CartItem {
    productId: string;
    quantity: number;
    price: number;
}

const Shop = () => {
    const { user, isLoggedIn } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [showCart, setShowCart] = useState(false);
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [checkoutData, setCheckoutData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        paymentMethod: 'wallet'
    });
    const [processing, setProcessing] = useState(false);
    const [showUpiPayment, setShowUpiPayment] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const addToCart = async (productId: string) => {
        if (!isLoggedIn) {
            alert('Please login to add items to cart');
            return;
        }

        setCart(prev => {
            const newCart = {
                ...prev,
                [productId]: (prev[productId] || 0) + 1
            };
            updateCartAPI(newCart);
            return newCart;
        });
    };

    const removeFromCart = async (productId: string) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[productId] > 1) {
                newCart[productId]--;
            } else {
                delete newCart[productId];
            }
            updateCartAPI(newCart);
            return newCart;
        });
    };

    const updateCartAPI = async (cartData: { [key: string]: number }) => {
        if (!user?.id) return;

        try {
            const items = Object.entries(cartData).map(([productId, quantity]) => {
                const product = products.find(p => p.id === productId);
                return {
                    productId,
                    quantity,
                    price: product?.price || 0
                };
            });

            await fetch('/api/customer/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, items })
            });
        } catch (error) {
            console.error('Failed to update cart:', error);
        }
    };

    const loadCart = async () => {
        if (!user?.id) return;

        try {
            const response = await fetch(`/api/customer/cart?userId=${user.id}`);
            const data = await response.json();
            if (data.success && data.data) {
                const cartData: { [key: string]: number } = {};
                data.data.forEach((item: CartItem) => {
                    cartData[item.productId] = item.quantity;
                });
                setCart(cartData);
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
        }
    };

    const getTotalItems = () => Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    const getTotalPrice = () => {
        return Object.entries(cart).reduce((total, [productId, qty]) => {
            const product = products.find(p => p.id === productId);
            return total + (product ? product.price * qty : 0);
        }, 0);
    };

    const handleCheckout = () => {
        if (!isLoggedIn) {
            alert('Please login to checkout');
            return;
        }
        setShowCart(false);
        setShowCheckoutForm(true);
        setCheckoutData(prev => ({
            ...prev,
            name: user?.name || '',
            email: user?.email || ''
        }));
    };

    const handleUpiSuccess = (data: { utrNumber: string; screenshotUrl: string }) => {
        handlePayment(undefined, data);
    };

    const handlePayment = async (e?: React.FormEvent, upiData?: { utrNumber: string; screenshotUrl: string }) => {
        if (e) e.preventDefault();
        if (!user?.id) return;

        // If UPI selected and no upiData yet, show UPI payment screen
        if (checkoutData.paymentMethod === 'upi' && !upiData) {
            setShowUpiPayment(true);
            return;
        }

        setProcessing(true);
        try {
            const items = Object.entries(cart).map(([productId, quantity]) => {
                const product = products.find(p => p.id === productId);
                return {
                    productId,
                    quantity,
                    price: product?.price || 0,
                    name: product?.name || 'Unknown Product'
                };
            });

            const response = await fetch('/api/customer/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    items,
                    total: getTotalPrice(),
                    type: 'shop_purchase',
                    customerInfo: checkoutData,
                    ...(upiData ? { utrNumber: upiData.utrNumber, paymentScreenshot: upiData.screenshotUrl, paymentStatus: 'pending_verification' } : {})
                })
            });

            const result = await response.json();
            if (result.success) {
                // Add cashback for Prime members
                try {
                    await fetch('/api/prime/wallets', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'add_cashback',
                            userId: user.id,
                            amount: getTotalPrice(),
                            orderId: result.orderId
                        })
                    });
                } catch (cashbackError) {
                    console.log('Cashback not applicable (user may not be Prime member)');
                }

                alert(`Order placed successfully! Order ID: ${result.orderId}`);
                setCart({});
                await fetch(`/api/customer/cart?userId=${user.id}`, { method: 'DELETE' });
                setShowCheckoutForm(false);
                setShowUpiPayment(false);
                setCheckoutData({ name: '', email: '', phone: '', address: '', paymentMethod: 'wallet' });
            } else {
                alert(`Order failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (isLoggedIn && user?.id) {
            loadCart();
        }
    }, [isLoggedIn, user?.id]);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/shop/products');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.success) {
                const products = data.products || data.data || [];
                setProducts(products);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Failed to fetch shop products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="py-32 px-6 bg-[#F0FDF4]">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="animate-pulse">
                        <div className="h-16 bg-[#00703C]/10 rounded mb-4 mx-auto max-w-md"></div>
                        <div className="h-6 bg-[#00703C]/10 rounded mb-8 mx-auto max-w-lg"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return (
            <section className="py-32 px-6 bg-[#F0FDF4] relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-[#FFD700] to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
                            Shop Now
                        </h2>
                        <p className="text-xl text-[#004D2C] max-w-3xl mx-auto">Premium Products for Your Events</p>
                        <div className="mt-8 p-6 bg-white border border-[#00703C]/20 rounded-lg max-w-md mx-auto shadow-lg">
                            <p className="text-lg text-[#00703C] font-medium">No products available at the moment</p>
                            <p className="text-sm text-[#004D2C]/70 mt-2">Admin can add products from the admin panel</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <section className="py-32 px-6 bg-[#F0FDF4] relative overflow-hidden min-h-screen">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-64 h-64 bg-[#00703C]/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-32 right-32 w-80 h-80 bg-[#FFD700]/10 rounded-full blur-3xl animate-bounce"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-12 sm:mb-20">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black bg-gradient-to-r from-[#FFD700] to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
                            Shop Now
                        </h2>
                        {getTotalItems() > 0 && (
                            <button
                                onClick={() => setShowCart(true)}
                                className="relative bg-[#00703C] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold hover:bg-[#004D2C] transition-colors flex items-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200"
                            >
                                <ShoppingCart size={18} />
                                <span className="hidden sm:inline">Cart ({getTotalItems()})</span>
                                <span className="sm:hidden">({getTotalItems()})</span>
                                <span className="absolute -top-2 -right-2 bg-[#FFD700] text-[#004D2C] text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border-2 border-white">
                                    {getTotalItems()}
                                </span>
                            </button>
                        )}
                    </div>
                    <p className="text-lg sm:text-xl text-[#004D2C] max-w-3xl mx-auto px-4 font-medium">Premium Products for Your Events</p>
                </div>

                {/* Search and Filters */}
                <div className="mb-10 px-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-[#00703C]/10">
                        <div className="w-full md:w-1/2 relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00703C] focus:border-transparent outline-none transition-all"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <span className="text-lg">🔍</span>
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all ${selectedCategory === category
                                        ? 'bg-[#00703C] text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-4">
                    {filteredProducts.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-[#00703C]/10 shadow-sm">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-[#004D2C] mb-2">No products found</h3>
                            <p className="text-gray-500">Try adjusting your search or category filter.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                className="mt-6 px-6 py-2 bg-[#FFD700] text-[#00703C] font-bold rounded-full hover:shadow-lg transition-all"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : filteredProducts.map((product) => {
                        const originalPrice = Math.round(product.price * 1.25); // Fake 20% discount
                        const savings = originalPrice - product.price;

                        return (
                            <div key={product.id} className="group flex flex-col bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 border border-gray-100">
                                {/* Image Container with Hover Actions */}
                                <div className="aspect-[4/3] sm:aspect-square overflow-hidden relative bg-gray-50 flex-shrink-0">
                                    {/* Discount Badge */}
                                    <div className="absolute top-4 left-4 z-20 bg-red-500 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                                        20% OFF
                                    </div>

                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none"
                                            quality={100}
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const parent = e.currentTarget.parentElement;
                                                if (parent) {
                                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-[#00703C]/30"><span class="text-4xl">📦</span></div>';
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#00703C]/30 bg-gray-100">
                                            <span className="text-4xl">📦</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

                                    {/* Quick Actions (Visible on Hover) */}
                                    <div className="absolute inset-0 z-20 px-6 pb-6 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                addToCart(product.id);
                                            }}
                                            className="w-full bg-[#00703C]/90 backdrop-blur-md text-white py-3 rounded-2xl font-black text-sm hover:bg-[#00703C] transition-colors shadow-xl flex items-center justify-center gap-2 transform active:scale-95"
                                        >
                                            <ShoppingCart size={18} /> Quick Add
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#00703C] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                            {product.category}
                                        </span>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star size={14} fill="currentColor" />
                                            <span className="text-xs font-bold text-gray-700">4.8</span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-[#00703C] transition-colors line-clamp-2">
                                        {product.name}
                                    </h3>

                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
                                        {product.description || 'Premium quality event supplies for your special occasions.'}
                                    </p>

                                    <div className="mt-auto space-y-4">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold line-through mb-0.5">₹{(originalPrice || 0).toLocaleString('en-IN')}</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-black text-gray-900">₹{(product.price || 0).toLocaleString('en-IN')}</span>
                                                    <span className="text-xs font-bold text-red-500 mb-1">Save ₹{(savings || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    alert('View details functionality to be implemented');
                                                }}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200 text-sm flex items-center justify-center gap-1"
                                            >
                                                Details <ChevronRight size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addToCart(product.id);
                                                }}
                                                className="flex-1 bg-[#FFD700] text-[#004D2C] px-4 py-2.5 rounded-xl font-black hover:bg-[#F0C000] transition-colors shadow-sm flex items-center justify-center gap-2 text-sm relative overflow-hidden"
                                            >
                                                <ShoppingCart size={16} />
                                                <span>Add</span>
                                                {cart[product.id] && (
                                                    <span className="absolute top-1 right-1 bg-[#004D2C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                                        {cart[product.id]}
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Cart Modal */}
            {showCart && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-[#00703C]/10">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-[#004D2C]">Shopping Cart</h3>
                                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-red-500 transition-colors text-2xl">
                                    ×
                                </button>
                            </div>

                            {Object.keys(cart).length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">🛒</div>
                                    <p className="text-gray-500 font-medium">Your cart is empty</p>
                                    <button
                                        onClick={() => setShowCart(false)}
                                        className="mt-4 text-[#00703C] font-bold hover:underline"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4 mb-6">
                                        {Object.entries(cart).map(([productId, qty]) => {
                                            const product = products.find(p => p.id === productId);
                                            if (!product) return null;
                                            return (
                                                <div key={productId} className="flex gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50 hover:border-[#00703C]/20 transition-colors">
                                                    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                                        {product.image ? (
                                                            <Image
                                                                src={product.image}
                                                                alt={product.name}
                                                                width={80}
                                                                height={80}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                📦
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-[#004D2C] line-clamp-1">{product.name}</h4>
                                                        <p className="text-gray-500 text-xs mb-2 line-clamp-1">{product.description || 'No description'}</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-lg font-bold text-[#00703C]">₹{product.price}</span>
                                                            <div className="flex items-center gap-3 bg-white rounded-full border border-gray-200 px-2 py-1">
                                                                <button
                                                                    onClick={() => removeFromCart(productId)}
                                                                    className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors font-bold text-gray-600"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="font-bold text-[#004D2C] w-4 text-center">{qty}</span>
                                                                <button
                                                                    onClick={() => addToCart(productId)}
                                                                    className="w-6 h-6 bg-[#00703C] text-white rounded-full flex items-center justify-center hover:bg-[#004D2C] transition-colors font-bold"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="border-t border-dashed border-gray-300 pt-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-lg font-bold text-gray-600">Total:</span>
                                            <span className="text-3xl font-black text-[#00703C]">₹{getTotalPrice()}</span>
                                        </div>
                                        <button
                                            onClick={handleCheckout}
                                            className="w-full bg-[#00703C] text-white py-4 rounded-xl font-bold hover:bg-[#004D2C] transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                        >
                                            Proceed to Checkout <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Form Modal */}
            {showCheckoutForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#00703C]/10">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-[#004D2C]">Checkout</h3>
                                <button onClick={() => setShowCheckoutForm(false)} className="text-gray-400 hover:text-red-500 transition-colors text-2xl">
                                    ×
                                </button>
                            </div>

                            {showUpiPayment ? (
                                <div className="pt-2">
                                    <UpiPayment
                                        amount={getTotalPrice()}
                                        description={`Shop Order - ${Object.keys(cart).length} item(s)`}
                                        onSuccess={handleUpiSuccess}
                                        onCancel={() => setShowUpiPayment(false)}
                                        isLoading={processing}
                                    />
                                </div>
                            ) : null}
                            <form onSubmit={handlePayment} className="space-y-4" style={{ display: showUpiPayment ? 'none' : undefined }}>
                                <div>
                                    <label className="block text-sm font-bold text-[#004D2C] mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={checkoutData.name}
                                        onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00703C] focus:border-transparent bg-gray-50"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#004D2C] mb-2">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={checkoutData.email}
                                        onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00703C] focus:border-transparent bg-gray-50"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#004D2C] mb-2">Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={checkoutData.phone}
                                        onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00703C] focus:border-transparent bg-gray-50"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#004D2C] mb-2">Delivery Address *</label>
                                    <textarea
                                        required
                                        value={checkoutData.address}
                                        onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00703C] focus:border-transparent bg-gray-50"
                                        placeholder="Enter your complete address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#004D2C] mb-2">Payment Method</label>
                                    <select
                                        value={checkoutData.paymentMethod}
                                        onChange={(e) => setCheckoutData({ ...checkoutData, paymentMethod: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00703C] focus:border-transparent bg-gray-50 font-medium"
                                    >
                                        <option value="wallet">Wallet Payment</option>
                                        <option value="card">Credit/Debit Card</option>
                                        <option value="upi">UPI Payment</option>
                                        <option value="netbanking">Net Banking</option>
                                        <option value="cod">Cash on Delivery</option>
                                    </select>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-[#F0FDF4] p-5 rounded-2xl border border-[#00703C]/10">
                                    <h4 className="font-bold text-[#004D2C] mb-4">Order Summary</h4>
                                    <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
                                        {Object.entries(cart).map(([productId, qty]) => {
                                            const product = products.find(p => p.id === productId);
                                            if (!product) return null;
                                            return (
                                                <div key={productId} className="flex gap-3 p-2 bg-white rounded-lg border border-gray-100">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {product.image ? (
                                                            <Image
                                                                src={product.image}
                                                                alt={product.name}
                                                                width={48}
                                                                height={48}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                                📦
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className="font-bold text-xs text-[#004D2C] line-clamp-1">{product.name}</h5>
                                                        <div className="flex justify-between items-center mt-1">
                                                            <span className="text-xs font-bold text-[#00703C]">₹{product.price} x {qty}</span>
                                                            <span className="font-bold text-xs">₹{product.price * qty}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="border-t border-[#00703C]/20 pt-3 flex justify-between font-black text-lg text-[#004D2C]">
                                        <span>Total:</span>
                                        <span>₹{getTotalPrice()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCheckoutForm(false)}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-4 py-3 bg-[#00703C] text-white rounded-xl hover:bg-[#004D2C] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        {processing ? 'Processing...' : `Pay ₹${getTotalPrice()}`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Shop;