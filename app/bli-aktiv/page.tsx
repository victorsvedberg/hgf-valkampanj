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
import { Check, Heart, Users, Megaphone, Calendar } from "lucide-react";

const regionOptions = [
  { value: "stockholm", label: "Stockholm" },
  { value: "goteborg", label: "Göteborg" },
  { value: "malmo", label: "Malmö" },
  { value: "uppsala", label: "Uppsala" },
  { value: "vasteras", label: "Västerås" },
  { value: "orebro", label: "Örebro" },
  { value: "linkoping", label: "Linköping" },
  { value: "norrkoping", label: "Norrköping" },
  { value: "jonkoping", label: "Jönköping" },
  { value: "annan", label: "Annan ort" },
];

const interestOptions = [
  { id: "doorknocking", label: "Dörrknackning", icon: Users },
  { id: "phonecalls", label: "Ringaktiviteter", icon: Megaphone },
  { id: "events", label: "Lokala event", icon: Calendar },
  { id: "digital", label: "Digitalt arbete", icon: Heart },
];

export default function BliAktivPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    postalCode: "",
    region: "",
    interests: [] as string[],
    experience: "",
    availability: "",
    acceptTerms: false,
    acceptContact: false,
  });

  const toggleInterest = (interestId: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/volunteer/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          postalCode: formData.postalCode.trim(),
          region: formData.region,
          interests: formData.interests,
          experience: formData.experience.trim() || undefined,
          availability: formData.availability.trim() || undefined,
          acceptContact: formData.acceptContact,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Något gick fel");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skicka anmälan. Försök igen.");
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
            <h1 className="text-3xl md:text-4xl mb-4">Välkommen som aktiv!</h1>
            <p className="text-lg text-hgf-black/70 mb-4 max-w-md mx-auto">
              Tack för att du vill engagera dig! Vi har tagit emot din anmälan.
            </p>
            <p className="text-hgf-black/70 mb-8 max-w-md mx-auto">
              Inom kort kommer någon från Hyresgästföreningen att kontakta dig
              för att prata mer om hur du kan bidra i kampanjen.
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
        <section className="bg-hgf-navy py-16 md:py-24 text-center text-white">
          <div className="container-narrow">
            <span className="badge bg-white/20 text-white mb-4">Engagera dig</span>
            <h1 className="text-white mb-4">Bli aktiv medlem</h1>
            <p className="text-xl text-white/90 max-w-xl mx-auto">
              Vill du göra mer för att stoppa marknadshyror? Anmäl dig som
              aktiv medlem och bli en del av kampanjarbetet.
            </p>
          </div>
        </section>

        <section className="section bg-hgf-bg-light-blue">
          <div className="container-page">
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Info-sektion */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vad innebär det?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-hgf-black/70">
                    <p>
                      Som aktiv medlem hjälper du till med kampanjarbetet på
                      det sätt som passar dig bäst.
                    </p>
                    <p>
                      Du väljer själv hur mycket tid du vill lägga och vilka
                      aktiviteter du vill delta i.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vad händer sen?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="text-sm text-hgf-black/70 space-y-3">
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-hgf-blue/10 text-hgf-blue flex items-center justify-center shrink-0 text-xs font-semibold">
                          1
                        </span>
                        <span>Du skickar in din anmälan</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-hgf-blue/10 text-hgf-blue flex items-center justify-center shrink-0 text-xs font-semibold">
                          2
                        </span>
                        <span>Vi ringer upp dig för ett kort samtal</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-hgf-blue/10 text-hgf-blue flex items-center justify-center shrink-0 text-xs font-semibold">
                          3
                        </span>
                        <span>Du kopplas ihop med din lokala region</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-hgf-blue/10 text-hgf-blue flex items-center justify-center shrink-0 text-xs font-semibold">
                          4
                        </span>
                        <span>Du börjar delta i aktiviteter!</span>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </div>

              {/* Formulär */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Anmäl dig som aktiv</CardTitle>
                  <CardDescription>
                    Fyll i formuläret så kontaktar vi dig inom kort.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Personuppgifter */}
                    <div className="grid sm:grid-cols-2 gap-4">
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

                    <div className="grid sm:grid-cols-2 gap-4">
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
                        required
                        hint="Vi ringer upp för ett kort samtal"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Postnummer"
                        value={formData.postalCode}
                        onChange={(e) =>
                          setFormData({ ...formData, postalCode: e.target.value })
                        }
                        required
                      />
                      <Select
                        label="Region"
                        options={regionOptions}
                        placeholder="Välj region"
                        value={formData.region}
                        onChange={(e) =>
                          setFormData({ ...formData, region: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* Intressen */}
                    <div>
                      <label className="block text-sm font-medium text-hgf-black mb-3">
                        Vad vill du hjälpa till med?
                      </label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {interestOptions.map((interest) => {
                          const Icon = interest.icon;
                          const isSelected = formData.interests.includes(interest.id);

                          return (
                            <button
                              key={interest.id}
                              type="button"
                              onClick={() => toggleInterest(interest.id)}
                              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                                isSelected
                                  ? "border-hgf-blue bg-hgf-blue/5"
                                  : "border-hgf-neutral hover:border-hgf-blue/50"
                              }`}
                            >
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  isSelected
                                    ? "bg-hgf-blue text-white"
                                    : "bg-hgf-neutral/50 text-hgf-black/50"
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <span
                                className={`font-medium ${
                                  isSelected ? "text-hgf-blue" : "text-hgf-black/70"
                                }`}
                              >
                                {interest.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Textarea
                      label="Tidigare erfarenhet (valfritt)"
                      placeholder="Berätta gärna om du har tidigare erfarenhet av kampanjarbete, föreningsarbete eller liknande..."
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                    />

                    <Textarea
                      label="Tillgänglighet (valfritt)"
                      placeholder="När är du vanligtvis tillgänglig? (t.ex. kvällar, helger...)"
                      value={formData.availability}
                      onChange={(e) =>
                        setFormData({ ...formData, availability: e.target.value })
                      }
                    />

                    <div className="space-y-4 pt-2">
                      <Checkbox
                        label="Jag godkänner att Hyresgästföreningen lagrar mina uppgifter och kontaktar mig angående volontärarbete"
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
                        checked={formData.acceptContact}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            acceptContact: (e.target as HTMLInputElement).checked,
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
                      Skicka anmälan
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
