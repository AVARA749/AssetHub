import { Request, Response } from 'express';
import { query } from '../config/db';
import { uploadToCloudinary } from '../services/cloudinary';
import { AuthRequest } from '../middleware/auth';

// GET /api/properties - Public listing with filters
export const getProperties = async (req: Request, res: Response) => {
    try {
        const {
            category, listing_type, county, town,
            min_price, max_price, sort_by,
            page = 1, limit = 12,
        } = req.query;

        const conditions: string[] = ["p.status = 'available'"];
        const params: any[] = [];
        let paramIndex = 1;

        if (category) {
            conditions.push(`p.category = $${paramIndex++}`);
            params.push(category);
        }
        if (listing_type) {
            conditions.push(`p.listing_type = $${paramIndex++}`);
            params.push(listing_type);
        }
        if (county) {
            conditions.push(`p.county ILIKE $${paramIndex++}`);
            params.push(`%${county}%`);
        }
        if (town) {
            conditions.push(`p.town ILIKE $${paramIndex++}`);
            params.push(`%${town}%`);
        }
        if (min_price) {
            conditions.push(`p.price >= $${paramIndex++}`);
            params.push(Number(min_price));
        }
        if (max_price) {
            conditions.push(`p.price <= $${paramIndex++}`);
            params.push(Number(max_price));
        }

        let orderBy = 'p.created_at DESC';
        if (sort_by === 'price_asc') orderBy = 'p.price ASC';
        if (sort_by === 'price_desc') orderBy = 'p.price DESC';
        if (sort_by === 'created_at') orderBy = 'p.created_at DESC';

        const offset = (Number(page) - 1) * Number(limit);

        // Count total
        const countQuery = `SELECT COUNT(*) FROM properties p WHERE ${conditions.join(' AND ')}`;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // Get properties with first image
        const sqlQuery = `
      SELECT p.*, 
        (SELECT file_url FROM media WHERE property_id = p.id AND file_type = 'image' LIMIT 1) as thumbnail
      FROM properties p
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
        params.push(Number(limit), offset);

        const result = await query(sqlQuery, params);

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
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Failed to fetch properties', error: error.message });
    }
};

// GET /api/properties/featured - Featured listings
export const getFeaturedProperties = async (req: Request, res: Response) => {
    try {
        const result = await query(`
      SELECT p.*, 
        (SELECT file_url FROM media WHERE property_id = p.id AND file_type = 'image' LIMIT 1) as thumbnail
      FROM properties p
      WHERE p.status = 'available'
      ORDER BY p.view_count DESC, p.created_at DESC
      LIMIT 8
    `);
        res.json({ properties: result.rows });
    } catch (error: any) {
        console.error('Error fetching featured properties:', error);
        res.status(500).json({ message: 'Failed to fetch featured properties' });
    }
};

// GET /api/properties/search - Search by keyword
export const searchProperties = async (req: Request, res: Response) => {
    try {
        const { q, page = 1, limit = 12 } = req.query;
        if (!q) return res.status(400).json({ message: 'Search query required' });

        const offset = (Number(page) - 1) * Number(limit);
        const searchTerm = `%${q}%`;

        const countResult = await query(
            `SELECT COUNT(*) FROM properties WHERE status = 'available' AND (title ILIKE $1 OR description ILIKE $1 OR county ILIKE $1 OR town ILIKE $1 OR area ILIKE $1)`,
            [searchTerm]
        );

        const result = await query(
            `SELECT p.*, 
        (SELECT file_url FROM media WHERE property_id = p.id AND file_type = 'image' LIMIT 1) as thumbnail
      FROM properties p
      WHERE p.status = 'available' AND (p.title ILIKE $1 OR p.description ILIKE $1 OR p.county ILIKE $1 OR p.town ILIKE $1 OR p.area ILIKE $1)
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
            [searchTerm, Number(limit), offset]
        );

        res.json({
            properties: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit)),
            },
        });
    } catch (error: any) {
        console.error('Error searching properties:', error);
        res.status(500).json({ message: 'Search failed' });
    }
};

// GET /api/properties/:id - Single property detail
export const getPropertyById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Increment view count
        await query('UPDATE properties SET view_count = view_count + 1 WHERE id = $1', [id]);

        const propertyResult = await query('SELECT * FROM properties WHERE id = $1', [id]);
        if (propertyResult.rows.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const mediaResult = await query(
            'SELECT * FROM media WHERE property_id = $1 ORDER BY file_type, created_at',
            [id]
        );

        res.json({
            property: propertyResult.rows[0],
            media: mediaResult.rows,
        });
    } catch (error: any) {
        console.error('Error fetching property:', error);
        res.status(500).json({ message: 'Failed to fetch property' });
    }
};

