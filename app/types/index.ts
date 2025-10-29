// types/index.ts (or types/booking.d.ts)

// src/app/types/index.ts
export interface BookingData {
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  sender_pincode: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  receiver_pincode: string;
  product_name: string;
  weight_estimate: number;
  pickup_required: boolean;
  delivery_required: boolean;
  delivery_mode: string;
  handling_charge: number;
  docket_charge: number;
  notes: string;
  estimate_charge: number;
  tracking_id: string;
  status: string;
  created_at: string; // Or Date if necessary
}


export interface StatusCount {
  pending: number;
  outForDelivery: number;
  delivered: number;
}
