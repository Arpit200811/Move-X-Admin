import React, { useState } from 'react';
import { Package, Eye, Zap, Clock, Smartphone, MapPin, Truck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';

const PartnerOrderHub = ({ orders, onAccept, updateOrderStatus }) => {
    const { t } = useTranslation();
    const [selectedOrder, setSelectedOrder] = useState(null);

    return (
        <div className="space-y-6">
            <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b">
                        <tr>
                            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('shipment')}</th>
                            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('identity')}</th>
                            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('status')}</th>
                            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">{t('price')}</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-20 text-center">
                                    <div className="flex flex-col items-center opacity-20">
                                        <Package size={40} />
                                        <p className="text-sm font-bold mt-2 italic capitalize">No active orders at the moment.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-slate-100 text-primary">
                                                <Zap size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-slate-900">#{order.orderId?.slice(-6).toUpperCase()}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Order Details</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="min-w-[120px]">
                                            <p className="text-xs font-bold text-slate-700">{order.customerName || 'N/A'}</p>
                                            <p className="text-[9px] text-slate-400 font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge 
                                            variant={
                                                order.status === 'DELIVERED' ? 'success' : 
                                                order.status === 'PENDING' ? 'warning' : 'outline'
                                            } 
                                            className="text-[9px]"
                                        >
                                            {t(order.status)}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="text-xs font-black text-slate-900 italic">${order.price?.toFixed(2)}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {order.status === 'PENDING' && (
                                                <Button 
                                                    size="sm" 
                                                    className="h-8 px-4 text-[10px] font-black uppercase tracking-tighter italic"
                                                    onClick={() => onAccept(order._id)}
                                                >
                                                    {t('accept')}
                                                </Button>
                                            )}
                                            {order.status === 'ACCEPTED' && (
                                                <Button 
                                                    variant="outline"
                                                    size="sm" 
                                                    className="h-8 px-4 text-[10px] font-black uppercase tracking-tighter italic border-primary text-primary hover:bg-primary/5"
                                                    onClick={() => updateOrderStatus(order._id, 'READY')}
                                                >
                                                    Mark as Ready
                                                </Button>
                                            )}
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-slate-300 hover:text-slate-900" 
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <Eye size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-4xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[80vh]"
                        >
                            {/* Left Side: Order Details */}
                            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <Badge className="bg-primary/10 text-primary border-none mb-3 text-[10px] font-black italic">ORDER_CONTROL</Badge>
                                        <h3 className="text-2xl font-black text-slate-900 italic">#{selectedOrder.orderId?.toUpperCase()}</h3>
                                    </div>
                                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                        <ChevronRight className="rotate-90 md:rotate-0" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Product Details</p>
                                            <p className="text-sm font-bold text-slate-700">{selectedOrder.packageType}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                                            <Badge variant="outline" className="mt-1">{selectedOrder.status}</Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Value</p>
                                            <p className="text-lg font-black text-primary italic">${selectedOrder.price?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date Created</p>
                                            <p className="text-sm font-bold text-slate-700 italic">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Item Details</p>
                                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedOrder.items.map((it, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                                                        <span className="text-xs font-bold text-slate-700">{it.quantity}x <span className="text-slate-900 uppercase">{it.name}</span></span>
                                                        <span className="text-xs font-black text-slate-400">${(it.price * it.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs font-bold text-slate-400 italic">No item data found.</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Smartphone size={14} className="text-emerald-600" />
                                                <p className="text-[10px] font-black text-emerald-600 uppercase">Customer Contact</p>
                                            </div>
                                            <p className="text-xs font-black text-slate-700 italic uppercase">{selectedOrder.customerName || 'UNKNOWN'}</p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Truck size={14} className="text-blue-600" />
                                                <p className="text-[10px] font-black text-blue-600 uppercase">Delivery Assistant</p>
                                            </div>
                                            <p className="text-xs font-black text-slate-700 italic uppercase">{selectedOrder.driverId?.name || 'Awaiting Assignment'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Timeline Visualizer */}
                            <div className="w-full md:w-80 bg-slate-900 p-8 flex flex-col">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-8">Order_Timeline</p>
                                
                                <div className="flex-1 space-y-8 relative">
                                    <div className="absolute left-2.5 top-0 bottom-0 w-px bg-white/10" />
                                    
                                    {[
                                        { label: 'PENDING', desc: 'Order received and awaiting review', active: true },
                                        { label: 'ACCEPTED', desc: 'Order confirmed by merchant', active: selectedOrder.status !== 'PENDING' },
                                        { label: 'READY', desc: 'Order prepared and ready for pickup', active: ['READY', 'PICKED_UP', 'DELIVERED'].includes(selectedOrder.status) },
                                        { label: 'PICKED_UP', desc: 'Order picked up by courier', active: ['PICKED_UP', 'DELIVERED'].includes(selectedOrder.status) },
                                        { label: 'DELIVERED', desc: 'Order successfully delivered', active: selectedOrder.status === 'DELIVERED' }
                                    ].map((step, i) => (
                                        <div key={i} className="relative pl-8 group">
                                            <div className={`absolute left-0 w-5 h-5 rounded-full border-4 border-slate-900 transition-all z-10 ${step.active ? 'bg-primary scale-110 shadow-lg shadow-primary/30' : 'bg-slate-700'}`} />
                                            <div>
                                                <p className={`text-[10px] font-black tracking-widest uppercase ${step.active ? 'text-white' : 'text-slate-500'}`}>{step.label}</p>
                                                <p className="text-[9px] font-bold text-slate-500 mt-1">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                                    <Button className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest italic shadow-xl">
                                        Live Chat
                                    </Button>
                                    <Button variant="outline" onClick={() => setSelectedOrder(null)} className="w-full h-12 border-white/10 text-white hover:bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest italic">
                                        Close Details
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PartnerOrderHub;
