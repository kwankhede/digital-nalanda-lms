import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/SiteFooter";
import { AuthProvider } from "@/lib/auth";
import ChatbotWidget from "@/components/ChatbotWidget";
import AnnouncementBanner from "@/components/AnnouncementBanner";

export const metadata: Metadata = {
  title: "Digital Nalanda",
  description: "Free quality education for everyone, everywhere.",
};

// Mobile-first viewport. initialScale 1 with no maximum-scale so users can
// still pinch-zoom (accessibility); viewportFit cover enables safe-area insets.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-nal-cream text-nal-navy">
        <AuthProvider>
          <AnnouncementBanner />
          <Navbar />
          <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
          <Footer />
          <ChatbotWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
