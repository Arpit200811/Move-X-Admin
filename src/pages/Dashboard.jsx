import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Truck,
    Users,
    Package,
    Activity,
    ShieldCheck,
    LogOut,
    Bell,
    ChevronLeft,
    ChevronDown,
    Search,
    Globe,
    Settings,
    BarChart3,
    FileText,
    PieChart,
    Menu,
    X,
    Ticket,
    Megaphone,
    MessageSquare,
    Zap,
    RefreshCw
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/DropdownMenu';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

// Admin Nodes
import DashboardOverview from '../components/dashboard/DashboardOverview';
import OrdersManagement from '../components/dashboard/OrdersManagement';
import DriversManagement from '../components/dashboard/DriversManagement';
import PartnersPage from '../components/dashboard/PartnersPage';
import KYCHub from '../components/dashboard/KYCHub';
import InfrastructureHUD from '../components/dashboard/InfrastructureHUD';
import ReportsHub from '../components/dashboard/ReportsHub';
import FinanceManagement from '../components/dashboard/FinanceManagement';
import TicketingHub from '../components/dashboard/TicketingHub';
import UserManagement from '../components/dashboard/UserManagement';
import SupportDesk from '../components/dashboard/SupportDesk';
import MarketingHub from '../components/dashboard/MarketingHub';
import PlatformSettings from '../components/dashboard/PlatformSettings';
import TranslationHub from '../components/dashboard/TranslationHub';
import ZoneManagement from '../components/dashboard/ZoneManagement';
import AuditLogs from '../components/dashboard/AuditLogs';
import BannerManagement from '../components/dashboard/BannerManagement';
import RefundHub from '../components/dashboard/RefundHub';
import CatalogHub from '../components/dashboard/CatalogHub';
import FleetHub from '../components/dashboard/FleetHub';
import SurgeHub from '../components/dashboard/SurgeHub';

