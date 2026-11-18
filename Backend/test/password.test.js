import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../src/lib/password.js";

test("vérifie le mot de passe et refuse un autre", async () => {
  const stored = await hashPassword("change-me-admin");
  assert.equal(await verifyPassword("change-me-admin", stored), true);
  assert.equal(await verifyPassword("autre-mot", stored), false);
  assert.equal(await verifyPassword("change-me-admin", "pas-un-hash"), false);
});
