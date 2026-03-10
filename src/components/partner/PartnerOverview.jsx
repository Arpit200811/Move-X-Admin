import React, { useState } from 'react';
import { Activity, DollarSign, Package, ShieldCheck, Cpu, Globe, TrendingUp, ArrowUpRight, ArrowDownLeft, Truck, MapPin, Eye, MousePointer2, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

const storeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3176/3176363.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

const PartnerOverview = ({ orders, currentUser, driverLocations }) => {
    const { t } = useTranslation();

    // Calculate stats
    const partnerOrders = orders.filter(o => o.partnerId?.owner?._id === currentUser?._id || o.partnerId?.owner === currentUser?._id);
    const totalSales = partnerOrders.reduce((acc, current) => acc + (current.price || 0), 0);
    const activeDeliveries = partnerOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
    const completedDeliveries = partnerOrders.filter(o => o.status === 'DELIVERED').length;

    const stats = [
        { label: 'Active Orders', value: activeDeliveries, icon: <Activity />, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Total Revenue', value: `$${totalSales.toFixed(2)}`, icon: <DollarSign />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Service Score', value: '99.9%', icon: <ShieldCheck />, color: 'text-primary', bg: 'bg-primary/5' },
        { label: 'Total Completed', value: completedDeliveries, icon: <Package />, color: 'text-slate-500', bg: 'bg-slate-50' },
    ];

    return (
        <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-white shadow-2xl relative group cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-500">
                        <div className="absolute inset-0 bg-primary/20 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Activity size={32} className="text-primary z-10" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">{currentUser?.name || t('business_dashboard')}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex gap-1">
                                {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-emerald-500/30 rounded-full animate-pulse" style={{animationDelay: `${i*200}ms`}} />)}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Real-time Data Sync</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="px-5 py-3 border-r border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Status</p>
                        <p className="text-sm font-black text-emerald-500 italic uppercase">Secure Connection Active</p>
                    </div>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="rounded-[32px] border-slate-100 shadow-xl overflow-hidden group hover:border-primary/20 transition-all hover:scale-[1.02]">
                        <CardContent className="p-8 flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                                {React.cloneElement(stat.icon, { size: 24 })}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <h4 className="text-3xl font-black text-slate-900 mt-1 italic tracking-tighter">{stat.value}</h4>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Geolocation Visualizer */}
                <Card className="lg:col-span-2 rounded-[40px] border-slate-100 shadow-2xl overflow-hidden min-h-[500px] relative group">
                    <div className="absolute top-8 left-8 z-10 flex gap-2">
                        <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none px-4 py-2 text-[10px] font-black italic shadow-xl">LIVE TRACKING</Badge>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-4 py-2 text-[10px] font-black italic shadow-xl">{activeDeliveries} ORDERS IN FLOW</Badge>
                    </div>
                    <MapContainer 
                        center={[28.6139, 77.2090]} 
                        zoom={13} 
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                        scrollWheelZoom={false}
                    >
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        {/* Store Node */}
                        <Marker position={[28.6139, 77.2090]} icon={storeIcon}>
                            <Popup>
                                <div className="p-2 text-center">
                                    <p className="text-[10px] font-black text-primary uppercase">Store Location</p>
                                    <p className="text-xs font-bold italic">{currentUser?.name}</p>
                                </div>
                            </Popup>
                        </Marker>
                        <Circle center={[28.6139, 77.2090]} radius={2000} pathOptions={{ color: '#2563EB', fillColor: '#2563eb', fillOpacity: 0.05, weight: 1, dashArray: '5, 5' }} />

                        {partnerOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').map(order => (
                            <React.Fragment key={order._id}>
                                {order.pickupCoords && (
                                    <Marker position={[order.pickupCoords.lat, order.pickupCoords.lng]}>
                                        <Popup>
                                            <div className="p-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    <p className="text-[10px] font-black uppercase text-primary">Pickup Location</p>
                                                </div>
                                                <p className="text-xs font-bold italic">#{order.orderId?.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}
                                {order.driverId && driverLocations[order.driverId._id] && (
                                    <Marker position={[driverLocations[order.driverId._id].lat, driverLocations[order.driverId._id].lng]} icon={truckIcon}>
                                        <Popup>
                                            <div className="p-2 text-center">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest italic text-emerald-600">Active Driver</p>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700 italic">{order.driverId.name}</p>
                                                <p className="text-[9px] font-black text-slate-400 mt-1 uppercase">ESTIMATED ARRIVAL: --:--</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}
                            </React.Fragment>
                        ))}
                    </MapContainer>
                    
                    {/* Floating Controls */}
                    <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-3">
                         <Button variant="secondary" size="icon" className="w-12 h-12 rounded-2xl bg-white shadow-2xl transition-all hover:scale-110 active:scale-90">
                             <Globe size={20} />
                         </Button>
                         <Button variant="secondary" size="icon" className="w-12 h-12 rounded-2xl bg-white shadow-2xl transition-all hover:scale-110 active:scale-90">
                             <MousePointer2 size={20} />
                         </Button>
                    </div>
                </Card>

                {/* Performance HUD (Sidebar) */}
                <div className="space-y-8">
                    <Card className="rounded-[40px] border-none bg-slate-900 shadow-2xl overflow-hidden p-8 text-white relative group h-full flex flex-col justify-between">
                         <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full -ml-16 -mb-16 blur-3xl opacity-50" />
                         
                         <div className="space-y-8">
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                         <TrendingUp size={20} />
                                     </div>
                                     <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">Business Intelligence</p>
                                 </div>

                             <div className="space-y-10">
                                 <div>
                                     <div className="flex justify-between items-end mb-3">
                                         <p className="text-[10px] font-black text-white uppercase tracking-widest opacity-40">Growth Velocity</p>
                                         <span className="text-[10px] font-black text-primary italic">+12.5%</span>
                                     </div>
                                     <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                         <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1 }} className="h-full bg-primary shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                                     </div>
                                 </div>

                                 <div>
                                     <div className="flex justify-between items-end mb-3">
                                         <p className="text-[10px] font-black text-white uppercase tracking-widest opacity-40">Store Rating</p>
                                         <span className="text-[10px] font-black text-emerald-500 italic">4.9/5.0</span>
                                     </div>
                                     <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                         <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                     </div>
                                 </div>
                             </div>
                         </div>

                         <div className="pt-10 space-y-4">
                             <Button className="w-full h-14 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] italic shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02]">
                                 Mission Timeline
                             </Button>
                             <div className="flex gap-4">
                                 <Button variant="outline" className="flex-1 h-12 border-white/10 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white/5 italic">
                                     Export Report
                                 </Button>
                                 <Button variant="outline" className="flex-1 h-12 border-white/10 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white/5 italic">
                                     Analytics
                                 </Button>
                             </div>
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PartnerOverview;
