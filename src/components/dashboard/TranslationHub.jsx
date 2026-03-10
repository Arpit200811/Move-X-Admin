import React, { useState, useEffect } from 'react';
import { 
    Languages, 
    Search, 
    Save, 
    Globe, 
    Plus, 
    RefreshCw, 
    Edit3,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function TranslationHub() {
    const { t, i18n } = useTranslation();
    const [languages, setLanguages] = useState(['en']);
    const [activeLang, setActiveLang] = useState('en');
    const [dictionary, setDictionary] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingKey, setEditingKey] = useState(null);
    const [newValue, setNewValue] = useState('');
    const [status, setStatus] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        fetchTranslations(activeLang);
    }, [activeLang]);

    const loadData = async () => {
        try {
            const res = await api.get('/translations/languages');
            if (res.data.languages) setLanguages(res.data.languages);
        } catch (err) {
            console.error("Failed to load languages", err);
        }
    };

    const fetchTranslations = async (lang) => {
        setLoading(true);
        try {
            const res = await api.get(`/translations/${lang}`);
            setDictionary(res.data);
        } catch (err) {
            console.error("Failed to fetch translations", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key) => {
        setSaving(true);
        try {
            await api.put('/translations/update', { lang: activeLang, key, value: newValue });
            setDictionary(prev => ({ ...prev, [key]: newValue }));
            setEditingKey(null);
            setStatus({ type: 'success', message: 'Translation updated in real-time.' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to sync with neural core.' });
        } finally {
            setSaving(false);
            setTimeout(() => setStatus(null), 3000);
        }
    };

    const filteredKeys = Object.keys(dictionary).filter(key => 
        key.toLowerCase().includes(searchTerm.toLowerCase()) || 
        dictionary[key].toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                        <Languages size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">{t('translation_hub') || "Linguistic Spectrum"}</h2>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{t('manage_translations_desc') || "Manage platform-wide linguistic nodes"}</p>
                    </div>
                </div>

                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {languages.map(lang => (
                        <Button
                            key={lang}
                            variant={activeLang === lang ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveLang(lang)}
                            className="rounded-lg font-black uppercase text-[10px] tracking-widest px-4 h-9"
                        >
                            {lang}
                        </Button>
                    ))}
                    <Button variant="outline" size="sm" className="rounded-lg h-9 w-9 p-0 border-dashed border-slate-300">
                        <Plus size={14} />
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/40 bg-white rounded-4xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="SEARCH KEYS OR LABELS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl pl-11 pr-4 py-3 text-sm font-bold uppercase tracking-tight focus:ring-2 focus:ring-primary/20 placeholder:text-slate-300"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 max-h-[600px] overflow-y-auto scrollbar-hide">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <RefreshCw className="animate-spin text-primary mb-4" size={32} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing dictionary...</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {filteredKeys.map(key => (
                                <div key={key} className="p-6 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-mono font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                                                    {key}
                                                </span>
                                            </div>
                                            {editingKey === key ? (
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={newValue}
                                                    onChange={(e) => setNewValue(e.target.value)}
                                                    className="w-full border-2 border-primary/20 rounded-xl px-4 py-3 text-sm font-bold bg-white focus:ring-4 focus:ring-primary/10 outline-none"
                                                />
                                            ) : (
                                                <p className="text-sm font-black text-slate-800 italic">{dictionary[key]}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {editingKey === key ? (
                                                <>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => setEditingKey(null)}
                                                        className="font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => handleSave(key)}
                                                        disabled={saving}
                                                        className="bg-emerald-500 hover:bg-emerald-600 font-bold text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl shadow-lg shadow-emerald-500/20"
                                                    >
                                                        {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} className="mr-2" />}
                                                        Confirm
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => {
                                                        setEditingKey(key);
                                                        setNewValue(dictionary[key]);
                                                    }}
                                                    className="h-10 w-10 border-none rounded-xl opacity-0 group-hover:opacity-100 bg-white group-hover:bg-primary/10 text-primary transition-all"
                                                >
                                                    <Edit3 size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredKeys.length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-xs font-black text-slate-300 uppercase italic tracking-widest">No matching linguistic nodes found</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AnimatePresence>
                {status && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`fixed bottom-10 right-10 z-50 p-6 rounded-3xl shadow-2xl flex items-center gap-4 border-2 ${
                            status.type === 'success' ? 'bg-white border-emerald-500 text-emerald-600' : 'bg-white border-rose-500 text-rose-600'
                        }`}
                    >
                        {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        <p className="text-sm font-black uppercase italic tracking-tight">{status.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
