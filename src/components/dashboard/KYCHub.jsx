import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    FileText,
    CheckCircle2,
    XCircle,
    Eye,
    Search,
    Filter,
    Truck,
    BadgeCheck,
    AlertCircle,
    UserCircle,
    Download,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';
import { useOrders } from '../../context/OrderContext';
import { useTranslation } from 'react-i18next';

export default function KYCHub() {
    const { t } = useTranslation();
    const { users, refreshData } = useOrders();
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        refreshData();
    }, []);

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        await refreshData();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const pendingReview = users ? users.filter(u => u.role === 'driver' && u.status === 'pending') : [];

    const handleAction = async (driverId, action) => {
        setLoading(true);
        try {
            await api.patch(`/auth/drivers/${driverId}/approve`, { action });
            await refreshData();
            setSelectedRequest(null);
        } catch (err) {
            console.error("Verification decision failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-24 px-1 md:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{t('kyc_terminal')}</h2>
                    </div>
                    <p className="text-slate-500 font-medium text-sm ml-1">{t('review_credentials')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleManualRefresh}
                        className="h-9 w-9 p-0 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 shadow-xs"
                    >
                        <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin text-primary' : 'text-slate-400'}`} />
                    </Button>
                    <Badge variant="outline" className="w-fit h-9 border-slate-200 bg-white text-slate-600 font-bold px-4 rounded-xl shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-2" />
                        {pendingReview.length} {t('pending_vanguard')}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List of Applications */}
                <Card className={`lg:col-span-1 border-none shadow-sm flex flex-col bg-white overflow-hidden ${selectedRequest ? 'hidden lg:flex' : 'flex'}`}>
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                        <div className="flex items-center justify-between">
                             <CardTitle className="text-xs font-bold uppercase text-slate-400 tracking-widest">{t('active_queue')}</CardTitle>
                             <Filter size={14} className="text-slate-300" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto max-h-[500px] lg:max-h-[600px] scrollbar-hide flex-1">
                        {pendingReview.length === 0 ? (
                            <div className="py-24 flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-4xl flex items-center justify-center mb-6 border border-slate-100 italic">
                                     <BadgeCheck size={40} className="text-slate-200" />
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('backlog_clear')}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {pendingReview.map(request => (
                                    <div
                                        key={request._id}
                                        onClick={() => setSelectedRequest(request)}
                                        className={`p-5 cursor-pointer transition-all hover:bg-slate-50/80 group ${selectedRequest?._id === request._id ? 'bg-primary/5 border-l-4 border-primary shadow-inner' : 'bg-white'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/png?seed=${request.name}`} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-slate-900 truncate leading-tight">{request.name}</h4>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                     <Badge variant="outline" className="text-[8px] px-1.5 bg-slate-50 border-none font-bold text-slate-400">
                                                         {request.vehicle || t('unit')}
                                                     </Badge>
                                                     <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                                         {new Date(request.createdAt).toLocaleDateString()}
                                                     </span>
                                                </div>
                                            </div>
                                            <Search size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Detail View */}
                <Card className={`lg:col-span-2 border-none shadow-sm min-h-[500px] flex flex-col bg-white overflow-hidden relative ${!selectedRequest ? 'hidden lg:flex' : 'flex'}`}>
                    {selectedRequest && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedRequest(null)}
                            className="lg:hidden absolute top-4 left-4 z-20 bg-white/80 backdrop-blur-md rounded-lg shadow-sm font-bold text-[10px] uppercase tracking-widest border border-slate-200"
                        >
                             ← {t('back_to_queue')}
                        </Button>
                    )}
                    
                    <AnimatePresence mode="wait">
                        {!selectedRequest ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                            >
                                <div className="w-24 h-24 bg-slate-50 rounded-4xl flex items-center justify-center mb-8 border border-slate-100 shadow-xs italic">
                                    <FileText size={48} className="text-slate-200" />
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight italic uppercase">{t('selection_required')}</h3>
                                <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto mt-2 leading-relaxed">{t('terminal_idle_desc')}</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={selectedRequest._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex-1 flex flex-col"
                            >
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 md:p-8 pt-16 lg:pt-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-20 h-20 rounded-3xl bg-white shadow-md flex items-center justify-center border-4 border-white overflow-hidden group hover:scale-105 transition-transform">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/png?seed=${selectedRequest.name}`} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <CardTitle className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight italic uppercase truncate">{selectedRequest.name}</CardTitle>
                                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                                    <Badge variant="warning" className="text-[9px] uppercase font-bold tracking-wider px-2 border-none shadow-xs">
                                                        {t('review_pending')}
                                                    </Badge>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 prose-sm">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                        ID: {selectedRequest._id.slice(-6).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <Button variant="outline" className="flex-1 md:flex-none h-11 border-slate-200 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-white shadow-xs">
                                                <Download size={14} className="mr-2" /> {t('export_dossier')}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="p-6 md:p-8 space-y-10 flex-1 overflow-y-auto scrollbar-hide">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                                        {/* Technical Profile */}
                                        <div className="space-y-6">
                                            <h5 className="text-[10px] font-extrabold text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                                                 {t('technical_profile')}
                                                 <div className="h-px bg-primary/10 flex-1" />
                                            </h5>
                                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                                                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-colors">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('fleet_rank')}</p>
                                                    <p className="text-sm font-extrabold text-slate-900">{selectedRequest.serviceClass || t('Regular')}</p>
                                                </div>
                                                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-colors">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('comm_channel')}</p>
                                                    <p className="text-sm font-extrabold text-slate-900">{selectedRequest.phone}</p>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50/80 p-6 rounded-3xl border border-slate-100 relative group hover:border-primary/20 transition-colors">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                                        <Truck size={28} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <h6 className="text-base font-extrabold text-slate-900 uppercase italic leading-tight">{selectedRequest.vehicle || t('standard_unit')}</h6>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5 flex items-center gap-1.5">
                                                            <RefreshCw size={10} className="animate-spin-slow" />
                                                            {t('plate_calibration_pending')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Verification Nodes */}
                                        <div className="space-y-6">
                                            <h5 className="text-[10px] font-extrabold text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                                                 {t('verification_nodes')}
                                                 <div className="h-px bg-primary/10 flex-1" />
                                            </h5>
                                            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                                                {[
                                                    { label: t('license'), img: selectedRequest.kycLicenseUrl, status: t('verified_hash'), statusColor: 'bg-emerald-50 text-emerald-600' },
                                                    { label: t('bio_id'), img: selectedRequest.kycIdUrl, status: t('scan_required'), statusColor: 'bg-amber-50 text-amber-500' }
                                                ].map((doc, i) => (
                                                    <div key={i} className="group relative bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 transition-all hover:shadow-lg hover:-translate-y-1">
                                                        <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-md absolute bottom-0 inset-x-0 z-10 border-t border-white/20">
                                                            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{doc.label}</span>
                                                            <Badge className={`text-[8px] font-bold uppercase border-none px-2 py-0.5 ${doc.statusColor}`}>{doc.status}</Badge>
                                                        </div>
                                                        <img 
                                                           src={doc.img || `https://images.unsplash.com/photo-1554224155-1697235f055a?q=80&w=400&auto=format&fit=crop`} 
                                                           className="w-full h-36 object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors z-0" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Safety Protocol */}
                                    <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-3xl group hover:bg-rose-50 transition-colors">
                                        <div className="flex gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm shrink-0 border border-rose-100 group-hover:scale-110 transition-transform">
                                                <AlertCircle size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-extrabold text-rose-900 uppercase tracking-widest mb-1.5 italic">{t('protocol_safety_warning')}</p>
                                                <p className="text-[12px] font-medium text-rose-700/80 leading-relaxed md:max-w-2xl">
                                                    {t('safety_desc')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                
                                <div className="p-6 md:p-8 bg-slate-50/80 border-t border-slate-100 flex gap-4 mt-auto">
                                    <Button
                                        disabled={loading}
                                        onClick={() => handleAction(selectedRequest._id, 'approve')}
                                        className="flex-1 h-14 bg-primary hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-primary/20 text-[11px] font-extrabold uppercase tracking-[0.2em] italic transition-all active:scale-95"
                                    >
                                        {loading ? <RefreshCw className="animate-spin mr-2" /> : <BadgeCheck className="mr-2" size={18} />}
                                        {t('authorize_deployment')}
                                    </Button>
                                    <Button
                                        disabled={loading}
                                        onClick={() => handleAction(selectedRequest._id, 'reject')}
                                        variant="outline"
                                        className="w-14 h-14 border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 rounded-2xl transition-all active:scale-95 shadow-xs"
                                    >
                                        <XCircle size={22} />
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
}
