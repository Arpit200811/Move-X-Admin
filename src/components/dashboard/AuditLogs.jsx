import React, { useState, useEffect } from 'react';
import { 
    ShieldAlert, 
    Search, 
    Clock, 
    User, 
    Activity, 
    Terminal, 
    Eye, 
    Layers,
    ChevronRight,
    SearchX,
    Cpu,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function AuditLogs() {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/audit');
            setLogs(res.data.logs || []);
        } catch (err) {
            console.error("Failed to load audit logs", err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = logs.filter(log => 
        log.event.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-4">
                        <Terminal className="text-slate-900" size={32} />
                        {t('audit_logs') || "System Pulse"}
                    </h2>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 ml-12">Immutable Operational History</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="SEARCH EVENT_ID OR ACTOR..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-100 border-none rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8">
                    <Card className="border-none shadow-xl shadow-slate-200/40 bg-white rounded-4xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="max-h-[700px] overflow-y-auto scrollbar-hide divide-y divide-slate-50">
                                {loading ? (
                                    <div className="py-40 flex flex-col items-center justify-center">
                                        <RefreshCw className="animate-spin text-primary mb-4" size={48} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Scanning Data Cores...</p>
                                    </div>
                                ) : filtered.map((log, idx) => (
                                    <motion.div
                                        key={log._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`p-6 cursor-pointer transition-all hover:bg-slate-50/80 group ${selectedLog?._id === log._id ? 'bg-slate-50 border-l-4 border-primary' : ''}`}
                                        onClick={() => setSelectedLog(log)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg overflow-hidden shrink-0">
                                                    {log.entityType === 'order' ? <Layers size={18} /> : 
                                                     log.entityType === 'user' ? <User size={18} /> : 
                                                     <Activity size={18} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-200 bg-white">
                                                            {log.entityType}
                                                        </Badge>
                                                        <span className="text-[10px] font-mono text-slate-400">#{log.entityId?.slice(-6).toUpperCase()}</span>
                                                    </div>
                                                    <h4 className="text-sm font-black text-slate-900 italic uppercase truncate max-w-[300px]">{log.event.replace(/_/g, ' ')}</h4>
                                                </div>
                                            </div>

                                            <div className="text-right hidden sm:block">
                                                <p className="text-[9px] font-black text-slate-950 uppercase tracking-widest leading-none mb-1">
                                                    {new Date(log.createdAt).toLocaleTimeString()}
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {new Date(log.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {filtered.length === 0 && !loading && (
                                    <div className="py-40 flex flex-col items-center justify-center">
                                        <SearchX size={64} className="text-slate-100 mb-6" />
                                        <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] italic">No operational data matches your query</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 sticky top-8">
                    <AnimatePresence mode="wait">
                        {selectedLog ? (
                            <motion.div
                                key={selectedLog._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-4xl overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="p-8 border-b border-white/5 bg-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3">Event Detail Trace</p>
                                            <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-4">{selectedLog.event.replace(/_/g, ' ')}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge className="bg-primary text-white border-none font-black text-[8px] uppercase tracking-widest px-3 py-1">
                                                    {selectedLog.actorRole}
                                                </Badge>
                                                <Badge className="bg-white/10 text-slate-400 border-none font-black text-[8px] uppercase tracking-widest px-3 py-1">
                                                    IP: {selectedLog.ipAddress || "INTERNAL"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="p-8 space-y-8">
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Cpu className="text-primary" size={20} />
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Context Metadata</p>
                                                </div>
                                                <div className="bg-black/40 p-5 rounded-2xl border border-white/5 font-mono text-[10px] text-slate-300 overflow-x-auto">
                                                    <pre>{JSON.stringify(selectedLog.metadata || {}, null, 2)}</pre>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10">
                                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                                    <User size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Actor Node ID</p>
                                                    <p className="text-xs font-bold text-white truncate italic">{selectedLog.actorId || "SYSTEM_DAEMON"}</p>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 text-center">Immutable Ledger Entry v1.02</p>
                                                <div className="flex justify-center -space-x-2">
                                                    {[1,2,3,4].map(i => (
                                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="h-[500px] rounded-4xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center">
                                <ShieldAlert size={48} className="text-slate-100 mb-6" />
                                <h3 className="text-base font-black text-slate-400 uppercase italic tracking-tighter">Node Analysis Inactive</h3>
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 leading-relaxed">
                                    Select a pulse event from the ledger to inspect detailed heuristic metadata.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
