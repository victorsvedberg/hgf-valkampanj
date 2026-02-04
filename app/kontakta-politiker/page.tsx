"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, MapPin, ArrowRight, Check, Send, AlertCircle } from "lucide-react";

// Politiker mappade på kommunKod
const politiciansByKommun: Record<string, Array<{
  name: string;
  party: string;
  role: string;
  email: string;
}>> = {
  // Stockholm (kommunKod 0180)
  "0180": [
    {
      name: "Victor Svedberg",
      party: "Testpartiet",
      role: "Kommunalråd",
      email: "victor.svedberg@reformsociety.se",
    },
    {
      name: "Jakob Ohlsson",
      party: "Liberaldemokraterna",
      role: "Riksdagsledamot",
      email: "jakob.ohlsson@reformsociety.se",
    },
  ],
  // Huddinge (kommunKod 0126)
  "0126": [
    {
      name: "Jakob Ohlsson",
      party: "Liberaldemokraterna",
      role: "Riksdagsledamot",
      email: "jakob.ohlsson@reformsociety.se",
    },
  ],
  // Gotland (kommunKod 0980)
  "0980": [
    {
      name: "Njord Frolander",
      party: "Socialmoderaterna",
      role: "Riksdagsledamot",
      email: "njord.frolander@reformsociety.se",
    },
  ],
};

const defaultMessage = `Hej!

Jag hör av mig för att jag vill veta var du står i en fråga som berör mig väldigt direkt: marknadshyror.

Mitt hem är en hyresrätt. Det är inte ett andrahandsval – det är ett aktivt val. Jag gillar att bo i hyresrätt. Men om marknadshyror blir verklighet riskerar min hyra att skjuta i höjden, och plötsligt handlar det inte längre om var jag vill bo – utan om var jag har råd att bo.

Det här är inte bara min verklighet. Hundratusentals hyresgäster i Sverige befinner sig i samma sits. Och vi lyssnar noga på vad ni politiker säger inför valet.

Så min raka fråga: Tänker du verka för att stoppa marknadshyror – ja eller nej?

Jag ser fram emot ditt svar.

Vänliga hälsningar`;

type Politician = {
  name: string;
  party: string;
  role: string;
  email: string;
};

interface SelectedLocation {
  ort: string;
  kommun: string;
  kommunKod: string;
  lan: string;
  postnummer?: string;
}

