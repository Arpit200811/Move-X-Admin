import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Download,
    ArrowUpRight,
    TrendingUp,
    PieChart as PieIcon,
    Calendar,
    Loader2,
    ShieldCheck,
    CreditCard,
    ArrowRight
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function FinanceManagement() {
    const { t } = useTranslation();
    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState([]);
    const [ledger, setLedger] = useState([]);
    const [payoutRequests, setPayoutRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'payouts'

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sumRes, trendRes, ledgerRes, payoutRes] = await Promise.all([
                api.get('/finance/summary'),
                api.get('/finance/trends'),
                api.get('/finance/ledger'),
                api.get('/finance/payouts')
            ]);
            setSummary(sumRes.data.summary);
            setTrends(trendRes.data.trends);
            setLedger(ledgerRes.data.ledger);
            setPayoutRequests(payoutRes.data.requests);
        } catch (err) {
            console.error("Failed to load financial data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayout = async (txId, action) => {
        try {
            await api.post('/finance/payouts/process', { txId, action });
            fetchData();
        } catch (err) {
            alert(t('protocol_failure'));
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDownloadReport = async () => {
        try {
            const response = await api.get('/finance/export-csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `MoveX_Audit_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            alert(t('error'));
        }
    };

    if (loading) return (
        <div className="flex h-[600px] items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    if (!summary) return (
        <div className="flex h-[600px] items-center justify-center flex-col gap-4">
            <div className="p-6 bg-rose-50 rounded-3xl border-2 border-rose-100 flex flex-col items-center">
                <ShieldCheck size={48} className="text-rose-500 mb-4 opacity-50" />
                <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">{t('system_locked')}</h3>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">{t('maintenance_active_desc') || "Security Protocols Active"}</p>
                <Button variant="outline" className="mt-6 rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-8" onClick={fetchData}>
                    {t('retry_sync')}
                </Button>
            </div>
        </div>
    );

    const pieData = [
        { name: t('fleet_payouts'), value: parseFloat(summary.payouts || 0), color: '#3B82F6' },
        { name: t('platform_fee'), value: parseFloat(summary.commission || 0), color: '#10B981' },
        { name: t('tax_reserves'), value: parseFloat(summary.tax || 0), color: '#F59E0B' },
    ];

    const stats = [
        { label: t('gross_revenue'), value: `$${summary.revenue}`, icon: <DollarSign size={20} />, change: '+12.5%', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: t('fleet_payouts'), value: `$${summary.payouts}`, icon: <CreditCard size={20} />, change: '-2.4%', color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: t('net_profit'), value: `$${summary.commission}`, icon: <TrendingUp size={20} />, change: '+8.1%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: t('tax_reserves'), value: `$${summary.tax}`, icon: <ShieldCheck size={20} />, change: '+0.5%', color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="space-y-6 pb-24 px-1 md:px-0">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                     <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                             <DollarSign size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{t('finance_hub')}</h2>
                     </div>
                    <p className="text-slate-500 font-medium text-sm ml-1">{t('audit_trails_desc')}</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto border border-slate-200 shadow-inner">
                    <Button 
                        variant={activeTab === 'overview' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 sm:flex-none rounded-lg font-bold uppercase text-[10px] tracking-wider h-10 px-6 transition-all ${activeTab === 'overview' ? 'shadow-sm' : ''}`}
                    >
                        {t('overview')}
                    </Button>
                    <Button 
                        variant={activeTab === 'payouts' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => setActiveTab('payouts')}
                        className={`flex-1 sm:flex-none rounded-lg font-bold uppercase text-[10px] tracking-wider h-10 px-6 relative transition-all ${activeTab === 'payouts' ? 'shadow-sm' : ''}`}
                    >
                        {t('withdrawals')}
                        {payoutRequests.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white font-bold animate-pulse shadow-md">
                                {payoutRequests.length}
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                    <motion.div
                        key="overview-tab"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Stats Monitoring Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {stats.map((stat, i) => (
                                <Card key={i} className="border-none shadow-sm group hover:shadow-md transition-all bg-white relative overflow-hidden">
                                     <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mr-12 -mt-12 opacity-40 group-hover:scale-110 transition-transform`} />
                                    <CardContent className="p-6 relative z-10">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                                {stat.icon}
                                            </div>
                                            <Badge variant={stat.change.startsWith('+') ? 'success' : 'destructive'} className="text-[10px] font-extrabold px-2 py-0.5 border-none shadow-xs">
                                                {stat.change}
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                                        <h4 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight italic">{stat.value}</h4>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Revenue Trajectory */}
                            <Card className="lg:col-span-2 shadow-sm border-none overflow-hidden h-[400px] md:h-[450px] bg-white group">
                                <CardHeader className="border-b border-slate-50 p-6 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                                                 <TrendingUp size={18} className="text-primary" />
                                                 {t('revenue_flow')}
                                            </CardTitle>
                                            <CardDescription className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1">{t('realtime_inflow_sync')}</CardDescription>
                                        </div>
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] items-center gap-1.5 hidden xs:flex">
                                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                             {t('live_telemetry')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 pt-8 h-[calc(100%-80px)]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trends} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px', fontSize: '11px', fontWeight: 'bold' }}
                                                cursor={{ stroke: '#2563EB', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                                            />
                                            <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Capital Allocation */}
                            <Card className="flex flex-col shadow-sm border-none overflow-hidden bg-white">
                                <CardHeader className="border-b border-slate-50 p-6 pb-4">
                                    <CardTitle className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                                         <PieIcon size={18} className="text-indigo-500" />
                                         {t('equity_mix')}
                                    </CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1">{t('capital_distribution')}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-center py-6 px-6">
                                    <div className="h-44 relative mb-6">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={6}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ display: 'none' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('gross')}</span>
                                            <span className="text-xl font-extrabold text-slate-900 tracking-tight italic">${parseFloat(summary.revenue).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        {pieData.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-blue-100 transition-all group/item">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: item.color }} />
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{item.name}</span>
                                                </div>
                                                <span className="text-xs font-extrabold text-slate-900 italic group-hover/item:text-primary transition-colors">${item.value.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Master Audit Ledger */}
                        <Card className="shadow-sm border-none overflow-hidden h-auto md:h-[600px] flex flex-col bg-white">
                            <CardHeader className="border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
                                <div>
                                    <CardTitle className="text-lg font-extrabold text-slate-900 tracking-tight">{t('master_ledger')}</CardTitle>
                                    <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">{t('immutable_tx_records')}</CardDescription>
                                </div>
                                <Button variant="outline" className="w-full sm:w-auto rounded-xl border-slate-200 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all h-10 px-6 shadow-xs" onClick={handleDownloadReport}>
                                    <Download size={14} className="mr-2" />
                                    {t('export_audit')}
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 overflow-y-auto flex-1 scrollbar-hide">
                                {/* Desktop Tablet Table View */}
                                <div className="hidden md:block overflow-x-auto min-h-full">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
                                            <tr>
                                                <th className="p-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-center w-24">ID</th>
                                                <th className="p-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">{t('metadata')}</th>
                                                <th className="p-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">{t('category')}</th>
                                                <th className="p-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-right">{t('amount')}</th>
                                                <th className="p-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-center">{t('status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {ledger.map((tx, i) => (
                                                <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                                                    <td className="p-5 text-center">
                                                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 group-hover:bg-white group-hover:text-primary transition-all">
                                                            {tx._id.slice(-6).toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                                                                <img src={`https://api.dicebear.com/7.x/avataaars/png?seed=${tx.user?.name || i}`} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 leading-tight">{tx.user?.name || t('platform')}</p>
                                                                <p className="text-[9px] text-slate-400 uppercase font-bold mt-0.5 tracking-tight">{new Date(tx.createdAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-5">
                                                        <Badge variant="outline" className={`text-[8px] uppercase font-bold tracking-wider px-2 border-none shadow-xs ${tx.type === 'EARNING' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                            {tx.type}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <span className={`text-sm font-extrabold italic tracking-tight ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <Badge variant={tx.status === 'COMPLETED' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'destructive'} className="text-[8px] uppercase font-extrabold px-2 border-none shadow-xs">
                                                            {t(tx.status)}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden divide-y divide-slate-100">
                                    {ledger.map((tx, i) => (
                                        <div key={tx._id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-xs">
                                                         <img src={`https://api.dicebear.com/7.x/avataaars/png?seed=${tx.user?.name || i}`} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 leading-none">{tx.user?.name || t('platform')}</p>
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-tight">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                                                    #{tx._id.slice(-6).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-2">
                                                     <Badge variant="outline" className={`text-[8px] uppercase font-bold border-none ${tx.type === 'EARNING' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {tx.type}
                                                     </Badge>
                                                     <Badge variant={tx.status === 'COMPLETED' ? 'success' : 'warning'} className="text-[8px] uppercase font-bold border-none">
                                                        {t(tx.status)}
                                                     </Badge>
                                                </div>
                                                <span className={`text-base font-extrabold italic tracking-tight ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                     {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {ledger.length === 0 && (
                                    <div className="py-24 text-center">
                                        <p className="text-sm font-bold text-slate-400 italic">{t('no_tx_data')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="payouts-tab"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                    >
                        {payoutRequests.length === 0 ? (
                            <div className="col-span-full py-32 text-center bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-4xl flex items-center justify-center mb-6 border border-slate-100 shadow-xs">
                                     <ShieldCheck size={48} className="text-slate-200" />
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{t('vault_cleared')}</h3>
                                <p className="text-slate-400 font-medium text-sm mt-1">{t('no_pending_payouts')}</p>
                            </div>
                        ) : (
                            payoutRequests.map(req => (
                                <Card key={req._id} className="group border-none shadow-sm hover:shadow-md transition-all overflow-hidden relative bg-white">
                                    <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100 overflow-hidden group-hover:scale-105 transition-transform">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/png?seed=${req.user?.name}`} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <CardTitle className="text-base font-extrabold text-slate-900 truncate tracking-tight leading-tight">{req.user?.name}</CardTitle>
                                                <Badge variant="warning" className="text-[9px] uppercase font-bold tracking-wider mt-1.5 border-none shadow-xs animate-pulse">{t('payout_pending')}</Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 md:p-8">
                                        <div className="space-y-6">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t('requested_quantum')}</span>
                                                <h2 className="text-4xl font-extrabold text-slate-900 italic tracking-tighter decoration-primary/10 decoration-8 -underline-offset-4">
                                                    ${Math.abs(req.amount).toFixed(2)}
                                                </h2>
                                            </div>

                                            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-xs">
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={16} className="text-blue-500" />
                                                    <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-widest">
                                                        {t('arrival')}: {new Date(req.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-bold text-blue-700/60 mt-2.5 leading-relaxed uppercase italic">
                                                    " Clearance required for Node {req.user?.phone || 'N/A'} "
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 mt-8">
                                            <Button 
                                                className="flex-1 h-12 bg-primary hover:bg-blue-700 font-extrabold uppercase tracking-widest text-[10px] italic rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                                                onClick={() => handleProcessPayout(req._id, 'approve')}
                                            >
                                                {t('authorize')}
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="w-12 h-12 border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 rounded-xl transition-all active:scale-95"
                                                onClick={() => handleProcessPayout(req._id, 'reject')}
                                            >
                                                <ArrowUpRight className="rotate-45" size={20} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                                </Card>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
