"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import styles from './booking-status.module.css';

interface BookingData {
  trackingId: string;
  senderName: string;
  receiverName: string;
  productName: string;
  weightEstimate: number;
  deliveryMode: string;
  handlingCharge: number;
  docketCharge: number;
  estimateCharge: number;
  status: string;
  notes: string;
}

export default function BookingStatusPage() {
  const [trackingId, setTrackingId] = useState<string>("");
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [newWeight, setNewWeight] = useState<number | string>("");

  useEffect(() => {
    if (!trackingId) return;

    // Fetch booking details by tracking ID
    const fetchBooking = async () => {
      setIsFetching(true);
      try {
        const response = await fetch(`/api/get-booking/${trackingId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch booking");
        }

        setBookingData(data);
      } catch (error) {
        toast.error((error as Error).message || "Failed to fetch booking data");
      } finally {
        setIsFetching(false);
      }
    };

    fetchBooking();
  }, [trackingId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!bookingData) return;

    try {
      const response = await fetch(`/api/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: bookingData.trackingId,
          status: newStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setBookingData(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success("Booking status updated successfully!");
    } catch (error) {
      toast.error((error as Error).message || "Failed to update status");
    }
  };

  const handleWeightUpdate = async () => {
    if (!bookingData || !newWeight) return;

    try {
      const response = await fetch(`/api/update-weight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: bookingData.trackingId,
          newWeight: parseFloat(newWeight.toString()),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update weight");
      }

      // Recalculate estimate charge
      const updatedEstimateCharge = calculateEstimateCharge(bookingData);
      setBookingData(prev => prev ? { ...prev, weightEstimate: parseFloat(newWeight.toString()), estimateCharge: updatedEstimateCharge } : null);
      toast.success("Weight updated successfully!");
    } catch (error) {
      toast.error((error as Error).message || "Failed to update weight");
    }
  };

  const calculateEstimateCharge = (booking: BookingData): number => {
    // Basic estimate calculation logic (you might need to adjust depending on your business rules)
    let base = 0;
    if (booking.weightEstimate <= 1) base = 50;
    else if (booking.weightEstimate <= 5) base = 100;
    else base = 200;

    if (booking.deliveryMode === "express") base *= 1.5;

    const total = base + booking.handlingCharge + booking.docketCharge;
    return total;
  };

  const generateInvoice = () => {
    if (!bookingData) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("SuperBox - Booking Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Tracking ID: ${bookingData.trackingId}`, 20, 40);
    doc.text(`Sender: ${bookingData.senderName}`, 20, 50);
    doc.text(`Receiver: ${bookingData.receiverName}`, 20, 60);
    doc.text(`Product: ${bookingData.productName}`, 20, 70);
    doc.text(`Estimated Weight: ${bookingData.weightEstimate} kg`, 20, 80);
    doc.text(`Estimate Charge: ₹${bookingData.estimateCharge.toFixed(2)}`, 20, 90);
    doc.text(`Status: ${bookingData.status}`, 20, 100);
    doc.text(`Notes: ${bookingData.notes}`, 20, 110);
    doc.text(`Support: 9774795906`, 20, 120);
    doc.text(`Note: Charges may vary after pickup.`, 20, 130);
    doc.save(`Invoice-${bookingData.trackingId}.pdf`);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle className="text-xl">Booking Status and Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter Tracking ID"
            />
            <Button onClick={() => setTrackingId(trackingId)}>Fetch Booking</Button>

            {isFetching && <Loader2 className="animate-spin h-5 w-5 mr-2 inline-block" />}

            {bookingData && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Booking Details</h2>
                  <div><strong>Product:</strong> {bookingData.productName}</div>
                  <div><strong>Sender:</strong> {bookingData.senderName}</div>
                  <div><strong>Receiver:</strong> {bookingData.receiverName}</div>
                  <div><strong>Estimated Weight:</strong> {bookingData.weightEstimate} kg</div>
                  <div><strong>Status:</strong> {bookingData.status}</div>
                  <div><strong>Estimate Charge:</strong> ₹{bookingData.estimateCharge.toFixed(2)}</div>
                  <div><strong>Notes:</strong> {bookingData.notes}</div>
                </div>

                {/* Status Update */}
                <div>
                  <Button onClick={() => handleStatusUpdate("In-Transit")}>Mark as In-Transit</Button>
                  <Button onClick={() => handleStatusUpdate("Delivered")}>Mark as Delivered</Button>
                </div>

                {/* Weight Update */}
                <div>
                  <h3>Update Weight</h3>
                  <Input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="New Weight (kg)"
                  />
                  <Button onClick={handleWeightUpdate}>Update Weight</Button>
                </div>

                {/* Generate Invoice */}
                <Button onClick={generateInvoice}>Download Invoice</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
