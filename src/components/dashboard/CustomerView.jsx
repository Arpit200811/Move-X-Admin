import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Download, Search, MapPin, Clock, ArrowRight, User, Truck, DollarSign, Activity, Zap, CreditCard, ExternalLink, Navigation as NavIcon, History, Trash2, Plus, X, Eye, ChevronRight, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useOrders, ORDER_STATUS } from '../../context/OrderContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const pickupIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

const destIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

const LocationPicker = ({ onSelect }) => {
    useMapEvents({
        click(e) {
            onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
};

const CustomerView = () => {
    const { t } = useTranslation();
    const { orders, createOrder, cancelOrder, currentUser } = useOrders();
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectMode, setSelectMode] = useState(null); // 'pickup' | 'destination' | null
    const [formData, setFormData] = useState({
        pickup: 'Downtown Central, 123 Tech Hub',
        destination: 'Ocean Breeze, 456 Palm Ave',
        pickupCoords: { lat: 28.6139, lng: 77.2090 },
        destCoords: { lat: 28.6448, lng: 77.2167 },
        packageType: 'Document',
        serviceClass: 'Economy',
        weight: '0.5kg'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createOrder({
            ...formData,
            customerName: currentUser?.name || t('guest_user'),
            status: ORDER_STATUS.PENDING,
            timeline: [{ status: t('order_placed'), time: new Date().toLocaleTimeString() }]
        });
        setShowOrderModal(false);
    };

    const activeOrders = orders.filter(o => o.status !== ORDER_STATUS.DELIVERED && o.status !== 'CANCELLED');
    const pastOrders = orders.filter(o => o.status === ORDER_STATUS.DELIVERED || o.status === 'CANCELLED');

    const routeCoords = formData.pickupCoords && formData.destCoords ?
        [[formData.pickupCoords.lat, formData.pickupCoords.lng], [formData.destCoords.lat, formData.destCoords.lng]] : [];

    return (
        <div className="space-y-6 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('mission_operations')}</h2>
                    <p className="text-slate-500 font-medium">{t('track_deploy_stream')}</p>
                </div>
                <Button onClick={() => setShowOrderModal(true)}>
                    <Plus size={16} className="mr-2" />
                    {t('new_deployment')}
                </Button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: t('active_flux'), value: activeOrders.length, icon: <Activity />, color: 'text-primary', bg: 'bg-indigo-50' },
                    { label: t('pending_packets'), value: orders.filter(o => o.status === ORDER_STATUS.PENDING).length, icon: <Clock />, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: t('total_volume'), value: orders.length, icon: <History />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                    <Card key={i}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                {React.cloneElement(stat.icon, { size: 20 })}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <h4 className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</h4>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Active Shipments Section */}
            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-black text-slate-800">{t('operational_streams')}</h3>
                    <Badge variant="outline" className="bg-white">{activeOrders.length} {t('running')}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeOrders.length === 0 ? (
                        <Card className="md:col-span-2 border-dashed bg-slate-50/50 py-12">
                            <CardContent className="flex flex-col items-center justify-center text-center">
                                <Package size={40} className="text-slate-200 mb-4" />
                                <p className="text-sm font-bold text-slate-400 italic">{t('no_active_telemetry')}</p>
                                <Button variant="link" className="text-xs mt-2" onClick={() => setShowOrderModal(true)}>{t('create_first_deployment')}</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        activeOrders.map(order => (
                            <OrderCard key={order._id} order={order} />
                        ))
                    )}
                </div>
            </div>

            {/* History Feed */}
            {pastOrders.length > 0 && (
                <div className="pt-4">
                    <h3 className="text-lg font-black text-slate-800 mb-4 px-1">{t('successful_consignments')}</h3>
                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 border-b">
                                        <tr>
                                            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('consignment_id')}</th>
                                            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('operation_metadata')}</th>
                                            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('protocol_state')}</th>
                                            <th className="p-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pastOrders.map(order => (
                                            <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 font-mono font-bold text-xs text-slate-500">#{order.orderId?.slice(-6)}</td>
                                                <td className="p-4">
                                                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2">
                                                        {t(order.packageType)} {t('shipment')}
                                                        <Badge variant="blue" className="text-[8px] h-4">{t(order.status)}</Badge>
                                                    </h3>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        <p className="text-[10px] text-slate-500 font-medium truncate italic">{order.pickup?.address || order.pickup}</p>
                                                    </div>
                                                    <ChevronRight size={10} className="text-slate-300" />
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                        <p className="text-[10px] text-slate-500 font-medium truncate italic">{order.destination?.address || order.destination}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={order.status === ORDER_STATUS.DELIVERED ? 'success' : 'outline'} className="text-[9px]">
                                                        {t(order.status)}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => alert(`${t('shipment')}: #${order.orderId}\n${t('operational_status')}: ${t(order.status)}\n${t('destination')}: ${order.destination?.address?.split(',')[0] || order.destination || 'N/A'}`)}>
                                                        <Eye size={14} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile List View */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {pastOrders.map(order => (
                                    <div key={order._id} className="p-4 flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-mono font-bold text-[10px] text-slate-400">#{order.orderId?.slice(-6)}</span>
                                            <Badge variant={order.status === ORDER_STATUS.DELIVERED ? 'success' : 'outline'} className="text-[8px] uppercase font-black">
                                                {t(order.status)}
                                            </Badge>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">{t(order.packageType)} {t('shipment')}</h4>
                                            <div className="mt-2 space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                    <p className="text-[10px] text-slate-500 font-medium truncate italic">{order.pickup?.address || order.pickup}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                                    <p className="text-[10px] text-slate-500 font-medium truncate italic">{order.destination?.address || order.destination}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Induction Modal */}
            <AnimatePresence>
                {showOrderModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                        <Plus size={24} />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setShowOrderModal(false)}>
                                        <X size={20} />
                                    </Button>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('mission_deployment')}</h3>
                                <p className="text-slate-500 font-medium mb-8">{t('deploy_delivery_request')}</p>

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('inception_point')}</label>
                                                    <button type="button" onClick={() => setSelectMode('pickup')} className="text-[9px] font-bold text-primary hover:underline uppercase">{t('radar_pick')}</button>
                                                </div>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                    <Input className="pl-9 h-11 text-xs" value={formData.pickup} onChange={e => setFormData({ ...formData, pickup: e.target.value })} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('target_point')}</label>
                                                    <button type="button" onClick={() => setSelectMode('destination')} className="text-[9px] font-bold text-rose-500 hover:underline uppercase">{t('radar_pick')}</button>
                                                </div>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                    <Input className="pl-9 h-11 text-xs" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1">{t('deployment_tier')}</label>
                                                <select
                                                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                                    value={formData.serviceClass}
                                                    onChange={e => setFormData({ ...formData, serviceClass: e.target.value })}
                                                >
                                                    <option>{t('Economy')}</option>
                                                    <option>{t('Standard')}</option>
                                                    <option>{t('Premium')}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1">{t('payload_weight')}</label>
                                                <Input className="h-11 text-xs" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full h-12 lg:h-14 rounded-2xl mt-4 bg-slate-900 group">
                                            {t('authorize_deployment')}
                                            <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>

                                    <div className="h-full min-h-[300px] rounded-3xl overflow-hidden border border-slate-100 relative shadow-inner">
                                        <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                            <LocationPicker onSelect={(coords) => {
                                                if (selectMode) {
                                                    setFormData({
                                                        ...formData,
                                                        [`${selectMode}Coords`]: coords,
                                                        [selectMode]: `LAT: ${coords.lat.toFixed(4)}, LNG: ${coords.lng.toFixed(4)}`
                                                    });
                                                    setSelectMode(null);
                                                }
                                            }} />
                                            {formData.pickupCoords && (
                                                <Marker position={[formData.pickupCoords.lat, formData.pickupCoords.lng]} icon={pickupIcon} />
                                            )}
                                            {formData.destCoords && (
                                                <Marker position={[formData.destCoords.lat, formData.destCoords.lng]} icon={destIcon} />
                                            )}
                                            {routeCoords.length === 2 && (
                                                <Polyline positions={routeCoords} color="#2563EB" weight={4} dashArray="10, 10" />
                                            )}
                                        </MapContainer>
                                        <div className="absolute top-4 left-4 z-50 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-800 uppercase flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                {selectMode ? `${t('selecting')} ${t(selectMode)}...` : t('route_telemetry_map')}
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const OrderCard = ({ order }) => {
    const { t } = useTranslation();
    const { cancelOrder } = useOrders();

    return (
        <Card className="group hover:border-primary/20 transition-all">
            <CardContent className="p-4 md:p-5 flex items-center gap-4 md:gap-5">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Zap size={24} className="md:w-[28px] md:h-[28px]" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] md:text-[10px] font-mono font-bold text-slate-400 uppercase">#{order.orderId?.slice(-8)}</span>
                        <Badge variant={order.status === ORDER_STATUS.DELIVERED ? 'success' : 'warning'} className="text-[8px] px-1 py-0 font-black">
                            {t(order.status)}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm md:text-base font-black text-slate-900 truncate">{t(order.packageType)} {t('shipment')}</h4>
                        <span className="text-xs md:text-sm font-black text-primary">${(order.price || 15).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-1.5">
                        <div className="flex items-center gap-1.5">
                            <MapPin size={10} className="text-slate-300" />
                            <span className="text-[9px] md:text-[10px] font-bold text-slate-500 truncate max-w-[80px] md:max-w-[120px]">{order.destination?.address?.split(',')[0] || order.destination || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={10} className="text-slate-300" />
                            <span className="text-[9px] md:text-[10px] font-bold text-slate-500">{order.timeline?.[0]?.time || 'LIVE'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 md:h-10 md:w-10 text-slate-300 hover:text-slate-900 hover:bg-slate-50"
                        onClick={() => alert(`Order #${order.orderId}\nStatus: ${order.status}\nPrice: $${(order.price || 15).toFixed(2)}\nDrop: ${order.destination?.address?.split(',')[0] || order.destination || 'N/A'}`)}
                    >
                        <ChevronRight size={18} />
                    </Button>
                    {['PENDING', 'ACCEPTED'].includes(order.status) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 md:h-10 md:w-10 text-rose-300 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => {
                                if (window.confirm(`${t('abort_mission_confirm')} #${order.orderId?.slice(-6)}?`)) {
                                    cancelOrder(order._id);
                                }
                            }}
                        >
                            <Trash2 size={16} />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default CustomerView;
