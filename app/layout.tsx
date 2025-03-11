import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar1 } from "@/components/blocks/shadcnblocks-com-navbar1";
import { Footer } from "@/components/blocks/footer";
import ClientProvider from "@/components/providers/ClientProvider";
import { ProfileProvider } from '@/contexts/ProfileContext';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import VerificationBanner from '@/components/VerificationBanner';
import ProtectedRoute from '@/components/ProtectedRoute';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Divine Comfort",
  description: "A place for spiritual growth and community",
  icons: {
    icon: [
      {
        url: "https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets//digital-comfort-logo.svg",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <VerificationBanner />
          <ClientProvider>
            <ProfileProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar1 />
                <main className="flex-1">
                  <ProtectedRoute>
                    {children}
                  </ProtectedRoute>
                </main>
                <Footer />
              </div>
            </ProfileProvider>
          </ClientProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
