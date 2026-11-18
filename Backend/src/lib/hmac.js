import { createHmac } from "node:crypto";
import { httpError } from "../httpError.js";
import { isTogoCniNumber, normalizeId } from "./identity.js";

export function voterHash(idNumber, fullName, secret) {
  if (!secret) {
    throw httpError(503, "HMAC_NOT_CONFIGURED", "Le secret HMAC n'est pas configuré.");
  }

  if (!isTogoCniNumber(idNumber)) {
    throw httpError(
      400,
      "INVALID_IDENTITY",
      "Le numéro de la carte nationale d'identité comporte 11 chiffres, et le nom est requis.",
    );
  }

  const cardNumber = normalizeId(idNumber);
  if (!fullName || !String(fullName).trim()) {
    throw httpError(
      400,
      "INVALID_IDENTITY",
      "Le nom complet est requis.",
    );
  }

  return `0x${createHmac("sha256", secret).update(cardNumber).digest("hex")}`;
}
