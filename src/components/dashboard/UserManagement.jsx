import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Search, 
    Shield, 
    Ban, 
    CheckCircle2, 
    MoreVertical, 
    Phone, 
    Mail, 
    Calendar,
    Filter,
    ArrowUpRight,
    UserCheck,
    UserX,
    MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function UserManagement() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [provisionData, setProvisionData] = useState({ name: '', phone: '', role: 'customer', password: '' });
    const [provisioning, setProvisioning] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/auth/users');
                if (res.data?.success) {
                    setUsers(res.data.users);
                }
            } catch (err) {
                console.error("User Telemetry Failure", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (user.phone || '').includes(searchQuery);
        const matchesRole = filterRole === 'ALL' || user.role === filterRole.toLowerCase();
        return matchesSearch && matchesRole;
    });

    const handleAction = async (userId, action, value) => {
        try {
            const res = await api.put(`/auth/users/${userId}`, { [action]: value });
            if (res.data?.success) {
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...res.data.user } : u));
            }
        } catch (err) {
            alert('Action Protocol Failed');
        }
    };

    if (loading) return <div className="flex h-[60vh] items-center justify-center font-black animate-pulse text-slate-400">SYNCING_CLOUD_DATA...</div>;

    return (
        <div className="space-y-10 pb-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-1">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                            <Users size={24} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                            {t('user_control', 'User Control')}
                        </h2>
                    </div>
                    <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.25em] ml-1">{t('global_user_registry', 'Global User Registry')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2 border-slate-100 bg-white shadow-sm hover:border-indigo-600/20 hover:text-indigo-600 transition-all">
                        {t('export_registry', 'Export Node List')}
                    </Button>
                    <Button 
                        onClick={() => setShowProvisionModal(true)}
                        className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                        {t('provision_node', 'Provision New Node')}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 px-1">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <Input
                        placeholder={t('search_users', 'Query User Database (Name, ID, Serial)...')}
                        className="pl-12 h-14 bg-white border-2 border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all font-bold text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'CUSTOMER', 'DRIVER', 'PARTNER', 'ADMIN'].map((role) => (
                        <button
                            key={role}
                            onClick={() => setFilterRole(role)}
                            className={`
                                px-6 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all h-14 border-2
                                ${filterRole === role 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20 italic' 
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                }
                            `}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredUsers.map((user) => (
                    <Card key={user._id} className="group border-none shadow-sm hover:shadow-2xl transition-all rounded-4xl bg-white overflow-hidden p-8 relative flex flex-col h-full">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 p-1 relative overflow-hidden group-hover:border-indigo-600/30 transition-all">
                                    <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id}`} alt="U" className="w-full h-full object-cover rounded-2xl" />
                                    <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${user.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none truncate max-w-[140px]">{user.name || 'Anonymous Node'}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge className={`h-5 px-2 rounded-lg font-black text-[8px] uppercase tracking-widest border-none ${
                                            user.role === 'admin' ? 'bg-rose-500' : 
                                            user.role === 'driver' ? 'bg-indigo-500' :
                                            user.role === 'partner' ? 'bg-amber-500' : 'bg-slate-900'
                                        }`}>
                                            {user.role}
                                        </Badge>
                                        <span className="text-[9px] font-black text-slate-300 uppercase italic">#{user._id?.slice(-6)}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white flex items-center justify-center text-slate-300 transition-all active:scale-95 group/btn">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-10 text-[11px] font-bold text-slate-500">
                             <div className="flex items-center gap-3">
                                 <Phone size={14} className="text-slate-300" />
                                 <span className="tracking-wide">{user.phone || 'NO_PH_LINK'}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                 <Calendar size={14} className="text-slate-300" />
                                 <span className="tracking-wide uppercase">Member Since: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'LEGACY_NODE'}</span>
                             </div>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                             <Button 
                                onClick={() => handleAction(user._id, 'status', user.status === 'banned' ? 'online' : 'banned')}
                                variant="outline" 
                                className={`h-11 rounded-xl font-black text-[9px] uppercase tracking-widest border-none transition-all flex items-center gap-2 ${
                                    user.status === 'banned' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-500 hover:bg-red-100'
                                }`}
                             >
                                {user.status === 'banned' ? <UserCheck size={14} /> : <UserX size={14} />}
                                {user.status === 'banned' ? 'Release Node' : 'Quarantine'}
                             </Button>
                             <Button 
                                variant="outline" 
                                className="h-11 rounded-xl font-black text-[9px] uppercase tracking-widest border-none bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all flex items-center gap-2"
                             >
                                <MessageSquare size={14} />
                                Intercept
                             </Button>
                        </div>
                    </Card>
                ))}
            </div>
            {/* Provision Modal */}
            <AnimatePresence>
                {showProvisionModal && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg bg-white rounded-4xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">Provision New Node</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Manually onboard users or staff</p>
                                </div>
                                <button onClick={() => setShowProvisionModal(false)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                            <div className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                    <Input 
                                        className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50" 
                                        placeholder="John Matrix"
                                        value={provisionData.name}
                                        onChange={(e) => setProvisionData({...provisionData, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Pulse</label>
                                    <Input 
                                        className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50" 
                                        placeholder="+91 XXXXX XXXXX"
                                        value={provisionData.phone}
                                        onChange={(e) => setProvisionData({...provisionData, phone: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Role</label>
                                        <select 
                                            className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 font-bold text-sm outline-none"
                                            value={provisionData.role}
                                            onChange={(e) => setProvisionData({...provisionData, role: e.target.value})}
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="driver">Driver</option>
                                            <option value="partner">Partner</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px) font-black text-slate-400 uppercase tracking-widest">Access Key (Optional)</label>
                                        <Input 
                                            type="password"
                                            className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50" 
                                            placeholder="••••••••"
                                            value={provisionData.password}
                                            onChange={(e) => setProvisionData({...provisionData, password: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <Button 
                                    disabled={provisioning}
                                    onClick={async () => {
                                        setProvisioning(true);
                                        try {
                                            await api.post('/auth/provision-user', provisionData);
                                            setShowProvisionModal(false);
                                            window.location.reload(); 
                                        } catch (e) {
                                            alert("Handshake denied: Phone pulse already active");
                                        } finally {
                                            setProvisioning(false);
                                        }
                                    }}
                                    className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all mt-4"
                                >
                                    {provisioning ? 'GENERATING_NODE...' : 'Commit Provisioning'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
