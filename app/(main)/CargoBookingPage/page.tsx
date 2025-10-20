"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useSession, useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { rateMap, Rate } from "@/utils/rateMap";
import jsPDF from "jspdf";

interface FormData {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderPincode: string;
  senderCityState?: string;

  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverPincode: string;
  receiverCityState?: string;

  productName: string;
  weightEstimate: number;
  photoUrl?: string;

  pickupRequired: boolean;
  deliveryRequired: boolean;
  deliveryMode: "standard" | "express";
  handlingCharge: number;
  docketCharge: number;
  notes: string;
}

interface TrackingPopupData {
  trackingId: string;
  estimateCharge: number;
}

export default function CargoBookingPage() {
  const session = useSession();
  const user = useUser();
  const supabase = useSupabaseClient();

  const [formData, setFormData] = useState<FormData>({
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    senderPincode: "",
    senderCityState: "",

    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    receiverPincode: "",
    receiverCityState: "",

    productName: "",
    weightEstimate: 0,
    photoUrl: undefined,

    pickupRequired: false,
    deliveryRequired: false,
    deliveryMode: "standard",
    handlingCharge: 0,
    docketCharge: 0,
    notes: "",
  });

  const [estimateCharge, setEstimateCharge] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [trackingPopup, setTrackingPopup] = useState<TrackingPopupData | null>(null);

  // Autofill sender info from user metadata
  useEffect(() => {
    if (user) {
      const meta = user.user_metadata || {};
      setFormData(prev => ({
        ...prev,
        senderName: meta.name || "",
        senderPhone: meta.phone || "",
        senderAddress: meta.address || "",
        senderPincode: meta.pincode || "",
      }));
    }
  }, [user]);

  // Fetch city/state for sender Pincode
  useEffect(() => {
    const pin = formData.senderPincode;
    if (/^\d{6}$/.test(pin)) {
      fetch(`https://api.postalpincode.in/pincode/${pin}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data[0]?.Status === "Success") {
            const po = data[0].PostOffice[0];
            const city = po?.District;
            const state = po?.State;
            setFormData(prev => ({
              ...prev,
              senderCityState: `${city}, ${state}`,
            }));
          }
        })
        .catch(err => console.error("Sender PIN lookup error:", err));
    }
  }, [formData.senderPincode]);

  // Fetch city/state for receiver Pincode
  useEffect(() => {
    const pin = formData.receiverPincode;
    if (/^\d{6}$/.test(pin)) {
      fetch(`https://api.postalpincode.in/pincode/${pin}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data[0]?.Status === "Success") {
            const po = data[0].PostOffice[0];
            const city = po?.District;
            const state = po?.State;
            setFormData(prev => ({
              ...prev,
              receiverCityState: `${city}, ${state}`,
            }));
          }
        })
        .catch(err => console.error("Receiver PIN lookup error:", err));
    }
  }, [formData.receiverPincode]);

  // Calculate estimate charge
  useEffect(() => {
    const {
      receiverPincode,
      weightEstimate,
      deliveryMode,
      pickupRequired,
      deliveryRequired,
      handlingCharge,
      docketCharge,
      senderPincode,
    } = formData;

    if (!receiverPincode || weightEstimate <= 0) {
      setEstimateCharge(0);
      return;
    }

    const routeKey = `${senderPincode}-${receiverPincode}`;
    const rate: Rate | undefined = rateMap[routeKey];

    if (!rate) {
      setEstimateCharge(0);
      return;
    }

    let base = 0;
    if (weightEstimate <= 1) base = rate.upto_1kg;
    else if (weightEstimate <= 5) base = rate.upto_5kg;
    else base = rate.above_5kg;

    if (deliveryMode === "express") base *= 1.5;

    const pickupCharge = pickupRequired ? 30 : 0;
    const deliveryCharge = deliveryRequired ? 40 : 0;

    const total = base + pickupCharge + deliveryCharge + handlingCharge + docketCharge;

    setEstimateCharge(total);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const name = target.name as keyof FormData;

    if (target instanceof HTMLInputElement) {
      if (target.type === "checkbox") {
        setFormData(prev => ({
          ...prev,
          [name]: target.checked as any,
        }));
        return;
      }
      if (name === "weightEstimate" || name === "handlingCharge" || name === "docketCharge") {
        setFormData(prev => ({
          ...prev,
          [name]: parseFloat(target.value) || 0,
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        [name]: target.value,
      }));
    } else if (target instanceof HTMLTextAreaElement) {
      setFormData(prev => ({
        ...prev,
        [name]: target.value,
      }));
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    // TODO: Implement actual upload to Supabase Storage here
    const fakeUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, photoUrl: fakeUrl }));
  };

  const generateInvoice = (data: TrackingPopupData) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("SuperBox - Booking Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Tracking ID: ${data.trackingId}`, 20, 40);
    doc.text(`Estimate Charge: ₹${data.estimateCharge.toFixed(2)}`, 20, 50);
    doc.text(`Support: 9774795906`, 20, 60);
    doc.text(`Note: Estimated charges may vary after pickup.`, 20, 70);
    doc.save(`Invoice-${data.trackingId}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const payload = {
      userId: session?.user?.id || null,  // optional userId
      ...formData,
      estimateCharge,
    };

    const response = await fetch("/api/book-cargo/fixed-delivery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error || "Booking failed");
    }

    setTrackingPopup({ trackingId: json.trackingId, estimateCharge });
    setSuccessMessage("Booking placed successfully!");

    // Reset form
    setFormData({
      senderName: "",
      senderPhone: "",
      senderAddress: "",
      senderPincode: "",
      senderCityState: "",

      receiverName: "",
      receiverPhone: "",
      receiverAddress: "",
      receiverPincode: "",
      receiverCityState: "",

      productName: "",
      weightEstimate: 0,
      photoUrl: undefined,

      pickupRequired: false,
      deliveryRequired: false,
      deliveryMode: "standard",
      handlingCharge: 0,
      docketCharge: 0,
      notes: "",
    });
    setEstimateCharge(0);
  } catch (error) {
    toast.error((error as Error).message || "Booking failed. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="min-h-screen py-10 flex flex-col items-center px-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-xl">Cargo Booking (Fixed Charges)</CardTitle>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sender Details */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Sender Details</h2>
              <Input name="senderName" value={formData.senderName} onChange={handleChange} placeholder="Sender's Name" required />
              <Input name="senderPhone" value={formData.senderPhone} onChange={handleChange} placeholder="Sender's Phone" required />
              <Textarea name="senderAddress" value={formData.senderAddress} onChange={handleChange} placeholder="Sender's Address" required />
              <Input name="senderPincode" type="text" value={formData.senderPincode} onChange={handleChange} placeholder="Sender’s Pincode" required />
              {formData.senderCityState && <div className="text-sm text-gray-500">City/State: {formData.senderCityState}</div>}
            </div>

            {/* Receiver Details */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Receiver Details</h2>
              <Input name="receiverName" value={formData.receiverName} onChange={handleChange} placeholder="Receiver's Name" required />
              <Input name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} placeholder="Receiver's Phone" required />
              <Textarea name="receiverAddress" value={formData.receiverAddress} onChange={handleChange} placeholder="Receiver's Address" required />
              <Input name="receiverPincode" type="text" value={formData.receiverPincode} onChange={handleChange} placeholder="Receiver’s Pincode" required />
              {formData.receiverCityState && <div className="text-sm text-gray-500">City/State: {formData.receiverCityState}</div>}
            </div>

            {/* Product Details */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Product Details</h2>
              <Input name="productName" value={formData.productName} onChange={handleChange} placeholder="Product Name" required />
              <Input name="weightEstimate" type="number" min="0" step="0.01" value={formData.weightEstimate} onChange={handleChange} placeholder="Estimated Weight (kg)" required />
              <div>
                <Label htmlFor="photo">Product Photo (optional)</Label>
                <Input id="photo" name="photo" type="file" accept="image/*" onChange={handlePhotoChange} />
                {formData.photoUrl && <img src={formData.photoUrl} alt="Product" className="mt-2 max-h-48 object-contain" />}
              </div>
            </div>

            {/* Delivery Mode */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Delivery Mode</h2>
              <div className="flex gap-4">
                <Button type="button" variant={formData.deliveryMode === "standard" ? "default" : "outline"} onClick={() => setFormData(prev => ({ ...prev, deliveryMode: "standard" }))}>Standard</Button>
                <Button type="button" variant={formData.deliveryMode === "express" ? "default" : "outline"} onClick={() => setFormData(prev => ({ ...prev, deliveryMode: "express" }))}>Express (50% extra)</Button>
              </div>
            </div>

            {/* Additional Charges */}
            <div className="space-y-2">
              <div>
                <input type="checkbox" name="pickupRequired" checked={formData.pickupRequired} onChange={handleChange} id="pickupRequired" />
                <Label htmlFor="pickupRequired" className="ml-2">Pickup required (₹30 extra)</Label>
              </div>
              <div>
                <input type="checkbox" name="deliveryRequired" checked={formData.deliveryRequired} onChange={handleChange} id="deliveryRequired" />
                <Label htmlFor="deliveryRequired" className="ml-2">Delivery to endpoint required (₹40 extra)</Label>
              </div>
              <Input name="handlingCharge" type="number" min="0" step="0.01" value={formData.handlingCharge} onChange={handleChange} placeholder="Handling Charge (optional)" />
              <Input name="docketCharge" type="number" min="0" step="0.01" value={formData.docketCharge} onChange={handleChange} placeholder="Docket Charge (optional)" />
            </div>

            {/* Notes */}
            <Textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional notes (optional)" />

            {/* Route unsupported warning */}
            {!rateMap[`${formData.senderPincode}-${formData.receiverPincode}`] && (
              <div className="text-red-600 text-sm">This route is currently unsupported.</div>
            )}

            {/* Estimate */}
            <div className="text-right font-semibold text-lg">
              Estimated Charges: ₹{estimateCharge.toFixed(2)}
            </div>

            {/* Submit */}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2 inline-block" /> : "Place Booking"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tracking Popup */}
      {trackingPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-2">🎉 Booking Confirmed</h2>
            <p><strong>Tracking ID:</strong> {trackingPopup.trackingId}</p>
            <p className="mt-2 text-sm text-gray-600">
              Our team will connect with you soon. You can also reach us at <strong>9774795906</strong>.
            </p>
            <p className="mt-1 text-sm text-yellow-600">
              Note: Estimate charges (₹{trackingPopup.estimateCharge.toFixed(2)}) may vary after pickup.
            </p>
            <div className="flex justify-between mt-4">
              <Button onClick={() => generateInvoice(trackingPopup)}>Download Invoice</Button>
              <Button variant="outline" onClick={() => setTrackingPopup(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
