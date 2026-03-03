-- AssetHub Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'admin' or 'user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Properties Table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Land', 'House', 'Car', 'Truck'
    listing_type VARCHAR(50) NOT NULL, -- 'Sale', 'Rent', 'Lease'
    county VARCHAR(100) NOT NULL,
    town VARCHAR(100) NOT NULL,
    area VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    viewing_fee DECIMAL(10, 2) DEFAULT 0,
    contact_phone VARCHAR(20) NOT NULL,
    whatsapp_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'sold', 'rented'
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media Table (Multiple images per property)
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL, -- 'image', 'video'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table (Tracking viewing fee payments)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    mpesa_reference VARCHAR(100) UNIQUE,
    checkout_request_id VARCHAR(100) UNIQUE, -- Daraja API CheckoutRequestID
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'success', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_properties_category ON properties(category);
CREATE INDEX idx_properties_county ON properties(county);
CREATE INDEX idx_properties_town ON properties(town);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_checkout_request_id ON payments(checkout_request_id);
