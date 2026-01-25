"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  Users,
  Mail,
  Database,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  Clock
} from "lucide-react";

export default function AdminPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  return (
    <div className="min-h-screen bg-hgf-bg-light-blue">
      {/* Header */}
      <header className="bg-hgf-navy text-white py-6">
        <div className="container-page">
          <h1 className="text-2xl font-bold text-white">Admin & Dokumentation</h1>
          <p className="text-white/70 mt-1">Stoppa Marknadshyror - Valkampanj 2026</p>
        </div>
      </header>

      <main className="container-page py-8 space-y-8">
        {/* Quick links */}
        <section className="grid md:grid-cols-2 gap-4">
          <Link href={`/admin/${token}/aktiviteter`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-hgf-blue/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-hgf-blue" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Hantera aktiviteter</h3>
                  <p className="text-sm text-hgf-black/60">Skapa, visa och exportera deltagare</p>
                </div>
                <ArrowRight className="h-5 w-5 text-hgf-black/30" />
              </CardContent>
            </Card>
          </Link>

          <a href="https://app.brevo.com" target="_blank" rel="noopener noreferrer">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-hgf-red/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-hgf-red" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Brevo Dashboard</h3>
                  <p className="text-sm text-hgf-black/60">Kontakter, listor och mejlutskick</p>
                </div>
                <ExternalLink className="h-5 w-5 text-hgf-black/30" />
              </CardContent>
            </Card>
          </a>
        </section>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Techstack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-hgf-bg-light-blue rounded-lg">
                <div className="font-medium">Next.js 15</div>
                <div className="text-hgf-black/60">App Router</div>
              </div>
              <div className="p-3 bg-hgf-bg-light-blue rounded-lg">
                <div className="font-medium">TypeScript</div>
                <div className="text-hgf-black/60">Typsäkerhet</div>
              </div>
              <div className="p-3 bg-hgf-bg-light-blue rounded-lg">
                <div className="font-medium">Tailwind CSS</div>
                <div className="text-hgf-black/60">Styling</div>
              </div>
              <div className="p-3 bg-hgf-bg-light-blue rounded-lg">
                <div className="font-medium">Brevo</div>
                <div className="text-hgf-black/60">CRM & E-post</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implemented Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-hgf-blue" />
              Implementerade funktioner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upprop */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-hgf-red" />
                Skriv under (Upprop)
              </h4>
              <ul className="text-sm text-hgf-black/70 space-y-1 ml-6 list-disc">
                <li>Formulär på startsidan + dedikerad sida <code className="bg-hgf-neutral/30 px-1 rounded">/skriv-under</code></li>
                <li>Två steg: 1) Namn + e-post → 2) Valfritt telefon + postnummer</li>
                <li>Skapar kontakt i Brevo med attribut: <code className="bg-hgf-neutral/30 px-1 rounded">HAS_SIGNED_PETITION</code>, <code className="bg-hgf-neutral/30 px-1 rounded">PETITION_SIGNED_DATE</code></li>
                <li>Lägger till kontakt i Brevo-listan "Stoppa Marknadshyror 2026" (list ID 3)</li>
                <li>Signaturräknare på startsidan hämtar antal från Brevo</li>
              </ul>
            </div>

            {/* Kontakta politiker */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-hgf-blue" />
                Kontakta politiker
              </h4>
              <ul className="text-sm text-hgf-black/70 space-y-1 ml-6 list-disc">
                <li>Tre steg: 1) Skriv meddelande → 2) Dina uppgifter + ort → 3) Välj politiker</li>
                <li>Ortssökning med autocomplete (postnummer/ort → kommun)</li>
                <li>Politiker mappade på kommunKod i <code className="bg-hgf-neutral/30 px-1 rounded">/kontakta-politiker/page.tsx</code></li>
                <li>Mejl skickas via Brevo Transactional API med reply-to till användaren</li>
                <li>Skapar/uppdaterar kontakt med <code className="bg-hgf-neutral/30 px-1 rounded">HAS_CONTACTED_POLITICIAN</code></li>
              </ul>
            </div>

            {/* Aktiviteter */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-hgf-blue" />
                Aktiviteter
              </h4>
              <ul className="text-sm text-hgf-black/70 space-y-1 ml-6 list-disc">
                <li>Publik sida: <code className="bg-hgf-neutral/30 px-1 rounded">/aktiviteter</code></li>
                <li>Admin: <code className="bg-hgf-neutral/30 px-1 rounded">/admin/[token]/aktiviteter</code></li>
                <li>
                  <strong>Skapa aktivitet:</strong> Skapar automatiskt en Brevo-lista i mappen "Aktiviteter"
                </li>
                <li>
                  <strong>Anmälan:</strong> Lägger till kontakt i aktivitetens specifika Brevo-lista
                </li>
                <li>
                  <strong>Sökning:</strong> Filtrerar på län (visar kranskommuner), sorterar exakt match först
                </li>
                <li>
                  <strong>Export:</strong> CSV-export av deltagarlista per aktivitet
                </li>
                <li>Aktiviteter sparas i <code className="bg-hgf-neutral/30 px-1 rounded">data/activities.json</code></li>
              </ul>
            </div>

            {/* Ortssökning */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-hgf-blue" />
                Ortssökning (LocationAutocomplete)
              </h4>
              <ul className="text-sm text-hgf-black/70 space-y-1 ml-6 list-disc">
                <li>Svensk postnummerdata med ~16 000 poster</li>
                <li>Söker på postnummer, ort och kommun</li>
                <li>Returnerar: ort, kommun, kommunKod, län</li>
                <li>Data i <code className="bg-hgf-neutral/30 px-1 rounded">data/postnummer.json</code> (server-side, laddas inte av klient)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Brevo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Brevo-integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Kontaktattribut som används:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  "FIRSTNAME",
                  "LASTNAME",
                  "SMS (telefon)",
                  "POSTALCODE",
                  "HAS_SIGNED_PETITION",
                  "PETITION_SIGNED_DATE",
                  "HAS_CONTACTED_POLITICIAN",
                  "LAST_POLITICIAN_CONTACT",
                  "SOURCE",
                ].map((attr) => (
                  <code key={attr} className="bg-hgf-neutral/30 px-2 py-1 rounded text-xs">
                    {attr}
                  </code>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Listor & Mappar:</h4>
              <ul className="text-hgf-black/70 space-y-1 ml-4 list-disc">
                <li><strong>Lista 3:</strong> "Stoppa Marknadshyror 2026" (upprop)</li>
                <li><strong>Mapp "Aktiviteter":</strong> Innehåller en lista per aktivitet</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Environment-variabler:</h4>
              <div className="bg-hgf-navy text-white p-3 rounded-lg font-mono text-xs space-y-1">
                <div>BREVO_API_KEY=xxx</div>
                <div>BREVO_SENDER_EMAIL=xxx</div>
                <div>BREVO_SENDER_NAME=xxx</div>
                <div>ADMIN_SECRET_TOKEN=xxx</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Styleguide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Design & Styleguide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-hgf-black/70">
              Designsystemet är baserat på Hyresgästföreningens grafiska profil.
              Se <Link href="/styleguide" className="text-hgf-blue hover:underline">styleguiden</Link> för
              alla färger, typografi och komponenter.
            </p>

            <div>
              <h4 className="font-medium mb-2">Huvudfärger:</h4>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-hgf-red"></div>
                  <span className="text-hgf-black/70">HGF Röd (brand)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-hgf-blue"></div>
                  <span className="text-hgf-black/70">Action Blå</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-hgf-navy"></div>
                  <span className="text-hgf-black/70">Navy</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Komponenter:</h4>
              <p className="text-hgf-black/70">
                Button, Input, Textarea, Select, Checkbox, Card, LocationAutocomplete
              </p>
            </div>

            <Link href="/styleguide">
              <Button variant="outline" size="sm">
                Öppna styleguide
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Not yet implemented */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-hgf-black/50">
              <Clock className="h-5 w-5" />
              Ej implementerat ännu
            </CardTitle>
            <CardDescription>Dessa funktioner har UI men saknar backend-integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-hgf-black/60">
            <div>
              <h4 className="font-medium mb-1">Beställ material</h4>
              <p>Formulär finns på <code className="bg-hgf-neutral/30 px-1 rounded">/bestall-material</code>. Behöver: notifikation till HGF för fysisk hantering.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Bli aktiv medlem</h4>
              <p>Formulär finns på <code className="bg-hgf-neutral/30 px-1 rounded">/bli-aktiv</code>. Behöver: Brevo-integration + ev. Notion-webhook för screening.</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-hgf-black/50 pt-4">
          <p>Byggd med Next.js · Styling: Tailwind CSS · CRM: Brevo</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/" className="text-hgf-blue hover:underline">
              Till sajten →
            </Link>
            <Link href="/styleguide" className="text-hgf-blue hover:underline">
              Styleguide →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
