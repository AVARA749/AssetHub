-- AssetHub Database Initialization Schema

-- Enable uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (Admins and potential future Users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Properties (Assets) table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    status VARCHAR(20) DEFAULT 'available', -- (available, sold, rented, pending)
    view_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Media table (Images and Videos)
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL, -- (image, video)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Payments table (M-Pesa STK Push results)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id),
    user_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    mpesa_reference VARCHAR(100),
    checkout_request_id VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending', -- (pending, success, failed)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Creating Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_county ON properties(county);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_payments_phone ON payments(phone);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Seed Initial Admin User (Admin@123456) - Use Bcrypt hashed password ideally, but here's a placeholder
-- Password is Admin@123456 (Hashed variant)
-- You may need to run this separately manually to ensure correct hashing if bcrypt is required immediately.
INSERT INTO users (name, phone, email, password, role)
VALUES ('AssetHub Admin', '254700000000', 'admin@assethub.co.ke', '$2a$10$fW3C.P.Yf/KzYd.K.P/fOe5/G/7/H/I/J/K/L/M/N/O/P/Q/R/S/T/U', 'admin')
ON CONFLICT (email) DO NOTHING;
