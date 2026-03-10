import React, { useState, useEffect } from 'react';
import { 
    Undo2, 
    ArrowLeftRight, 
    CheckCircle, 
    XCircle, 
    Search, 
    Filter, 
    CreditCard, 
    Download, 
    AlertTriangle, 
    Clock, 
    ReceiptText,
    ExternalLink,
    BadgeAlert,
    Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function RefundsManagement() {
    const { t } = useTranslation();
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRefunds();
    }, []);

    const fetchRefunds = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payments/refunds');
            setRefunds(res.data.refunds || []);
        } catch (e) {
            console.error('Failed to fetch refunds', e);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const variants = {
            'processed': 'bg-emerald-50 text-emerald-700 border-emerald-100',
            'pending': 'bg-amber-50 text-amber-700 border-amber-100',
            'rejected': 'bg-rose-50 text-rose-700 border-rose-100'
        };
        return (
            <Badge className={`uppercase text-[9px] font-black tracking-widest border ${variants[status] || 'bg-slate-50'}`}>
                {t(status)}
            </Badge>
        );
    };

    return (
        <div className="space-y-6 pb-24 px-1 md:px-0">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm">
                            <Undo2 size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{t('refund_terminal')}</h2>
                    </div>
                    <p className="text-slate-500 font-medium text-sm ml-1">{t('enterprise_transaction_settlement')}</p>
                </div>
                <div className="flex items-center gap-3">
                   <Button variant="outline" className="w-full sm:w-auto h-11 rounded-xl border-slate-200 font-bold text-[10px] uppercase tracking-widest px-6 shadow-xs hover:bg-white">
                       <Download size={14} className="mr-2" /> {t('export_ledger')}
                   </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Statistics Overview */}
                <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'total_refunded', value: '$4,281.50', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'active_disputes', value: '12', icon: BadgeAlert, color: 'text-amber-500', bg: 'bg-amber-50' },
                        { label: 'resolution_rate', value: '98.2%', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                        { label: 'avg_process_time', value: '14m', icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    ].map((stat, i) => (
                        <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
                            <CardContent className="p-5 flex items-center gap-4 relative">
                                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={22} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{t(stat.label)}</p>
                                    <h4 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight italic">{stat.value}</h4>
                                </div>
                                <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${stat.bg} rounded-full opacity-0 group-hover:opacity-30 transition-opacity`} />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* History Section */}
                <Card className="lg:col-span-12 border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="border-b border-slate-50 p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <CardTitle className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                                    <ArrowLeftRight size={18} className="text-primary" />
                                    {t('settlement_activity')}
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1">
                                     {t('historical_records')}
                                </CardDescription>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <Input 
                                    placeholder={t('search_records')}
                                    className="pl-11 h-11 bg-slate-50 border-none rounded-xl font-bold text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-primary/20"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-hidden">
                        {loading ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-4">
                                <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{t('synchronizing_ledger')}</p>
                            </div>
                        ) : refunds.length === 0 ? (
                            <div className="p-24 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-4xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-xs italic text-slate-200">
                                     <ReceiptText size={40} />
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight uppercase italic">{t('ledger_clean')}</h3>
                                <p className="text-sm text-slate-400 mt-2 font-medium">{t('no_disputes_found')}</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50/50">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('transaction')}</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('reference')}</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('type')}</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('quantum')}</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('status')}</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('date')}</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {refunds.map(r => (
                                                <tr key={r._id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform">
                                                                <CreditCard size={14} />
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-900 tracking-tight">REF-{r._id.slice(0,8).toUpperCase()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 font-bold text-[10px] text-slate-400 italic">#{r.orderId.slice(-10)}</td>
                                                    <td className="px-6 py-5">
                                                        <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-wider bg-white border-slate-200 px-2 py-0.5 shadow-xs">
                                                            {t(r.refundType)}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-5 font-extrabold text-sm text-slate-900 italic tracking-tight">-${r.refundAmount.toFixed(2)}</td>
                                                    <td className="px-6 py-5">
                                                        <StatusBadge status={r.status} />
                                                    </td>
                                                    <td className="px-6 py-5 text-[11px] font-bold text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-5 text-right">
                                                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-white hover:shadow-xs transition-all border border-transparent hover:border-slate-100">
                                                            <ExternalLink size={14} className="text-slate-400" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile List View */}
                                <div className="md:hidden divide-y divide-slate-50">
                                    {refunds.map(r => (
                                        <div key={r._id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                         <CreditCard size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('transaction')}</p>
                                                        <p className="text-sm font-bold text-slate-900 tracking-tight leading-none mt-0.5">REF-{r._id.slice(0,8).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                                <StatusBadge status={r.status} />
                                            </div>
                                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('quantum')}</p>
                                                    <p className="text-lg font-extrabold text-slate-900 italic tracking-tighter">-${r.refundAmount.toFixed(2)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('date')}</p>
                                                    <p className="text-[10px] font-extrabold text-slate-900 mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
