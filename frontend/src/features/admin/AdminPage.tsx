import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, LogOut, ShieldCheck } from "lucide-react";
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
import { useScrollReveal } from "@/features/shared/useScrollReveal";
import { useAdminAuth } from "@/features/admin/adminAuth";

export function AdminPage() {
  const { election, loading, error, reload } = useElection();
  const { session, loading: authLoading, login, logout, clearSession } = useAdminAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [title, setTitle] = useState("");
  const [choices, setChoices] = useState(["", ""]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const scope = useScrollReveal([loading, election?.state]);

  if (authLoading) return <Loading />;

  if (!session) {
    const submitLogin = async (event: FormEvent) => {
      event.preventDefault();
      setBusy(true);
      setMessage("");
      try {
        await login(credentials.username, credentials.password);
      } catch (caught) {
        setMessage(errorMessage(caught));
      } finally {
        setBusy(false);
      }
    };

    return (
      <div ref={scope}>
        <section className="paper-panel scroll-reveal mx-auto grid min-h-screen max-w-full overflow-hidden lg:grid-cols-[1.12fr_0.88fr]">
          <div className="relative min-h-70 overflow-hidden border-t border-[#bcae98] lg:min-h-full lg:border-l lg:border-t-0">
            <img
              src="/buildings.jpg"
              alt="une image expressive"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#171512]/90 via-[#171512]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-7 text-[#f7f1e7] sm:p-10">
              <p className="font-heading text-4xl leading-none tracking-wide sm:text-5xl">
                Gérer le vote
              </p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#e8dfd1]">
                Préparer, ouvrir, clôturer et publier chaque étape du scrutin.
              </p>
            </div>
          </div>
           <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
            <div className="w-full max-w-md">
              <div className="mb-10 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center border border-[#315d5c]/30 bg-[#a9d8d5]/60 text-[#315d5c]">
                  <ShieldCheck className="size-5" />
                </span>
                <span className="text-sm font-semibold tracking-wide text-[#315d5c]">
                  Accès administration
                </span>
              </div>
              <h1 className="font-heading text-6xl leading-[0.95] tracking-wide text-[#171512] sm:text-7xl">
                Bienvenue
              </h1>
              <p className="mt-4 max-w-sm leading-7 text-[#5b5042]">
                Connectez-vous pour gérer le scrutin et publier ses résultats.
              </p>

              {message && (
                <Alert className="mt-6 border-destructive/30 bg-destructive/5 text-destructive">
                  {message}
                </Alert>
              )}

              <form className="mt-8 space-y-5" onSubmit={(event) => void submitLogin(event)}>
                <div className="space-y-2">
                  <Label htmlFor="username">Identifiant</Label>
                  <Input
                    id="username"
                    autoComplete="username"
                    required
                    className="h-12 rounded-none border-[#bcae98] bg-[#f7f1e7] px-4"
                    value={credentials.username}
                    onChange={(event) =>
                      setCredentials({ ...credentials, username: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="h-12 rounded-none border-[#bcae98] bg-[#f7f1e7] px-4 pr-12"
                      value={credentials.password}
                      onChange={(event) =>
                        setCredentials({ ...credentials, password: event.target.value })
                      }
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5b5042] hover:text-[#171512]"
                      onClick={() => setShowPassword((visible) => !visible)}
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>
                <Button
                  disabled={busy}
                  type="submit"
                  className="h-12 w-full rounded-none bg-[#171512] text-[#f7f1e7] hover:bg-[#315d5c]"
                >
                  Se connecter
                  {busy && <Loader2 className="ml-2 animate-spin" />}
                </Button>
              </form>
              <p className="mt-6 flex items-center gap-2 text-xs leading-5 text-[#5b5042]">
                <ShieldCheck className="size-4 shrink-0 text-[#315d5c]" />
                Session protégée et limitée à 12 heures.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

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
      const caughtError = caught as { code?: string };
      if (caughtError.code === "UNAUTHORIZED") clearSession();
      setMessage(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const create = (event: FormEvent) => {
    event.preventDefault();
    void action(() =>
      api.createElection(session.token, title, choices.filter(Boolean)),
    );
  };

  return (
    <div ref={scope} className="mx-auto max-w-4xl space-y-8 px-5 py-12 sm:px-10 lg:py-16">
      <div className="scroll-reveal flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="border-[#8a2e2e]/30 bg-[#8a2e2e]/5 text-[#8a2e2e]">Espace sécurisé</Badge>
          <h1 className="mt-5 font-heading text-6xl leading-none tracking-wide">Administration</h1>
          <p className="mt-5 max-w-xl leading-7 text-[#5b5042]">
            Pilotez le cycle de vie du scrutin en tant que {session.username}.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => void logout()}
        >
          <LogOut className="size-4" />
          Se déconnecter
        </Button>
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
      {!election?.exists || election.state === "Draft" ? (
        <Card className="paper-panel scroll-reveal">
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
                <Button disabled={busy} type="submit">
                  Créer le scrutin{" "}
                  {busy && <Loader2 className="animate-spin" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      {election?.exists && (
        <Card className="paper-panel scroll-reveal">
          <CardHeader>
            <CardTitle className="font-heading text-4xl tracking-wide">État actuel</CardTitle>
            <CardDescription>{election.title}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <StateBadge state={election.state} />
            {election.state === "Draft" && (
              <Button
                disabled={busy}
                onClick={() => void action(() => api.openElection(session.token))}
              >
                Ouvrir le vote
              </Button>
            )}
            {election.state === "Open" && (
              <Button
                disabled={busy}
                onClick={() => void action(() => api.closeElection(session.token))}
              >
                Clôturer le vote
              </Button>
            )}
            {election.state === "Closed" && (
              <Button
                disabled={busy}
                onClick={() => void action(() => api.publishResults(session.token))}
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
