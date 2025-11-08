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
import styles from "./cargo-booking.module.css";

/* -------------------- Types -------------------- */
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

/* -------------------- Invoice Generator -------------------- */
const generateInvoice = (data: TrackingPopupData, formData: FormData) => {
  const doc = new jsPDF();

  // Helper function for wrapping text
  const addText = (text: string, x: number, y: number, maxWidth = 80) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * 5;
  };

  // Reset letter spacing before writing any text
  (doc as any).setCharSpace?.(0);

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Mateng Delivery", 20, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Sagolband Sayang Leirak, Sagolband, Imphal, Manipur - 795004", 20, 25);
  doc.text("Phone: 8787649928 | Website: justmateng.com", 20, 30);
  doc.line(20, 35, 190, 35);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Invoice", 20, 45);
  const today = new Date();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Date: ${today.toLocaleDateString()}`, 140, 45);
  doc.text(`Tracking ID: ${data.trackingId}`, 20, 55);
  doc.line(20, 60, 190, 60);

  // Sender Details
  let currentY = 70;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Sender Details", 20, currentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  currentY += 10;
  doc.text(`Name: ${formData.senderName}`, 20, currentY);
  currentY += 5;
  doc.text(`Phone: ${formData.senderPhone}`, 20, currentY);
  currentY += 5;
  const senderAddressHeight = addText(`Address: ${formData.senderAddress}`, 20, currentY, 80);
  currentY += senderAddressHeight + 2;
  doc.text(`Pincode: ${formData.senderPincode}`, 20, currentY);
  currentY += 5;
  doc.text(`City/State: ${formData.senderCityState || "-"}`, 20, currentY);

  // Receiver Details
  let receiverY = 70;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Receiver Details", 110, receiverY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  receiverY += 10;
  doc.text(`Name: ${formData.receiverName}`, 110, receiverY);
  receiverY += 5;
  doc.text(`Phone: ${formData.receiverPhone}`, 110, receiverY);
  receiverY += 5;
  const receiverAddressHeight = addText(`Address: ${formData.receiverAddress}`, 110, receiverY, 80);
  receiverY += receiverAddressHeight + 2;
  doc.text(`Pincode: ${formData.receiverPincode}`, 110, receiverY);
  receiverY += 5;
  doc.text(`City/State: ${formData.receiverCityState || "-"}`, 110, receiverY);

  const sectionBottom = Math.max(currentY, receiverY) + 10;
  doc.line(20, sectionBottom, 190, sectionBottom);

  // Product Details
  let productY = sectionBottom + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Product Details", 20, productY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  productY += 10;
  doc.text(`Product Name: ${formData.productName}`, 20, productY);
  productY += 5;
  doc.text(`Weight: ${formData.weightEstimate} kg`, 20, productY);
  productY += 5;
  doc.text(`Delivery Mode: ${formData.deliveryMode === "express" ? "Express" : "Surface"}`, 20, productY);
  productY += 5;
  doc.text(`Pickup Required: ${formData.pickupRequired ? "Yes" : "No"}`, 20, productY);
  productY += 5;
  const notesHeight = addText(`Notes: ${formData.notes || "-"}`, 20, productY, 160);
  productY += notesHeight + 5;

  doc.line(20, productY, 190, productY);
  productY += 10;

  // Pricing Section (Proper Table Style)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Pricing Details", 20, productY);
  productY += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const labelX = 25;
  const valueX = 110;
  const lineHeight = 7;

  const charges = [
    ["Freight Charges (Estimated)", `₹${data.estimateCharge.toFixed(2)}`],
    ["Handling Charge", "Will be confirmed after pickup"],
    ["Docket Charge", "Will be confirmed after pickup"],
    ["Pickup Charges", "Will be defined after the pickup(depends on location)"],
    // ["Delivery Charges", "Will be defined after order confirmation"],
  ];

  charges.forEach(([label, value]) => {
    productY += lineHeight;
    doc.text(`${label}:`, labelX, productY);
    doc.text(value, valueX, productY);
  });

  productY += 5;
  doc.line(20, productY, 190, productY);
  productY += 10;

  // Footer Notes
  doc.setFontSize(9);
  doc.text("Note: Final bill may vary after pickup. Estimated charges are indicative.", 20, productY);
  productY += 6;
  doc.text("For 100kg+, electronics or medicines — GST invoice is mandatory.", 20, productY);
  productY += 6;
  doc.text("Support: 9774795906 | www.justmateng.com/contact-us", 20, productY);

  productY += 10;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("This is a computer-generated invoice. No signature required.", 20, productY);

  doc.save(`Invoice-${data.trackingId}.pdf`);
  // Product Image (optional)
  // if (formData.photoUrl) {
  //   const img = new Image();
  //   img.src = formData.photoUrl;
  //   img.onload = () => {
  //     doc.addImage(img, "JPEG", 140, productY - 60, 50, 35);
  //     doc.save(`Invoice-${data.trackingId}.pdf`);
  //   };
  // } else {
  //   doc.save(`Invoice-${data.trackingId}.pdf`);
  // }
};



/* -------------------- Main Component -------------------- */
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

  /* ---------- Autofill Sender Info ---------- */
  useEffect(() => {
    if (user) {
      const meta = user.user_metadata || {};
      setFormData((prev) => ({
        ...prev,
        senderName: meta.name || "",
        senderPhone: meta.phone || "",
        senderAddress: meta.address || "",
        senderPincode: meta.pincode || "",
      }));
    }
  }, [user]);

  /* ---------- Fetch City/State for Pincodes ---------- */
  const fetchCityState = (pin: string, field: "senderCityState" | "receiverCityState") => {
    if (/^\d{6}$/.test(pin)) {
      fetch(`https://api.postalpincode.in/pincode/${pin}`)
        .then((res) => res.json())
        .then((data) => {
          if (data[0]?.Status === "Success") {
            const po = data[0].PostOffice[0];
            setFormData((prev) => ({
              ...prev,
              [field]: `${po.District}, ${po.State}`,
            }));
          }
        });
    }
  };

  useEffect(() => fetchCityState(formData.senderPincode, "senderCityState"), [formData.senderPincode]);
  useEffect(() => fetchCityState(formData.receiverPincode, "receiverCityState"), [formData.receiverPincode]);

  /* ---------- Calculate Estimate ---------- */
  /* ---------- Calculate Estimate ---------- */
  /* ---------- Calculate Estimate ---------- */
  useEffect(() => {
    const {
      senderPincode,
      receiverPincode,
      weightEstimate,
      deliveryMode,
      pickupRequired,
      deliveryRequired,
    } = formData;

    const roundedWeight = Math.ceil(weightEstimate || 0);

    const isManipur = (pin: string) => pin.startsWith("795");
    const isNCR = (pin: string) =>
      pin.startsWith("110") || // Delhi
      pin.startsWith("201") || // Noida / Ghaziabad
      pin.startsWith("122") || // Gurugram
      pin.startsWith("121") || // Faridabad / Palwal
      pin.startsWith("124") || // Rohtak / Jhajjar belt
      pin.startsWith("131");   // Sonipat

    const manipurToNCR =
      (isManipur(senderPincode) && isNCR(receiverPincode)) ||
      (isNCR(senderPincode) && isManipur(receiverPincode));

    // Add Rs 80 docket charge always if valid route
    const docketCharge = 80;

    if (manipurToNCR && roundedWeight > 0) {
      const base = 150 * roundedWeight;
      const total =
        base + docketCharge + (pickupRequired ? 30 : 0) + (deliveryRequired ? 40 : 0);
      setEstimateCharge(total);
      return;
    }

    const routeKey = `${senderPincode}-${receiverPincode}`;
    const rate: Rate | undefined = rateMap[routeKey];
    if (!rate || roundedWeight <= 0) {
      setEstimateCharge(0);
      return;
    }

    let base =
      roundedWeight <= 1
        ? rate.upto_1kg
        : roundedWeight <= 5
          ? rate.upto_5kg
          : rate.above_5kg;

    if (deliveryMode === "express") base *= 1.5;

    const total =
      base + docketCharge + (pickupRequired ? 30 : 0) + (deliveryRequired ? 40 : 0);
    setEstimateCharge(total);
  }, [formData]);



  /* ---------- Handle Change ---------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type, value, checked } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["weightEstimate", "handlingCharge", "docketCharge"].includes(name)
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, photoUrl: url }));
  };

  /* ---------- Handle Submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/book-cargo/fixed-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: session?.user?.id, estimateCharge }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Booking failed");

      setTrackingPopup({ trackingId: json.trackingId, estimateCharge });
      setSuccessMessage("Booking placed successfully!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle className="text-xl text-black">Cross State Delivery</CardTitle>
        </CardHeader>

        <CardContent>
          {successMessage && <div className="bg-green-100 text-black p-3 rounded mb-4">{successMessage}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sender & Receiver */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Sender */}
              <div className="space-y-2">
                <h2 className={styles.subHeader}>Sender Details</h2>
                <Input name="senderName" value={formData.senderName} onChange={handleChange} placeholder="Sender's Name" required style={{ color: "black" }} />
                <Input name="senderPhone" value={formData.senderPhone} onChange={handleChange} placeholder="Sender's Phone" required style={{ color: "black" }} />
                <Textarea name="senderAddress" value={formData.senderAddress} onChange={handleChange} placeholder="Sender's Address" required style={{ color: "black" }} />
                <Input name="senderPincode" value={formData.senderPincode} onChange={handleChange} placeholder="Sender’s Pincode" required style={{ color: "black" }} />
                {formData.senderCityState && <div className="text-sm text-black">{formData.senderCityState}</div>}
              </div>

              {/* Receiver */}
              <div className="space-y-2">
                <h2 className={styles.subHeader}>Receiver Details</h2>
                <Input name="receiverName" value={formData.receiverName} onChange={handleChange} placeholder="Receiver's Name" required style={{ color: "black" }} />
                <Input name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} placeholder="Receiver's Phone" required style={{ color: "black" }} />
                <Textarea name="receiverAddress" value={formData.receiverAddress} onChange={handleChange} placeholder="Receiver's Address" required style={{ color: "black" }} />
                <Input name="receiverPincode" value={formData.receiverPincode} onChange={handleChange} placeholder="Receiver’s Pincode" required style={{ color: "black" }} />
                {formData.receiverCityState && <div className="text-sm text-black">{formData.receiverCityState}</div>}
              </div>
            </div>

            {/* Product */}
            <div className="space-y-2">
              <h2 className={styles.subHeader}>Product Details</h2>
              <Input name="productName" value={formData.productName} onChange={handleChange} placeholder="Product Name" required style={{ color: "black" }} />
              <Input name="weightEstimate" type="number" value={formData.weightEstimate || ""} onChange={handleChange} placeholder="Weight (kg)" style={{ color: "black" }} />
              <Label htmlFor="photo" className="text-black">Product Photo (optional)</Label>
              <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="border p-2" />
              {formData.photoUrl && <img src={formData.photoUrl} alt="Preview" className="max-w-full h-auto mt-2 rounded border" />}
            </div>

            {/* Delivery Mode */}
            <div className="space-y-2">
              <h2 className={styles.subHeader}>Delivery Mode</h2>
              <select name="deliveryMode" value={formData.deliveryMode} onChange={handleChange} className="border rounded p-2 text-black">
                <option value="standard">Surface</option>
                <option value="express">Express</option>
              </select>
              <div className="flex items-center">
                <input type="checkbox" name="pickupRequired" checked={formData.pickupRequired} onChange={handleChange} />
                <Label htmlFor="pickupRequired" className="ml-2 text-black">Pickup required (₹30 extra)</Label>
              </div>
            </div>

            {/* Notes */}
            <Textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional notes (optional)" />

            {/* Estimate */}
            {/* Estimate */}
            {(() => {
              const sender = formData.senderPincode;
              const receiver = formData.receiverPincode;

              const isManipur = (pin: string) => pin.startsWith("795");
              const isNCR = (pin: string) =>
                pin.startsWith("110") ||
                pin.startsWith("201") ||
                pin.startsWith("122") ||
                pin.startsWith("121") ||
                pin.startsWith("124") ||
                pin.startsWith("131");

              const manipurToNCR =
                (isManipur(sender) && isNCR(receiver)) ||
                (isNCR(sender) && isManipur(receiver));

              if (manipurToNCR || rateMap[`${sender}-${receiver}`]) {
                return (
                  <div className="text-black space-y-1">
                    <div>Estimated Charges: ₹{estimateCharge.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">
                      (Includes ₹80 docket charge{formData.pickupRequired ? ", ₹30 pickup" : ""}{formData.deliveryRequired ? ", ₹40 delivery" : ""})
                    </div>
                  </div>
                );
              }

              return (
                <div className="text-black">
                  Route not supported. Contact 9774795906 for assistance.
                </div>
              );
            })()}



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
          <div className={styles.trackingPopup}>
            <h2 className="text-lg font-semibold mb-2">🎉 Booking Confirmed</h2>
            <p><strong>Tracking ID:</strong> {trackingPopup.trackingId}</p>
            <p className="mt-2 text-sm text-black">Our team will contact you soon. Support: 9774795906</p>
            <p className="mt-1 text-sm text-yellow-600">Estimate ₹{trackingPopup.estimateCharge.toFixed(2)} (may vary)</p>
            <div className="flex justify-between mt-4">
              <Button onClick={() => generateInvoice(trackingPopup, formData)}>Download Invoice</Button>
              <Button variant="outline" onClick={() => setTrackingPopup(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
