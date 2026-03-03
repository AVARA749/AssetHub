import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-lg">
                                A
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
                                AssetHub
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                            Kenya&apos;s premier property and asset marketplace. Discover land, houses, cars, and trucks
                            with secure M-Pesa payments for viewing bookings.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Browse</h3>
                        <ul className="space-y-2">
                            <li><Link href="/listings?category=Land" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Land</Link></li>
                            <li><Link href="/listings?category=House" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Houses</Link></li>
                            <li><Link href="/listings?category=Car" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Cars</Link></li>
                            <li><Link href="/listings?category=Truck" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Trucks</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Contact</h3>
                        <ul className="space-y-2">
                            <li className="text-sm text-slate-400">📧 info@assethub.co.ke</li>
                            <li className="text-sm text-slate-400">📞 +254 700 000 000</li>
                            <li className="text-sm text-slate-400">📍 Nairobi, Kenya</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 mt-8 pt-8 text-center">
                    <p className="text-xs text-slate-500">
                        © {new Date().getFullYear()} AssetHub. All rights reserved. Powered by M-Pesa.
                    </p>
                </div>
            </div>
        </footer>
    );
}
