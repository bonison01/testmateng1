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
  estimateCharge: number;
}

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
  doc.text(`Name: ${data.senderName}`, senderX, 80);
  doc.text(`Phone: ${data.senderPhone}`, senderX, 90);
  doc.text(`Address: ${data.senderAddress}`, senderX, 100);
  doc.text(`Pincode: ${data.senderPincode}`, senderX, 110);
  doc.text(`City/State: ${data.senderCityState || "-"}`, senderX, 120);

  // Receiver Details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Receiver Details", receiverX, 70);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.receiverName}`, receiverX, 80);
  doc.text(`Phone: ${data.receiverPhone}`, receiverX, 90);
  doc.text(`Address: ${data.receiverAddress}`, receiverX, 100);
  doc.text(`Pincode: ${data.receiverPincode}`, receiverX, 110);
  doc.text(`City/State: ${data.receiverCityState || "-"}`, receiverX, 120);

  // Add a line separating the details and footer
  doc.setLineWidth(0.5);
  doc.line(20, 130, 190, 130);

  // Pricing Details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Pricing Details", 20, 140);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Freight Charges (Estimated): ₹${data.estimateCharge.toFixed(2)}`, 20, 150);
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

export default generateInvoice;
