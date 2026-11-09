import { LockKeyhole } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useElection } from "@/features/election/useElection";
import { Loading } from "@/features/shared/Loading";
import { useScrollReveal } from "@/features/shared/useScrollReveal";

export function ResultsPage() {
  const { election, loading, error } = useElection();
  const scope = useScrollReveal([loading, election?.state, election?.tallies?.length]);

  if (loading) return <Loading />;
  if (error) {
    return (
      <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
        {error}
      </Alert>
    );
  }
  const published = election?.state === "ResultsPublished";

  return (
    <div ref={scope} className="mx-auto max-w-7xl space-y-8 px-5 py-12 sm:px-10 lg:py-16">
      <div className="scroll-reveal">
        <Badge
          className={
            published
              ? "border-[#315d5c]/30 bg-[#a9d8d5]/60 text-[#315d5c]"
              : "bg-muted"
          }
        >
          {published ? "Résultats officiels" : "En attente de publication"}
        </Badge>
        <h1 className="mt-5 font-heading text-6xl leading-none tracking-wide">
          {election?.title || "Résultats"}
        </h1>
        <p className="mt-5 max-w-xl leading-7 text-[#5b5042]">
          {published
            ? "Les résultats sont maintenant publics et vérifiables."
            : "Les résultats détaillés seront accessibles après la clôture et la publication du scrutin."}
        </p>
      </div>
      {published ? (
        <div className="scroll-stagger grid gap-4 md:grid-cols-2">
          {election.tallies?.map((tally) => (
            <Card className="paper-panel" key={tally.choiceId}>
              <CardHeader>
                <CardDescription>{tally.label}</CardDescription>
                <CardTitle>{tally.votes} voix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-[#e8dfd1]">
                  <div
                    className="h-3 bg-[#b87812]"
                    style={{
                      width: `${Math.min(100, (tally.votes / Math.max(1, election.turnout || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="paper-panel scroll-reveal">
          <CardContent className="pt-6">
            <LockKeyhole className="mb-3 size-8 text-muted-foreground" />
            <p>
              Le décompte par choix est masqué jusqu'à la publication
              officielle.
            </p>
          </CardContent>
        </Card>
      )}
      {/* <Card>
        <CardHeader>
          <CardTitle>Journal blockchain</CardTitle>
          <CardDescription>
            Les événements sont publics, mais les identités restent représentées
            par des hashes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions
            .slice()
            .reverse()
            .map((entry) => (
              <div
                key={`${entry.txHash}-${entry.type}`}
                className="flex flex-col justify-between gap-2 rounded-lg border p-3 text-sm sm:flex-row"
              >
                <span className="font-medium">{entry.type}</span>
                <code className="text-muted-foreground">
                  {shortHash(entry.txHash)} · bloc {entry.blockNumber}
                </code>
              </div>
            ))}
        </CardContent>
      </Card> */}
    </div>
  );
}
