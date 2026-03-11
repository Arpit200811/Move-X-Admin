import React, { useState, useEffect, useRef } from 'react';
import {
    Zap,
    Activity,
    Shield,
    Target,
    Cpu,
    History,
    Terminal as TerminalIcon,
    AlertCircle,
    CheckCircle2,
    Clock,
    Search,
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';

export default function AutoAssignmentHub() {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [activeMissions, setActiveMissions] = useState(0);
    const [successRate, setSuccessRate] = useState(94.8);
    const [isScanning, setIsScanning] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://move-x-backend.onrender.com');

        socket.on('dispatch_log', (data) => {
            setLogs(prev => [{
                id: Math.random(),
                ...data,
                type: data.message.includes('Mission Failed') || data.message.includes('Stalled') ? 'error' : 
                      data.message.includes('Assigned') ? 'success' : 'info'
            }, ...prev].slice(0, 50));
        });

        socket.on('order_updated', (order) => {
            if (order.status === 'ACCEPTED') {
                setActiveMissions(prev => prev + 1);
            }
        });

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [logs]);

    const stats = [
        { label: t('neural_load'), value: '14.2%', color: 'text-blue-500', icon: Cpu, bg: 'bg-blue-50' },
        { label: t('network_saturation'), value: t('optimal'), color: 'text-emerald-500', icon: Globe, bg: 'bg-emerald-50' },
        { label: t('avg_latency'), value: '412ms', color: 'text-indigo-500', icon: Activity, bg: 'bg-indigo-50' },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-1">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-primary shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] shadow-primary/20 transition-transform hover:rotate-6">
                        <Zap size={32} fill="currentColor" />
                    </div>
                    <div className="space-y-1.5">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">{t('auto_assignment_hub')}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] ml-1">{t('dispatcher_core_v4')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className="h-10 px-5 gap-3 bg-emerald-50 text-emerald-600 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest italic animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        {t('ai_node_online')}
                    </Badge>
                    <Button
                        onClick={() => setIsScanning(true)}
                        disabled={isScanning}
                        className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 text-white font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
                    >
                        <Search size={16} className={`mr-3 ${isScanning ? 'animate-spin' : ''}`} />
                        {t('manual_sweep')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tactical Feed */}
                <Card className="lg:col-span-2 bg-slate-900 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] rounded-4xl overflow-hidden min-h-[600px] flex flex-col">
                    <CardHeader className="border-b border-slate-800 bg-slate-900/50 p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-primary">
                                    <TerminalIcon size={20} />
                                </div>
                                <CardTitle className="text-white text-base uppercase font-black tracking-[0.15em] italic">{t('telemetry_stream_output')}</CardTitle>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                     <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">LIVE</span>
                                </div>
                                <Badge variant="outline" className="text-[9px] border-slate-700 text-slate-500 font-black uppercase tracking-widest px-3 py-1">X-PROTOCOL: ENCRYPTED</Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 flex flex-col">
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-8 space-y-4 font-mono text-[12px] scrollbar-hide"
                        >
                            <AnimatePresence initial={false}>
                                {logs.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-6">
                                        <div className="relative">
                                            <Cpu size={64} className="opacity-10 animate-pulse" />
                                            <motion.div 
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full" 
                                            />
                                        </div>
                                        <p className="text-[10px] uppercase font-black tracking-[0.3em]">{t('awaiting_neural_handshake')}</p>
                                    </div>
                                ) : (
                                    logs.map((log) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -15 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={log.id}
                                            className="flex gap-6 items-start group"
                                        >
                                            <span className="text-slate-600 shrink-0 font-bold opacity-50 tracking-tighter">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 2 })}]</span>
                                            <span className={`${log.type === 'error' ? 'text-rose-400 bg-rose-400/5 px-2 rounded' :
                                                log.message.includes('Synchronizing') ? 'text-emerald-400 font-black italic' :
                                                log.type === 'success' ? 'text-emerald-400' :
                                                    'text-slate-300'
                                                } flex-1 leading-relaxed`}>
                                                <span className="text-primary mr-3 opacity-50">»</span>
                                                {log.message}
                                                {log.orderId && <span className="text-primary/50 ml-3 font-black border-l border-slate-700 pl-3">ID: {log.orderId.slice(-8).toUpperCase()}</span>}
                                            </span>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="bg-slate-950/80 p-6 border-t border-slate-800 flex items-center justify-between backdrop-blur-md">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">WebSocket_X_Secure</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Latency: 24ms</span>
                                </div>
                            </div>
                            <div className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] italic">X-Dispatcher-Core v4.2.0-Alpha</div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Statistics */}
                <div className="space-y-8 flex flex-col">
                    <Card className="bg-white border-none shadow-sm rounded-4xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <CardHeader className="p-8 pb-0">
                            <CardTitle className="text-xs uppercase font-black text-slate-400 tracking-[0.2em] italic flex items-center gap-3">
                                <Activity size={16} className="text-primary" />
                                {t('success_velocity')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-6">
                            <div className="flex items-end gap-4 mb-6">
                                <h3 className="text-6xl font-black text-slate-900 italic tracking-tighter">
                                    {Math.floor(successRate)}<span className="text-primary text-2xl font-black">.{ (successRate % 1).toFixed(1).slice(2) }%</span>
                                </h3>
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase mb-3 px-3 py-1.5 rounded-xl">
                                    <Target size={12} className="mr-2" />
                                    +0.4%
                                </Badge>
                            </div>
                            <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden p-0.5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${successRate}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full rounded-full bg-primary shadow-lg shadow-primary/20" 
                                />
                            </div>
                            <div className="flex justify-between mt-6">
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{t('last_recalibration')}</p>
                                <p className="text-[9px] text-slate-900 font-black uppercase tracking-widest italic">12:04:22 AM</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        {stats.map((stat, i) => (
                            <Card key={i} className="border-none bg-white shadow-sm hover:shadow-md transition-all rounded-3xl group overflow-hidden">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} shadow-inner flex items-center justify-center transition-transform group-hover:scale-110`}>
                                            <stat.icon size={24} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{stat.label}</p>
                                            <p className="text-lg font-black text-slate-900 italic tracking-tighter uppercase">{stat.value}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-slate-900 text-white border-none text-[8px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg italic">
                                        STABLE
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="bg-primary text-white border-none shadow-2xl shadow-primary/30 rounded-4xl overflow-hidden relative flex-1 group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none group-hover:bg-white/15 transition-colors" />
                        <CardContent className="p-10 flex flex-col justify-between h-full">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 mb-8 backdrop-blur-md">
                                    <Shield size={28} className="text-white" />
                                </div>
                                <h4 className="font-black text-2xl italic tracking-tight mb-4 uppercase leading-none">{t('operational_safeguard')}</h4>
                                <p className="text-white/60 text-[10px] uppercase font-bold tracking-[0.2em] leading-relaxed max-w-[200px]">
                                    {t('ai_safety_protocol_active_monitoring')}
                                </p>
                            </div>
                            <div className="relative z-10 mt-10">
                                <Button className="w-full h-14 bg-white text-primary hover:bg-white/95 font-black uppercase tracking-widest italic rounded-2xl shadow-2xl active:scale-95 transition-all text-[10px]">
                                    {t('audit_protocols')}
                                </Button>
                            </div>
                            <Cpu size={240} className="absolute -bottom-20 -right-20 text-white/5 opacity-40 rotate-12 transition-transform group-hover:rotate-6 duration-1000" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
