"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";

export function ActiveNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-7">
      {NAV_LINKS.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors hover:text-[#1B5E20] relative py-1.5 ${
              isActive ? "text-[#1B5E20] font-semibold" : "text-foreground/70"
            }`}
          >
            {link.label}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-[#1B5E20] rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
