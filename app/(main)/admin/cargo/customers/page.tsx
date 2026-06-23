//app/(main)/admin/cargo/customers/page.tsx

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Search,
  X,
  CreditCard,
  ArrowLeft,
  IndianRupee,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CargoCustomer {
  id: string;
  name: string;
  phone: string;
  address: string;
  city_state: string;
  pincode: string;
  created_at: string;
}

interface Booking {
  id: string;
  tracking_id: string;
  product_name: string;
  estimate_charge: number;
  final_charge: number | null;
  payment_status: "paid" | "unpaid" | "partial";
  amount_paid: number;
  status: string;
  created_at: string;
  customer_id?: string | null;
}

interface Payment {
  id: string;
  amount: number;
  note: string;
  paid_at: string;
  booking_id: string | null;
}

interface CustomerWithStats extends CargoCustomer {
  total_billed: number;
  total_paid: number;
  outstanding: number;
  booking_count: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const effectiveCharge = (b: Booking) => b.final_charge ?? b.estimate_charge;

const PAYMENT_BADGE: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  unpaid: "bg-red-50 text-red-700",
  partial: "bg-amber-50 text-amber-700",
};

// ---------------------------------------------------------------------------
// Add/Edit Customer Modal
// ---------------------------------------------------------------------------

function CustomerModal({
  existing,
  onClose,
  onSaved,
}: {
  existing?: CargoCustomer;
  onClose: () => void;
  onSaved: (c: CargoCustomer) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(existing?.name ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [cityState, setCityState] = useState(existing?.city_state ?? "");
  const [pincode, setPincode] = useState(existing?.pincode ?? "");

  const save = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Name, phone and address are required");
      return;
    }
    setSaving(true);
    const payload = { name, phone, address, city_state: cityState, pincode };

    let result;
    if (existing) {
      result = await supabase
        .from("cargo_customers")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      result = await supabase.from("cargo_customers").insert(payload).select().single();
    }

    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(existing ? "Customer updated" : "Customer added");
      onSaved(result.data as CargoCustomer);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-sm font-medium text-neutral-900">
          {existing ? "Edit customer" : "Add frequent customer"}
        </h2>
        <div className="space-y-3">
          {[
            { label: "Full name *", value: name, set: setName, placeholder: "e.g. Bonison" },
            {
              label: "Phone *",
              value: phone,
              set: (v: string) => setPhone(v.replace(/\D/g, "").slice(0, 10)),
              placeholder: "10 digit number",
            },
            {
              label: "Address *",
              value: address,
              set: setAddress,
              placeholder: "Street / locality",
            },
            {
              label: "City / state",
              value: cityState,
              set: setCityState,
              placeholder: "Imphal, Manipur",
            },
            {
              label: "Pincode",
              value: pincode,
              set: (v: string) => setPincode(v.replace(/\D/g, "").slice(0, 6)),
              placeholder: "795103",
            },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label} className="space-y-1">
              <Label className="text-xs text-neutral-500">{label}</Label>
              <Input
                className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60"
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={save}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : existing ? "Save changes" : "Add customer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Record Payment Modal
// ---------------------------------------------------------------------------

function RecordPaymentModal({
  customer,
  outstanding,
  onClose,
  onRecorded,
}: {
  customer: CargoCustomer;
  outstanding: number;
  onClose: () => void;
  onRecorded: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amt > outstanding) {
      toast.error(`Amount exceeds outstanding balance (₹${outstanding.toFixed(2)})`);
      return;
    }
    setSaving(true);

    // Insert payment record
    const { error: payErr } = await supabase.from("cargo_payments").insert({
      customer_id: customer.id,
      booking_id: null,
      amount: amt,
      note: note || "Manual payment",
    });
    if (payErr) {
      toast.error(payErr.message);
      setSaving(false);
      return;
    }

    // Distribute payment across unpaid/partial bookings (oldest first)
    const { data: unpaidBookings } = await supabase
      .from("cargo_bookings")
      .select("id, estimate_charge, final_charge, amount_paid, payment_status")
      .eq("customer_id", customer.id)
      .in("payment_status", ["unpaid", "partial"])
      .order("created_at", { ascending: true });

    let remaining = amt;
    for (const b of (unpaidBookings as Booking[]) ?? []) {
      if (remaining <= 0) break;
      const total = effectiveCharge(b);
      const alreadyPaid = b.amount_paid ?? 0;
      const due = total - alreadyPaid;
      const applying = Math.min(remaining, due);
      const newPaid = alreadyPaid + applying;
      const newStatus: Booking["payment_status"] =
        newPaid >= total ? "paid" : newPaid > 0 ? "partial" : "unpaid";

      await supabase
        .from("cargo_bookings")
        .update({ amount_paid: newPaid, payment_status: newStatus })
        .eq("id", b.id);

      remaining -= applying;
    }

    toast.success(`₹${amt.toFixed(2)} payment recorded for ${customer.name}`);
    onRecorded();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-sm font-medium text-neutral-900">Record payment</h2>
        <p className="mb-4 text-xs text-neutral-500">
          {customer.name} · Outstanding:{" "}
          <span className="font-medium text-red-600">₹{outstanding.toFixed(2)}</span>
        </p>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-neutral-500">Amount received (₹) *</Label>
            <Input
              className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder={`Up to ₹${outstanding.toFixed(2)}`}
              inputMode="decimal"
              autoFocus
            />
            {amount && parseFloat(amount) > 0 && (
              <p className="text-xs text-neutral-400">
                Remaining after this: ₹
                {Math.max(0, outstanding - parseFloat(amount)).toFixed(2)}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-neutral-500">Note (optional)</Label>
            <Input
              className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Cash, UPI, bank transfer…"
            />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={save}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm payment"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Customer Detail Panel
// ---------------------------------------------------------------------------

function CustomerDetail({
  customer,
  onBack,
  onRefresh,
}: {
  customer: CargoCustomer;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: bData }, { data: pData }] = await Promise.all([
      supabase
        .from("cargo_bookings")
        .select(
          "id,tracking_id,product_name,estimate_charge,final_charge,payment_status,amount_paid,status,created_at"
        )
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("cargo_payments")
        .select("*")
        .eq("customer_id", customer.id)
        .order("paid_at", { ascending: false }),
    ]);
    setBookings((bData as Booking[]) ?? []);
    setPayments((pData as Payment[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [customer.id]);

  const totalBilled = bookings.reduce((s, b) => s + effectiveCharge(b), 0);
  const totalPaid = bookings.reduce((s, b) => s + (b.amount_paid ?? 0), 0);
  const outstanding = Math.max(0, totalBilled - totalPaid);

  return (
    <>
      {showPayModal && (
        <RecordPaymentModal
          customer={customer}
          outstanding={outstanding}
          onClose={() => setShowPayModal(false)}
          onRecorded={() => {
            setShowPayModal(false);
            load();
            onRefresh();
          }}
        />
      )}

      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <button
                onClick={onBack}
                className="mb-2 flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All customers
              </button>
              <h1 className="text-lg font-medium text-neutral-900">{customer.name}</h1>
              <p className="text-sm text-neutral-500">
                {customer.phone} · {customer.address}
                {customer.city_state ? `, ${customer.city_state}` : ""}
              </p>
            </div>
            {outstanding > 0 && (
              <Button
                onClick={() => setShowPayModal(true)}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <CreditCard className="mr-1.5 h-4 w-4" />
                Record payment
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500">Total billed</p>
              <p className="mt-1 text-xl font-semibold text-neutral-900">₹{totalBilled.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500">Total paid</p>
              <p className="mt-1 text-xl font-semibold text-emerald-700">₹{totalPaid.toFixed(2)}</p>
            </div>
            <div
              className={`rounded-lg border p-4 ${
                outstanding > 0
                  ? "border-red-200 bg-red-50"
                  : "border-neutral-200"
              }`}
            >
              <p className="text-xs text-neutral-500">Outstanding</p>
              <p
                className={`mt-1 text-xl font-semibold ${
                  outstanding > 0 ? "text-red-600" : "text-neutral-900"
                }`}
              >
                ₹{outstanding.toFixed(2)}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12 text-neutral-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bookings */}
              <div>
                <h2 className="mb-3 text-sm font-medium text-neutral-700">
                  Bookings ({bookings.length})
                </h2>
                <div className="overflow-x-auto rounded-lg border border-neutral-200">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-emerald-100 bg-emerald-50/50">
                        <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Tracking</th>
                        <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Product</th>
                        <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Status</th>
                        <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Charge</th>
                        <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Paid</th>
                        <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Due</th>
                        <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Payment</th>
                        <th className="px-4 py-2.5 text-left font-medium text-emerald-800">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-neutral-400">
                            No bookings yet
                          </td>
                        </tr>
                      ) : (
                        bookings.map((b) => {
                          const charge = effectiveCharge(b);
                          const due = Math.max(0, charge - (b.amount_paid ?? 0));
                          return (
                            <tr
                              key={b.id}
                              className="border-b border-neutral-100 last:border-0 hover:bg-emerald-50/30"
                            >
                              <td className="px-4 py-2.5 font-mono text-xs text-neutral-700">
                                {b.tracking_id}
                              </td>
                              <td className="px-4 py-2.5 text-neutral-700">{b.product_name}</td>
                              <td className="px-4 py-2.5">
                                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                                  {b.status}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-neutral-700">₹{charge.toFixed(2)}</td>
                              <td className="px-4 py-2.5 text-emerald-700">
                                ₹{(b.amount_paid ?? 0).toFixed(2)}
                              </td>
                              <td
                                className={`px-4 py-2.5 font-medium ${
                                  due > 0 ? "text-red-600" : "text-neutral-400"
                                }`}
                              >
                                {due > 0 ? `₹${due.toFixed(2)}` : "—"}
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                    PAYMENT_BADGE[b.payment_status] ?? "bg-neutral-100 text-neutral-600"
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
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment history */}
              {payments.length > 0 && (
                <div>
                  <h2 className="mb-3 text-sm font-medium text-neutral-700">
                    Payment history ({payments.length})
                  </h2>
                  <div className="overflow-x-auto rounded-lg border border-neutral-200">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50">
                          <th className="px-4 py-2.5 text-left font-medium text-neutral-500">Amount</th>
                          <th className="px-4 py-2.5 text-left font-medium text-neutral-500">Note</th>
                          <th className="px-4 py-2.5 text-left font-medium text-neutral-500">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                          >
                            <td className="px-4 py-2.5 font-medium text-emerald-700">
                              ₹{Number(p.amount).toFixed(2)}
                            </td>
                            <td className="px-4 py-2.5 text-neutral-600">{p.note || "—"}</td>
                            <td className="px-4 py-2.5 text-neutral-500">
                              {new Date(p.paid_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Customer List
// ---------------------------------------------------------------------------

export default function CargoCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<CargoCustomer | undefined>();
  const [selected, setSelected] = useState<CargoCustomer | null>(null);
  const [filter, setFilter] = useState<"all" | "outstanding" | "clear">("all");

  const load = async () => {
    setLoading(true);
    const { data: cData, error } = await supabase
      .from("cargo_customers")
      .select("*")
      .order("name");
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const { data: bData } = await supabase
      .from("cargo_bookings")
      .select("customer_id,estimate_charge,final_charge,amount_paid,payment_status")
      .not("customer_id", "is", null);

    type BookingStat = {
      customer_id: string;
      estimate_charge: number;
      final_charge: number | null;
      amount_paid: number;
      payment_status: string;
    };

    const bookingMap = new Map<
      string,
      { total_billed: number; total_paid: number; count: number }
    >();
    for (const b of (bData ?? []) as BookingStat[]) {
      if (!b.customer_id) continue;
      const cur = bookingMap.get(b.customer_id) ?? { total_billed: 0, total_paid: 0, count: 0 };
      const charge = b.final_charge ?? b.estimate_charge;
      cur.total_billed += charge;
      cur.total_paid += b.amount_paid ?? 0;
      cur.count += 1;
      bookingMap.set(b.customer_id, cur);
    }

    const enriched: CustomerWithStats[] = (cData as CargoCustomer[]).map((c) => {
      const stats = bookingMap.get(c.id) ?? { total_billed: 0, total_paid: 0, count: 0 };
      return {
        ...c,
        total_billed: stats.total_billed,
        total_paid: stats.total_paid,
        outstanding: Math.max(0, stats.total_billed - stats.total_paid),
        booking_count: stats.count,
      };
    });

    setCustomers(enriched);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let rows = [...customers];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
      );
    }
    if (filter === "outstanding") rows = rows.filter((c) => c.outstanding > 0);
    if (filter === "clear") rows = rows.filter((c) => c.outstanding === 0);
    return rows;
  }, [customers, search, filter]);

  const totalOutstanding = customers.reduce((s, c) => s + c.outstanding, 0);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This won't delete their bookings.`)) return;
    const { error } = await supabase.from("cargo_customers").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Customer removed");
      load();
    }
  };

  if (selected) {
    return (
      <CustomerDetail
        customer={selected}
        onBack={() => setSelected(null)}
        onRefresh={load}
      />
    );
  }

  return (
    <>
      {(showModal || editCustomer) && (
        <CustomerModal
          existing={editCustomer}
          onClose={() => {
            setShowModal(false);
            setEditCustomer(undefined);
          }}
          onSaved={(c) => {
            setShowModal(false);
            setEditCustomer(undefined);
            load();
          }}
        />
      )}

      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <button
                onClick={() => router.push("/admin/cargo")}
                className="mb-2 flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to bookings
              </button>
              <h1 className="text-lg font-medium text-neutral-900">Frequent customers</h1>
              <p className="text-sm text-neutral-500">
                {customers.length} customers · Total outstanding:{" "}
                <span className={totalOutstanding > 0 ? "font-medium text-red-600" : "text-neutral-500"}>
                  ₹{totalOutstanding.toFixed(2)}
                </span>
              </p>
            </div>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add customer
            </Button>
          </div>

          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500">Total customers</p>
              <p className="mt-1 text-2xl font-semibold text-neutral-900">{customers.length}</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-xs text-neutral-500">With outstanding dues</p>
              <p className="mt-1 text-2xl font-semibold text-red-600">
                {customers.filter((c) => c.outstanding > 0).length}
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-xs text-neutral-500">Total outstanding</p>
              <p className="mt-1 text-2xl font-semibold text-red-600">
                ₹{totalOutstanding.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or phone"
                className="bg-white pl-8 text-neutral-900 placeholder:text-neutral-400 border-neutral-300"
              />
            </div>
            {(["all", "outstanding", "clear"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg border px-3 py-1.5 text-sm capitalize transition ${
                  filter === f
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                {f === "outstanding" ? "Has dues" : f === "clear" ? "All paid" : "All"}
              </button>
            ))}
          </div>

          {/* Customer list */}
          {loading ? (
            <div className="flex justify-center py-16 text-neutral-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-neutral-400">
              No customers found.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 hover:border-emerald-200 hover:bg-emerald-50/30 transition cursor-pointer"
                  onClick={() => setSelected(c)}
                >
                  {/* Avatar */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
                    {c.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900">{c.name}</p>
                    <p className="text-xs text-neutral-500">
                      {c.phone}
                      {c.city_state ? ` · ${c.city_state}` : ""}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-xs text-neutral-400">Bookings</p>
                      <p className="font-medium text-neutral-700">{c.booking_count}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-neutral-400">Billed</p>
                      <p className="font-medium text-neutral-700">₹{c.total_billed.toFixed(0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-neutral-400">Outstanding</p>
                      <p
                        className={`font-semibold ${
                          c.outstanding > 0 ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {c.outstanding > 0 ? `₹${c.outstanding.toFixed(0)}` : "✓ Clear"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setEditCustomer(c)}
                      className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}