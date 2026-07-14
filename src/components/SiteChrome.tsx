"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

/**
 * Wraps the app's public chrome (navbar with the profile menu, footer, bottom
 * nav). The admin console is a standalone surface, so on /admin routes we drop
 * all of it and let the admin layout supply its own header.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <div className="flex-1">{children}</div>;

  return (
    <>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <BottomNav />
    </>
  );
}