export default function KontaktaPolitikerPage() {
  const [step, setStep] = useState<"message" | "details" | "politicians">("message");
  const [message, setMessage] = useState(defaultMessage);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [matchedPoliticians, setMatchedPoliticians] = useState<Politician[]>([]);
  const [sentEmails, setSentEmails] = useState<string[]>([]);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleMessageNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("details");
  };

  const handleLocationSelect = (result: {
    ort: string;
    kommun: string;
    kommunKod: string;
    lan: string;
    postnummer?: string;
  }) => {
    setSelectedLocation(result);
    setLocationError(null);
  };

  const handleFindPoliticians = (e: React.FormEvent) => {
    e.preventDefault();
    setLocationError(null);

    if (!selectedLocation) {
      setLocationError("Välj en ort från listan");
      return;
    }

    // Hitta politiker för kommunen
    const politicians = politiciansByKommun[selectedLocation.kommunKod] || [];

    if (politicians.length === 0) {
      setLocationError(`Det finns inga politiker att kontakta i ${selectedLocation.kommun} just nu.`);
      return;
    }

    setMatchedPoliticians(politicians);
    setStep("politicians");
  };

  const handleSendEmail = async (politician: Politician) => {
    setApiError(null);
    setSendingTo(politician.email);

    try {
      const response = await fetch("/api/contact-politician", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: userName.trim(),
          userEmail: userEmail.trim(),
          politicianEmail: politician.email,
          politicianName: politician.name,
          message: message,
          postnummer: selectedLocation?.postnummer,
          kommun: selectedLocation?.kommun,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Något gick fel");
      }

      setSentEmails([...sentEmails, politician.email]);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Kunde inte skicka mejlet. Försök igen.");
    } finally {
      setSendingTo(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-hgf-blue py-16 md:py-24 text-center text-white">
          <div className="container-narrow">
            <span className="badge bg-white/20 text-white mb-4">Påverka</span>
            <h1 className="text-white mb-4">Kontakta politiker</h1>
            <p className="text-xl text-white/90 max-w-xl mx-auto">
              Fråga dina lokala politiker hur de ställer sig till marknadshyror.
              Ditt meddelande kan göra skillnad.
            </p>
          </div>
        </section>

        {/* Progress indicator */}
        <section className="bg-white border-b border-hgf-neutral py-4">
          <div className="container-narrow">
            <div className="flex items-center justify-center gap-4">
              {/* Steg 1 */}
              <div className={`flex items-center gap-2 ${step === "message" ? "text-hgf-blue font-medium" : "text-hgf-black/50"}`}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm bg-hgf-blue text-white">
                  {step === "message" ? "1" : <Check className="h-4 w-4" />}
                </span>
                <span className="hidden sm:inline">Skriv meddelande</span>
              </div>
              <div className="w-8 h-px bg-hgf-neutral" />
              {/* Steg 2 */}
              <div className={`flex items-center gap-2 ${step === "details" ? "text-hgf-blue font-medium" : "text-hgf-black/50"}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${step === "message" ? "bg-hgf-neutral text-hgf-black/50" : "bg-hgf-blue text-white"}`}>
                  {step === "politicians" ? <Check className="h-4 w-4" /> : "2"}
                </span>
                <span className="hidden sm:inline">Dina uppgifter</span>
              </div>
              <div className="w-8 h-px bg-hgf-neutral" />
              {/* Steg 3 */}
              <div className={`flex items-center gap-2 ${step === "politicians" ? "text-hgf-blue font-medium" : "text-hgf-black/50"}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${step === "politicians" ? "bg-hgf-blue text-white" : "bg-hgf-neutral text-hgf-black/50"}`}>
                  3
                </span>
                <span className="hidden sm:inline">Välj politiker</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="section bg-hgf-bg-light-blue">
          <div className="container-narrow">
            {/* API Error message (visas bara vid mejlfel) */}
            {apiError && (
              <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{apiError}</p>
              </div>
            )}

            {/* Steg 1: Skriv meddelande */}
            {step === "message" && (
              <div className="animate-fade-in">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Skriv ditt meddelande</CardTitle>
                    <CardDescription>
                      Vi har förberett en mall åt dig. Anpassa texten för att göra större intryck
                      - ett personligt meddelande är mer effektivt.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleMessageNext} className="space-y-6">
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[350px] font-mono text-sm"
                        required
                      />
                      <div className="flex justify-end">
                        <Button type="submit" variant="red">
                          Nästa: Dina uppgifter
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Steg 2: Ange uppgifter */}
            {step === "details" && (
              <div className="animate-fade-in">
                <Card className="max-w-md mx-auto">
                  <CardHeader className="text-center">
                    <CardTitle>Dina uppgifter</CardTitle>
                    <CardDescription>
                      Fyll i dina uppgifter så hittar vi politikerna i din kommun.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleFindPoliticians} className="space-y-4">
                      <Input
                        label="Ditt namn"
                        placeholder="Anna Andersson"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                      />
                      <Input
                        label="Din e-postadress"
                        type="email"
                        placeholder="anna@exempel.se"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        hint="Politikern svarar direkt till din mejl"
                        required
                      />
                      <LocationAutocomplete
                        label="Var bor du?"
                        placeholder="Sök ort eller postnummer..."
                        hint={!locationError ? "T.ex. 'Stockholm' eller '114 40'" : undefined}
                        error={locationError || undefined}
                        onSelect={handleLocationSelect}
                        onClear={() => setSelectedLocation(null)}
                      />
                      {selectedLocation && (
                        <div className="p-3 bg-hgf-bg-light-blue rounded-lg flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-hgf-blue" />
                          <span className="text-sm">
                            <strong>{selectedLocation.kommun}</strong> · {selectedLocation.lan}
                          </span>
                        </div>
                      )}
                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep("message")}
                          className="flex-1"
                        >
                          Tillbaka
                        </Button>
                        <Button type="submit" variant="red" className="flex-1">
                          Hitta politiker
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Steg 3: Välj politiker */}
            {step === "politicians" && (
              <div className="animate-fade-in space-y-8">
                <div className="text-center">
                  <h2 className="mb-2">Politiker i {selectedLocation?.kommun}</h2>
                  <p className="text-hgf-black/70">
                    Klicka för att skicka ditt meddelande. Det skickas från{" "}
                    <strong>{userEmail}</strong>.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
                  {matchedPoliticians.map((politician, index) => {
                    const isSent = sentEmails.includes(politician.email);
                    const isSending = sendingTo === politician.email;

                    return (
                      <Card
                        key={index}
                        className={`transition-all ${
                          isSent ? "opacity-75" : "hover:shadow-lg"
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-full bg-hgf-bg-light-blue flex items-center justify-center shrink-0">
                              <User className="h-7 w-7 text-hgf-blue" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-hgf-black text-lg">{politician.name}</h3>
                              <p className="text-sm text-hgf-black/70">
                                {politician.role} · {politician.party}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-hgf-black/50 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                {selectedLocation?.kommun}
                              </div>
                            </div>
                          </div>

                          {isSent ? (
                            <div className="flex items-center justify-center gap-2 text-hgf-blue font-medium py-3 bg-hgf-bg-light-blue rounded-lg">
                              <Check className="h-4 w-4" />
                              Mejl skickat
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleSendEmail(politician)}
                              variant="red"
                              className="w-full"
                              loading={isSending}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Skicka mejl
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => setStep("message")}>
                    Ändra meddelande
                  </Button>
                  <Button variant="outline" onClick={() => { setStep("details"); setLocationError(null); }}>
                    Ändra uppgifter
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Tips section */}
        <section className="section bg-white">
          <div className="container-narrow text-center">
            <h2 className="mb-4">Så skriver du ett meddelande som berör</h2>
            <p className="text-lg text-hgf-black/70 max-w-2xl mx-auto mb-10">
              Ett personligt meddelande gör större intryck än en standardtext.
              Här är några tips för att få politiker att lyssna.
            </p>
            <ul className="text-left max-w-xl mx-auto space-y-4">
              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-hgf-red text-white flex items-center justify-center shrink-0 font-bold">1</span>
                <div>
                  <strong className="text-hgf-black">Gör det personligt</strong>
                  <p className="text-hgf-black/70">Berätta varför frågan är viktig för just dig. Hur skulle marknadshyror påverka din situation?</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-hgf-red text-white flex items-center justify-center shrink-0 font-bold">2</span>
                <div>
                  <strong className="text-hgf-black">Var tydlig med din fråga</strong>
                  <p className="text-hgf-black/70">Be om ett konkret svar på hur politikern ställer sig till marknadshyror.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-hgf-red text-white flex items-center justify-center shrink-0 font-bold">3</span>
                <div>
                  <strong className="text-hgf-black">Följ upp</strong>
                  <p className="text-hgf-black/70">Får du inget svar inom en vecka? Skicka en påminnelse eller ring.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
