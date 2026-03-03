'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Loader2, CheckCircle2, AlertCircle, Phone, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { initiatePayment, checkPaymentStatus } from '@/lib/api';
import { formatPrice } from '@/lib/constants';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
    propertyName: string;
    viewingFee: number;
    onSuccess: (contactDetails: { contact_phone: string; whatsapp_number?: string }) => void;
}

export default function PaymentModal({
    isOpen,
    onClose,
    propertyId,
    propertyName,
    viewingFee,
    onSuccess
}: PaymentModalProps) {
    const [step, setStep] = useState<'form' | 'processing' | 'success' | 'failed'>('form');
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [checkoutRequestId, setCheckoutRequestId] = useState('');
    const [statusMessage, setStatusMessage] = useState('Waiting for M-Pesa confirmation...');

    const handleInitiate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Simple validation for Kenyan phone: 254XXXXXXXXX or 07XXXXXXXX or 01XXXXXXXX
        let formattedPhone = phone.trim();
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        } else if (formattedPhone.startsWith('+254')) {
            formattedPhone = formattedPhone.substring(1);
        } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
            formattedPhone = '254' + formattedPhone;
        }

        if (!/^254\d{9}$/.test(formattedPhone)) {
            toast.error('Please enter a valid Kenyan phone number (e.g., 0712345678)');
            return;
        }

        setStep('processing');
        try {
            const response = await initiatePayment({
                user_name: userName,
                phone: formattedPhone,
                property_id: propertyId
            });

            if (response.already_paid) {
                setStep('success');
                onSuccess({
                    contact_phone: response.contact_phone,
                    whatsapp_number: response.whatsapp_number
                });
                return;
            }

            setCheckoutRequestId(response.checkout_request_id);
            startPolling(response.checkout_request_id);
        } catch (error: any) {
            setStep('form');
            toast.error(error.message || 'Failed to initiate payment');
        }
    };

    const startPolling = (requestId: string) => {
        let attempts = 0;
        const maxAttempts = 15; // 45 seconds total polling

        const interval = setInterval(async () => {
            attempts++;
            try {
                const response = await checkPaymentStatus(requestId);

                if (response.status === 'success') {
                    clearInterval(interval);
                    setStep('success');
                    onSuccess({
                        contact_phone: response.contact_phone,
                        whatsapp_number: response.whatsapp_number
                    });
                    toast.success('Payment confirmed!');
                } else if (response.status === 'failed') {
                    clearInterval(interval);
                    setStep('failed');
                    toast.error('Payment failed or cancelled.');
                }
            } catch (error) {
                // Silently continue polling
            }

            if (attempts >= maxAttempts) {
                clearInterval(interval);
                setStep('failed');
                setStatusMessage('Payment timeout. Please check your phone and try again.');
            }
        }, 3000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="glass-card w-full max-w-md overflow-hidden relative"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {step === 'form' && <><CreditCard className="w-5 h-5 text-teal-400" /> Book Viewing</>}
                            {step === 'processing' && <><Loader2 className="w-5 h-5 text-teal-400 animate-spin" /> Processing</>}
                            {step === 'success' && <><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Success</>}
                            {step === 'failed' && <><AlertCircle className="w-5 h-5 text-red-500" /> Payment Error</>}
                        </h3>
                        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-8">
                        {step === 'form' && (
                            <form onSubmit={handleInitiate} className="space-y-6">
                                <div className="text-center mb-8">
                                    <p className="text-slate-400 text-sm mb-1">Paying for</p>
                                    <p className="text-white font-bold mb-2">{propertyName}</p>
                                    <p className="text-3xl font-black text-teal-400">{formatPrice(viewingFee)}</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. John Doe"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">M-Pesa Phone Number</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                required
                                                type="tel"
                                                placeholder="07XX XXX XXX"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="input-field pl-12"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button type="submit" className="btn-primary w-full py-4 text-base shadow-xl">
                                        Pay with M-Pesa
                                    </button>
                                    <p className="text-[10px] text-slate-500 text-center mt-4 uppercase tracking-[0.2em]">
                                        🔒 Secure Encrypted Transaction
                                    </p>
                                </div>
                            </form>
                        )}

                        {step === 'processing' && (
                            <div className="text-center py-10 space-y-6">
                                <div className="w-20 h-20 mx-auto bg-teal-500/10 rounded-full flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
                                    <Smartphone className="w-8 h-8 text-teal-400" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold text-white">Check Your Phone</h4>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                        A prompt has been sent to <span className="text-white font-bold">{phone}</span>.
                                        Please enter your M-Pesa PIN to complete the booking.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <p className="text-slate-500 text-xs flex items-center justify-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" /> {statusMessage}
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="text-center py-10 space-y-6 slide-up">
                                <div className="w-20 h-20 mx-auto bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20">
                                    <CheckCircle2 className="w-10 h-10 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-black text-white">Booking Confirmed!</h4>
                                    <p className="text-slate-400 text-sm">
                                        Thank you, <span className="text-white font-bold">{userName}</span>. Your payment was successful.
                                        The seller&apos;s contact details are now unlocked.
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="btn-primary w-full py-4"
                                >
                                    View Seller Details
                                </button>
                            </div>
                        )}

                        {step === 'failed' && (
                            <div className="text-center py-10 space-y-6 slide-up">
                                <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-10 h-10 text-red-500" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold text-white">Payment Not Resolved</h4>
                                    <p className="text-slate-400 text-sm">
                                        {statusMessage}
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep('form')}
                                        className="btn-outline flex-1 py-3"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="btn-primary flex-1 py-3"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