const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const { currentUser, logoutUser } = useOrders();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const adminMenu = [
        { id: 'Overview', icon: <LayoutDashboard size={18} />, label: t('admin_overview', 'Intelligence Hub') },
        { id: 'Users', icon: <Users size={18} />, label: t('user_control', 'User Control') },
        { id: 'Orders', icon: <Package size={18} />, label: t('active_missions', 'Active Missions') },
        { id: 'Drivers', icon: <Truck size={18} />, label: t('fleet_tracking', 'Fleet Tracking') },
        { id: 'KYC', icon: <ShieldCheck size={18} />, label: t('kyc_validation', 'KYC Validation'), badge: '12' },
        { id: 'Ticketing', icon: <Ticket size={18} />, label: t('ticketing_hub', 'Ticketing Hub') },
        { id: 'Finance', icon: <PieChart size={18} />, label: t('global_finance', 'Global Finance') },
        { id: 'Marketing', icon: <Megaphone size={18} />, label: t('marketing_hub', 'Marketing Hub') },
        { id: 'Support', icon: <MessageSquare size={18} />, label: t('support_desk', 'Support Desk'), badge: '3' },
        { id: 'HUD', icon: <Activity size={18} />, label: t('infra_hud', 'Infrastructure HUD') },
        { id: 'Zones', icon: <Globe size={18} />, label: t('zone_management', 'Zone Management') },
        { id: 'Catalog', icon: <Package size={18} />, label: t('catalog_hub', 'Catalog Matrix') },
        { id: 'Fleet', icon: <Truck size={18} />, label: t('fleet_dynamics', 'Fleet Dynamics') },
        { id: 'Surge', icon: <Zap size={18} />, label: t('surge_protocol', 'Surge Protocol') },
        { id: 'Banners', icon: <Menu size={18} />, label: t('banner_management', 'Banners') },
        { id: 'Refunds', icon: <RefreshCw size={18} />, label: t('refund_hub', 'Refunds') },
        { id: 'Translations', icon: <Globe size={18} />, label: t('translation_hub', 'Translation Hub') },
        { id: 'AuditLogs', icon: <Activity size={18} />, label: t('audit_trail', 'Audit Trail') },
        { id: 'Settings', icon: <Settings size={18} />, label: t('platform_settings', 'Platform Settings') },
        { id: 'Reports', icon: <FileText size={18} />, label: t('audit_reports', 'Audit Reports') },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview': return <DashboardOverview />;
            case 'Users': return <UserManagement />;
            case 'Orders': return <OrdersManagement />;
            case 'Drivers': return <DriversManagement />;
            case 'Partners': return <PartnersPage />;
            case 'KYC': return <KYCHub />;
            case 'Ticketing': return <TicketingHub />;
            case 'Finance': return <FinanceManagement adminView={true} />;
            case 'Marketing': return <MarketingHub />;
            case 'Support': return <SupportDesk />;
            case 'HUD': return <InfrastructureHUD />;
            case 'Zones': return <ZoneManagement />;
            case 'Catalog': return <CatalogHub />;
            case 'Fleet': return <FleetHub />;
            case 'Surge': return <SurgeHub />;
            case 'Banners': return <BannerManagement />;
            case 'Refunds': return <RefundHub />;
            case 'Translations': return <TranslationHub />;
            case 'AuditLogs': return <AuditLogs />;
            case 'Settings': return <PlatformSettings />;
            case 'Reports': return <ReportsHub />;
            default: return <DashboardOverview />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-outfit text-slate-900 overflow-hidden relative">
            
            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:relative z-50 h-full bg-slate-900 text-white flex flex-col transition-all duration-500 ease-[0.16, 1, 0.3, 1]
                    ${sidebarCollapsed ? 'w-20' : 'w-72'}
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Brand */}
                <div className="h-20 flex items-center justify-between px-6 shrink-0 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                            <Globe size={22} strokeWidth={2.5} />
                        </div>
                        {!sidebarCollapsed && (
                            <motion.span 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-2xl font-black tracking-tighter uppercase italic"
                            >
                                MoveX<span className="text-primary tracking-widest text-[8px] ml-1 not-italic align-top">CORE</span>
                            </motion.span>
                        )}
                    </div>
                    {/* Mobile Close Button */}
                    <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="md:hidden w-8 h-8 flex items-center justify-center text-white/40 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nav Nodes */}
                <div className="flex-1 px-4 mt-8 overflow-y-auto space-y-1 custom-scrollbar">
                    {!sidebarCollapsed && (
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] mb-6 px-4">Command Center</p>
                    )}
                    
                    {adminMenu.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                            className={`
                                w-full group flex items-center px-4 py-4 rounded-2xl transition-all duration-300 relative
                                ${activeTab === item.id 
                                    ? 'bg-white/10 text-white' 
                                    : 'text-white/40 hover:bg-white/5 hover:text-white/80'
                                }
                            `}
                        >
                            {activeTab === item.id && (
                                <motion.div layoutId="nav-bg" className="absolute inset-0 bg-primary/20 rounded-2xl -z-10" />
                            )}
                            
                            <span className={`shrink-0 transition-transform duration-500 ${activeTab === item.id ? 'scale-110 text-primary' : 'group-hover:scale-110'}`}>
                                {item.icon}
                            </span>
                            
                            {!sidebarCollapsed && (
                                <span className={`ml-4 text-sm font-bold tracking-tight ${activeTab === item.id ? 'opacity-100' : 'opacity-80'}`}>
                                    {item.label}
                                </span>
                            )}

                            {item.badge && !sidebarCollapsed && (
                                <span className="ml-auto bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-full border border-primary/20">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Profiling Node */}
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={`flex items-center gap-3 w-full p-2 rounded-2xl hover:bg-white/5 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
                                <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-slate-700 to-slate-600 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id}`} alt="avatar" />
                                </div>
                                {!sidebarCollapsed && (
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="text-sm font-black text-white truncate">{currentUser?.name || 'Administrator'}</p>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter truncate">{currentUser?.email || 'System Root'}</p>
                                    </div>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white rounded-2xl shadow-2xl border-slate-100 p-2">
                             <DropdownMenuItem className="rounded-xl flex items-center gap-3 font-bold text-slate-700 py-3 cursor-pointer">
                                <Settings size={18} /> Account Interface
                             </DropdownMenuItem>
                             <div className="h-px bg-slate-50 my-2" />
                             <DropdownMenuItem 
                                onClick={logoutUser}
                                className="rounded-xl flex items-center gap-3 font-bold text-red-500 py-3 cursor-pointer hover:bg-red-50"
                            >
                                <LogOut size={18} /> System Shutdown
                             </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col h-full min-w-0">
                {/* Top Deck */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-40">
                    <div className="flex items-center gap-4 md:gap-6">
                        <button 
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="hidden md:flex w-10 h-10 items-center justify-center text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-xl border border-slate-100"
                        >
                            <ChevronLeft className={`transition-transform duration-500 ${sidebarCollapsed ? 'rotate-180' : ''}`} size={20} />
                        </button>
                        <button 
                            onClick={() => setMobileMenuOpen(true)}
                            className="flex md:hidden w-10 h-10 items-center justify-center text-slate-400"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tighter italic">
                                {activeTab.toUpperCase()} <span className="text-slate-300 font-light not-italic ml-2">/ GLOBAL NODE</span>
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center bg-slate-100 px-4 py-2.5 rounded-2xl border border-slate-200 min-w-[320px]">
                            <Search size={18} className="text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Query missions, drivers, or telemetry..."
                                className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400 ml-3 w-full"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="relative w-11 h-11 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-600 hover:text-primary transition-all active:scale-90">
                                <Bell size={20} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white animate-pulse" />
                            </button>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="w-11 h-11 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-600 hover:text-primary transition-all active:scale-90 font-black text-[10px] uppercase italic">
                                        {i18n.language.toUpperCase()}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 bg-white rounded-2xl shadow-2xl border-slate-100 p-2">
                                    <DropdownMenuItem onClick={() => i18n.changeLanguage('en')} className="rounded-xl font-bold flex items-center justify-between">ENG 🇺🇸</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => i18n.changeLanguage('hi')} className="rounded-xl font-bold flex items-center justify-between">HIN 🇮🇳</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => i18n.changeLanguage('mr')} className="rounded-xl font-bold flex items-center justify-between">MAR 🇮🇳</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Primary viewport */}
                <main className="flex-1 overflow-y-auto bg-[#fdfdfe] custom-scrollbar scroll-smooth">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.99, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="p-4 md:p-8 pb-32"
                    >
                        {renderContent()}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
