"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function SkrivUnderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    postalCode: "",
    acceptTerms: false,
    acceptNewsletter: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implementera Brevo-integration
    // Simulerar API-anrop
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Form data:", formData);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-hgf-bg-light-blue">
          <div className="container-narrow py-16 text-center">
            <div className="w-20 h-20 bg-hgf-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl mb-4">Tack för din underskrift!</h1>
            <p className="text-lg text-hgf-black/70 mb-8 max-w-md mx-auto">
              Du har nu skrivit under uppropet mot marknadshyror.
              Vi kommer att höra av oss med mer information.
            </p>
            <Button variant="outline" asChild>
              <Link href="/">Tillbaka till startsidan</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-hgf-red py-16 md:py-24 text-center text-white">
          <div className="container-narrow">
            <span className="badge bg-white/20 text-white mb-4">Upprop</span>
            <h1 className="text-white mb-4">Skriv under mot marknadshyror</h1>
            <p className="text-xl text-white/90 max-w-xl mx-auto">
              Visa ditt stöd genom att skriva under vårt upprop.
              Tillsammans gör vi skillnad.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="section bg-white">
          <div className="container-narrow">

            <Card className="max-w-lg mx-auto">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Förnamn"
                      placeholder="Anna"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Efternamn"
                      placeholder="Andersson"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Input
                    label="E-post"
                    type="email"
                    placeholder="anna@exempel.se"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />

                  <Input
                    label="Postnummer"
                    placeholder="123 45"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    hint="Används för att visa lokala aktiviteter"
                  />

                  <div className="space-y-4 pt-2">
                    <Checkbox
                      label="Jag godkänner att Hyresgästföreningen lagrar mina uppgifter enligt integritetspolicyn"
                      checked={formData.acceptTerms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          acceptTerms: (e.target as HTMLInputElement).checked,
                        })
                      }
                      required
                    />

                    <Checkbox
                      label="Jag vill få nyheter och uppdateringar om kampanjen via e-post"
                      checked={formData.acceptNewsletter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          acceptNewsletter: (e.target as HTMLInputElement).checked,
                        })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="red"
                    className="w-full"
                    size="lg"
                    loading={isSubmitting}
                  >
                    Skriv under uppropet
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
