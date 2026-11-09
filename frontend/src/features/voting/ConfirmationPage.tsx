import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useScrollReveal } from "@/features/shared/useScrollReveal";

export function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { txHash?: string; choice?: string } | null;
  const scope = useScrollReveal([]);

  return (
    <div ref={scope} className="px-5 py-12 sm:px-10 lg:py-16">
    <Card className="paper-panel scroll-reveal mx-auto max-w-2xl text-center">
      <CardHeader className="items-center">
        <div className="flex size-16 items-center justify-center border-2 border-[#315d5c] text-[#315d5c]">
          <CheckCircle2 className="size-9" />
        </div>
        <CardTitle className="font-heading text-5xl tracking-wide">Vote enregistré</CardTitle>
        <CardDescription>
          Votre participation a bien été enregistrée sur la blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <p>
          Choix sélectionné : <strong>{state?.choice || "confidentiel"}</strong>
        </p>
        {/* {state?.txHash && (
          <div className="border border-[#bcae98] bg-[#f7f1e7] p-3 text-sm">
            <p className="mb-2 text-muted-foreground">Hash de transaction</p>
            <code>{shortHash(state.txHash)}</code>
            <Button
              className="ml-2"
              size="icon-sm"
              variant="ghost"
              onClick={() => void copy()}
              aria-label="Copier le hash"
            >
              <Copy />
              {copied && <span className="sr-only">Copié</span>}
            </Button>
          </div>
        )} */}
        <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
      </CardContent>
    </Card>
    </div>
  );
}
