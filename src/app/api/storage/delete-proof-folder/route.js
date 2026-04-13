import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/server/serviceSupabase";
import { getSessionFromRequest } from "@/lib/server/session";
import { BUCKET_NAME } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ensureStaff(session) {
  const role = String(session?.role || "").toLowerCase();
  return role === "admin" || role === "owner";
}

async function listStorageFilesRecursively(supabase, prefix) {
  const filePaths = [];
  const walk = async (folderPath) => {
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folderPath, {
        limit: 100,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw error;
      const entries = data || [];
      for (const entry of entries) {
        const currentPath = folderPath ? `${folderPath}/${entry.name}` : entry.name;
        if (entry.id) {
          filePaths.push(currentPath);
        } else {
          await walk(currentPath);
        }
      }
      hasMore = entries.length === 100;
      offset += 100;
    }
  };
  if (prefix) await walk(prefix);
  return filePaths;
}

export async function POST(request) {
  const session = await getSessionFromRequest(request);
  if (!ensureStaff(session)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const folder = String(body?.folder || "").trim();
  if (!folder || !folder.startsWith("resort-bookings/")) {
    return NextResponse.json({ ok: false, error: "Invalid folder path" }, { status: 400 });
  }
  console.info("Delete proof folder request:", folder);

  try {
    const supabase = createServiceSupabaseClient();
    const filePaths = await listStorageFilesRecursively(supabase, folder);
    if (filePaths.length === 0) {
      return NextResponse.json({ ok: true, deleted: 0 }, { status: 200 });
    }

    const batchSize = 100;
    let deleted = 0;
    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      const { error } = await supabase.storage.from(BUCKET_NAME).remove(batch);
      if (error) throw error;
      deleted += batch.length;
    }

    return NextResponse.json({ ok: true, deleted }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to delete folder" },
      { status: 500 }
    );
  }
}
