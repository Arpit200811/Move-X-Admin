import React, { useState, useEffect } from 'react';
import { 
    Ticket, 
    Film, 
    Bus, 
    Calendar, 
    Plus, 
    Search, 
    MoreVertical, 
    Zap, 
    ArrowUpRight, 
    Trash2, 
    Edit3,
    Clock,
    MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function TicketingHub() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeCategory, setActiveCategory] = useState('movies'); // movies, buses, events

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await api.get('/tickets/config');
                if (res.data?.success) {
                    setData(res.data.data);
                }
            } catch (err) {
                console.error("Failure in Ticket Protocol", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const categories = [
        { id: 'movies', label: t('cinema_node', 'Cinema Node'), icon: Film, color: 'text-rose-500', bg: 'bg-rose-50' },
        { id: 'buses', label: t('transit_vector', 'Transit Vector'), icon: Bus, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'events', label: t('event_horizon', 'Event Horizon'), icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-32">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-1">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                            <Ticket size={24} className="rotate-12" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                            {t('ticketing_hub', 'Ticketing Hub')}
                        </h2>
                    </div>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.25em] ml-1">{t('inventory_sync_active', 'Inventory Sync: Active Node')}</p>
                </div>
                <div className="flex items-center gap-4">
                     <Button className="h-14 px-8 rounded-2xl font-black shadow-xl shadow-primary/25 uppercase text-[10px] tracking-widest flex items-center gap-3 bg-primary hover:bg-primary/95 transition-all active:scale-95 group">
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        {t('provision_new_asset', 'Provision Asset')}
                    </Button>
                </div>
            </div>

            {/* Category Switcher */}
            <div className="flex items-center gap-4 p-2 bg-slate-100/50 rounded-2xl w-fit border border-slate-200/50">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`
                            flex items-center gap-3 px-6 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest italic
                            ${activeCategory === cat.id 
                                ? 'bg-white text-slate-900 shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }
                        `}
                    >
                        <cat.icon size={16} className={activeCategory === cat.id ? cat.color : ''} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Content View */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {activeCategory === 'movies' && data?.movies?.showing.map((movie) => (
                        <Card key={movie.id} className="group border-none shadow-sm hover:shadow-2xl transition-all rounded-4xl bg-white overflow-hidden flex flex-col h-full">
                            <div className="relative h-64 overflow-hidden">
                                <img src={movie.img} alt={movie.title} className="w-full h-full object-cover grayscale(20%) group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    {movie.is3D && <Badge className="bg-slate-900/80 backdrop-blur-md text-white border-none font-black text-[8px] uppercase tracking-widest">3D / IMAX</Badge>}
                                    <Badge className="bg-emerald-500 text-white border-none font-black text-[8px] uppercase tracking-widest px-2 py-0.5">⭐ {movie.rating}</Badge>
                                </div>
                            </div>
                            <CardContent className="p-8 pb-10 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{movie.genre}</p>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">{movie.title}</h3>
                                    </div>
                                    <button className="text-slate-300 hover:text-slate-900 transition-colors p-2">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <Zap size={14} className="text-amber-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{movie.votes} VOTES</span>
                                    </div>
                                    <div className="flex gap-2 ml-auto">
                                        <button className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white flex items-center justify-center text-slate-400 transition-all active:scale-95 border border-slate-100"><Edit3 size={16} /></button>
                                        <button className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-500 hover:text-white flex items-center justify-center text-red-400 transition-all active:scale-95 border border-red-100"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {activeCategory === 'buses' && data?.buses?.routes.map((route) => (
                        <Card key={route.id} className="border-none shadow-sm hover:shadow-2xl transition-all rounded-4xl bg-white overflow-hidden p-8 flex flex-col h-full group">
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                    <Bus size={24} />
                                </div>
                                <Badge className="bg-slate-900 text-white border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-xl italic">{route.price}</Badge>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex items-center justify-between relative">
                                    <div className="absolute left-1/2 -translate-x-1/2 w-8 h-px bg-slate-100 flex items-center justify-center">
                                        <Clock size={12} className="text-slate-300 bg-white" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-slate-900 italic tracking-tighter leading-none">{route.departure}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{route.from}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-slate-900 italic tracking-tighter leading-none">{route.arrival}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{route.to}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{route.operator}</p>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-black text-emerald-500 italic">{route.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-relaxed">{route.type}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                                    {route.amenities.map(a => (
                                        <span key={a} className="text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-1 rounded-lg">{a}</span>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}

                    {activeCategory === 'events' && data?.events?.map((event) => (
                        <Card key={event.id} className="group border-none shadow-sm hover:shadow-2xl transition-all rounded-4xl bg-white overflow-hidden flex flex-col h-full">
                            <div className="relative h-56 overflow-hidden">
                                <img src={event.img} alt={event.title} className="w-full h-full object-cover grayscale(10%) group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                                <Badge className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-slate-900 border-none font-black text-[8px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-xl">{event.category}</Badge>
                            </div>
                            <CardContent className="p-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase mb-4 leading-tight">{event.title}</h3>
                                
                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={14} className="text-primary" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{event.date} • {event.time}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{event.venue}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <p className="text-xl font-black text-slate-900 italic tracking-tighter leading-none">{event.price}</p>
                                    <Button size="icon" className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-primary transition-all active:scale-95 group">
                                        <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
