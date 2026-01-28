import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-auto">
      {/* Main Footer - Navy blue background */}
      <div className="bg-hgf-navy text-white py-10 md:py-12">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <Image
                src="/assets/hgf-large-h-symbol-negative.svg"
                alt=""
                width={120}
                height={120}
              />
            </div>

            {/* Engagera dig */}
            <div>
              <h4 className="font-semibold mb-4 text-white">
                Engagera dig
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/skriv-under" className="text-white/80 hover:text-white text-sm transition-colors">
                    Skriv under
                  </Link>
                </li>
                <li>
                  <Link href="/kontakta-politiker" className="text-white/80 hover:text-white text-sm transition-colors">
                    Kontakta politiker
                  </Link>
                </li>
                <li>
                  <Link href="/bestall-material" className="text-white/80 hover:text-white text-sm transition-colors">
                    Beställ kampanjmaterial
                  </Link>
                </li>
                <li>
                  <Link href="/material" className="text-white/80 hover:text-white text-sm transition-colors">
                    Ladda ner kampanjmaterial
                  </Link>
                </li>
                <li>
                  <Link href="/aktiviteter" className="text-white/80 hover:text-white text-sm transition-colors">
                    Aktiviteter
                  </Link>
                </li>
                <li>
                  <Link href="/bli-aktiv" className="text-white/80 hover:text-white text-sm transition-colors">
                    Bli aktiv
                  </Link>
                </li>
              </ul>
            </div>

            {/* Om kampanjen */}
            <div>
              <h4 className="font-semibold mb-4 text-white">
                Om kampanjen
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/nyheter" className="text-white/80 hover:text-white text-sm transition-colors">
                    Nyheter
                  </Link>
                </li>
                <li>
                  <a
                    href="https://www.hyresgastforeningen.se/stod-och-rad/marknadshyror/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white text-sm transition-colors"
                  >
                    Vad är marknadshyror?
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.hyresgastforeningen.se"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white text-sm transition-colors"
                  >
                    Hyresgästföreningen.se
                  </a>
                </li>
              </ul>
            </div>

            {/* Kontakt */}
            <div>
              <h4 className="font-semibold mb-4 text-white">
                Kontakt
              </h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <a href="tel:0771443443" className="hover:text-white transition-colors">
                    Telefon 0771-443 443
                  </a>
                </li>
                <li>
                  <a href="mailto:info@hyresgastforeningen.se" className="hover:text-white transition-colors">
                    info@hyresgastforeningen.se
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/80">
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
              <a
                href="https://www.hyresgastforeningen.se/om-webbplatsen/cookies/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors underline"
              >
                Användning av cookies
              </a>
              <a
                href="https://www.hyresgastforeningen.se/om-webbplatsen/integritetspolicy/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors underline"
              >
                Så behandlar vi personuppgifter
              </a>
            </div>
            <p className="text-white/80">
              Organisationsnummer 802001-5106
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
