// app/api/admin/cargo/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/requireAdmin";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("cargo_bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await req.json();

  const VALID_PAYMENT_STATUSES = ["paid", "unpaid", "partial"] as const;
  type PaymentStatus = (typeof VALID_PAYMENT_STATUSES)[number];

  const { payment_status, amount_paid } = body as {
    payment_status?: PaymentStatus;
    amount_paid?: number;
  };

  if (payment_status && !VALID_PAYMENT_STATUSES.includes(payment_status)) {
    return NextResponse.json({ message: "Invalid payment_status." }, { status: 400 });
  }

  // Fetch current booking to compute amount_paid when toggling to "paid"
  const { data: current, error: fetchErr } = await supabaseAdmin
    .from("cargo_bookings")
    .select("estimate_charge, final_charge, amount_paid, payment_status")
    .eq("id", id)
    .single();

  if (fetchErr) {
    return NextResponse.json({ message: fetchErr.message }, { status: 500 });
  }

  const charge = current.final_charge ?? current.estimate_charge;

  let newAmountPaid: number = current.amount_paid ?? 0;
  if (payment_status === "paid") {
    newAmountPaid = charge;
  } else if (payment_status === "unpaid") {
    newAmountPaid = 0;
  } else if (payment_status === "partial" && typeof amount_paid === "number") {
    newAmountPaid = amount_paid;
  }

  const updates: Record<string, unknown> = {};
  if (payment_status) {
    updates.payment_status = payment_status;
    updates.amount_paid = newAmountPaid;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: "Nothing to update." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("cargo_bookings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Booking patch error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}