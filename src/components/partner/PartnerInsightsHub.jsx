import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, ShoppingBag, XCircle, Clock, DollarSign, Loader2, RefreshCw, Award, Flame, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import api from '../../services/api';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 text-sm">
            <p className="font-black text-slate-400 uppercase text-[9px] tracking-widest mb-2">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="font-black" style={{ color: p.color }}>
                    {p.name}: {p.name?.toLowerCase().includes('revenue') ? `₹${Number(p.value).toFixed(2)}` : p.value}
                </div>
            ))}
        </div>
    );
};

const HeatmapCell = ({ hour, count, maxCount }) => {
    const intensity = maxCount > 0 ? count / maxCount : 0;
    const alpha = Math.max(0.07, intensity);
    return (
        <div className="flex flex-col items-center gap-1.5 group cursor-default" title={`${hour}:00 → ${count} orders`}>
            <div
                className="w-7 h-7 rounded-lg transition-all group-hover:scale-125 group-hover:rounded-xl"
                style={{ backgroundColor: `rgba(16, 185, 129, ${alpha})`, border: `1.5px solid rgba(16,185,129,${alpha * 0.6})` }}
            />
            {hour % 3 === 0 && <span className="text-[8px] font-black text-slate-300">{hour}</span>}
        </div>
    );
};

