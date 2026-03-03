'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Search,
    PlusCircle,
    Filter,
    Eye,
    Calendar,
    MoreVertical,
    Edit3,
    Trash2,
    ExternalLink,
    ChevronDown,
    Activity,
    ArrowUpRight,
    TrendingDown,
    TrendingUp,
    XCircle,
    LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import { getAdminProperties, deleteProperty } from '@/lib/api';
import { Property, FilterState, Pagination } from '@/lib/types';
import { formatPrice, CATEGORY_ICONS, CATEGORY_COLORS, formatDate } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function AdminProperties() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const fetchProperties = async (page = 1) => {
        setLoading(true);
        const token = localStorage.getItem('assethub_token');
        if (!token) return;
        try {
            const params: Record<string, string> = { page: String(page) };
            if (selectedCategory) params.category = selectedCategory;
            if (searchQuery) params.q = searchQuery;

            const response = await getAdminProperties(token, params);
            setProperties(response.properties);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch properties');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchProperties(), 500);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedCategory]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;

        const token = localStorage.getItem('assethub_token');
        if (!token) return;

        try {
            await deleteProperty(token, id);
            toast.success('Property deleted successfully');
            fetchProperties(pagination?.page);
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete property');
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Asset Inventory</h1>
                    <p className="text-slate-400 text-sm">Manage, monitor, and optimize your asset listings.</p>
                </div>
                <Link href="/admin/properties/add" className="btn-primary py-4 px-8 text-base shadow-xl group">
                    <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Add New Asset
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
                <div className="flex flex-1 max-w-lg relative group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by title, location, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field bg-slate-900/50 pl-11 py-3"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-48">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="input-field appearance-none py-3"
                        >
                            <option value="">All Categories</option>
                            <option value="Land">🏞️ Land</option>
                            <option value="House">🏠 House</option>
                            <option value="Car">🚗 Car</option>
                            <option value="Truck">🚛 Truck</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>

                    <button onClick={() => fetchProperties()} className="btn-outline p-3 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-slate-900/50">
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Asset Info</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Inventory Status</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Location</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Engagement</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Asset Valuation</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-10 h-20 bg-white/[0.01]" />
                                        </tr>
                                    ))
                                ) : properties.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-slate-500 font-bold uppercase tracking-widest">No assets found in inventory</td>
                                    </tr>
                                ) : properties.map((p) => (
                                    <motion.tr
                                        key={p.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-xl bg-slate-950 overflow-hidden relative shrink-0 border border-white/5 group-hover:border-teal-500/30 transition-colors shadow-lg">
                                                    {p.thumbnail ? (
                                                        <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xl">{CATEGORY_ICONS[p.category]}</div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-white mb-1 group-hover:text-teal-400 transition-colors truncate max-w-[200px]">{p.title}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest bg-gradient-to-r text-transparent bg-clip-text ${CATEGORY_COLORS[p.category]}`}>{p.category}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                        <span className="text-[10px] text-slate-600 uppercase font-black tracking-tighter">ID: {p.id.split('-')[0]}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {p.status === 'available' ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-glow shadow-emerald-500/50" />
                                                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Live/Available</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                                    <span className="text-xs font-black text-red-500 uppercase tracking-widest capitalize">{p.status}</span>
                                                </div>
                                            )}
                                            <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-tighter">Type: For {p.listing_type}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-slate-400">{p.town}</p>
                                            <p className="text-[10px] text-slate-600 uppercase tracking-widest">{p.county}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-white font-black">
                                                        <Eye className="w-4 h-4 text-teal-400" />
                                                        <span>{p.view_count}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-600 uppercase tracking-tighter">Engagements</p>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-white font-black">
                                                        <Calendar className="w-4 h-4 text-indigo-400" />
                                                        <span>{p.booking_count || 0}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-600 uppercase tracking-tighter">Reservations</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black text-white">{formatPrice(p.price)}</p>
                                            <p className="text-[10px] text-teal-500 font-bold uppercase tracking-tighter">Viewing Fee: {formatPrice(p.viewing_fee)}</p>
                                        </td>
                                        <td className="px-6 py-5 text-right relative">
                                            <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/property/${p.id}`}
                                                    target="_blank"
                                                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                                                    title="Public View"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/properties/edit/${p.id}`}
                                                    className="p-2 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white transition-all"
                                                    title="Edit Asset"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                                    title="Liquidation/Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="p-2 text-slate-700 group-hover:hidden">
                                                <MoreVertical className="w-5 h-5 ml-auto" />
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination View */}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                    <button
                        disabled={pagination.page === 1}
                        onClick={() => fetchProperties(pagination.page - 1)}
                        className="btn-outline py-2 px-6 disabled:opacity-20 disabled:cursor-not-allowed group"
                    >
                        <ChevronDown className="w-4 h-4 rotate-90 group-hover:-translate-x-1 transition-transform" /> Prev
                    </button>
                    <div className="flex gap-2 font-mono">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
                            <button
                                key={num}
                                onClick={() => fetchProperties(num)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${pagination.page === num ? 'bg-teal-500 border-teal-500 text-white font-black' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/20'}`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                    <button
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => fetchProperties(pagination.page + 1)}
                        className="btn-outline py-2 px-6 disabled:opacity-20 disabled:cursor-not-allowed group"
                    >
                        Next <ChevronDown className="w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
}
