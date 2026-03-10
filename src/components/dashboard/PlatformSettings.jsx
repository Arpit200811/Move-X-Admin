import React, { useState, useEffect } from 'react';
import {
    Settings,
    Shield,
    Globe,
    Lock,
    Percent,
    MapPin,
    AlertTriangle,
    Save,
    RefreshCw,
    Activity,
    Server,
    Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function PlatformSettings() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        maintenanceMode: false,
        commissionRate: 15,
        serviceRadius: 10,
        minOrderValue: 50,
        platformFees: 5,
        autoAssignDrivers: true
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await api.get('/system/status');
                if (res.data?.success) {
                    setConfig(prev => ({
                        ...prev,
                        maintenanceMode: res.data.maintenanceMode
                    }));
                }
            } catch (err) {
                console.error("System Config Retrieval Failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/system/config', config);
            alert('Mission Control Parameters Updated Successfully');
        } catch (err) {
            alert('Configuration Protocol Failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-[60vh] items-center justify-center font-black animate-pulse text-slate-400">CALIBRATING_SYSTEM_PARAMETERS...</div>;

    return (
        <div className="space-y-10 pb-32">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-1">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                            <Settings size={24} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                            {t('platform_settings', 'Core Engine Config')}
                        </h2>
                    </div>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.25em] ml-1">{t('global_params', 'Global System Parameters')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button 
                        onClick={handleSave}
                        disabled={saving}
                        className="h-14 px-8 rounded-2xl font-black shadow-xl shadow-primary/25 uppercase text-[10px] tracking-widest flex items-center gap-3 bg-primary hover:bg-primary/95 transition-all active:scale-95 group"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'SYNCING...' : 'Commit Changes'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Maintenance & Security */}
                <Card className="border-none shadow-sm rounded-4xl overflow-hidden bg-white">
                    <CardHeader className="p-10 pb-4">
                        <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-rose-500">
                            <Shield size={22} /> {t('security_status', 'Security & Status')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="space-y-1">
                                <h4 className="font-black text-slate-900 uppercase italic tracking-tight">{t('maintenance_mode', 'Maintenance Mode')}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('maintenance_desc', 'Restrict platform access for updates')}</p>
                            </div>
                            <button 
                                onClick={() => setConfig(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                                className={`w-16 h-8 rounded-full transition-all relative ${config.maintenanceMode ? 'bg-rose-500' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${config.maintenanceMode ? 'left-9' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Commission (%)</p>
                                <Input 
                                    type="number" 
                                    value={config.commissionRate}
                                    onChange={(e) => setConfig(prev => ({ ...prev, commissionRate: e.target.value }))}
                                    className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black italic focus:ring-primary/10"
                                />
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Radius (KM)</p>
                                <Input 
                                    type="number" 
                                    value={config.serviceRadius}
                                    onChange={(e) => setConfig(prev => ({ ...prev, serviceRadius: e.target.value }))}
                                    className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black italic focus:ring-primary/10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Logistics Engine */}
                <Card className="border-none shadow-sm rounded-4xl overflow-hidden bg-white">
                    <CardHeader className="p-10 pb-4">
                        <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-primary">
                            <Activity size={22} /> {t('logistics_engine', 'Logistics Logic')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="space-y-1">
                                <h4 className="font-black text-slate-900 uppercase italic tracking-tight">{t('auto_assignment', 'Auto-Assign Drivers')}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('auto_assign_desc', 'AI-powered mission allocation')}</p>
                            </div>
                            <button 
                                onClick={() => setConfig(prev => ({ ...prev, autoAssignDrivers: !prev.autoAssignDrivers }))}
                                className={`w-16 h-8 rounded-full transition-all relative ${config.autoAssignDrivers ? 'bg-primary' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${config.autoAssignDrivers ? 'left-9' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Order Value (₹)</p>
                                <Input 
                                    type="number" 
                                    value={config.minOrderValue}
                                    onChange={(e) => setConfig(prev => ({ ...prev, minOrderValue: e.target.value }))}
                                    className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black italic focus:ring-primary/10"
                                />
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Fee (₹)</p>
                                <Input 
                                    type="number" 
                                    value={config.platformFees}
                                    onChange={(e) => setConfig(prev => ({ ...prev, platformFees: e.target.value }))}
                                    className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black italic focus:ring-primary/10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Infrastructure Status */}
                <Card className="border-none shadow-sm rounded-4xl overflow-hidden bg-slate-900 text-white lg:col-span-2">
                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <Server size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">{t('api_cluster', 'API Cluster')}</span>
                                </div>
                                <h4 className="text-2xl font-black italic tracking-tighter">OPERATIONAL</h4>
                                <p className="text-[9px] font-bold text-slate-500 uppercase">LATENCY: 42MS</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-emerald-500 mb-4">
                                    <Database size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">{t('db_shards', 'DB Shards')}</span>
                                </div>
                                <h4 className="text-2xl font-black italic tracking-tighter">HEALTHY</h4>
                                <p className="text-[9px] font-bold text-slate-500 uppercase">SYNC_LAG: 0.1S</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-amber-500 mb-4">
                                    <RefreshCw size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">{t('sync_node', 'Sync Node')}</span>
                                </div>
                                <h4 className="text-2xl font-black italic tracking-tighter">PENDING_SYNC</h4>
                                <p className="text-[9px] font-bold text-slate-500 uppercase">VECTORS: 124</p>
                            </div>
                            <div className="flex flex-col justify-center">
                                <Button variant="outline" className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black italic uppercase text-[10px] tracking-widest">
                                    {t('flush_cache', 'Flush System Cache')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
