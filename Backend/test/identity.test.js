import assert from "node:assert/strict";
import test from "node:test";
import { voterHash } from "../src/lib/hmac.js";
import { identityMaterial, normalizeId, normalizeName } from "../src/lib/identity.js";

test("normalise le numéro et le nom avant le hash", () => {
  assert.equal(normalizeId(" ab-12 3 "), "AB123");
  assert.equal(normalizeName("  koffi   amé  "), "KOFFI AMÉ");
  assert.equal(identityMaterial("ab-12 3", "koffi   amé"), "AB123|KOFFI AMÉ");
});

test("produit un HMAC-SHA256 stable et secret", () => {
  const first = voterHash("AB123", "Koffi Amé", "secret-a");
  const second = voterHash("ab-123", "  koffi   amé ", "secret-a");
  const otherSecret = voterHash("AB123", "Koffi Amé", "secret-b");

  assert.equal(first, second);
  assert.notEqual(first, otherSecret);
  assert.match(first, /^0x[0-9a-f]{64}$/);
  assert.equal(first.includes("AB123"), false);
  assert.equal(first.includes("KOFFI"), false);
});

test("refuse une identité vide", () => {
  assert.throws(() => voterHash("   ", "Koffi", "secret"), (error) => error.code === "INVALID_IDENTITY");
  assert.throws(() => voterHash("AB123", "Koffi", ""), (error) => error.code === "HMAC_NOT_CONFIGURED");
});
