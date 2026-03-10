import React, { useState, useEffect } from 'react';
import { 
    Map as MapIcon, 
    Save, 
    Trash2, 
    Plus, 
    Globe, 
    ShieldCheck, 
    Percent, 
    DollarSign,
    Box,
    Edit2,
    CheckCircle,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { MapContainer, TileLayer, Polygon, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function ZoneManagement() {
    const { t } = useTranslation();
    const [zones, setZones] = useState([]);
    const [taxConfigs, setTaxConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('zones'); // 'zones' | 'tax'
    const [newZone, setNewZone] = useState({ name: '', baseMultiplier: 1.0, description: '', boundary: null });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [zoneRes, taxRes] = await Promise.all([
                api.get('/zones'),
                api.get('/zones/tax')
            ]);
            setZones(zoneRes.data.zones || []);
            setTaxConfigs(taxRes.data.configs || []);
        } catch (err) {
            console.error("Failed to load geo-operational data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateZone = async () => {
        if (!newZone.boundary || !newZone.name) return alert("Zone topology and nodal name required.");
        try {
            await api.post('/zones', newZone);
            setNewZone({ name: '', baseMultipler: 1.0, description: '', boundary: null });
            fetchData();
        } catch (err) {
            alert("Zone instantiation failed.");
        }
    };

    const handleDeleteZone = async (id) => {
        try {
            await api.delete(`/zones/${id}`);
            fetchData();
        } catch (err) {
            alert("Zone termination failed.");
        }
    };

    const _onCreated = (e) => {
        const { layerType, layer } = e;
        if (layerType === "polygon") {
            const coords = layer.getLatLngs()[0].map(p => [p.lat, p.lng]);
            setNewZone(prev => ({ ...prev, boundary: coords }));
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-4">
                        <MapIcon className="text-primary" size={32} />
                        {t('geo_hub') || "Geospatial Matrix"}
                    </h2>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 ml-12">Territorial Control & Fiscal Logic</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <Button
                        variant={activeTab === 'zones' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('zones')}
                        className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 h-10"
                    >
                        Zones
                    </Button>
                    <Button
                        variant={activeTab === 'tax' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('tax')}
                        className="rounded-xl font-black uppercase text-[9px] tracking-widest px-6 h-10"
                    >
                        Tax Logic
                    </Button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'zones' ? (
                    <motion.div 
                        key="zones-matrix"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        <div className="lg:col-span-8">
                            <Card className="border-none shadow-2xl rounded-4xl overflow-hidden bg-white">
                                <CardHeader className="p-8 border-b border-slate-50">
                                    <CardTitle className="text-lg font-black italic uppercase tracking-tighter">Nodal Topology Mapper</CardTitle>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Draw mission boundaries on the tactical display</p>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="h-[600px] w-full relative group">
                                        <MapContainer center={[28.6139, 77.2090]} zoom={12} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                            <FeatureGroup>
                                                <EditControl
                                                    position="topright"
                                                    onCreated={_onCreated}
                                                    draw={{
                                                        rectangle: false,
                                                        circle: false,
                                                        polyline: false,
                                                        circlemarker: false,
                                                        marker: false,
                                                    }}
                                                />
                                            </FeatureGroup>
                                            {zones.map(zone => (
                                                <Polygon 
                                                    key={zone._id} 
                                                    positions={zone.boundary} 
                                                    pathOptions={{ color: '#2563EB', fillColor: '#2563EB', fillOpacity: 0.2 }} 
                                                />
                                            ))}
                                        </MapContainer>
                                        
                                        {!newZone.boundary && (
                                            <div className="absolute inset-0 z-[1000] pointer-events-none flex items-center justify-center p-12">
                                                <div className="bg-slate-900/40 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20">
                                                    <p className="text-white font-black text-[10px] uppercase tracking-widest italic animate-pulse">Use Draw Tools to Define Boundaries</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <Card className="border-none shadow-2xl rounded-4xl bg-slate-900 text-white overflow-hidden p-8">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6">Zone Registration</h3>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nodal Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. DOWNTOWN_CORE_01"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/40 outline-none"
                                            value={newZone.name}
                                            onChange={e => setNewZone({...newZone, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Base Multiplier</label>
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/40 outline-none"
                                            value={newZone.baseMultiplier}
                                            onChange={e => setNewZone({...newZone, baseMultiplier: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                    <Button 
                                        disabled={!newZone.boundary}
                                        onClick={handleCreateZone}
                                        className="w-full h-14 bg-primary hover:bg-primary/95 rounded-2xl font-black uppercase text-[10px] tracking-widest italic shadow-xl shadow-primary/25 mt-4 group"
                                    >
                                        {newZone.boundary ? <ShieldCheck size={18} className="mr-3 group-hover:scale-110 transition-transform" /> : <Box size={18} className="mr-3 animate-bounce" />}
                                        Initialize Zone Node
                                    </Button>
                                </div>
                            </Card>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
                                {zones.map(zone => (
                                    <div key={zone._id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 italic uppercase truncate max-w-[150px]">{zone.name}</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Multiplier: {zone.baseMultiplier}x</p>
                                        </div>
                                        <Button 
                                            disabled={loading}
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleDeleteZone(zone._id)}
                                            className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="tax-matrix"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {taxConfigs.map((config, idx) => (
                            <Card key={config._id} className="border-none shadow-xl hover:shadow-2xl transition-all bg-white rounded-4xl overflow-hidden group">
                                <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl">
                                            {config.currencySymbol}
                                        </div>
                                        <Badge className="bg-emerald-500 text-white border-none font-black text-[8px] uppercase tracking-widest px-3 py-1">
                                            {config.countryCode}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">{config.countryName}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{config.taxName} Rate</p>
                                            <p className="text-2xl font-black text-slate-900 italic">{config.taxRate}%</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Currency</p>
                                            <p className="text-2xl font-black text-slate-900 italic">{config.currency}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            <span>Base Fare</span>
                                            <span className="text-slate-900 italic">{config.currencySymbol}{config.baseFare}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            <span>Per KM Rate</span>
                                            <span className="text-slate-900 italic">{config.currencySymbol}{config.perKmRate}</span>
                                        </div>
                                    </div>
                                    <Button className="w-full h-12 border-none bg-slate-900 hover:bg-primary rounded-xl font-black uppercase text-[10px] tracking-widest italic mt-4 shadow-lg transition-all active:scale-95">
                                        Recalibrate Logic
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        
                        <Card className="border-2 border-dashed border-slate-200 rounded-4xl flex flex-col items-center justify-center p-12 bg-slate-50/30 hover:bg-slate-50 transition-all cursor-pointer">
                            <Plus size={48} className="text-slate-300 mb-6" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Regional Entity</p>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
                    <RefreshCw className="animate-spin text-primary mb-6" size={64} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse italic">Triangulating Geo-Sectors...</p>
                </div>
            )}
        </div>
    );
}
