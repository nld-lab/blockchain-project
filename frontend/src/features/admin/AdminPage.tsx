import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/format";
import { useElection } from "@/features/election/useElection";
import { Loading } from "@/features/shared/Loading";
import { StateBadge } from "@/features/shared/StateBadge";

export function AdminPage() {
  const { election, loading, error, reload } = useElection();
  const [adminKey, setAdminKey] = useState("");
  const [title, setTitle] = useState("");
  const [choices, setChoices] = useState(["", ""]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <Loading />;
  if (error) {
    return (
      <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
        {error}
      </Alert>
    );
  }

  const action = async (callback: () => Promise<unknown>) => {
    setBusy(true);
    setMessage("");
    try {
      await callback();
      setMessage("Action réalisée avec succès.");
      await reload();
    } catch (caught) {
      setMessage(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const create = (event: FormEvent) => {
    event.preventDefault();
    void action(() =>
      api.createElection(adminKey, title, choices.filter(Boolean)),
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-5 py-12 sm:px-10 lg:py-16">
      <div>
        <Badge className="border-[#8a2e2e]/30 bg-[#8a2e2e]/5 text-[#8a2e2e]">Espace sécurisé</Badge>
        <h1 className="mt-5 font-heading text-6xl leading-none tracking-wide">Administration</h1>
        <p className="mt-5 max-w-xl leading-7 text-[#5b5042]">
          Pilotez le cycle de vie du scrutin sans exposer la clé au public.
        </p>
      </div>
      {message && (
        <Alert
          className={
            message.includes("succès")
              ? "border-[#315d5c]/30 bg-[#a9d8d5]/60 text-[#315d5c]"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }
        >
          {message}
        </Alert>
      )}
      <Card className="paper-panel">
        <CardHeader>
          <CardTitle className="font-heading text-4xl tracking-wide">Clé administrateur</CardTitle>
          <CardDescription>
            Elle est utilisée en mémoire uniquement et n'est jamais sauvegardée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="x-admin-key"
          />
        </CardContent>
      </Card>
      {!election?.exists || election.state === "Draft" ? (
        <Card className="paper-panel">
          <CardHeader>
            <CardTitle className="font-heading text-4xl tracking-wide">Créer un scrutin</CardTitle>
            <CardDescription>Ajoutez au moins deux choix.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={create}>
              <div className="space-y-2">
                <Label htmlFor="title">Intitulé</Label>
                <Input
                  id="title"
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              {choices.map((choice, index) => (
                <div className="flex gap-2" key={index}>
                  <Input
                    required
                    value={choice}
                    placeholder={`Choix ${index + 1}`}
                    onChange={(event) =>
                      setChoices(
                        choices.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item,
                        ),
                      )
                    }
                  />
                  {choices.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setChoices(
                          choices.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      Retirer
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChoices([...choices, ""])}
                >
                  Ajouter un choix
                </Button>
                <Button disabled={busy || !adminKey} type="submit">
                  Créer le scrutin{" "}
                  {busy && <Loader2 className="animate-spin" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      {election?.exists && (
        <Card className="paper-panel">
          <CardHeader>
            <CardTitle className="font-heading text-4xl tracking-wide">État actuel</CardTitle>
            <CardDescription>{election.title}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <StateBadge state={election.state} />
            {election.state === "Draft" && (
              <Button
                disabled={busy || !adminKey}
                onClick={() => void action(() => api.openElection(adminKey))}
              >
                Ouvrir le vote
              </Button>
            )}
            {election.state === "Open" && (
              <Button
                disabled={busy || !adminKey}
                onClick={() => void action(() => api.closeElection(adminKey))}
              >
                Clôturer le vote
              </Button>
            )}
            {election.state === "Closed" && (
              <Button
                disabled={busy || !adminKey}
                onClick={() => void action(() => api.publishResults(adminKey))}
              >
                Publier les résultats
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
