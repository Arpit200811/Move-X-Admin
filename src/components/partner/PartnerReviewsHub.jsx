import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle2, Loader2, User, RefreshCw, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import api from '../../services/api';

const StarRating = ({ rating, max = 5, size = 16 }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
            <Star key={i} size={size} className={i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
        ))}
    </div>
);

const ReviewCard = ({ review, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`bg-white rounded-[28px] border p-6 shadow-xl hover:shadow-2xl transition-all ${review.rating >= 4 ? 'border-emerald-50' : review.rating >= 3 ? 'border-amber-50' : 'border-rose-50'}`}
    >
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <User size={18} />
                </div>
                <div>
                    <p className="text-sm font-black text-slate-900">{review.customerName}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        {review.date ? new Date(review.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </p>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1">
                <StarRating rating={review.rating} />
                <Badge className={`text-[8px] font-black border-none ${
                    review.rating >= 4 ? 'bg-emerald-50 text-emerald-600' :
                    review.rating >= 3 ? 'bg-amber-50 text-amber-600' :
                    'bg-rose-50 text-rose-600'
                }`}>
                    {review.rating >= 4 ? 'POSITIVE' : review.rating >= 3 ? 'NEUTRAL' : 'NEGATIVE'}
                </Badge>
            </div>
        </div>
        {review.review ? (
            <div className={`p-4 rounded-2xl ${review.rating >= 4 ? 'bg-emerald-50/50' : review.rating >= 3 ? 'bg-amber-50/50' : 'bg-rose-50/50'}`}>
                <p className="text-sm text-slate-700 font-medium italic leading-relaxed">"{review.review}"</p>
            </div>
        ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-100">
                <p className="text-xs text-slate-300 font-bold italic text-center">No written review provided.</p>
            </div>
        )}
        <div className="flex items-center gap-2 mt-4">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest transition-all hover:text-slate-600">
                <ThumbsUp size={12} /> Helpful
            </button>
            {review.rating < 3 && (
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-xl text-[9px] font-black text-rose-400 uppercase tracking-widest transition-all">
                    <ShieldAlert size={12} /> Flag Dispute
                </button>
            )}
            <p className="ml-auto text-[9px] font-bold text-slate-300 italic">Order #{review.orderId?.slice(-8)?.toUpperCase()}</p>
        </div>
    </motion.div>
);

const PartnerReviewsHub = ({ currentUser }) => {
    const [data, setData] = useState({ reviews: [], partnerRating: 0, ratingCount: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [backendUnavailable, setBackendUnavailable] = useState(false);

    const fetch = async () => {
        try {
            setLoading(true);
            setBackendUnavailable(false);
            const res = await api.get('/marketing/partner-reviews');
            setData(res.data);
        } catch (e) {
            if (e.response?.status === 404) {
                setBackendUnavailable(true);
                console.warn('[REVIEWS] Backend reviews route not found (404). Redeploy backend.');
            } else {
                console.error('Failed to load reviews:', e.message);
            }
        } finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const filtered = data.reviews.filter(r => {
        if (filter === 'ALL') return true;
        if (filter === 'POSITIVE') return r.rating >= 4;
        if (filter === 'NEUTRAL') return r.rating === 3;
        if (filter === 'NEGATIVE') return r.rating < 3;
        return true;
    });

    const posCount = data.reviews.filter(r => r.rating >= 4).length;
    const neutCount = data.reviews.filter(r => r.rating === 3).length;
    const negCount = data.reviews.filter(r => r.rating < 3).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
                        <Star size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">Ratings & Reviews</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Feedback Intelligence</p>
                    </div>
                </div>
                <Button variant="outline" onClick={fetch} className="h-10 rounded-xl border-slate-100 font-black uppercase text-[10px] tracking-widest gap-2">
                    <RefreshCw size={14} /> Refresh
                </Button>
            </div>

            {/* Rating Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 rounded-[32px] border-none bg-linear-to-br from-amber-400 to-amber-600 shadow-2xl shadow-amber-500/30 overflow-hidden p-8 text-white relative">
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-3">Overall Rating</p>
                    <h2 className="text-6xl font-black tracking-tighter italic">
                        {currentUser?.partner?.rating ? Number(currentUser.partner.rating).toFixed(1) : Number(data.partnerRating || 0).toFixed(1)}
                    </h2>
                    <StarRating rating={data.partnerRating || 0} size={20} />
                    <p className="text-xs font-bold text-white/60 mt-2">{data.ratingCount || 0} total reviews</p>
                </Card>

                <div className="lg:col-span-3 grid grid-cols-3 gap-4">
                    {[
                        { label: 'Positive', count: posCount, icon: <ThumbsUp size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-50', pct: data.reviews.length > 0 ? ((posCount / data.reviews.length) * 100).toFixed(0) : 0, bar: 'bg-emerald-500', filterKey: 'POSITIVE' },
                        { label: 'Neutral', count: neutCount, icon: <MessageSquare size={18} />, color: 'text-amber-500', bg: 'bg-amber-50', pct: data.reviews.length > 0 ? ((neutCount / data.reviews.length) * 100).toFixed(0) : 0, bar: 'bg-amber-500', filterKey: 'NEUTRAL' },
                        { label: 'Negative', count: negCount, icon: <ThumbsDown size={18} />, color: 'text-rose-500', bg: 'bg-rose-50', pct: data.reviews.length > 0 ? ((negCount / data.reviews.length) * 100).toFixed(0) : 0, bar: 'bg-rose-500', filterKey: 'NEGATIVE' },
                    ].map((s, i) => (
                        <Card key={i} onClick={() => setFilter(filter === s.filterKey ? 'ALL' : s.filterKey)}
                            className={`rounded-[28px] border-slate-100 shadow-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all ${filter === s.filterKey ? 'ring-2 ring-offset-2 ring-slate-300' : ''}`}>
                            <CardContent className="p-6">
                                <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4`}>{s.icon}</div>
                                <h4 className="text-2xl font-black text-slate-900 italic">{s.count}</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label} Reviews</p>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                                    <div className={`h-1.5 rounded-full ${s.bar}`} style={{ width: `${s.pct}%` }} />
                                </div>
                                <p className="text-[9px] font-bold text-slate-300 mt-1">{s.pct}% of total</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'}`}>
                        {f}
                    </button>
                ))}
                <span className="ml-auto self-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{filtered.length} reviews</span>
            </div>

            {/* Reviews Grid */}
            {loading ? (
                <div className="py-20 flex items-center justify-center flex-col gap-4">
                    <Loader2 size={32} className="animate-spin text-amber-500" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading reviews...</p>
                </div>
            ) : backendUnavailable ? (
                <div className="py-16 flex flex-col items-center justify-center bg-amber-50 rounded-[32px] border border-amber-100 text-center px-8 space-y-4">
                    <AlertTriangle size={40} className="text-amber-500" />
                    <h3 className="text-lg font-black text-amber-900">Reviews API Unavailable</h3>
                    <p className="text-sm text-amber-600 font-medium max-w-md">The Reviews route is not yet live on your deployed server. Redeploy your <strong>Render</strong> backend to activate this feature.</p>
                    <div className="p-4 bg-amber-100 rounded-2xl text-xs font-mono text-amber-700 text-left w-full max-w-md">
                        <p className="font-black mb-1">Required route:</p>
                        <p>GET /api/marketing/partner-reviews</p>
                    </div>
                    <Button onClick={fetch} variant="outline" className="rounded-xl border-amber-300 text-amber-700 hover:bg-amber-100 font-black gap-2">
                        <RefreshCw size={14} /> Retry
                    </Button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                    <Star size={56} className="text-slate-100 mb-4" />
                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest italic">No reviews yet</p>
                    <p className="text-xs text-slate-300 mt-1">Customer feedback will appear here after deliveries.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map((review, i) => <ReviewCard key={review.orderId || i} review={review} index={i} />)}
                </div>
            )}

            {/* Dispute Info Banner */}
            {negCount > 0 && (
                <div className="flex items-center gap-4 p-5 bg-rose-50 rounded-[24px] border border-rose-100">
                    <AlertTriangle size={20} className="text-rose-500 shrink-0" />
                    <div>
                        <p className="text-sm font-black text-rose-800">You have {negCount} negative review{negCount > 1 ? 's' : ''}</p>
                        <p className="text-xs text-rose-400 font-medium mt-0.5">Contact MoveX Support to raise a formal dispute on unfair reviews. <span className="font-black underline cursor-pointer">Learn more</span></p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerReviewsHub;
