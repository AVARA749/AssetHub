import { Request, Response } from 'express';
import { query } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';

// POST /api/admin/login
export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const result = await query("SELECT * FROM users WHERE email = $1 AND role = 'admin'", [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const admin = result.rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign(
            { id: admin.id, role: admin.role, email: admin.email },
            secret,
            { expiresIn: '24h' } as jwt.SignOptions
        );

        res.json({
            message: 'Login successful',
            token,
            admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
        });
    } catch (error: any) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
};

// GET /api/admin/dashboard - Dashboard stats
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const [
            totalListings,
            activeListings,
            totalRevenue,
            totalBookings,
            mostViewed,
            recentPayments,
            categoryStats,
        ] = await Promise.all([
            query('SELECT COUNT(*) FROM properties'),
            query("SELECT COUNT(*) FROM properties WHERE status = 'available'"),
            query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'success'"),
            query("SELECT COUNT(*) FROM payments WHERE status = 'success'"),
            query(`
        SELECT p.*, 
          (SELECT file_url FROM media WHERE property_id = p.id AND file_type = 'image' LIMIT 1) as thumbnail
        FROM properties p 
        ORDER BY p.view_count DESC 
        LIMIT 5
      `),
            query(`
        SELECT py.*, p.title as property_title 
        FROM payments py 
        LEFT JOIN properties p ON py.property_id = p.id 
        ORDER BY py.created_at DESC 
        LIMIT 20
      `),
            query(`
        SELECT category, COUNT(*) as count 
        FROM properties 
        GROUP BY category 
        ORDER BY count DESC
      `),
        ]);

        res.json({
            stats: {
                totalListings: parseInt(totalListings.rows[0].count),
                activeListings: parseInt(activeListings.rows[0].count),
                totalRevenue: parseFloat(totalRevenue.rows[0].total),
                totalBookings: parseInt(totalBookings.rows[0].count),
            },
            mostViewedProperties: mostViewed.rows,
            recentPayments: recentPayments.rows,
            categoryStats: categoryStats.rows,
        });
    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
};

// GET /api/admin/properties - All properties for admin (including inactive)
export const getAdminProperties = async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 20, status, category } = req.query;
        const conditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (status) {
            conditions.push(`p.status = $${paramIndex++}`);
            params.push(status);
        }
        if (category) {
            conditions.push(`p.category = $${paramIndex++}`);
            params.push(category);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const offset = (Number(page) - 1) * Number(limit);

        const countResult = await query(`SELECT COUNT(*) FROM properties p ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count);

        const result = await query(
            `SELECT p.*, 
        (SELECT file_url FROM media WHERE property_id = p.id AND file_type = 'image' LIMIT 1) as thumbnail,
        (SELECT COUNT(*) FROM media WHERE property_id = p.id) as media_count,
        (SELECT COUNT(*) FROM payments WHERE property_id = p.id AND status = 'success') as booking_count
      FROM properties p ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
            [...params, Number(limit), offset]
        );

        res.json({
            properties: result.rows,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        console.error('Admin properties error:', error);
        res.status(500).json({ message: 'Failed to fetch properties' });
    }
};

// GET /api/admin/payments - All payments
export const getAdminPayments = async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const conditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (status) {
            conditions.push(`py.status = $${paramIndex++}`);
            params.push(status);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const offset = (Number(page) - 1) * Number(limit);

        const countResult = await query(`SELECT COUNT(*) FROM payments py ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count);

        const result = await query(
            `SELECT py.*, p.title as property_title 
      FROM payments py 
      LEFT JOIN properties p ON py.property_id = p.id 
      ${whereClause}
      ORDER BY py.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
            [...params, Number(limit), offset]
        );

        res.json({
            payments: result.rows,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        console.error('Admin payments error:', error);
        res.status(500).json({ message: 'Failed to fetch payments' });
    }
};

// POST /api/admin/register
export const adminRegister = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password, inviteCode } = req.body;

        // Restriction: Only allow registration with a specific invite code if set in env
        const secretCode = process.env.ADMIN_INVITE_CODE || 'ASSETHUB_2024';
        if (inviteCode !== secretCode) {
            return res.status(403).json({ message: 'Invalid registration invite code' });
        }

        // Check exists
        const existing = await query('SELECT * FROM users WHERE email = $1 OR phone = $2', [email, phone]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'User with this email or phone already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await query(
            `INSERT INTO users (name, phone, email, password, role) VALUES ($1, $2, $3, $4, 'admin') RETURNING id, name, email, role`,
            [name, phone, email, hashedPassword]
        );

        res.status(201).json({
            message: 'Admin account created successfully',
            admin: result.rows[0],
        });
    } catch (error: any) {
        console.error('Admin registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
};

// POST /api/admin/seed - Seed admin user (run once)
export const seedAdmin = async (req: Request, res: Response) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@assethub.co.ke';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
        const adminPhone = process.env.ADMIN_PHONE || '254700000000';

        // Check if admin exists
        const existing = await query("SELECT * FROM users WHERE role = 'admin'");
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        await query(
            `INSERT INTO users (name, phone, email, password, role) VALUES ($1, $2, $3, $4, 'admin')`,
            ['AssetHub Admin', adminPhone, adminEmail, hashedPassword]
        );

        res.status(201).json({ message: 'Admin user created successfully', email: adminEmail });
    } catch (error: any) {
        console.error('Seed admin error:', error);
        res.status(500).json({ message: 'Failed to seed admin' });
    }
};
