import React, { useState } from 'react';
import { Settings, Globe, ShieldCheck, Zap, Activity, Image as ImageIcon, CheckCircle, Clock, MapPin, Smartphone, Mail, Info, Truck, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';

const PartnerStoreSettings = ({ partner, isAcceptingOrders, autoAccept, onToggleSetting }) => {
    const { t } = useTranslation();
    const [storeName, setStoreName] = useState(partner?.name || '');
    const [logo, setLogo] = useState(partner?.image || '');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            {/* Main Settings Panel */}
            <div className="lg:col-span-2 space-y-8">
                <Card className="rounded-[40px] border-slate-100 shadow-xl overflow-hidden p-8">
                    <div className="flex flex-col md:flex-row gap-10">
                        {/* Store Asset Node */}
                        <div className="shrink-0 flex flex-col items-center">
                            <div className="relative group cursor-pointer">
                                <div className="w-40 h-40 rounded-[32px] bg-slate-900 overflow-hidden border-8 border-slate-50 shadow-2xl transition-transform group-hover:scale-105 active:scale-95 duration-500">
                                    {logo ? (
                                        <img src={logo} className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" alt="Logo" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-white/30">
                                            <ImageIcon size={48} strokeWidth={1} />
                                            <p className="text-[10px] font-black uppercase mt-3 tracking-widest italic">No Logo Data</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-black italic">UPDATE_LOG</Badge>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-110 active:scale-90 transition-transform">
                                    <Plus size={24} />
                                </div>
                            </div>
                            <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Business Identity</p>
                            <Badge variant="success" className="mt-2 font-black italic shadow-lg shadow-emerald-500/10">VERIFIED_MERCHANT</Badge>
                        </div>

                        {/* Store Detail Nodes */}
                        <div className="flex-1 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Name</label>
                                    <Input 
                                        className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-black italic text-lg pr-12 focus:border-primary/30" 
                                        value={storeName}
                                        onChange={e => setStoreName(e.target.value)}
                                        placeholder="Enter Store Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Category</label>
                                    <Input disabled className="h-14 bg-slate-50/50 border-slate-100 rounded-2xl font-black italic text-slate-400 uppercase tracking-widest opacity-80" value={partner?.category || 'VENDOR'} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                                        <Input disabled className="h-12 bg-slate-50/50 border-slate-100 rounded-xl font-bold text-slate-400 text-xs" value={partner?.email || 'N/A'} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Status</label>
                                        <div className="h-12 flex items-center px-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse" />
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">{partner?.status || 'ACTIVE'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full h-14 bg-primary text-white hover:bg-primary/90 rounded-2xl font-black uppercase text-[12px] tracking-widest italic shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                                <CheckCircle size={18} className="mr-3" /> Save Changes
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Additional Settings Nodes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="rounded-[40px] border-slate-100 shadow-xl overflow-hidden p-8 flex flex-col justify-between">
                         <div className="flex items-center gap-3 mb-6">
                             <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center">
                                 <Clock size={20} />
                             </div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Temporal Window</p>
                         </div>
                         <div className="space-y-4">
                             <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-violet-200 cursor-pointer" onClick={() => alert("Detailed Monday-Sunday scheduling UI will open here.")}>
                                 <span className="text-xs font-black text-slate-700 italic flex items-center gap-2">Advance Scheduling <Settings size={14} className="text-slate-400" /></span>
                                 <Badge className="bg-violet-500/10 text-violet-600 border-none font-black italic shadow-sm hover:scale-105 transition-transform">0900_-_2200_HS</Badge>
                             </div>
                             <p className="text-[9px] font-bold text-slate-400 px-1 leading-relaxed opacity-60 italic uppercase tracking-widest">
                                 Store visibility automatically syncs with your weekly active hour Matrix logs.
                             </p>
                         </div>
                    </Card>

                    <Card className="rounded-[40px] border-slate-100 shadow-xl overflow-hidden p-8 flex flex-col justify-between">
                         <div className="flex items-center gap-3 mb-6">
                             <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                 <MapPin size={20} />
                             </div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Node Geolocation</p>
                         </div>
                         <div className="space-y-4">
                             <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-amber-200 cursor-pointer">
                                 <span className="text-xs font-black text-slate-700 italic">Static Location hub</span>
                                 <span className="text-[10px] font-black text-amber-600 italic uppercase">MANAGE_MAP</span>
                             </div>
                             <p className="text-[9px] font-bold text-slate-400 px-1 leading-relaxed opacity-60 italic uppercase tracking-widest">
                                 Ensure pickup coordinates accurately reflect the tactical dock for dispatch pilots.
                             </p>
                         </div>
                    </Card>
                </div>
            </div>

            {/* Tactical Control HUD */}
            <div className="space-y-8">
                <Card className="rounded-[40px] border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] overflow-hidden">
                    <CardHeader className="p-8 pb-4 border-b border-slate-50">
                        <CardTitle className="text-base font-black italic flex items-center gap-3">
                            <Zap size={20} className="text-primary animate-pulse" />
                            Business_Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <div className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all origin-left group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isAcceptingOrders ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 rotate-3' : 'bg-slate-200 text-slate-400 grayscale'} group-hover:rotate-0`}>
                                    <Activity size={22} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store_Status</p>
                                    <p className="text-sm font-black text-slate-900 italic uppercase tracking-tighter">Accepting Orders</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => onToggleSetting('isAcceptingOrders', !isAcceptingOrders)}
                                className={`w-14 h-7 rounded-full p-1 transition-all flex items-center ${isAcceptingOrders ? 'bg-emerald-500' : 'bg-slate-200'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-500 ${isAcceptingOrders ? 'translate-x-7' : ''}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50 border border-slate-100 hover:border-amber-200 transition-all origin-left group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${autoAccept ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20 rotate-3' : 'bg-slate-200 text-slate-400 grayscale'} group-hover:rotate-0`}>
                                    <Zap size={22} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto_Confirm</p>
                                    <p className="text-sm font-black text-slate-900 italic uppercase tracking-tighter">Instant Approval</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => onToggleSetting('autoAccept', !autoAccept)}
                                className={`w-14 h-7 rounded-full p-1 transition-all flex items-center ${autoAccept ? 'bg-amber-500' : 'bg-slate-200'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-500 ${autoAccept ? 'translate-x-7' : ''}`} />
                            </button>
                        </div>

                        {/* Prep Time Adjustments */}
                        <div className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all origin-left group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 transition-transform group-hover:scale-110`}>
                                    <Clock size={22} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Prep_Time</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Input type="number" defaultValue={partner?.defaultPrepTime || 15} className="w-16 h-8 text-center text-sm font-black border-slate-200" />
                                        <span className="text-xs font-black text-slate-500 italic uppercase">Minutes</span>
                                    </div>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" className="text-[10px] font-black uppercase shadow-sm h-8">+15m Rush</Button>
                        </div>

                        {/* Industry Specific (Pharmacy) */}
                        <AnimatePresence>
                            {(partner?.category === 'Pharmacy' || partner?.category === 'Medical') && (
                                <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="flex items-center justify-between p-5 rounded-[24px] bg-rose-50 border border-rose-100 transition-all origin-left group overflow-hidden">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-500 text-white shadow-xl shadow-rose-500/20">
                                            <ShieldCheck size={22} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Rx_Verification</p>
                                            <p className="text-sm font-black text-rose-900 italic uppercase tracking-tighter">Require Prescriptions</p>
                                        </div>
                                    </div>
                                    <button className="w-14 h-7 rounded-full p-1 transition-all flex items-center bg-rose-500">
                                        <div className="w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-500 translate-x-7" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Industry Specific (Entertainment/Events) */}
                        <AnimatePresence>
                            {(partner?.category === 'Events' || partner?.category === 'Entertainment') && (
                                <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="flex items-center justify-between p-5 rounded-[24px] bg-violet-50 border border-violet-100 transition-all origin-left group overflow-hidden">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-violet-600 text-white shadow-xl shadow-violet-500/20">
                                            <Smartphone size={22} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Gateway_Mode</p>
                                            <p className="text-sm font-black text-violet-900 italic uppercase tracking-tighter">QR Scanner Active</p>
                                        </div>
                                    </div>
                                    <button className="w-14 h-7 rounded-full p-1 transition-all flex items-center bg-violet-600">
                                        <div className="w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-500 translate-x-7" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                <Card className="rounded-[40px] border-slate-100 bg-slate-50 shadow-sm overflow-hidden p-8">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 italic">Support Hub</p>
                     <div className="space-y-6">
                         {[
                             { icon: <ShieldCheck size={16} />, label: 'KYC Verified', value: 'Level 3 Status' },
                             { icon: <Truck size={16} />, label: 'Delivery Radius', value: '4.5 KM' },
                             { icon: <Mail size={16} />, label: 'Support Center', value: 'Online' }
                         ].map((node, i) => (
                             <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-none">
                                 <div className="flex items-center gap-3">
                                     <div className="text-slate-400">{node.icon}</div>
                                     <span className="text-[10px] font-black text-slate-400 uppercase">{node.label}</span>
                                 </div>
                                 <span className="text-[11px] font-black text-slate-700 italic">{node.value}</span>
                             </div>
                         ))}
                     </div>
                     <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                         <div className="flex gap-3">
                             <Info size={16} className="text-primary shrink-0" />
                             <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase italic">
                                 Changes to store configuration may require periodic re-verification by MoveX administrators.
                             </p>
                         </div>
                     </div>
                </Card>
            </div>
        </div>
    );
};

export default PartnerStoreSettings;
