import React, { useState, useEffect } from 'react';
import {
    Truck,
    Bike,
    Car,
    Plus,
    Edit3,
    Trash2,
    DollarSign,
    Zap,
    Activity,
    Shield,
    RefreshCw,
    AlertCircle,
    Navigation,
    Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function FleetHub() {
    const { t } = useTranslation();
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(null);

    const fetchFleet = async () => {
        try {
            setLoading(true);
            const res = await api.get('/fleet');
            setVehicleTypes(res.data.types);
        } catch (err) {
            console.error("Failed to load fleet", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFleet();
    }, []);

    const iconMap = {
        'Bike': <Bike size={28} />,
        'Car': <Car size={28} />,
        'Van': <Truck size={28} />,
        'Truck': <Layers size={28} />,
        'Auto': <Navigation size={28} />
    };

    const handleUpdate = async (id, data) => {
        try {
            await api.patch(`/fleet/${id}`, data);
            setEditMode(null);
            fetchFleet();
        } catch (err) {
            alert("Fleet recalibration failed");
        }
    };

    return (
        <div className="space-y-10 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-1">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-600/20 transition-transform hover:rotate-12">
                            <Truck size={30} />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                                {t('fleet_dynamics', 'Fleet Dynamics')}
                            </h2>
                            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.25em] ml-1">
                                {t('operational_tier_calibration', 'Operational Tier Calibration')}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 active:scale-95 shadow-sm">
                        <Activity size={18} className="text-blue-600" />
                        {t('sim_load_test', 'Sim Load Test')}
                    </Button>
                    <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black shadow-xl shadow-blue-600/25 uppercase text-[10px] tracking-widest flex items-center gap-3 active:scale-95 transition-all">
                        <Plus size={18} />
                        {t('provision_tier', 'Provision Tier')}
                    </Button>
                </div>
            </div>

            {/* Comparison Logic */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center opacity-50">
                        <RefreshCw size={48} className="animate-spin text-blue-600 mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">{t('syncing_fleet_protocols', 'Syncing Fleet Protocols')}</p>
                    </div>
                ) : (
                    vehicleTypes.map((tier, idx) => (
                        <motion.div
                            key={tier._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="border-none shadow-sm hover:shadow-2xl transition-all rounded-4xl bg-white overflow-hidden group">
                                <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            {iconMap[tier.name] || <Truck size={28} />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">{tier.name}</CardTitle>
                                            <Badge className={`mt-1.5 border-none font-black text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-lg ${tier.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {tier.isActive ? 'OPERATIONAL' : 'DECOMMISSIONED'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <button onClick={() => setEditMode(tier)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-inner">
                                        <Edit3 size={18} />
                                    </button>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Zap size={10} className="text-amber-500" /> {t('base_quantum', 'Base Quantum')}
                                            </p>
                                            <p className="text-2xl font-black italic tracking-tighter text-slate-900">₹{tier.baseFare}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Navigation size={10} className="text-indigo-500" /> {t('distance_rate', 'Distance Rate')}
                                            </p>
                                            <p className="text-2xl font-black italic tracking-tighter text-slate-900">₹{tier.ratePerKm}/km</p>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100 w-full" />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-tight">
                                            <span className="text-slate-400 italic">Load Capacity</span>
                                            <span className="text-slate-900 font-black">{tier.capacityKg} KG</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-0.5">
                                            <div 
                                                className="h-full bg-blue-600 rounded-full shadow-lg shadow-blue-600/20" 
                                                style={{ width: `${Math.min(100, (tier.capacityKg / 2000) * 100)}%` }} 
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden group/alert">
                                        <Shield size={80} className="absolute -bottom-8 -right-8 text-white/5 group-hover/alert:scale-110 transition-transform duration-700" />
                                        <div className="relative z-10 flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-400 shrink-0">
                                                <DollarSign size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 italic">Yield Potential</p>
                                                <p className="text-xs font-bold text-white uppercase italic tracking-tight">High Frequency Protocol</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Edit Modal / Slideover (Mocked for now) */}
            <AnimatePresence>
                {editMode && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg bg-white rounded-4xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Calibrate {editMode.name}</h3>
                                <button onClick={() => setEditMode(null)} className="text-slate-400 hover:text-slate-900">
                                    <Trash2 size={24} />
                                </button>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Fare (₹)</label>
                                        <input 
                                            type="number" 
                                            defaultValue={editMode.baseFare} 
                                            className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-black italic outline-none focus:border-blue-600/30 focus:bg-white transition-all text-lg"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate / KM (₹)</label>
                                        <input 
                                            type="number" 
                                            defaultValue={editMode.ratePerKm} 
                                            className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-black italic outline-none focus:border-blue-600/30 focus:bg-white transition-all text-lg"
                                        />
                                    </div>
                                </div>
                                <Button className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all">
                                    Commit Calibration Matrix
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
