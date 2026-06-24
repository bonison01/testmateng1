//app/(main)/admin/cargo/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, X, ChevronDown, ChevronUp, FileText, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// NOTE: the direct Supabase anon-key client is gone from this file on
// purpose. cargo_bookings no longer has a public SELECT/UPDATE policy
// (see sql/002_lock_down_cargo_bookings_rls.sql), so reads and writes
// now go through /api/admin/cargo/bookings, which uses the service-role
// key server-side and is itself gated by middleware + a session check.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Booking {
  id: string;
  tracking_id: string;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  product_name: string;
  weight_estimate: number;
  delivery_mode: string;
  pickup_required: boolean | null;
  status: "Pending" | "Out for Delivery" | "Delivered";
  estimate_charge: number;
  final_charge: number | null;
  payment_status: "paid" | "unpaid" | "partial";
  amount_paid: number;
  created_at: string;
}

type SortKey = "created_at" | "estimate_charge" | "weight_estimate";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700",
  "Out for Delivery": "bg-blue-50 text-blue-700",
  Delivered: "bg-emerald-50 text-emerald-700",
};

const PAYMENT_STYLES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  unpaid: "bg-red-50 text-red-700",
  partial: "bg-amber-50 text-amber-700",
};

const STATUS_OPTIONS: Booking["status"][] = ["Pending", "Out for Delivery", "Delivered"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [deliveryMode, setDeliveryMode] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/cargo/bookings");
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "Could not load bookings");
        }
        setBookings((json.data as Booking[]) ?? []);
      } catch (err: any) {
        console.error("Bookings fetch error:", err);
        toast.error(err.message || "Could not load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: Booking["status"]) => {
    const previous = bookings;
    // Optimistic update
    setBookings((rows) =>
      rows.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    setUpdatingId(bookingId);

    try {
      const res = await fetch(`/api/admin/cargo/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Could not update status");
      }
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err: any) {
      console.error("Status update error:", err);
      toast.error(err.message || "Could not update status");
      setBookings(previous); // roll back
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    let rows = [...bookings];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (b) =>
          b.tracking_id.toLowerCase().includes(q) ||
          b.sender_name.toLowerCase().includes(q) ||
          b.receiver_name.toLowerCase().includes(q) ||
          b.receiver_phone?.includes(q) ||
          b.sender_phone?.includes(q)
      );
    }
    if (status !== "all") rows = rows.filter((b) => b.status === status);
    if (deliveryMode !== "all") rows = rows.filter((b) => b.delivery_mode === deliveryMode);
    if (paymentFilter !== "all") rows = rows.filter((b) => b.payment_status === paymentFilter);
    if (startDate) rows = rows.filter((b) => new Date(b.created_at) >= new Date(startDate));
    if (endDate)
      rows = rows.filter((b) => new Date(b.created_at) <= new Date(`${endDate}T23:59:59`));

    rows.sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === "created_at") {
        av = new Date(a.created_at).getTime();
        bv = new Date(b.created_at).getTime();
      } else {
        av = Number(a[sortKey]) || 0;
        bv = Number(b[sortKey]) || 0;
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });

    return rows;
  }, [bookings, search, status, deliveryMode, paymentFilter, startDate, endDate, sortKey, sortDir]);

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setDeliveryMode("all");
    setPaymentFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const hasActiveFilters =
    search ||
    status !== "all" ||
    deliveryMode !== "all" ||
    paymentFilter !== "all" ||
    startDate ||
    endDate;

  const totalOutstanding = bookings
    .filter((b) => b.payment_status !== "paid")
    .reduce((s, b) => {
      const charge = b.final_charge ?? b.estimate_charge;
      return s + Math.max(0, charge - (b.amount_paid ?? 0));
    }, 0);

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button
      type="button"
      onClick={() => toggleSort(sortKeyName)}
      className="flex items-center gap-1 text-left font-medium text-neutral-500 hover:text-neutral-900"
    >
      {label}
      {sortKey === sortKeyName &&
        (sortDir === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        ))}
    </button>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-neutral-900">Bookings</h1>
            <p className="text-sm text-neutral-500">
              {loading
                ? "Loading..."
                : `${filtered.length} of ${bookings.length} bookings`}
              {totalOutstanding > 0 && !loading && (
                <span className="ml-2 text-red-600">
                  · ₹{totalOutstanding.toFixed(2)} outstanding
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/cargo/customers")}
              className="border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
            >
              <Users className="mr-1.5 h-4 w-4" />
              Customers
            </Button>
            <Button
              onClick={() => router.push("/admin/cargo/bookingPage")}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Create new order
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 p-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tracking ID, name, phone"
              className="bg-white pl-8 text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
            />
          </div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px] bg-white text-neutral-900 border-neutral-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white text-neutral-900">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Out for Delivery">Out for delivery</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>

          <Select value={deliveryMode} onValueChange={setDeliveryMode}>
            <SelectTrigger className="w-[150px] bg-white text-neutral-900 border-neutral-300">
              <SelectValue placeholder="Delivery mode" />
            </SelectTrigger>
            <SelectContent className="bg-white text-neutral-900">
              <SelectItem value="all">All modes</SelectItem>
              <SelectItem value="standard">Indian Post</SelectItem>
              <SelectItem value="express">Cargo Express</SelectItem>
              <SelectItem value="express">Cargo Normal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[150px] bg-white text-neutral-900 border-neutral-300">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent className="bg-white text-neutral-900">
              <SelectItem value="all">All payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[150px] bg-white text-neutral-900 border-neutral-300"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[150px] bg-white text-neutral-900 border-neutral-300"
          />

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="bg-white text-neutral-500 border-neutral-300 hover:bg-neutral-50"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-emerald-100 bg-emerald-50/50">
                <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Tracking ID</th>
                <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Sender</th>
                <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Receiver</th>
                <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Phone</th>
                <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Product</th>
                <th className="px-4 py-2.5 text-left">
                  <SortHeader label="Weight" sortKeyName="weight_estimate" />
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Mode</th>
                <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Status</th>
                <th className="px-4 py-2.5 text-left">
                  <SortHeader label="Charge" sortKeyName="estimate_charge" />
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Payment</th>
                <th className="px-4 py-2.5 text-left">
                  <SortHeader label="Booked on" sortKeyName="created_at" />
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-neutral-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-neutral-400">
                    No bookings match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-emerald-50/40"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-700">
                      {b.tracking_id}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-700">{b.sender_name}</td>
                    <td className="px-4 py-2.5 text-neutral-700">{b.receiver_name}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{b.receiver_phone}</td>
                    <td className="px-4 py-2.5 text-neutral-700">{b.product_name}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{b.weight_estimate} kg</td>
                    <td className="px-4 py-2.5 capitalize text-neutral-500">{b.delivery_mode}</td>
                    <td className="px-4 py-2.5">
                      <Select
                        value={b.status}
                        onValueChange={(value) =>
                          handleStatusChange(b.id, value as Booking["status"])
                        }
                        disabled={updatingId === b.id}
                      >
                        <SelectTrigger
                          className={`h-7 w-[150px] border-0 px-2 text-xs font-medium ${
                            STATUS_STYLES[b.status] ?? "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {updatingId === b.id && (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white text-neutral-900">
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-700">
                      ₹{Number(b.estimate_charge).toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          PAYMENT_STYLES[b.payment_status] ?? "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {b.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-500">
                      {new Date(b.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                        onClick={() => router.push(`/admin/cargo/invoice/${b.id}`)}
                      >
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        Invoice
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}