import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/format";
import type { Election } from "@/types/election";

export function useElection() {
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      setElection(await api.getElection());
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void api
      .getElection()
      .then(setElection)
      .catch((caught) => setError(errorMessage(caught)))
      .finally(() => setLoading(false));
  }, []);

  return { election, loading, error, reload };
}
