'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    CreditCard,
    PlusCircle,
    TrendingUp,
    Eye,
    Calendar,
    Clock,
    ArrowUpRight,
    Activity,
    CheckCircle2,
    XCircle,
    LucideIcon
} from 'lucide-react';
import { getDashboardStats } from '@/lib/api';
import { DashboardStats, Property, Payment } from '@/lib/types';
import { formatPrice, CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/constants';
import toast from 'react-hot-toast';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    colorClass: string;
}

const StatCard = ({ label, value, icon: Icon, trend, colorClass }: StatCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 flex items-center gap-6"
    >
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shadow-lg`}>
            <Icon className="w-7 h-7" />
        </div>
        <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
            <p className="text-3xl font-black text-white">{value}</p>
            {trend && (
                <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">{trend} vs last month</span>
                </div>
            )}
        </div>
    </motion.div>
);

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('assethub_token');
            if (!token) return;
            try {
                const response = await getDashboardStats(token);
                setStats(response);
            } catch (error: any) {
                toast.error(error.message || 'Failed to fetch dashboard stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 rounded-3xl bg-slate-900/50" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-96 rounded-3xl bg-slate-900/50" />
                    <div className="h-96 rounded-3xl bg-slate-900/50" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Page Title */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Systems Overview</h1>
                    <p className="text-slate-400 text-sm">Real-time performance metrics and recent activity.</p>
                </div>
                <div className="hidden sm:block">
                    <button onClick={() => window.location.reload()} className="btn-outline py-2 px-6 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Refresh Data
                    </button>
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Listings"
                    value={stats?.stats.totalListings || 0}
                    icon={Package}
                    colorClass="from-teal-500 to-emerald-600"
                    trend="+5%"
                />
                <StatCard
                    label="Active Assets"
                    value={stats?.stats.activeListings || 0}
                    icon={Activity}
                    colorClass="from-blue-500 to-indigo-600"
                />
                <StatCard
                    label="Total Revenue"
                    value={formatPrice(stats?.stats.totalRevenue || 0)}
                    icon={CreditCard}
                    colorClass="from-amber-500 to-orange-600"
                    trend="+12%"
                />
                <StatCard
                    label="Total Bookings"
                    value={stats?.stats.totalBookings || 0}
                    icon={CheckCircle2}
                    colorClass="from-purple-500 to-violet-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Most Viewed Properties */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-white px-2">Popular Listings</h3>
                        <button className="text-xs text-teal-400 hover:text-white transition-colors font-bold uppercase tracking-widest">
                            View All <ArrowUpRight className="w-3 h-3 inline ml-1" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {stats?.mostViewedProperties.map((p, idx) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card-hover p-4 flex items-center gap-6"
                            >
                                <div className="w-16 h-16 rounded-xl bg-slate-950/80 overflow-hidden relative shrink-0">
                                    {p.thumbnail ? (
                                        <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl">{CATEGORY_ICONS[p.category]}</div>
                                    )}
                                    {idx === 0 && <div className="absolute top-0 right-0 p-1 bg-amber-500 text-slate-900 rounded-bl-lg font-black text-[8px]">TOP</div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-white mb-1 truncate">{p.title}</h4>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-2">
                                        <span className="uppercase tracking-widest font-black text-teal-500">{p.category}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span>{p.town}, {p.county}</span>
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Eye className="w-4 h-4 text-teal-400" />
                                        <span className="text-sm font-black text-white">{p.view_count}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Engagement</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity / Category Distribution */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-white px-2">Distribution</h3>

                    <div className="glass-card p-8 bg-gradient-to-br from-slate-900/80 to-slate-950/80">
                        <h4 className="text-xs font-black uppercase text-slate-500 mb-8 tracking-[0.2em] border-b border-white/5 pb-4">By Asset Class</h4>
                        <div className="space-y-8">
                            {stats?.categoryStats.map((cat, idx) => {
                                const total = stats.stats.totalListings || 1;
                                const percentage = Math.round((cat.count / total) * 100);
                                const colors = CATEGORY_COLORS[cat.category] || 'from-slate-500 to-slate-600';

                                return (
                                    <div key={cat.category}>
                                        <div className="flex justify-between items-end mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors} flex items-center justify-center text-sm shadow-lg`}>
                                                    {CATEGORY_ICONS[cat.category] || '📦'}
                                                </div>
                                                <span className="text-sm font-bold text-slate-200">{cat.category}</span>
                                            </div>
                                            <span className="text-xs font-black text-teal-400">{percentage}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-950/50 rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ delay: 0.5 + (idx * 0.1), duration: 1 }}
                                                className={`h-full bg-gradient-to-r ${colors}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="glass-card p-8 bg-teal-500/5 border-teal-500/10">
                        <h4 className="text-xs font-black uppercase text-teal-400 mb-6 tracking-widest">Accelerated Shortcuts</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => router.push('/admin/properties/add')}
                                className="p-4 rounded-xl bg-slate-950/50 border border-white/5 hover:border-teal-500/50 hover:bg-teal-500/5 transition-all flex flex-col items-center gap-3 group"
                            >
                                <PlusCircle className="w-6 h-6 text-teal-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Add Asset</span>
                            </button>
                            <button
                                className="p-4 rounded-xl bg-slate-950/50 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center gap-3 group"
                            >
                                <Settings className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Config</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Payments View */}
            <section className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black text-white">Recent Transactions</h3>
                    <button
                        onClick={() => router.push('/admin/payments')}
                        className="btn-outline py-2 px-6"
                    >
                        Finance Ledger
                    </button>
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-slate-900/50">
                                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Transaction ID</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Customer</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Asset</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Amount</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500 text-right">M-Pesa Ref</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats?.recentPayments.map((payment, idx) => (
                                    <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-bold text-slate-400 lowercase truncate max-w-[100px]">{payment.id}</p>
                                            <p className="text-[10px] text-slate-600 uppercase tracking-tighter">{payment.created_at.split('T')[0]}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-white mb-0.5">{payment.user_name}</p>
                                            <p className="text-[10px] text-slate-500">{payment.phone}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-slate-400 group-hover:text-teal-400 transition-colors truncate max-w-[200px]">
                                                {payment.property_title || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black text-white">{formatPrice(payment.amount)}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            {payment.status === 'success' && (
                                                <span className="badge badge-success px-3 py-1 text-[10px] uppercase font-black tracking-widest">Settled</span>
                                            )}
                                            {payment.status === 'pending' && (
                                                <span className="badge badge-warning px-3 py-1 text-[10px] uppercase font-black tracking-widest">Pending</span>
                                            )}
                                            {payment.status === 'failed' && (
                                                <span className="badge badge-danger px-3 py-1 text-[10px] uppercase font-black tracking-widest">Locked</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <p className="text-xs font-black text-teal-500 uppercase font-mono tracking-widest">
                                                {payment.mpesa_reference || 'STK_WAIT'}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}
