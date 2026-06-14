import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import appConfig from "@/app.config";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus: "ok" | "down" = "ok";
  try {
    await db.execute(sql`select 1`);
  } catch {
    dbStatus = "down";
  }
  const healthy = dbStatus === "ok";
  return NextResponse.json(
    {
      service: appConfig.lmsClientId,
      status: healthy ? "operational" : "degraded",
      db: dbStatus,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
