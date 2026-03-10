import React from 'react';
import {
    ShieldAlert,
    Cpu,
    Zap,
    Construction,
    Lock,
    RefreshCw,
    Activity,
    Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function MaintenanceRecalibration() {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-9999 bg-slate-900 flex items-center justify-center p-6 overflow-hidden">
            {/* Background Neural Network (Mock) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
                <div className="grid grid-cols-12 h-full w-full gap-px">
                    {[...Array(144)].map((_, i) => (
                        <div key={i} className="border-[0.5px] border-slate-800" />
                    ))}
                </div>
            </div>

            <div className="relative z-10 max-w-2xl w-full text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-3xl border border-primary/20 mb-12 shadow-2xl shadow-primary/20"
                >
                    <ShieldAlert size={48} className="text-primary animate-pulse" />
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase mb-4 leading-none">
                        {t('system_under_recalibration').split(' ').slice(0, 2).join(' ')} <br />
                        <span className="text-primary">{t('system_under_recalibration').split(' ').slice(2).join(' ')}</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-bold uppercase tracking-widest mb-12">
                        {t('global_operational_guard')}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { icon: Cpu, label: t('nodal_syncing'), active: true },
                        { icon: RefreshCw, label: t('db_reindexing'), active: true },
                        { icon: Activity, label: t('logic_patching'), active: false },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-2xl flex flex-col items-center"
                        >
                            <stat.icon className={`mb-3 ${stat.active ? 'text-primary animate-spin-slow' : 'text-slate-500'}`} size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="p-1 px-4 bg-slate-950/80 rounded-full inline-flex items-center gap-3 border border-slate-800"
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">{t('admin_nodes_authenticated')}</span>
                </motion.div>
            </div>

            {/* Floating Technical Elements */}
            <div className="absolute top-10 right-10 flex flex-col items-end gap-1 opacity-20">
                <span className="text-[8px] font-black text-primary uppercase">Core v4.2.0-Alpha</span>
                <span className="text-[8px] font-black text-white uppercase tracking-widest">INFRA_LOCK_KEY: 0xFD21</span>
            </div>

            <div className="absolute bottom-10 left-10 flex items-center gap-4 opacity-20 capitalize">
                <Settings className="text-white animate-spin-slow" size={20} />
                <span className="text-xs font-bold text-white tracking-widest">{t('optimizing_mission_vectors')}</span>
            </div>
        </div>
    );
}

// Add these to your tailwind config/index.css for rotation
// .animate-spin-slow { animation: spin 8s linear infinite; }
