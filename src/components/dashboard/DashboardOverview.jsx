import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Activity, Loader2, Zap, Globe, ArrowUpRight, TrendingUp, Clock, Users as UsersIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { useOrders } from '../../context/OrderContext';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

const revenueData = [
    { name: 'Mon', target: 4000, revenue: 2400 },
    { name: 'Tue', target: 3000, revenue: 1398 },
    { name: 'Wed', target: 2000, revenue: 9800 },
    { name: 'Thu', target: 2780, revenue: 3908 },
    { name: 'Fri', target: 1890, revenue: 4800 },
    { name: 'Sat', target: 2390, revenue: 3800 },
    { name: 'Sun', target: 3490, revenue: 4300 },
];

const deliveriesData = [
    { name: 'Food', value: 45, color: '#3b82f6' },
    { name: 'Parcel', value: 32, color: '#10b981' },
    { name: 'Grocery', value: 28, color: '#6366f1' },
    { name: 'Pharmacy', value: 15, color: '#f59e0b' },
];

import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io } from 'socket.io-client';

// Fix for default leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 backdrop-blur-xl p-4 border border-slate-700/50 rounded-2xl shadow-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
                <p className="text-xl font-black text-white italic tracking-tighter">
                    {payload[0].name === 'revenue' ? '$' : ''}{payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export default function DashboardOverview() {
    const { t } = useTranslation();
    const { orders } = useOrders();
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [driverLocations, setDriverLocations] = useState({});
    const [heatmapData, setHeatmapData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/stats/dashboard');
                setStatsData(res.data.stats);
                
                const hmRes = await api.get('/stats/heatmap');
                setHeatmapData(hmRes.data.heatmap || []);
            } catch (err) {
                console.error("Failed to load stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();

        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
        socket.on('driver_location_updated', (data) => {
            setDriverLocations(prev => ({
                ...prev,
                [data.driverId]: { lat: data.lat, lng: data.lng }
            }));
        });

        return () => socket.disconnect();
    }, []);

    if (loading) return (
        <div className="flex flex-col h-[80vh] items-center justify-center">
            <motion.div 
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
                <div className="w-24 h-24 rounded-full border-t-2 border-primary shadow-[0_0_30px_rgba(37,99,235,0.3)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={24} className="text-primary fill-primary animate-pulse" />
                </div>
            </motion.div>
            <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Initializing Command Center</p>
        </div>
    );

    const activeDriversCount = (driverLocations && Object.keys(driverLocations).length) || statsData?.activeDrivers || 0;
    const totalRevenue = statsData?.totalRevenue || 0;
    const revData = statsData?.revenueData || revenueData || [];
    const deliveriesDataMix = statsData?.deliveriesData || deliveriesData || [];

    const calculateTrend = (current, prev) => {
        if (!prev) return 'Live';
        const diff = ((current - prev) / prev) * 100;
        return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
    };

    const stats = [
        {
            label: t('orders'),
            value: statsData?.totalOrders || orders.length,
            icon: <Package size={22} />,
            trend: calculateTrend(orders.length, (statsData?.totalOrders || orders.length) * 0.9),
            color: 'text-blue-600',
            bg: 'bg-blue-50/50'
        },
        {
            label: t('revenue'),
            value: `$${totalRevenue.toLocaleString()}`,
            icon: <DollarSign size={22} />,
            trend: calculateTrend(totalRevenue, (totalRevenue * 0.95)),
            color: 'text-emerald-600',
            bg: 'bg-emerald-50/50'
        },
        {
            label: t('drivers'),
            value: activeDriversCount,
            icon: <UsersIcon size={22} />,
            trend: t('live'),
            color: 'text-indigo-600',
            bg: 'bg-indigo-50/50'
        },
        {
            label: t('delivered_today'),
            value: statsData?.deliveredToday || 0,
            icon: <Activity size={22} />,
            trend: `${t('target')}: 100`,
            color: 'text-amber-600',
            bg: 'bg-amber-50/50'
        },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-1">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                         <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] animate-pulse" />
                         <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{t('command_center')}</h2>
                    </div>
                    <div className="flex items-center gap-2.5 ml-5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-50" />
                        <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.25em]">{t('system_wide_telemetry')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    <Button variant="outline" className="h-10 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-2xl border-none bg-white shadow-sm font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all hover:translate-y-[-2px] active:scale-95 whitespace-nowrap">
                        <ArrowUpRight size={18} className="mr-2 sm:mr-3" />
                        {t('export_log')}
                    </Button>
                    <Button className="h-10 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-2xl font-black shadow-xl shadow-primary/25 uppercase text-[10px] tracking-widest flex items-center gap-2 sm:gap-3 bg-primary hover:bg-primary/95 transition-all hover:translate-y-[-2px] active:scale-95 group whitespace-nowrap">
                        <Zap size={18} className="group-hover:rotate-12 transition-transform" />
                        {t('re_sync')}
                    </Button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                    >
                        <Card className="border-none shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all bg-white rounded-3xl overflow-hidden group h-full">
                            <CardContent className="p-5 md:p-8">
                                <div className="flex items-start justify-between">
                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner transition-transform group-hover:scale-110`}>
                                        {stat.icon}
                                    </div>
                                    <Badge className={`${stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'} border-none rounded-lg px-2 py-1 md:px-3 md:py-1.5 font-black text-[9px] md:text-[10px] tracking-widest uppercase italic`}>
                                        {stat.trend}
                                    </Badge>
                                </div>
                                <div className="mt-6 md:mt-10">
                                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 md:mb-2 leading-none">{stat.label}</p>
                                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* AI Insights & Performance Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { title: 'Financial Integrity', value: `$${statsData?.performance?.netProfit || '0.00'}`, icon: <TrendingUp className="text-primary" />, color: 'bg-primary/5', label: 'Net Platform Profit', sub: [{ n: 'Merchant Payouts', v: statsData?.performance?.merchantPayouts }, { n: 'Driver Earnings', v: statsData?.performance?.driverEarnings }] },
                    { title: 'Growth Velocity', value: statsData?.growth?.growthRate || '0.0%', icon: <Activity className="text-emerald-500" />, color: 'bg-emerald-500/5', label: 'Growth Rate', sub: [{ n: 'Total Fleet', v: statsData?.growth?.totalUsers }, { n: 'New Entries', v: `+${statsData?.growth?.newUsersLast7Days}` }] },
                    { title: 'AI Effectiveness', value: statsData?.ops?.successRate || '0.0%', icon: <Zap className="text-amber-500" />, color: 'bg-amber-500/5', label: 'Protocol Success', sub: [{ n: 'Cancellations', v: statsData?.ops?.cancellationRate, bar: true }, { n: 'Abandonment', v: statsData?.ops?.abandonmentRate, bar: true }] },
                ].map((item, idx) => (
                    <Card key={idx} className="bg-slate-900 border-none shadow-2xl rounded-3xl md:rounded-4xl overflow-hidden group hover:shadow-primary/10 transition-shadow">
                        <CardHeader className="pb-2 md:pb-4 p-5 md:p-8">
                            <CardTitle className="text-[10px] md:text-xs uppercase font-black text-slate-500 tracking-[0.25em] italic flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${item.title.includes('Financial') ? 'bg-primary shadow-[0_0_10px_rgba(37,99,235,0.8)]' : item.title.includes('Growth') ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                                {item.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 md:p-8 pt-0 space-y-4 md:space-y-6">
                            <div className="flex justify-between items-end">
                                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                                 <h4 className={`text-3xl font-black italic tracking-tighter ${item.title.includes('Financial') ? 'text-primary' : item.title.includes('Growth') ? 'text-emerald-500' : 'text-amber-500'}`}>{item.value}</h4>
                            </div>
                            <div className="h-px bg-slate-800/50" />
                            <div className="space-y-4">
                                {item.sub.map((s, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest leading-none">
                                            <span className="text-slate-500">{s.n}</span>
                                            <span className="text-white italic">{s.v || '0'}</span>
                                        </div>
                                        {s.bar && (
                                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: s.v || '0%' }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Interactive Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl md:rounded-4xl overflow-hidden bg-white">
                    <CardHeader className="flex flex-row items-center justify-between p-6 md:p-10 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-base md:text-lg font-black uppercase italic tracking-tighter leading-none">{t('revenue_analytics')}</CardTitle>
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">{t('daily_performance_log')}</p>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] md:text-[9px] uppercase tracking-widest px-3 py-1.5 md:px-4 md:py-2 rounded-xl italic">
                            +14.2% {t('growth')}
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10 pt-4">
                        <div className="h-[300px] md:h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} dy={15} tickFormatter={(v) => t(v).toUpperCase()} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#revenueGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-4xl overflow-hidden bg-white">
                    <CardHeader className="p-10 pb-4">
                        <CardTitle className="text-lg font-black uppercase italic tracking-tighter leading-none">{t('service_mix')}</CardTitle>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">{t('volume_by_category')}</p>
                    </CardHeader>
                    <CardContent className="p-10 pt-4 space-y-8">
                        <div className="space-y-8 py-4">
                            {deliveriesDataMix.map((item, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-[10px] md:text-[11px] font-black text-slate-800 uppercase tracking-widest italic">{t(item.name.toLowerCase()) || item.name}</span>
                                        </div>
                                        <span className="text-[10px] md:text-[11px] font-black text-slate-950 italic">{item.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-0.5">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.value}%` }}
                                            transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                                            className="h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.05)]"
                                            style={{ backgroundColor: item.color }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 md:mt-12 p-6 md:p-8 bg-slate-900 rounded-2xl md:rounded-3xl relative overflow-hidden group">
                            <Activity size={100} className="absolute -bottom-10 -right-10 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[8px] uppercase tracking-widest px-3 py-1 animate-pulse">
                                        {t('optimized')}
                                    </Badge>
                                    <Activity size={16} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-1">{t('engine_status')}</p>
                                    <p className="text-sm font-black text-white italic uppercase tracking-tighter">{t('nominal_flow_detected')}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tactical Map Visualization */}
            <Card className="border-none shadow-2xl rounded-4xl overflow-hidden bg-white">
                <CardHeader className="bg-white border-b border-slate-50 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 w-full md:w-auto">
                        <CardTitle className="text-lg md:text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                            <Globe size={24} className="text-primary" />
                            {t('fleet_telemetry')}
                        </CardTitle>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70 ml-9">{t('real_time_tracking')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full md:w-auto">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                             <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                             <span className="text-[10px] font-black text-slate-900 uppercase italic tracking-widest">{activeDriversCount} {t('active_units')}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 text-slate-400">
                             <TrendingUp size={14} />
                             <span className="text-[10px] font-black uppercase tracking-widest">+12% {t('coverage')}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="h-[400px] md:h-[600px] w-full relative group">
                        <MapContainer center={[28.6139, 77.2090]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; CARTO'
                            />
                            {Object.entries(driverLocations).map(([id, loc]) => (
                                <Marker key={id} position={[loc.lat, loc.lng]} icon={truckIcon}>
                                    <Popup className="tactical-popup">
                                        <div className="p-4 min-w-[200px] bg-slate-900 text-white rounded-2xl">
                                             <div className="flex items-center justify-between mb-4">
                                                 <Badge className="bg-emerald-500 text-white border-none font-black text-[8px] uppercase tracking-widest px-2 py-0.5">
                                                     IN_TRANSIT
                                                 </Badge>
                                                 <span className="text-[9px] font-black text-slate-500 uppercase">#{id.slice(-6).toUpperCase()}</span>
                                             </div>
                                             <div className="space-y-3">
                                                 <div>
                                                     <p className="text-slate-500 text-[8px] uppercase font-black tracking-widest mb-1">Payload Assignment</p>
                                                     <p className="text-xs font-black italic tracking-tight">MISSION_ALPHA_99</p>
                                                 </div>
                                                 <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                                                     <div>
                                                         <p className="text-slate-500 text-[8px] uppercase font-black tracking-widest mb-1">Velocity</p>
                                                         <p className="text-[10px] font-black">42.5 KM/H</p>
                                                     </div>
                                                     <div>
                                                         <p className="text-slate-500 text-[8px] uppercase font-black tracking-widest mb-1">Battery</p>
                                                         <p className="text-[10px] font-black text-emerald-400">88%</p>
                                                     </div>
                                                 </div>
                                             </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                            
                            {heatmapData.map((cell, idx) => {
                                const color = cell.ratio >= 2 ? '#ef4444' : (cell.ratio >= 1 ? '#f97316' : '#eab308');
                                return (
                                   <Polygon 
                                      key={`hex-${idx}`} 
                                      positions={cell.boundary} 
                                      pathOptions={{ 
                                          color: color, 
                                          fillColor: color, 
                                          fillOpacity: 0.25, 
                                          weight: 2,
                                          dashArray: '5, 5'
                                      }}
                                   />
                                )
                            })}
                        </MapContainer>
                        
                        {/* Map Overlay Command HUD */}
                        <div className="absolute left-4 md:left-10 bottom-4 md:bottom-10 z-10 w-[calc(100%-32px)] md:w-[300px] space-y-4 pointer-events-none">
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="bg-slate-900/90 backdrop-blur-xl p-5 md:p-8 rounded-3xl md:rounded-4xl border border-slate-700/50 shadow-2xl pointer-events-auto"
                            >
                                <div className="space-y-4 md:space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                             <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                             <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Network Health</span>
                                        </div>
                                        <span className="text-[9px] md:text-[10px] font-black text-emerald-400">99.9%</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                             <span>Fleet Saturation</span>
                                             <span>{Math.round((activeDriversCount / 100) * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                             <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(activeDriversCount / 100) * 100}%` }}
                                                className="h-full bg-primary shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                                             />
                                        </div>
                                    </div>
                                    <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest h-12 rounded-2xl italic transition-all">
                                        View All Units
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
