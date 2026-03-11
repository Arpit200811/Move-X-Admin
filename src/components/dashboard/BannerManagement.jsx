import React, { useState, useEffect } from 'react';
import { 
    Image as ImageIcon, 
    Plus, 
    Trash2, 
    Layers, 
    Globe, 
    ExternalLink, 
    Save, 
    X,
    Layout,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

const bannerSchema = yup.object().shape({
    title: yup.string().required('Banner title is required').min(3, 'Title must be at least 3 characters'),
    imageUrl: yup.string().required('Image URL is required').url('Must be a valid URL'),
    category: yup.string().required('Category is required'),
    priority: yup.number().typeError('Priority must be a number').integer('Priority must be an integer').required('Priority is required'),
    linkTo: yup.string()
});

export default function BannerManagement() {
    const { t } = useTranslation();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(bannerSchema),
        defaultValues: { title: '', imageUrl: '', linkTo: '', priority: 0, category: 'ALL' }
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await api.get('/banners');
            setBanners(res.data.banners || []);
        } catch (err) {
            console.error("Failed to load banners", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data) => {
        try {
            await api.post('/banners', data);
            setShowForm(false);
            reset();
            fetchBanners();
            toast.success("Payload Injected successfully!");
        } catch (err) {
            toast.error("Protocol failure: Banner upload not authorized.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Terminate this banner node?")) return;
        try {
            await api.delete(`/banners/${id}`);
            fetchBanners();
            toast.success("Banner Terminated.");
        } catch (err) {
            toast.error("Deletion protocol failed.");
        }
    };

    return (
        <div className="space-y-8 pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-4">
                        <Layout className="text-primary" size={32} />
                        {t('creative_hub') || "Visual Spectrum"}
                    </h2>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 ml-12">Dynamic UI Payload Management</p>
                </div>

                <Button 
                    onClick={() => setShowForm(true)}
                    className="h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest italic bg-primary hover:bg-primary/95 shadow-xl shadow-primary/25 group transition-all"
                >
                    <Plus size={18} className="mr-3 group-hover:rotate-90 transition-transform" />
                    Inject New Banner
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {banners.map((banner, idx) => (
                    <motion.div
                        key={banner._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="border-none shadow-xl hover:shadow-2xl transition-all bg-white rounded-4xl overflow-hidden group h-full flex flex-col">
                            <div className="aspect-video relative group overflow-hidden bg-slate-100">
                                <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 to-transparent z-10" />
                                <img src={banner.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={banner.title} />
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-black/80 to-transparent">
                                    <Badge className="bg-white/20 backdrop-blur-md text-white border-none font-black text-[8px] uppercase tracking-widest px-3 py-1 mb-2">
                                        {banner.category}
                                    </Badge>
                                    <h3 className="text-lg font-black text-white italic tracking-tighter truncate">{banner.title}</h3>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                    <Button 
                                        size="icon" 
                                        variant="destructive" 
                                        onClick={() => handleDelete(banner._id)}
                                        className="w-10 h-10 rounded-xl shadow-lg"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-6 flex-1 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                            <ExternalLink size={14} />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase truncate flex-1">{banner.linkTo || "NO_DEEP_LINK"}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                            <Layers size={14} />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">PRIORITY LEVEL: {banner.priority}</p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-50">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(banner.createdAt).toLocaleDateString()}</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live Node</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}

                {banners.length === 0 && !loading && (
                    <div className="col-span-full py-40 border-2 border-dashed border-slate-100 rounded-4xl flex flex-col items-center justify-center bg-white/50">
                        <ImageIcon size={64} className="text-slate-100 mb-6" />
                        <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] italic">No promotional payloads in orbit</p>
                    </div>
                )}
            </div>

            {/* Injection Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-60 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">New Banner Protocol</h3>
                                <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit(handleCreate)} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Banner Title</label>
                                    <input 
                                        type="text" 
                                        placeholder="Summer Food Fest 2024"
                                        className={`w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all ${errors.title ? 'ring-2 ring-red-400' : ''}`}
                                        {...register('title')}
                                    />
                                    {errors.title && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.title.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image CDN URL</label>
                                    <input 
                                        type="url" 
                                        placeholder="https://assets.movex.com/banners/..."
                                        className={`w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all ${errors.imageUrl ? 'ring-2 ring-red-400' : ''}`}
                                        {...register('imageUrl')}
                                    />
                                    {errors.imageUrl && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.imageUrl.message}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                        <select 
                                            className={`w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all ${errors.category ? 'ring-2 ring-red-400' : ''}`}
                                            {...register('category')}
                                        >
                                            <option value="ALL">ALL PLATFORM</option>
                                            <option value="FOOD">FOOD_CMD</option>
                                            <option value="PARCEL">PARCEL_CMD</option>
                                            <option value="GROCERY">GROCERY_CMD</option>
                                        </select>
                                        {errors.category && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.category.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                                        <input 
                                            type="number" 
                                            className={`w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all ${errors.priority ? 'ring-2 ring-red-400' : ''}`}
                                            {...register('priority')}
                                        />
                                        {errors.priority && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.priority.message}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Navigation Key (Deep Link)</label>
                                    <input 
                                        type="text" 
                                        placeholder="SCREEN_RESTAURANT_DETAILS"
                                        className={`w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all ${errors.linkTo ? 'ring-2 ring-red-400' : ''}`}
                                        {...register('linkTo')}
                                    />
                                    {errors.linkTo && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.linkTo.message}</p>}
                                </div>
                                <Button className="w-full h-14 bg-primary hover:bg-primary/95 rounded-2xl font-black uppercase text-[10px] tracking-widest italic shadow-xl shadow-primary/25 mt-4 transition-all active:scale-95">
                                    Confirm Payload Injection
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {loading && (
                <div className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                    <RefreshCw className="animate-spin text-primary mb-6" size={64} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse italic">Scanning Visual Buffer...</p>
                </div>
            )}
        </div>
    );
}