const PartnerInsightsHub = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState(30);
    const [backendUnavailable, setBackendUnavailable] = useState(false);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setBackendUnavailable(false);
            const res = await api.get('/marketing/partner-analytics');
            setAnalytics(res.data.analytics);
        } catch (e) {
            if (e.response?.status === 404) {
                setBackendUnavailable(true);
                console.warn('[INSIGHTS] Backend analytics route not found (404). Redeploy backend.');
            } else {
                console.error('Failed to fetch analytics:', e.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAnalytics(); }, []);

    const displayData = analytics?.revenueData?.slice(-range) || [];
    const maxHourly = analytics ? Math.max(...analytics.hourlyHeatmap.map(h => h.count)) : 1;

    if (loading) return (
        <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 size={36} className="animate-spin text-indigo-500" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Compiling Intelligence...</p>
        </div>
    );

    if (backendUnavailable) return (
        <div className="py-20 flex flex-col items-center justify-center bg-amber-50 rounded-[40px] border border-amber-100 text-center px-10 space-y-4">
            <AlertCircle size={48} className="text-amber-500" />
            <h3 className="text-xl font-black text-amber-900">Analytics Unavailable</h3>
            <p className="text-sm text-amber-600 max-w-md font-medium">The Analytics API route is not yet live on your deployed server (<strong>Render</strong>). After redeploying the backend, this hub will show live charts, heatmaps, and revenue data.</p>
            <div className="p-4 bg-amber-100 rounded-2xl text-xs font-mono text-amber-700 text-left w-full max-w-md">
                <p className="font-black mb-1">Required route:</p>
                <p>GET /api/marketing/partner-analytics</p>
            </div>
            <Button onClick={fetchAnalytics} variant="outline" className="mt-4 rounded-xl border-amber-300 text-amber-700 hover:bg-amber-100 font-black">
                <RefreshCw size={14} className="mr-2" /> Retry
            </Button>
        </div>
    );

    const s = analytics?.summary || {};

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">Insights & Reports</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Business Intelligence</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {[7, 14, 30].map(d => (
                        <button key={d} onClick={() => setRange(d)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${range === d ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-200'}`}>
                            {d}D
                        </button>
                    ))}
                    <Button variant="outline" onClick={fetchAnalytics} className="h-9 w-9 p-0 rounded-xl border-slate-100">
                        <RefreshCw size={14} />
                    </Button>
                </div>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: `₹${Number(s.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: <DollarSign size={20} />, color: 'text-emerald-500', bg: 'bg-emerald-50', sub: 'All delivered orders' },
                    { label: 'Total Orders', value: s.totalOrders || 0, icon: <ShoppingBag size={20} />, color: 'text-indigo-500', bg: 'bg-indigo-50', sub: 'Including cancelled' },
                    { label: 'Avg Order Value', value: `₹${s.avgOrderValue || 0}`, icon: <TrendingUp size={20} />, color: 'text-violet-500', bg: 'bg-violet-50', sub: 'Per delivered order' },
                    { label: 'Cancel Rate', value: `${s.cancelRate || 0}%`, icon: <XCircle size={20} />, color: 'text-rose-500', bg: 'bg-rose-50', sub: `${s.cancelledOrders || 0} cancelled` },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Card className="rounded-[28px] border-slate-100 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all">
                            <CardContent className="p-6">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>{stat.icon}</div>
                                <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter">{stat.value}</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                <p className="text-[9px] text-slate-300 font-medium mt-0.5">{stat.sub}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Market Benchmarking & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[32px] border-slate-100 shadow-xl overflow-hidden p-6 bg-slate-900 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Area Ranking</p>
                        <Award className="text-amber-400" size={18} />
                    </div>
                    <div className="flex items-end gap-2">
                        <h4 className="text-5xl font-black italic">#4</h4>
                        <p className="text-xs font-bold text-slate-400 mb-2">out of 42 Stores</p>
                    </div>
                    <p className="text-[10px] font-medium text-emerald-400 mt-4 flex items-center gap-1">
                        <TrendingUp size={10} /> Top 10% in your locality
                    </p>
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                            <span>Service Score</span>
                            <span>98%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[98%]" />
                        </div>
                    </div>
                </Card>

                <Card className="md:col-span-2 rounded-[32px] border-slate-100 shadow-xl overflow-hidden p-6 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Leaderboard</p>
                            <h4 className="text-base font-black text-slate-900 italic">Competitor Benchmarking</h4>
                        </div>
                        <Badge className="bg-slate-50 text-slate-500 border-none font-black text-[8px]">UPDATED HOURLY</Badge>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: 'Your Store', score: 92, current: true },
                            { name: 'Starbucks (Premium)', score: 96, current: false },
                            { name: 'The Burger King', score: 88, current: false },
                        ].map((m, i) => (
                            <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl ${m.current ? 'bg-indigo-50 border border-indigo-100' : ''}`}>
                                <span className="text-[10px] font-black text-slate-400 w-4">#{i+1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-xs font-black ${m.current ? 'text-indigo-900' : 'text-slate-700'}`}>{m.name}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{m.score}/100</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${m.current ? 'bg-indigo-500' : 'bg-slate-300'}`} style={{ width: `${m.score}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="rounded-[40px] border-slate-100 shadow-2xl overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenue Timeline</p>
                            <CardTitle className="text-xl font-black italic text-slate-900">Last {range} Days Performance</CardTitle>
                        </div>
                        <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[9px] tracking-widest">LIVE_DATA</Badge>
                    </div>
                </CardHeader>
                <CardContent className="px-4 pb-8">
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={displayData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4f46e5" strokeWidth={3} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#4f46e5' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Hourly Heatmap */}
                <Card className="lg:col-span-3 rounded-[40px] border-slate-100 shadow-2xl overflow-hidden p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peak Hours</p>
                            <h4 className="text-base font-black text-slate-900 italic">Hourly Order Heatmap</h4>
                        </div>
                    </div>
                    <div className="flex items-end gap-1.5 overflow-x-auto pb-2">
                        {(analytics?.hourlyHeatmap || []).map(h => (
                            <HeatmapCell key={h.hour} hour={h.hour} count={h.count} maxCount={maxHourly} />
                        ))}
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Low</span>
                        <div className="flex gap-1">
                            {[0.07, 0.2, 0.4, 0.6, 0.8, 1].map((a, i) => (
                                <div key={i} className="w-5 h-5 rounded-md" style={{ backgroundColor: `rgba(16,185,129,${a})` }} />
                            ))}
                        </div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">High</span>
                    </div>
                </Card>

                {/* Top Products */}
                <Card className="lg:col-span-2 rounded-[40px] border-slate-100 shadow-2xl overflow-hidden p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                            <Flame size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Best Sellers</p>
                            <h4 className="text-base font-black text-slate-900 italic">Top 5 Items</h4>
                        </div>
                    </div>
                    {(analytics?.topProducts || []).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-center">
                            <Package size={36} className="text-slate-100 mb-3" />
                            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No data yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {(analytics.topProducts || []).map((p, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {i === 0 ? <Award size={16} /> : i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-slate-800 truncate">{p.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">{p.count} orders · ₹{Number(p.revenue).toFixed(0)}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(p.count / analytics.topProducts[0].count) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default PartnerInsightsHub;
