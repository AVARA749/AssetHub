import { Router } from 'express';
import {
    getProperties,
    getFeaturedProperties,
    searchProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    deleteMedia,
    getCounties,
    getTowns,
} from '../controllers/propertyController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { createPropertySchema, updatePropertySchema } from '../utils/validators';

const router = Router();

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/search', searchProperties);
router.get('/counties', getCounties);
router.get('/towns', getTowns);
router.get('/:id', getPropertyById);

// Admin routes
router.post('/', authenticate, requireAdmin, upload.array('files', 10), createProperty);
router.put('/:id', authenticate, requireAdmin, upload.array('files', 10), updateProperty);
router.delete('/:id', authenticate, requireAdmin, deleteProperty);
router.delete('/:id/media/:mediaId', authenticate, requireAdmin, deleteMedia);

export default router;
