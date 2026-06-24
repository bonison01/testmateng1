//app/(main)/admin/cargo/bookingPage/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PackageCheck,
  Camera,
  X,
  Loader2,
  List,
  UserPlus,
  User,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// NOTE: no Supabase client here anymore. cargo_customers, cargo_bookings,
// and cargo_payments are all locked down via RLS (service-role only),
// and the storage bucket no longer has public policies either. Every
// read/write below goes through /api/admin/cargo/* routes instead.

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
}

interface CargoFormData {
  customer_id: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  sender_city_state: string;
  sender_pincode: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  receiver_city_state: string;
  receiver_pincode: string;
  product_name: string;
  weight_estimate: string;
  delivery_mode: "standard" | "express" | "";
  pickup_required: boolean;
  delivery_required: boolean;
  notes: string;
  status: "Pending" | "Out for Delivery" | "Delivered";
  third_party_tracking: string;
  handling_charge: string;
  docket_charge: string;
  pickup_charge: string;
  packaging_charge: string;
  extra_mile_delivery: string;
  estimate_charge: string;
  final_charge: string;
  payment_status: "paid" | "unpaid" | "partial";
  amount_paid: string;
}

const emptyForm: CargoFormData = {
  customer_id: "",
  sender_name: "",
  sender_phone: "",
  sender_address: "",
  sender_city_state: "",
  sender_pincode: "",
  receiver_name: "",
  receiver_phone: "",
  receiver_address: "",
  receiver_city_state: "",
  receiver_pincode: "",
  product_name: "",
  weight_estimate: "",
  delivery_mode: "",
  pickup_required: false,
  delivery_required: false,
  notes: "",
  status: "Pending",
  third_party_tracking: "",
  handling_charge: "",
  docket_charge: "",
  pickup_charge: "",
  packaging_charge: "",
  extra_mile_delivery: "",
  estimate_charge: "",
  final_charge: "",
  payment_status: "unpaid",
  amount_paid: "",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateTrackingId() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `SBX-${rand}`;
}

