import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2, ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
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
import { errorMessage, stateLabel } from "@/lib/format";
import { useElection } from "@/features/election/useElection";
import { Loading } from "@/features/shared/Loading";

export function VotePage() {
  const navigate = useNavigate();
  const { election, loading, error, reload } = useElection();
  const [identity, setIdentity] = useState({ idNumber: "", fullName: "" });
  const [identified, setIdentified] = useState(false);
  const [choiceId, setChoiceId] = useState<number | null>(null);
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
  if (!election?.exists || election.state !== "Open") {
    return (
      <Card className="paper-panel mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Le vote n'est pas ouvert</CardTitle>
          <CardDescription>
            {election?.title
              ? `${election.title} · ${stateLabel(election.state)}`
              : "Aucun scrutin actif."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link className={buttonVariants({ variant: "outline" })} to="/">
            Retour à l'accueil
          </Link>
        </CardContent>
      </Card>
    );
  }

  const identify = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const status = await api.identify(identity.idNumber, identity.fullName);
      if (status.hasVoted) setMessage("Vous avez déjà participé à ce scrutin.");
      else setIdentified(true);
    } catch (caught) {
      setMessage(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const submitVote = async () => {
    if (choiceId === null) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await api.vote(
        identity.idNumber,
        identity.fullName,
        choiceId,
      );
      navigate("/confirmation", {
        state: { txHash: result.txHash, choice: election.choices?.[choiceId] },
      });
    } catch (caught) {
      setMessage(errorMessage(caught));
      await reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-5 py-12 sm:px-10 lg:py-16">
      <div className="max-w-2xl">
        <Badge className="border-[#315d5c]/30 bg-[#a9d8d5]/60 text-[#315d5c]">
          Vote ouvert
        </Badge>
        <h1 className="mt-5 font-heading text-6xl leading-none tracking-wide text-[#171512] sm:text-8xl">{election.title}</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#5b5042]">
          Votre identité est utilisée uniquement pour empêcher le double vote.
        </p>
      </div>
      {message && (
        <Alert className="border-[#8a2e2e]/30 bg-[#8a2e2e]/5 text-[#8a2e2e]">
          {message}
        </Alert>
      )}
      {!identified ? (
        <Card className="paper-panel">
          <CardHeader>
            <CardTitle className="font-heading text-4xl tracking-wide">Vérifier votre identité</CardTitle>
            <CardDescription>
              Renseignez les informations associées à votre carte électorale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => void identify(event)}
            >
              <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="idNumber">Numéro de carte</Label>
                <Input
                  id="idNumber"
                  required
                  value={identity.idNumber}
                  onChange={(event) =>
                    setIdentity({ ...identity, idNumber: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  required
                  value={identity.fullName}
                  onChange={(event) =>
                    setIdentity({ ...identity, fullName: event.target.value })
                  }
                />
              </div>
              </div>
              <div className="flex items-center gap-2 border-t border-[#bcae98] pt-5 text-sm text-[#5b5042]">
                <ShieldCheck className="size-4 text-[#315d5c]" />
                Vos informations ne sont pas conservées sur la blockchain.
              </div>
              <Button disabled={busy} type="submit">
                {busy && <Loader2 className="animate-spin" />}Continuer
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="paper-panel">
          <CardHeader>
            <CardTitle className="font-heading text-4xl tracking-wide">Choisissez une option</CardTitle>
            <CardDescription>
              Un seul choix peut être sélectionné.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {election.choices?.map((choice, index) => (
              <button
                key={choice}
                type="button"
                onClick={() => setChoiceId(index)}
                className={`flex w-full items-center justify-between border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b87812] ${choiceId === index ? "border-[#b87812] bg-[#f3d28a]/40" : "border-[#bcae98] bg-[#f7f1e7] hover:border-[#b87812]"}`}
              >
                <span className="flex items-center gap-3 font-medium"><span className="flex size-7 items-center justify-center border border-[#bcae98] text-xs">{String(index + 1).padStart(2, "0")}</span>{choice}</span>
                <span
                  className={`flex size-6 items-center justify-center border-2 ${choiceId === index ? "border-[#b87812] bg-[#b87812]" : "border-[#bcae98]"}`}
                >{choiceId === index && <Check className="size-4 text-[#171512]" />}</span>
              </button>
            ))}
            <div className="flex justify-between gap-3 pt-4">
              <Button variant="outline" onClick={() => setIdentified(false)}>
                <ArrowLeft className="size-4" />
                Modifier
              </Button>
              <Button
                disabled={choiceId === null || busy}
                onClick={() => void submitVote()}
              >
                Confirmer mon vote{" "}
                {busy && <Loader2 className="animate-spin" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
