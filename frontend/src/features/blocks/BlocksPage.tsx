import { useCallback, useEffect, useMemo, useState } from "react";
import { Blocks, CircleCheck, RefreshCw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Block } from "@/types/election";
import { errorMessage } from "@/lib/format";
import { useScrollReveal } from "@/features/shared/useScrollReveal";

function shortHash(hash: string) {
  return `${hash.slice(0, 14)}…${hash.slice(-12)}`;
}

function formatBlockDate(timestamp: number) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(timestamp * 1000));
}

export function BlocksPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<number>();
  const scope = useScrollReveal([blocks.length, loading]);

  const loadBlocks = useCallback(async () => {
    try {
      const result = await api.getBlocks();
      setBlocks(result.blocks);
      setUpdatedAt(Date.now());
      setError("");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadBlocks(), 0);
    const interval = window.setInterval(() => void loadBlocks(), 5000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [loadBlocks]);

  const newestBlock = useMemo(() => blocks[0], [blocks]);

  return (
    <div ref={scope} className="mx-auto max-w-6xl space-y-10 px-5 py-12 sm:px-10 lg:py-16">
      <div className="scroll-reveal flex flex-col gap-6 border-b border-[#bcae98] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="border-[#315d5c]/30 bg-[#a9d8d5]/60 text-[#315d5c]">
            Registre public
          </Badge>
          <h1 className="mt-5 font-heading text-6xl leading-none tracking-wide">
            La chaîne, en direct
          </h1>
          <p className="mt-5 max-w-xl leading-7 text-[#5b5042]">
            Chaque bloc conserve la trace du précédent. Suivez la construction
            du registre au fil des transactions.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#5b5042]">
          <span className="inline-flex items-center gap-2">
            <CircleCheck className="size-4 text-[#315d5c]" />
            {updatedAt ? "Synchronisé" : "Connexion…"}
          </span>
          <Button
            aria-label="Actualiser les blocs"
            className="size-10 p-0"
            variant="outline"
            onClick={() => void loadBlocks()}
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="paper-panel flex min-h-48 items-center justify-center">
          <RefreshCw className="size-6 animate-spin text-[#b87812]" />
        </div>
      ) : blocks.length === 0 ? (
        <div className="paper-panel flex min-h-48 flex-col items-center justify-center gap-3 text-center">
          <Blocks className="size-8 text-[#b87812]" />
          <p className="text-[#5b5042]">Aucun bloc n’est encore disponible.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute bottom-8 left-[1.05rem] top-8 w-px bg-[#bcae98] sm:left-[7.55rem]" />
          <div className="scroll-stagger space-y-5">
            {blocks.map((block, index) => (
              <article
                className="relative grid gap-4 sm:grid-cols-[7rem_1fr] sm:gap-8"
                key={block.hash}
              >
                <div className="relative z-10 flex items-start gap-3 bg-[#f7f1e7] pt-5 sm:block sm:pt-8">
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center border border-[#b87812] bg-[#f7f1e7] font-heading text-xl text-[#b87812] sm:mx-auto">
                    {index === 0 ? "●" : "·"}
                  </span>
                  <p className="ruled-label mt-0 border-0 pb-0 pt-1 sm:mt-3 sm:text-center">
                    Bloc {block.number}
                  </p>
                </div>
                <div className="paper-panel p-5 sm:p-7">
                  <div className="flex flex-col gap-2 border-b border-[#d6c9b8] pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-[#5b5042]">{formatBlockDate(block.timestamp)}</p>
                      <h2 className="mt-1 font-heading text-3xl tracking-wide">
                        Bloc {block.number}
                      </h2>
                    </div>
                    <Badge className="w-fit border-[#bcae98] bg-[#f7f1e7] text-[#5b5042]">
                      {block.transactionCount} transaction{block.transactionCount > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <dl className="mt-5 grid gap-5 text-sm md:grid-cols-2">
                    <div>
                      <dt className="ruled-label pb-2">Hash</dt>
                      <dd className="mt-3 break-all font-mono text-xs leading-5 text-[#171512]" title={block.hash}>
                        {shortHash(block.hash)}
                      </dd>
                    </div>
                    <div>
                      <dt className="ruled-label pb-2">Previous hash</dt>
                      <dd className="mt-3 break-all font-mono text-xs leading-5 text-[#5b5042]" title={block.previousHash}>
                        {shortHash(block.previousHash)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
      {newestBlock && (
        <p className="text-center text-xs text-[#5b5042]">
          Le dernier bloc connu est le bloc {newestBlock.number}. Actualisation automatique toutes les 5 secondes.
        </p>
      )}
    </div>
  );
}
