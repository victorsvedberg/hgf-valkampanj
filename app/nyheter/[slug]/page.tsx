import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const newsArticles: Record<string, {
  title: string;
  date: string;
  category: string;
  content: string;
}> = {
  "kampanjen-gar-toppenbra": {
    title: "Kampanjen går toppenbra!",
    date: "2024-12-19",
    category: "Milstolpe",
    content: `
      <p>Kampanjen Stoppa Marknadshyror fortsätter att växa och utvecklas. Vi ser ett fantastiskt engagemang från medlemmar och allmänhet över hela landet.</p>

      <h3>Stort engagemang</h3>

      <p>Fler och fler personer väljer att engagera sig i kampanjen. Många skriver under uppropet, kontaktar sina politiker och beställer material för att sprida budskapet i sina områden.</p>

      <p>Det visar att frågan om hyror och bostadspolitik verkligen engagerar människor. Tillsammans bygger vi en rörelse som politikerna inte kan ignorera inför valet 2026.</p>

      <h3>Tack för ditt engagemang!</h3>

      <p>Ett stort tack till alla er som bidrar till att kampanjen växer. Varje underskrift, varje samtal med en politiker och varje delning i sociala medier gör skillnad.</p>

      <p>Fortsätt sprida budskapet och prata med människor i din omgivning om varför marknadshyror är en dålig idé. Tillsammans kan vi stoppa marknadshyror!</p>
    `,
  },
  "kampanjen-startar": {
    title: "Kampanjen Stoppa Marknadshyror har startat!",
    date: "2026-01-15",
    category: "Kampanj",
    content: `
      <p>Idag lanserar Hyresgästföreningen kampanjen "Stoppa Marknadshyror" - en kraftsamling inför valet 2026 för att säkerställa att svenska hyresgäster även i framtiden ska kunna bo tryggt till rimliga hyror.</p>

      <p>Marknadshyror skulle innebära att hyran bestäms helt av utbud och efterfrågan, utan hänsyn till lägenhets standard eller hyresgästens ekonomi. I städer med bostadsbrist skulle detta kunna leda till dramatiska hyreshöjningar.</p>

      <h3>Vad kan du göra?</h3>

      <ul>
        <li>Skriv under vårt upprop</li>
        <li>Dela kampanjen i sociala medier</li>
        <li>Prata med dina grannar</li>
        <li>Kontakta dina lokala politiker</li>
      </ul>

      <p>Tillsammans kan vi visa att svenska hyresgäster vill behålla dagens system med förhandlade hyror.</p>
    `,
  },
  "10000-underskrifter": {
    title: "Vi har passerat 10 000 underskrifter",
    date: "2026-01-20",
    category: "Milstolpe",
    content: `
      <p>På bara fem dagar har över 10 000 personer skrivit under vårt upprop mot marknadshyror. Det visar att frågan engagerar och att oron för marknadshyror är utbredd bland Sveriges hyresgäster.</p>

      <p>Men vi stannar inte här. Vårt mål är 100 000 underskrifter innan valet 2026. Varje underskrift är en signal till politikerna att hyresgästerna inte accepterar marknadshyror.</p>

      <h3>Tack till alla som bidragit!</h3>

      <p>Ett särskilt tack till alla som delat kampanjen vidare. Mun-till-mun är fortfarande det mest effektiva sättet att sprida budskapet.</p>
    `,
  },
  "nya-aktiviteter": {
    title: "Nya kampanjaktiviteter i Stockholm och Göteborg",
    date: "2026-01-25",
    category: "Aktiviteter",
    content: `
      <p>Under februari arrangerar vi informationsträffar i Stockholm och Göteborg. Passa på att komma och lära dig mer om kampanjen och hur du kan engagera dig lokalt.</p>

      <h3>Stockholm - 8 februari</h3>
      <p>Plats: ABF-huset, Sveavägen 41<br>Tid: 18:00-20:00</p>

      <h3>Göteborg - 15 februari</h3>
      <p>Plats: Hyresgästföreningen Göteborg, Första Långgatan 17<br>Tid: 18:00-20:00</p>

      <p>Anmälan är inte obligatorisk men underlättar vår planering. Gå till aktivitetssidan för att anmäla dig.</p>
    `,
  },
  "debattartikel": {
    title: "Vår debattartikel i Dagens Nyheter",
    date: "2026-01-28",
    category: "Media",
    content: `
      <p>Idag publicerades vår debattartikel i Dagens Nyheter där vi förklarar varför marknadshyror skulle slå hårt mot vanliga hyresgäster.</p>

      <p>I artikeln lyfter vi fram:</p>

      <ul>
        <li>Hur marknadshyror fungerar i andra länder</li>
        <li>Vilka hyreshöjningar som kan förväntas i storstäderna</li>
        <li>Varför det nuvarande systemet med förhandlade hyror fungerar</li>
        <li>Hur vi gemensamt kan påverka valet 2026</li>
      </ul>

      <p>Artikeln har redan delats tusentals gånger i sociala medier och debatten är i full gång.</p>
    `,
  },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function NyhetsartikelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = newsArticles[slug];

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Artikel */}
        <article className="section">
          <div className="container-narrow">
            {/* Tillbaka-länk */}
            <Link
              href="/nyheter"
              className="inline-flex items-center gap-2 text-hgf-black/60 hover:text-hgf-blue mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Tillbaka till nyheter
            </Link>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-4">
              <span className="badge badge-red">{article.category}</span>
              <span className="text-sm text-hgf-black/50 flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(article.date)}
              </span>
            </div>

            {/* Rubrik */}
            <h1 className="mb-8">{article.title}</h1>

            {/* Innehåll */}
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-display prose-headings:text-hgf-black
                prose-p:text-hgf-black/80
                prose-a:text-hgf-blue prose-a:no-underline hover:prose-a:underline
                prose-li:text-hgf-black/80
                prose-ul:my-4 prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Dela */}
            <div className="mt-12 pt-8 border-t border-hgf-neutral">
              <p className="text-hgf-black/60 mb-4">Dela denna nyhet</p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://stoppamarknadshyror.se/nyheter/${slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://stoppamarknadshyror.se/nyheter/${slug}`)}&text=${encodeURIComponent(article.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    X / Twitter
                  </a>
                </Button>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 bg-hgf-bg-light-blue rounded-2xl p-8 text-center">
              <h2 className="text-2xl mb-4">Vill du göra skillnad?</h2>
              <p className="text-hgf-black/70 mb-6">
                Skriv under uppropet och hjälp oss stoppa marknadshyror.
              </p>
              <Button variant="red" asChild>
                <Link href="/skriv-under">Skriv under nu</Link>
              </Button>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
