import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileText, Image, Share2 } from "lucide-react";

const materials = [
  {
    category: "Flygblad",
    icon: FileText,
    items: [
      {
        title: "Flygblad A5 - Stoppa marknadshyror",
        description: "Informativt flygblad med fakta om marknadshyror och vad det betyder för hyresgäster.",
        format: "PDF, A5",
        size: "1.2 MB",
        url: "#",
      },
      {
        title: "Flygblad A4 - Skriv under uppropet",
        description: "Uppmanar till att skriva under uppropet. Perfekt för dörrknackning.",
        format: "PDF, A4",
        size: "0.8 MB",
        url: "#",
      },
    ],
  },
  {
    category: "Sociala medier",
    icon: Share2,
    items: [
      {
        title: "Instagram Story - Skriv under",
        description: "Animerad story som uppmanar följare att skriva under.",
        format: "MP4, 1080x1920",
        size: "3.5 MB",
        url: "#",
      },
      {
        title: "Facebook-bild - Kampanjlogga",
        description: "Delbar bild med kampanjbudskap för Facebook.",
        format: "PNG, 1200x630",
        size: "0.5 MB",
        url: "#",
      },
      {
        title: "Instagram-karusell - Fakta",
        description: "5-bilds karusell med fakta om marknadshyror.",
        format: "PNG, 1080x1080",
        size: "2.1 MB",
        url: "#",
      },
    ],
  },
  {
    category: "Affischer",
    icon: Image,
    items: [
      {
        title: "Affisch A3 - Huvudbudskap",
        description: "Stor affisch med kampanjens huvudbudskap. Perfekt för anslagstavlor.",
        format: "PDF, A3",
        size: "4.2 MB",
        url: "#",
      },
      {
        title: "Affisch A4 - QR-kod",
        description: "Affisch med QR-kod som leder till namninsamlingen.",
        format: "PDF, A4",
        size: "1.8 MB",
        url: "#",
      },
    ],
  },
];

export default function MaterialPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-hgf-blue py-16 md:py-24 text-center text-white">
          <div className="container-narrow">
            <span className="badge bg-white/20 text-white mb-4">Material</span>
            <h1 className="text-white mb-4">Ladda ned kampanjmaterial</h1>
            <p className="text-xl text-white/90 max-w-xl mx-auto">
              Här hittar du färdigt material att skriva ut, dela i sociala medier
              eller sätta upp i ditt område.
            </p>
          </div>
        </section>

        {/* Material-lista */}
        <section className="section">
          <div className="container-page">
            <div className="max-w-4xl mx-auto space-y-12">
              {materials.map((category) => (
                <div key={category.category}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-hgf-bg-light-blue flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-hgf-blue" />
                    </div>
                    <h2 className="text-2xl">{category.category}</h2>
                  </div>

                  <div className="grid gap-4">
                    {category.items.map((item) => (
                      <Card key={item.title} className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
                          <div className="flex-1">
                            <CardHeader className="p-0">
                              <CardTitle className="text-lg">{item.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {item.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 mt-2">
                              <p className="text-sm text-hgf-black/50">
                                {item.format} &middot; {item.size}
                              </p>
                            </CardContent>
                          </div>
                          <Button variant="outline" asChild>
                            <a href={item.url} download>
                              <Download className="h-4 w-4 mr-2" />
                              Ladda ned
                            </a>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-hgf-bg-light-blue py-16 text-center">
          <div className="container-narrow">
            <h2 className="mb-4">Behöver du tryckt material?</h2>
            <p className="text-hgf-black/70 text-lg mb-8 max-w-lg mx-auto">
              Beställ färdigtryckt kampanjmaterial som du kan dela ut i ditt bostadsområde.
            </p>
            <Button variant="red" asChild>
              <a href="/bestall-material">Beställ kampanjmaterial</a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