function sumCharges(data: CargoFormData) {
  return [
    data.handling_charge,
    data.docket_charge,
    data.pickup_charge,
    data.packaging_charge,
    data.extra_mile_delivery,
    data.estimate_charge,
  ].reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

const Field = ({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`space-y-1.5 ${className ?? ""}`}>
    <Label className="text-xs font-medium text-neutral-500">
      {label}
      {required && <span className="ml-0.5 text-emerald-600">*</span>}
    </Label>
    {children}
  </div>
);

const PartyCard = ({
  title,
  prefix,
  form,
  errors,
  update,
}: {
  title: string;
  prefix: "sender" | "receiver";
  form: CargoFormData;
  errors: Partial<Record<keyof CargoFormData, string>>;
  update: <K extends keyof CargoFormData>(key: K, value: CargoFormData[K]) => void;
}) => {
  const name = `${prefix}_name` as const;
  const phone = `${prefix}_phone` as const;
  const address = `${prefix}_address` as const;
  const cityState = `${prefix}_city_state` as const;
  const pincode = `${prefix}_pincode` as const;

  return (
    <div className="rounded-lg border border-neutral-200 border-t-2 border-t-emerald-500 p-4">
      <h3 className="mb-4 text-sm font-medium text-neutral-900">{title}</h3>
      <div className="space-y-4">
        <Field label="Full name" required>
          <Input
            className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
            value={form[name]}
            onChange={(e) => update(name, e.target.value as never)}
            placeholder="e.g. Bonison"
            aria-invalid={!!errors[name]}
          />
          {errors[name] && <p className="text-xs text-red-600">{errors[name]}</p>}
        </Field>
        <Field label="Phone number" required>
          <Input
            className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
            value={form[phone]}
            onChange={(e) =>
              update(phone, e.target.value.replace(/\D/g, "").slice(0, 10) as never)
            }
            placeholder="10 digit mobile number"
            inputMode="numeric"
            aria-invalid={!!errors[phone]}
          />
          {errors[phone] && <p className="text-xs text-red-600">{errors[phone]}</p>}
        </Field>
        <Field label="Address" required>
          <Textarea
            className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
            value={form[address]}
            onChange={(e) => update(address, e.target.value as never)}
            placeholder="House / street / locality"
            rows={2}
            aria-invalid={!!errors[address]}
          />
          {errors[address] && <p className="text-xs text-red-600">{errors[address]}</p>}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City / state">
            <Input
              className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
              value={form[cityState]}
              onChange={(e) => update(cityState, e.target.value as never)}
              placeholder="e.g. Imphal, Manipur"
            />
          </Field>
          <Field label="Pincode" required>
            <Input
              className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
              value={form[pincode]}
              onChange={(e) =>
                update(pincode, e.target.value.replace(/\D/g, "").slice(0, 6) as never)
              }
              placeholder="795103"
              inputMode="numeric"
              aria-invalid={!!errors[pincode]}
            />
            {errors[pincode] && <p className="text-xs text-red-600">{errors[pincode]}</p>}
          </Field>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Save-customer modal
// ---------------------------------------------------------------------------

function SaveCustomerModal({
  form,
  onClose,
  onSaved,
}: {
  form: CargoFormData;
  onClose: () => void;
  onSaved: (customer: CargoCustomer) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [which, setWhich] = useState<"sender" | "receiver">("sender");

  const save = async () => {
    setSaving(true);
    const data =
      which === "sender"
        ? {
            name: form.sender_name,
            phone: form.sender_phone,
            address: form.sender_address,
            city_state: form.sender_city_state,
            pincode: form.sender_pincode,
          }
        : {
            name: form.receiver_name,
            phone: form.receiver_phone,
            address: form.receiver_address,
            city_state: form.receiver_city_state,
            pincode: form.receiver_pincode,
          };

    try {
      const res = await fetch("/api/admin/cargo/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Could not save customer");
      toast.success(`${json.data.name} saved as frequent customer`);
      onSaved(json.data as CargoCustomer);
    } catch (err: any) {
      toast.error(err.message || "Could not save customer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-sm font-medium text-neutral-900">Save as frequent customer</h2>
        <p className="mb-4 text-xs text-neutral-500">
          Choose whose details to save. You can do this for both — save one, reopen to save the
          other.
        </p>
        <div className="mb-4 flex gap-3">
          {(["sender", "receiver"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setWhich(opt)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition ${
                which === opt
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="mb-4 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600 space-y-1">
          <p className="font-medium text-neutral-800">
            {which === "sender" ? form.sender_name : form.receiver_name}
          </p>
          <p>{which === "sender" ? form.sender_phone : form.receiver_phone}</p>
          <p>{which === "sender" ? form.sender_address : form.receiver_address}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={save}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save customer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CargoBookingForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<CargoFormData>(emptyForm);
  const [trackingId, setTrackingId] = useState(generateTrackingId);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CargoFormData, string>>>({});

  const [customers, setCustomers] = useState<CargoCustomer[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Load frequent customers via the server route.
  useEffect(() => {
    fetch("/api/admin/cargo/customers")
      .then((res) => res.json())
      .then((json) => setCustomers((json.data as CargoCustomer[]) ?? []))
      .catch((err) => console.error("Customers fetch error:", err));
  }, []);

  const update = <K extends keyof CargoFormData>(key: K, value: CargoFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === "__none__") {
      update("customer_id", "");
      return;
    }
    const c = customers.find((c) => c.id === customerId);
    if (!c) return;
    setForm((prev) => ({
      ...prev,
      customer_id: customerId,
      sender_name: c.name,
      sender_phone: c.phone,
      sender_address: c.address,
      sender_city_state: c.city_state ?? "",
      sender_pincode: c.pincode ?? "",
    }));
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const validate = () => {
    const next: Partial<Record<keyof CargoFormData, string>> = {};
    if (!form.sender_name.trim()) next.sender_name = "Required";
    if (!/^\d{10}$/.test(form.sender_phone)) next.sender_phone = "10 digit number";
    if (!form.sender_address.trim()) next.sender_address = "Required";
    if (!/^\d{6}$/.test(form.sender_pincode)) next.sender_pincode = "6 digit pincode";
    if (!form.receiver_name.trim()) next.receiver_name = "Required";
    if (!/^\d{10}$/.test(form.receiver_phone)) next.receiver_phone = "10 digit number";
    if (!form.receiver_address.trim()) next.receiver_address = "Required";
    if (!/^\d{6}$/.test(form.receiver_pincode)) next.receiver_pincode = "6 digit pincode";
    if (!form.product_name.trim()) next.product_name = "Required";
    if (!form.weight_estimate || parseFloat(form.weight_estimate) <= 0)
      next.weight_estimate = "Enter a weight";
    if (!form.delivery_mode) next.delivery_mode = "Choose a mode";
    if (!form.estimate_charge || parseFloat(form.estimate_charge) <= 0)
      next.estimate_charge = "Enter an estimate";
    if (
      form.payment_status === "partial" &&
      (!form.amount_paid || parseFloat(form.amount_paid) <= 0)
    ) {
      next.amount_paid = "Enter amount paid";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Check the highlighted fields before booking.");
      return;
    }
    setSubmitting(true);
    try {
      const amountPaid =
        form.payment_status === "paid"
          ? sumCharges(form)
          : form.payment_status === "partial"
          ? parseFloat(form.amount_paid) || 0
          : 0;

      const payload = {
        customer_id: form.customer_id || null,
        sender_name: form.sender_name,
        sender_phone: form.sender_phone,
        sender_address: form.sender_address,
        sender_city_state: form.sender_city_state,
        sender_pincode: form.sender_pincode,
        receiver_name: form.receiver_name,
        receiver_phone: form.receiver_phone,
        receiver_address: form.receiver_address,
        receiver_city_state: form.receiver_city_state,
        receiver_pincode: form.receiver_pincode,
        product_name: form.product_name,
        delivery_mode: form.delivery_mode,
        pickup_required: form.pickup_required,
        delivery_required: form.delivery_required,
        notes: form.notes,
        status: form.status,
        third_party_tracking: form.third_party_tracking,
        tracking_id: trackingId,
        weight_estimate: parseFloat(form.weight_estimate),
        handling_charge: form.handling_charge ? parseFloat(form.handling_charge) : null,
        docket_charge: form.docket_charge ? parseFloat(form.docket_charge) : null,
        pickup_charge: form.pickup_charge ? parseFloat(form.pickup_charge) : null,
        packaging_charge: form.packaging_charge ? parseFloat(form.packaging_charge) : null,
        extra_mile_delivery: form.extra_mile_delivery
          ? parseFloat(form.extra_mile_delivery)
          : null,
        estimate_charge: parseFloat(form.estimate_charge),
        final_charge: form.final_charge ? parseFloat(form.final_charge) : null,
        payment_status: form.payment_status,
        amount_paid: amountPaid,
      };

      // multipart/form-data so the photo (if any) travels alongside the
      // JSON payload in one request to the server route.
      const fd = new FormData();
      fd.append("payload", JSON.stringify(payload));
      if (photoFile) fd.append("photo", photoFile);

      const res = await fetch("/api/admin/cargo/bookings", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Could not create booking");

      toast.success(`Booking ${trackingId} created`);
      setForm(emptyForm);
      removePhoto();
      setTrackingId(generateTrackingId());
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Could not create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const total = sumCharges(form);

  return (
    <>
      {showSaveModal && (
        <SaveCustomerModal
          form={form}
          onClose={() => setShowSaveModal(false)}
          onSaved={(c) => {
            setCustomers((prev) => [...prev, c].sort((a, b) => a.name.localeCompare(b.name)));
            setShowSaveModal(false);
          }}
        />
      )}

      <div className="min-h-screen bg-white">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl px-4 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium text-neutral-900">New booking</h1>
              <p className="text-sm text-neutral-500">Enter shipper and consignee details</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/cargo")}
                className="border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
              >
                <List className="mr-1.5 h-4 w-4" />
                View bookings
              </Button>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wide text-neutral-400">Tracking ID</p>
                <p className="font-mono text-sm font-medium text-emerald-700">{trackingId}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Frequent customer selector */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                  <User className="h-4 w-4 text-emerald-600" />
                  Frequent customer
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveModal(true)}
                  className="h-7 border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 text-xs"
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Save current as customer
                </Button>
              </div>
              <Select
                value={form.customer_id || "__none__"}
                onValueChange={handleCustomerSelect}
              >
                <SelectTrigger className="bg-white text-neutral-900 border-neutral-300">
                  <SelectValue placeholder="Select a frequent customer (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-white text-neutral-900">
                  <SelectItem value="__none__">— No frequent customer —</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} · {c.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.customer_id && (
                <p className="mt-2 text-xs text-emerald-600">
                  ✓ Sender fields auto-filled from customer record. This booking will appear in their
                  account ledger.
                </p>
              )}
            </div>

            {/* Sender + Receiver */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PartyCard
                title="Sender"
                prefix="sender"
                form={form}
                errors={errors}
                update={update}
              />
              <PartyCard
                title="Receiver"
                prefix="receiver"
                form={form}
                errors={errors}
                update={update}
              />
            </div>

            {/* Package */}
            <div className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-900">
                <PackageCheck className="h-4 w-4 text-emerald-600" />
                Package & delivery
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Product name" required>
                  <Input
                    className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
                    value={form.product_name}
                    onChange={(e) => update("product_name", e.target.value)}
                    placeholder="e.g. Clothes"
                    aria-invalid={!!errors.product_name}
                  />
                  {errors.product_name && (
                    <p className="text-xs text-red-600">{errors.product_name}</p>
                  )}
                </Field>
                <Field label="Weight estimate (kg)" required>
                  <Input
                    className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
                    value={form.weight_estimate}
                    onChange={(e) =>
                      update("weight_estimate", e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    placeholder="10"
                    inputMode="decimal"
                    aria-invalid={!!errors.weight_estimate}
                  />
                  {errors.weight_estimate && (
                    <p className="text-xs text-red-600">{errors.weight_estimate}</p>
                  )}
                </Field>
                <Field label="Delivery mode" required>
                  <Select
                    value={form.delivery_mode}
                    onValueChange={(v) =>
                      update("delivery_mode", v as CargoFormData["delivery_mode"])
                    }
                  >
                    <SelectTrigger
                      className="bg-white text-neutral-900 border-neutral-300"
                      aria-invalid={!!errors.delivery_mode}
                    >
                      <SelectValue placeholder="Choose mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-neutral-900">
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.delivery_mode && (
                    <p className="text-xs text-red-600">{errors.delivery_mode}</p>
                  )}
                </Field>
                <Field label="Current status">
                  <Select
                    value={form.status}
                    onValueChange={(v) => update("status", v as CargoFormData["status"])}
                  >
                    <SelectTrigger className="bg-white text-neutral-900 border-neutral-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-neutral-900">
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Out for Delivery">Out for delivery</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <div className="flex items-center gap-6 sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                      checked={form.pickup_required}
                      onChange={(e) => update("pickup_required", e.target.checked)}
                    />
                    Pickup required
                  </label>
                  <label className="flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                      checked={form.delivery_required}
                      onChange={(e) => update("delivery_required", e.target.checked)}
                    />
                    Delivery required
                  </label>
                </div>

                <Field label="Third-party tracking (optional)">
                  <Input
                    className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
                    value={form.third_party_tracking}
                    onChange={(e) => update("third_party_tracking", e.target.value)}
                    placeholder="Courier partner AWB number"
                  />
                </Field>

                <Field label="Package photo">
                  {!photoPreview ? (
                    <label className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 text-xs text-neutral-500 hover:border-emerald-400 hover:text-emerald-700">
                      <Camera className="h-3.5 w-3.5" />
                      Upload photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhoto}
                      />
                    </label>
                  ) : (
                    <div className="relative h-9 w-9 overflow-hidden rounded-md border border-neutral-200">
                      <img
                        src={photoPreview}
                        alt="Package preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -right-1 -top-1 rounded-full bg-neutral-900/80 p-0.5 text-white"
                        aria-label="Remove photo"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )}
                </Field>

                <Field label="Notes" className="sm:col-span-2">
                  <Textarea
                    className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Fragile, handle with care, etc."
                    rows={2}
                  />
                </Field>
              </div>
            </div>

            {/* Charges */}
            <div className="rounded-lg border border-neutral-200 p-4">
              <h3 className="mb-4 text-sm font-medium text-neutral-900">Charges</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Field label="Freight charge" required>
                  <Input
                    className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
                    value={form.estimate_charge}
                    onChange={(e) =>
                      update("estimate_charge", e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    placeholder="100"
                    inputMode="decimal"
                    aria-invalid={!!errors.estimate_charge}
                  />
                  {errors.estimate_charge && (
                    <p className="text-xs text-red-600">{errors.estimate_charge}</p>
                  )}
                </Field>
                <Field label="Handling charge">
                  <Input
                    className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
                    value={form.handling_charge}
                    onChange={(e) =>
                      update("handling_charge", e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    placeholder="0"
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Docket charge">
                  <Input
                    className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
                    value={form.docket_charge}
                    onChange={(e) =>
                      update("docket_charge", e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    placeholder="0"
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Pickup charge">
                  <Input
                    className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
                    value={form.pickup_charge}
                    onChange={(e) =>
                      update("pickup_charge", e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    placeholder="0"
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Packaging charge">
                  <Input
                    className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
                    value={form.packaging_charge}
                    onChange={(e) =>
                      update("packaging_charge", e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    placeholder="0"
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Extra mile delivery">
                  <Input
                    className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
                    value={form.extra_mile_delivery}
                    onChange={(e) =>
                      update("extra_mile_delivery", e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    placeholder="0"
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Final charge (optional)">
                  <Input
                    className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
                    value={form.final_charge}
                    onChange={(e) =>
                      update("final_charge", e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    placeholder="Settled after delivery"
                    inputMode="decimal"
                  />
                </Field>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-md bg-emerald-50 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                  Charges total
                </span>
                <span className="font-mono text-base font-medium text-emerald-800">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment status */}
            <div className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-900">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                Payment
              </div>
              <div className="flex flex-wrap gap-3">
                {(["paid", "unpaid", "partial"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => update("payment_status", opt)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition ${
                      form.payment_status === opt
                        ? opt === "paid"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : opt === "unpaid"
                          ? "border-red-400 bg-red-50 text-red-700"
                          : "border-amber-400 bg-amber-50 text-amber-700"
                        : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                    }`}
                  >
                    {opt === "paid" ? "✓ Paid" : opt === "unpaid" ? "✗ Unpaid" : "~ Partial"}
                  </button>
                ))}
              </div>

              {form.payment_status === "partial" && (
                <div className="mt-4 max-w-xs">
                  <Field label="Amount paid now" required>
                    <Input
                      className="bg-white text-neutral-900 placeholder:text-neutral-400 placeholder:opacity-60 border-neutral-300"
                      value={form.amount_paid}
                      onChange={(e) =>
                        update("amount_paid", e.target.value.replace(/[^0-9.]/g, ""))
                      }
                      placeholder="e.g. 500"
                      inputMode="decimal"
                      aria-invalid={!!errors.amount_paid}
                    />
                    {errors.amount_paid && (
                      <p className="text-xs text-red-600">{errors.amount_paid}</p>
                    )}
                    {form.amount_paid && total > 0 && (
                      <p className="mt-1 text-xs text-neutral-500">
                        Remaining: ₹{Math.max(0, total - parseFloat(form.amount_paid)).toFixed(2)}
                      </p>
                    )}
                  </Field>
                </div>
              )}

              {form.payment_status === "unpaid" && !form.customer_id && (
                <p className="mt-3 text-xs text-amber-600">
                  Tip: link a frequent customer so this unpaid amount appears in their ledger.
                </p>
              )}
              {form.payment_status === "unpaid" && form.customer_id && (
                <p className="mt-3 text-xs text-neutral-500">
                  ₹{total.toFixed(2)} will be recorded as outstanding for this customer.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <p className="mr-auto text-xs text-neutral-400">* required fields</p>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Confirm booking"
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}