import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrders, ORDER_STATUS } from '../../context/OrderContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Download, Search, User, Truck, Activity, Zap, Filter, Eye, ShieldCheck, Box } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function OrdersManagement({ searchQuery = '', onCreateOrder }) {
    const { t } = useTranslation();
    const { orders, updateOrderStatus } = useOrders();
    const [statusFilter, setStatusFilter] = React.useState('ALL');

    const [selectedOrder, setSelectedOrder] = React.useState(null);

    const q = searchQuery.toLowerCase().trim();
    const filtered = (() => {
        let list = statusFilter !== 'ALL' ? (orders || []).filter(o => o.status === statusFilter) : (orders || []);
        if (!q) return list;
        return list.filter(o =>
            o.orderId?.toLowerCase().includes(q) ||
            (o.customerId?.name || o.customerName || '').toLowerCase().includes(q) ||
            (o.driverId?.name || o.driverName || '').toLowerCase().includes(q) ||
            (o.pickup?.address || (typeof o.pickup === 'string' ? o.pickup : '')).toLowerCase().includes(q) ||
            (o.destination?.address || (typeof o.destination === 'string' ? o.destination : '')).toLowerCase().includes(q) ||
            o.status?.toLowerCase().includes(q)
        );
    })();

    const STATUS_CYCLE = ['ALL', 'PENDING', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'];

    const handleExportCSV = () => {
        const headers = ['Order ID', 'Customer', 'Driver', 'Pickup', 'Destination', 'Price', 'Status', 'Date'];
        const rows = filtered.map(o => [
            o.orderId || '',
            o.customerId?.name || o.customerName || 'Unknown',
            o.driverId?.name || o.driverName || 'Unassigned',
            o.pickup?.address || (typeof o.pickup === 'string' ? o.pickup : ''),
            o.destination?.address || (typeof o.destination === 'string' ? o.destination : ''),
            (o.price || 15).toFixed(2),
            o.status || '',
            o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''
        ].map(v => `"${String(v).replace(/"/g, '""')}"`));

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `movex_orders_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case ORDER_STATUS.DELIVERED: return 'success';
            case ORDER_STATUS.PENDING: return 'warning';
            case ORDER_STATUS.PICKED_UP: return 'default';
            case ORDER_STATUS.CANCELLED: return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6 md:space-y-10 pb-32">
            {/* Page Header omitted for brevity in replace tool, but included in my mind */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 md:gap-8 px-1">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                            {t('order_hub')}
                        </h2>
                        <div className="h-7 md:h-8 px-3 md:px-4 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] md:text-xs font-black shadow-sm shadow-primary/5">
                            {filtered.length} NODES
                        </div>
                    </div>
                    <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em]">{t('track_deploy_stream')}</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <Button 
                        variant="outline" 
                        className="flex-1 sm:flex-none bg-white border-slate-200 rounded-xl md:rounded-2xl shadow-sm h-10 md:h-12 px-4 md:px-6 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 active:scale-95 transition-all" 
                        onClick={handleExportCSV}
                    >
                        <Download size={14} className="mr-2 text-slate-400" />
                        {t('export')}
                    </Button>
                    <Button 
                        className="flex-1 sm:flex-none rounded-xl md:rounded-2xl shadow-xl shadow-primary/25 h-10 md:h-12 px-4 md:px-6 font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/95 active:scale-95 transition-all" 
                        onClick={() => onCreateOrder?.() || alert(t('error'))}
                    >
                        <Zap size={14} className="mr-2" />
                        {t('new_deployment')}
                    </Button>
                </div>
            </div>

            {/* Metrics ... */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: t('active_missions'), val: filtered.filter(o => o.status !== ORDER_STATUS.DELIVERED).length, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                    { label: t('delivered_today'), val: filtered.filter(o => o.status === ORDER_STATUS.DELIVERED).length, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                    { label: t('total_throughput'), val: filtered.length, icon: Package, color: 'text-slate-600', bg: 'bg-slate-50' }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white/60 backdrop-blur-md hover:shadow-md transition-all rounded-3xl group">
                        <CardContent className="p-6 flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <stat.icon size={26} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight italic">{stat.val}</h4>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Record Feed */}
            <div className="space-y-6">
                <div className="hidden md:block">
                    <Card className="border-none shadow-xl shadow-slate-200/40 bg-white rounded-4xl overflow-hidden">
                        <CardContent className="p-0">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{t('mission_id')}</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{t('operator_node')}</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{t('deployment_vector')}</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{t('valuation')}</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{t('node_status')}</th>
                                        <th className="p-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <AnimatePresence mode="popLayout">
                                        {filtered.map((order) => (
                                            <motion.tr
                                                key={order._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <td className="p-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-900 group-hover:text-primary transition-colors italic uppercase">#{order.orderId?.slice(-8)}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{t(order.packageType)}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200 group-hover:bg-white group-hover:shadow-md transition-all overflow-hidden p-1">
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/png?seed=${order.customerName || 'U'}`} className="w-full h-full object-cover rounded-xl" alt="U" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-800 uppercase italic tracking-tight">{order.customerName || order.customerId?.name || 'NODE_SYNC_ERR'}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 italic">{order.items?.length || 0} Payload Units</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="max-w-[320px] space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 ring-4 ring-blue-50/50" />
                                                            <span className="text-xs font-bold text-slate-500 truncate italic">{order.pickup?.address || order.pickup}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 ring-4 ring-rose-50/50" />
                                                            <span className="text-xs font-bold text-slate-500 truncate italic">{order.destination?.address || order.destination}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <span className="text-lg font-black text-slate-900 italic tracking-tighter">${(order.price || 15).toFixed(2)}</span>
                                                </td>
                                                <td className="p-6">
                                                    <Badge className="h-7 px-4 rounded-xl font-bold text-[9px] uppercase tracking-widest" variant={getStatusVariant(order.status)}>
                                                        {t(order.status)}
                                                    </Badge>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-10 w-10 text-slate-300 hover:text-primary hover:bg-slate-50 rounded-2xl transition-all active:scale-95 shadow-sm"
                                                    >
                                                        <Eye size={20} />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal - Order Detail & Timeline */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-4xl rounded-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                        >
                            <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Protocol Log v1.02</span>
                                        <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none mt-1 uppercase">Mission #{selectedOrder.orderId?.slice(-8)}</h3>
                                    </div>
                                    <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-12">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-l-2 border-primary pl-3">Deployment Vector</p>
                                        <div className="space-y-6 relative pl-6">
                                            <div className="absolute left-1.5 top-3 bottom-3 w-px bg-slate-100" />
                                            <div className="relative">
                                                <div className="absolute -left-[22px] top-1.5 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-lg" />
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Pickup</p>
                                                <p className="text-xs font-bold text-slate-700 italic">{selectedOrder.pickup?.address || selectedOrder.pickup}</p>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute -left-[22px] top-1.5 w-4 h-4 rounded-full bg-rose-500 border-4 border-white shadow-lg" />
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Destination</p>
                                                <p className="text-xs font-bold text-slate-700 italic">{selectedOrder.destination?.address || selectedOrder.destination}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-l-2 border-emerald-500 pl-3">Payload Data</p>
                                        <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Net Valuation</span>
                                                <span className="text-lg font-black text-slate-900 italic">${selectedOrder.price?.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Service Tier</span>
                                                <Badge className="bg-slate-900 text-white border-none font-black text-[8px] uppercase">{selectedOrder.packageType}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-l-2 border-amber-500 pl-3">Mission Timeline</p>
                                    <div className="space-y-8">
                                        {[
                                            { event: 'DEPLOYMENT_INITIALIZED', time: selectedOrder.createdAt, status: 'completed' },
                                            { event: 'DRIVER_NODE_ASSIGNED', time: selectedOrder.updatedAt, status: 'completed' },
                                            { event: 'PAYLOAD_PICKED_UP', time: null, status: 'pending' },
                                            { event: 'MISSION_ACCOMPLISHED', time: null, status: 'pending' }
                                        ].map((step, i) => (
                                            <div key={i} className={`flex items-start gap-6 ${step.status === 'pending' ? 'opacity-30' : ''}`}>
                                                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                                                    {step.status === 'completed' ? <CheckCircle size={18} className="text-emerald-500" /> : <Clock size={18} />}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-900 uppercase italic tracking-tight">{step.event.replace(/_/g, ' ')}</h4>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{step.time ? new Date(step.time).toLocaleString() : 'PENDING_TELEMETRY'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-80 bg-slate-900 p-8 flex flex-col justify-between">
                                <div className="space-y-8">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Operator Node</p>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white text-xl font-black">
                                                {selectedOrder.customerName?.[0] || 'U'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-white truncate italic">{selectedOrder.customerName || 'UNKNOWN'}</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase truncate">Customer ID: {selectedOrder.customerId?._id?.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Assigned Pilot</p>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                                <Truck size={22} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-white truncate italic">{selectedOrder.driverName || 'UNASSIGNED'}</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase truncate">Node Tracking Active</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 space-y-4">
                                    <Button 
                                        onClick={async () => {
                                            if (window.confirm("ARE_YOU_SURE_YOU_WANT_TO_ABORT_THIS_MISSION?")) {
                                                await updateOrderStatus(selectedOrder._id, ORDER_STATUS.CANCELLED);
                                                setSelectedOrder(null);
                                            }
                                        }}
                                        className="w-full h-14 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest italic shadow-xl"
                                    >
                                        Abort Mission
                                    </Button>
                                    <Button variant="outline" className="w-full h-12 border-white/10 text-white hover:bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest italic">
                                        Debug Telemetry
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
