import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FindWay — A home near work, and the job to go with it",
  description:
    "FindWay is the only platform that pairs housing with jobs and your daily commute. Find verified PGs, rental flats and co-living near where you study or work in Bengaluru — discover roles nearby and plan the route to get there. Zero brokerage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-canvas text-ink" suppressHydrationWarning>
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
