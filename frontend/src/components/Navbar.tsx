'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/listings?q=${encodeURIComponent(searchQuery.trim())}`;
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5" style={{ borderRadius: 0 }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-lg group-hover:scale-110 transition-transform">
                            A
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
                            AssetHub
                        </span>
                    </Link>

                    {/* Desktop Search */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search properties, land, cars..."
                                className="input-field pl-10 py-2.5 text-sm"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </form>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/listings" className="text-sm text-slate-300 hover:text-teal-400 transition-colors font-medium">
                            Browse
                        </Link>
                        <Link href="/listings?category=Land" className="text-sm text-slate-300 hover:text-teal-400 transition-colors font-medium">
                            Land
                        </Link>
                        <Link href="/listings?category=House" className="text-sm text-slate-300 hover:text-teal-400 transition-colors font-medium">
                            Houses
                        </Link>
                        <Link href="/listings?category=Car" className="text-sm text-slate-300 hover:text-teal-400 transition-colors font-medium">
                            Cars
                        </Link>
                        <Link href="/admin" className="btn-outline text-sm py-2 px-4">
                            Admin
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-slate-300 hover:text-white"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden pb-4 slide-up">
                        <form onSubmit={handleSearch} className="mb-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search properties..."
                                className="input-field py-2.5 text-sm"
                            />
                        </form>
                        <div className="flex flex-col gap-2">
                            <Link href="/listings" className="text-slate-300 hover:text-teal-400 py-2 font-medium" onClick={() => setIsOpen(false)}>Browse All</Link>
                            <Link href="/listings?category=Land" className="text-slate-300 hover:text-teal-400 py-2 font-medium" onClick={() => setIsOpen(false)}>🏞️ Land</Link>
                            <Link href="/listings?category=House" className="text-slate-300 hover:text-teal-400 py-2 font-medium" onClick={() => setIsOpen(false)}>🏠 Houses</Link>
                            <Link href="/listings?category=Car" className="text-slate-300 hover:text-teal-400 py-2 font-medium" onClick={() => setIsOpen(false)}>🚗 Cars</Link>
                            <Link href="/listings?category=Truck" className="text-slate-300 hover:text-teal-400 py-2 font-medium" onClick={() => setIsOpen(false)}>🚛 Trucks</Link>
                            <Link href="/admin" className="btn-outline text-sm py-2 px-4 mt-2 text-center" onClick={() => setIsOpen(false)}>Admin Panel</Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
