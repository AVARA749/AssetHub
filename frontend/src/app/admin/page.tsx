import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight, User, Phone, Key, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminLogin, adminRegister, getAdminStatus } from '@/lib/api';

export default function AdminPortal() {
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(true); // Default to true while checking
    const [checkingStatus, setCheckingStatus] = useState(true);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        inviteCode: ''
    });

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const { initialized } = await getAdminStatus();
                setIsInitialized(initialized);
                // If not initialized, automatically show registration
                if (!initialized) setIsRegister(true);
            } catch (error) {
                console.error('Failed to check admin status');
            } finally {
                setCheckingStatus(false);
            }
        };
        checkStatus();
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegister) {
                await adminRegister(formData);
                toast.success('Admin account created! Access granted.');
                setIsInitialized(true);
                setIsRegister(false);
            } else {
                const response = await adminLogin({ email: formData.email, password: formData.password });
                localStorage.setItem('assethub_token', response.token);
                localStorage.setItem('assethub_admin', JSON.stringify(response.admin));
                toast.success('Welcome back, Admin!');
                router.push('/admin/dashboard');
            }
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    if (checkingStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
            {/* Background Vibe */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-teal-500/5 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/5 blur-[150px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8 relative z-10 shadow-2xl border-white/5"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-xl shadow-teal-500/20">
                        {isRegister ? <Sparkles className="w-8 h-8" /> : 'A'}
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                        {isRegister ? 'Initial Setup' : 'Admin Login'}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {isRegister ? 'Configure your single administrator account' : 'Authorized administrator access only'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                        {isRegister && (
                            <motion.div
                                key="reg-fields"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 overflow-hidden"
                            >
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            name="name" required type="text" placeholder="John Doe"
                                            value={formData.name} onChange={handleInput} className="input-field pl-12"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            name="phone" required type="tel" placeholder="254700000000"
                                            value={formData.phone} onChange={handleInput} className="input-field pl-12"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                name="email" required type="email" placeholder="admin@assethub.co.ke"
                                value={formData.email} onChange={handleInput} className="input-field pl-12"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                name="password" required type="password" placeholder="••••••••"
                                value={formData.password} onChange={handleInput} className="input-field pl-12"
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {isRegister && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                className="space-y-1"
                            >
                                <label className="text-[10px] font-black text-teal-500 uppercase tracking-widest pl-1">Invite Code</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                                    <input
                                        name="inviteCode" required type="text" placeholder="EX: ASSETHUB_2024"
                                        value={formData.inviteCode} onChange={handleInput} className="input-field pl-12 border-teal-500/30 focus:border-teal-500"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="pt-4">
                        <button
                            type="submit" disabled={loading}
                            className="btn-primary w-full py-4 text-base group flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isRegister ? 'Publish Administrator' : 'Sign in to Dashboard'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {!isInitialized && (
                    <div className="mt-6 p-4 rounded-xl bg-teal-500/5 border border-teal-500/20">
                        <p className="text-[10px] text-teal-400 font-bold uppercase text-center leading-relaxed">
                            System not yet initialized. <br /> Create the master account to proceed.
                        </p>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-3 opacity-40 uppercase tracking-[0.2em]">
                    <ShieldCheck className="w-5 h-5 text-teal-400" />
                    <span className="text-[10px] text-slate-500 font-black">Single Node Security</span>
                </div>
            </motion.div>
        </div>
    );
}
