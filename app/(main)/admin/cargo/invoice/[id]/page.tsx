"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import InvoiceTemplate, { InvoiceBooking } from "@/app/(main)/admin/cargo/InvoiceTemplate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [booking, setBooking] = useState<InvoiceBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("cargo_bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setBooking(data as InvoiceBooking);
      }
      setLoading(false);
    };
    if (id) fetchBooking();
  }, [id]);

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-50 print:bg-white">
      {/* Toolbar — hidden when printing */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3 print:hidden">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleDownload}
          disabled={!booking}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Download className="mr-1.5 h-4 w-4" />
          Download invoice
        </Button>
      </div>

      <div className="py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-600">
            Could not load this booking: {error}
          </p>
        ) : booking ? (
          <InvoiceTemplate booking={booking} />
        ) : (
          <p className="text-center text-sm text-neutral-500">Booking not found.</p>
        )}
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5in;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}