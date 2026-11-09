import { Badge } from "@/components/ui/badge";
import { stateLabel } from "@/lib/format";

export function StateBadge({ state }: { state?: string }) {
  const styles =
    state === "Open"
      ? "border-primary/30 bg-primary/10 text-primary"
      : state === "ResultsPublished"
        ? "border-blue-500/30 bg-blue-500/10 text-blue-700"
        : "bg-muted text-muted-foreground";

  return <Badge className={styles}>{stateLabel(state)}</Badge>;
}
