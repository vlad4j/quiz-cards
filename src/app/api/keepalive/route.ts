import { sql } from "drizzle-orm";
import { db } from "@/db";

export const dynamic = "force-dynamic";

// Pinged daily by Vercel cron (see vercel.json) so the free-tier Supabase
// project never reaches 7 days of inactivity and auto-pauses.
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "unknown" },
      { status: 503 }
    );
  }
}
