import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

const news = [
  {
    id: "kampanjen-gar-toppenbra",
    title: "Kampanjen går toppenbra!",
    excerpt: "Kampanjen Stoppa Marknadshyror fortsätter att växa. Engagemanget är stort och fler och fler personer vill vara med och påverka.",
    date: "2024-12-19",
    category: "Milstolpe",
  },
  {
    id: "kampanjen-startar",
    title: "Kampanjen Stoppa Marknadshyror har startat!",
    excerpt: "Idag lanserar vi vår kampanj för att stoppa marknadshyror. Tillsammans kan vi göra skillnad inför valet 2026.",
    date: "2026-01-15",
    category: "Kampanj",
  },
  {
    id: "10000-underskrifter",
    title: "Vi har passerat 10 000 underskrifter",
    excerpt: "Tack vare er har vi nu passerat 10 000 underskrifter på uppropet. Men vi stannar inte här - målet är 100 000!",
    date: "2026-01-20",
    category: "Milstolpe",
  },
  {
    id: "nya-aktiviteter",
    title: "Nya kampanjaktiviteter i Stockholm och Göteborg",
    excerpt: "Under februari arrangerar vi informationsträffar i Stockholm och Göteborg. Kom och lär dig mer om hur du kan engagera dig!",
    date: "2026-01-25",
    category: "Aktiviteter",
  },
  {
    id: "debattartikel",
    title: "Vår debattartikel i Dagens Nyheter",
    excerpt: "Läs vår debattartikel där vi förklarar varför marknadshyror skulle slå hårt mot vanliga hyresgäster.",
    date: "2026-01-28",
    category: "Media",
  },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function NyheterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-hgf-red py-16 md:py-24 text-center text-white">
          <div className="container-narrow">
            <span className="badge bg-white/20 text-white mb-4">Nyheter</span>
            <h1 className="text-white mb-4">Kampanjnyheter</h1>
            <p className="text-xl text-white/90 max-w-xl mx-auto">
              Följ kampanjens utveckling och håll dig uppdaterad om vad som händer.
            </p>
          </div>
        </section>

        {/* Nyhetslista */}
        <section className="section">
          <div className="container-page">
            <div className="max-w-3xl mx-auto space-y-6">
              {news.map((item) => (
                <Link key={item.id} href={`/nyheter/${item.id}`} className="block group">
                  <Card className="overflow-hidden transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-1">
                    <div className="p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="badge badge-red">{item.category}</span>
                        <span className="text-sm text-hgf-black/50 flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <CardHeader className="p-0">
                        <CardTitle className="text-xl group-hover:text-hgf-blue transition-colors">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 mt-2">
                        <CardDescription className="text-base">
                          {item.excerpt}
                        </CardDescription>
                        <span className="inline-flex items-center gap-1 text-hgf-blue font-medium mt-4 group-hover:gap-2 transition-all">
                          Läs mer
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
