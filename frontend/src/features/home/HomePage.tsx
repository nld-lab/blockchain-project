import {
  ArrowDownRight,
  CheckCircle2,
  ChevronRight,
  Fingerprint,
  Link2,
  ListChecks,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useElection } from "@/features/election/useElection";
import { Loading } from "@/features/shared/Loading";
import { useScrollReveal } from "@/features/shared/useScrollReveal";
import { Button } from "@/components/ui/button";

export function HomePage() {
  const { loading } = useElection();
  const scope = useScrollReveal([loading]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div ref={scope}>
      <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden bg-[#a9d8d5]">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,transparent_58%,rgba(247,241,231,0.42)_58%,rgba(247,241,231,0.42)_100%)]" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center px-5 py-16 sm:px-10 lg:px-14">
          <div className="scroll-reveal max-w-3xl">
            <p className="mb-6 flex items-center gap-3 text-sm font-medium text-[#315d5c]">
              <span className="h-px w-12 bg-[#315d5c]" />
              Scrutin en ligne
            </p>
            <h1 className="font-heading text-[clamp(5rem,15vw,12rem)] leading-[0.82] tracking-[0.01em] text-[#171512]">
              VOTE EN 
              <br />
              <span className="text-[#8a2e2e]">SECURITE</span>
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-[1.35] text-[#315d5c] sm:text-2xl">
              Participez aux votes de façon transparente et protégée
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link to="/vote">
                <Button className="h-12 bg-[#9d6410] px-5 text-white hover:bg-[#8a2e2e]">
                  Participer à un vote
                  <ChevronRight className="size-4" strokeWidth={2.5} />
                </Button>
              </Link>
              <Link
                className="flex items-center gap-2 text-sm font-medium text-[#315d5c] underline decoration-[#315d5c]/40 underline-offset-4 hover:decoration-[#315d5c]"
                to="/resultats"
              >
                Voir les résultats
                <ArrowDownRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[50%] items-end justify-end lg:flex">
          <img
            src="/envelope-hand.png"
            alt="Une main déposant une enveloppe pour voter"
            className="scroll-reveal h-full w-full object-contain object-bottom-right mix-blend-multiply"
          />
        </div>
      </section>

      <section id="comment-ca-marche" className="bg-[#f7f1e7] px-5 py-20 sm:px-10 lg:px-14 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div className="scroll-reveal">
              <p className="ruled-label inline-block pb-2">Le parcours électeur</p>
              <h2 className="mt-5 max-w-sm font-heading text-6xl leading-[0.9] tracking-wide text-[#171512] sm:text-7xl">
                Comment ça marche
              </h2>
              <p className="mt-6 max-w-sm leading-7 text-[#5b5042]">
                Trois gestes simples, sans portefeuille numérique ni jargon
                technique.
              </p>
            </div>
            <div className="scroll-stagger border-t border-[#bcae98]">
              <article className="grid gap-5 border-b border-[#bcae98] py-7 sm:grid-cols-[4rem_1fr] sm:gap-7">
                <div className="flex size-12 items-center justify-center bg-[#b87812] text-[#171512]">
                  <Fingerprint className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#171512]">1. Vérifiez votre identité</h3>
                  <p className="mt-2 max-w-xl leading-7 text-[#5b5042]">
                    Saisissez les informations liées à votre carte électorale.
                    Elles servent uniquement à vérifier que vous pouvez voter.
                  </p>
                </div>
              </article>
              <article className="grid gap-5 border-b border-[#bcae98] py-7 sm:grid-cols-[4rem_1fr] sm:gap-7">
                <div className="flex size-12 items-center justify-center bg-[#a9d8d5] text-[#315d5c]">
                  <ListChecks className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#171512]">2. Choisissez une option</h3>
                  <p className="mt-2 max-w-xl leading-7 text-[#5b5042]">
                    Consultez les choix proposés, sélectionnez celui qui vous
                    représente, puis vérifiez votre sélection.
                  </p>
                </div>
              </article>
              <article className="grid gap-5 py-7 sm:grid-cols-[4rem_1fr] sm:gap-7">
                <div className="flex size-12 items-center justify-center bg-[#8a2e2e] text-[#f7f1e7]">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#171512]">3. Recevez votre confirmation</h3>
                  <p className="mt-2 max-w-xl leading-7 text-[#5b5042]">
                    Votre vote est enregistré et une preuve de transaction vous
                    est remise immédiatement.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#315d5c] px-5 py-20 text-[#f7f1e7] sm:px-10 lg:px-14 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="scroll-reveal">
              <p className="inline-block border-b border-[#a9d8d5]/50 pb-2 text-xs uppercase tracking-[0.08em] text-[#a9d8d5]">
                Le registre de confiance
              </p>
              <h2 className="mt-5 max-w-lg font-heading text-6xl leading-[0.9] tracking-wide sm:text-7xl">
                À quoi sert la blockchain ici ?
              </h2>
            </div>
            <div className="scroll-reveal">
              <p className="max-w-2xl text-lg leading-8 text-[#d7e8e4]">
                Elle ne remplace pas le bulletin. Elle garantit que le registre
                qui reçoit les votes ne peut pas être discrètement réécrit.
              </p>
              <div className="mt-10 grid border-y border-[#a9d8d5]/35 sm:grid-cols-3">
                <div className="border-b border-[#a9d8d5]/35 py-6 sm:border-b-0 sm:border-r sm:pr-6">
                  <Link2 className="size-6 text-[#f3d28a]" />
                  <h3 className="mt-5 text-lg font-semibold">Trace vérifiable</h3>
                  <p className="mt-2 text-sm leading-6 text-[#d7e8e4]">
                    Chaque action importante laisse une empreinte consultable.
                  </p>
                </div>
                <div className="border-b border-[#a9d8d5]/35 py-6 sm:border-b-0 sm:border-r sm:px-6">
                  <Fingerprint className="size-6 text-[#f3d28a]" />
                  <h3 className="mt-5 text-lg font-semibold">Identité protégée</h3>
                  <p className="mt-2 text-sm leading-6 text-[#d7e8e4]">
                    Le registre ne conserve pas votre nom ni votre numéro en clair.
                  </p>
                </div>
                <div className="py-6 sm:pl-6">
                  <CheckCircle2 className="size-6 text-[#f3d28a]" />
                  <h3 className="mt-5 text-lg font-semibold">Un vote, une fois</h3>
                  <p className="mt-2 text-sm leading-6 text-[#d7e8e4]">
                    Le système empêche qu'une même participation soit comptée deux fois.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
