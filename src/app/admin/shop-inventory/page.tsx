'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Eye, EyeOff, Star, Package, AlertTriangle, Upload, Loader2 } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    images: string[];
    originalPrice: number;
    offerPrice: number;
    stock: number;
    sku: string;
    status: 'Active' | 'Out of Stock' | 'Disabled';
    showOnHomepage: boolean;
    homepageOrder: number;
    featured: boolean;
    limitedOffer: boolean;
}

const categories = [
    'Driving Accessories',
    'Safety Kits',
    'Courses',
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books'
];

export default function ShopInventory() {
    const [products, setProducts] = useState<Product[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadError('');
        try {
            const fd = new FormData();
            fd.append('image', file);
            fd.append('folder', 'products');
            const res = await fetch('/api/upload/payment-screenshot', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, images: [data.url] }));
            } else {
                setUploadError(data.error || 'Upload failed');
            }
        } catch {
            setUploadError('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        images: [''],
        originalPrice: 0,
        offerPrice: 0,
        stock: 0,
        sku: '',
        status: 'Active' as 'Active' | 'Out of Stock' | 'Disabled',
        showOnHomepage: false,
        homepageOrder: 1,
        featured: false,
        limitedOffer: false
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/admin/shop');
            const data = await response.json();
            if (data.success) {
                // Handle both possible response structures
                const products = data.products || data.data || [];
                setProducts(products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const method = editingProduct ? 'PUT' : 'POST';
            const payload = editingProduct 
                ? { ...formData, id: editingProduct.id }
                : formData;

            const response = await fetch('/api/admin/shop', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (data.success) {
                fetchProducts();
                resetForm();
                setShowModal(false);
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            description: '',
            images: [''],
            originalPrice: 0,
            offerPrice: 0,
            stock: 0,
            sku: '',
            status: 'Active',
            showOnHomepage: false,
            homepageOrder: 1,
            featured: false,
            limitedOffer: false
        });
        setEditingProduct(null);
    };

    const editProduct = (product: Product) => {
        setFormData({
            name: product.name,
            category: product.category,
            description: product.description,
            images: product.images && product.images.length ? product.images : [''],
            originalPrice: product.originalPrice,
            offerPrice: product.offerPrice,
            stock: product.stock,
            sku: product.sku,
            status: product.status,
            showOnHomepage: product.showOnHomepage,
            homepageOrder: product.homepageOrder,
            featured: product.featured,
            limitedOffer: product.limitedOffer
        });
        setEditingProduct(product);
        setShowModal(true);
    };

    const toggleHomepageVisibility = async (product: Product) => {
        try {
            const response = await fetch('/api/admin/shop', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...product,
                    showOnHomepage: !product.showOnHomepage
                })
            });

            if (response.ok) {
                fetchProducts();
            }
        } catch (error) {
            console.error('Error updating homepage visibility:', error);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Shop Inventory</h1>
                        <p className="text-gray-600 mt-2">Manage products for "Shop Now" section</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Product
                    </button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="aspect-square bg-gray-100 relative">
                                {product.images && product.images[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        style={{ width: "100%", height: "100%" }}
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const parent = e.currentTarget.parentElement;
                                            if (parent) {
                                                const fallback = parent.querySelector('.fallback-icon');
                                                if (fallback) {
                                                    (fallback as HTMLElement).style.display = 'flex';
                                                }
                                            }
                                        }}
                                    />
                                ) : null}
                                <div className="fallback-icon w-full h-full flex items-center justify-center" style={{ display: (product.images && product.images[0]) ? 'none' : 'flex' }}>
                                    <Package className="w-16 h-16 text-gray-400" />
                                </div>
                                
                                {/* Homepage Visibility Toggle */}
                                <button
                                    onClick={() => toggleHomepageVisibility(product)}
                                    className={`absolute top-3 right-3 p-2 rounded-full ${
                                        product.showOnHomepage 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-gray-500 text-white'
                                    }`}
                                    title={product.showOnHomepage ? 'Visible on Homepage' : 'Hidden from Homepage'}
                                >
                                    {product.showOnHomepage ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>

                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                                
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-lg font-bold text-gray-900">₹{product.offerPrice}</span>
                                    {product.originalPrice > product.offerPrice && (
                                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                    <span>Stock: {product.stock}</span>
                                    <span>Order: #{product.homepageOrder}</span>
                                </div>

                                <button
                                    onClick={() => editProduct(product)}
                                    className="w-full bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                                >
                                    <Edit size={16} />
                                    Edit Product
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-6">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                                        <div className="flex items-center gap-3">
                                            {formData.images[0] ? (
                                                <img src={formData.images[0]} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <Package size={24} className="text-gray-400" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploading}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                                                >
                                                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                                </button>
                                                {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
                                                {formData.images[0] && <p className="text-xs text-green-600 mt-1">Image uploaded</p>}
                                            </div>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Original Price</label>
                                            <input
                                                type="number"
                                                value={formData.originalPrice}
                                                onChange={(e) => setFormData({...formData, originalPrice: Number(e.target.value)})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Offer Price</label>
                                            <input
                                                type="number"
                                                value={formData.offerPrice}
                                                onChange={(e) => setFormData({...formData, offerPrice: Number(e.target.value)})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                                            <input
                                                type="number"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                                            <input
                                                type="text"
                                                value={formData.sku}
                                                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Out of Stock">Out of Stock</option>
                                                <option value="Disabled">Disabled</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Homepage Controls */}
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="font-medium text-blue-900 mb-3">Homepage Display Settings</h3>
                                        
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.showOnHomepage}
                                                    onChange={(e) => setFormData({...formData, showOnHomepage: e.target.checked})}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium text-blue-900">Show on Homepage - Shop Now Section</span>
                                            </label>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-blue-700 mb-1">Display Order</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={formData.homepageOrder}
                                                        onChange={(e) => setFormData({...formData, homepageOrder: Number(e.target.value)})}
                                                        className="w-full px-2 py-1 text-sm border border-blue-200 rounded focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.featured}
                                                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                                                        className="w-4 h-4 text-blue-600 rounded"
                                                    />
                                                    <span className="text-xs font-medium text-blue-900">Featured</span>
                                                </label>

                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.limitedOffer}
                                                        onChange={(e) => setFormData({...formData, limitedOffer: e.target.checked})}
                                                        className="w-4 h-4 text-blue-600 rounded"
                                                    />
                                                    <span className="text-xs font-medium text-blue-900">Limited Offer</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowModal(false);
                                                resetForm();
                                            }}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            {editingProduct ? 'Update Product' : 'Add Product'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}