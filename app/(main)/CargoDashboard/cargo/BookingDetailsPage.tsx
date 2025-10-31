// BookingDetailsPage.tsx
import React, { useState } from "react";
import { toast } from "sonner";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import BookingDetailsForm from './BookingDetailsForm';  // Import the new form component
import { BookingData } from "../../../types/index";
import styles from './BookingDetailsPage.module.css';  // Import the same styles
import ReactDOMServer from 'react-dom/server';  // Import ReactDOMServer

interface BookingDetailsPageProps {
  booking: BookingData;
  onClose: () => void;
}

const BookingDetailsPage = ({ booking, onClose }: BookingDetailsPageProps) => {
  const supabase = useSupabaseClient();
  const [selectedBooking, setSelectedBooking] = useState(booking);

  // Handle saving updated booking details
  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings") // Replace with the actual table name
        .update(selectedBooking)
        .eq("tracking_id", selectedBooking.tracking_id);

      if (error) throw new Error(error.message);

      toast.success("Booking details updated!");
      onClose(); // Close the modal after successful save
    } catch (error) {
      toast.error((error as Error).message || "Failed to update booking details");
    }
  };

  // Update input and textarea values
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedBooking((prevBooking) => ({
      ...prevBooking,
      [name]: value,
    }));
  };

  // Handle Invoice Download and Trigger Print
  const handleDownloadInvoice = () => {
    const invoiceContent = (
      <div>
        <h2>Invoice for {selectedBooking.product_name}</h2>
        <p><strong>Sender:</strong> {selectedBooking.sender_name}</p>
        <p><strong>Receiver:</strong> {selectedBooking.receiver_name}</p>
        <p><strong>Address:</strong> {selectedBooking.sender_address} - {selectedBooking.receiver_address}</p>
        <p><strong>Weight Estimate:</strong> {selectedBooking.weight_estimate}</p>
        <p><strong>Delivery Mode:</strong> {selectedBooking.delivery_mode}</p>
        <p><strong>Charges:</strong> {selectedBooking.estimate_charge}</p>
        {/* Add other necessary fields */}
      </div>
    );

    const invoiceContentString = ReactDOMServer.renderToStaticMarkup(invoiceContent);

    // Create a temporary iframe to display the content
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDocument = iframe.contentWindow?.document;
    if (iframeDocument) {
      iframeDocument.open();
      iframeDocument.write(invoiceContentString);
      iframeDocument.close();
      iframe.contentWindow?.print();
      document.body.removeChild(iframe); // Remove iframe after printing
    }

    toast.success("Printing invoice...");
  };

  // Handle Shipping Label Download and Trigger Print
  const handleDownloadLabel = () => {
    const labelContent = (
      <div>
        <h2>Shipping Label</h2>
        <p><strong>Sender:</strong> {selectedBooking.sender_name}</p>
        <p><strong>Receiver:</strong> {selectedBooking.receiver_name}</p>
        <p><strong>Address:</strong> {selectedBooking.sender_address} - {selectedBooking.receiver_address}</p>
        {/* Add other necessary fields */}
      </div>
    );

    const labelContentString = ReactDOMServer.renderToStaticMarkup(labelContent);

    // Create a temporary iframe to display the content
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDocument = iframe.contentWindow?.document;
    if (iframeDocument) {
      iframeDocument.open();
      iframeDocument.write(labelContentString);
      iframeDocument.close();
      iframe.contentWindow?.print();
      document.body.removeChild(iframe); // Remove iframe after printing
    }

    toast.success("Printing label...");
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <BookingDetailsForm
        selectedBooking={selectedBooking}
        onInputChange={handleInputChange}
        handleSave={handleSave}
        // handleDownloadInvoice={handleDownloadInvoice}
        handleDownloadLabel={handleDownloadLabel}
        onClose={onClose}
      />
    </div> 
  );
};

export default BookingDetailsPage;
