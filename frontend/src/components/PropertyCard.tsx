import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/lib/types';
import { formatPrice, CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/constants';

interface PropertyCardProps {
    property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
    const {
        id,
        title,
        category,
        listing_type,
        county,
        town,
        price,
        thumbnail,
        viewing_fee,
        status
    } = property;

    return (
        <div className="glass-card-hover group overflow-hidden h-full flex flex-col">
            {/* Image Container */}
            <div className="relative h-56 w-full overflow-hidden">
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized // Useful for Cloudinary URLs during development
                    />
                ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                        <span className="text-4xl">{CATEGORY_ICONS[category] || '🏠'}</span>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className={`badge px-3 py-1 bg-gradient-to-r text-white shadow-lg ${CATEGORY_COLORS[category]}`}>
                        {CATEGORY_ICONS[category]} {category}
                    </span>
                    <span className="badge badge-info bg-slate-900/80 backdrop-blur-md border-white/10 uppercase tracking-widest text-[10px]">
                        For {listing_type}
                    </span>
                </div>

                {status !== 'available' && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="badge badge-danger text-lg px-6 py-2 uppercase font-black rotate-[-12deg] shadow-2xl">
                            {status}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="mb-2">
                    <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{town}, {county}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-100 line-clamp-1 group-hover:text-teal-400 transition-colors">
                        {title}
                    </h3>
                </div>

                <div className="mt-auto pt-4 flex items-end justify-between border-t border-white/5">
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Price</p>
                        <p className="text-xl font-black text-teal-400">{formatPrice(price)}</p>
                    </div>

                    <div className="text-right">
                        {viewing_fee > 0 ? (
                            <>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Viewing Fee</p>
                                <p className="text-sm font-bold text-amber-500 leading-none">{formatPrice(viewing_fee)}</p>
                            </>
                        ) : (
                            <p className="text-xs font-bold text-emerald-500">Free Viewing</p>
                        )}
                    </div>
                </div>

                <Link href={`/property/${id}`} className="mt-5 btn-primary w-full text-sm py-2.5">
                    View Details
                </Link>
            </div>
        </div>
    );
}
