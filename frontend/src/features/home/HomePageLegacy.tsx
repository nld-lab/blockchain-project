import { ArrowRight, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useElection } from "@/features/election/useElection";
import { StateBadge } from "@/features/shared/StateBadge";
import { Loading } from "@/features/shared/Loading";

export function HomePageLegacy() {
  const { election, loading, error, reload } = useElection();

  if (loading) return <Loading />;
  if (error) {
    return (
      <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
        {error}{" "}
        <Button
          className="ml-3"
          size="sm"
          variant="outline"
          onClick={() => void reload()}
        >
          Réessayer
        </Button>
      </Alert>
    );
  }
  if (!election?.exists) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Aucun scrutin disponible</CardTitle>
          <CardDescription>
            Un administrateur doit encore préparer le prochain scrutin.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const canVote = election.state === "Open";
  return (
    <div className="space-y-8">
      <section className="grid gap-8 rounded-2xl bg-primary p-8 text-primary-foreground md:grid-cols-[1.4fr_1fr] md:p-12">
        <div className="space-y-5">
          <Badge className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
            Scrutin sécurisé par blockchain
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            {election.title}
          </h1>
          <p className="max-w-xl text-primary-foreground/80">
            Participez à un vote simple, transparent et protégé. Votre identité
            reste confidentielle, tandis que chaque opération est vérifiable.
          </p>
          {canVote ? (
            <Link
              className={buttonVariants({ variant: "secondary", size: "lg" })}
              to="/vote"
            >
              Participer au vote <ArrowRight />
            </Link>
          ) : (
            <StateBadge state={election.state} />
          )}
        </div>
        <div className="flex items-center justify-center rounded-xl bg-black/10 p-8">
          <Database className="size-32 stroke-1 opacity-80" />
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>État du scrutin</CardDescription>
            <CardTitle>
              <StateBadge state={election.state} />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Choix proposés</CardDescription>
            <CardTitle>{election.choices?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Participation enregistrée</CardDescription>
            <CardTitle>{election.turnout ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
