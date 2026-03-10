import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { Truck, X, MapPin, Clock, Zap, Activity, ShieldCheck, UserPlus, Search, MoreHorizontal, Phone, Info, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTranslation } from 'react-i18next';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const activeTruckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function DriversManagement({ searchQuery = '' }) {
    const { t } = useTranslation();
    const { users, refreshData } = useOrders();
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', vehicle: '' });
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'pending'

    const allActiveDrivers = users.filter(user => user.role === 'driver' && user.status !== 'pending' && user.status !== 'rejected');
    const pendingDrivers = users.filter(user => user.role === 'driver' && user.status === 'pending');

    const q = searchQuery.toLowerCase().trim();
    const drivers = q
        ? allActiveDrivers.filter(d =>
            d.name?.toLowerCase().includes(q) ||
            d.phone?.toLowerCase().includes(q) ||
            d.vehicle?.toLowerCase().includes(q) ||
            d.status?.toLowerCase().includes(q)
        )
        : allActiveDrivers;

    const handleApprove = async (driverId) => {
        const driver = pendingDrivers.find(d => d._id === driverId);
        if (!window.confirm(`✅ ${t('confirm_approve')} ${driver?.name}?`)) return;

        try {
            await api.patch(`/auth/drivers/${driverId}/approve`, { action: 'approve' });
            refreshData();
        } catch (err) {
            alert('Approval Failed');
        }
    };

    const handleReject = async (driverId) => {
        const driver = pendingDrivers.find(d => d._id === driverId);
        if (!window.confirm(`🚨 ${t('confirm_reject')} ${driver?.name}?`)) return;

        try {
            await api.patch(`/auth/drivers/${driverId}/approve`, { action: 'reject' });
            refreshData();
        } catch (err) {
            alert(t('error'));
        }
    };

    const handleOnboardSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { ...formData, role: 'driver' });
            setShowOnboardModal(false);
            setFormData({ name: '', phone: '', vehicle: '' });
            refreshData();
        } catch (err) {
            alert(t('error'));
        }
    };

    return (
        <div className="space-y-6 pb-20 px-1 md:px-0">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{t('fleet_ops')}</h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">{t('manage_fleet_desc')}</p>
                </div>
                <div className="flex flex-col xs:flex-row items-center gap-3">
                    <div className="flex w-full xs:w-auto bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                        <Button
                            variant={activeTab === 'active' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('active')}
                            className={`flex-1 xs:flex-none text-[10px] font-bold uppercase transition-all ${activeTab === 'active' ? 'shadow-sm' : ''}`}
                        >
                            {t('active_fleet')}
                        </Button>
                        <Button
                            variant={activeTab === 'pending' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('pending')}
                            className={`flex-1 xs:flex-none text-[10px] font-bold uppercase transition-all relative ${activeTab === 'pending' ? 'shadow-sm' : ''}`}
                        >
                            {t('pending_apps')}
                            {pendingDrivers.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                                    {pendingDrivers.length}
                                </span>
                            )}
                        </Button>
                    </div>
                    <Button onClick={() => setShowOnboardModal(true)} className="w-full xs:w-auto rounded-xl shadow-lg shadow-primary/20">
                        <UserPlus size={16} className="mr-2" />
                        <span className="font-bold">{t('induction')}</span>
                    </Button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'active' ? (
                    <motion.div
                        key="active-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { label: t('units_online'), value: drivers.filter(d => d.isOnline).length, icon: <Activity />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: t('active_missions'), value: drivers.filter(d => d.status === 'busy').length, icon: <Zap />, color: 'text-amber-600', bg: 'bg-amber-50' },
                                { label: t('standby_units'), value: drivers.filter(d => !d.isOnline).length, icon: <Clock />, color: 'text-slate-400', bg: 'bg-slate-50' },
                                { label: t('total_fleet'), value: drivers.length, icon: <Truck />, color: 'text-primary', bg: 'bg-blue-50' },
                            ].map((stat, i) => (
                                <Card key={i} className="border-none shadow-sm group hover:shadow-md transition-shadow">
                                    <CardContent className="p-5 flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                            {React.cloneElement(stat.icon, { size: 22 })}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                                            <h4 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">{stat.value}</h4>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Live Map Radar */}
                            <Card className="lg:col-span-2 overflow-hidden h-[400px] md:h-[500px] border-none shadow-sm group">
                                <div className="absolute top-4 left-4 right-4 z-40">
                                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-extrabold text-slate-900">{t('tracking_radar')}</h3>
                                            <p className="text-[10px] font-medium text-slate-500">{t('telemetry_desc')}</p>
                                        </div>
                                        <Badge variant="outline" className="animate-pulse bg-emerald-50 text-emerald-600 border-none font-bold text-[10px]">
                                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                                             {t('live_sync')}
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-0 h-full relative z-0">
                                    <MapContainer center={[28.6139, 77.2090]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                        {drivers.filter(d => d.lat != null && d.lng != null).map(d => (
                                            <Marker key={d._id} position={[parseFloat(d.lat), parseFloat(d.lng)]} icon={activeTruckIcon}>
                                                <Popup>
                                                    <div className="p-2 min-w-[120px]">
                                                        <p className="font-bold text-slate-900 text-sm">{d.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1.5">
                                                            <Truck size={10} /> {d.vehicle}
                                                        </p>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                </CardContent>
                            </Card>

                            {/* Driver List Feed */}
                            <Card className="h-[400px] md:h-[500px] flex flex-col border-none shadow-sm bg-white">
                                <CardHeader className="border-b border-slate-100 p-5 pb-4">
                                    <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-slate-400">{t('directory')}</CardTitle>
                                    <div className="relative mt-3 group">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={14} />
                                        <Input className="pl-10 h-10 border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white transition-all shadow-none" placeholder={t('filter_units')} />
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-hide">
                                    <div className="divide-y divide-slate-50">
                                        {drivers.map((driver) => (
                                            <div key={driver._id} className="p-4 hover:bg-slate-50/80 transition-all cursor-pointer group relative overflow-hidden">
                                                <div className="flex items-center gap-3 relative z-10">
                                                    <div className="relative">
                                                        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/png?seed=${driver.name}`} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-white ${driver.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 truncate leading-tight">{driver.name}</p>
                                                        <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-tight mt-0.5">{driver.vehicle || t('no_asset')}</p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="group-hover:bg-white h-9 w-9 text-slate-400 rounded-xl hover:text-slate-900 transition-colors">
                                                        <MoreHorizontal size={16} />
                                                    </Button>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between relative z-10">
                                                    <Badge variant={driver.status === 'available' ? 'success' : 'warning'} className="text-[9px] font-bold px-2 py-0.5 uppercase border-none tracking-wider">
                                                        {t(driver.status)}
                                                    </Badge>
                                                    <span className="text-[10px] font-bold text-primary group-hover:underline underline-offset-4 decoration-2">{t('telemetry')}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {drivers.length === 0 && (
                                            <div className="py-20 text-center">
                                                <p className="text-xs font-bold text-slate-400 italic">{t('no_units_found')}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="pending-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {pendingDrivers.length === 0 ? (
                            <div className="col-span-full py-24 text-center flex flex-col items-center justify-center bg-white rounded-4xl border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-slate-50 rounded-4xl flex items-center justify-center mb-6 border border-slate-100">
                                    <ShieldCheck size={40} className="text-slate-200" />
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{t('radar_clean')}</h3>
                                <p className="text-slate-400 text-sm font-medium mt-1">{t('backlog_processed')}</p>
                            </div>
                        ) : (
                            pendingDrivers.map(driver => (
                                <Card key={driver._id} className="group border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                                    <CardHeader className="bg-slate-50/50 p-6 flex flex-row items-center gap-5 border-b border-slate-100">
                                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 p-1">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/png?seed=${driver.name}`} className="w-full h-full object-cover rounded-xl" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg font-extrabold text-slate-900 truncate leading-tight">{driver.name}</CardTitle>
                                            <Badge className="mt-1.5 font-bold text-[10px] uppercase bg-primary/10 text-primary border-none">{t('app_pending')}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('telemetry')}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-900">
                                                    <Smartphone size={14} className="text-primary" />
                                                    <span className="font-bold">{driver.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('asset')}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-900 uppercase">
                                                    <Truck size={14} className="text-primary" />
                                                    <span className="font-bold truncate">{driver.vehicle || 'PENDING'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <Button onClick={() => handleApprove(driver._id)} size="sm" className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 text-white border-none font-bold rounded-xl h-11">
                                                {t('authorize')}
                                            </Button>
                                            <Button onClick={() => handleReject(driver._id)} size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50 font-bold rounded-xl h-11">
                                                {t('discard')}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                            ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Onboard Modal */}
            <AnimatePresence>
                {showOnboardModal && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                        <UserPlus size={24} />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setShowOnboardModal(false)}>
                                        <X size={20} />
                                    </Button>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('manual_induction')}</h3>
                                <p className="text-slate-500 font-medium mb-8">{t('register_node_desc')}</p>

                                <form className="space-y-4" onSubmit={handleOnboardSubmit}>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{t('full_name')}</label>
                                        <Input required placeholder="Ex: John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{t('phone_number')}</label>
                                        <Input required placeholder="+1 234 567 890" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{t('vehicle_type')}</label>
                                        <Input required placeholder="Ex: Honda Civic" value={formData.vehicle} onChange={e => setFormData({ ...formData, vehicle: e.target.value })} />
                                    </div>
                                    <Button type="submit" className="w-full h-14 rounded-2xl mt-4 font-black uppercase tracking-widest italic">
                                        {t('finalize_reg')}
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Re-using Lucide Icon for Mobile (Smartphone)
// Removed Smartphone factory as it is now imported directly
