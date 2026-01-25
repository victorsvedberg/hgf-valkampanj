"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, ArrowLeft, Download, Users, Loader2, Mail, Phone } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  brevoListId: number;
}

interface Participant {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  postalCode: string;
  registeredAt: string;
}

export default function AdminAktivitetDetailPage({
  params,
}: {
  params: Promise<{ token: string; id: string }>;
}) {
  const { token, id } = use(params);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 25;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hämta aktiviteter för att hitta rätt
        const activitiesRes = await fetch(`/api/admin/${token}/activities`);
        if (!activitiesRes.ok) {
          if (activitiesRes.status === 401) {
            throw new Error("Ogiltig admin-token");
          }
          throw new Error("Kunde inte hämta aktivitet");
        }
        const activitiesData = await activitiesRes.json();
        const foundActivity = activitiesData.activities.find((a: Activity) => a.id === id);

        if (!foundActivity) {
          throw new Error("Aktiviteten hittades inte");
        }

        setActivity(foundActivity);

        // Hämta deltagare
        const participantsRes = await fetch(
          `/api/admin/${token}/activities/${id}/participants?limit=${limit}&offset=0`
        );
        if (!participantsRes.ok) {
          throw new Error("Kunde inte hämta deltagare");
        }
        const participantsData = await participantsRes.json();
        setParticipants(participantsData.participants);
        setTotal(participantsData.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Något gick fel");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, id]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const newOffset = offset + limit;
      const res = await fetch(
        `/api/admin/${token}/activities/${id}/participants?limit=${limit}&offset=${newOffset}`
      );
      if (!res.ok) throw new Error("Kunde inte ladda fler");
      const data = await res.json();
      setParticipants([...participants, ...data.participants]);
      setOffset(newOffset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("sv-SE", {
      weekday: "long",
      year: "numeric",
      month: "long",
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

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hgf-bg-light-blue">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-xl font-bold mb-2">Aktivitet hittades inte</h1>
            <Link href={`/admin/${token}/aktiviteter`}>
              <Button variant="outline">Tillbaka till listan</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hgf-bg-light-blue">
      {/* Header */}
      <header className="bg-hgf-navy text-white py-4">
        <div className="container-page">
          <Link
            href={`/admin/${token}/aktiviteter`}
            className="inline-flex items-center gap-1 text-white/70 hover:text-white mb-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka till aktiviteter
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">{activity.title}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/70">
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
              </div>
            </div>
            <a href={`/api/admin/${token}/activities/${id}/export`} download>
              <Button variant="white">
                <Download className="h-4 w-4 mr-2" />
                Exportera CSV
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="container-page py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 text-hgf-blue mx-auto mb-2" />
              <div className="text-3xl font-bold">{total}</div>
              <div className="text-sm text-hgf-black/60">Anmälda</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-hgf-blue">#{activity.brevoListId}</div>
              <div className="text-sm text-hgf-black/60">Brevo-lista</div>
            </CardContent>
          </Card>
        </div>

        {/* Participants list */}
        <Card>
          <CardHeader>
            <CardTitle>Anmälda deltagare ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-8 text-hgf-black/60">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Inga anmälningar ännu</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-hgf-neutral">
                        <th className="text-left py-3 px-2 font-medium">Namn</th>
                        <th className="text-left py-3 px-2 font-medium">E-post</th>
                        <th className="text-left py-3 px-2 font-medium">Telefon</th>
                        <th className="text-left py-3 px-2 font-medium">Postnr</th>
                        <th className="text-left py-3 px-2 font-medium">Anmäld</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p) => (
                        <tr key={p.id} className="border-b border-hgf-neutral/50 hover:bg-hgf-bg-light-blue/50">
                          <td className="py-3 px-2">
                            {p.firstName} {p.lastName}
                          </td>
                          <td className="py-3 px-2">
                            <a
                              href={`mailto:${p.email}`}
                              className="text-hgf-blue hover:underline inline-flex items-center gap-1"
                            >
                              <Mail className="h-3 w-3" />
                              {p.email}
                            </a>
                          </td>
                          <td className="py-3 px-2">
                            {p.phone ? (
                              <a
                                href={`tel:${p.phone}`}
                                className="text-hgf-blue hover:underline inline-flex items-center gap-1"
                              >
                                <Phone className="h-3 w-3" />
                                {p.phone}
                              </a>
                            ) : (
                              <span className="text-hgf-black/40">-</span>
                            )}
                          </td>
                          <td className="py-3 px-2">{p.postalCode || "-"}</td>
                          <td className="py-3 px-2 text-hgf-black/60">
                            {new Date(p.registeredAt).toLocaleDateString("sv-SE")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {participants.length < total && (
                  <div className="text-center mt-6">
                    <Button variant="outline" onClick={loadMore} loading={isLoadingMore}>
                      Ladda fler ({participants.length} av {total})
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
