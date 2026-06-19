import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { buildMysqlPoolOptions } from "@tapizlabs/app-kit/db";
import * as schema from "./schema";

type Db = MySql2Database<typeof schema>;

const globalForDb = globalThis as unknown as { tapizAppDb?: Db };

function createDb(): Db {
  // Serverless-safe pool opcije (Vercel + Aiven) su standardizovane u @tapizlabs/app-kit/db:
  // connectionLimit=1 po lambdi + striktan TLS kada je DATABASE_SSL_CA_BASE64 postavljen.
  const pool = mysql.createPool(buildMysqlPoolOptions(process.env));
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
