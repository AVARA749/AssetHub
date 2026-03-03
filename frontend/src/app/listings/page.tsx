'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, ChevronDown, X, SlidersHorizontal, MapPin, Tag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { getProperties, getCounties, getTowns } from '@/lib/api';
import { Property, FilterState, Pagination } from '@/lib/types';
import { CATEGORIES, LISTING_TYPES, KENYAN_COUNTIES, formatPrice } from '@/lib/constants';

function ListingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [filters, setFilters] = useState<FilterState>({
        category: searchParams.get('category') || undefined,
        listing_type: searchParams.get('listing_type') || undefined,
        county: searchParams.get('county') || undefined,
        min_price: searchParams.get('min_price') || undefined,
        max_price: searchParams.get('max_price') || undefined,
        sort_by: searchParams.get('sort_by') || 'created_at',
        page: searchParams.get('page') || '1',
    });

    const query = searchParams.get('q') || '';

    const fetchListings = async () => {
        setLoading(true);
        try {
            const activeFilters: Record<string, string> = {};
            Object.entries(filters).forEach(([key, value]) => {
                if (value) activeFilters[key] = value;
            });
            if (query) activeFilters['q'] = query;

            const response = await getProperties(activeFilters);
            setProperties(response.properties);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch properties');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [searchParams, filters.page]);

    const updateFilters = (newFilters: Partial<FilterState>) => {
        const updated = { ...filters, ...newFilters, page: '1' };
        setFilters(updated);

        // Update URL
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        Object.entries(updated).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        router.push(`/listings?${params.toString()}`);
    };

    const clearFilters = () => {
        const cleared = { sort_by: 'created_at', page: '1' };
        setFilters(cleared);
        router.push('/listings');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header & Search Summary */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2">
                    {query ? `Search results for "${query}"` : 'Browse All Assets'}
                </h1>
                <p className="text-slate-400">
                    Showing {pagination?.total || 0} premium listings available across Kenya.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Mobile Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden w-full btn-outline flex items-center justify-center gap-2 mb-4 py-3"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>

                {/* Filters Sidebar */}
                <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 glass-card p-6 sticky top-24 shrink-0 overflow-y-auto max-h-[80vh]`}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Filter className="w-4 h-4 text-teal-400" /> Filters
                        </h3>
                        {(filters.category || filters.county || filters.listing_type || filters.min_price || filters.max_price) && (
                            <button onClick={clearFilters} className="text-xs text-teal-400 hover:text-white transition-colors">
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="space-y-8">
                        {/* Category */}
                        <div>
                            <p className="text-xs font-black uppercase text-slate-500 mb-3 tracking-widest">Category</p>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => updateFilters({ category: filters.category === cat ? undefined : cat })}
                                        className={`badge cursor-pointer transition-all ${filters.category === cat ? 'bg-teal-500 text-white border-teal-500' : 'bg-slate-900/50 text-slate-400 border-white/5 hover:border-teal-500/50'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Listing Type */}
                        <div>
                            <p className="text-xs font-black uppercase text-slate-500 mb-3 tracking-widest">Type</p>
                            <div className="flex flex-col gap-2">
                                {LISTING_TYPES.map(type => (
                                    <label key={type} className="flex items-center gap-3 group cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.listing_type === type}
                                            onChange={() => updateFilters({ listing_type: filters.listing_type === type ? undefined : type })}
                                            className="w-4 h-4 rounded bg-slate-900 border-white/10 text-teal-500 focus:ring-teal-500/20"
                                        />
                                        <span className={`text-sm transition-colors ${filters.listing_type === type ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                            For {type}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Location (County) */}
                        <div>
                            <p className="text-xs font-black uppercase text-slate-500 mb-3 tracking-widest">County</p>
                            <div className="relative">
                                <select
                                    value={filters.county || ''}
                                    onChange={(e) => updateFilters({ county: e.target.value || undefined })}
                                    className="input-field appearance-none"
                                >
                                    <option value="">All Counties</option>
                                    {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <p className="text-xs font-black uppercase text-slate-500 mb-3 tracking-widest">Price Range (KES)</p>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.min_price || ''}
                                    onChange={(e) => updateFilters({ min_price: e.target.value || undefined })}
                                    className="input-field"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.max_price || ''}
                                    onChange={(e) => updateFilters({ max_price: e.target.value || undefined })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        {/* Sort */}
                        <div>
                            <p className="text-xs font-black uppercase text-slate-500 mb-3 tracking-widest">Sort By</p>
                            <select
                                value={filters.sort_by}
                                onChange={(e) => updateFilters({ sort_by: e.target.value })}
                                className="input-field"
                            >
                                <option value="created_at">Recently Added</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </aside>

                {/* Listings Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="glass-card h-[400px] overflow-hidden">
                                    <div className="h-56 shimmer" />
                                    <div className="p-5 space-y-4">
                                        <div className="h-4 w-1/2 shimmer rounded" />
                                        <div className="h-6 w-full shimmer rounded" />
                                        <div className="flex justify-between mt-auto">
                                            <div className="h-10 w-24 shimmer rounded" />
                                            <div className="h-10 w-24 shimmer rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="glass-card p-12 text-center text-red-400 font-bold border-red-500/20">
                            {error}
                            <button onClick={fetchListings} className="block mx-auto mt-4 btn-outline">Try Again</button>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="glass-card p-20 text-center">
                            <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-6">
                                <Search className="w-10 h-10 text-slate-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No listings found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8">We couldn&apos;t find any assets matching your filters. Try adjusting your search criteria.</p>
                            <button onClick={clearFilters} className="btn-primary">Clear All Filters</button>
                        </div>
                    ) : (
                        <>
                            <motion.div
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                            >
                                <AnimatePresence>
                                    {properties.map(property => (
                                        <motion.div
                                            key={property.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <PropertyCard property={property} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="mt-12 flex justify-center items-center gap-4">
                                    <button
                                        disabled={Number(filters.page) === 1}
                                        onClick={() => updateFilters({ page: String(Number(filters.page) - 1) })}
                                        className="btn-outline py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm font-bold text-slate-400">
                                        Page <span className="text-white">{filters.page}</span> of {pagination.totalPages}
                                    </span>
                                    <button
                                        disabled={Number(filters.page) === pagination.totalPages}
                                        onClick={() => updateFilters({ page: String(Number(filters.page) + 1) })}
                                        className="btn-outline py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ListingsPage() {
    return (
        <div className="min-h-screen pt-24">
            <Navbar />
            <Suspense fallback={<div className="h-screen flex items-center justify-center text-teal-400 font-bold">Loading AssetHub...</div>}>
                <ListingsContent />
            </Suspense>
            <Footer />
        </div>
    );
}
