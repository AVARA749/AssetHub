const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchAPI(endpoint: string, options?: RequestInit) {
    const url = `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Something went wrong');
    }
    return res.json();
}

// Properties
export const getProperties = (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/properties${query}`);
};

export const getFeaturedProperties = () => fetchAPI('/properties/featured');

export const searchProperties = (q: string, page = 1) =>
    fetchAPI(`/properties/search?q=${encodeURIComponent(q)}&page=${page}`);

export const getPropertyById = (id: string) => fetchAPI(`/properties/${id}`);

export const getCounties = () => fetchAPI('/properties/counties');

export const getTowns = (county?: string) =>
    fetchAPI(`/properties/towns${county ? '?county=' + encodeURIComponent(county) : ''}`);

// M-Pesa
export const initiatePayment = (data: { user_name: string; phone: string; property_id: string }) =>
    fetchAPI('/mpesa/stkpush', { method: 'POST', body: JSON.stringify(data) });

export const checkPaymentStatus = (checkoutRequestId: string) =>
    fetchAPI(`/mpesa/status/${checkoutRequestId}`);

export const verifyPayment = (propertyId: string, phone: string) =>
    fetchAPI(`/mpesa/verify/${propertyId}/${phone}`);

// Admin
export const adminLogin = (data: { email: string; password: string }) =>
    fetchAPI('/admin/login', { method: 'POST', body: JSON.stringify(data) });

export const adminRegister = (data: { name: string; email: string; phone: string; password: string; inviteCode: string }) =>
    fetchAPI('/admin/register', { method: 'POST', body: JSON.stringify(data) });

export const getDashboardStats = (token: string) =>
    fetchAPI('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });

export const getAdminProperties = (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/admin/properties${query}`, { headers: { Authorization: `Bearer ${token}` } });
};

export const getAdminPayments = (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/admin/payments${query}`, { headers: { Authorization: `Bearer ${token}` } });
};

export const createProperty = async (token: string, formData: FormData) => {
    const url = `${API_BASE}/properties`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to create property' }));
        throw new Error(error.message);
    }
    return res.json();
};

export const updateProperty = async (token: string, id: string, formData: FormData) => {
    const url = `${API_BASE}/properties/${id}`;
    const res = await fetch(url, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to update property' }));
        throw new Error(error.message);
    }
    return res.json();
};

export const deleteProperty = (token: string, id: string) =>
    fetchAPI(`/properties/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
