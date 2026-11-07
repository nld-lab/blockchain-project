import { createHmac } from "node:crypto";
import { httpError } from "../httpError.js";
import { identityMaterial } from "./identity.js";

export function voterHash(idNumber, fullName, secret) {
  if (!secret) {
    throw httpError(503, "HMAC_NOT_CONFIGURED", "Le secret HMAC n'est pas configuré.");
  }

  const material = identityMaterial(idNumber, fullName);
  if (!material) {
    throw httpError(400, "INVALID_IDENTITY", "Le numéro de carte et le nom sont requis.");
  }

  return `0x${createHmac("sha256", secret).update(material).digest("hex")}`;
}
