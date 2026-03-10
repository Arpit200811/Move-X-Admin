import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, TrendingUp, PieChart, Wallet, Calendar, Download, Search, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const PartnerFinanceHub = ({ ledger, walletBalance, onWithdraw, isRequestingPayout }) => {
    const { t } = useTranslation();
    const [payoutAmount, setPayoutAmount] = useState('');
    const [filter, setFilter] = useState('ALL');

    const filteredLedger = ledger.filter(tx => filter === 'ALL' || tx.type === filter);

    const stats = [
        { label: 'Total Revenue', value: '$' + ledger.reduce((acc, curr) => curr.type === 'EARNING' ? acc + curr.amount : acc, 0).toFixed(2), icon: <TrendingUp />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Pending Payouts', value: '$' + ledger.reduce((acc, curr) => curr.type === 'PAYOUT' && curr.status === 'PENDING' ? acc + Math.abs(curr.amount) : acc, 0).toFixed(2), icon: <Clock />, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Available Balance', value: '$' + (walletBalance || 0).toFixed(2), icon: <Wallet />, color: 'text-primary', bg: 'bg-primary/5' },
    ];

    const chartData = [
        { name: 'Mon', amount: 420 },
        { name: 'Tue', amount: 380 },
        { name: 'Wed', amount: 510 },
        { name: 'Thu', amount: 470 },
        { name: 'Fri', amount: 620 },
        { name: 'Sat', amount: 780 },
        { name: 'Sun', amount: 690 },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="group hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-slate-200/50 rounded-[32px] overflow-hidden">
                        <CardContent className="p-8 flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                {React.cloneElement(stat.icon, { size: 28 })}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <h4 className="text-3xl font-black text-slate-900 mt-1 italic tracking-tighter">{stat.value}</h4>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Withdrawal Terminal */}
                <Card className="lg:col-span-1 border-none bg-slate-900 text-white rounded-[40px] shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
                    <CardHeader className="border-b border-white/5 p-8 pb-4">
                        <CardTitle className="text-xl font-black italic flex items-center gap-3">
                            <ArrowUpRight size={24} className="text-primary" />
                            Withdrawal Center
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-6">
                        <div className="space-y-8">
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2 px-1">Available Funds</p>
                                <h2 className="text-5xl font-black text-white italic tracking-tighter">${walletBalance?.toFixed(2) || '0.00'}</h2>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Withdrawal Amount</label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-white/20 group-focus-within:text-primary transition-colors">$</span>
                                    <input 
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 h-16 rounded-2xl pl-12 pr-6 text-xl font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/10"
                                        placeholder="0.00"
                                        value={payoutAmount}
                                        onChange={e => setPayoutAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button 
                                disabled={isRequestingPayout || !payoutAmount}
                                onClick={() => { onWithdraw(payoutAmount); setPayoutAmount(''); }}
                                className="w-full h-16 bg-white text-slate-950 hover:bg-slate-100 rounded-3xl font-black uppercase text-[12px] tracking-[0.2em] italic shadow-2xl shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isRequestingPayout ? <Loader2 className="animate-spin mr-3" /> : <CheckCircle size={18} className="mr-3" />}
                                Withdraw Funds
                            </Button>

                            <p className="text-[9px] font-bold text-white/30 text-center uppercase tracking-widest leading-relaxed">
                                Payout requests are processed and settled within 2-4 business days.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Analytics */}
                <Card className="lg:col-span-2 rounded-[40px] border-slate-100 shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50 p-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black italic">Revenue Trends</CardTitle>
                            <CardDescription>Visual analysis of your store's income flow.</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-slate-100 group">
                            <Calendar size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="finGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 900, fill: '#64748B', uppercase: true}} 
                                        dy={10}
                                    />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900}} 
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#finGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-slate-50">
                            {[
                                { label: 'Settled Missions', count: 124, trend: '+12%', color: 'text-emerald-500' },
                                { label: 'Platform Usage', count: '1.2%', trend: '-0.2%', color: 'text-primary' },
                                { label: 'Refund Buffer', count: '$0.00', trend: 'STABLE', color: 'text-rose-500' }
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[140px] flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                    <div className="flex items-end justify-between">
                                        <span className="text-lg font-black text-slate-800 italic">{item.count}</span>
                                        <span className={`text-[9px] font-black ${item.color}`}>{item.trend}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction Ledger */}
            <Card className="rounded-[40px] border-slate-100 shadow-xl overflow-hidden mt-8">
                <CardHeader className="border-b border-slate-50 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <CardTitle className="text-xl font-black italic">Transaction History</CardTitle>
                        <CardDescription>Complete record of your earnings and withdrawals.</CardDescription>
                    </div>
                    
                    <div className="flex gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100 self-start">
                        {['ALL', 'EARNING', 'PAYOUT'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === type ? 'bg-white text-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b">
                                <tr>
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('timestamp')}</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('mission_id')}</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('status')}</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">{t('flux_amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLedger.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center text-slate-300 italic font-black uppercase tracking-[0.2em]">Zero Ledger Artifacts Found</td>
                                    </tr>
                                ) : (
                                    filteredLedger.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${tx.type === 'EARNING' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                                        {tx.type === 'EARNING' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900 italic uppercase">{new Date(tx.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</p>
                                                        <p className="text-[9px] font-bold text-slate-400">{new Date(tx.createdAt).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-slate-300 border border-slate-100 px-2 py-0.5 rounded uppercase">REF</span>
                                                    <code className="text-xs font-black text-slate-700 italic">#{tx._id?.slice(-8).toUpperCase()}</code>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <Badge variant={tx.status === 'COMPLETED' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'outline'} className="text-[9px] font-black italic">
                                                    {tx.status?.toUpperCase() || 'UNSYNCED'}
                                                </Badge>
                                            </td>
                                            <td className={`p-6 text-right text-base font-black italic ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PartnerFinanceHub;
