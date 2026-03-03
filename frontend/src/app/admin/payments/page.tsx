'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    Search,
    Filter,
    ChevronDown,
    ExternalLink,
    Activity,
    CheckCircle2,
    XCircle,
    Clock,
    ShieldCheck,
    ArrowUpRight,
    RefreshCcw,
    Smartphone
} from 'lucide-react';
import { getAdminPayments } from '@/lib/api';
import { Payment, Pagination } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function AdminPayments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchPayments = async (page = 1) => {
        setLoading(true);
        const token = localStorage.getItem('assethub_token');
        if (!token) return;
        try {
            const params: Record<string, string> = { page: String(page) };
            if (statusFilter) params.status = statusFilter;
            if (searchQuery) params.q = searchQuery;

            const response = await getAdminPayments(token, params);
            setPayments(response.payments);
            setPagination(response.pagination);
        } catch (err: any) {
            toast.error(err.message || 'Failed to fetch payment records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchPayments(), 500);
        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter]);

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 leading-none">Finance Ledger</h1>
                    <p className="text-slate-400 text-sm font-medium">Verified M-Pesa transaction logs and commitment verification.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="glass-card px-6 py-3 border-teal-500/20 bg-teal-500/5">
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Settled Revenue</p>
                        <p className="text-xl font-black text-teal-400">
                            {formatPrice(payments.filter(p => p.status === 'success').reduce((acc, curr) => acc + curr.amount, 0))}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
                <div className="flex flex-1 max-w-lg relative group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by M-Pesa ref, User, or Phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field bg-slate-900/50 pl-11 py-3"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input-field appearance-none py-3"
                        >
                            <option value="">All Transactions</option>
                            <option value="success">✅ Settled</option>
                            <option value="pending">⏳ Processing</option>
                            <option value="failed">❌ Rejected</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>

                    <button onClick={() => fetchPayments()} className="btn-outline p-3 flex items-center justify-center shrink-0">
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden shadow-2xl relative">
                {/* Subtle background gradient */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none -z-10" />

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-slate-900/50">
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Log Entry</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Customer Identity</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Referenced Asset</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Valuation</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Authorization</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500 text-right">M-Pesa Ledger</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse h-20">
                                            <td colSpan={6} className="px-6 py-5 bg-white/[0.01]" />
                                        </tr>
                                    ))
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-slate-500 font-bold uppercase tracking-widest">No financial recordings available</td>
                                    </tr>
                                ) : payments.map((payment) => (
                                    <motion.tr
                                        key={payment.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${payment.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : payment.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    <CreditCard className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-tighter leading-none mb-1">Transaction ID</p>
                                                    <p className="text-xs font-bold font-mono text-white lowercase truncate max-w-[100px]">{payment.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                                                    {payment.user_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white leading-none mb-1.5">{payment.user_name}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                                        <Smartphone className="w-3 h-3" /> {payment.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-slate-400 group-hover:text-teal-400 transition-colors truncate max-w-[200px] leading-tight mb-1">
                                                {payment.property_title || 'Redacted Asset'}
                                            </p>
                                            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black">Ref: {payment.property_id.split('-')[0]}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black text-white">{formatPrice(payment.amount)}</p>
                                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Commitment Unit</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            {payment.status === 'success' ? (
                                                <div className="flex items-center gap-2 group/status">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Authorized</span>
                                                </div>
                                            ) : payment.status === 'pending' ? (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Processing</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <XCircle className="w-4 h-4 text-red-400" />
                                                    <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">Rejected</span>
                                                </div>
                                            )}
                                            <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-tighter font-medium">{formatDate(payment.created_at)}</p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-mono font-black text-teal-400 uppercase tracking-widest bg-teal-500/5 px-3 py-1 rounded-md border border-teal-500/10 group-hover:bg-teal-500/10 transition-all">
                                                    {payment.mpesa_reference || 'PENDING_HUB'}
                                                </span>
                                                <p className="text-[10px] text-slate-600 mt-2 lowercase font-mono opacity-40 group-hover:opacity-100 transition-opacity">
                                                    CO: {payment.checkout_request_id || 'manual_entry'}
                                                </p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-10 p-10 glass-card bg-indigo-500/5 border-indigo-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck className="w-24 h-24 text-indigo-400" />
                </div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 items-center gap-10">
                    <div>
                        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-indigo-400" /> Financial Proof of Stake
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                            Every transaction in this ledger is cryptographically linked to a verified M-Pesa receipt from Safaricom.
                            Systematic reconciliation occurs every 15 minutes to synchronize STK Push outcomes.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 md:justify-end">
                        <button className="btn-outline px-8 py-3 text-xs uppercase tracking-widest font-black">Download Ledger (CSV)</button>
                        <button className="btn-primary px-8 py-3 text-xs uppercase tracking-widest font-black bg-indigo-500">Initiate Audit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
