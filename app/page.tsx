"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Check } from "lucide-react";
import { SignatureCounter } from "@/components/ui/signature-counter";
import { SocialProofTicker } from "@/components/ui/social-proof-ticker";

// Type for window extensions
declare global {
  interface Window {
    __incrementSignatureCount?: (amount?: number) => void;
    __updateSignatureCount?: (count: number) => void;
    __addSigner?: (name: string) => void;
  }
}

const engagementOptions = [
  {
    title: "Skriv under",
    description: "Skriv under uppropet mot marknadshyror och visa ditt stöd.",
    href: "/skriv-under",
    bgColor: "bg-hgf-red",
    textColor: "text-white",
    hoverBg: "hover:bg-hgf-red-dark",
  },
  {
    title: "Kontakta politiker",
    description: "Kontakta lokala politiker och ställ krav på bostadspolitiken.",
    href: "/kontakta-politiker",
    bgColor: "bg-hgf-blue",
    textColor: "text-white",
    hoverBg: "hover:bg-hgf-blue-dark",
  },
  {
    title: "Beställ material",
    description: "Beställ dörrhängare och kampanjmaterial för ditt område.",
    href: "/bestall-material",
    bgColor: "bg-white",
    textColor: "text-hgf-black",
    hoverBg: "hover:bg-hgf-neutral/30",
  },
  {
    title: "Gå på aktivitet",
    description: "Delta i lokala kampanjaktiviteter och träffa andra engagerade.",
    href: "/aktiviteter",
    bgColor: "bg-hgf-navy",
    textColor: "text-white",
    hoverBg: "hover:bg-hgf-blue-dark",
  },
  {
    title: "Bli aktiv medlem",
    description: "Engagera dig djupare och bli en del av kampanjarbetet.",
    href: "/bli-aktiv",
    bgColor: "bg-hgf-bg-light-blue",
    textColor: "text-hgf-black",
    hoverBg: "hover:bg-hgf-bg-blue",
  },
];

