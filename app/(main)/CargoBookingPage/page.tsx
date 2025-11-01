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
import styles from './cargo-booking.module.css';
import { color } from "framer-motion";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name as keyof FormData;

    if (target instanceof HTMLSelectElement) {
      setFormData(prev => ({
        ...prev,
        [name]: target.value,
      }));
    } else if (target instanceof HTMLInputElement) {
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
    const fakeUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, photoUrl: fakeUrl }));
  };

const generateInvoice = (data: TrackingPopupData) => {
  const doc = new jsPDF();

  // Set font and title
  doc.setFont("helvetica", "normal");

  // Company Header (Logo/Details)
  doc.setFontSize(14);
  doc.text("Mateng Delivery", 20, 20); // Company name
  doc.setFontSize(10);
  doc.text("Sagolband Sayang Leirak, Sagolband, Imphal, Manipur -795004", 20, 25);
  doc.text("Phone: 8787649928 | Website: justmateng.com", 20, 30);

  // Add a horizontal line below the header
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35); // Horizontal line across the page

  // Invoice Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice", 20, 45);
  
  // Invoice Date and Tracking ID
  const today = new Date();
  const invoiceDate = today.toLocaleDateString(); // Format to local date
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${invoiceDate}`, 140, 45);
  doc.text(`Tracking ID: ${data.trackingId}`, 20, 55);
  
  // Add a line below the invoice header
  doc.setLineWidth(0.5);
  doc.line(20, 60, 190, 60); 

  // Sender and Receiver Details (Side by Side)
  const senderX = 20; // X position for sender details
  const receiverX = 110; // X position for receiver details (shifted to right side)

  // Sender Details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Sender Details", senderX, 70);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${formData.senderName}`, senderX, 80);
  doc.text(`Phone: ${formData.senderPhone}`, senderX, 90);
  doc.text(`Address: ${formData.senderAddress}`, senderX, 100);
  doc.text(`Pincode: ${formData.senderPincode}`, senderX, 110);
  doc.text(`City/State: ${formData.senderCityState || "-"}`, senderX, 120);

  // Receiver Details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Receiver Details", receiverX, 70);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${formData.receiverName}`, receiverX, 80);
  doc.text(`Phone: ${formData.receiverPhone}`, receiverX, 90);
  doc.text(`Address: ${formData.receiverAddress}`, receiverX, 100);
  doc.text(`Pincode: ${formData.receiverPincode}`, receiverX, 110);
  doc.text(`City/State: ${formData.receiverCityState || "-"}`, receiverX, 120);

  // Add a line separating the details and footer
  doc.setLineWidth(0.5);
  doc.line(20, 130, 190, 130);

  // Pricing Details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Pricing Details", 20, 140);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Freight Charges (Estimated): ₹${estimateCharge.toFixed(2)}`, 20, 150);
  doc.text("Handling Charge: Will be known after pickup", 20, 160);
  doc.text("Docket Charge: Will be known after pickup", 20, 170);
  doc.text("Packaging Charge: Will be known after pickup", 20, 180);
  doc.text("Pickup Charges: ₹30 (if pickup is required)", 20, 190);
  doc.text("Delivery Charges: ₹40 (if delivery required)", 20, 200);

  // Add a line separating the details and footer
  doc.setLineWidth(0.5);
  doc.line(20, 210, 190, 210);

  // Support & Notes Section
  doc.setFontSize(10);
  doc.text("Support: 9774795906", 20, 220);
  doc.text("Note: Final Bill comes after pickup. Estimated charges may vary.", 20, 230);
  doc.text("For 100kg and above, GST bill is required.", 20, 240);
  doc.text("For medicine and electronic devices, GST bill is required.", 20, 250);

  // Footer with company address and legal disclaimer
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Mateng Delivery | Sagolband Sayang Leirak, Sagolband, Imphal, Manipur -795004", 20, 260);
  doc.text("Website: justmateng.com | Phone: 8787649928", 20, 265);
  doc.text("This is a computer-generated invoice and does not require a signature.", 20, 270);
  
  // Save the PDF
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
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle className="text-xl text-black">Cross State Delivery</CardTitle>

        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className={`${styles.successMessage} mb-4 p-3 rounded`}>
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sender and Receiver Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Sender Details */}
              <div className="space-y-2">
                <h2 className={styles.subHeader}>Sender Details</h2>
                <Input
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  placeholder="Sender's Name"
                  required
                  style={{ color: 'black' }}
                />

                <Input name="senderPhone" value={formData.senderPhone} onChange={handleChange} placeholder="Sender's Phone" required style={{ color: 'black' }} />
                <Textarea name="senderAddress" value={formData.senderAddress} onChange={handleChange} placeholder="Sender's Address" required style={{ color: 'black' }} />
                <Input name="senderPincode" type="text" value={formData.senderPincode} onChange={handleChange} placeholder="Sender’s Pincode" required style={{ color: 'black' }} />
                {formData.senderCityState && <div className="text-sm text-black">{formData.senderCityState}</div>}
              </div>

              {/* Receiver Details */}
              <div className="space-y-2">
                <h2 className={styles.subHeader}>Receiver Details</h2>
                <Input name="receiverName" value={formData.receiverName} onChange={handleChange} placeholder="Receiver's Name" required style={{ color: 'black' }} />
                <Input name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} placeholder="Receiver's Phone" required style={{ color: 'black' }} />
                <Textarea name="receiverAddress" value={formData.receiverAddress} onChange={handleChange} placeholder="Receiver's Address" required style={{ color: 'black' }} />
                <Input name="receiverPincode" type="text" value={formData.receiverPincode} onChange={handleChange} placeholder="Receiver’s Pincode" required style={{ color: 'black' }} />
                {formData.receiverCityState && <div className="text-sm text-black">{formData.receiverCityState}</div>}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-2">
              <h2 className={styles.subHeader}>Product Details</h2>
              <Input
  name="productName"
  value={formData.productName}
  onChange={handleChange}
  placeholder="Product Name"
  required
  style={{ color: 'black' }}
