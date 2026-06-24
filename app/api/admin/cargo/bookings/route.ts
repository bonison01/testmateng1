// app/api/admin/cargo/bookings/route.ts

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
    return NextResponse.json(
      { message: error.message || "Could not load bookings." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  let payload: Record<string, unknown>;
  let photoFile: File | null = null;

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const fd = await req.formData();
    const raw = fd.get("payload");
    if (!raw || typeof raw !== "string") {
      return NextResponse.json({ message: "Missing payload field." }, { status: 400 });
    }
    payload = JSON.parse(raw);
    const photo = fd.get("photo");
    if (photo instanceof File) photoFile = photo;
  } else {
    payload = await req.json();
  }

  // Upload photo if present
  let photo_url: string | null = null;
  if (photoFile) {
    const ext = photoFile.name.split(".").pop() ?? "jpg";
    const path = `cargo/${Date.now()}.${ext}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("cargo-photos")
      .upload(path, photoFile, { contentType: photoFile.type, upsert: false });
    if (!upErr) {
      const { data: urlData } = supabaseAdmin.storage
        .from("cargo-photos")
        .getPublicUrl(path);
      photo_url = urlData.publicUrl ?? null;
    } else {
      console.warn("Photo upload failed (non-fatal):", upErr.message);
    }
  }

  const {
    customer_id,
    tracking_id,
    sender_name,
    sender_phone,
    sender_address,
    sender_city_state,
    sender_pincode,
    receiver_name,
    receiver_phone,
    receiver_address,
    receiver_city_state,
    receiver_pincode,
    product_name,
    weight_estimate,
    delivery_mode,
    pickup_required,
    delivery_required,
    notes,
    status,
    third_party_tracking,
    handling_charge,
    docket_charge,
    pickup_charge,
    packaging_charge,
    extra_mile_delivery,
    estimate_charge,
    final_charge,
    payment_status,
    amount_paid,
  } = payload as Record<string, unknown>;

  const { data, error } = await supabaseAdmin
    .from("cargo_bookings")
    .insert({
      customer_id: customer_id ?? null,
      tracking_id,
      sender_name,
      sender_phone,
      sender_address,
      sender_city_state,
      sender_pincode,
      receiver_name,
      receiver_phone,
      receiver_address,
      receiver_city_state,
      receiver_pincode,
      product_name,
      weight_estimate,
      delivery_mode,
      pickup_required: pickup_required ?? false,
      delivery_required: delivery_required ?? false,
      notes,
      status: status ?? "Pending",
      third_party_tracking,
      handling_charge: handling_charge ?? null,
      docket_charge: docket_charge ?? null,
      pickup_charge: pickup_charge ?? null,
      packaging_charge: packaging_charge ?? null,
      extra_mile_delivery: extra_mile_delivery ?? null,
      estimate_charge,
      final_charge: final_charge ?? null,
      payment_status: payment_status ?? "unpaid",
      amount_paid: amount_paid ?? 0,
      photo_url,
    })
    .select()
    .single();

  if (error) {
    console.error("Booking create error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  // Record a payment row if money was collected at booking time
  if (customer_id && typeof amount_paid === "number" && amount_paid > 0) {
    const { error: pErr } = await supabaseAdmin.from("cargo_payments").insert({
      customer_id,
      booking_id: data.id,
      amount: amount_paid,
      note: "Recorded at booking",
    });
    if (pErr) console.warn("Payment row insert failed (non-fatal):", pErr.message);
  }

  return NextResponse.json({ data }, { status: 201 });
}