import React, { useState, useEffect } from 'react';
import {
    Server,
    Shield,
    Zap,
    Activity,
    Globe,
    Cpu,
    HardDrive,
    RefreshCcw,
    AlertTriangle,
    CheckCircle2,
    Lock,
    Unlock,
    ServerCrash,
    LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';

export default function InfrastructureHUD() {
    const { t } = useTranslation();
    const [systemData, setSystemData] = useState(null);
    const [maintenanceLoading, setMaintenanceLoading] = useState(false);
    const [trafficPulse, setTrafficPulse] = useState([]);

    const fetchSystemStatus = async () => {
        try {
            const res = await api.get('/system/status');
            setSystemData(res.data);
        } catch (err) {
            console.error("Failed to sync with network core", err);
        }
    };

    useEffect(() => {
        fetchSystemStatus();
        const interval = setInterval(() => {
            setTrafficPulse(prev => [...prev.slice(-10), Math.floor(Math.random() * 80) + 20]);
        }, 2000);

        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
        socket.on('maintenance_status', (data) => {
            setSystemData(prev => ({ ...prev, maintenanceMode: data.enabled }));
        });

        return () => {
            clearInterval(interval);
            socket.disconnect();
        };
    }, []);

    const toggleMaintenance = async () => {
        setMaintenanceLoading(true);
        try {
            const res = await api.post('/system/toggle-maintenance');
            setSystemData(prev => ({ ...prev, maintenanceMode: res.data.maintenanceMode }));
        } catch (err) {
            console.error("Infrastructure Lockdown Failed", err);
        } finally {
            setMaintenanceLoading(false);
        }
    };

    if (!systemData) return null;

    return (
        <div className="space-y-10 pb-20">
            {/* Header / Global Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-1">
                <div className="space-y-4">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] transition-transform hover:rotate-6">
                            <Server size={32} />
                        </div>
                        <div className="space-y-1.5">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
                                {t('infra_hud')}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] ml-1">{t('nodal_load_desc_v4')}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-3 rounded-4xl shadow-sm border border-slate-50">
                    <div className={`flex flex-col items-end px-5 border-r border-slate-100`}>
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">{t('global_guard')}</span>
                        <span className={`text-xs font-black italic uppercase ${systemData.maintenanceMode ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {systemData.maintenanceMode ? t('lockdown_engaged') : t('protocols_nominal')}
                        </span>
                    </div>
                    <Button
                        onClick={toggleMaintenance}
                        disabled={maintenanceLoading}
                        className={`h-14 px-8 rounded-3xl font-black italic uppercase text-[10px] tracking-widest shadow-2xl transition-all active:scale-95 ${systemData.maintenanceMode ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'}`}
                    >
                        {maintenanceLoading ? <RefreshCcw size={16} className="animate-spin" /> :
                            systemData.maintenanceMode ? <Unlock size={16} className="mr-3" /> : <Lock size={16} className="mr-3" />}
                        {systemData.maintenanceMode ? t('deactivate_guard') : t('engage_lockdown')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Auto-Scale Load Balancer */}
                <Card className="lg:col-span-2 overflow-hidden border-none shadow-sm bg-white rounded-4xl flex flex-col">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-amber-500 rounded-2xl shadow-[0_12px_24px_-8px_rgba(245,158,11,0.5)] text-white">
                                    <Zap size={24} fill="currentColor" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black uppercase italic tracking-tighter leading-none">{t('load_balancer')}</CardTitle>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{t('virtual_traffic_matrix_node')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('strat')}:</span>
                                <Badge className="px-5 py-2 rounded-xl text-[10px] font-black uppercase border-none bg-slate-900 text-white italic tracking-widest">{systemData.loadBalancer.strategy}</Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {systemData.nodes.map((node, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={node.id}
                                    className={`relative p-8 rounded-4xl border-2 transition-all group ${node.status === 'Active' ? 'border-primary bg-blue-50/20' : 'border-slate-50 bg-slate-50/30'}`}
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${node.status === 'Active' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-slate-200 text-slate-400'}`}>
                                            <Cpu size={22} />
                                        </div>
                                        <Badge className={`rounded-xl px-3 py-1.5 text-[9px] uppercase font-black tracking-widest italic border-none ${node.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {node.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1 mb-8">
                                        <h4 className="font-black text-slate-900 text-lg tracking-tighter italic uppercase leading-none">{node.id}</h4>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{node.region}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest italic">
                                            <span>{t('nodal_load')}</span>
                                            <span className={node.load > 80 ? 'text-rose-500' : 'text-slate-900'}>{node.load}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${node.load}%` }}
                                                className={`h-full rounded-full transition-colors ${node.load > 80 ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]' : 'bg-primary shadow-[0_0_12px_rgba(37,99,235,0.5)]'}`}
                                            />
                                        </div>
                                    </div>

                                    {node.status === 'Active' && (
                                        <div className="mt-8 flex gap-2 justify-center">
                                            {[1, 2, 3].map(dot => (
                                                <motion.div
                                                    key={dot}
                                                    animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                                                    transition={{ repeat: Infinity, duration: 2, delay: dot * 0.4 }}
                                                    className="w-1.5 h-1.5 rounded-full bg-primary/30"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        <div className="p-10 bg-slate-900 rounded-5xl text-white relative overflow-hidden shadow-2xl group">
                             <Globe size={400} className="absolute -bottom-40 -left-40 text-white/5 group-hover:rotate-12 transition-transform duration-[10s] ease-linear" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                                        <Activity className="text-primary animate-pulse" size={36} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{t('global_throughput')}</p>
                                        <h3 className="text-5xl font-black italic tracking-tighter">{systemData.loadBalancer.throughput}</h3>
                                    </div>
                                </div>
                                <div className="h-20 flex items-end gap-2 px-10 border-x border-white/5">
                                    {trafficPulse.map((val, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${val}%` }}
                                            className="w-2.5 bg-primary rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                        />
                                    ))}
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">{t('active_conns')}</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                        <h3 className="text-5xl font-black italic tracking-tighter text-emerald-400">{systemData.loadBalancer.activeConnections}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Guard Stats */}
                <div className="space-y-8 flex flex-col">
                    <Card className="bg-white border-none shadow-sm rounded-4xl overflow-hidden flex-1 group">
                        <CardHeader className="p-10 pb-6">
                            <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-[0.3em] italic flex items-center gap-4">
                                <Shield size={18} className="text-primary" />
                                {t('security_protocol_hub')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 pt-0 space-y-5">
                            {[
                                { icon: Lock, label: t('ssl_termination'), status: 'active' },
                                { icon: Shield, label: 'WAF Deep-Filter', status: 'active' },
                                { icon: Zap, label: t('ddos_mitigation'), status: 'pulse' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-50 transition-all hover:bg-white hover:shadow-xl hover:border-slate-100 group/item">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 transition-colors group-hover/item:bg-primary group-hover/item:text-white">
                                            <item.icon size={22} className="text-primary group-hover/item:text-white" />
                                        </div>
                                        <span className="text-[11px] font-black text-slate-800 italic uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    {item.status === 'active' ? (
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                            <CheckCircle2 size={20} className="text-emerald-500" />
                                        </div>
                                    ) : (
                                        <Badge className="px-4 py-1.5 rounded-xl text-[9px] animate-pulse font-black uppercase tracking-widest shadow-[0_0_12px_rgba(16,185,129,0.4)] bg-emerald-50 text-emerald-600 border-none">{t('active')}</Badge>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-none shadow-2xl text-white relative rounded-5xl overflow-hidden min-h-[400px] group">
                        <CardContent className="p-12 flex flex-col justify-between h-full">
                            <div className="space-y-10">
                                <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center border border-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                                    <ServerCrash size={40} className="text-rose-500" />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{t('emergency_protocol')}</h4>
                                    <p className="text-white/40 text-[11px] font-bold leading-relaxed uppercase tracking-[0.15em] max-w-[240px]">
                                        {t('emergency_desc_v4')}
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] h-16 rounded-3xl italic shadow-2xl transition-all active:scale-95"
                                onClick={() => window.open('/health', '_blank')}
                            >
                                <LayoutDashboard size={18} className="mr-3 text-primary" />
                                Open Neural Health HUD
                            </Button>
                        </CardContent>
                        <Activity size={240} className="absolute -bottom-24 -right-24 text-white/5 opacity-40 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                    </Card>
                </div>
            </div>
        </div>
    );
}
