import { Request, Response } from 'express';
import { query } from '../config/db';
import { initiateSTKPush, parseMpesaCallback, querySTKPushStatus } from '../services/mpesa';

// POST /api/mpesa/stkpush - Initiate viewing fee payment
export const initiateStkPush = async (req: Request, res: Response) => {
    try {
        const { user_name, phone, property_id } = req.body;

        // Get property and viewing fee
        const propertyResult = await query('SELECT * FROM properties WHERE id = $1', [property_id]);
        if (propertyResult.rows.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const property = propertyResult.rows[0];
        if (property.viewing_fee <= 0) {
            return res.status(400).json({ message: 'This property has no viewing fee' });
        }

        // Check for duplicate pending payment
        const existingPayment = await query(
            "SELECT * FROM payments WHERE property_id = $1 AND phone = $2 AND status = 'pending' AND created_at > NOW() - INTERVAL '5 minutes'",
            [property_id, phone]
        );
        if (existingPayment.rows.length > 0) {
            return res.status(409).json({
                message: 'You have a pending payment. Please wait for it to complete or try again after 5 minutes.',
                payment_id: existingPayment.rows[0].id
            });
        }

        // Check if user has already paid for this property
        const paidPayment = await query(
            "SELECT * FROM payments WHERE property_id = $1 AND phone = $2 AND status = 'success'",
            [property_id, phone]
        );
        if (paidPayment.rows.length > 0) {
            return res.json({
                message: 'You have already paid for this viewing',
                already_paid: true,
                contact_phone: property.contact_phone,
                whatsapp_number: property.whatsapp_number,
            });
        }

        // Initiate STK Push
        const stkResponse = await initiateSTKPush(
            phone,
            property.viewing_fee,
            `AH-${property.id.substring(0, 8)}`,
            'Viewing Fee'
        );

        if (stkResponse.ResponseCode === '0') {
            // Save payment record
            const paymentResult = await query(
                `INSERT INTO payments (property_id, user_name, phone, amount, checkout_request_id, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING *`,
                [property_id, user_name, phone, property.viewing_fee, stkResponse.CheckoutRequestID]
            );

            return res.json({
                message: 'STK Push sent successfully. Please enter your M-Pesa PIN.',
                payment_id: paymentResult.rows[0].id,
                checkout_request_id: stkResponse.CheckoutRequestID,
            });
        } else {
            return res.status(400).json({
                message: 'Failed to initiate payment',
                error: stkResponse.ResponseDescription || 'Unknown error',
            });
        }
    } catch (error: any) {
        console.error('STK Push error:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Payment initiation failed. Please try again.',
            error: error.response?.data?.errorMessage || error.message
        });
    }
};

// POST /api/mpesa/callback - Daraja callback endpoint
export const mpesaCallback = async (req: Request, res: Response) => {
    try {
        console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

        const callbackData = parseMpesaCallback(req.body);

        if (callbackData.success) {
            // Update payment as successful
            await query(
                `UPDATE payments SET status = 'success', mpesa_reference = $1, updated_at = NOW()
         WHERE checkout_request_id = $2`,
                [callbackData.mpesaReference, callbackData.checkoutRequestId]
            );
            console.log(`Payment successful: ${callbackData.mpesaReference}`);
        } else {
            // Update payment as failed
            await query(
                `UPDATE payments SET status = 'failed', updated_at = NOW()
         WHERE checkout_request_id = $1`,
                [callbackData.checkoutRequestId]
            );
            console.log(`Payment failed: ${callbackData.resultDesc}`);
        }

        // Respond with success (Daraja requires this)
        res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (error: any) {
        console.error('Callback processing error:', error);
        res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
};

// GET /api/mpesa/status/:checkoutRequestId - Check payment status
export const checkPaymentStatus = async (req: Request, res: Response) => {
    try {
        const { checkoutRequestId } = req.params;

        // Check local database first
        const paymentResult = await query(
            'SELECT p.*, pr.contact_phone, pr.whatsapp_number FROM payments p JOIN properties pr ON p.property_id = pr.id WHERE p.checkout_request_id = $1',
            [checkoutRequestId]
        );

        if (paymentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        const payment = paymentResult.rows[0];

        // If already resolved, return result
        if (payment.status === 'success') {
            return res.json({
                status: 'success',
                mpesa_reference: payment.mpesa_reference,
                contact_phone: payment.contact_phone,
                whatsapp_number: payment.whatsapp_number,
                message: 'Payment confirmed! You can now contact the seller.',
            });
        }

        if (payment.status === 'failed') {
            return res.json({
                status: 'failed',
                message: 'Payment was not completed.',
            });
        }

        // If still pending, query Daraja API
        try {
            const stkStatus = await querySTKPushStatus(checkoutRequestId as string);
            if (stkStatus.ResultCode === '0' || stkStatus.ResultCode === 0) {
                // Update as success
                await query(
                    "UPDATE payments SET status = 'success', updated_at = NOW() WHERE checkout_request_id = $1",
                    [checkoutRequestId]
                );
                return res.json({
                    status: 'success',
                    contact_phone: payment.contact_phone,
                    whatsapp_number: payment.whatsapp_number,
                    message: 'Payment confirmed!',
                });
            } else {
                return res.json({
                    status: 'pending',
                    message: 'Payment is still being processed. Please wait.',
                });
            }
        } catch (queryError: any) {
            // STK query might fail if transaction is still processing
            return res.json({
                status: 'pending',
                message: 'Payment is still being processed.',
            });
        }
    } catch (error: any) {
        console.error('Status check error:', error);
        res.status(500).json({ message: 'Failed to check payment status' });
    }
};

// GET /api/mpesa/verify/:propertyId/:phone - Check if user already paid
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { propertyId, phone } = req.params;

        const result = await query(
            "SELECT p.*, pr.contact_phone, pr.whatsapp_number FROM payments p JOIN properties pr ON p.property_id = pr.id WHERE p.property_id = $1 AND p.phone = $2 AND p.status = 'success'",
            [propertyId, phone]
        );

        if (result.rows.length > 0) {
            return res.json({
                paid: true,
                contact_phone: result.rows[0].contact_phone,
                whatsapp_number: result.rows[0].whatsapp_number,
                mpesa_reference: result.rows[0].mpesa_reference,
            });
        }

        res.json({ paid: false });
    } catch (error: any) {
        console.error('Verify payment error:', error);
        res.status(500).json({ message: 'Failed to verify payment' });
    }
};
