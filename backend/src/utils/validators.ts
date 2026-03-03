import { z } from 'zod';

export const createPropertySchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(255),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.enum(['Land', 'House', 'Car', 'Truck'], {
        message: 'Category must be Land, House, Car, or Truck'
    }),
    listing_type: z.enum(['Sale', 'Rent', 'Lease'], {
        message: 'Listing type must be Sale, Rent, or Lease'
    }),
    county: z.string().min(2, 'County is required'),
    town: z.string().min(2, 'Town is required'),
    area: z.string().min(2, 'Area is required'),
    price: z.number().positive('Price must be positive'),
    viewing_fee: z.number().min(0, 'Viewing fee cannot be negative').default(0),
    contact_phone: z.string().regex(/^254\d{9}$/, 'Phone must be in format 254XXXXXXXXX'),
    whatsapp_number: z.string().regex(/^254\d{9}$/, 'WhatsApp must be in format 254XXXXXXXXX').optional().nullable(),
    status: z.enum(['available', 'sold', 'rented']).default('available'),
});

export const updatePropertySchema = createPropertySchema.partial();

export const bookViewingSchema = z.object({
    user_name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().regex(/^254\d{9}$/, 'Phone must be in format 254XXXXXXXXX'),
    property_id: z.string().uuid('Invalid property ID'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().regex(/^254\d{9}$/, 'Phone must be in format 254XXXXXXXXX'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    inviteCode: z.string().optional(), // Used for restricting admin registration
});

export const filterSchema = z.object({
    category: z.enum(['Land', 'House', 'Car', 'Truck']).optional(),
    listing_type: z.enum(['Sale', 'Rent', 'Lease']).optional(),
    county: z.string().optional(),
    town: z.string().optional(),
    min_price: z.coerce.number().min(0).optional(),
    max_price: z.coerce.number().min(0).optional(),
    sort_by: z.enum(['created_at', 'price_asc', 'price_desc']).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(12),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type BookViewingInput = z.infer<typeof bookViewingSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type FilterInput = z.infer<typeof filterSchema>;
