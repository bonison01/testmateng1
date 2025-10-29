// BookingDetailsForm.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { BookingData } from "../../app/types/index";
// import { BookingData } from "../app/types/index";
import styles from './BookingDetailsPage.module.css'; // Import the styles

interface BookingDetailsFormProps {
  selectedBooking: BookingData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSave: () => void;
  handleDownloadInvoice: () => void;
  handleDownloadLabel: () => void;
  onClose: () => void;
}

const BookingDetailsForm = ({
  selectedBooking,
  onInputChange,
  handleSave,
  handleDownloadInvoice,
  handleDownloadLabel,
  onClose,
}: BookingDetailsFormProps) => {
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

      {/* Sender and Receiver Pincode */}
      <div className={styles.formGroupRow}>
        <div className={styles.formGroup}>
          <label>Sender Pincode</label>
          <input
            type="text"
            name="sender_pincode"
            value={selectedBooking.sender_pincode}
            onChange={onInputChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Receiver Pincode</label>
          <input
            type="text"
            name="receiver_pincode"
            value={selectedBooking.receiver_pincode}
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
        <label>Delivery Mode</label>
        <input
          type="text"
          name="delivery_mode"
          value={selectedBooking.delivery_mode}
          onChange={onInputChange}
        />
      </div>

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
        <label>Notes</label>
        <textarea
          name="notes"
          value={selectedBooking.notes}
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
