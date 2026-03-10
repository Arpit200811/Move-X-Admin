import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Tag, Calendar, Users, Zap, CheckCircle, XCircle, Loader2, AlertCircle, Gift, Percent, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import api from '../../services/api';

const CAMPAIGN_TYPES = [
    { id: 'percentage', label: 'Percentage OFF', icon: <Percent size={18} />, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'flat', label: 'Flat Amount OFF', icon: <DollarSign size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const SCOPES = ['ALL', 'FOOD', 'GROCERY', 'PHARMACY', 'RIDE', 'PARCEL'];

const emptyForm = {
    code: '', type: 'percentage', value: '', minOrderAmount: '',
    maxDiscountAmount: '', expiryDate: '', usageLimit: '100', scope: 'ALL'
};

const PartnerPromotionsHub = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [backendUnavailable, setBackendUnavailable] = useState(false);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            setBackendUnavailable(false);
            const res = await api.get('/marketing/promotions');
            setPromotions(res.data.promotions || []);
        } catch (e) {
            if (e.response?.status === 404) {
                setBackendUnavailable(true);
                console.warn('[PROMOTIONS] Backend route not found (404). Backend may need to be redeployed.');
            } else {
                console.error('Failed to fetch promotions:', e.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPromotions(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            const res = await api.post('/marketing/promotions', form);
            setPromotions(prev => [res.data.promotion, ...prev]);
            setShowCreate(false);
            setForm(emptyForm);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to create promotion');
        } finally { setSaving(false); }
    };

    const handleToggle = async (id) => {
        try {
            const res = await api.patch(`/marketing/promotions/${id}/toggle`);
            setPromotions(prev => prev.map(p => p._id === id ? res.data.promotion : p));
        } catch (e) { console.error('Toggle failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this promotion permanently?')) return;
        try {
            await api.delete(`/marketing/promotions/${id}`);
            setPromotions(prev => prev.filter(p => p._id !== id));
        } catch (e) { console.error('Delete failed'); }
    };

    const activeCount = promotions.filter(p => p.isActive).length;
    const totalUsage = promotions.reduce((s, p) => s + (p.usageCount || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                            <Megaphone size={24} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">Promotions Hub</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zomato-Style Campaign Engine</p>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={() => setShowCreate(true)}
                    className="h-12 rounded-xl px-6 font-black uppercase text-[10px] tracking-widest italic shadow-xl shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                >
                    <Plus size={16} /> Launch New Campaign
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Active Campaigns', value: activeCount, icon: <Zap size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Total Campaigns', value: promotions.length, icon: <Megaphone size={18} />, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Total Redeemed', value: totalUsage, icon: <Users size={18} />, color: 'text-amber-500', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-[24px] border-slate-100 shadow-xl overflow-hidden">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>{stat.icon}</div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <h4 className="text-2xl font-black text-slate-900 italic">{stat.value}</h4>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Promotions List */}
            {loading ? (
                <div className="py-20 flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-emerald-500" />
                </div>
            ) : backendUnavailable ? (
                <div className="py-16 flex flex-col items-center justify-center bg-amber-50 rounded-[32px] border border-amber-100 text-center px-8">
                    <AlertCircle size={40} className="text-amber-500 mb-4" />
                    <h3 className="text-lg font-black text-amber-900">Backend Update Required</h3>
                    <p className="text-sm text-amber-600 font-medium mt-2 max-w-md">The Promotions API routes are not yet available on your deployed server. Please redeploy your backend to <strong>Render</strong> to activate this feature.</p>
                    <div className="mt-4 p-4 bg-amber-100 rounded-2xl text-xs font-mono text-amber-700 text-left w-full max-w-md">
                        <p className="font-black mb-1">✅ Required route:</p>
                        <p>GET /api/marketing/promotions</p>
                        <p>POST /api/marketing/promotions</p>
                    </div>
                </div>
            ) : promotions.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                    <Gift size={56} className="text-slate-100 mb-4" />
                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest italic">No campaigns yet</p>
                    <p className="text-xs text-slate-300 mt-1">Launch your first promotion to boost sales!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence mode="popLayout">
                        {promotions.map((promo) => (
                            <motion.div
                                key={promo._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`group bg-white rounded-[32px] border overflow-hidden shadow-xl transition-all hover:shadow-2xl ${promo.isActive ? 'border-emerald-100' : 'border-slate-100 opacity-70'}`}
                            >
                                <div className={`h-2 w-full ${promo.isActive ? 'bg-linear-to-r from-emerald-400 to-emerald-600' : 'bg-slate-200'}`} />
                                <div className="p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl font-black italic tracking-wider text-slate-900 font-mono">{promo.code}</span>
                                                {promo.isActive ? (
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black tracking-widest">LIVE</Badge>
                                                ) : (
                                                    <Badge className="bg-slate-100 text-slate-400 border-none text-[8px] font-black tracking-widest">PAUSED</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm font-black text-slate-400 italic">
                                                {promo.type === 'percentage' ? `${promo.value}% OFF` : `₹${promo.value} OFF`}
                                                {promo.minOrderAmount > 0 && ` · Min ₹${promo.minOrderAmount}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black italic text-slate-900">
                                                {promo.type === 'percentage' ? `${promo.value}%` : `₹${promo.value}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Used</p>
                                            <p className="text-lg font-black text-slate-900 mt-1">{promo.usageCount}/{promo.usageLimit}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Scope</p>
                                            <p className="text-xs font-black text-indigo-600 mt-1 italic">{promo.scope}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Expires</p>
                                            <p className="text-xs font-black text-slate-700 mt-1 italic text-center">
                                                {promo.expiryDate ? new Date(promo.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '∞'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
                                        <div
                                            className={`h-1.5 rounded-full transition-all ${promo.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            style={{ width: `${Math.min((promo.usageCount / promo.usageLimit) * 100, 100)}%` }}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => handleToggle(promo._id)}
                                            variant={promo.isActive ? 'outline' : 'default'}
                                            className={`flex-1 h-11 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${promo.isActive ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                                        >
                                            {promo.isActive ? <><XCircle size={14} className="mr-2" />Pause</> : <><CheckCircle size={14} className="mr-2" />Activate</>}
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(promo._id)}
                                            variant="outline"
                                            className="h-11 w-11 rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50 p-0 flex items-center justify-center"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {showCreate && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-xl">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black tracking-widest mb-2">NEW_CAMPAIGN</Badge>
                                        <h3 className="text-2xl font-black text-slate-900 italic">Create Promotion</h3>
                                    </div>
                                    <button onClick={() => { setShowCreate(false); setError(''); }} className="w-10 h-10 rounded-2xl hover:bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Plus className="rotate-45" size={22} />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCreate} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                                {error && (
                                    <div className="flex items-center gap-2 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600">
                                        <AlertCircle size={16} />
                                        <p className="text-xs font-bold">{error}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {CAMPAIGN_TYPES.map(ct => (
                                        <button key={ct.id} type="button" onClick={() => setForm({ ...form, type: ct.id })}
                                            className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${form.type === ct.id ? 'border-emerald-400 bg-emerald-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                                            <span className={ct.color}>{ct.icon}</span>
                                            <span className="text-xs font-black text-slate-700 text-left">{ct.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Coupon Code</label>
                                    <Input required className="h-12 bg-slate-50 border-slate-100 rounded-2xl font-black text-lg uppercase font-mono tracking-widest"
                                        placeholder="e.g. SAVE50" value={form.code}
                                        onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                            {form.type === 'percentage' ? 'Discount %' : 'Flat Amount (₹)'}
                                        </label>
                                        <Input required type="number" min="1" className="h-12 bg-slate-50 border-slate-100 rounded-2xl font-black" placeholder={form.type === 'percentage' ? '20' : '50'}
                                            value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usage Limit</label>
                                        <Input type="number" min="1" className="h-12 bg-slate-50 border-slate-100 rounded-2xl font-black" placeholder="100"
                                            value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Order (₹)</label>
                                        <Input type="number" min="0" className="h-12 bg-slate-50 border-slate-100 rounded-2xl font-black" placeholder="0"
                                            value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} />
                                    </div>
                                    {form.type === 'percentage' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Discount (₹)</label>
                                            <Input type="number" min="0" className="h-12 bg-slate-50 border-slate-100 rounded-2xl font-black" placeholder="200"
                                                value={form.maxDiscountAmount} onChange={e => setForm({ ...form, maxDiscountAmount: e.target.value })} />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                        <Input type="date" className="h-12 bg-slate-50 border-slate-100 rounded-2xl font-black"
                                            value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valid For</label>
                                        <select className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm px-4 outline-none"
                                            value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })}>
                                            {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <Button type="submit" disabled={saving}
                                    className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-emerald-500/30 mt-4">
                                    {saving ? <Loader2 size={20} className="animate-spin" /> : <><CheckCircle size={18} className="mr-2" /> Launch Campaign</>}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PartnerPromotionsHub;
