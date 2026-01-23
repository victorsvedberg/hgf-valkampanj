"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Skriv under", href: "/skriv-under" },
  { name: "Kontakta politiker", href: "/kontakta-politiker" },
  { name: "Beställ material", href: "/bestall-material" },
  { name: "Aktiviteter", href: "/aktiviteter" },
  { name: "Bli aktiv", href: "/bli-aktiv" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-hgf-border sticky top-0 z-50">
      {/* Main header bar - 89px height, 1rem padding, no max-width */}
      <div className="h-[89px] p-4 flex items-center justify-between">
        {/* Logo - 0.5rem (p-2) extra padding, matching HGF .SiteHeader__brand */}
        <Link href="/" className="flex items-center p-2">
          <Image
            src="/assets/hgf-logo.svg"
            alt="Hyresgästföreningen"
            width={296}
            height={40}
            className="h-[1.875rem] md:h-[2.5rem] w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "text-hgf-blue"
                  : "text-hgf-black/70 hover:text-hgf-blue"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* CTA Buttons - 18px (1.125rem) like HGF main site */}
        <div className="hidden md:flex items-center gap-3">
          <Button asChild className="text-lg">
            <Link href="/skriv-under">
              Skriv under
            </Link>
          </Button>
          <Button variant="outline" asChild className="text-lg">
            <a href="https://www.hyresgastforeningen.se" target="_blank" rel="noopener noreferrer">
              Till HGF.se
            </a>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-hgf-black/70 hover:bg-hgf-neutral/50 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Stäng meny" : "Öppna meny"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation - outside the fixed height container */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 border-t border-hgf-border bg-white animate-fade-in">
          <div className="flex flex-col gap-1 pt-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg text-base font-medium transition-colors",
                  pathname === item.href
                    ? "bg-hgf-bg-light-blue text-hgf-blue"
                    : "text-hgf-black/70 hover:text-hgf-blue hover:bg-hgf-bg-light-blue/50"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-hgf-border flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/skriv-under" onClick={() => setMobileMenuOpen(false)}>
                  Skriv under
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="https://www.hyresgastforeningen.se" target="_blank" rel="noopener noreferrer">
                  Till HGF.se
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
