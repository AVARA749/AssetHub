'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    MapPin,
    Phone,
    MessageSquare,
    Eye,
    Calendar,
    Share2,
    PlayCircle,
    ShieldCheck,
    CreditCard,
    Lock,
    Unlock,
    CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentModal from '@/components/PaymentModal';
import { getPropertyById, verifyPayment } from '@/lib/api';
import { Property, Media } from '@/lib/types';
import { formatPrice, formatDate, timeAgo, CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/constants';
import toast from 'react-hot-toast';

function PropertyDetailContent() {
    const router = useRouter();
    const { id } = useParams() as { id: string };
    const [property, setProperty] = useState<Property | null>(null);
    const [media, setMedia] = useState<Media[]>([]);
    const [activeMedia, setActiveMedia] = useState<Media | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [unlockedDetails, setUnlockedDetails] = useState<{ contact_phone: string; whatsapp_number?: string } | null>(null);
    const [showingVideo, setShowingVideo] = useState(false);

    useEffect(() => {
        const fetchProperty = async () => {
            setLoading(true);
            try {
                const response = await getPropertyById(id);
                setProperty(response.property);
                setMedia(response.media);
                if (response.media.length > 0) {
                    setActiveMedia(response.media.find((m: Media) => m.file_type === 'image') || response.media[0]);
                }
            } catch (err: any) {
                setError(err.message || 'Property not found');
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [id]);

    const handleBookingSuccess = (details: { contact_phone: string; whatsapp_number?: string }) => {
        setUnlockedDetails(details);
        setShowPaymentModal(false);
        toast.success('Seller contact unlocked!');
    };

    const handleCall = () => {
        if (unlockedDetails) {
            window.location.href = `tel:${unlockedDetails.contact_phone}`;
        } else {
            setShowPaymentModal(true);
        }
    };

    const handleWhatsApp = () => {
        if (unlockedDetails && (unlockedDetails.whatsapp_number || unlockedDetails.contact_phone)) {
            const number = unlockedDetails.whatsapp_number || unlockedDetails.contact_phone;
            window.open(`https://wa.me/${number}?text=I'm interested in: ${property?.title}`, '_blank');
        } else {
            setShowPaymentModal(true);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-32 text-center">
                <Loader2 className="w-12 h-12 text-teal-400 animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-bold">Loading property details...</p>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-32 text-center">
                <h2 className="text-3xl font-black text-white mb-4">Oops! Property not found</h2>
                <p className="text-slate-400 mb-8">{error}</p>
                <button onClick={() => router.push('/listings')} className="btn-primary">Browse All Listings</button>
            </div>
        );
    }

    const images = media.filter(m => m.file_type === 'image');
    const video = media.find(m => m.file_type === 'video');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Listings
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Media & Details */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Gallery */}
                    <section className="space-y-4">
                        <div className="relative aspect-[16/10] glass-card overflow-hidden group">
                            {activeMedia?.file_type === 'image' && (
                                <Image
                                    src={activeMedia.file_url}
                                    alt={property.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            )}
                            {activeMedia?.file_type === 'video' && (
                                <video
                                    src={activeMedia.file_url}
                                    controls
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Badge Overlay */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className={`badge px-4 py-1.5 bg-gradient-to-r text-white font-bold shadow-lg ${CATEGORY_COLORS[property.category]}`}>
                                    {CATEGORY_ICONS[property.category]} {property.category}
                                </span>
                                <span className="badge badge-info bg-slate-900/80 backdrop-blur-md border-white/10 uppercase tracking-widest text-[10px]">
                                    For {property.listing_type}
                                </span>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {media.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setActiveMedia(m)}
                                    className={`relative w-24 aspect-[4/3] rounded-xl overflow-hidden glass-card shrink-0 transition-all ${activeMedia?.id === m.id ? 'border-2 border-teal-500 scale-105' : 'border-white/5 opacity-60 hover:opacity-100'}`}
                                >
                                    {m.file_type === 'image' ? (
                                        <Image src={m.file_url} alt="Thumbnail" fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                            <PlayCircle className="w-8 h-8 text-teal-400" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Title & Stats */}
                    <section className="glass-card p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-white/5">
                            <div>
                                <h1 className="text-4xl font-black text-white mb-3">
                                    {property.title}
                                </h1>
                                <div className="flex items-center gap-4 text-slate-400 text-sm">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-teal-400" />
                                        {property.town}, {property.county}
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-teal-400" />
                                        Added {timeAgo(property.created_at)}
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                    <span className="flex items-center gap-1.5">
                                        <Eye className="w-4 h-4 text-teal-400" />
                                        {property.view_count} Views
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs uppercase font-bold text-slate-500 tracking-widest mb-1">Total Price</p>
                                <p className="text-4xl font-black text-teal-400">{formatPrice(property.price)}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Asset Description
                            </h3>
                            <div className="text-slate-400 leading-relaxed whitespace-pre-wrap text-lg">
                                {property.description}
                            </div>
                        </div>

                        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Status</p>
                                <p className={`font-bold capitalize ${property.status === 'available' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {property.status}
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Listing ID</p>
                                <p className="font-bold text-white uppercase">{property.id.split('-')[0]}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Specific Area</p>
                                <p className="font-bold text-white">{property.area}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Category</p>
                                <p className="font-bold text-white">{property.category}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: CTA & Booking */}
                <div className="space-y-6">
                    <div className="glass-card p-8 sticky top-24 border-teal-500/20 shadow-2xl shadow-teal-900/10">
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-black text-white">Contact Seller</h3>
                                {unlockedDetails ? (
                                    <span className="badge badge-success flex gap-1 items-center px-4 animate-pulse">
                                        <Unlock className="w-3 h-3" /> Unlocked
                                    </span>
                                ) : (
                                    <span className="badge badge-warning flex gap-1 items-center px-4">
                                        <Lock className="w-3 h-3" /> Locked
                                    </span>
                                )}
                            </div>

                            {property.viewing_fee > 0 && !unlockedDetails && (
                                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
                                    <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1.5">Viewing Fee Required</p>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        Pay a small commitment fee of <span className="text-white font-black">{formatPrice(property.viewing_fee)}</span>
                                        via M-Pesa to unlock the seller&apos;s contact details and schedule a viewing.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {unlockedDetails ? (
                                <>
                                    <div className="fade-in space-y-4">
                                        <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Verified Contact</p>
                                            <p className="text-2xl font-black text-white">{unlockedDetails.contact_phone}</p>
                                            {unlockedDetails.whatsapp_number && (
                                                <p className="text-sm text-slate-400 mt-1">WhatsApp: {unlockedDetails.whatsapp_number}</p>
                                            )}
                                        </div>
                                        <button onClick={handleCall} className="btn-primary w-full py-4 text-base">
                                            <Phone className="w-5 h-5" /> Call Seller Now
                                        </button>
                                        <button onClick={handleWhatsApp} className="btn-outline w-full py-4 text-base border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                                            <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="btn-primary w-full py-5 text-lg shadow-xl shadow-teal-500/20 pulsate"
                                    >
                                        <CreditCard className="w-6 h-6" /> Book Viewing
                                    </button>
                                    <button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="btn-outline w-full py-4 text-slate-500 border-white/5 cursor-not-allowed grayscale"
                                    >
                                        <Phone className="w-5 h-5" /> [Phone Locked]
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5">
                            <div className="flex items-center gap-3 text-slate-500 mb-6">
                                <ShieldCheck className="w-4 h-4 text-teal-400" />
                                <p className="text-xs">Secure payments by Safaricom Daraja API</p>
                            </div>
                            <button className="flex items-center justify-center gap-2 w-full text-slate-400 hover:text-white transition-colors text-sm">
                                <Share2 className="w-4 h-4" /> Share This Listing
                            </button>
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-emerald-500/5 border-emerald-500/10">
                        <div className="flex gap-4">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                            <div>
                                <h4 className="text-white font-bold text-sm mb-1">Verified Listing</h4>
                                <p className="text-slate-400 text-xs">This asset has been reviewed by the AssetHub team to ensure accuracy of information.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                propertyId={id}
                propertyName={property.title}
                viewingFee={property.viewing_fee}
                onSuccess={handleBookingSuccess}
            />
        </div>
    );
}

// Simple loader icon
function Loader2({ className, ...props }: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className={className} {...props}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

export default function PropertyDetailPage() {
    return (
        <div className="min-h-screen pt-24 bg-slate-950">
            <Navbar />
            <Suspense fallback={<div className="h-screen flex items-center justify-center text-teal-400 font-bold">Loading Property Details...</div>}>
                <PropertyDetailContent />
            </Suspense>
            <Footer />
        </div>
    );
}
