'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    MapPin,
    CreditCard,
    Upload,
    X,
    PlusCircle,
    Loader2,
    ShieldCheck,
    Save,
    ArrowLeft,
    ChevronDown,
    Info,
    Image as ImageIcon,
    CheckCircle2,
    Lock,
    Smartphone,
    Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createProperty, getPropertyById, updateProperty } from '@/lib/api';
import { CATEGORIES, LISTING_TYPES, KENYAN_COUNTIES, STATUS_OPTIONS } from '@/lib/constants';

export default function AdminPropertyForm() {
    const router = useRouter();
    const { id } = useParams() as { id?: string };
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    const [previews, setPreviews] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [existingMedia, setExistingMedia] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Land',
        listing_type: 'Sale',
        county: 'Nairobi',
        town: '',
        area: '',
        price: '',
        viewing_fee: '0',
        contact_phone: '',
        whatsapp_number: '',
        status: 'available'
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            const fetchProperty = async () => {
                try {
                    const response = await getPropertyById(id!);
                    const { property, media } = response;
                    setFormData({
                        title: property.title,
                        description: property.description,
                        category: property.category,
                        listing_type: property.listing_type,
                        county: property.county,
                        town: property.town,
                        area: property.area,
                        price: String(property.price),
                        viewing_fee: String(property.viewing_fee),
                        contact_phone: property.contact_phone,
                        whatsapp_number: property.whatsapp_number || '',
                        status: property.status
                    });
                    setExistingMedia(media);
                } catch (error: any) {
                    toast.error('Failed to load property details');
                    router.push('/admin/properties');
                } finally {
                    setFetching(false);
                }
            };
            fetchProperty();
        }
    }, [id, isEditing, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length + previews.length + existingMedia.length > 10) {
            toast.error('Maximum 10 media items allowed');
            return;
        }

        setFiles([...files, ...selectedFiles]);
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('assethub_token');
        if (!token) return;

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });

            files.forEach(file => {
                data.append('files', file);
            });

            if (isEditing) {
                await updateProperty(token, id!, data);
                toast.success('Asset updated successfully');
            } else {
                await createProperty(token, data);
                toast.success('Asset published successfully');
            }
            router.push('/admin/properties');
        } catch (error: any) {
            toast.error(error.message || 'Verification failed. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest">Decrypting Asset Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-6 mb-12">
                <button onClick={() => router.back()} className="p-3 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-white/5 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-2">
                        {isEditing ? 'Curate Asset' : 'Digitize Asset'}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium tracking-wide">
                        {isEditing ? `Refining ID: ${id?.split('-')[0]}` : 'Configure a new premium listing for the marketplace.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <section className="glass-card p-10 space-y-8 shadow-2xl">
                        <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                                <Package className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Identity & Definition</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Primary Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Modern 5 Bedroom Villa in Karen"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-field text-lg font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Detailed Narrative</label>
                                <textarea
                                    required
                                    rows={8}
                                    placeholder="Elaborate on the asset's unique value proposals, technical specifications, and historical context..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field resize-none py-4 leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Market Classification</label>
                                    <div className="relative">
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="input-field appearance-none"
                                        >
                                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Engagement Type</label>
                                    <div className="relative">
                                        <select
                                            value={formData.listing_type}
                                            onChange={(e) => setFormData({ ...formData, listing_type: e.target.value })}
                                            className="input-field appearance-none"
                                        >
                                            {LISTING_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Location Info */}
                    <section className="glass-card p-10 space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
                        <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Geospatial Logistics</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">County / Administrative Zone</label>
                                <div className="relative">
                                    <select
                                        value={formData.county}
                                        onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                                        className="input-field appearance-none"
                                    >
                                        {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Primary Town / Municipality</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Eldoret Centre"
                                    value={formData.town}
                                    onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Specific Perimeter / Area Address</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Block 4, Section B, Near Highway exit"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Media Section */}
                    <section className="glass-card p-10 space-y-8">
                        <div className="flex items-center justify-between pb-6 border-b border-white/5">
                            <div className="flex items-center gap-3 text-teal-400">
                                <ImageIcon className="w-6 h-6" />
                                <h3 className="text-xl font-bold text-white tracking-tight">Visonary Portfolio</h3>
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                                {previews.length + existingMedia.length} / 10 Assets
                            </span>
                        </div>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="group relative h-48 rounded-3xl border-2 border-dashed border-white/5 hover:border-teal-500/30 bg-white/[0.02] hover:bg-teal-500/[0.03] transition-all cursor-pointer flex flex-col items-center justify-center gap-4 overflow-hidden"
                        >
                            <Upload className="w-10 h-10 text-slate-600 group-hover:text-teal-400 group-hover:-translate-y-1 transition-all" />
                            <div className="text-center">
                                <p className="text-sm font-black text-white px-8">Propagate Visionary Media</p>
                                <p className="text-xs text-slate-500 mt-1">High fidelity JPEG or PNG. Max 10MB/file.</p>
                            </div>
                            <input
                                multiple
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                        </div>

                        <AnimatePresence>
                            {(previews.length > 0 || existingMedia.length > 0) && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 pt-4">
                                    {existingMedia.map((media) => (
                                        <motion.div
                                            key={media.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative aspect-square rounded-2xl overflow-hidden glass-card border-white/5 group"
                                        >
                                            <img src={media.file_url} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center pointer-events-none">
                                                <Lock className="w-4 h-4 text-white" />
                                            </div>
                                        </motion.div>
                                    ))}
                                    {previews.map((preview, i) => (
                                        <motion.div
                                            key={preview}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="relative aspect-square rounded-2xl overflow-hidden group shadow-2xl"
                                        >
                                            <img src={preview} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(i)}
                                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </section>
                </div>

                {/* Sidebar Configuration */}
                <aside className="space-y-8">
                    <div className="glass-card p-8 space-y-8 shadow-2xl border-teal-500/10">
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-6 h-6 text-emerald-400" />
                            <h3 className="text-lg font-black text-white tracking-widest uppercase">Financials</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-1">Total Valuation (KES)</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="number"
                                        placeholder="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="input-field pl-12 text-teal-400 font-black text-lg"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">K</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-1">Commitment Fee (KES)</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="number"
                                        placeholder="0"
                                        value={formData.viewing_fee}
                                        onChange={(e) => setFormData({ ...formData, viewing_fee: e.target.value })}
                                        className="input-field pl-12 text-amber-500 font-black"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">V</span>
                                </div>
                                <p className="text-[9px] text-slate-600 px-1 pt-1 italic font-medium leading-[1.1]">The cost to unlock the direct seller contact via M-Pesa.</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 space-y-8 border-indigo-500/10">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-6 h-6 text-indigo-400" />
                            <h3 className="text-lg font-black text-white tracking-widest uppercase">Custodian</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-1">Validated Contact</label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="254 7XX XXX XXX"
                                    value={formData.contact_phone}
                                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                    className="input-field font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-1">WhatsApp Channel</label>
                                <input
                                    type="tel"
                                    placeholder="254 7XX XXX XXX"
                                    value={formData.whatsapp_number}
                                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                    className="input-field font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 space-y-8 bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <Activity className="w-6 h-6 text-slate-400" />
                            <h3 className="text-lg font-black text-white tracking-widest uppercase">Lifecycle</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-1">Inventory Status</label>
                                <div className="relative">
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="input-field appearance-none font-bold"
                                    >
                                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt.toUpperCase()}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 space-y-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-5 text-lg font-black group shadow-xl shadow-teal-500/20"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <span className="flex items-center justify-center gap-3">
                                        <Save className="w-6 h-6" /> {isEditing ? 'Authorize Update' : 'Publish Asset'}
                                    </span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/admin/properties')}
                                className="w-full py-4 text-sm font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]"
                            >
                                Cancel Configuration
                            </button>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-teal-500/5 border border-teal-500/10 flex gap-4">
                        <Info className="w-6 h-6 text-teal-400 shrink-0" />
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Publishing this asset will immediately list it across the marketplace.
                            Ensure all technical specifications and valuation metrics are verified before authorization.
                        </p>
                    </div>
                </aside>
            </form>
        </div>
    );
}
