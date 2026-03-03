'use client';

import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight, Shield, CreditCard, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/constants';

// Mock data for initial hero/featured (until API is live and populated)
const FEATURED_MOCK = [
  {
    id: '1',
    title: 'Luxury 5 Bedroom Villa',
    description: 'Beautiful modern villa in the heart of Karen, Nairobi.',
    category: 'House' as const,
    listing_type: 'Sale' as const,
    county: 'Nairobi',
    town: 'Karen',
    area: 'Karen Road',
    price: 85000000,
    viewing_fee: 1000,
    contact_phone: '254700000000',
    status: 'available' as const,
    view_count: 120,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Modern SUV - Showroom Condition',
    description: 'Top of the range SUV, single owner, low mileage.',
    category: 'Car' as const,
    listing_type: 'Sale' as const,
    county: 'Nairobi',
    town: 'Westlands',
    area: 'Waiyaki Way',
    price: 4500000,
    viewing_fee: 500,
    contact_phone: '254700000000',
    status: 'available' as const,
    view_count: 85,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: '10 Acre Agricultural Land',
    description: 'Prime agricultural land with permanent river access.',
    category: 'Land' as const,
    listing_type: 'Sale' as const,
    county: 'Nakuru',
    town: 'Naivasha',
    area: 'Moi South Lake Road',
    price: 15000000,
    viewing_fee: 1500,
    contact_phone: '254700000000',
    status: 'available' as const,
    view_count: 210,
    created_at: new Date().toISOString(),
  }
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="badge badge-success mb-6 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                  🚀 Kenya&apos;s Premium Asset Marketplace
                </span>
                <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tight text-white">
                  Discover Your Next <span className="bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">Great Asset</span> with Confidence
                </h1>
                <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-2xl">
                  AssetHub simplifies how you buy, rent or lease properties and vehicles in Kenya.
                  Secure viewing bookings with M-Pesa and unlock direct contact with sellers instantly.
                </p>

                {/* Hero Search */}
                <div className="glass-card p-2 flex flex-col md:flex-row gap-2 max-w-2xl shadow-2xl border-white/10">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="What are you looking for?"
                      className="w-full bg-slate-900/50 border-none rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:ring-0"
                    />
                  </div>
                  <button className="btn-primary py-4 px-8 text-base">
                    Search Now
                  </button>
                </div>

                <div className="mt-8 flex items-center gap-6 text-slate-500 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Verified Sellers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Secure M-Pesa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>100% Transparent</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Category Explorer */}
        <section className="py-20 border-t border-white/5 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-black text-white mb-4">Explore by Category</h2>
                <p className="text-slate-400">Find exactly what you are looking for in our curated categories.</p>
              </div>
              <Link href="/listings" className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-2 group">
                View All Listings <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {CATEGORIES.map((cat, idx) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    href={`/listings?category=${cat}`}
                    className="glass-card-hover p-8 flex flex-col items-center text-center group"
                  >
                    <div className={`w-16 h-16 rounded-2xl mb-6 bg-gradient-to-br ${CATEGORY_COLORS[cat]} flex items-center justify-center text-3xl shadow-lg shadow-teal-900/20 group-hover:scale-110 transition-transform`}>
                      {CATEGORY_ICONS[cat]}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{cat}</h3>
                    <p className="text-xs text-slate-500">Discover premium {cat.toLowerCase()}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4">Featured Assets</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Handpicked properties and vehicles that offer exceptional value and quality.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURED_MOCK.map((property, idx) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <PropertyCard property={property as any} />
                </motion.div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link href="/listings" className="btn-outline px-10 py-4">
                View Premium Collection
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-gradient-to-b from-slate-900/50 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-card p-12 lg:p-20 relative overflow-hidden">
              {/* Decorative light */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 leading-tight">
                    The Safest Way to Buy <br /> & Rent in <span className="text-teal-400">Kenya</span>
                  </h2>
                  <div className="space-y-8">
                    <div className="flex gap-6">
                      <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                        <Shield className="w-6 h-6 text-teal-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">Verified Direct Contacts</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">We verify all sellers and ensure that contact details are only unlocked after proof of intent through a secure viewing fee.</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <CreditCard className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">Seamless M-Pesa STK Push</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">No manual reconciliation. Pay with one click using M-Pesa and get instant confirmation and access to seller details.</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">Instant Updates</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Admins and users receive real-time notifications for every booking and payment made on the platform.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative aspect-square">
                  {/* This would be an illustration or an app mockup in a real project */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-3xl backdrop-blur-3xl border border-white/5 flex items-center justify-center shadow-2xl">
                    <div className="p-8 text-center">
                      <div className="w-24 h-24 mx-auto mb-6 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                        <CheckCircle className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">Payment Confirmed</h3>
                      <p className="text-emerald-400 font-bold mb-6">M-PESA REF: QW728E91H</p>
                      <div className="glass-card p-4 rounded-xl text-left bg-slate-900/80">
                        <p className="text-xs text-slate-500 mb-1">Seller Contact</p>
                        <p className="text-xl font-bold text-white">+254 712 345 678</p>
                      </div>
                    </div>
                  </div>

                  {/* Float elements */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-6 -right-6 glass-card p-4 shadow-xl border-teal-500/30"
                  >
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1">Total Revenue</p>
                    <p className="text-xl font-black text-teal-400">KES 1.2M+</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
