import React, { useState, useEffect } from 'react';
import { Store, Pill, ShoppingCart, ArrowUpRight, X, Link2, Globe, Target, UserPlus, Trash2, MoreHorizontal, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

const partnerSchema = yup.object().shape({
    name: yup.string().required('Business name is required').min(2, 'Name must be at least 2 characters'),
    category: yup.string().required('Category is required'),
    email: yup.string().required('Email is required').email('Valid email is required'),
    phone: yup.string().required('Phone number is required').min(10, 'Phone must be at least 10 digits'),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters')
});

const icons = {
    Restaurant: <Store size={18} />,
    Pharmacy: <Pill size={18} />,
    Supermarket: <ShoppingCart size={18} />,
    Other: <Store size={18} />
};

const colors = {
    Restaurant: 'text-amber-600 bg-amber-50',
    Pharmacy: 'text-emerald-600 bg-emerald-50',
    Supermarket: 'text-blue-600 bg-blue-50',
    Other: 'text-slate-600 bg-slate-50'
};

const PartnerCategory = ({ title, partners, icon: TabIcon, onDelete }) => {
    const { t } = useTranslation();
    return (
        <Card className="flex flex-col h-full border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group bg-white rounded-4xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-2xl group-hover:bg-primary transition-colors duration-500">
                        <TabIcon size={24} />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black text-slate-900 tracking-tighter uppercase italic">{t(title)}</CardTitle>
                        <Badge className="mt-1.5 font-black text-[9px] uppercase tracking-widest bg-slate-100 text-slate-400 border-none px-3">
                            {partners.length} {t('nodes')}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-y-auto max-h-[440px] scrollbar-hide">
                <div className="divide-y divide-slate-50">
                    {partners.length === 0 ? (
                        <div className="py-24 text-center px-10">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-100">
                                <TabIcon size={32} className="text-slate-200" />
                            </div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">{t('no_active_nodes')}</p>
                        </div>
                    ) : (
                        partners.map((p) => (
                            <div key={p._id} className="p-5 hover:bg-slate-50/80 transition-all cursor-pointer group/item">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs transition-transform group-hover/item:scale-110 ${colors[p.category] || colors.Other}`}>
                                            {icons[p.category] || icons.Other}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-slate-900 truncate uppercase italic tracking-tight">{p.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-slate-300 ring-4 ring-slate-100'}`} />
                                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{t(p.status)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-right hidden xs:block">
                                            <p className="text-base font-black text-slate-900 tracking-tighter">${p.revenue?.toLocaleString() || '0'}</p>
                                            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">{p.orders || 0} MVX</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                                            onClick={(e) => { e.stopPropagation(); onDelete(p._id); }}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
            <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                <Button variant="ghost" size="sm" className="w-full text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] h-12 rounded-2xl hover:bg-white hover:text-primary hover:shadow-xl border border-transparent hover:border-slate-100 transition-all active:scale-95 shadow-sm">
                    {t('view_analytics')} <ArrowUpRight size={14} className="ml-2.5" />
                </Button>
            </div>
        </Card>
    );
};

export default function PartnersPage() {
    const { t } = useTranslation();
    const [showPartnerModal, setShowPartnerModal] = useState(false);
    const [partners, setPartners] = useState([]);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(partnerSchema),
        defaultValues: { name: '', category: 'Restaurant', email: '', phone: '', password: '' }
    });

    const fetchPartners = async () => {
        try {
            const res = await api.get('/partners');
            setPartners(res.data.partners || []);
        } catch (e) { console.error('Failed to fetch'); }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const handleAddPartner = async (data) => {
        try {
            await api.post('/partners', data);
            setShowPartnerModal(false);
            fetchPartners();
            reset();
            toast.success('Partner added successfully!');
        } catch (e) {
            toast.error(e.response?.data?.message || t('error'));
        }
    };

    const handleDeletePartner = async (id) => {
        const p = partners.find(ptr => ptr._id === id);
        if (!window.confirm(`⚠️ ${t('disconnect_partner')} "${p?.name}"?`)) return;
        try {
            await api.delete(`/partners/${id}`);
            fetchPartners();
            toast.success('Partner deleted successfully');
        } catch (e) { toast.error(t('error')); }
    };

    const grouped = {
        restaurants: partners.filter(p => p.category === 'Restaurant'),
        pharmacies: partners.filter(p => p.category === 'Pharmacy'),
        supermarkets: partners.filter(p => p.category === 'Supermarket')
    };

    return (
        <div className="space-y-10 pb-32">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-1">
                <div className="space-y-1.5">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{t('b2b_partners')}</h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">{t('b2b_desc')}</p>
                </div>
                <Button 
                    onClick={() => setShowPartnerModal(true)} 
                    className="w-full sm:w-auto rounded-2xl shadow-xl shadow-primary/25 h-14 px-8 bg-primary hover:bg-primary/95 transition-all active:scale-95 group"
                >
                    <UserPlus size={18} className="mr-3 group-hover:rotate-12 transition-transform" />
                    <span className="font-black uppercase text-[10px] tracking-widest">{t('connect_node')}</span>
                </Button>
            </div>

            {/* Quick Insights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: t('global_traffic'), value: partners.reduce((acc, p) => acc + (p.orders || 0), 0), icon: <Globe />, color: 'text-blue-600', bg: 'bg-blue-50/50' },
                    { label: t('network_revenue'), value: `$${partners.reduce((acc, p) => acc + (p.revenue || 0), 0).toLocaleString()}`, icon: <Target />, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                    { label: t('active_stream_nodes'), value: partners.length, icon: <Link2 />, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all bg-white/60 backdrop-blur-md rounded-3xl overflow-hidden">
                        <CardContent className="p-6 flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm shadow-slate-200/50`}>
                                {React.cloneElement(stat.icon, { size: 28, strokeWidth: 2.5 })}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 leading-none">{stat.label}</p>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tighter italic">{stat.value}</h4>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <PartnerCategory title="culinary_units" partners={grouped.restaurants} icon={Store} onDelete={handleDeletePartner} />
                <PartnerCategory title="medical_nodes" partners={grouped.pharmacies} icon={Pill} onDelete={handleDeletePartner} />
                <PartnerCategory title="retail_streams" partners={grouped.supermarkets} icon={ShoppingCart} onDelete={handleDeletePartner} />
            </div>

            {/* Onboard Modal */}
            <AnimatePresence>
                {showPartnerModal && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPartnerModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-4xl p-8 md:p-12 w-full max-w-xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden z-10"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                            
                            <div className="relative space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl">
                                            <UserPlus size={28} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{t('partner_induction')}</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.23em] italic">{t('b2b_protocol_desc')}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-slate-900 rounded-full transition-all" onClick={() => setShowPartnerModal(false)}>
                                        <X size={24} />
                                    </Button>
                                </div>

                                <form className="space-y-6" onSubmit={handleSubmit(handleAddPartner)}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('business_name')}</label>
                                            <Input className={`h-12 rounded-xl bg-slate-50 border-none font-bold text-sm ${errors.name ? 'ring-2 ring-red-400' : ''}`} placeholder="Ex: HealthFirst" {...register('name')} />
                                            {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 px-1">{errors.name.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('node_category')}</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                                                    {...register('category')}
                                                >
                                                    <option value="Restaurant">{t('culinary')}</option>
                                                    <option value="Pharmacy">{t('medical')}</option>
                                                    <option value="Supermarket">{t('retail')}</option>
                                                    <option value="Other">{t('auxiliary')}</option>
                                                </select>
                                                <MoreHorizontal size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                            {errors.category && <p className="text-red-500 text-[10px] font-bold mt-1 px-1">{errors.category.message}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('official_comm_node')}</label>
                                        <Input type="email" className={`h-12 rounded-xl bg-slate-50 border-none font-bold text-sm ${errors.email ? 'ring-2 ring-red-400' : ''}`} placeholder="partner@example.com" {...register('email')} />
                                        {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 px-1">{errors.email.message}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('secure_line')}</label>
                                            <Input className={`h-12 rounded-xl bg-slate-50 border-none font-bold text-sm ${errors.phone ? 'ring-2 ring-red-400' : ''}`} placeholder="+91 99887 76655" {...register('phone')} />
                                            {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 px-1">{errors.phone.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('access_protocol')}</label>
                                            <Input type="password" className={`h-12 rounded-xl bg-slate-50 border-none font-bold text-sm ${errors.password ? 'ring-2 ring-red-400' : ''}`} placeholder="••••••••" {...register('password')} />
                                            {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 px-1">{errors.password.message}</p>}
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-16 rounded-2xl mt-8 font-black uppercase tracking-widest italic shadow-xl shadow-primary/25 text-sm active:scale-[0.98] transition-all">
                                        {t('authorize_partnership')}
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
