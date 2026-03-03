# AssetHub - Implementation Plan

AssetHub is a Property & Asset Listing Marketplace for the Kenyan market, allowing admins to list properties (land, houses, cars, trucks) and users to browse, filter, and pay for viewing bookings via M-Pesa.

## 1. System Architecture
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, TypeScript, Zod, JWT, Multer.
- **Database**: PostgreSQL (using `pg` driver).
- **Payments**: Safaricom Daraja API (M-Pesa STK Push).
- **Storage**: Cloudinary for images and videos.

## 2. Phases of Development

### Phase 1: Backend Infrastructure (Current)
- [ ] Initialize Express + TS server.
- [ ] Database schema design and table creation.
- [ ] Middleware (Auth, Validation, Error Handling).
- [ ] Asset Management Routes (CRUD).
- [ ] Admin Dashboard Stats Routes.
- [ ] M-Pesa Daraja API Integration (STK Push + Callback).

### Phase 2: Frontend Core
- [ ] Next.js project setup.
- [ ] Design System (Colors, Typography, Layout components).
- [ ] Public Search & Filtering.
- [ ] Property Detail Pages (Gallery, Video, Booking).

### Phase 3: Admin Dashboard
- [ ] Secure Admin Login.
- [ ] Listing Management (Add, Edit, Delete).
- [ ] Media Uploads (Cloudinary).
- [ ] Analytics (Total Listings, Revenue, Bookings).

### Phase 4: Payment Flow & Security
- [ ] Book Viewing payment modal.
- [ ] STK push trigger and status checking.
- [ ] Unlocking seller contact details on success.
- [ ] JWT authentication for Admin routes.

### Phase 5: Polish & Documentation
- [ ] Responsive design adjustments.
- [ ] UI/UX animations and loading states.
- [ ] Final documentation (API, Deployment, M-Pesa).

## 3. Database Schema (PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Properties Table
```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- (Land, House, Car, Truck)
    listing_type VARCHAR(50) NOT NULL, -- (Sale, Rent, Lease)
    county VARCHAR(100) NOT NULL,
    town VARCHAR(100) NOT NULL,
    area VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    viewing_fee DECIMAL(10, 2) DEFAULT 0,
    contact_phone VARCHAR(20) NOT NULL,
    whatsapp_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'available', -- (Available, Sold, Rented)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Media Table
```sql
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL, -- (image, video)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Payments Table
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    user_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    mpesa_reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending', -- (pending, success, failed)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. Security & Performance
- JWT-based auth for Admin.
- Password hashing with Bcrypt.
- Zod for request body validation.
- Database indexing on `category`, `county`, `town`, and `price`.
- Cloudinary for image transformations and optimization.
