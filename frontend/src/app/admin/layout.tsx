'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    CreditCard,
    PlusCircle,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    Settings,
    User,
    ArrowRightCircle,
    TrendingUp,
    Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [admin, setAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('assethub_token');
        const adminData = localStorage.getItem('assethub_admin');

        if (!token || !adminData) {
            router.push('/admin');
            return;
        }

        setAdmin(JSON.parse(adminData));
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('assethub_token');
        localStorage.removeItem('assethub_admin');
        router.push('/admin');
    };

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { label: 'Properties', icon: Package, path: '/admin/properties' },
        { label: 'Add Property', icon: PlusCircle, path: '/admin/properties/add' },
        { label: 'Payments', icon: CreditCard, path: '/admin/payments' },
    ];

    if (loading) {
        return (
            <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
                <Activity className="w-12 h-12 text-teal-400 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex relative">
            {/* Small mobile overlay */}
            <AnimatePresence>
                {!isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:sticky top-0 left-0 h-screen w-72 bg-slate-900 border-r border-white/5 z-40 transition-transform duration-300 ease-in-out shrink-0`}
            >
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-xl">
                            A
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white leading-none">AssetHub</h2>
                            <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-1">Admin Panel</p>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden ml-auto p-2 text-slate-500 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${isActive ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-teal-400' : 'group-hover:text-teal-400 transition-colors'}`} />
                                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                    {isActive && <motion.div layoutId="nav-indicator" className="w-1.5 h-1.5 rounded-full bg-teal-400 ml-auto" />}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="p-4 rounded-xl bg-slate-950/50 mb-4 border border-white/5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden">
                                    <User className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-black text-white truncate">{admin?.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{admin?.email}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full group"
                        >
                            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span className="text-sm font-bold tracking-tight">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 overflow-x-hidden">
                {/* Top Header */}
                <header className="h-20 bg-slate-950/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-20 px-8 flex items-center justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="hidden md:flex flex-1 max-w-lg relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search assets, payments, or users..."
                            className="input-field bg-slate-900/50 pl-11 py-2"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-teal-500 border-2 border-slate-950" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                            <Settings className="w-5 h-5" />
                        </button>
                        <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block" />
                        <div className="hidden sm:flex items-center gap-3 pl-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                                {admin?.name?.charAt(0)}
                            </div>
                            <ArrowRightCircle className="w-4 h-4 text-slate-500 rotate-90" />
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
