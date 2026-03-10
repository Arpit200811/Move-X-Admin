import React, { useState, useEffect } from 'react';
import {
    Zap,
    Globe,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Activity,
    Wind,
    CloudRain,
    Sun,
    Map as MapIcon,
    ArrowRight,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function SurgeHub() {
    const { t } = useTranslation();
    const [surgeData, setSurgeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalMultiplier, setGlobalMultiplier] = useState(1.0);
    const [statusMessage, setStatusMessage] = useState('');

    const fetchSurge = async () => {
        try {
            setLoading(true);
            const res = await api.get('/surge');
            setSurgeData(res.data.surge);
        } catch (err) {
            console.error("Surge sync failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurge();
    }, []);

    const handleUpdateZone = async (zoneId, multiplier) => {
        try {
            await api.post('/surge/update', { zoneId, multiplier });
            setStatusMessage(`Zone node recalibrated to ${multiplier}x`);
            fetchSurge();
        } catch (e) {
            alert('Recalibration pulse failed');
        } finally {
            setTimeout(() => setStatusMessage(''), 3000);
        }
    };

    const handleGlobalUpdate = async (multiplier) => {
        try {
            await api.post('/surge/global', { multiplier });
            setGlobalMultiplier(multiplier);
            setStatusMessage(`Global matrix established as ${multiplier}x`);
            fetchSurge();
        } catch (e) {
            alert('Global override failed');
        } finally {
            setTimeout(() => setStatusMessage(''), 3000);
        }
    };

    return (
        <div className="space-y-10 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-1">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-amber-500/20 transition-transform hover:scale-110">
                            <Zap size={30} fill="currentColor" />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                                {t('surge_protocol', 'Surge Protocol')}
                            </h2>
                            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.25em] ml-1">
                                {t('dynamic_pricing_handshake', 'Dynamic Pricing Handshake')}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 px-6 py-2 border-r border-slate-filtered-100">
                        <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${globalMultiplier > 1 ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                            {globalMultiplier > 1 ? t('surge_active', 'SURGE_ACTIVE') : t('nominal_pricing', 'NOMINAL_FLOW')}
                        </span>
                    </div>
                    <div className="flex gap-2 p-1">
                         {[1.0, 1.2, 1.5, 2.0].map(val => (
                             <button
                                 key={val}
                                 onClick={() => handleGlobalUpdate(val)}
                                 className={`w-12 h-12 rounded-xl font-black text-xs transition-all ${globalMultiplier === val ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                             >
                                 {val}x
                             </button>
                         ))}
                    </div>
                </div>
            </div>

            {/* Success Flash */}
            <AnimatePresence>
                {statusMessage && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-3 p-5 bg-slate-900 border border-slate-800 rounded-3xl text-emerald-400 font-black text-xs uppercase tracking-widest">
                        <CheckCircle2 size={18} />
                        {statusMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tactical Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weather Integration (Mock) */}
                <Card className="border-none shadow-sm rounded-4xl bg-white overflow-hidden flex flex-col h-full lg:col-span-1">
                    <CardHeader className="p-10 pb-6 bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                            <Wind size={16} /> METEOROLOGICAL INTELLIGENCE
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 space-y-10 flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                             <div className="space-y-2">
                                 <h4 className="text-5xl font-black text-slate-900 italic tracking-tighter">28°C</h4>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partly Cloudy | Delhi NCR</p>
                             </div>
                             <CloudRain size={80} className="text-slate-100 animate-bounce" />
                        </div>
                        <div className="space-y-6">
                            {[
                                { label: 'Precipitation', value: '12%', status: 'Nominal' },
                                { label: 'Visibility', value: '4.2 km', status: 'Stable' },
                                { label: 'Air Density', value: 'Low', status: 'Optimized' }
                            ].map((w, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors group-hover:text-amber-500">{w.label}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-black italic text-slate-900">{w.value}</span>
                                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase">{w.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full h-14 bg-amber-100 text-amber-600 hover:bg-amber-200 font-black uppercase text-[10px] tracking-widest rounded-2xl italic mt-6 border-none shadow-none">
                            AUTO-ADJUST VIA WEATHER
                        </Button>
                    </CardContent>
                </Card>

                {/* Zone Matrix */}
                <Card className="border-none shadow-sm rounded-4xl bg-white overflow-hidden lg:col-span-2">
                    <CardHeader className="p-10 pb-4 border-b border-slate-50 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-black uppercase italic tracking-tighter">{t('regional_multipliers', 'Regional Multipliers')}</CardTitle>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">Override zone-specific price vectors</p>
                        </div>
                        <Button variant="outline" onClick={fetchSurge} className="rounded-xl border-slate-200">
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="divide-y divide-slate-50">
                             {surgeData.map((zone, i) => (
                                 <div key={zone.zoneId} className="p-8 hover:bg-slate-50/50 transition-all flex items-center justify-between group">
                                     <div className="flex items-center gap-6">
                                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 ${zone.multiplier > 1.0 ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-400'}`}>
                                             <Globe size={24} />
                                         </div>
                                         <div>
                                             <h4 className="text-lg font-black italic uppercase tracking-tighter text-slate-900">{zone.name}</h4>
                                             <Badge className={`mt-1 border-none font-black text-[8px] uppercase tracking-widest px-2 py-0.5 ${zone.status === 'ACTIVE' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                 {zone.status}
                                             </Badge>
                                         </div>
                                     </div>
                                     
                                     <div className="flex items-center gap-4">
                                         <div className="flex gap-2">
                                             {[1.0, 1.25, 1.5, 2.0].map(m => (
                                                 <button
                                                     key={m}
                                                     onClick={() => handleUpdateZone(zone.zoneId, m)}
                                                     className={`w-12 h-10 rounded-xl font-black text-[10px] transition-all ${zone.multiplier === m ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                                 >
                                                     {m}x
                                                 </button>
                                             ))}
                                         </div>
                                         <div className="h-10 w-px bg-slate-100 mx-2" />
                                         <input 
                                             type="number" 
                                             step="0.1"
                                             placeholder="Custom"
                                             className="w-20 h-10 bg-slate-50 border-2 border-slate-100 rounded-xl px-2 text-[10px] font-black italic outline-none focus:border-amber-500/30 transition-all"
                                             onBlur={(e) => handleUpdateZone(zone.zoneId, parseFloat(e.target.value))}
                                         />
                                     </div>
                                 </div>
                             ))}
                         </div>
                         {surgeData.length === 0 && !loading && (
                             <div className="py-24 text-center">
                                 <p className="text-xs font-bold text-slate-300 uppercase italic tracking-widest">No active zones detected in the grid</p>
                             </div>
                         )}
                    </CardContent>
                </Card>
            </div>

            {/* Heatmap Insights (Mock) */}
            <Card className="border-none shadow-2xl rounded-4xl bg-slate-900 overflow-hidden relative group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05),transparent)] pointer-events-none" />
                <CardContent className="p-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                     <div className="space-y-6 max-w-xl">
                         <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500">
                             <TrendingUp size={16} />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('predictive_analytics', 'Predictive Analytics')}</span>
                         </div>
                         <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-tight">
                             Demand Peak Predicted in <span className="text-amber-500 uppercase">Sector-7</span> in 15 mins.
                         </h3>
                         <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
                             AI logic suggests a 1.25x surge deployment to balance driver supply-demand vectors across the eastern frontier.
                         </p>
                         <Button className="h-14 px-10 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black uppercase text-[10px] tracking-widest italic flex items-center gap-3 transition-all active:scale-95">
                             Deploy Recommended Surge
                             <ArrowRight size={18} />
                         </Button>
                     </div>
                     <div className="relative">
                         <div className="w-64 h-64 rounded-full border border-slate-800 animate-pulse-slow flex items-center justify-center">
                             <div className="w-48 h-48 rounded-full border-2 border-dashed border-amber-500/20 flex items-center justify-center animate-spin-slow">
                                 <Activity size={48} className="text-amber-500/20" />
                             </div>
                         </div>
                         <Zap size={200} className="absolute inset-0 m-auto text-amber-500/5 blur-3xl" />
                     </div>
                </CardContent>
            </Card>
        </div>
    );
}
