"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Package } from "lucide-react";

const materialOptions = [
  { value: "50", label: "50 dörrhängare" },
  { value: "100", label: "100 dörrhängare" },
  { value: "200", label: "200 dörrhängare" },
  { value: "500", label: "500 dörrhängare" },
];

export default function BestallMaterialPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    quantity: "",
    message: "",
    acceptTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/material/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim(),
          postalCode: formData.postalCode.trim(),
          city: formData.city.trim(),
          quantity: formData.quantity,
          message: formData.message.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Något gick fel");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skicka beställningen. Försök igen.");
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-3xl md:text-4xl mb-4">Tack för din beställning!</h1>
            <p className="text-lg text-hgf-black/70 mb-8 max-w-md mx-auto">
              Vi har tagit emot din beställning och skickar materialet
              till dig så snart som möjligt.
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
            <span className="badge bg-white/20 text-white mb-4">Material</span>
            <h1 className="text-white mb-4">Beställ kampanjmaterial</h1>
            <p className="text-xl text-white/90 max-w-xl mx-auto">
              Hjälp till att sprida budskapet i ditt område.
              Beställ dörrhängare och annat material kostnadsfritt.
            </p>
          </div>
        </section>

        <section className="section bg-hgf-bg-light-blue">
          <div className="container-narrow">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Info-kort */}
              <Card className="md:col-span-1 h-fit">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-hgf-red/10 flex items-center justify-center mb-4">
                    <Package className="h-6 w-6 text-hgf-red" />
                  </div>
                  <CardTitle>Dörrhängare</CardTitle>
                  <CardDescription>
                    Informativa dörrhängare med budskapet &quot;Stoppa marknadshyror&quot;
                    som du kan dela ut i ditt bostadsområde.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-hgf-black/70 space-y-2">
                    <li>• Kostnadsfritt</li>
                    <li>• Leverans inom 5-7 dagar</li>
                    <li>• Inklusive instruktioner</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Beställningsformulär */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Leveransuppgifter</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Förnamn"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Efternamn"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="E-post"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Telefon"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>

                    <Input
                      label="Adress"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Postnummer"
                        value={formData.postalCode}
                        onChange={(e) =>
                          setFormData({ ...formData, postalCode: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Ort"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        required
                      />
                    </div>

                    <Select
                      label="Antal dörrhängare"
                      options={materialOptions}
                      placeholder="Välj antal"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      required
                    />

                    <Textarea
                      label="Meddelande (valfritt)"
                      placeholder="Berätta gärna var du planerar att dela ut materialet..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />

                    <Checkbox
                      label="Jag godkänner att Hyresgästföreningen lagrar mina uppgifter för att hantera beställningen"
                      checked={formData.acceptTerms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          acceptTerms: (e.target as HTMLInputElement).checked,
                        })
                      }
                      required
                    />

                    <Button
                      type="submit"
                      variant="red"
                      className="w-full"
                      size="lg"
                      loading={isSubmitting}
                    >
                      Skicka beställning
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
