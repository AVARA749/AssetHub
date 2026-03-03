import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "AssetHub | Property & Asset Marketplace Kenya",
  description: "Browse and discover premium properties, land, houses, cars and trucks for sale, rent or lease across Kenya. Secure M-Pesa payments for viewing bookings.",
  keywords: "property Kenya, land for sale Kenya, houses for rent, cars for sale, trucks, real estate Kenya, M-Pesa",
  openGraph: {
    title: "AssetHub | Property & Asset Marketplace",
    description: "Discover premium properties across Kenya",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
