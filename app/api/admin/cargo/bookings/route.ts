// app/api/admin/cargo/bookings/route.ts
//
// Returns all cargo bookings for the admin dashboard. Uses the Supabase
// SERVICE ROLE key (bypasses RLS) — safe here because this route itself
// re-checks the admin session before querying anything.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/requireAdmin";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const { data, error } = await supabaseAdmin
    .from("cargo_bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin cargo bookings fetch error:", error);
    return NextResponse.json({ message: error.message || "Could not load bookings." }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}