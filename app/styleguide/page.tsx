import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ArrowRight, Heart, Mail } from "lucide-react";

export default function StyleguidePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-hgf-navy py-16 md:py-24 text-center text-white">
          <div className="container-narrow">
            <span className="badge bg-white/20 text-white mb-4">Dokumentation</span>
            <h1 className="text-white mb-4">Style Guide</h1>
            <p className="text-xl text-white/90 max-w-xl mx-auto">
              Designsystem baserat på Hyresgästföreningens huvudsajt för kampanjen Stoppa Marknadshyror.
            </p>
          </div>
        </section>

        {/* Brand Colors */}
        <section className="section-sm bg-white">
          <div className="container-page">
            <h2 className="text-2xl mb-6">Varumärkesfärger</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="color-swatch bg-hgf-red">
                  <span className="text-white text-xs font-mono">#FF0037</span>
                </div>
                <p className="mt-2 text-sm font-medium">HGF Röd</p>
                <p className="text-xs text-hgf-black/50">Huvudfärg (brand)</p>
              </div>
              <div>
                <div className="color-swatch bg-hgf-red-dark">
                  <span className="text-white text-xs font-mono">#CC002C</span>
                </div>
                <p className="mt-2 text-sm font-medium">HGF Röd Dark</p>
                <p className="text-xs text-hgf-black/50">Hover</p>
              </div>
              <div>
                <div className="color-swatch bg-hgf-black">
                  <span className="text-white text-xs font-mono">#1A1A1A</span>
                </div>
                <p className="mt-2 text-sm font-medium">HGF Svart</p>
                <p className="text-xs text-hgf-black/50">Text & sekundär</p>
              </div>
              <div>
                <div className="color-swatch bg-white border border-hgf-neutral">
                  <span className="text-hgf-black text-xs font-mono">#FFFFFF</span>
                </div>
                <p className="mt-2 text-sm font-medium">Vit</p>
                <p className="text-xs text-hgf-black/50">Kontrast</p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Colors */}
        <section className="section-sm bg-hgf-bg-light-blue">
          <div className="container-page">
            <h2 className="text-2xl mb-6">Funktionsfärger (Knappar & Länkar)</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="color-swatch bg-hgf-blue">
                  <span className="text-white text-xs font-mono">#231FD8</span>
                </div>
                <p className="mt-2 text-sm font-medium">Action Blå</p>
                <p className="text-xs text-hgf-black/50">Knappar & länkar</p>
              </div>
              <div>
                <div className="color-swatch bg-hgf-blue-dark">
                  <span className="text-white text-xs font-mono">#06007E</span>
                </div>
                <p className="mt-2 text-sm font-medium">Action Blå Dark</p>
                <p className="text-xs text-hgf-black/50">Hover</p>
              </div>
              <div>
                <div className="color-swatch bg-hgf-navy">
                  <span className="text-white text-xs font-mono">#0D1B4C</span>
                </div>
                <p className="mt-2 text-sm font-medium">Navy</p>
                <p className="text-xs text-hgf-black/50">Footer bakgrund</p>
              </div>
              <div>
                <div className="color-swatch bg-hgf-warning">
                  <span className="text-hgf-black text-xs font-mono">#FFE988</span>
                </div>
                <p className="mt-2 text-sm font-medium">Varningsgul</p>
                <p className="text-xs text-hgf-black/50">Viktig info</p>
              </div>
              <div>
                <div className="color-swatch bg-hgf-green">
                  <span className="text-white text-xs font-mono">#71b942</span>
                </div>
                <p className="mt-2 text-sm font-medium">Hem & Hyra Grön</p>
                <p className="text-xs text-hgf-black/50">Specifik användning</p>
              </div>
            </div>
          </div>
        </section>

        {/* Background Colors */}
        <section className="section-sm bg-white">
          <div className="container-page">
            <h2 className="text-2xl mb-6">Bakgrundsfärger</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div>
                <div className="color-swatch bg-hgf-bg-light-blue border border-hgf-neutral/30">
                  <span className="text-hgf-black text-xs font-mono">#EBF3FF</span>
                </div>
                <p className="mt-2 text-sm font-medium">Ljusblå</p>
                <p className="text-xs text-hgf-black/50">Block & faktarutor</p>
              </div>
              <div>
                <div className="color-swatch bg-hgf-bg-blue border border-hgf-neutral/30">
                  <span className="text-hgf-black text-xs font-mono">#D8E8FF</span>
                </div>
                <p className="mt-2 text-sm font-medium">Blå</p>
                <p className="text-xs text-hgf-black/50">Faktarutor</p>
              </div>
              <div>
                <div className="color-swatch bg-hgf-bg-pink border border-hgf-neutral/30">
                  <span className="text-hgf-black text-xs font-mono">#FFF5FB</span>
                </div>
                <p className="mt-2 text-sm font-medium">Ljusrosa</p>
                <p className="text-xs text-hgf-black/50">Länksektioner</p>
              </div>
              <div>
                <div className="color-swatch bg-hgf-neutral border border-hgf-neutral-dark/20">
                  <span className="text-hgf-black text-xs font-mono">#E5E5E5</span>
                </div>
                <p className="mt-2 text-sm font-medium">Neutral</p>
                <p className="text-xs text-hgf-black/50">Borders</p>
              </div>
              <div>
                <div className="color-swatch bg-white border border-hgf-neutral">
                  <span className="text-hgf-black text-xs font-mono">#FFFFFF</span>
                </div>
                <p className="mt-2 text-sm font-medium">Vit bakgrund</p>
                <p className="text-xs text-hgf-black/50">Standard</p>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="section-sm bg-hgf-bg-light-blue">
          <div className="container-page">
            <h2 className="text-2xl mb-6">Typografi</h2>
            <div className="space-y-6">
              <div className="component-demo">
                <p className="text-sm text-hgf-black/50 mb-4">
                  Font: HyraSans (brödtext), HyraSansDisplay (rubriker) · Fluid Typography
                </p>
              </div>
              <div className="component-demo">
                <h1>Rubrik H1</h1>
                <p className="text-sm text-hgf-black/50 mt-2">
                  27px → 60px (fluid) · HyraSansDisplay · font-semibold
                </p>
              </div>
              <div className="component-demo">
                <h1 className="brand">Rubrik H1 Brand</h1>
                <p className="text-sm text-hgf-black/50 mt-2">
                  Röd kursiv rubrik (HGF brand style) · Använd className=&quot;brand&quot;
                </p>
              </div>
              <div className="component-demo">
                <h2>Rubrik H2</h2>
                <p className="text-sm text-hgf-black/50 mt-2">
                  23px → 48px (fluid) · HyraSansDisplay · font-semibold
                </p>
              </div>
              <div className="component-demo">
                <h3>Rubrik H3</h3>
                <p className="text-sm text-hgf-black/50 mt-2">
                  text-2xl md:text-3xl · HyraSansDisplay · font-semibold
                </p>
              </div>
              <div className="component-demo">
                <h4>Rubrik H4</h4>
                <p className="text-sm text-hgf-black/50 mt-2">
                  text-xl md:text-2xl · HyraSansDisplay · font-semibold
                </p>
              </div>
              <div className="component-demo">
                <p>
                  Detta är en paragraf med brödtext. Lorem ipsum dolor sit amet,
                  consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                  labore et dolore magna aliqua.
                </p>
                <p className="text-sm text-hgf-black/50 mt-2">16px → 18px (fluid) · HyraSans</p>
              </div>
              <div className="component-demo">
                <span className="text-hgf-blue hover:text-hgf-blue-dark transition-colors cursor-pointer">
                  Detta är en länk i texten
                </span>
                <p className="text-sm text-hgf-black/50 mt-2">text-hgf-blue · hover:text-hgf-blue-dark</p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="section-sm bg-white">
          <div className="container-page">
            <h2 className="text-2xl mb-6">Knappar</h2>
            <p className="text-sm text-hgf-black/70 mb-6">
              Pillerform (border-radius: 2em) · Font-weight: bold · Padding: 0.75em/1.3em
            </p>

            <div className="space-y-8">
              {/* Variants */}
              <div>
                <h3 className="text-lg font-medium mb-4">Varianter</h3>
                <div className="component-demo flex flex-wrap gap-4">
                  <Button>Default (Blå)</Button>
                  <Button variant="red">Röd</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              {/* On colored backgrounds */}
              <div>
                <h3 className="text-lg font-medium mb-4">På färgade bakgrunder</h3>
                <div className="component-demo bg-hgf-red p-6 rounded-xl flex flex-wrap gap-4">
                  <Button variant="white">Vit knapp</Button>
                  <Button variant="outline-white">Outline vit</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-lg font-medium mb-4">Storlekar</h3>
                <div className="component-demo flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* States */}
              <div>
                <h3 className="text-lg font-medium mb-4">Tillstånd</h3>
                <div className="component-demo flex flex-wrap gap-4">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                  <Button loading>Loading</Button>
                </div>
              </div>

              {/* With Icons */}
              <div>
                <h3 className="text-lg font-medium mb-4">Med ikoner</h3>
                <div className="component-demo flex flex-wrap gap-4">
                  <Button>
                    Fortsätt
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Skicka mejl
                  </Button>
                  <Button variant="red">
                    Skriv under
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="section-sm bg-hgf-bg-light-blue">
          <div className="container-page">
            <h2 className="text-2xl mb-6">Formulärelement</h2>

            <div className="space-y-8 max-w-md">
              {/* Input */}
              <div>
                <h3 className="text-lg font-medium mb-4">Input</h3>
                <div className="space-y-4">
                  <Input label="Med label" placeholder="Skriv här..." />
                  <Input placeholder="Utan label" />
                  <Input
                    label="Med hint"
                    placeholder="Skriv här..."
                    hint="Detta är en hjälptext"
                  />
                  <Input
                    label="Med fel"
                    placeholder="Skriv här..."
                    error="Detta fält är obligatoriskt"
                  />
                  <Input label="Disabled" placeholder="Skriv här..." disabled />
                </div>
              </div>

              {/* Textarea */}
              <div>
                <h3 className="text-lg font-medium mb-4">Textarea</h3>
                <div className="space-y-4">
                  <Textarea
                    label="Meddelande"
                    placeholder="Skriv ditt meddelande här..."
                  />
                  <Textarea
                    label="Med fel"
                    placeholder="Skriv här..."
                    error="Meddelandet är för kort"
                  />
                </div>
              </div>

              {/* Select */}
              <div>
                <h3 className="text-lg font-medium mb-4">Select</h3>
                <div className="space-y-4">
                  <Select
                    label="Välj region"
                    placeholder="Välj..."
                    options={[
                      { value: "stockholm", label: "Stockholm" },
                      { value: "goteborg", label: "Göteborg" },
                      { value: "malmo", label: "Malmö" },
                    ]}
                  />
                </div>
              </div>

              {/* Checkbox */}
              <div>
                <h3 className="text-lg font-medium mb-4">Checkbox</h3>
                <div className="space-y-4">
                  <Checkbox label="Jag godkänner villkoren" />
                  <Checkbox label="Checked by default" defaultChecked />
                  <Checkbox label="Disabled checkbox" disabled />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="section-sm bg-white">
          <div className="container-page">
            <h2 className="text-2xl mb-6">Kort</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enkel kort</CardTitle>
                  <CardDescription>Med titel och beskrivning</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-hgf-black/70">
                    Kortets innehåll placeras här.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-hgf-bg-light-blue flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-hgf-blue" />
                  </div>
                  <CardTitle>Med ikon</CardTitle>
                  <CardDescription>Och hover-effekt</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-hgf-black/70">
                    Hover över kortet för att se effekten.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Med footer</CardTitle>
                  <CardDescription>Och en knapp</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-hgf-black/70">
                    Kortets innehåll.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Klicka här</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="section-sm bg-hgf-bg-light-blue">
          <div className="container-page">
            <h2 className="text-2xl mb-6">Badges</h2>
            <div className="component-demo flex flex-wrap gap-4">
              <span className="badge badge-red">Röd badge</span>
              <span className="badge badge-blue">Blå badge</span>
              <span className="badge badge-neutral">Neutral badge</span>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section className="section-sm bg-white">
          <div className="container-page">
            <h2 className="text-2xl mb-6">Spacing & Layout</h2>
            <div className="space-y-4">
              <div className="component-demo">
                <p className="text-sm font-medium mb-2">Container (page)</p>
                <p className="text-sm text-hgf-black/50">
                  max-width: 1375px · padding: 1.5rem (mobil) / 3rem (desktop)
                </p>
              </div>
              <div className="component-demo">
                <p className="text-sm font-medium mb-2">Container (narrow)</p>
                <p className="text-sm text-hgf-black/50">max-w-3xl · samma padding</p>
              </div>
              <div className="component-demo">
                <p className="text-sm font-medium mb-2">Section</p>
                <p className="text-sm text-hgf-black/50">py-16 md:py-24</p>
              </div>
              <div className="component-demo">
                <p className="text-sm font-medium mb-2">Section (small)</p>
                <p className="text-sm text-hgf-black/50">py-8 md:py-12</p>
              </div>
              <div className="component-demo">
                <p className="text-sm font-medium mb-2">Border Radius</p>
                <p className="text-sm text-hgf-black/50">
                  Knappar: 2em (pill) · Kort: 0.75rem · Inputs: 0.5rem · Badges: 50%
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
