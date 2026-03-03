export interface Property {
    id: string;
    title: string;
    description: string;
    category: 'Land' | 'House' | 'Car' | 'Truck';
    listing_type: 'Sale' | 'Rent' | 'Lease';
    county: string;
    town: string;
    area: string;
    price: number;
    viewing_fee: number;
    contact_phone: string;
    whatsapp_number?: string;
    status: 'available' | 'sold' | 'rented';
    view_count: number;
    created_at: string;
    thumbnail?: string;
    media_count?: number;
    booking_count?: number;
}

export interface Media {
    id: string;
    property_id: string;
    file_url: string;
    file_type: 'image' | 'video';
    created_at: string;
}

export interface Payment {
    id: string;
    property_id: string;
    user_name: string;
    phone: string;
    amount: number;
    mpesa_reference?: string;
    checkout_request_id?: string;
    status: 'pending' | 'success' | 'failed';
    created_at: string;
    property_title?: string;
}

export interface DashboardStats {
    stats: {
        totalListings: number;
        activeListings: number;
        totalRevenue: number;
        totalBookings: number;
    };
    mostViewedProperties: Property[];
    recentPayments: Payment[];
    categoryStats: { category: string; count: number }[];
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface FilterState {
    category?: string;
    listing_type?: string;
    county?: string;
    town?: string;
    min_price?: string;
    max_price?: string;
    sort_by?: string;
    page?: string;
}
