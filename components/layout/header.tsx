"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navigation = [
  { name: "Hem", href: "/" },
  { name: "Skriv under", href: "/skriv-under" },
  { name: "Kontakta politiker", href: "/kontakta-politiker" },
  { name: "Beställ kampanjmaterial", href: "/bestall-material" },
  { name: "Ladda ner kampanjmaterial", href: "/material" },
  { name: "Aktiviteter", href: "/aktiviteter" },
  { name: "Nyheter", href: "/nyheter" },
  { name: "Bli aktiv", href: "/bli-aktiv" },
];

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white border-b border-hgf-border">
      <div className="h-[70px] md:h-[80px] px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/assets/hgf-logo.svg"
            alt="Hyresgästföreningen"
            width={296}
            height={40}
            className="h-[1.75rem] md:h-[2.25rem] w-auto"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/skriv-under">Skriv under</Link>
          </Button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="h-12 w-12 rounded-full bg-hgf-blue border-2 border-hgf-blue hover:bg-hgf-blue-dark hover:border-hgf-blue-dark transition-all duration-200 flex items-center justify-center active:scale-95"
            aria-label={isOpen ? "Stäng meny" : "Öppna meny"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <nav
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out border-t border-hgf-border",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <ul className="py-4 px-4 space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-lg text-base transition-colors",
                  pathname === item.href
                    ? "bg-hgf-bg-light-blue text-hgf-blue font-semibold"
                    : "text-hgf-black/80 hover:bg-hgf-neutral/30"
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
