import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GroupTrip - Plan Group Adventures Together",
    template: "%s | GroupTrip",
  },
  description: "Collaborative trip planning for bachelor parties, bachelorette parties, golf trips, and ski trips. Share itineraries, split costs, coordinate equipment, and keep everyone on the same page.",
  keywords: [
    "trip planning",
    "group travel",
    "bachelor party planning",
    "bachelorette party",
    "golf trip planner",
    "ski trip organizer",
    "collaborative itinerary",
    "expense splitting",
    "travel coordination",
  ],
  authors: [{ name: "GroupTrip" }],
  creator: "GroupTrip",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "GroupTrip - Plan Group Adventures Together",
    description: "Collaborative trip planning for bachelor parties, golf trips, and ski trips. Share itineraries, split costs, and coordinate seamlessly.",
    siteName: "GroupTrip",
  },
  twitter: {
    card: "summary_large_image",
    title: "GroupTrip - Plan Group Adventures Together",
    description: "Collaborative trip planning for bachelor parties, golf trips, and ski trips.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
