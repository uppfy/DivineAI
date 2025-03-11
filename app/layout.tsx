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
  title: "Divine Comfort | Spiritual Growth and Community",
  description: "Divine Comfort offers spiritual guidance, daily devotionals, Bible study resources, and a supportive Christian community to nurture your faith journey and spiritual well-being.",
  keywords: "spiritual growth, Christian community, daily devotionals, Bible study, spiritual guidance, faith journey, prayer, Christian resources",
  authors: [{ name: "Divine Comfort Team" }],
  creator: "Divine Comfort",
  publisher: "Divine Comfort",
  formatDetection: {
    email: false,
    telephone: false,
  },
  metadataBase: new URL("https://divine-comfort.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Divine Comfort | Spiritual Growth and Community",
    description: "Divine Comfort offers spiritual guidance, daily devotionals, Bible study resources, and a supportive Christian community to nurture your faith journey and spiritual well-being.",
    url: "https://divine-comfort.com",
    siteName: "Divine Comfort",
    images: [
      {
        url: "https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets//Divine%20Comfort%20featured%20image.png",
        width: 1200,
        height: 630,
        alt: "Divine Comfort - A place for spiritual growth and community",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Divine Comfort | Spiritual Growth and Community",
    description: "Divine Comfort offers spiritual guidance, daily devotionals, Bible study resources, and a supportive Christian community to nurture your faith journey and spiritual well-being.",
    images: ["https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets//Divine%20Comfort%20featured%20image.png"],
  },
  icons: {
    icon: [
      {
        url: "https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets//divine%20comfort%20favicon.png",
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: "https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets//divine%20comfort%20favicon.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets//divine%20comfort%20favicon.png",
        type: "image/png",
        sizes: "180x180",
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
