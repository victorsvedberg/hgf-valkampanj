"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { Calendar, MapPin, Plus, Users, ArrowRight, Loader2 } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  postnummer: string;
  kommun: string;
  isOnline: boolean;
  brevoListId: number;
  createdAt: string;
}

export default function AdminAktiviteterPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    postnummer: "",
    kommun: "",
    kommunKod: "",
    lan: "",
    isOnline: false,
  });

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/admin/${token}/activities`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Ogiltig admin-token");
        }
        throw new Error("Kunde inte hämta aktiviteter");
      }
      const data = await response.json();
      setActivities(data.activities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/${token}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Kunde inte skapa aktivitet");
      }

      // Återställ formulär och ladda om
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        postnummer: "",
        kommun: "",
        kommunKod: "",
        lan: "",
        isOnline: false,
      });
      setShowForm(false);
      await fetchActivities();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("sv-SE", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hgf-bg-light-blue">
        <Loader2 className="h-8 w-8 animate-spin text-hgf-blue" />
      </div>
    );
  }

  if (error === "Ogiltig admin-token") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hgf-bg-light-blue">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-xl font-bold text-red-600 mb-2">Åtkomst nekad</h1>
            <p className="text-hgf-black/70">Ogiltig admin-token i URL:en.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hgf-bg-light-blue">
      {/* Header */}
      <header className="bg-hgf-navy text-white py-4">
        <div className="container-page flex items-center justify-between">
          <div>
            <span className="text-white/60 text-sm">Admin</span>
            <h1 className="text-xl font-bold text-white">Aktiviteter</h1>
          </div>
          <Button
            variant="white"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ny aktivitet
          </Button>
        </div>
      </header>

      <main className="container-page py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Skapa ny aktivitet */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Skapa ny aktivitet</CardTitle>
              <CardDescription>
                Detta skapar automatiskt en lista i Brevo för anmälningar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Titel"
                  placeholder="T.ex. Dörrknackning Södermalm"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />

                <Textarea
                  label="Beskrivning"
                  placeholder="Beskriv aktiviteten..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Datum"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                  <Input
                    label="Tid"
                    placeholder="T.ex. 10:00 - 14:00"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>

                <Checkbox
                  label="Online-aktivitet (Zoom/Teams)"
                  checked={formData.isOnline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isOnline: (e.target as HTMLInputElement).checked,
                    })
                  }
                />

                {!formData.isOnline && (
                  <>
                    <Input
                      label="Plats (adress/lokal)"
                      placeholder="T.ex. Medborgarplatsen, Stockholm"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />

                    <LocationAutocomplete
                      label="Område (för sökning)"
                      placeholder="Sök ort eller postnummer..."
                      hint="Används för att matcha aktiviteten med besökares plats"
                      onSelect={(result) => setFormData({
                        ...formData,
                        postnummer: result.postnummer || "",
                        kommun: result.kommun,
                        kommunKod: result.kommunKod,
                        lan: result.lan,
                      })}
                      onClear={() => setFormData({
                        ...formData,
                        postnummer: "",
                        kommun: "",
                        kommunKod: "",
                        lan: "",
                      })}
                    />

                    {formData.kommun && (
                      <div className="text-sm text-hgf-black/70 bg-hgf-bg-light-blue p-3 rounded-lg">
                        <strong>Valt område:</strong> {formData.kommun} (kod: {formData.kommunKod})
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="submit" variant="red" loading={isSubmitting}>
                    Skapa aktivitet
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Avbryt
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista aktiviteter */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-hgf-black/20 mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">Inga aktiviteter ännu</h2>
                <p className="text-hgf-black/60 mb-4">
                  Skapa din första aktivitet för att komma igång.
                </p>
                <Button variant="red" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Skapa aktivitet
                </Button>
              </CardContent>
            </Card>
          ) : (
            activities
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((activity) => (
                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{activity.title}</h3>
                          {activity.isOnline && (
                            <span className="badge badge-blue text-xs">Online</span>
                          )}
                        </div>
                        <p className="text-sm text-hgf-black/60 mb-3 line-clamp-2">
                          {activity.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-hgf-black/70">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(activity.date)} · {activity.time}
                          </span>
                          {activity.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {activity.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Brevo-lista #{activity.brevoListId}
                          </span>
                        </div>
                      </div>
                      <Link href={`/admin/${token}/aktiviteter/${activity.id}`}>
                        <Button variant="outline" size="sm">
                          Visa deltagare
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </main>
    </div>
  );
}
