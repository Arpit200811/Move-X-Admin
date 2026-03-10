import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Navigation,
    MapPin,
    Clock,
    Package,
    CheckCircle2,
    Truck,
    Activity,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useOrders, ORDER_STATUS } from '../../context/OrderContext';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

const DriverView = () => {
    const { t } = useTranslation();
    const { orders, updateOrderStatus, currentUser } = useOrders();
    const [distance, setDistance] = useState(2.4);
    const [earnings, setEarnings] = useState({ today: '0.00', total: '0.00', deliveries: 0 });

    // Fetch real earnings from backend
    useEffect(() => {
        api.get('/orders/driver-earnings')
            .then(res => res.data.earnings && setEarnings(res.data.earnings))
            .catch(() => { });
    }, []);

    const availableOrders = orders.filter(o => o.status === ORDER_STATUS.PENDING);
    const myActiveOrder = orders.find(o =>
        o.driverId === currentUser.id &&
        [ORDER_STATUS.ACCEPTED, ORDER_STATUS.PICKED_UP].includes(o.status)
    );

    // Simulated coordinates
    const [currentPos, setCurrentPos] = useState([28.6139, 77.2090]); // starting position (e.g. Delhi)
    const [destinationPos, setDestinationPos] = useState([28.7041, 77.1025]);

    // Simulated distance and location movement
    useEffect(() => {
        if (myActiveOrder && distance > 0) {
            const timer = setInterval(() => {
                setDistance(prev => Math.max(0, prev - 0.1));
                // simulated movement logic: move slightly closer to dest
                setCurrentPos(prev => {
                    const latDiff = (destinationPos[0] - prev[0]) * 0.1;
                    const lngDiff = (destinationPos[1] - prev[1]) * 0.1;
                    const newPos = [prev[0] + latDiff, prev[1] + lngDiff];

                    // Push to backend
                    api.patch('/drivers/location', { lat: newPos[0], lng: newPos[1] })
                        .catch(err => console.error("Could not update location", err));

                    return newPos;
                });
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [myActiveOrder, distance]);

    const acceptOrder = (orderId) => {
        updateOrderStatus(orderId, ORDER_STATUS.ACCEPTED, {
            driverId: currentUser._id || currentUser.id,
            driverName: currentUser.name
        });
        setDistance(2.4);
    };

    const pickUpOrder = () => {
        updateOrderStatus(myActiveOrder._id, ORDER_STATUS.PICKED_UP);
    };

    const deliverOrder = () => {
        updateOrderStatus(myActiveOrder._id, ORDER_STATUS.DELIVERED);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                        <Truck size={28} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('driver_control')}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('global_fleet_sync')} • {currentUser?.name || t('active_driver')}</span>
                        </div>
                    </div>
                </div>
                <Card className="border-none shadow-sm bg-white px-5 py-3 flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{t('todays_wallet')}</span>
                        <span className="text-xl font-black text-slate-900 tracking-tight">${earnings.today}</span>
                        <span className="text-[9px] font-bold text-slate-400">{earnings.deliveries} {t('trips_total')}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-100 mx-2" />
                    <Button size="sm" onClick={() => alert(`Wallet: $240.50 available.\nContact admin to process withdrawal.`)}>{t('withdraw')}</Button>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Job Pool */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-lg font-black text-slate-800">{t('available_flux')}</h3>
                        <Badge variant="outline" className="bg-white">{availableOrders.length} {t('new_jobs')}</Badge>
                    </div>

                    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                        {availableOrders.length === 0 ? (
                            <Card className="border-dashed bg-slate-50/50 py-12 text-center">
                                <Package size={40} className="text-slate-200 mx-auto mb-4" />
                                <p className="text-sm font-bold text-slate-400 italic">{t('scanning_spectrum')}</p>
                            </Card>
                        ) : (
                            availableOrders.map(order => (
                                <motion.div key={order._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <Card className="hover:border-primary/20 transition-all group overflow-hidden">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                                        <Package size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-slate-900 truncate">{t(order.packageType)} {t('shipment')}</h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <MapPin size={10} className="text-slate-400" />
                                                            <span className="text-[10px] text-slate-500 font-medium truncate">{order.destination?.address || order.destination}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge variant="blue" className="text-[8px] h-4">{t(order.status)}</Badge>
                                            </div>

                                            <div className="space-y-3 relative mb-4">
                                                <div className="absolute left-1.5 top-1.5 bottom-1.5 w-0.5 bg-slate-100 rounded-full" />
                                                <div className="flex items-center gap-3 pl-5 relative">
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white bg-blue-500" />
                                                    <p className="text-[11px] font-bold text-slate-600 truncate">{order.pickup?.address?.split(',')[0] || order.pickup}</p>
                                                </div>
                                                <div className="flex items-center gap-3 pl-5 relative">
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white bg-rose-500" />
                                                    <p className="text-[11px] font-bold text-slate-600 truncate">{order.destination?.address?.split(',')[0] || order.destination}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    <Clock size={12} />
                                                    <span className="text-[10px] font-bold">12 {t('mins_away')}</span>
                                                </div>
                                                <Button size="sm" className="h-8 text-[10px]" onClick={() => acceptOrder(order._id)}>{t('accept')}</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Mission Control / Navigation */}
                <div className="lg:col-span-2">
                    {myActiveOrder ? (
                        <Card className="overflow-hidden h-full flex flex-col min-h-[600px]">
                            <CardHeader className="bg-slate-900 text-white border-none p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-primary shadow-lg shadow-primary/20">
                                            <Navigation className="text-white animate-pulse" size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black">{t('mission_alignment')}</h4>
                                            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-1">
                                                {distance.toFixed(1)} km {t('to_target')} • {Math.round(distance * 2)} {t('minutes')}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="border-white/20 text-white bg-white/5 px-4 h-8 uppercase text-[10px]">
                                        {t(myActiveOrder.status)}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <div className="flex-1 min-h-[300px] relative z-0">
                                <MapContainer center={currentPos} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                    <Marker position={currentPos} icon={truckIcon}>
                                        <Popup>{t('current_fleet_post')}</Popup>
                                    </Marker>
                                    <Marker position={destinationPos}>
                                        <Popup>{t('mission_terminal')}</Popup>
                                    </Marker>
                                    <Polyline positions={[currentPos, destinationPos]} color="#2563EB" weight={3} dashArray="5, 10" />
                                </MapContainer>
                            </div>

                            <CardContent className="p-6 bg-white border-t">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center p-1">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${myActiveOrder.customerName}`} alt="Contact" className="w-full h-full rounded-xl" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('target_client')}</p>
                                            <h5 className="text-base font-black text-slate-900">{myActiveOrder.customerName || t('consignee')}</h5>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {myActiveOrder.status === ORDER_STATUS.ACCEPTED ? (
                                            <Button className="h-12 px-8 rounded-2xl bg-slate-900" onClick={pickUpOrder}>
                                                <Package size={18} className="mr-2" />
                                                {t('report_pickup')}
                                            </Button>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-2xl border border-emerald-100 h-12">
                                                    <CheckCircle2 size={18} />
                                                    <span className="text-xs font-black uppercase">{t('consignment_loaded')}</span>
                                                </div>
                                                <Button className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700" onClick={deliverOrder}>
                                                    {t('finalize_delivery')}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="h-full min-h-[600px] border-dashed bg-slate-50/50 flex flex-col items-center justify-center text-center p-12">
                            <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-sm flex items-center justify-center mb-8 border border-slate-100">
                                <Navigation className="text-slate-200" size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('spectral_surveillance')}</h3>
                            <p className="text-slate-500 mt-2 max-w-sm font-medium leading-relaxed">
                                {t('no_active_missions')}
                            </p>
                            <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-sm">
                                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Trips</p>
                                    <p className="text-2xl font-black text-slate-900">{earnings.deliveries}</p>
                                </div>
                                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
                                    <p className="text-2xl font-black text-slate-900">${earnings.total}</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverView;
