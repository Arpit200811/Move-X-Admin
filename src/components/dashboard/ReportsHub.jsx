import React, { useState } from 'react';
import {
    Download,
    FileSpreadsheet,
    FileText,
    Calendar,
    Filter,
    ArrowRight,
    Zap,
    Globe,
    ShieldCheck,
    RefreshCw,
    PieChart,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function ReportsHub() {
    const { t } = useTranslation();
    const [exporting, setExporting] = useState(null);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [showWebhook, setShowWebhook] = useState(false);
    const [webhookSaved, setWebhookSaved] = useState(false);

    const ENDPOINTS = {
        finances: '/finance/export-csv',
        orders: '/orders/export-csv',
        drivers: '/orders/drivers/export-csv',
        ai: '/finance/export-csv', // reuse finance for AI telemetry stub
    };

    const handleExport = async (type) => {
        setExporting(type);
        try {
            const response = await api.get(ENDPOINTS[type], { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `MoveX_${type.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Export Protocol Failed", err);
            alert(`Export failed for '${type}'. Ensure backend is running.`);
        } finally {
            setExporting(null);
        }
    };

    const handleSaveWebhook = () => {
        if (!webhookUrl.startsWith('http')) return alert('Please enter a valid URL starting with http:// or https://');
        localStorage.setItem('movex_webhook_url', webhookUrl);
        setWebhookSaved(true);
        setTimeout(() => { setWebhookSaved(false); setShowWebhook(false); }, 1500);
    };

    const reportNodes = [
        {
            id: 'finances',
            title: t('fiscal_audit_ledger'),
            desc: t('fiscal_audit_desc'),
            icon: FileSpreadsheet,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            formats: ['CSV', 'JSON']
        },
        {
            id: 'orders',
            title: t('global_mission_log'),
            desc: t('mission_log_desc'),
            icon: Globe,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            formats: ['CSV', 'PDF']
        },
        {
            id: 'drivers',
            title: t('fleet_dossier'),
            desc: t('fleet_dossier_desc'),
            icon: ShieldCheck,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            formats: ['CSV']
        },
        {
            id: 'ai',
            title: t('ai_telemetry_title'),
            desc: t('ai_telemetry_desc'),
            icon: Zap,
            color: 'text-primary',
            bg: 'bg-indigo-50',
            formats: ['JSON', 'LOG']
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase flex items-center gap-3">
                        <Download className="text-primary" size={28} />
                        {t('reports_hub')}
                    </h2>
                    <p className="text-slate-500 font-medium font-mono text-xs mt-1">{t('data_protocol')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-900 border-none">
                    <CardContent className="p-6">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('archived_events')}</p>
                        <h4 className="text-3xl font-black text-white italic tracking-tighter">12.4K+</h4>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-primary h-full w-[65%]" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('last_sync')}</p>
                        <h4 className="text-lg font-black text-slate-900 uppercase">2 {t('minutes')} {t('ago')}</h4>
                        <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase flex items-center gap-1">
                            <RefreshCw size={10} className="animate-spin" /> {t('live_sync_active')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reportNodes.map((node, i) => (
                    <Card key={node.id} className="group hover:border-primary/50 transition-all shadow-lg hover:shadow-2xl overflow-hidden border-2 border-transparent bg-white">
                        <CardContent className="p-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div className={`w-16 h-16 rounded-3xl ${node.bg} ${node.color} flex items-center justify-center shadow-sm`}>
                                    <node.icon size={32} />
                                </div>
                                <div className="flex gap-2">
                                    {node.formats.map(f => (
                                        <Badge key={f} variant="outline" className="text-[9px] font-black border-slate-200">{f}</Badge>
                                    ))}
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase mb-3">{node.title}</h3>
                            <p className="text-sm text-slate-500 font-medium mb-10 leading-relaxed max-w-[280px]">{node.desc}</p>

                            <div className="mt-auto pt-6 border-t flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(j => (
                                        <div key={j} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                                    ))}
                                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">+12</div>
                                </div>
                                <Button
                                    onClick={() => handleExport(node.id)}
                                    disabled={!!exporting}
                                    className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-primary transition-all text-[10px] font-black uppercase tracking-widest italic flex items-center gap-3"
                                >
                                    {exporting === node.id ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />}
                                    {t('generate_extract')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Webhook Config Modal */}
            {showWebhook && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-black text-slate-900 mb-2">{t('config_webhook')}</h3>
                        <p className="text-sm text-slate-500 mb-6">{t('webhook_desc')}</p>
                        <input
                            type="url"
                            placeholder="https://your-server.com/webhook"
                            value={webhookUrl}
                            onChange={e => setWebhookUrl(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 mb-4"
                        />
                        <div className="flex gap-3">
                            <Button onClick={handleSaveWebhook} className="flex-1">{webhookSaved ? '✅ Saved!' : t('save_webhook')}</Button>
                            <Button variant="outline" onClick={() => setShowWebhook(false)} className="flex-1">{t('cancel')}</Button>
                        </div>
                    </div>
                </div>
            )}

            <Card className="bg-indigo-600 text-white relative overflow-hidden">
                <CardContent className="p-12 relative z-10">
                    <div className="max-w-xl">
                        <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-2">{t('auto_data_streams')}</h4>
                        <p className="text-indigo-100 text-sm font-medium mb-8 leading-relaxed">
                            {t('data_streams_desc')}
                        </p>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setShowWebhook(true)} className="bg-white/10 border-white/20 text-white font-black uppercase italic text-[10px] tracking-widest h-11 px-8">
                                Setup Webhook
                            </Button>
                            <Button variant="ghost" onClick={() => window.open('https://stripe.com/docs/webhooks', '_blank')} className="text-white font-black uppercase italic text-[10px] tracking-widest h-11 px-8">
                                Read Protocol <ArrowRight size={14} className="ml-2" />
                            </Button>
                        </div>
                    </div>
                    <FileSpreadsheet size={200} className="absolute -bottom-20 -right-20 text-white/10" />
                </CardContent>
            </Card>
        </div>
    );
}
