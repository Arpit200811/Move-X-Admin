import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Package,
    DollarSign,
    LogOut,
    Bell,
    ChevronLeft,
    Menu,
    Globe,
    Settings,
    RefreshCw,
    Megaphone,
    BarChart3,
    Star,
    Clock,
    Zap
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/DropdownMenu';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

// High-Level Operational Hubs
import PartnerOverview from '../components/partner/PartnerOverview';
import PartnerOrderHub from '../components/partner/PartnerOrderHub';
import PartnerCatalogHub from '../components/partner/PartnerCatalogHub';
import PartnerFinanceHub from '../components/partner/PartnerFinanceHub';
import PartnerStoreSettings from '../components/partner/PartnerStoreSettings';
import PartnerPromotionsHub from '../components/partner/PartnerPromotionsHub';
import PartnerInsightsHub from '../components/partner/PartnerInsightsHub';
import PartnerReviewsHub from '../components/partner/PartnerReviewsHub';
import PartnerAdvancedHub from '../components/partner/PartnerAdvancedHub';
import api from '../services/api';
import { io } from 'socket.io-client';

const PartnerDashboard = () => {
    const { t, i18n } = useTranslation();
    const { currentUser, logoutUser, orders } = useOrders();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const [showNotifPanel, setShowNotifPanel] = useState(false);

    const menuItems = [
        { icon: <LayoutDashboard size={18} />, label: t('business_overview', 'Business Overview'), id: 'Overview' },
        { icon: <Package size={18} />, label: t('order_history', 'Order History'), id: 'Orders' },
        { icon: <Menu size={18} />, label: t('menu_management', 'Menu Management'), id: 'Catalog' },
        { icon: <Megaphone size={18} />, label: t('promotions', 'Promotions & Ads'), id: 'Promotions' },
        { icon: <BarChart3 size={18} />, label: t('insights', 'Insights & Reports'), id: 'Insights' },
        { icon: <Star size={18} />, label: t('reviews', 'Ratings & Reviews'), id: 'Reviews' },
        { icon: <Zap size={18} />, label: t('advanced_ops', 'Advanced Ops'), id: 'Advanced' },
        { icon: <DollarSign size={18} />, label: t('payout_center', 'Payout Center'), id: 'Payments' },
        { icon: <Settings size={18} />, label: t('store_settings', 'Store Settings'), id: 'Settings' },
    ];

    const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
    const [autoAccept, setAutoAccept] = useState(false);
    const [ledger, setLedger] = useState([]);
    const [catalogItems, setCatalogItems] = useState([]);
    const [driverLocations, setDriverLocations] = useState({});
    const [isRequestingPayout, setIsRequestingPayout] = useState(false);

    useEffect(() => {
        if (currentUser?.partner) {
            setIsAcceptingOrders(currentUser.partner.isAcceptingOrders);
            setAutoAccept(currentUser.partner.autoAccept);
        }
        
        const fetchEssentialData = async () => {
            // Use individual catches so one 403/404 doesn't block everything
            const [prodRes, ledgerRes] = await Promise.allSettled([
                api.get('/vendors/my-products'),
                api.get('/wallet/transactions')
            ]);

            if (prodRes.status === 'fulfilled') {
                setCatalogItems(prodRes.value.data.products || []);
            } else {
                console.warn('[SYNC] Products fetch failed:', prodRes.reason?.response?.status, prodRes.reason?.message);
                setCatalogItems([]);
            }

            if (ledgerRes.status === 'fulfilled') {
                setLedger(ledgerRes.value.data.transactions || []);
            } else {
                console.warn('[SYNC] Wallet fetch failed:', ledgerRes.reason?.response?.status, '- partner may not have wallet access yet');
                setLedger([]);
            }
        };
        fetchEssentialData();
        
        // Live Telemetry Sync
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://move-x-backend.onrender.com');
        socket.on('driver_location_updated', (data) => {
            setDriverLocations(prev => ({
                ...prev,
                [data.driverId]: { lat: data.lat, lng: data.lng }
            }));
        });

        return () => socket.disconnect();
    }, [currentUser]);

    const handleAcceptOrder = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/merchant-accept`);
            // Status will update via global state in OrderContext
        } catch (e) { console.error('[ERROR] Failed to accept order.'); }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status });
        } catch (e) { console.error('[ERROR] Failed to update order status.'); }
    };

    const handleToggleSetting = async (key, value) => {
        try {
            if (key === 'isAcceptingOrders') setIsAcceptingOrders(value);
            if (key === 'autoAccept') setAutoAccept(value);
            await api.put('/partners/settings', { [key]: value });
        } catch (e) { console.error('[ERROR] Failed to update settings.'); }
    };

    const handleAddProduct = async (itemData) => {
        try {
            const res = await api.post('/vendors/products', itemData);
            setCatalogItems(prev => [...prev, res.data.product]);
        } catch (e) { alert('Failed to add product.'); }
    };

    const handleUpdateProduct = async (id, updates) => {
        try {
            const res = await api.put(`/vendors/products/${id}`, updates);
            setCatalogItems(prev => prev.map(item => item._id === id ? res.data.product : item));
        } catch (e) { alert('Failed to update product.'); }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to purge this merchandise node?')) return;
        try {
            await api.delete(`/vendors/products/${id}`);
            setCatalogItems(prev => prev.filter(i => i._id !== id));
        } catch (e) { alert('Failed to remove product.'); }
    };

    const handleWithdrawal = async (amount) => {
        try {
            setIsRequestingPayout(true);
            const res = await api.post('/wallet/payout-request', { amount: parseFloat(amount) });
            alert(res.data.message);
            // Re-fetch ledger
            const ledgerRes = await api.get('/financial/transactions');
            setLedger(ledgerRes.data.transactions || []);
        } catch (e) { alert(e.response?.data?.message || 'Payout request failed.'); }
        finally { setIsRequestingPayout(false); }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview': return <PartnerOverview orders={orders} currentUser={currentUser} driverLocations={driverLocations} />;
            case 'Orders': return <PartnerOrderHub orders={orders.filter(o => o.partnerId?._id === currentUser?.partner?._id || o.partnerId === currentUser?.partner?._id)} onAccept={handleAcceptOrder} updateOrderStatus={handleUpdateOrderStatus} />;
            case 'Catalog': return <PartnerCatalogHub catalogItems={catalogItems} onAdd={handleAddProduct} onDelete={handleDeleteProduct} onUpdate={handleUpdateProduct} />;
            case 'Promotions': return <PartnerPromotionsHub />;
            case 'Insights': return <PartnerInsightsHub />;
            case 'Reviews': return <PartnerReviewsHub currentUser={currentUser} />;
            case 'Advanced': return <PartnerAdvancedHub orders={orders} catalogItems={catalogItems} partnerCategory={currentUser?.partner?.category} />;
            case 'Payments': return <PartnerFinanceHub ledger={ledger} walletBalance={currentUser?.walletBalance} onWithdraw={handleWithdrawal} isRequestingPayout={isRequestingPayout} />;
            case 'Settings': return <PartnerStoreSettings partner={currentUser?.partner} isAcceptingOrders={isAcceptingOrders} autoAccept={autoAccept} onToggleSetting={handleToggleSetting} />;
            default: return <PartnerOverview orders={orders} currentUser={currentUser} driverLocations={driverLocations} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-outfit text-slate-900 overflow-hidden relative">
            
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 z-100 bg-slate-950/40 backdrop-blur-md md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Main Sidebar */}
            <aside
                className={`
                    fixed md:relative z-110 h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-500 ease-in-out
                    ${sidebarCollapsed ? 'w-20' : 'w-72'}
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="h-20 flex items-center px-6 shrink-0 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                            <Globe size={22} strokeWidth={2.5} />
                        </div>
                        {!sidebarCollapsed && (
                            <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">MoveX<span className="text-primary tracking-widest text-xs ml-1 not-italic">PARTNER</span></span>
                        )}
                    </div>
                </div>

                <div className="flex-1 px-4 mt-6 overflow-y-auto space-y-1 scrollbar-hide">
                    <p className={`text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4 px-3 ${sidebarCollapsed ? 'sr-only' : ''}`}>
                        {t('store_management', 'Store Management')}
                    </p>
                    
                    {menuItems.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                            className={`
                                w-full group flex items-center px-4 py-4 rounded-2xl transition-all duration-300
                                ${activeTab === item.id 
                                    ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }
                            `}
                        >
                            <span className={`shrink-0 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {item.icon}
                            </span>
                            {!sidebarCollapsed && (
                                <span className={`ml-3.5 text-sm font-extrabold tracking-tight ${activeTab === item.id ? 'opacity-100' : 'opacity-80'}`}>
                                    {item.label}
                                </span>
                            )}
                            {activeTab === item.id && !sidebarCollapsed && (
                                <motion.div layoutId="sidebar-dot-partner" className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-4 mt-auto border-t border-slate-50/50">
                    <Button
                        variant="ghost"
                        onClick={logoutUser}
                        className="w-full h-12 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-2xl justify-start font-bold uppercase text-[10px] tracking-widest px-4"
                    >
                        <LogOut size={18} className="mr-3" />
                        {!sidebarCollapsed && 'Logout'}
                    </Button>
                </div>
            </aside>

            {/* Main Content Viewport */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Global Header */}
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-50 sticky top-0 transition-colors">
                    <div className="flex items-center gap-4">
                        <button 
                            className="md:hidden p-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 shadow-sm active:scale-95 transition-all" 
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                        
                        <div className="md:hidden">
                            <span className="text-xl font-black text-slate-900 tracking-tighter italic">MoveX<span className="text-primary tracking-widest text-[8px] ml-1 not-italic">PARTNER</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 pr-4 border-r border-slate-100">
                            {/* Language Node */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="h-10 px-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl flex items-center gap-2 transition-all group active:scale-95 shadow-xs">
                                        <Globe size={16} className="text-primary group-hover:rotate-12 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{i18n.language?.slice(0, 2) || 'en'}</span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-2xl">
                                    {[
                                        ['en', 'English'], ['hi', 'हिन्दी', '🇮🇳']
                                    ].map(([code, label, flag]) => (
                                        <DropdownMenuItem 
                                            key={code} 
                                            onClick={() => i18n.changeLanguage(code)}
                                            className="h-11 rounded-xl mb-1 last:mb-0 hover:bg-slate-50"
                                        >
                                            <span className="text-[10px] font-black mr-3 text-slate-400 w-6 uppercase">{code}</span>
                                            <span className="text-sm font-bold text-slate-700">{label}</span>
                                            <span className="ml-auto text-base">{flag}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Profiling Node */}
                        <div className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-2xl hover:bg-slate-50 transition-all active:scale-95">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-extrabold text-slate-900 truncate max-w-[120px] group-hover:text-primary transition-colors">{currentUser?.name}</p>
                                <p className="text-[9px] font-black text-primary uppercase tracking-widest opacity-80">{t(currentUser?.role)} Hub</p>
                            </div>
                            <div className="relative">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/png?seed=${currentUser?.name}`}
                                    className="w-11 h-11 rounded-2xl bg-white border-2 border-white shadow-md shadow-slate-200 group-hover:scale-105 transition-transform"
                                    alt="User"
                                />
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                            </div>
                        </div>

                        {/* Sidebar Collapse Toggle */}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="hidden md:flex w-10 h-10 rounded-xl hover:bg-slate-50 items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90"
                        >
                            <ChevronLeft className={`${sidebarCollapsed ? 'rotate-180' : ''} transition-transform duration-500`} size={20} />
                        </button>
                    </div>
                </header>

                {/* Content Area Rendering */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                    <div className="p-4 md:p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 15, scale: 0.99 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -15, scale: 1.01 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PartnerDashboard;
