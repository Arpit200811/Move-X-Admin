import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Edit3,
    Trash2,
    Eye,
    Plus,
    Package,
    Store,
    Tag,
    AlertCircle,
    CheckCircle2,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function CatalogHub() {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/catalog');
            setProducts(res.data.products);
        } catch (err) {
            console.error("Failed to load catalog", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filtered = products.filter(p => 
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         p.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterCategory === 'ALL' || p.category === filterCategory)
    );

    const categories = ['ALL', ...new Set(products.map(p => p.category).filter(Boolean))];

    const toggleAvailability = async (productId, currentStatus) => {
        try {
            await api.patch(`/catalog/${productId}`, { isAvailable: !currentStatus });
            fetchProducts();
        } catch (err) {
            alert("Protocol Failure: Handshake failed");
        }
    };

    return (
        <div className="space-y-8 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-1">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                            <Package size={24} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                            {t('catalog_hub', 'Catalog Matrix')}
                        </h2>
                    </div>
                    <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.25em] ml-1">
                        {t('global_product_node_management', 'Global Product Node Management')}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={fetchProducts} variant="outline" className="h-14 px-6 rounded-2xl border-slate-200 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all active:scale-95">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </Button>
                    <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black shadow-xl shadow-indigo-600/25 uppercase text-[10px] tracking-widest flex items-center gap-3 active:scale-95 transition-all">
                        <Plus size={18} />
                        {t('provision_new_node', 'Provision New Node')}
                    </Button>
                </div>
            </div>

            {/* Tactical Search & Filters */}
            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={t('search_nodes_placeholder', 'Search by product or vendor metadata...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-12 pr-6 rounded-2xl border-2 border-slate-100 bg-slate-50/50 outline-none focus:border-indigo-600/30 focus:bg-white focus:ring-4 focus:ring-indigo-600/5 transition-all font-bold text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`h-14 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border-2 ${filterCategory === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Matrix Result Grid */}
            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-t-2 border-indigo-600 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <RefreshCw size={24} className="text-indigo-600 opacity-20" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Catalog Matrix</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence>
                        {filtered.map((product, idx) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                layout
                            >
                                <Card className="border-none shadow-sm hover:shadow-2xl transition-all rounded-3xl overflow-hidden bg-white group h-full flex flex-col">
                                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                        <img 
                                            src={product.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400`} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className={`border-none font-black text-[8px] uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg ${product.isAvailable ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                                {product.isAvailable ? 'AVAILABLE' : 'OUT_OF_STOCK'}
                                            </Badge>
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-100 text-slate-400">
                                                {product.category || 'GENERAL'}
                                            </Badge>
                                            <div className="h-px bg-slate-100 flex-1" />
                                            <span className="text-lg font-black text-indigo-600 italic tracking-tighter decoration-indigo-600/10 decoration-4">₹{product.price}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase mb-2 truncate">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-slate-500 mb-6">
                                            <Store size={14} className="opacity-40" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest truncate">{product.vendor?.name || 'GENERIC_SOURCE'}</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 mt-auto">
                                            <Button 
                                                onClick={() => toggleAvailability(product._id, product.isAvailable)}
                                                variant="outline" 
                                                className={`h-11 rounded-xl border-slate-100 font-black text-[9px] uppercase tracking-widest transition-all ${product.isAvailable ? 'hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100' : 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100'}`}
                                            >
                                                {product.isAvailable ? <Trash2 size={14} className="mr-2" /> : <CheckCircle2 size={14} className="mr-2" />}
                                                {product.isAvailable ? t('deprovision') : t('restore')}
                                            </Button>
                                            <Button variant="outline" className="h-11 rounded-xl border-slate-100 hover:bg-slate-50 hover:border-slate-200 font-black text-[9px] uppercase tracking-widest">
                                                <Edit3 size={14} className="mr-2 text-indigo-600" />
                                                {t('reconfigure')}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
