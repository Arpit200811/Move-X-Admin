import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Smartphone, Lock, ChevronRight, Github, Twitter, Eye, EyeOff, Info, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import { useOrders } from '../context/OrderContext';

const loginSchema = yup.object().shape({
    email: yup.string()
        .required('Phone number is required')
        .matches(/^[0-9+\-\s]{10,15}$/, 'Enter a valid phone number (10 digits)'),
    password: yup.string()
        .required('Password is required')
        .min(4, 'Password must be at least 4 characters')
});

const Login = () => {
    const { t } = useTranslation();
    const [role, setRole] = useState('admin');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { loginUser } = useOrders();
    const [loading, setLoading] = useState(false);
    
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: { email: '', password: '' }
    });

    const handleLogin = async (data) => {
        console.log('[MoveX] Login Attempt Start:', { role, phone: data.email });
        setLoading(true);
        try {
            const phoneStr = (data.email || '').trim();
            if (!phoneStr) {
                toast.error('Identity key required.');
                setLoading(false);
                return;
            }

            const result = await loginUser(phoneStr, data.password, role);
            console.log('[MoveX] Login Response:', result);

            if (result === true) {
                toast.success(`Access Granted: ${role.toUpperCase()} session active.`);
                // Small delay to ensure token is saved to localStorage
                setTimeout(() => {
                    if (role === 'partner') {
                        navigate('/partner');
                    } else {
                        navigate('/dashboard');
                    }
                }, 500);
            } else {
                const msg = result?.message || `Identity Verification Failed: Access Locked.`;
                toast.error(msg);
                // Fallback alert for debugging mobile/old browsers where toasts might fail
                if (!window.toastShown) {
                   alert(msg);
                }
                setLoading(false);
            }
        } catch (err) {
            console.error('[MoveX] Login System Error:', err);
            toast.error('Logistics Uplink Error. Check Network.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden font-sans">
            {/* Dynamic Background */}
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -ml-48 -mb-48 transition-all animate-pulse" />

            <div className="w-full max-w-[420px] relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-10"
                >
                    <Link to="/" className="inline-flex items-center space-x-3 mb-6 group">
                        <div className="bg-primary p-2.5 rounded-2xl shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform">
                            <Truck className="text-white w-7 h-7" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-900 italic">
                            MoveX <span className="text-primary italic">Express.</span>
                        </span>
                    </Link>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">{t('admin_gateway', 'Admin Gateway')}</h2>
                    <p className="text-slate-500 font-medium text-sm mt-2">{t('pro_logistics_portal', 'Professional Logistics Management Portal')}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl md:rounded-[32px] p-6 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-slate-100"
                >
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 border border-slate-100">
                        <button
                            type="button"
                            onClick={() => setRole('admin')}
                            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all ${role === 'admin' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('partner')}
                            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all ${role === 'partner' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Partner
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
                        {/* Phone Number Field */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                                {t('secure_access_key') || 'Secure Access Key'}
                            </label>
                            <div className="group relative">
                                <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Smartphone size={18} />
                                </div>
                                <input
                                    type="text"
                                    className={`w-full bg-slate-50 border-slate-200 pl-13 pr-4 py-4 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                    placeholder="Enter Phone Number"
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs font-bold pl-1 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0">
                                    {t('auth_code') || 'Authentication Code'}
                                </label>
                                <button type="button" onClick={() => toast('Contact your system administrator to reset credentials.', { icon: 'ℹ️' })} className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
                                    {t('forgot') || 'Forgot?'}
                                </button>
                            </div>
                            <div className="group relative">
                                <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full bg-slate-50 border-slate-200 pl-13 pr-12 py-4 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                    placeholder="••••••••"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 p-1 rounded-lg transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs font-bold pl-1 mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-base mt-2"
                        >
                            <span>{loading ? 'Securing Session...' : 'Unlock Dashboard'}</span>
                            {!loading && <ChevronRight size={20} />}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                            <span className="relative px-4 bg-white text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Verified Identity Hub</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <button type="button" onClick={() => toast('Twitter SSO is not configured. Use phone + password login.')} className="flex items-center justify-center space-x-2 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 hover:border-slate-300 transition-all group">
                                <Twitter size={18} className="text-[#1DA1F2] group-hover:scale-110 transition-transform" />
                                <span className="text-[13px] font-black text-slate-700">Twitter</span>
                            </button>
                            <button type="button" onClick={() => toast('GitHub SSO is not configured. Use phone + password login.')} className="flex items-center justify-center space-x-2 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 hover:border-slate-300 transition-all group">
                                <Github size={18} className="text-slate-900 group-hover:scale-110 transition-transform" />
                                <span className="text-[13px] font-black text-slate-700">GitHub</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Secure Badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 flex items-center justify-center space-x-6 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500"
                >
                    <ShieldCheck size={24} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">AES-256 Encrypted Portal</span>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
