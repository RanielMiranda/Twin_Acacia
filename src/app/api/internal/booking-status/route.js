import { NextResponse } from "next/server";
import { runPendingCheckoutAutomation } from "@/lib/server/bookingStatusAutomation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request) {
  const configuredSecret = process.env.CRON_SECRET || process.env.BOOKING_AUTOMATION_SECRET;
  if (!configuredSecret) return process.env.NODE_ENV === "development";
  const authHeader = request.headers.get("authorization") || "";
  return authHeader === `Bearer ${configuredSecret}`;
}

async function handle(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit") || 500);
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(5000, limitParam)) : 500;

  try {
    const result = await runPendingCheckoutAutomation({ limit });
    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Automation failed" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return handle(request);
}

export async function POST(request) {
  return handle(request);
}
