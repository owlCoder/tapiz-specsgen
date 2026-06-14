import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

type Db = MySql2Database<typeof schema>;

const globalForDb = globalThis as unknown as { tapizAppDb?: Db };

function createDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL nije podešen");
  // Produkcija (Aiven): DATABASE_SSL_CA_BASE64 nosi CA sertifikat —
  // uključuje TLS sa striktnom verifikacijom servera.
  const caBase64 = process.env.DATABASE_SSL_CA_BASE64;
  const pool = mysql.createPool({
    uri: url,
    connectionLimit: 5,
    ...(caBase64
      ? { ssl: { ca: Buffer.from(caBase64, "base64").toString("utf8"), rejectUnauthorized: true } }
      : {}),
  });
  return drizzle(pool, { schema, mode: "default" });
}

function getDb(): Db {
  if (!globalForDb.tapizAppDb) {
    globalForDb.tapizAppDb = createDb();
  }
  return globalForDb.tapizAppDb;
}

/** Lenja inicijalizacija — konekcija se otvara tek pri prvom upitu (build prolazi bez baze). */
export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getDb(), prop, receiver);
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});
