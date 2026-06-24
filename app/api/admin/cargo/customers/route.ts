// app/api/admin/cargo/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/requireAdmin";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: list all customers, enriched with booking/payment stats
// (the aggregation logic that used to live in the page's load() fn).
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const { data: cData, error: cErr } = await supabaseAdmin
    .from("cargo_customers")
    .select("*")
    .order("name");

  if (cErr) {
    console.error("Customers fetch error:", cErr);
    return NextResponse.json({ message: cErr.message }, { status: 500 });
  }

  const { data: bData, error: bErr } = await supabaseAdmin
    .from("cargo_bookings")
    .select("customer_id,estimate_charge,final_charge,amount_paid,payment_status")
    .not("customer_id", "is", null);

  if (bErr) {
    console.error("Bookings stats fetch error:", bErr);
    return NextResponse.json({ message: bErr.message }, { status: 500 });
  }

  const bookingMap = new Map<
    string,
    { total_billed: number; total_paid: number; count: number }
  >();
  for (const b of bData ?? []) {
    if (!b.customer_id) continue;
    const cur = bookingMap.get(b.customer_id) ?? { total_billed: 0, total_paid: 0, count: 0 };
    const charge = b.final_charge ?? b.estimate_charge;
    cur.total_billed += charge;
    cur.total_paid += b.amount_paid ?? 0;
    cur.count += 1;
    bookingMap.set(b.customer_id, cur);
  }

  const enriched = (cData ?? []).map((c) => {
    const stats = bookingMap.get(c.id) ?? { total_billed: 0, total_paid: 0, count: 0 };
    return {
      ...c,
      total_billed: stats.total_billed,
      total_paid: stats.total_paid,
      outstanding: Math.max(0, stats.total_billed - stats.total_paid),
      booking_count: stats.count,
    };
  });

  return NextResponse.json({ data: enriched });
}

// POST: create a new frequent customer.
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { name, phone, address, city_state, pincode } = body;

  if (!name?.trim() || !phone?.trim() || !address?.trim()) {
    return NextResponse.json(
      { message: "Name, phone and address are required." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("cargo_customers")
    .insert({ name, phone, address, city_state, pincode })
    .select()
    .single();

  if (error) {
    console.error("Customer create error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}