// app/(main)/admin/cargo/page.tsx
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
import {
  Loader2,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  Users,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "Out for Delivery": "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_TRIGGER_STYLES: Record<string, string> = {
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

function modeLabel(mode: string) {
  if (mode === "Indian Post") return "Indian Post";
  if (mode === "Express Cargo" || mode === "express") return "Express";
  if (mode === "Normal Cargo" || mode === "normal") return "Normal";
  if (mode === "standard") return "Indian Post";
  return mode;
}

// ---------------------------------------------------------------------------
// Mobile booking card
// ---------------------------------------------------------------------------

function BookingCard({
  b,
  updatingId,
  onStatusChange,
  onInvoice,
}: {
  b: Booking;
  updatingId: string | null;
  onStatusChange: (id: string, status: Booking["status"]) => void;
  onInvoice: (id: string) => void;
}) {
  const charge = b.final_charge ?? b.estimate_charge;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      {/* Top row: tracking + date */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-emerald-700">{b.tracking_id}</span>
        <span className="text-xs text-neutral-400">
          {new Date(b.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Sender → Receiver */}
      <div className="mb-3 flex items-center gap-2 text-sm">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-neutral-900">{b.sender_name}</p>
          <p className="text-xs text-neutral-400">{b.sender_phone}</p>
        </div>
        <span className="text-neutral-300">→</span>
        <div className="min-w-0 flex-1 text-right">
          <p className="truncate font-medium text-neutral-900">{b.receiver_name}</p>
          <p className="text-xs text-neutral-400">{b.receiver_phone}</p>
        </div>
      </div>

      {/* Product + weight + mode */}
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-md bg-neutral-100 px-2 py-1 text-neutral-600">
          {b.product_name}
        </span>
        <span className="rounded-md bg-neutral-100 px-2 py-1 text-neutral-600">
          {b.weight_estimate} kg
        </span>
        <span className="rounded-md bg-neutral-100 px-2 py-1 text-neutral-600">
          {modeLabel(b.delivery_mode)}
        </span>
      </div>

      {/* Status + payment + charge */}
      <div className="mb-3 flex items-center gap-2">
        <Select
          value={b.status}
          onValueChange={(v) => onStatusChange(b.id, v as Booking["status"])}
          disabled={updatingId === b.id}
        >
          <SelectTrigger
            className={`h-7 flex-1 border px-2 text-xs font-medium ${
              STATUS_TRIGGER_STYLES[b.status] ?? "bg-neutral-100 text-neutral-600"
            }`}
          >
            <div className="flex items-center gap-1">
              {updatingId === b.id && <Loader2 className="h-3 w-3 animate-spin" />}
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

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
            PAYMENT_STYLES[b.payment_status] ?? "bg-neutral-100 text-neutral-600"
          }`}
        >
          {b.payment_status}
        </span>

        <span className="ml-auto text-sm font-semibold text-neutral-900">
          ₹{Number(charge).toFixed(0)}
        </span>
      </div>

      {/* Invoice button */}
      <Button
        variant="outline"
        size="sm"
        className="h-7 w-full border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
        onClick={() => onInvoice(b.id)}
      >
        <FileText className="mr-1.5 h-3.5 w-3.5" />
        Invoice
      </Button>
    </div>
  );
}

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
        if (!res.ok) throw new Error(json.message || "Could not load bookings");
        setBookings((json.data as Booking[]) ?? []);
      } catch (err: any) {
        toast.error(err.message || "Could not load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: Booking["status"]) => {
    const previous = bookings;
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
      if (!res.ok) throw new Error(json.message || "Could not update status");
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err: any) {
      toast.error(err.message || "Could not update status");
      setBookings(previous);
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
    if (deliveryMode !== "all") rows = rows.filter((b) => {
      const m = b.delivery_mode;
      if (deliveryMode === "Indian Post") return m === "Indian Post" || m === "standard";
      if (deliveryMode === "Express Cargo") return m === "Express Cargo" || m === "express";
      if (deliveryMode === "Normal Cargo") return m === "Normal Cargo" || m === "normal";
      return m === deliveryMode;
    });
    if (paymentFilter !== "all") rows = rows.filter((b) => b.payment_status === paymentFilter);
    if (startDate) rows = rows.filter((b) => new Date(b.created_at) >= new Date(startDate));
    if (endDate) rows = rows.filter((b) => new Date(b.created_at) <= new Date(`${endDate}T23:59:59`));

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
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const hasActiveFilters =
    search || status !== "all" || deliveryMode !== "all" ||
    paymentFilter !== "all" || startDate || endDate;

  const totalOutstanding = bookings
    .filter((b) => b.payment_status !== "paid")
    .reduce((s, b) => {
      const charge = b.final_charge ?? b.estimate_charge;
      return s + Math.max(0, charge - (b.amount_paid ?? 0));
    }, 0);

  const SortBtn = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      type="button"
      onClick={() => toggleSort(k)}
      className="flex items-center gap-1 font-medium text-emerald-800 hover:text-emerald-600"
    >
      {label}
      {sortKey === k ? (
        sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">

        {/* Header */}
        <div className="mb-5 flex flex-wrap items-start gap-3 sm:items-center">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-neutral-900">Bookings</h1>
            <p className="text-sm text-neutral-500">
              {loading ? "Loading…" : `${filtered.length} of ${bookings.length} bookings`}
              {totalOutstanding > 0 && !loading && (
                <span className="ml-2 font-medium text-red-600">
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
              <span className="hidden sm:inline">Customers</span>
            </Button>
            <Button
              onClick={() => router.push("/admin/cargo/bookingPage")}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Create new order</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          {/* Row 1: search + clear */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tracking ID, name or phone"
                className="bg-white pl-8 text-neutral-900 placeholder:text-neutral-400 border-neutral-200"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="shrink-0 bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50"
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>

          {/* Row 2: dropdowns + dates */}
          <div className="flex flex-wrap gap-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-auto min-w-[120px] bg-white text-xs text-neutral-900 border-neutral-200">
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
              <SelectTrigger className="h-8 w-auto min-w-[120px] bg-white text-xs text-neutral-900 border-neutral-200">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent className="bg-white text-neutral-900">
                <SelectItem value="all">All modes</SelectItem>
                <SelectItem value="Indian Post">Indian Post</SelectItem>
                <SelectItem value="Normal Cargo">Normal Cargo</SelectItem>
                <SelectItem value="Express Cargo">Express Cargo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="h-8 w-auto min-w-[110px] bg-white text-xs text-neutral-900 border-neutral-200">
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
              className="h-8 w-auto bg-white text-xs text-neutral-900 border-neutral-200"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 w-auto bg-white text-xs text-neutral-900 border-neutral-200"
            />
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* MOBILE: card list (hidden on md+)                                */}
        {/* ---------------------------------------------------------------- */}
        <div className="md:hidden">
          {loading ? (
            <div className="flex justify-center py-16 text-neutral-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-neutral-400">
              No bookings match these filters.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((b) => (
                <BookingCard
                  key={b.id}
                  b={b}
                  updatingId={updatingId}
                  onStatusChange={handleStatusChange}
                  onInvoice={(id) => router.push(`/admin/cargo/invoice/${id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* DESKTOP: full-width table (hidden below md)                      */}
        {/* ---------------------------------------------------------------- */}
        <div className="hidden md:block">
          <table className="w-full table-fixed border-collapse text-sm">
            <colgroup>
              {/* Tracking  Sender  Receiver  Product  Weight  Mode  Status  Charge  Payment  Date  Invoice */}
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[10%]" />
              <col className="w-[7%]" />
              <col className="w-[8%]" />
              <col className="w-[14%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[7%]" />
              <col className="w-[6%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-emerald-100 bg-emerald-50/60">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-emerald-800">Tracking</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-emerald-800">Sender</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-emerald-800">Receiver</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-emerald-800">Product</th>
                <th className="px-3 py-2.5 text-left text-xs">
                  <SortBtn label="Weight" k="weight_estimate" />
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-emerald-800">Mode</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-emerald-800">Status</th>
                <th className="px-3 py-2.5 text-left text-xs">
                  <SortBtn label="Charge" k="estimate_charge" />
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-emerald-800">Payment</th>
                <th className="px-3 py-2.5 text-left text-xs">
                  <SortBtn label="Date" k="created_at" />
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-emerald-800">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-neutral-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-sm text-neutral-400">
                    No bookings match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const charge = b.final_charge ?? b.estimate_charge;
                  return (
                    <tr
                      key={b.id}
                      className="border-b border-neutral-100 last:border-0 hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-xs font-medium text-emerald-700 leading-tight block truncate">
                          {b.tracking_id}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="truncate text-xs font-medium text-neutral-800">{b.sender_name}</p>
                        <p className="truncate text-xs text-neutral-400">{b.sender_phone}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="truncate text-xs font-medium text-neutral-800">{b.receiver_name}</p>
                        <p className="truncate text-xs text-neutral-400">{b.receiver_phone}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="truncate text-xs text-neutral-700 block">{b.product_name}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-neutral-500 whitespace-nowrap">
                        {b.weight_estimate} kg
                      </td>
                      <td className="px-3 py-2.5 text-xs text-neutral-500">
                        {modeLabel(b.delivery_mode)}
                      </td>
                      <td className="px-3 py-2.5">
                        <Select
                          value={b.status}
                          onValueChange={(v) => handleStatusChange(b.id, v as Booking["status"])}
                          disabled={updatingId === b.id}
                        >
                          <SelectTrigger
                            className={`h-6 w-full border-0 px-2 text-xs font-medium ${
                              STATUS_TRIGGER_STYLES[b.status] ?? "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            <div className="flex items-center gap-1 min-w-0">
                              {updatingId === b.id && <Loader2 className="h-2.5 w-2.5 shrink-0 animate-spin" />}
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-white text-neutral-900">
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-3 py-2.5 text-xs font-medium text-neutral-800 whitespace-nowrap">
                        ₹{Number(charge).toFixed(0)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${
                            PAYMENT_STYLES[b.payment_status] ?? "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {b.payment_status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-neutral-500 whitespace-nowrap">
                        {new Date(b.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="px-3 py-2.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-full border-emerald-200 bg-white px-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
                          onClick={() => router.push(`/admin/cargo/invoice/${b.id}`)}
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}