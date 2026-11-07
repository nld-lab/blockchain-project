import assert from "node:assert/strict";
import test from "node:test";
import { createElectionSchema, identitySchema, voteSchema } from "../src/schemas.js";

test("refuse une identification vide", () => {
  const parsed = identitySchema.safeParse({ idNumber: "   ", fullName: "" });
  assert.equal(parsed.success, false);
});

test("refuse un vote sans choix numérique", () => {
  const parsed = voteSchema.safeParse({ idNumber: "AB123", fullName: "Koffi", choiceId: "1" });
  assert.equal(parsed.success, false);
});

test("accepte un scrutin avec au moins deux choix", () => {
  const parsed = createElectionSchema.safeParse({
    title: "Élection test",
    choices: ["Awa", "Koffi"],
  });
  assert.equal(parsed.success, true);
});

test("refuse un scrutin à un seul choix", () => {
  const parsed = createElectionSchema.safeParse({
    title: "Élection test",
    choices: ["Awa"],
  });
  assert.equal(parsed.success, false);
});