export default function HomePage() {
  const [step, setStep] = useState<"form" | "extra" | "done">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    acceptTerms: false,
  });
  const [extraData, setExtraData] = useState({
    phone: "",
    postnummer: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Optimistic update: increment counter immediately
    if (typeof window !== "undefined" && window.__incrementSignatureCount) {
      window.__incrementSignatureCount(1);
    }

    try {
      const response = await fetch("/api/petition/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Rollback optimistic update on error
        if (typeof window !== "undefined" && window.__incrementSignatureCount) {
          window.__incrementSignatureCount(-1);
        }
        throw new Error(data.error || "Något gick fel");
      }

      // Update counter with actual count from server
      if (
        typeof window !== "undefined" &&
        window.__updateSignatureCount &&
        data.newCount
      ) {
        window.__updateSignatureCount(data.newCount);
      }

      // Add to social proof ticker
      if (
        typeof window !== "undefined" &&
        window.__addSigner &&
        data.displayName
      ) {
        window.__addSigner(data.displayName);
      }

      setStep("extra");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kunde inte skicka. Försök igen."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/petition/update-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          phone: extraData.phone.trim() || undefined,
          postnummer: extraData.postnummer.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Något gick fel");
      }

      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skicka. Försök igen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipExtra = () => {
    setStep("done");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero with integrated petition form */}
        <section className="bg-hgf-red min-h-[80vh] flex items-center">
          <div className="w-full py-16 md:py-24">
            <div className="max-w-6xl mx-auto px-6 md:px-12">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left: Message */}
                <div className="text-white">
                  <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                    Stoppa<br />marknadshyror
                  </h1>
                  <SignatureCounter goal={100} className="max-w-md mb-4" />
                  <SocialProofTicker className="mb-6" />
                  <p className="text-xl md:text-2xl text-white/90 max-w-lg">
                    Skriv under uppropet och var med i kampen för rimliga hyror.
                    Tillsammans gör vi skillnad.
                  </p>
                </div>

                {/* Right: Form */}
                <div>
                  {step === "done" ? (
                    <div className="bg-white rounded-2xl p-8 md:p-10 text-center">
                      <div className="w-16 h-16 bg-hgf-blue rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-hgf-black mb-3">
                        Tack {formData.firstName}!
                      </h2>
                      <p className="text-hgf-black/70 mb-6">
                        Du är nu en del av rörelsen. Vi hör av oss med mer information.
                      </p>
                      <Button variant="outline" asChild>
                        <Link href="/kontakta-politiker">
                          Nästa steg: Kontakta politiker
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ) : step === "extra" ? (
                    <div className="bg-white rounded-2xl p-8 md:p-10">
                      <div className="w-12 h-12 bg-hgf-blue rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-hgf-black mb-2 text-center">
                        Tack för din underskrift!
                      </h2>
                      <p className="text-hgf-black/70 mb-6 text-center">
                        Vill du hjälpa oss ännu mer? Med ditt postnummer och mobilnummer
                        kan vi skicka relevanta uppdateringar och meddela dig när
                        blixtaktioner sker i din närhet.
                      </p>

                      <form onSubmit={handleExtraSubmit} className="space-y-4">
                        <Input
                          type="tel"
                          placeholder="Mobilnummer (t.ex. 070-123 45 67)"
                          value={extraData.phone}
                          onChange={(e) =>
                            setExtraData({ ...extraData, phone: e.target.value })
                          }
                        />
                        <Input
                          placeholder="Postnummer (t.ex. 114 40)"
                          value={extraData.postnummer}
                          onChange={(e) =>
                            setExtraData({ ...extraData, postnummer: e.target.value })
                          }
                        />

                        {error && (
                          <p className="text-red-600 text-sm">{error}</p>
                        )}

                        <Button
                          type="submit"
                          variant="red"
                          className="w-full"
                          size="lg"
                          loading={isSubmitting}
                        >
                          Spara uppgifter
                        </Button>
                        <button
                          type="button"
                          onClick={skipExtra}
                          className="w-full text-sm text-hgf-black/50 hover:text-hgf-black transition-colors"
                        >
                          Hoppa över
                        </button>
                      </form>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 md:p-10">
                      <h2 className="text-2xl font-bold text-hgf-black mb-6">
                        Skriv under nu
                      </h2>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="Förnamn"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({ ...formData, firstName: e.target.value })
                            }
                            required
                          />
                          <Input
                            placeholder="Efternamn"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({ ...formData, lastName: e.target.value })
                            }
                            required
                          />
                        </div>

                        <Input
                          type="email"
                          placeholder="E-postadress"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                        />

                        <Checkbox
                          label="Jag godkänner att mina uppgifter lagras enligt integritetspolicyn"
                          checked={formData.acceptTerms}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              acceptTerms: (e.target as HTMLInputElement).checked,
                            })
                          }
                          required
                        />
                      </div>

                      {error && (
                        <p className="text-red-600 text-sm mt-4">{error}</p>
                      )}

                      <Button
                        type="submit"
                        variant="red"
                        className="w-full mt-6"
                        size="lg"
                        loading={isSubmitting}
                      >
                        Skriv under uppropet
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>

                      <p className="text-xs text-hgf-black/50 mt-4 text-center">
                        Genom att skriva under stödjer du kampen mot marknadshyror
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Engagement Options - Fullwidth grid */}
        <section>
          <div className="py-12 md:py-16 text-center bg-white">
            <h2 className="mb-4">Fler sätt att engagera dig</h2>
            <p className="text-lg text-hgf-black/70 max-w-2xl mx-auto px-4">
              Det finns många sätt att bidra till kampen mot marknadshyror.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5">
            {engagementOptions.map((option) => (
              <Link
                key={option.href}
                href={option.href}
                className={`
                  ${option.bgColor} ${option.textColor} ${option.hoverBg}
                  aspect-square flex flex-col justify-end p-6 md:p-8
                  transition-colors duration-200 group
                `}
              >
                <h3 className={`text-xl md:text-2xl font-semibold mb-2 ${option.textColor}`}>
                  {option.title}
                </h3>
                <p className={`text-sm md:text-base mb-4 ${option.textColor} opacity-80`}>
                  {option.description}
                </p>
                <span className={`inline-flex items-center gap-1 group-hover:gap-2 transition-all text-sm font-medium ${option.textColor}`}>
                  Läs mer
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Våra krav */}
        <section className="bg-hgf-navy text-white py-20 md:py-28">
          <div className="container-page">
            <div className="text-center mb-12 md:mb-16">
              <span className="inline-block bg-hgf-red text-white text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
                Våra krav
              </span>
              <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold max-w-3xl mx-auto">
                En bostadspolitik för alla – inte bara för dem med störst plånbok
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {/* Krav 1 */}
              <div className="relative">
                <span className="text-8xl md:text-9xl font-bold text-white/10 absolute -top-8 -left-2">
                  1
                </span>
                <div className="relative pt-8">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                    Fler bostäder med rimliga hyror
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    För att möta bostadsbristen behövs fler hyresrätter till rimliga hyror. Staten bör stötta byggandet med förmånliga bygglån så att nyproduktionen ökar i den takt som krävs samtidigt som hyrorna hålls nere.
                  </p>
                </div>
              </div>

              {/* Krav 2 */}
              <div className="relative">
                <span className="text-8xl md:text-9xl font-bold text-white/10 absolute -top-8 -left-2">
                  2
                </span>
                <div className="relative pt-8">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                    Nej till marknadshyror
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    Marknadshyror leder till stora hyreshöjningar som skulle tvinga många att flytta och öka hemlösheten. För att bostadsmarknaden och arbetsmarknaden ska fungera behöver vi fler hyresrätter med rimliga hyror. Ett tryggt boende hela livet.
                  </p>
                </div>
              </div>

              {/* Krav 3 */}
              <div className="relative">
                <span className="text-8xl md:text-9xl font-bold text-white/10 absolute -top-8 -left-2">
                  3
                </span>
                <div className="relative pt-8">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                    Bostadskö efter behov, inte bara kötid
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    I dag styr kötid nästan helt vem som får en bostad, vilket missgynnar unga. Reglerna måste ändras så att fler lägenheter kan fördelas efter behov, till exempel till dem som står utan boende.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-hgf-bg-light-blue py-20 md:py-28">
          <div className="container-narrow text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-hgf-black mb-6">
              Valet 2026 avgör bostadspolitiken
            </h2>
            <p className="text-lg md:text-xl text-hgf-black/70 max-w-2xl mx-auto mb-10">
              Tillsammans kan vi stoppa marknadshyror och säkra rätten till ett tryggt boende.
              Varje underskrift räknas. Varje röst gör skillnad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="red" size="lg" asChild>
                <Link href="/skriv-under">
                  Skriv under nu
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/bli-aktiv">
                  Bli aktiv i kampanjen
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