/>
<Input
  name="weightEstimate"
  type="number"
  min="0"
  step="0.01"
  value={formData.weightEstimate === 0 ? '' : formData.weightEstimate}
  onChange={handleChange}
  placeholder="Estimated Weight"
  style={{ color: 'black' }}
/>
<Label htmlFor="photo" className="text-black font-semibold text-lg mb-2">
  Product Photo (optional)
</Label>


              <Input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="border rounded-md p-2 mb-4 text-black"
              />
              {formData.photoUrl && (
                <img
                  src={formData.photoUrl}
                  alt="Product"
                  className="max-w-full h-auto rounded-md border border-black mt-2"
                />
              )}
            </div>

            {/* Delivery Mode */}
            {/* Delivery Mode */}
            <div className="space-y-2">
  <h2 className={styles.subHeader}>Delivery Mode</h2>

  
  {/* Container for Delivery Mode dropdown and Pickup checkbox */}
  <div className="flex items-center space-x-30">
    {/* Delivery Mode Dropdown */}
    <select
      name="deliveryMode"
      value={formData.deliveryMode}
      onChange={handleChange}
      className="border rounded-md p-2 text-black"
    >
      <option value="standard">Surface</option>
      <option value="express">Express</option>
    </select>
    
    {/* Pickup Charges Checkbox */}
    <div className="flex items-center">
      <input
        type="checkbox"
        name="pickupRequired"
        checked={formData.pickupRequired}
        onChange={handleChange}
        id="pickupRequired"
        style={{ transform: 'scale(1.5)' }} // Adjust the scale factor as needed
      />
      <Label htmlFor="pickupRequired" className="ml-2 text-black">
        Pickup required (Extra Charges may apply)
      </Label>
    </div>
  </div>
</div>



            {/* Additional Charges */}
            <div className="space-y-2">
              <div>
  
</div>

              <div>
                {/* <input type="checkbox" name="deliveryRequired" checked={formData.deliveryRequired} onChange={handleChange} id="deliveryRequired" /> */}
                {/* <Label htmlFor="deliveryRequired" className="ml-2 text-black">Delivery to endpoint required (₹40 extra)</Label> */}
              </div>
              {/* <Input name="handlingCharge" type="number" min="0" step="0.01" value={formData.handlingCharge} onChange={handleChange} placeholder="Handling Charge (optional)" />
              <Input name="docketCharge" type="number" min="0" step="0.01" value={formData.docketCharge} onChange={handleChange} placeholder="Docket Charge (optional)" /> */}
            </div>

            {/* Notes */}
            <Textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional notes (optional)" />

            {/* Route unsupported warning */}


            {/* Route unsupported warning */}
            {!rateMap[`${formData.senderPincode}-${formData.receiverPincode}`] ? (
              <div className={styles.unsupportedRoute}>
                {/* This route ships via third-party carriers (Bluedart, Indian Post, or Delhivery). Estimated price: 130-270 per kg, plus handling, packaging, and other small charges. */}
                Parcels between Delhi and Imphal delivered in 1-3 days, ₹130-₹270/kg. For other routes, third-party carriers (Bluedart, Indian Post, Delhivery) are used. Contact 9774795906 for details. 
              </div>
            ) : (
              <>
                <div className={styles.estimateCharge}>
                  Estimated Charges: ₹{estimateCharge.toFixed(2)}
                </div>
                <div style={{ color: 'black' }}>
                  This charge is an estimate and may vary after pickup based on actual weight and other factors.
                </div>
              </>
            )}



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
            <p className="mt-2 text-sm text-black">
              Our team will connect with you soon. You can also reach us at <strong>9774795906</strong>.
            </p>
            <p className="mt-1 text-sm text-yellow-600">
              Note: Estimate charges (₹{trackingPopup.estimateCharge.toFixed(2)}) may vary after pickup.
            </p>
            <div className="flex justify-between mt-4">
              <Button onClick={() => generateInvoice(trackingPopup)}>Download Reciept</Button>
              <Button variant="outline" onClick={() => setTrackingPopup(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