// POST /api/properties - Admin create property
export const createProperty = async (req: AuthRequest, res: Response) => {
    try {
        const {
            title, description, category, listing_type,
            county, town, area, price, viewing_fee,
            contact_phone, whatsapp_number, status,
        } = req.body;

        const result = await query(
            `INSERT INTO properties (title, description, category, listing_type, county, town, area, price, viewing_fee, contact_phone, whatsapp_number, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
            [title, description, category, listing_type, county, town, area, price, viewing_fee || 0, contact_phone, whatsapp_number || null, status || 'available']
        );

        // Handle file uploads if present
        if (req.files && Array.isArray(req.files)) {
            const propertyId = result.rows[0].id;
            for (const file of req.files) {
                const isVideo = file.mimetype.startsWith('video/');
                const cloudResult = await uploadToCloudinary(
                    file.buffer,
                    `assethub/${propertyId}`,
                    isVideo ? 'video' : 'image'
                );
                await query(
                    'INSERT INTO media (property_id, file_url, file_type) VALUES ($1, $2, $3)',
                    [propertyId, cloudResult.url, isVideo ? 'video' : 'image']
                );
            }
        }

        // Fetch the property with media
        const propertyWithMedia = await query('SELECT * FROM properties WHERE id = $1', [result.rows[0].id]);
        const media = await query('SELECT * FROM media WHERE property_id = $1', [result.rows[0].id]);

        res.status(201).json({
            message: 'Property created successfully',
            property: propertyWithMedia.rows[0],
            media: media.rows,
        });
    } catch (error: any) {
        console.error('Error creating property:', error);
        res.status(500).json({ message: 'Failed to create property', error: error.message });
    }
};

// PUT /api/properties/:id - Admin update property
export const updateProperty = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check exists
        const existing = await query('SELECT * FROM properties WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        const allowedFields = [
            'title', 'description', 'category', 'listing_type',
            'county', 'town', 'area', 'price', 'viewing_fee',
            'contact_phone', 'whatsapp_number', 'status',
        ];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                fields.push(`${field} = $${paramIndex++}`);
                values.push(updates[field]);
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(id);
        const result = await query(
            `UPDATE properties SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        // Handle new file uploads
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                const isVideo = file.mimetype.startsWith('video/');
                const cloudResult = await uploadToCloudinary(
                    file.buffer,
                    `assethub/${id}`,
                    isVideo ? 'video' : 'image'
                );
                await query(
                    'INSERT INTO media (property_id, file_url, file_type) VALUES ($1, $2, $3)',
                    [id, cloudResult.url, isVideo ? 'video' : 'image']
                );
            }
        }

        const media = await query('SELECT * FROM media WHERE property_id = $1', [id]);

        res.json({
            message: 'Property updated successfully',
            property: result.rows[0],
            media: media.rows,
        });
    } catch (error: any) {
        console.error('Error updating property:', error);
        res.status(500).json({ message: 'Failed to update property', error: error.message });
    }
};

// DELETE /api/properties/:id - Admin delete property
export const deleteProperty = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const existing = await query('SELECT * FROM properties WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Media will be cascade-deleted
        await query('DELETE FROM properties WHERE id = $1', [id]);

        res.json({ message: 'Property deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting property:', error);
        res.status(500).json({ message: 'Failed to delete property' });
    }
};

// DELETE /api/properties/:id/media/:mediaId - Admin delete specific media
export const deleteMedia = async (req: AuthRequest, res: Response) => {
    try {
        const { id, mediaId } = req.params;

        const existing = await query('SELECT * FROM media WHERE id = $1 AND property_id = $2', [mediaId, id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Media not found' });
        }

        await query('DELETE FROM media WHERE id = $1', [mediaId]);
        res.json({ message: 'Media deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting media:', error);
        res.status(500).json({ message: 'Failed to delete media' });
    }
};

// GET /api/properties/counties - Get distinct counties
export const getCounties = async (req: Request, res: Response) => {
    try {
        const result = await query("SELECT DISTINCT county FROM properties WHERE status = 'available' ORDER BY county");
        res.json({ counties: result.rows.map((r: any) => r.county) });
    } catch (error: any) {
        console.error('Error fetching counties:', error);
        res.status(500).json({ message: 'Failed to fetch counties' });
    }
};

// GET /api/properties/towns - Get distinct towns (optionally by county)
export const getTowns = async (req: Request, res: Response) => {
    try {
        const { county } = req.query;
        let result;
        if (county) {
            result = await query(
                "SELECT DISTINCT town FROM properties WHERE status = 'available' AND county = $1 ORDER BY town",
                [county]
            );
        } else {
            result = await query("SELECT DISTINCT town FROM properties WHERE status = 'available' ORDER BY town");
        }
        res.json({ towns: result.rows.map((r: any) => r.town) });
    } catch (error: any) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ message: 'Failed to fetch towns' });
    }
};
