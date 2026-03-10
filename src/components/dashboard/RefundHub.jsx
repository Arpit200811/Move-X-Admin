import React, { useState, useEffect } from 'react';
import { 
    RefreshCcw, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Search, 
    Filter, 
    ShieldAlert, 
    CreditCard,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function RefundHub() {
    const { t } = useTranslation();
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRefunds();
    }, []);

    const fetchRefunds = async () => {
        setLoading(true);
        try {
            const res = await api.get('/refunds');
            setRefunds(res.data.refunds || []);
        } catch (err) {
            console.error("Failed to load refunds", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (refundId, action) => {
        try {
            await api.post('/refunds/process', { refundId, action });
            fetchRefunds();
        } catch (err) {
            alert("Action could not be authorized by the financial core.");
        }
    };

    const filtered = refunds.filter(r => 
        (filter === 'all' || r.status === filter) &&
        (r.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || r.customerId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-4">
                        <RefreshCcw className="text-rose-500" size={32} />
                        {t('refund_hub') || "Reconciliation Orbit"}
                    </h2>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 ml-12">Dispute Resolution & Capital Reversion</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    {['pending', 'approved', 'rejected', 'all'].map(s => (
                        <Button
                            key={s}
                            variant={filter === s ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter(s)}
                            className="rounded-xl font-black uppercase text-[9px] tracking-widest px-4 h-9"
                        >
                            {t(s)}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filtered.map(refund => (
                        <motion.div
                            key={refund._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <Card className="border-none shadow-xl hover:shadow-2xl transition-all bg-white rounded-4xl overflow-hidden group">
                                <CardContent className="p-0">
                                    <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ORDER #{refund.orderId?.slice(-8).toUpperCase()}</p>
                                            <h3 className="text-2xl font-black text-slate-950 italic tracking-tighter">${refund.refundAmount?.toFixed(2)}</h3>
                                        </div>
                                        <Badge className={`h-8 px-4 rounded-xl font-bold text-[8px] uppercase tracking-widest ${
                                            refund.status === 'approved' ? 'bg-emerald-500' : 
                                            refund.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                                        }`}>
                                            {t(refund.status)}
                                        </Badge>
                                    </div>

                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="absolute top-6 right-6 w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shadow-lg overflow-hidden">
                                                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${refund.customerId}`} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Node</p>
                                                <p className="text-xs font-bold text-slate-900 select-all">{refund.customerId}</p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t('reason')}</p>
                                            <p className="text-[11px] font-medium text-slate-600 italic leading-relaxed">
                                                "{refund.reason || "No discrepancy details provided by the client node."}"
                                            </p>
                                        </div>

                                        {refund.status === 'pending' && (
                                            <div className="flex gap-3 pt-4">
                                                <Button 
                                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest italic shadow-lg shadow-emerald-500/20 shadow-inner"
                                                    onClick={() => handleAction(refund._id, 'APPROVE')}
                                                >
                                                    <CheckCircle size={14} className="mr-2" />
                                                    Settle
                                                </Button>
                                                <Button 
                                                    variant="outline"
                                                    className="flex-1 border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest italic"
                                                    onClick={() => handleAction(refund._id, 'REJECT')}
                                                >
                                                    <XCircle size={14} className="mr-2" />
                                                    Void
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filtered.length === 0 && !loading && (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner opacity-40">
                            <ShieldAlert size={48} className="text-slate-300" />
                        </div>
                        <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] italic">Cleared of financial disputes</p>
                    </div>
                )}

                {loading && (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-primary mb-4" size={48} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Settlement Data...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
