import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379';
const PASSKEY = process.env.MPESA_PASSKEY || '';
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || '';
const ENV = process.env.MPESA_ENV || 'sandbox';

const BASE_URL = ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

/**
 * Get OAuth access token from Daraja API
 */
export const getAccessToken = async (): Promise<string> => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    const response = await axios.get<{ access_token: string }>(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    return response.data.access_token;
};

/**
 * Generate the password for STK Push
 */
const generatePassword = (timestamp: string): string => {
    return Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
};

/**
 * Generate timestamp in format YYYYMMDDHHmmss
 */
const generateTimestamp = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Initiate STK Push request
 */
export const initiateSTKPush = async (
    phoneNumber: string,
    amount: number,
    accountReference: string,
    transactionDesc: string
): Promise<any> => {
    const accessToken = await getAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);

    // Ensure phone number is in 254XXXXXXXXX format
    let formattedPhone = phoneNumber;
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
    }
    if (formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.substring(1);
    }

    const payload = {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount),
        PartyA: formattedPhone,
        PartyB: SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL,
        AccountReference: accountReference.substring(0, 12),
        TransactionDesc: transactionDesc.substring(0, 13),
    };

    const response = await axios.post(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, payload, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    return response.data;
};

/**
 * Check STK Push transaction status
 */
export const querySTKPushStatus = async (checkoutRequestId: string): Promise<any> => {
    const accessToken = await getAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);

    const payload = {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
    };

    const response = await axios.post(`${BASE_URL}/mpesa/stkpushquery/v1/query`, payload, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    return response.data;
};

/**
 * Parse M-Pesa callback data
 */
export const parseMpesaCallback = (body: any) => {
    const { Body } = body;
    const { stkCallback } = Body;
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    let mpesaReference = '';
    let amount = 0;
    let phoneNumber = '';
    let transactionDate = '';

    if (ResultCode === 0 && stkCallback.CallbackMetadata) {
        const items = stkCallback.CallbackMetadata.Item;
        items.forEach((item: any) => {
            switch (item.Name) {
                case 'MpesaReceiptNumber':
                    mpesaReference = item.Value;
                    break;
                case 'Amount':
                    amount = item.Value;
                    break;
                case 'PhoneNumber':
                    phoneNumber = String(item.Value);
                    break;
                case 'TransactionDate':
                    transactionDate = String(item.Value);
                    break;
            }
        });
    }

    return {
        merchantRequestId: MerchantRequestID,
        checkoutRequestId: CheckoutRequestID,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        mpesaReference,
        amount,
        phoneNumber,
        transactionDate,
        success: ResultCode === 0,
    };
};
