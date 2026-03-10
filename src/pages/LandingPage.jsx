import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Truck, MapPin, Shield, Clock, TrendingUp, Package, ChevronRight, Globe, Zap, Heart, ArrowRight, ShieldCheck, ZapIcon, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-inter selection:bg-primary/20 selection:text-primary">

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-[1000px] bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute top-[60%] left-[-10%] w-[30%] h-[30%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />

            {/* Premium Navbar */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 border-b bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-10">
                        <div className="flex items-center space-x-3 group cursor-pointer">
                            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                                <Truck className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-slate-900">
                                MoveX<span className="text-primary">.</span>
                            </span>
                        </div>

                        <div className="hidden lg:flex items-center space-x-8">
                            {['Solutions', 'Company', 'Safety', 'Developers'].map((link) => (
                                <a key={link} href="#" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            <Globe size={14} className="text-slate-400" />
                            <select
                                onChange={(e) => {
                                    const lng = e.target.value;
                                    import('../i18n').then(module => module.default.changeLanguage(lng));
                                }}
                                defaultValue="en"
                                className="bg-transparent border-none outline-none text-[10px] font-black uppercase text-slate-600 cursor-pointer"
                            >
                                <option value="en">EN</option>
                                <option value="fr">FR</option>
                                <option value="hi">HI</option>
                            </select>
                        </div>
                        <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-primary transition-colors">Sign In</Link>
                        <Link to="/dashboard">
                            <Button size="sm" className="rounded-lg h-10 px-6">
                                Live Demo
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 pt-32 md:pt-52 pb-20 md:pb-32 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
                    <div className="space-y-6 md:space-y-8 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center space-x-2 bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-xs"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">V2.0 Core Infrastructure Active</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-6xl md:text-8xl font-black leading-[1.1] md:leading-[0.9] text-slate-900 tracking-tighter"
                        >
                            Logistics <br className="hidden sm:block" />
                            at <span className="text-primary italic">Light Speed.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-base md:text-lg text-slate-500 font-medium max-w-xl leading-relaxed mx-auto lg:ml-0"
                        >
                            Building the world's most advanced delivery network. MoveX leverages AI-driven dispatch and real-time telemetry to power global commerce.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4"
                        >
                            <Link to="/dashboard">
                                <Button className="h-14 md:h-16 px-8 md:px-10 rounded-2xl text-base group w-full sm:w-auto">
                                    Join the Network
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button variant="outline" className="h-14 md:h-16 px-8 md:px-10 rounded-2xl text-base bg-white w-full sm:w-auto">
                                <Truck className="mr-3" size={20} />
                                Driver Portal
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-center lg:justify-start gap-6 md:gap-10 pt-8 md:pt-12 border-t border-slate-200"
                        >
                            {[
                                { val: '12M+', label: 'Deliveries' },
                                { val: '99.9%', label: 'Uptime' },
                                { val: '15+', label: 'Cities' }
                            ].map((s, i) => (
                                <div key={i}>
                                    <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{s.val}</div>
                                    <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative z-10 p-4 bg-white rounded-3xl md:rounded-[3rem] shadow-2xl border border-slate-100">
                            <div className="aspect-4/5 bg-slate-900 rounded-2xl md:rounded-4xl overflow-hidden relative group">
                                <img
                                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000"
                                    className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000"
                                    alt="Global Logistics"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                                <div className="absolute bottom-8 left-8 right-8">
                                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 space-y-4 shadow-2xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                                    <Package className="text-white" size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-white/60 uppercase">Live Flux</p>
                                                    <p className="text-sm font-black text-white">#MX-7720-OP</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-3 py-1">In Transit</Badge>
                                        </div>
                                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "65%" }}
                                                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                                className="h-full bg-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="absolute -top-6 -right-6 p-4 bg-white rounded-2xl shadow-xl border border-slate-50 z-20 flex items-center gap-3"
                        >
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                <BarChart3 size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</p>
                                <p className="text-sm font-black text-slate-900">+42% Growth</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </main>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-100">
                <div className="grid md:grid-cols-3 gap-12">
                    {[
                        {
                            icon: <ShieldCheck className="text-emerald-500" />,
                            title: "Mission Critical Security",
                            desc: "Every node in the MoveX network is verified with enterprise-grade encryption and real-time auditing."
                        },
                        {
                            icon: <ZapIcon className="text-primary" />,
                            title: "Neural Dispatch Engine",
                            desc: "Proprietary AI algorithms match payloads with the optimal fleet operator in under 100 milliseconds."
                        },
                        {
                            icon: <Globe className="text-indigo-500" />,
                            title: "Global Reach, Local Depth",
                            desc: "A worldwide logistics infrastructure tailored for hyper-local operational excellence."
                        }
                    ].map((feature, i) => (
                        <div key={i} className="space-y-6 group">
                            <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow group-hover:-translate-y-1 transform duration-300">
                                {React.cloneElement(feature.icon, { size: 24 })}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{feature.title}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center space-x-2">
                    <Truck className="text-primary w-5 h-5" />
                    <span className="font-black text-slate-900">MoveX<span className="text-primary">.</span></span>
                    <span className="text-xs font-bold text-slate-400 ml-4">© 2026 MoveX Enterprise. All rights reserved.</span>
                </div>
                <div className="flex gap-8">
                    {['Terms', 'Privacy', 'Contact', 'Twitter'].map(link => (
                        <a key={link} href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">{link}</a>
                    ))}
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
