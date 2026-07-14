import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { getSettings } from "@/lib/settings";
import { Logo } from "./logo";

export async function Footer() {
  const settings = await getSettings();
  return (
    <footer className="relative bg-[#1B5E20] overflow-hidden">
      {/* Decorative top wave */}
      <div className="absolute top-0 left-0 right-0 h-16">
        <svg className="w-full h-full" viewBox="0 0 1440 64" preserveAspectRatio="none" fill="#F8F8F5">
          <path d="M0 64V24C240 48 480 0 720 24c240 24 480 0 720-24v40H0z" />
        </svg>
      </div>

      {/* Leaf pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
          <defs>
            <pattern id="leaf-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M40 10C20 25 15 45 30 55c-2-8 3-20 10-30 4-6 8-10 12-15C42 15 40 10 40 10z" fill="#fff"/>
              <path d="M50 40c12 6 22 18 18 30 6-4 12-12 10-22-2-10-12-12-20-10C52 40 50 40 50 40z" fill="#fff"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#leaf-grid)" />
        </svg>
      </div>

      <div className="relative container mx-auto px-4 pt-24 pb-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Logo name={settings.site_name} size="md" />
            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xs">
              {settings.site_description}
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                { label: "YouTube", path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
              ].map((social) => (
                <a key={social.label} href="#" aria-label={social.label} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={social.path} /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-button font-bold uppercase tracking-widest text-white/90">Quick Links</h4>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-button font-bold uppercase tracking-widest text-white/90">Contact</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/50">
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 text-accent shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>{settings.contact_phone}</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 text-accent shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>{settings.contact_email}</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 text-accent shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-button font-bold uppercase tracking-widest text-white/90">Stay Connected</h4>
            <p className="mt-3 text-sm text-white/50">Get farm updates, seasonal offers, and healthy tips.</p>
            <form className="mt-4 flex overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <input type="email" placeholder="Your email" className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none" />
              <button type="submit" className="bg-accent px-5 text-sm font-button font-bold text-[#1B5E20] transition hover:bg-accent/90">Join</button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/30 md:flex-row">
          <p>© {new Date().getFullYear()} {settings.site_name}. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
