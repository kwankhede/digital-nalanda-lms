import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/SiteFooter";
import { AuthProvider } from "@/lib/auth";
import ChatbotWidget from "@/components/ChatbotWidget";
import AnnouncementBanner from "@/components/AnnouncementBanner";

export const metadata: Metadata = {
  title: "Digital Nalanda LMS",
  description: "Free quality education for everyone, everywhere.",
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
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <ChatbotWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
