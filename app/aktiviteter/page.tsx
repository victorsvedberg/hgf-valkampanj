"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { Calendar, MapPin, Clock, ArrowRight, Check, X, Loader2 } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  postnummer: string;
  kommun: string;
  kommunKod: string;
  lan: string;
  isOnline?: boolean;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("sv-SE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface SelectedLocation {
  ort: string;
  kommun: string;
  kommunKod: string;
  lan: string;
}

export default function AktiviteterPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Hämta aktiviteter från API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch("/api/activities");
        const data = await response.json();
        setActivities(data.activities || []);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchActivities();
  }, []);

  // Filtrera och sortera events baserat på vald plats
  const filteredEvents = useMemo(() => {
    if (!selectedLocation) return activities;

    // Filtrera på samma län (inkluderar kranskommuner)
    const matching = activities.filter(event =>
      event.isOnline || event.lan === selectedLocation.lan
    );

    // Sortera: exakt kommun först, sedan andra i länet, sedan online
    return matching.sort((a, b) => {
      const aExactMatch = a.kommunKod === selectedLocation.kommunKod;
      const bExactMatch = b.kommunKod === selectedLocation.kommunKod;

      // Exakt kommun-match först
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Online-aktiviteter sist
      if (a.isOnline && !b.isOnline) return 1;
      if (!a.isOnline && b.isOnline) return -1;

      // Annars sortera på datum
      return a.date.localeCompare(b.date);
    });
  }, [selectedLocation, activities]);

  const handleRegister = async (eventId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/activities/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Något gick fel");
      }

      setRegisteredEvents([...registeredEvents, eventId]);
      setSelectedEvent(null);
      setFormData({ firstName: "", lastName: "", email: "", phone: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte genomföra anmälan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-hgf-blue py-16 md:py-24 text-center text-white">
          <div className="container-narrow">
            <span className="badge bg-white/20 text-white mb-4">Aktiviteter</span>
            <h1 className="text-white mb-4">Kommande aktiviteter</h1>
            <p className="text-xl text-white/90 max-w-xl mx-auto mb-8">
              Delta i kampanjaktiviteter nära dig. Träffa andra engagerade
              och gör skillnad tillsammans.
            </p>

            {/* Sök på plats */}
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-xl p-4">
                <LocationAutocomplete
                  placeholder="Sök ort eller postnummer..."
                  onSelect={(result) => setSelectedLocation(result)}
                  onClear={() => setSelectedLocation(null)}
                />
              </div>
              {selectedLocation && (
                <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  Visar aktiviteter i {selectedLocation.kommun}
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Event-lista */}
        <section className="section bg-hgf-bg-light-blue">
          <div className="container-page">
            {isLoadingActivities ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-hgf-blue" />
              </div>
            ) : (
              <div className="grid gap-6 max-w-3xl mx-auto">
                {filteredEvents.map((event) => {
                  const isRegistered = registeredEvents.includes(event.id);

                  return (
                    <Card key={event.id} className="overflow-hidden">
                      <div className="md:flex">
                        {/* Datum-badge */}
                        <div className="bg-hgf-red text-white p-6 md:p-8 md:w-36 flex flex-col items-center justify-center text-center shrink-0">
                          <span className="text-4xl font-bold">
                            {new Date(event.date).getDate()}
                          </span>
                          <span className="text-sm uppercase tracking-wide">
                            {new Date(event.date).toLocaleDateString("sv-SE", {
                              month: "short",
                            })}
                          </span>
                        </div>

                        <div className="flex-1 p-6 md:p-8">
                          <CardHeader className="p-0 mb-4">
                            <CardTitle className="text-xl">{event.title}</CardTitle>
                            <CardDescription className="text-base mt-1">{event.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="flex flex-wrap gap-4 text-sm text-hgf-black/70 mb-6">
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-hgf-blue" />
                                {formatDate(event.date)}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-hgf-blue" />
                                {event.time}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-hgf-blue" />
                                {event.location || (event.isOnline ? "Online" : "")}
                              </span>
                            </div>

                            {isRegistered ? (
                              <div className="inline-flex items-center gap-2 text-hgf-blue font-medium">
                                <span className="w-6 h-6 rounded-full bg-hgf-blue text-white flex items-center justify-center">
                                  <Check className="h-4 w-4" />
                                </span>
                                Du är anmäld!
                              </div>
                            ) : selectedEvent === event.id ? (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleRegister(event.id);
                                }}
                                className="space-y-4 pt-6 border-t border-hgf-neutral animate-fade-in"
                              >
                                {error && (
                                  <p className="text-red-600 text-sm">{error}</p>
                                )}
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
                                <div className="grid grid-cols-2 gap-4">
                                  <Input
                                    type="email"
                                    placeholder="E-post"
                                    value={formData.email}
                                    onChange={(e) =>
                                      setFormData({ ...formData, email: e.target.value })
                                    }
                                    required
                                  />
                                  <Input
                                    type="tel"
                                    placeholder="Telefon"
                                    value={formData.phone}
                                    onChange={(e) =>
                                      setFormData({ ...formData, phone: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button type="submit" variant="red" loading={isSubmitting}>
                                    Bekräfta anmälan
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setSelectedEvent(null)}
                                  >
                                    Avbryt
                                  </Button>
                                </div>
                              </form>
                            ) : (
                              <Button
                                onClick={() => setSelectedEvent(event.id)}
                                variant="red"
                              >
                                Anmäl dig
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            )}
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Inga aktiviteter-meddelande */}
            {!isLoadingActivities && filteredEvents.length === 0 && (
              <Card className="max-w-lg mx-auto text-center p-8">
                <Calendar className="h-12 w-12 text-hgf-black/20 mx-auto mb-4" />
                <CardTitle className="mb-2">
                  {selectedLocation
                    ? `Inga aktiviteter i ${selectedLocation.kommun}`
                    : "Inga aktiviteter just nu"}
                </CardTitle>
                <CardDescription>
                  {selectedLocation
                    ? "Det finns inga planerade aktiviteter i detta område just nu. Prova att söka på en annan ort eller registrera dig som aktiv medlem."
                    : "Det finns inga planerade aktiviteter just nu. Registrera dig som aktiv medlem för att få besked när nya aktiviteter planeras."}
                </CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                  {selectedLocation && (
                    <Button variant="outline" onClick={() => setSelectedLocation(null)}>
                      Visa alla aktiviteter
                    </Button>
                  )}
                  <Button variant="red" asChild>
                    <a href="/bli-aktiv">Bli aktiv medlem</a>
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-hgf-bg-light-blue py-16 text-center">
          <div className="container-narrow">
            <h2 className="mb-4">Vill du arrangera en aktivitet?</h2>
            <p className="text-hgf-black/70 text-lg mb-8 max-w-lg mx-auto">
              Bli aktiv medlem och hjälp till att planera kampanjaktiviteter i ditt område.
            </p>
            <Button variant="red" asChild>
              <a href="/bli-aktiv">
                Bli aktiv medlem
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
