import React from 'react';
import { Button } from "@/components/ui/button";
import { BookingData } from "../../../types/index"; // Import your data type
import styles from './BookingDetailsPage.module.css'; // Import your CSS styles
import { jsPDF } from 'jspdf';

interface BookingDetailsFormProps {
  selectedBooking: BookingData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSave: () => void;
  handleDownloadLabel: () => void;
  onClose: () => void;
}

const generateInvoice = (data: BookingData) => {
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
  doc.text(`Tracking ID: ${data.tracking_id}`, 20, 55);
  
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
  doc.text(`Name: ${data.sender_name}`, senderX, 80);
  doc.text(`Phone: ${data.sender_phone}`, senderX, 90);
  doc.text(`Address: ${data.sender_address}`, senderX, 100);
  doc.text(`Pincode: ${data.sender_pincode}`, senderX, 110);
  doc.text(`City/State: ${data.sender_city_state || "-"}`, senderX, 120);

  // Receiver Details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Receiver Details", receiverX, 70);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.receiver_name}`, receiverX, 80);
  doc.text(`Phone: ${data.receiver_phone}`, receiverX, 90);
  doc.text(`Address: ${data.receiver_address}`, receiverX, 100);
  doc.text(`Pincode: ${data.receiver_pincode}`, receiverX, 110);
  doc.text(`City/State: ${data.receiver_city_state || "-"}`, receiverX, 120);

  // Add a line separating the details and footer
  doc.setLineWidth(0.5);
  doc.line(20, 130, 190, 130);

  // Pricing Details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Pricing Details", 20, 140);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  // doc.text(`Freight Charges (Estimated): ₹${data.estimate_charge.toFixed(2)}`, 20, 150);
  const freightCharge = data.estimate_charge != null && !isNaN(data.estimate_charge) ? data.estimate_charge.toFixed(2) : "N/A";
doc.text(`Freight Charges (Estimated): ₹${freightCharge}`, 20, 150);
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
  doc.save(`Invoice-${data.tracking_id}.pdf`);
};

const BookingDetailsForm = ({
  selectedBooking,
  onInputChange,
  handleSave,
  handleDownloadLabel,
  onClose,
}: BookingDetailsFormProps) => {

  const handleDownloadInvoice = () => {
    generateInvoice(selectedBooking);
  };

  return (
    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <h3>Edit Booking Details</h3>

      {/* Sender and Receiver Information Side by Side */}
      <div className={styles.formGroupRow}>
        <div className={styles.formGroup}>
          <label>Sender Name</label>
          <input
            type="text"
            name="sender_name"
            value={selectedBooking.sender_name}
            onChange={onInputChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Receiver Name</label>
          <input
            type="text"
            name="receiver_name"
            value={selectedBooking.receiver_name}
            onChange={onInputChange}
          />
        </div>
      </div>

      {/* Sender and Receiver Phone */}
      <div className={styles.formGroupRow}>
        <div className={styles.formGroup}>
          <label>Sender Phone</label>
          <input
            type="text"
            name="sender_phone"
            value={selectedBooking.sender_phone}
            onChange={onInputChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Receiver Phone</label>
          <input
            type="text"
            name="receiver_phone"
            value={selectedBooking.receiver_phone}
            onChange={onInputChange}
          />
        </div>
      </div>

      {/* Sender and Receiver Address */}
      <div className={styles.formGroupRow}>
        <div className={styles.formGroup}>
          <label>Sender Address</label>
          <input
            type="text"
            name="sender_address"
            value={selectedBooking.sender_address}
            onChange={onInputChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Receiver Address</label>
          <input
            type="text"
            name="receiver_address"
            value={selectedBooking.receiver_address}
            onChange={onInputChange}
          />
        </div>
      </div>

      {/* Product and Weight Estimate */}
      <div className={styles.formGroup}>
        <label>Product Name</label>
        <input
          type="text"
          name="product_name"
          value={selectedBooking.product_name}
          onChange={onInputChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Weight Estimate</label>
        <input
          type="number"
          name="weight_estimate"
          value={selectedBooking.weight_estimate}
          onChange={onInputChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Product Photo URL</label>
        <input
          type="text"
          name="photo_url"
          value={selectedBooking.photo_url}
          onChange={onInputChange}
        />
      </div>

      {/* Pickup and Delivery Required */}
      <div className={styles.formGroupRow}>
        <div className={styles.formGroup}>
          <label>Pickup Required</label>
          <input
            type="checkbox"
            name="pickup_required"
            checked={selectedBooking.pickup_required}
            onChange={onInputChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Delivery Required</label>
          <input
            type="checkbox"
            name="delivery_required"
            checked={selectedBooking.delivery_required}
            onChange={onInputChange}
          />
        </div>
      </div>

      {/* Delivery Mode */}
      <div className={styles.formGroup}>
        <label>Delivery Mode</label>
        <input
          type="text"
          name="delivery_mode"
          value={selectedBooking.delivery_mode}
          onChange={onInputChange}
        />
      </div>

      {/* Notes */}
      <div className={styles.formGroup}>
        <label>Notes</label>
        <textarea
          name="notes"
          value={selectedBooking.notes}
          onChange={onInputChange}
        />
      </div>

      {/* Tracking ID (Read-Only) */}
      <div className={styles.formGroup}>
        <label>Tracking ID</label>
        <input
          type="text"
          name="tracking_id"
          value={selectedBooking.tracking_id}
          readOnly
        />
      </div>

      {/* Status */}
      <div className={styles.formGroup}>
        <label>Status</label>
        <input
          type="text"
          name="status"
          value={selectedBooking.status}
          onChange={onInputChange}
        />
      </div>

      {/* Pricing Details */}
      <div className={styles.formGroup}>
        <label>Handling Charge</label>
        <input
          type="number"
          name="handling_charge"
          value={selectedBooking.handling_charge}
          onChange={onInputChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Docket Charge</label>
        <input
          type="number"
          name="docket_charge"
          value={selectedBooking.docket_charge}
          onChange={onInputChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Pickup Charge</label>
        <input
          type="number"
          name="pickup_charge"
          value={selectedBooking.pickup_charge}
          onChange={onInputChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Packaging Charge</label>
        <input
          type="number"
          name="packaging_charge"
          value={selectedBooking.packaging_charge}
          onChange={onInputChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Extra Mile Delivery</label>
        <input
          type="number"
          name="extra_mile_delivery"
          value={selectedBooking.extra_mile_delivery}
          onChange={onInputChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Estimate Charge</label>
        <input
          type="number"
          name="estimate_charge"
          value={selectedBooking.estimate_charge}
          onChange={onInputChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Final Charge</label>
        <input
          type="number"
          name="final_charge"
          value={selectedBooking.final_charge}
          onChange={onInputChange}
        />
      </div>

      {/* Download Buttons */}
      <div className={styles.downloadButtons}>
        <button className={styles.downloadButton} onClick={handleDownloadInvoice}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 3h7v7M16 12l7-7-7-7-7 7 7 7z" />
          </svg>
          Download Invoice
        </button>
        <button className={styles.downloadButton} onClick={handleDownloadLabel}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16M4 8h16M4 12h16M4 16h16" />
          </svg>
          Download Label
        </button>
      </div>

      {/* Save and Cancel Buttons */}
      <div className={styles.modalActions}>
        <Button className={styles.buttonSave} onClick={handleSave}>Save</Button>
        <Button className={styles.buttonCancel} onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
};


export default BookingDetailsForm;
