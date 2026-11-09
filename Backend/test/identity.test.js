import assert from "node:assert/strict";
import test from "node:test";
import { voterHash } from "../src/lib/hmac.js";
import { identityMaterial, isTogoCniNumber, normalizeId, normalizeName } from "../src/lib/identity.js";

const CARD = "10234567890";

test("normalise le numéro et le nom avant le hash", () => {
  assert.equal(normalizeId(" 1023-456-7890 "), "10234567890");
  assert.equal(normalizeName("  koffi   amé  "), "KOFFI AMÉ");
  assert.equal(identityMaterial("1023-456-7890", "koffi   amé"), `${CARD}|KOFFI AMÉ`);
});

test("reconnaît le numéro de la carte nationale d'identité", () => {
  assert.equal(isTogoCniNumber("10234567890"), true);
  assert.equal(isTogoCniNumber("1023-456-7890"), true);
  assert.equal(isTogoCniNumber("1023 456 7890"), true);
  assert.equal(isTogoCniNumber("AB123"), false);
  assert.equal(isTogoCniNumber("1023456789"), false);
  assert.equal(isTogoCniNumber("1023-4567890"), false);
  assert.equal(identityMaterial("AB123", "Koffi"), null);
});

test("produit un HMAC-SHA256 stable et secret", () => {
  const first = voterHash(CARD, "Koffi Amé", "secret-a");
  const second = voterHash("1023-456-7890", "  koffi   amé ", "secret-a");
  const otherSecret = voterHash(CARD, "Koffi Amé", "secret-b");

  assert.equal(first, second);
  assert.notEqual(first, otherSecret);
  assert.match(first, /^0x[0-9a-f]{64}$/);
  assert.equal(first.includes(CARD), false);
  assert.equal(first.includes("KOFFI"), false);
});

test("refuse une identité vide ou mal formée", () => {
  assert.throws(() => voterHash("   ", "Koffi", "secret"), (error) => error.code === "INVALID_IDENTITY");
  assert.throws(() => voterHash("AB123", "Koffi", "secret"), (error) => error.code === "INVALID_IDENTITY");
  assert.throws(() => voterHash(CARD, "Koffi", ""), (error) => error.code === "HMAC_NOT_CONFIGURED");
});
