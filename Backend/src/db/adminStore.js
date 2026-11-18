import { createHash, randomBytes } from "node:crypto";
import { config } from "../config.js";
import { pool } from "./pool.js";
import { hashPassword, verifyPassword } from "../lib/password.js";

const sessionTtlMs = 12 * 60 * 60 * 1000;

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function setupDatabase() {
  if (!pool) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id
    ON admin_sessions (admin_id)
  `);

  if (!config.adminUsername || !config.adminPassword) return;

  await pool.query(
    `INSERT INTO admins (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username)
     DO UPDATE SET password_hash = EXCLUDED.password_hash,
                   updated_at = now()`,
    [config.adminUsername, await hashPassword(config.adminPassword)],
  );
}

export async function authenticateAdmin(username, password) {
  const result = await pool.query(
    "SELECT id, username, password_hash FROM admins WHERE username = $1",
    [username],
  );
  const admin = result.rows[0];
  if (!admin || !(await verifyPassword(password, admin.password_hash))) return null;

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + sessionTtlMs);
  await pool.query(
    "INSERT INTO admin_sessions (admin_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [admin.id, tokenHash(token), expiresAt],
  );
  return { token, username: admin.username };
}

export async function findAdminSession(token) {
  if (!token) return null;
  const result = await pool.query(
    `SELECT a.id, a.username
     FROM admin_sessions s
     JOIN admins a ON a.id = s.admin_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [tokenHash(token)],
  );
  return result.rows[0] || null;
}

export async function deleteAdminSession(token) {
  if (!token) return;
  await pool.query("DELETE FROM admin_sessions WHERE token_hash = $1", [tokenHash(token)]);
}
