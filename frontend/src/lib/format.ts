export function shortHash(value: string) {
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}

export function stateLabel(state?: string) {
  return {
    Draft: "En préparation",
    Open: "Ouvert",
    Closed: "Clôturé",
    ResultsPublished: "Résultats publiés",
  }[state || ""] || "Indisponible";
}

export function cniNumberMessage(value: string) {
  const compact = value.normalize("NFC").trim().replace(/\s+/g, "");
  const digits = compact.replaceAll("-", "");
  const printed =
    /^\d{11}$/.test(compact) || (/^\d+-\d+-\d+$/.test(compact) && digits.length === 11);
  return printed ? "" : "Le numéro de la carte nationale d'identité comporte 11 chiffres.";
}

export function errorMessage(error: unknown) {
  const caught = error as { code?: string; details?: unknown };
  if (
    caught.code === "VALIDATION" &&
    Array.isArray(caught.details) &&
    typeof caught.details[0] === "string"
  ) {
    return caught.details[0];
  }
  const code = caught.code;
  return {
    ALREADY_VOTED: "Vous avez déjà participé à ce scrutin.",
    ELECTION_NOT_OPEN: "Le scrutin n'est pas ouvert actuellement.",
    INVALID_CHOICE: "Le choix sélectionné n'est plus valide.",
    UNAUTHORIZED: "La clé administrateur est incorrecte.",
    INVALID_STATE: "Cette action n'est pas disponible dans l'état actuel.",
    RATE_LIMIT: "Trop de tentatives. Veuillez patienter.",
    CHAIN_UNREACHABLE: "Le service blockchain est momentanément indisponible.",
  }[code || ""] || (error as Error)?.message || "Une erreur est survenue.";
}
