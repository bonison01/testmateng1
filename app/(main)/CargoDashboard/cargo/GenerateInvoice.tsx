import React from 'react';
import { jsPDF } from 'jspdf';

interface TrackingPopupData {
  trackingId: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderPincode: string;
  senderCityState: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverPincode: string;
  receiverCityState: string;
  productName?: string;
  weightEstimate?: number;
  deliveryMode?: "standard" | "express";
  pickupRequired?: boolean;
  deliveryRequired?: boolean;
  notes?: string;
  estimateCharge: number;
}

const generateInvoice = (data: TrackingPopupData) => {
  const doc = new jsPDF();

  // ---- HEADER ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Mateng Delivery Service", 20, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Sagolband Sayang Leirak, Sagolband, Imphal, Manipur - 795004", 20, 26);
  doc.text("Phone: 8787649928 | Website: justmateng.com", 20, 31);
  doc.line(20, 35, 190, 35);

  // ---- INVOICE TITLE ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Booking Receipt", 20, 45);

  const today = new Date().toLocaleDateString();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Date: ${today}`, 150, 45);
  doc.text(`Tracking ID: ${data.trackingId}`, 20, 53);
  doc.line(20, 58, 190, 58);

  // ---- SENDER DETAILS ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Sender Details", 20, 68);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Name: ${data.senderName}`, 20, 75);
  doc.text(`Phone: ${data.senderPhone}`, 20, 81);
  doc.text(`Address: ${data.senderAddress}`, 20, 87);
  doc.text(`Pincode: ${data.senderPincode}`, 20, 93);
  doc.text(`City/State: ${data.senderCityState || "-"}`, 20, 99);

  // ---- RECEIVER DETAILS ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Receiver Details", 110, 68);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Name: ${data.receiverName}`, 110, 75);
  doc.text(`Phone: ${data.receiverPhone}`, 110, 81);
  doc.text(`Address: ${data.receiverAddress}`, 110, 87);
  doc.text(`Pincode: ${data.receiverPincode}`, 110, 93);
  doc.text(`City/State: ${data.receiverCityState || "-"}`, 110, 99);

  doc.line(20, 106, 190, 106);

  // ---- PRODUCT DETAILS ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Product & Delivery Details", 20, 116);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Product Name: ${data.productName || "-"}`, 20, 123);
  doc.text(`Weight Estimate: ${data.weightEstimate ? data.weightEstimate + " kg" : "-"}`, 20, 129);
  doc.text(`Delivery Mode: ${data.deliveryMode === "express" ? "Express" : "Surface"}`, 20, 135);
  doc.text(`Pickup Required: ${data.pickupRequired ? "Yes" : "No"}`, 20, 141);
  doc.text(`Delivery Required: ${data.deliveryRequired ? "Yes" : "No"}`, 20, 147);
  doc.text(`Additional Notes: ${data.notes || "-"}`, 20, 153);

  doc.line(20, 160, 190, 160);

  // ---- CHARGES SUMMARY ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Charges Summary", 20, 170);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const pickupCharge = data.pickupRequired ? 30 : 0;
  const deliveryCharge = data.deliveryRequired ? 40 : 0;
  const total = data.estimateCharge + pickupCharge + deliveryCharge;

  doc.text(`Freight Charges (Estimated): ₹${data.estimateCharge.toFixed(2)}`, 20, 177);
  doc.text(`Pickup Charge: ₹${pickupCharge}`, 20, 183);
  doc.text(`Delivery Charge: ₹${deliveryCharge}`, 20, 189);
  doc.text(`----------------------------------------------`, 20, 195);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Estimated: ₹${total.toFixed(2)}`, 20, 202);

  // ---- NOTES & SUPPORT ----
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("⚠ Note: This is a preliminary receipt. Final bill will be provided after pickup.", 20, 215);
  doc.text("Prices may vary based on actual weight, distance, and delivery mode.", 20, 221);
  doc.text("For 100kg+ or electronic/medical items, GST invoice is required.", 20, 227);
  doc.text("Support: 9774795906", 20, 233);

  // ---- FOOTER ----
  doc.line(20, 240, 190, 240);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Mateng Delivery | Sagolband Sayang Leirak, Imphal, Manipur - 795004", 20, 248);
  doc.text("Website: justmateng.com | Phone: 8787649928", 20, 253);
  doc.text("This is a computer-generated receipt and does not require a signature.", 20, 258);

  // Save the file
  doc.save(`Receipt-${data.trackingId}.pdf`);
};

export default generateInvoice;
