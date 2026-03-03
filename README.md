# AssetHub Marketplace

![AssetHub Banner](https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200)

**AssetHub** is a high-performance, premium marketplace for properties and vehicles in Kenya. Built with a focus on **security**, **speed**, and **seamless payments**, it bridges the gap between verified owners and serious buyers.

## 🚀 Key Features

*   🏙️ **Multi-Category Assets**: Dedicated listings for Land, Houses, Cars, and Trucks.
*   💳 **M-Pesa Multi-Gateway**: Secure STK Push integration for viewing fee commitments.
*   🛡️ **Admin Control Center**: Robust dashboard for managing listings, verifying payments, and user management.
*   ✨ **Premium Aesthetics**: State-of-the-art dark theme with glassmorphism and modern animations.
*   📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile viewing.

## 🏗️ Technical Stack

- **Frontend**: Next.js 15+, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, TypeScript, PostgreSQL.
- **Media**: Cloudinary for high-performance asset hosting.
- **Fintech**: Safaricom Daraja API (M-Pesa).

## 🛠️ Quick Start

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/yourusername/AssetHub.git
    cd AssetHub
    cd backend && npm install
    cd ../frontend && npm install
    ```
2.  **Environment Setup**:
    Configure `.env` in the `backend` and `.env.local` in the `frontend`.
3.  **Run the Launch Script**:
    ```powershell
    ./launch.ps1
    ```

## 🔒 Security

This platform implements Enterprise Guard security with:
- JWT strictly enforced for all admin sessions.
- Input validation using Zod for all API requests.
- Secure environment handling for all sensitive API keys.

---
© 2026 AssetHub Marketplace Ltd. Powered by M-Pesa.
