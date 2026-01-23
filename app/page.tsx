"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Check } from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    acceptTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implementera Brevo-integration
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Form data:", formData);
    setIsSubmitting(false);
    setIsSubmitted(true);
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
                  <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    Stoppa<br />marknadshyror
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-lg">
                    Skriv under uppropet och var med i kampen för rimliga hyror.
                    Tillsammans gör vi skillnad.
                  </p>
                  <div className="flex items-center gap-8 text-white/80">
                    <div>
                      <p className="text-3xl md:text-4xl font-bold text-white">12 847</p>
                      <p className="text-sm">har skrivit under</p>
                    </div>
                    <div className="w-px h-12 bg-white/30" />
                    <div>
                      <p className="text-3xl md:text-4xl font-bold text-white">Val 2026</p>
                      <p className="text-sm">gör din röst hörd</p>
                    </div>
                  </div>
                </div>

                {/* Right: Form */}
                <div>
                  {isSubmitted ? (
                    <div className="bg-white rounded-2xl p-8 md:p-10 text-center">
                      <div className="w-16 h-16 bg-hgf-blue rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-hgf-black mb-3">
                        Tack för din underskrift!
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
      </main>

      <Footer />
    </div>
  );
}
