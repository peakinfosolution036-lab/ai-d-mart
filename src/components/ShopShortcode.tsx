'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, ArrowRight } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
    category: string;
    description?: string;
}

const ShopShortcode = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/shop/products')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Handle both possible response structures and show only first 6 products for homepage
                    const products = data.products || data.data || [];
                    setProducts(products.slice(0, 6));
                }
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <section className="py-32 px-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="animate-pulse">
                            <div className="h-16 bg-gray-200 rounded mb-4 mx-auto max-w-md"></div>
                            <div className="h-6 bg-gray-200 rounded mb-8 mx-auto max-w-lg"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return (
            <section className="py-32 px-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Shop Premium
                    </h2>
                    <p className="text-xl text-gray-700 mb-8">No products available. Admin can add products from admin panel.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-32 px-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-32 right-32 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl animate-bounce"></div>
                <div className="absolute top-1/2 left-10 w-64 h-64 bg-gradient-to-r from-indigo-400/25 to-purple-500/25 rounded-full blur-2xl animate-ping"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Shop Premium
                    </h2>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
                        Discover our curated collection of premium event products and essentials
                    </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-700 overflow-hidden hover:scale-105 hover:-translate-y-4 border border-white/50"
                            style={{
                                animationDelay: `${index * 100}ms`
                            }}
                        >
                            <div className="aspect-square overflow-hidden relative bg-gradient-to-br from-gray-100 to-gray-200">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        quality={100}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const parent = e.currentTarget.parentElement;
                                            if (parent) {
                                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><span class="text-6xl">🛍️</span></div>';
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <span className="text-6xl">🛍️</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                {/* Floating Price Tag */}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-purple-600 px-4 py-2 rounded-full font-bold text-lg shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                    ₹{product.price}
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                        {product.category}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                                    {product.name}
                                </h3>

                                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                                    {product.description || 'Premium quality product for your events'}
                                </p>

                                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-2xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-3 group/btn">
                                    <ShoppingCart size={20} />
                                    <span>Add to Cart</span>
                                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Products Button */}
                <div className="text-center">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-6 rounded-full text-xl font-bold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-2 group"
                    >
                        <span>View All Products</span>
                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ShopShortcode;