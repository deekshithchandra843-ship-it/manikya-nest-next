import Link from "next/link";
import Logo from "./Logo";

const aboutLinks = [
  "About us",
  "How it works",
  "Careers",
  "Blog",
  "Contact",
];

const quickLinks = [
  { label: "Find PG/Hostel", href: "/c/pg" },
  { label: "Find Rental Flat", href: "/c/rent" },
  { label: "Jobs & Internships", href: "/jobs" },
  { label: "Upskilling", href: "/jobs#upskill" },
];

const cities = ["Bengaluru", "Mumbai", "Hyderabad", "Pune", "Delhi"];

export default function Footer() {
  return (
    <footer className="bg-canvas text-ink border-t border-hairline mt-12 hidden md:block">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About FindWay */}
          <div>
            <Logo size={30} className="mb-4" />
            <p className="text-sm leading-relaxed text-muted mb-4">
              FindWay is a platform for students and working professionals in Indian cities.
              Find verified housing with zero broker fee, discover jobs, plan your commute,
              and upskill — all in one place.
            </p>
            <ul className="space-y-2.5">
              {aboutLinks.map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-ink hover:underline transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-ink text-base font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-ink hover:underline transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="text-ink text-base font-medium mb-4">Cities</h3>
            <ul className="space-y-2.5">
              {cities.map((city) => (
                <li key={city}>
                  <Link href="/explore" className="text-sm text-ink hover:underline transition-colors">
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Legal band */}
      <div className="border-t border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-[13px] text-muted">
            © {new Date().getFullYear()} FindWay, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-[13px] text-muted hover:underline transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-[13px] text-muted hover:underline transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
