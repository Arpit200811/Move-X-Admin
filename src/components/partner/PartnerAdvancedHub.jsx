import React, { useState, useEffect, useCallback } from 'react';
import {
    Timer, Calendar, AlertTriangle, TrendingUp, FileText, Users, Rocket,
    RotateCcw, Plus, Trash2, Loader2, CheckCircle, XCircle, RefreshCw,
    Clock, Package, Shield, Zap, ChevronDown, Flame, Star, Award,
    Receipt, UserPlus, Phone, Eye, EyeOff, MessageSquare, FileDigit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════
// 1️⃣  ORDER PREP TIMER COMPONENT
// ═══════════════════════════════════════════════════════
const PrepTimerWidget = ({ order, onSetTimer }) => {
    const [mins, setMins] = useState(order.prepTime || 15);
    const [countdown, setCountdown] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!order.prepDeadline) return;
        const target = new Date(order.prepDeadline).getTime();
        const interval = setInterval(() => {
            const diff = Math.max(0, target - Date.now());
            setCountdown(Math.ceil(diff / 1000));
            if (diff <= 0) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [order.prepDeadline]);

    const handleSet = async () => {
        setSaving(true);
        try {
            await api.put(`/partner-hub/orders/${order._id}/prep-time`, { prepMinutes: mins });
            onSetTimer?.(order._id, mins);
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    const formatTime = (s) => s != null ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '--:--';

    return (
        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${countdown && countdown > 0 ? (countdown < 120 ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500 text-white') : 'bg-slate-100 text-slate-400'}`}>
                {countdown != null && countdown > 0 ? formatTime(countdown) : <Timer size={20} />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 truncate">#{order.orderId?.slice(-6)?.toUpperCase()}</p>
                <p className="text-[9px] text-slate-400 font-bold">{order.customerName || 'Customer'}</p>
            </div>
            <div className="flex items-center gap-2">
                <select value={mins} onChange={e => setMins(Number(e.target.value))} className="h-8 px-2 text-xs font-black bg-slate-50 border border-slate-100 rounded-lg outline-none">
                    {[5, 10, 15, 20, 25, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
                </select>
                <Button onClick={handleSet} disabled={saving} size="sm" className="h-8 px-3 rounded-lg text-[10px] font-black bg-emerald-500 hover:bg-emerald-600 text-white">
                    {saving ? <Loader2 size={12} className="animate-spin" /> : 'SET'}
                </Button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// 2️⃣  MENU SCHEDULING PANEL
// ═══════════════════════════════════════════════════════
const MenuSchedulingPanel = ({ products, onRefresh }) => {
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            await api.put(`/partner-hub/products/${editing._id}/schedule`, {
                scheduledDays: editing.scheduledDays || DAYS,
                availableFrom: editing.availableFrom || '00:00',
                availableTill: editing.availableTill || '23:59',
            });
            onRefresh?.();
            setEditing(null);
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center"><Calendar size={20} /></div>
                    <div>
                        <h4 className="text-base font-black text-slate-900 italic">Menu Scheduling</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Set item availability by day/hours</p>
                    </div>
                </div>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {products.map(p => (
                    <div key={p._id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-100 hover:border-violet-200 transition-all">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-slate-800 truncate">{p.name}</p>
                            <p className="text-[9px] text-slate-400">{(p.scheduledDays || DAYS).join(', ')} · {p.availableFrom || '00:00'}-{p.availableTill || '23:59'}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setEditing({ ...p, scheduledDays: p.scheduledDays || [...DAYS], availableFrom: p.availableFrom || '00:00', availableTill: p.availableTill || '23:59' })}
                            className="h-7 text-[9px] font-black rounded-lg border-violet-200 text-violet-600 hover:bg-violet-50">Edit Schedule</Button>
                    </div>
                ))}
            </div>
            <AnimatePresence>
                {editing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-5 bg-violet-50 rounded-2xl border border-violet-100 space-y-4">
                        <p className="text-sm font-black text-violet-900">Scheduling: <span className="italic">{editing.name}</span></p>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {DAYS.map(d => (
                                <button key={d} onClick={() => {
                                    const days = editing.scheduledDays.includes(d) ? editing.scheduledDays.filter(x => x !== d) : [...editing.scheduledDays, d];
                                    setEditing({ ...editing, scheduledDays: days });
                                }} className={`flex-1 min-w-[60px] py-2 rounded-lg text-[10px] font-black transition-all ${editing.scheduledDays.includes(d) ? 'bg-violet-500 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>{d}</button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div><label className="text-[9px] font-black text-violet-400 uppercase">From</label>
                                <Input type="time" value={editing.availableFrom} onChange={e => setEditing({ ...editing, availableFrom: e.target.value })} className="h-9 bg-white rounded-lg" /></div>
                            <div><label className="text-[9px] font-black text-violet-400 uppercase">Till</label>
                                <Input type="time" value={editing.availableTill} onChange={e => setEditing({ ...editing, availableTill: e.target.value })} className="h-9 bg-white rounded-lg" /></div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSave} disabled={saving} className="flex-1 h-9 bg-violet-500 hover:bg-violet-600 text-white text-[10px] font-black rounded-xl">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Schedule'}
                            </Button>
                            <Button variant="outline" onClick={() => setEditing(null)} className="h-9 rounded-xl text-[10px] font-black border-violet-200">Cancel</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// 3️⃣  LOW STOCK ALERTS PANEL
// ═══════════════════════════════════════════════════════
const LowStockPanel = ({ products, onUpdateStock }) => {
    const [stockEditing, setStockEditing] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!stockEditing) return;
        setSaving(true);
        try {
            await api.put(`/partner-hub/products/${stockEditing._id}/stock`, {
                stockQuantity: stockEditing.stockQuantity,
                lowStockThreshold: stockEditing.lowStockThreshold || 5,
                expiryDate: stockEditing.expiryDate,
                batchNumber: stockEditing.batchNumber,
                hsnCode: stockEditing.hsnCode,
            });
            onUpdateStock?.();
            setStockEditing(null);
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    const lowItems = products.filter(p => p.stockQuantity !== undefined && p.stockQuantity <= (p.lowStockThreshold || 5));

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center"><AlertTriangle size={20} /></div>
                <div>
                    <h4 className="text-base font-black text-slate-900 italic">Stock & Inventory</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{lowItems.length} items need restocking</p>
                </div>
            </div>

            {lowItems.length > 0 && (
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 mb-4">
                    <p className="text-xs font-black text-rose-700 mb-2">⚠️ Low Stock Alert</p>
                    {lowItems.map(p => (
                        <div key={p._id} className="flex items-center justify-between py-1">
                            <span className="text-xs font-bold text-rose-600">{p.name}</span>
                            <Badge className="bg-rose-500 text-white border-none text-[9px] font-black">{p.stockQuantity} left</Badge>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {products.map(p => (
                    <div key={p._id} className={`flex items-center justify-between bg-white rounded-xl p-3 border transition-all ${p.stockQuantity !== undefined && p.stockQuantity <= (p.lowStockThreshold || 5) ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100'}`}>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-slate-800 truncate">{p.name}</p>
                            <p className="text-[9px] text-slate-400">Stock: {p.stockQuantity ?? '∞'} · Threshold: {p.lowStockThreshold || 5} · Batch: {p.batchNumber || '-'}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setStockEditing({ ...p, stockQuantity: p.stockQuantity || 0, lowStockThreshold: p.lowStockThreshold || 5 })}
                            className="h-7 text-[9px] font-black rounded-lg">Update</Button>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {stockEditing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <p className="text-sm font-black text-slate-900">Update Stock: <span className="italic">{stockEditing.name}</span></p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div><label className="text-[9px] font-black text-slate-400 uppercase">Quantity</label>
                                <Input type="number" min="0" value={stockEditing.stockQuantity} onChange={e => setStockEditing({ ...stockEditing, stockQuantity: e.target.value })} className="h-9 bg-white rounded-lg" /></div>
                            <div><label className="text-[9px] font-black text-slate-400 uppercase">Low Alert At</label>
                                <Input type="number" min="1" value={stockEditing.lowStockThreshold} onChange={e => setStockEditing({ ...stockEditing, lowStockThreshold: e.target.value })} className="h-9 bg-white rounded-lg" /></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div><label className="text-[9px] font-black text-slate-400 uppercase">Expiry Date</label>
                                <Input type="date" value={stockEditing.expiryDate || ''} onChange={e => setStockEditing({ ...stockEditing, expiryDate: e.target.value })} className="h-9 bg-white rounded-lg" /></div>
                            <div><label className="text-[9px] font-black text-slate-400 uppercase">Batch No.</label>
                                <Input value={stockEditing.batchNumber || ''} onChange={e => setStockEditing({ ...stockEditing, batchNumber: e.target.value })} className="h-9 bg-white rounded-lg" placeholder="BATCH-001" /></div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSave} disabled={saving} className="flex-1 h-9 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-xl">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Stock'}
                            </Button>
                            <Button variant="outline" onClick={() => setStockEditing(null)} className="h-9 rounded-xl text-[10px] font-black">Cancel</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// 4️⃣  GST INVOICE COMPONENT
// ═══════════════════════════════════════════════════════
const GSTInvoicePanel = ({ orders }) => {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [gstForm, setGstForm] = useState({ gstNumber: '', gstRate: '5' });
    const [savingGst, setSavingGst] = useState(false);

    const generateInvoice = async (orderId) => {
        setLoading(true);
        try {
            const res = await api.get(`/partner-hub/orders/${orderId}/invoice`);
            setInvoice(res.data.invoice);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const saveGSTSettings = async () => {
        setSavingGst(true);
        try {
            await api.put('/partner-hub/gst-settings', gstForm);
            alert('GST settings saved!');
        } catch (e) { console.error(e); }
        setSavingGst(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center"><Receipt size={20} /></div>
                <div>
                    <h4 className="text-base font-black text-slate-900 italic">GST & Invoicing</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tax compliance automation</p>
                </div>
            </div>

            {/* GST Setup */}
            <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3">
                <p className="text-xs font-black text-teal-700 uppercase tracking-widest">GST Configuration</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="GSTIN (e.g. 22AAAAA0000A1Z5)" value={gstForm.gstNumber} onChange={e => setGstForm({ ...gstForm, gstNumber: e.target.value })} className="h-9 bg-white rounded-lg text-xs" />
                    <div className="flex items-center gap-2">
                        <Input type="number" min="0" max="28" step="0.5" placeholder="GST %" value={gstForm.gstRate} onChange={e => setGstForm({ ...gstForm, gstRate: e.target.value })} className="h-9 bg-white rounded-lg text-xs" />
                        <Button onClick={saveGSTSettings} disabled={savingGst} size="sm" className="h-9 px-4 bg-teal-500 text-white text-[10px] font-black rounded-lg shrink-0">
                            {savingGst ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Generate from orders */}
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generate Invoice for Delivered Order</p>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {orders.filter(o => o.status === 'DELIVERED').slice(0, 10).map(o => (
                    <div key={o._id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-100">
                        <span className="text-xs font-black text-slate-700">#{o.orderId?.slice(-6)?.toUpperCase()} · ₹{o.total || o.price}</span>
                        <Button size="sm" onClick={() => generateInvoice(o._id)} className="h-7 bg-teal-500 text-white text-[9px] font-black rounded-lg">Generate</Button>
                    </div>
                ))}
                {orders.filter(o => o.status === 'DELIVERED').length === 0 && <p className="text-xs text-slate-300 italic text-center py-4">No delivered orders found.</p>}
            </div>

            {/* Invoice Preview */}
            <AnimatePresence>
                {invoice && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-6 bg-white rounded-2xl border-2 border-teal-200 shadow-lg space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest">Tax Invoice</p>
                                <h4 className="text-lg font-black text-slate-900 italic">{invoice.invoiceNo}</h4>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => window.print()} className="h-7 text-[9px] font-black rounded-lg border-teal-200 text-teal-600">Print</Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div><p className="text-[9px] font-black text-slate-400 uppercase">Seller</p><p className="font-bold text-slate-700">{invoice.seller?.name}</p><p className="text-slate-400">GSTIN: {invoice.seller?.gstIn}</p></div>
                            <div><p className="text-[9px] font-black text-slate-400 uppercase">Buyer</p><p className="font-bold text-slate-700">{invoice.buyer?.name}</p></div>
                        </div>
                        <div className="border-t border-dashed border-slate-100 pt-3 space-y-1">
                            <div className="flex justify-between text-xs"><span className="text-slate-500">Subtotal</span><span className="font-black">₹{invoice.subtotal}</span></div>
                            <div className="flex justify-between text-xs"><span className="text-slate-500">CGST ({invoice.gstRate / 2}%)</span><span className="font-bold">₹{invoice.cgst}</span></div>
                            <div className="flex justify-between text-xs"><span className="text-slate-500">SGST ({invoice.gstRate / 2}%)</span><span className="font-bold">₹{invoice.sgst}</span></div>
                            <div className="flex justify-between text-sm pt-2 border-t border-slate-100"><span className="font-black text-slate-900">Grand Total</span><span className="font-black text-teal-600 text-lg">₹{invoice.grandTotal}</span></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// 5️⃣  STAFF ACCOUNTS PANEL
// ═══════════════════════════════════════════════════════
const StaffPanel = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', password: '' });
    const [saving, setSaving] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const fetchStaff = async () => { setLoading(true); try { const r = await api.get('/partner-hub/staff'); setStaff(r.data.staff || []); } catch (e) {} setLoading(false); };
    useEffect(() => { fetchStaff(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            const r = await api.post('/partner-hub/staff', form);
            setStaff(prev => [...prev, r.data.staff]);
            setShowAdd(false); setForm({ name: '', phone: '', password: '' });
        } catch (e) { alert(e.response?.data?.message || 'Failed'); }
        setSaving(false);
    };

    const handleRemove = async (id) => {
        if (!window.confirm('Remove this staff member?')) return;
        try { await api.delete(`/partner-hub/staff/${id}`); setStaff(prev => prev.filter(s => s._id !== id)); } catch (e) {}
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center"><Users size={20} /></div>
                    <div><h4 className="text-base font-black text-slate-900 italic">Staff Accounts</h4><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{staff.length} member{staff.length !== 1 ? 's' : ''}</p></div>
                </div>
                <Button onClick={() => setShowAdd(true)} size="sm" className="h-8 bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-black rounded-lg gap-1"><UserPlus size={12} /> Add Staff</Button>
            </div>

            {loading ? <div className="py-8 flex justify-center"><Loader2 size={20} className="animate-spin text-sky-500" /></div> : staff.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-100">
                    <Users size={32} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-300 font-bold">No staff accounts yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {staff.map(s => (
                        <div key={s._id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center text-xs font-black">{s.name?.[0]?.toUpperCase()}</div>
                            <div className="flex-1 min-w-0"><p className="text-xs font-black text-slate-800">{s.name}</p><p className="text-[9px] text-slate-400">{s.phone}</p></div>
                            <Button variant="outline" size="sm" onClick={() => handleRemove(s._id)} className="h-7 w-7 p-0 rounded-lg border-rose-100 text-rose-400 hover:bg-rose-50"><Trash2 size={12} /></Button>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showAdd && (
                    <motion.form onSubmit={handleAdd} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-5 bg-sky-50 rounded-2xl border border-sky-100 space-y-3">
                        <p className="text-sm font-black text-sky-900">New Staff Member</p>
                        <Input required placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-9 bg-white rounded-lg" />
                        <Input required placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-9 bg-white rounded-lg" />
                        <div className="relative">
                            <Input required type={showPwd ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="h-9 bg-white rounded-lg pr-10" />
                            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPwd ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={saving} className="flex-1 h-9 bg-sky-500 text-white text-[10px] font-black rounded-xl">{saving ? <Loader2 size={14} className="animate-spin" /> : 'Add Member'}</Button>
                            <Button type="button" variant="outline" onClick={() => setShowAdd(false)} className="h-9 rounded-xl text-[10px] font-black">Cancel</Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// 6️⃣  SURGE PRICING PANEL
// ═══════════════════════════════════════════════════════
const SurgePricingPanel = () => {
    const [rules, setRules] = useState([]);
    const [saving, setSaving] = useState(false);
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const addRule = () => setRules([...rules, { day: 'Fri', fromHour: 19, toHour: 22, multiplier: 1.2 }]);
    const removeRule = (i) => setRules(rules.filter((_, idx) => idx !== i));
    const updateRule = (i, field, val) => { const updated = [...rules]; updated[i][field] = val; setRules(updated); };

    const handleSave = async () => {
        setSaving(true);
        try { await api.put('/partner-hub/surge-pricing', { surgeRules: rules }); alert('Surge pricing saved!'); } catch (e) { console.error(e); }
        setSaving(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center"><Flame size={20} /></div>
                    <div><h4 className="text-base font-black text-slate-900 italic">Surge / Dynamic Pricing</h4><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Busy hour rate multipliers</p></div>
                </div>
                <Button size="sm" onClick={addRule} className="h-8 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black rounded-lg gap-1"><Plus size={12} /> Add Rule</Button>
            </div>

            {rules.length === 0 && (
                <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-100">
                    <Flame size={32} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-300 font-bold">No surge rules. Items keep base price at all times.</p>
                </div>
            )}

            {rules.map((rule, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white rounded-xl p-3 border border-orange-50">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <select value={rule.day} onChange={e => updateRule(i, 'day', e.target.value)} className="h-8 px-2 text-xs font-black bg-slate-50 border border-slate-100 rounded-lg outline-none flex-1">
                            {DAYS.map(d => <option key={d}>{d}</option>)}
                        </select>
                        <Input type="number" min="0" max="23" value={rule.fromHour} onChange={e => updateRule(i, 'fromHour', e.target.value)} className="h-8 w-full sm:w-16 text-xs rounded-lg" placeholder="From" />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-slate-300 text-xs hidden sm:inline">→</span>
                        <Input type="number" min="0" max="23" value={rule.toHour} onChange={e => updateRule(i, 'toHour', e.target.value)} className="h-8 w-full sm:w-16 text-xs rounded-lg" placeholder="To" />
                        <div className="flex items-center gap-1 flex-1 sm:flex-none">
                            <Input type="number" step="0.1" min="1" max="3" value={rule.multiplier} onChange={e => updateRule(i, 'multiplier', e.target.value)} className="h-8 w-full sm:w-16 text-xs rounded-lg font-black" />
                            <span className="text-[9px] font-black text-orange-500">×</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeRule(i)} className="h-7 w-7 p-0 text-rose-400 hover:bg-rose-50 shrink-0"><Trash2 size={12} /></Button>
                    </div>
                </div>
            ))}

            {rules.length > 0 && (
                <Button onClick={handleSave} disabled={saving} className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black rounded-xl">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Surge Rules'}
                </Button>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// 7️⃣  CANCELLATION ANALYTICS
// ═══════════════════════════════════════════════════════
const CancellationPanel = () => {
    const [data, setData] = useState({ total: 0, breakdown: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/partner-hub/cancellation-analytics').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center"><XCircle size={20} /></div>
                <div><h4 className="text-base font-black text-slate-900 italic">Cancellation Insights</h4><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{data.total} total cancellations</p></div>
            </div>
            {loading ? <div className="py-8 flex justify-center"><Loader2 size={20} className="animate-spin text-rose-500" /></div> : data.breakdown.length === 0 ? (
                <div className="py-10 text-center bg-emerald-50 rounded-2xl border border-emerald-100">
                    <CheckCircle size={32} className="text-emerald-300 mx-auto mb-2" />
                    <p className="text-xs text-emerald-500 font-bold">No cancellations — great job!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {data.breakdown.map((b, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-black text-slate-800">{b.reason}</span>
                                <Badge className="bg-rose-50 text-rose-600 border-none text-[9px] font-black">{b.count} ({b.pct}%)</Badge>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className="h-1.5 bg-rose-500 rounded-full" style={{ width: `${b.pct}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// 8️⃣  BOOST / SPONSORED LISTING PANEL
// ═══════════════════════════════════════════════════════
const BoostPanel = () => {
    const [status, setStatus] = useState({ isActive: false, expiresAt: null, boostTier: null });
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState(false);
    const [selectedTier, setSelectedTier] = useState('basic');
    const [days, setDays] = useState(7);

    useEffect(() => {
        api.get('/partner-hub/boost').then(r => setStatus(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const handleActivate = async () => {
        setActivating(true);
        try {
            const r = await api.post('/partner-hub/boost', { tier: selectedTier, days });
            setStatus({ isActive: true, expiresAt: r.data.partner?.boostExpiresAt, boostTier: selectedTier });
            alert(r.data.message);
        } catch (e) { console.error(e); }
        setActivating(false);
    };

    const tiers = [
        { id: 'basic', name: 'Basic', rank: '1.2×', price: '₹199/week', color: 'border-emerald-200 bg-emerald-50', iconColor: 'text-emerald-500' },
        { id: 'premium', name: 'Premium', rank: '1.5×', price: '₹499/week', color: 'border-indigo-200 bg-indigo-50', iconColor: 'text-indigo-500' },
        { id: 'elite', name: 'Elite', rank: '2.0×', price: '₹999/week', color: 'border-amber-200 bg-amber-50', iconColor: 'text-amber-500' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center"><Rocket size={20} /></div>
                <div><h4 className="text-base font-black text-slate-900 italic">Boost Store Visibility</h4><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sponsored listing engine</p></div>
            </div>

            {status.isActive && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
                    <Zap size={18} className="text-emerald-500" />
                    <div>
                        <p className="text-xs font-black text-emerald-700">Boost Active — {status.boostTier?.toUpperCase()} Tier</p>
                        <p className="text-[9px] text-emerald-500">Expires: {status.expiresAt ? new Date(status.expiresAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {tiers.map(t => (
                    <button key={t.id} onClick={() => setSelectedTier(t.id)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${selectedTier === t.id ? `${t.color} sm:scale-105 shadow-md` : 'border-slate-100 bg-white'}`}>
                        <div className="flex items-center justify-between sm:block">
                            <Award size={20} className={selectedTier === t.id ? t.iconColor : 'text-slate-300'} />
                            <Badge className={`sm:hidden border-none text-[8px] font-black ${selectedTier === t.id ? 'bg-white/50 text-slate-900' : 'bg-slate-50 text-slate-400'}`}>{t.rank}</Badge>
                        </div>
                        <p className="text-xs font-black text-slate-800 mt-2">{t.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 hidden sm:block">Rank: {t.rank}</p>
                        <p className="text-xs font-black text-slate-600 mt-1">{t.price}</p>
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <select value={days} onChange={e => setDays(Number(e.target.value))} className="h-9 px-3 text-xs font-black bg-slate-50 border border-slate-100 rounded-lg outline-none">
                    <option value={7}>7 Days</option><option value={14}>14 Days</option><option value={30}>30 Days</option>
                </select>
                <Button onClick={handleActivate} disabled={activating} className="flex-1 h-9 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black rounded-xl">
                    {activating ? <Loader2 size={14} className="animate-spin" /> : <><Rocket size={14} className="mr-1" /> Activate Boost</>}
                </Button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
//  MAIN EXPORT: ADVANCED HUB (Tab Container)
// ═══════════════════════════════════════════════════════
const TABS = [
    { key: 'prep', label: 'Prep Timer', icon: <Timer size={16} /> },
    { key: 'schedule', label: 'Menu Schedule', icon: <Calendar size={16} /> },
    { key: 'stock', label: 'Stock Alerts', icon: <Package size={16} /> },
    { key: 'surge', label: 'Surge Pricing', icon: <Flame size={16} /> },
    { key: 'gst', label: 'GST Invoice', icon: <Receipt size={16} /> },
    { key: 'staff', label: 'Staff', icon: <Users size={16} /> },
    { key: 'refunds', label: 'Refunds', icon: <RotateCcw size={16} /> },
    { key: 'support', label: 'Support', icon: <MessageSquare size={16} /> },
    { key: 'rx', label: 'Rx Queue', icon: <FileDigit size={16} />, pharmacyOnly: true },
    { key: 'cancels', label: 'Cancellations', icon: <XCircle size={16} /> },
    { key: 'boost', label: 'Boost Store', icon: <Rocket size={16} /> },
];

const SupportHubPanel = () => (
    <div className="space-y-6">
        <div className="p-6 bg-sky-50 rounded-3xl border border-sky-100 flex items-center justify-between">
            <div>
                <h4 className="text-lg font-black text-sky-900 italic">Support & Callbacks</h4>
                <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Active Tickets & Customer Inquiries</p>
            </div>
            <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-black text-[10px] uppercase px-6">New Ticket</Button>
        </div>
        <div className="bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200 p-12 text-center">
            <MessageSquare size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">All Support Channels Clear</p>
            <p className="text-[10px] text-slate-300 mt-1">No active support requests or customer callbacks awaiting your response.</p>
        </div>
    </div>
);

const RxQueuePanel = () => (
    <div className="space-y-6">
        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center justify-between">
            <div>
                <h4 className="text-lg font-black text-blue-900 italic">Prescription (Rx) Queue</h4>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Awaiting Pharmacist Verification</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-none font-black text-[10px]">3 PENDING</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
                <div key={i} className="group p-5 bg-white rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                            <FileDigit size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black text-slate-900">Rx Request #{7000 + i}</p>
                            <p className="text-[9px] font-bold text-slate-400 mb-2">Patient: Amit K. · Dr. Sharma</p>
                            <div className="flex gap-2">
                                <Badge className="bg-amber-50 text-amber-600 border-none text-[8px] font-black italic">VERIFYING</Badge>
                                <Badge className="bg-slate-50 text-slate-400 border-none text-[8px] font-black uppercase">Schedule H</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════
// 9️⃣  REFUND MANAGEMENT PANEL
// ═══════════════════════════════════════════════════════
const RefundPanel = () => {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [responding, setResponding] = useState(null);

    const fetchRefunds = async () => {
        setLoading(true);
        try { const r = await api.get('/partner-hub/refunds'); setRefunds(r.data.refunds || []); } catch (e) {}
        setLoading(false);
    };

    useEffect(() => { fetchRefunds(); }, []);

    const handleAction = async (orderId, action) => {
        setResponding(orderId);
        try {
            await api.put(`/partner-hub/refunds/${orderId}`, { action, reason: 'Merchant Resolution' });
            alert(`Refund ${action.toLowerCase()}ed!`);
            fetchRefunds();
        } catch (e) { alert('Action failed'); }
        setResponding(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center"><RotateCcw size={20} /></div>
                <div><h4 className="text-base font-black text-slate-900 italic">Refund & Dispute Center</h4><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{refunds.length} active requests</p></div>
            </div>

            {loading ? <div className="py-8 flex justify-center"><Loader2 size={20} className="animate-spin" /></div> : refunds.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-100">
                    <CheckCircle size={32} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-300 font-bold">No active refund disputes found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {refunds.map(r => (
                        <div key={r._id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-black text-slate-900">Order #{r.orderId?.slice(-6).toUpperCase()}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Issue: {r.refundReason || 'Product Quality / Missing'}</p>
                                </div>
                                <Badge className="bg-orange-50 text-orange-600 border-none text-[9px] font-black italic">AWAITING_RESPONSE</Badge>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => handleAction(r._id, 'APPROVE')} disabled={responding === r._id} className="flex-1 h-9 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg">
                                    {responding === r._id ? <Loader2 size={12} className="animate-spin" /> : 'Approve Refund'}
                                </Button>
                                <Button onClick={() => handleAction(r._id, 'REJECT')} disabled={responding === r._id} variant="outline" className="flex-1 h-9 border-rose-200 text-rose-500 text-[10px] font-black rounded-lg">
                                    Reject Request
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const PartnerAdvancedHub = ({ orders = [], catalogItems = [], partnerCategory = 'Restaurant' }) => {
    const [activeTab, setActiveTab] = useState('prep');

    const activeOrders = orders.filter(o => o.status === 'ACCEPTED' || o.status === 'PENDING');

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Hub Header */}
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <Zap size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">Advanced Ops Hub</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zomato · Apollo · BookMyShow Grade Features</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {TABS.filter(t => !t.pharmacyOnly || partnerCategory === 'Pharmacy').map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200 hover:text-slate-600'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <Card className="rounded-[24px] md:rounded-[32px] border-slate-100 shadow-xl overflow-hidden">
                <CardContent className="p-4 md:p-8">
                    {activeTab === 'prep' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Timer size={20} /></div>
                                <div><h4 className="text-base font-black text-slate-900 italic">Order Preparation Timer</h4><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Set live countdown per order</p></div>
                            </div>
                            {activeOrders.length === 0 ? (
                                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-100">
                                    <Clock size={32} className="text-slate-200 mx-auto mb-2" />
                                    <p className="text-xs text-slate-300 font-bold">No active orders to set timers for</p>
                                </div>
                            ) : activeOrders.map(o => <PrepTimerWidget key={o._id} order={o} />)}
                        </div>
                    )}
                    {activeTab === 'schedule' && <MenuSchedulingPanel products={catalogItems} />}
                    {activeTab === 'stock' && <LowStockPanel products={catalogItems} />}
                    {activeTab === 'surge' && <SurgePricingPanel />}
                    {activeTab === 'gst' && <GSTInvoicePanel orders={orders} />}
                    {activeTab === 'refunds' && <RefundPanel />}
                    {activeTab === 'staff' && <StaffPanel />}
                    {activeTab === 'cancels' && <CancellationPanel />}
                    {activeTab === 'boost' && <BoostPanel />}
                    {activeTab === 'support' && <SupportHubPanel />}
                    {activeTab === 'rx' && <RxQueuePanel />}
                </CardContent>
            </Card>
        </div>
    );
};

export default PartnerAdvancedHub;
