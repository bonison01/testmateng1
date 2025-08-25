// app/(main)/place/[id]/page.tsx

import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import { PlaceDetailClient } from "./PlaceDetailClient"; // Client component

interface Place {
  id: string;
  name: string;
  image?: string;
  description?: string;
  location?: string;
  features: string[];
  contact?: string;
  type: string;
  price?: number;
}

// ⚠️ Correctly type params as a Promise
export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Await the params object to access its properties
  const { id } = await params;

  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return notFound();
  }

  const place: Place = {
    id: data.id,
    name: data.name,
    image: data.image_url,
    description: data.description,
    location: data.location,
    features: Array.isArray(data.features) ? data.features : [],
    contact: data.contact,
    type: data.type,
    price: data.price,
  };

  return <PlaceDetailClient place={place} />;
}