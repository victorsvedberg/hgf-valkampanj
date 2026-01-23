"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, MapPin, ArrowRight, Check, Send } from "lucide-react";

// Dummy-data för politiker (ersätts med lookup-tabell)
const dummyPoliticians = [
  {
    name: "Anna Politiker",
    party: "Socialdemokraterna",
    role: "Riksdagsledamot",
    email: "anna.politiker@riksdagen.se",
    region: "Stockholm",
  },
  {
    name: "Erik Folkpartist",
    party: "Liberalerna",
    role: "Kommunalråd",
    email: "erik.folkpartist@kommun.se",
    region: "Stockholm",
  },
  {
    name: "Maria Moderat",
    party: "Moderaterna",
    role: "Riksdagsledamot",
    email: "maria.moderat@riksdagen.se",
    region: "Stockholm",
  },
];

const defaultMessage = `Hej,

Jag skriver till dig angående hotet om marknadshyror. Som hyresgäst är jag orolig för vad marknadshyror skulle innebära för mig och andra hyresgäster.

Marknadshyror skulle leda till kraftigt höjda hyror, särskilt i attraktiva områden. Det skulle slå hårt mot alla som inte har råd att köpa sin bostad.

Jag vill veta: Hur ställer du dig till marknadshyror? Kommer du att arbeta för att stoppa införandet av marknadshyror?

Tack för ditt svar.

Med vänlig hälsning`;

export default function KontaktaPolitikerPage() {
  const [step, setStep] = useState<"message" | "postalCode" | "politicians">("message");
  const [message, setMessage] = useState(defaultMessage);
  const [postalCode, setPostalCode] = useState("");
  const [sentEmails, setSentEmails] = useState<string[]>([]);

  const handleMessageNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("postalCode");
  };

  const handlePostalCodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementera postnummer → politiker lookup
    setStep("politicians");
  };

  const handleSendEmail = (politician: typeof dummyPoliticians[0]) => {
    // Markera som skickat (för demo - i produktion öppnas mailto:)
    setSentEmails([...sentEmails, politician.email]);

    // TODO: I produktion, öppna mailto:
    // const subject = encodeURIComponent("Fråga om marknadshyror");
    // const body = encodeURIComponent(message);
    // window.location.href = `mailto:${politician.email}?subject=${subject}&body=${body}`;

    // TODO: Logga i Brevo att användaren kontaktat politiker
    console.log("Kontaktade politiker:", politician.email);
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
              <div className={`flex items-center gap-2 ${step === "postalCode" ? "text-hgf-blue font-medium" : "text-hgf-black/50"}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${step === "message" ? "bg-hgf-neutral text-hgf-black/50" : "bg-hgf-blue text-white"}`}>
                  {step === "politicians" ? <Check className="h-4 w-4" /> : "2"}
                </span>
                <span className="hidden sm:inline">Ange postnummer</span>
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
                          Nästa: Ange postnummer
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Steg 2: Ange postnummer */}
            {step === "postalCode" && (
              <div className="animate-fade-in">
                <Card className="max-w-md mx-auto">
                  <CardHeader className="text-center">
                    <CardTitle>Var bor du?</CardTitle>
                    <CardDescription>
                      Ange ditt postnummer så hittar vi politikerna som representerar dig.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePostalCodeSearch} className="space-y-6">
                      <Input
                        placeholder="123 45"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="text-center text-2xl py-6"
                        required
                      />
                      <div className="flex gap-3">
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
                  <h2 className="mb-2">Politiker i ditt område</h2>
                  <p className="text-hgf-black/70">
                    Klicka på en politiker för att skicka ditt meddelande via din e-postklient.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
                  {dummyPoliticians.map((politician, index) => {
                    const isSent = sentEmails.includes(politician.email);

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
                                {politician.region}
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
                  <Button variant="outline" onClick={() => setStep("postalCode")}>
                    Byt postnummer
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
