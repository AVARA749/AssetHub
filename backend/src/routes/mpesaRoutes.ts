import { Router } from 'express';
import {
    initiateStkPush,
    mpesaCallback,
    checkPaymentStatus,
    verifyPayment,
} from '../controllers/mpesaController';
import { validate } from '../middleware/validate';
import { bookViewingSchema } from '../utils/validators';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

// Rate-limited STK push
router.post('/stkpush', rateLimit(5, 60000), validate(bookViewingSchema), initiateStkPush);

// M-Pesa callback (no auth — Safaricom calls this)
router.post('/callback', mpesaCallback);

// Check payment status
router.get('/status/:checkoutRequestId', checkPaymentStatus);

// Verify if user already paid for a property
router.get('/verify/:propertyId/:phone', verifyPayment);

export default router;
