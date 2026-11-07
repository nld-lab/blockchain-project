export function normalizeId(value) {
  return String(value).normalize("NFC").trim().replace(/[\s-]+/g, "").toUpperCase();
}

export function normalizeName(value) {
  return String(value).normalize("NFC").trim().replace(/\s+/g, " ").toUpperCase();
}

export function identityMaterial(idNumber, fullName) {
  const id = normalizeId(idNumber);
  const name = normalizeName(fullName);
  if (!id || !name) {
    return null;
  }
  return `${id}|${name}`;
}
