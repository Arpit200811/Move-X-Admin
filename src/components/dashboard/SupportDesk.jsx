import React, { useState, useEffect } from 'react';
import {
    MessageSquare, Search, Clock, CheckCircle2, AlertCircle,
    ChevronRight, Tag, User, Send, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

const PRIORITY_MAP = {
    HIGH:       { color: 'bg-rose-500',   label: 'HIGH' },
    MEDIUM:     { color: 'bg-amber-500',  label: 'MEDIUM' },
    LOW:        { color: 'bg-slate-400',  label: 'LOW' },
};
const STATUS_MAP = {
    OPEN:        { color: 'bg-blue-500',    label: 'OPEN' },
    IN_PROGRESS: { color: 'bg-amber-500',   label: 'IN PROGRESS' },
    CLOSED:      { color: 'bg-emerald-500', label: 'CLOSED' },
};

export default function SupportDesk() {
    const { t } = useTranslation();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [reply, setReply] = useState('');
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/system/support-tickets');
                if (res.data?.success) setTickets(res.data.tickets);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);

    const handleReply = () => {
        if (!reply.trim()) return;
        // In production this would POST to backend
        alert(`Reply sent: "${reply}"\n(Would call POST /system/support-tickets/${selected.id}/reply)`);
        setReply('');
    };

    if (loading) return <div className="flex h-[60vh] items-center justify-center font-black animate-pulse text-slate-400">LOADING_SUPPORT_QUEUE...</div>;

    return (
        <div className="space-y-10 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-1">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-violet-600/20">
                            <MessageSquare size={22} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                            {t('support_desk', 'Support Desk')}
                        </h2>
                    </div>
                    <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.25em] ml-1">
                        {filtered.length} {t('active_tickets', 'Active Tickets')}
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 flex-wrap">
                {['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`
                            px-6 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all border-2
                            ${filter === s
                                ? 'bg-violet-600 border-violet-600 text-white shadow-xl shadow-violet-600/20'
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                            }
                        `}
                    >
                        {s.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
                {/* Ticket List */}
                <div className="space-y-4">
                    {filtered.map((ticket) => (
                        <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelected(ticket)}
                        >
                            <Card className={`border-2 cursor-pointer transition-all rounded-3xl overflow-hidden hover:shadow-xl ${selected?.id === ticket.id ? 'border-violet-600/50 shadow-violet-600/10 shadow-xl' : 'border-transparent shadow-sm'}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                                            <User size={22} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-4 mb-2">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase italic">#{ticket.id}</span>
                                                    <Badge className={`${STATUS_MAP[ticket.status]?.color || 'bg-slate-400'} text-white border-none font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-lg`}>
                                                        {STATUS_MAP[ticket.status]?.label || ticket.status}
                                                    </Badge>
                                                    <Badge className={`${PRIORITY_MAP[ticket.priority]?.color || 'bg-slate-400'} text-white border-none font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-lg`}>
                                                        {ticket.priority}
                                                    </Badge>
                                                </div>
                                                <ChevronRight size={18} className="text-slate-300 shrink-0" />
                                            </div>
                                            <h3 className="font-black text-slate-900 tracking-tight text-sm md:text-base truncate">{ticket.subject}</h3>
                                            <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5"><User size={12} />{ticket.user}</div>
                                                <div className="flex items-center gap-1.5"><Clock size={12} />{new Date(ticket.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="py-32 text-center">
                            <CheckCircle2 size={48} className="mx-auto text-slate-100 mb-4" />
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Queue Clear — No Incidents</p>
                        </div>
                    )}
                </div>

                {/* Ticket Detail */}
                <AnimatePresence>
                    {selected && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                            <Card className="border-none shadow-2xl rounded-4xl overflow-hidden sticky top-8">
                                <CardHeader className="p-8 border-b border-slate-50">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-2">#{selected.id}</p>
                                            <CardTitle className="text-xl font-black tracking-tighter leading-tight">{selected.subject}</CardTitle>
                                        </div>
                                        <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white flex items-center justify-center text-slate-400 transition-all">
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="flex gap-3 mt-4 flex-wrap">
                                        <Badge className={`${STATUS_MAP[selected.status]?.color} text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-xl`}>
                                            {STATUS_MAP[selected.status]?.label}
                                        </Badge>
                                        <Badge className={`${PRIORITY_MAP[selected.priority]?.color} text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-xl`}>
                                            {selected.priority} PRIORITY
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">USER</p>
                                        <p className="font-black text-slate-900 italic">{selected.user}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">SUBMITTED</p>
                                        <p className="font-black text-slate-900 italic">{new Date(selected.date).toLocaleString()}</p>
                                    </div>
                                    <div className="h-px bg-slate-50" />
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">ADMIN REPLY</p>
                                        <textarea
                                            value={reply}
                                            onChange={e => setReply(e.target.value)}
                                            placeholder="Type your response..."
                                            className="w-full h-32 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium outline-none resize-none focus:ring-4 focus:ring-violet-600/10 focus:border-violet-600/30 transition-all"
                                        />
                                        <Button onClick={handleReply} className="mt-4 w-full h-12 rounded-2xl bg-violet-600 hover:bg-violet-700 font-black uppercase text-[10px] tracking-widest flex items-center gap-3">
                                            <Send size={16} /> Send Response
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
