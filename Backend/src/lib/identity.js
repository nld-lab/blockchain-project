const PRINTED_CNI_NUMBER = /^(?:\d{11}|\d+-\d+-\d+)$/;

export function normalizeId(value) {
  return String(value).normalize("NFC").trim().replace(/[\s-]+/g, "").toUpperCase();
}

export function isTogoCniNumber(value) {
  const compact = String(value).normalize("NFC").trim().replace(/\s+/g, "");
  if (!PRINTED_CNI_NUMBER.test(compact)) return false;
  return compact.replaceAll("-", "").length === 11;
}

export function normalizeName(value) {
  return String(value).normalize("NFC").trim().replace(/\s+/g, " ").toUpperCase();
}

export function identityMaterial(idNumber, fullName) {
  if (!isTogoCniNumber(idNumber)) return null;
  const id = normalizeId(idNumber);
  const name = normalizeName(fullName);
  if (!id || !name) return null;
  return `${id}|${name}`;
}
