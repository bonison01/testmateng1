// app/api/book-cargo/fixed-delivery/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateMap, Rate } from "@/utils/rateMap";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PICKUP_CHARGE = 30;
const DELIVERY_CHARGE = 40;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      senderName,
      senderPhone,
      senderAddress,
      senderPincode,
      receiverName,
      receiverPhone,
      receiverAddress,
      receiverPincode,
      productName,
      weightEstimate,
      photoUrl,
      pickupRequired,
      deliveryRequired,
      deliveryMode,
      handlingCharge,
      docketCharge,
      notes,
    } = body;

    // Validate required fields
    if (
  // userId check removed or relaxed:
  !senderName ||
  !senderPhone ||
  !senderAddress ||
  !senderPincode ||
  !receiverName ||
  !receiverPhone ||
  !receiverAddress ||
  !receiverPincode ||
  !productName ||
  weightEstimate == null ||
  !deliveryMode
) {
  return NextResponse.json(
    { error: "Missing required fields" },
    { status: 400 }
  );
}


    const routeKey = `${senderPincode}-${receiverPincode}`;
    const rate: Rate | undefined = rateMap[routeKey];

    if (!rate) {
      return NextResponse.json(
        { error: "Unsupported route (PIN combination)" },
        { status: 400 }
      );
    }

    // Calculate base charge according to weight
    let base = 0;
    if (weightEstimate <= 1) base = rate.upto_1kg;
    else if (weightEstimate <= 5) base = rate.upto_5kg;
    else base = rate.above_5kg;

    if (deliveryMode === "express") {
      base *= 1.5;
    }

    const pickupCharge = pickupRequired ? PICKUP_CHARGE : 0;
    const deliveryCharge = deliveryRequired ? DELIVERY_CHARGE : 0;
    const handling = handlingCharge || 0;
    const docket = docketCharge || 0;

    const totalCharge = base + pickupCharge + deliveryCharge + handling + docket;

    const trackingId = `SBX-${Math.floor(100000 + Math.random() * 900000)}`;

    const { error } = await supabase.from("cargo_booking").insert({
      user_id: userId,
      sender_name: senderName,
      sender_phone: senderPhone,
      sender_address: senderAddress,
      sender_pincode: senderPincode,

      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      receiver_address: receiverAddress,
      receiver_pincode: receiverPincode,

      product_name: productName,
      weight_estimate: weightEstimate,
      photo_url: photoUrl || null,

      pickup_required: pickupRequired,
      delivery_required: deliveryRequired,
      delivery_mode: deliveryMode,
      handling_charge: handling,
      docket_charge: docket,
      notes: notes || null,

      estimate_charge: totalCharge,
      tracking_id: trackingId,
      status: "pending",
    });

    if (error) {
      console.error("Insert error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, trackingId, totalCharge });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
