export const KENYAN_COUNTIES = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
    'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
    'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
    'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
    'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
    'Meru', 'Migori', 'Mombasa', 'Muranga', 'Nairobi',
    'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
    'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
    'Tharaka-Nithi', 'Trans-Nzoia', 'Turkana', 'Uasin Gishu',
    'Vihiga', 'Wajir', 'West Pokot',
];

export const CATEGORIES = ['Land', 'House', 'Car', 'Truck'] as const;
export const LISTING_TYPES = ['Sale', 'Rent', 'Lease'] as const;
export const STATUS_OPTIONS = ['available', 'sold', 'rented'] as const;

export const CATEGORY_ICONS: Record<string, string> = {
    Land: '🏞️',
    House: '🏠',
    Car: '🚗',
    Truck: '🚛',
};

export const CATEGORY_COLORS: Record<string, string> = {
    Land: 'from-emerald-500 to-green-600',
    House: 'from-blue-500 to-indigo-600',
    Car: 'from-orange-500 to-red-500',
    Truck: 'from-purple-500 to-violet-600',
};

export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatPhone = (phone: string): string => {
    if (phone.startsWith('254')) {
        return `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
    }
    return phone;
};

export const timeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
};
