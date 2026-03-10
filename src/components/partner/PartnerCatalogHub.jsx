import React, { useState } from 'react';
import { Package, DollarSign, Plus, Trash2, Edit2, CheckCircle, Tag, Box, Loader2, Image as ImageIcon, Search, Clock, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';

const PartnerCatalogHub = ({ catalogItems, onAdd, onDelete, onUpdate, categories = ['Main', 'Sides', 'Beverages', 'Desserts'] }) => {
    const { t } = useTranslation();
    const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Main', description: '', image: '' });
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [isAdding, setIsAdding] = useState(false);

    const filteredItems = catalogItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'All' || item.category === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {['All', ...categories].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === cat ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input 
                            placeholder="Search catalog matrix..." 
                            className="pl-10 h-10 border-slate-100 focus:ring-primary/10 rounded-xl font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsAdding(true)} className="h-10 rounded-xl px-6 font-black uppercase text-[10px] tracking-widest italic shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                        <Plus size={16} className="mr-2" /> Add New Item
                    </Button>
                </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map(item => (
                        <motion.div 
                            key={item._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-slate-200/50"
                        >
                            <div className="aspect-4/3 bg-slate-50 relative overflow-hidden">
                                {item.image ? (
                                    <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                        <ImageIcon size={48} strokeWidth={1} />
                                        <p className="text-[10px] font-black uppercase mt-3 tracking-widest">No Visual Data</p>
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[80%]">
                                    <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none text-[8px] font-black italic shadow-sm hover:scale-105 transition-transform cursor-default">{item.category?.toUpperCase() || 'MAIN'}</Badge>
                                    {!item.isAvailable && <Badge variant="destructive" className="text-[8px] font-black italic animate-pulse shadow-sm">UNAVAILABLE</Badge>}
                                    {item.outOfStockForToday && <Badge className="bg-amber-500/90 text-white border-none text-[8px] font-black italic shadow-sm">OOS TODAY</Badge>}
                                </div>
                                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    <Button size="icon" variant="secondary" onClick={() => setEditingItem(item)} className="rounded-full w-10 h-10 hover:bg-white text-slate-900 shadow-xl transition-transform hover:scale-110">
                                        <Edit2 size={16} />
                                    </Button>
                                    <Button size="icon" variant="destructive" onClick={() => onDelete(item._id)} className="rounded-full w-10 h-10 shadow-lg shadow-rose-500/20 hover:scale-110 transition-transform">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="text-sm font-black text-slate-800 truncate pr-4">{item.name}</h5>
                                    <span className="text-sm font-black text-primary italic">${parseFloat(item.price).toFixed(2)}</span>
                                </div>
                                <p className="text-[10px] font-medium text-slate-400 line-clamp-2 leading-relaxed h-8">
                                    {item.description || "No tactical description available for this merchandise node."}
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between gap-2">
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded-lg">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10} /> In Catalog</span>
                                            <button onClick={() => onUpdate(item._id, { isAvailable: !item.isAvailable })} className={`w-8 h-4 rounded-full p-0.5 transition-all ${item.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${item.isAvailable ? 'translate-x-4' : ''}`} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between bg-amber-50/50 px-2 py-1 rounded-lg border border-amber-100/50">
                                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> OOS Today</span>
                                            <button onClick={() => onUpdate(item._id, { outOfStockForToday: !item.outOfStockForToday })} className={`w-8 h-4 rounded-full p-0.5 transition-all ${item.outOfStockForToday ? 'bg-amber-500' : 'bg-slate-200'}`}>
                                                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${item.outOfStockForToday ? 'translate-x-4' : ''}`} />
                                            </button>
                                        </div>
                                    </div>
                                    {item.customizationOptions?.addOns?.length > 0 && (
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 shadow-sm" title="Has Add-ons/Variants">
                                            <Layers size={14} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredItems.length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                        <Box size={48} className="text-slate-100 mb-4" />
                        <p className="text-xs font-black text-slate-200 uppercase tracking-[0.3em] italic">Zero matching catalog nodes detected.</p>
                    </div>
                )}
            </div>

            {/* Addition Modal */}
            <AnimatePresence>
                {(isAdding || editingItem) && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-lg bg-white rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl p-6 md:p-10 border border-white/20"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <Badge className="bg-primary/10 text-primary border-none mb-2 text-[9px] font-black tracking-widest italic">{editingItem ? 'EDIT_NODE' : 'NEW_ENTRY'}</Badge>
                                    <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter capitalize">{editingItem ? 'Modify Product' : 'Add New Product'}</h3>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingItem(null); }} className="rounded-2xl hover:bg-slate-50 transition-colors">
                                    <Plus className="rotate-45" size={24} />
                                </Button>
                            </div>

                            <form onSubmit={(e) => { 
                                e.preventDefault(); 
                                if (editingItem) {
                                    onUpdate(editingItem._id, editingItem);
                                    setEditingItem(null);
                                } else {
                                    onAdd(newItem);
                                    setIsAdding(false);
                                    setNewItem({ name: '', price: '', category: 'Main', description: '', image: '' });
                                }
                            }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Merchandise Label</label>
                                    <Input 
                                        required 
                                        className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-black italic text-md px-6 focus:ring-primary/20" 
                                        placeholder="e.g. Classic Burger Pro" 
                                        value={editingItem ? editingItem.name : newItem.name}
                                        onChange={e => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewItem({...newItem, name: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Price Matrix ($)</label>
                                        <Input 
                                            required 
                                            type="number" 
                                            step="0.01" 
                                            className="h-12 md:h-14 bg-slate-50 border-slate-100 rounded-2xl font-black italic text-md px-6" 
                                            placeholder="0.00" 
                                            value={editingItem ? editingItem.price : newItem.price}
                                            onChange={e => editingItem ? setEditingItem({...editingItem, price: e.target.value}) : setNewItem({...newItem, price: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Category Hub</label>
                                        <select 
                                            className="w-full h-12 md:h-14 bg-slate-50 border border-slate-100 rounded-2xl font-black italic text-sm px-6 outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                                            value={editingItem ? editingItem.category : newItem.category}
                                            onChange={e => editingItem ? setEditingItem({...editingItem, category: e.target.value}) : setNewItem({...newItem, category: e.target.value})}
                                        >
                                            {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Visual Asset (Image URL)</label>
                                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                                        <Input 
                                            className="h-12 md:h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold text-sm px-6 flex-1" 
                                            placeholder="https://example.com/food.jpg" 
                                            value={editingItem ? editingItem.image : newItem.image}
                                            onChange={e => editingItem ? setEditingItem({...editingItem, image: e.target.value}) : setNewItem({...newItem, image: e.target.value})}
                                        />
                                        <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 overflow-hidden border">
                                            {(editingItem?.image || newItem.image) ? <img src={editingItem?.image || newItem.image} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 border-dashed flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors" onClick={() => alert("Detailed Variant & Add-on Management UI will open here.")}>
                                    <div>
                                        <p className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2"><Layers size={14} className="text-indigo-500" /> Manage Variants & Add-ons</p>
                                        <p className="text-[10px] font-medium text-indigo-400 mt-1">Add Sizes (Small, Large) or Extra Toppings</p>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="text-indigo-500 hover:bg-indigo-100 rounded-full h-8 w-8"><Plus size={16}/></Button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tactical Specification</label>
                                    <textarea 
                                        className="w-full h-28 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm p-6 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner" 
                                        placeholder="Enter merchandise technical specifications..."
                                        value={editingItem ? editingItem.description : newItem.description}
                                        onChange={e => editingItem ? setEditingItem({...editingItem, description: e.target.value}) : setNewItem({...newItem, description: e.target.value})}
                                    />
                                </div>

                                <Button className="w-full h-16 bg-primary text-white hover:opacity-90 rounded-[24px] font-black uppercase text-[12px] tracking-[0.2em] italic shadow-2xl shadow-primary/30 mt-6 transition-all transform active:scale-[0.98]">
                                    {editingItem ? <CheckCircle size={20} className="mr-3" /> : <Plus size={20} className="mr-3" />}
                                    {editingItem ? 'Sync Modification' : 'Deploy to Catalog'}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PartnerCatalogHub;
