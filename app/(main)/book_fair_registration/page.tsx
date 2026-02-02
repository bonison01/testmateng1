"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import QRCode from "react-qr-code";

const FEES: Record<string, number> = {
  Painting: 100,
  Debate: 150,
  Spelling: 100,
  Quiz: 300,
};

export default function BookFairRegistrationPage() {
  const [formData, setFormData] = useState({
    participant_name: "",
    age: "",
    student_class: "",
    institution_name: "",
    phone: "",
    address: "",
    competition: "",
    participation_type: "Individual",
    team_member_name: "",
    team_member_details: "",
  });

  const [registrationNo, setRegistrationNo] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("pending_verification");

  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const amount = FEES[formData.competition] || 0;

  const upiLink =
    amount > 0
      ? `upi://pay?pa=khumbongmayumbonison@icici&pn=BookFair2026&am=${amount}&cu=INR&tn=${formData.competition}-Registration`
      : "";

  const generateRegNo = () =>
    `BF-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  /* =======================
     UPLOAD PAYMENT SCREENSHOT
     ======================= */
  const uploadScreenshot = async () => {
    if (!screenshot) {
      alert("Please select a payment screenshot");
      return;
    }

    try {
      setLoading(true);

      const ext = screenshot.name.split(".").pop();
      const fileName = `payment-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("payment-screenshots")
        .upload(fileName, screenshot, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("payment-screenshots")
        .getPublicUrl(fileName);

      setScreenshotUrl(data.publicUrl);
      alert("✅ Screenshot uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Screenshot upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     SUBMIT REGISTRATION
     ======================= */
  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!screenshotUrl) {
      alert("Please upload payment screenshot before registering");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const { data: existing } = await supabase
        .from("book_fair_registrations")
        .select("id")
        .eq("phone", formData.phone)
        .single();

      if (existing) {
        alert("This phone number is already registered.");
        setLoading(false);
        return;
      }

      const regNo = generateRegNo();

      const { error } = await supabase
        .from("book_fair_registrations")
        .insert([
          {
            participant_name: formData.participant_name,
            age: formData.age,
            student_class: formData.student_class,
            institution_name: formData.institution_name,
            phone: formData.phone,
            address: formData.address,
            competition: formData.competition,
            participation_type: formData.participation_type,
            team_member_name: formData.team_member_name,
            team_member_details: formData.team_member_details,
            registration_no: regNo,
            amount,
            payment_status: "pending_verification",
            payment_screenshot_url: screenshotUrl,
          },
        ]);

      if (error) throw error;

      setRegistrationNo(regNo);
      setShowPopup(true);
    } catch (err) {
      console.error(err);
      setErrorMsg("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     REAL-TIME PAYMENT STATUS
     ======================= */
  useEffect(() => {
    if (!registrationNo) return;

    const channel = supabase
      .channel("payment-status-listener")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "book_fair_registrations",
          filter: `registration_no=eq.${registrationNo}`,
        },
        (payload) => {
          setPaymentStatus(payload.new.payment_status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [registrationNo]);

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* HEADER */}
      <div className="bg-green-700 text-white py-8 text-center">
        <h1 className="text-3xl font-bold">
          📚 Book Fair Competition Registration 2026
        </h1>
        <p className="text-green-100 mt-1">
          Open for Students (Class 6 – 10)
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">

        {/* LEFT — FORM */}
        {!registrationNo && (
          <form
            onSubmit={submitForm}
            className="bg-white p-6 rounded-xl shadow space-y-4"
          >
            <h2 className="text-xl font-semibold text-green-700">
              📝 Registration Form
            </h2>

            <input name="participant_name" required placeholder="Participant Name"
              value={formData.participant_name} onChange={handleChange}
              className="w-full p-3 border rounded" />

            <input type="number" name="age" required placeholder="Age"
              value={formData.age} onChange={handleChange}
              className="w-full p-3 border rounded" />

            <input name="student_class" required placeholder="Class (e.g. Class 7)"
              value={formData.student_class} onChange={handleChange}
              className="w-full p-3 border rounded" />

            <input name="institution_name" required placeholder="School / Institution Name"
              value={formData.institution_name} onChange={handleChange}
              className="w-full p-3 border rounded" />

            <input name="phone" required placeholder="Contact Number"
              value={formData.phone} onChange={handleChange}
              className="w-full p-3 border rounded" />

            <textarea name="address" required placeholder="Address"
              value={formData.address} onChange={handleChange}
              className="w-full p-3 border rounded" />

            <select name="competition" required value={formData.competition}
              onChange={handleChange} className="w-full p-3 border rounded">
              <option value="">Select Competition</option>
              <option value="Painting">🎨 Painting – ₹100</option>
              <option value="Debate">🎤 Debate – ₹150</option>
              <option value="Spelling">🔤 Spelling – ₹100</option>
              <option value="Quiz">🧠 Quiz – ₹300</option>
            </select>

            <button
              type="submit"
              disabled={!screenshotUrl || loading}
              className={`w-full py-3 rounded font-semibold text-white ${
                screenshotUrl
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Submitting..." : "Submit Registration"}
            </button>

            {errorMsg && (
              <p className="text-red-600 text-sm text-center">{errorMsg}</p>
            )}
          </form>
        )}

        {/* RIGHT — PAYMENT */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-green-700 mb-2">💳 Payment</h3>

          {formData.competition ? (
            <>
              <p><b>Amount:</b> ₹{amount}</p>

              <div className="flex justify-center my-4 bg-gray-100 p-4 rounded">
                <QRCode value={upiLink} size={180} />
              </div>

              {/* Modern upload UI */}
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-green-500 rounded-xl p-5 text-center hover:bg-green-50 transition">
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setScreenshot(file);
                      setPreview(URL.createObjectURL(file));
                    }}
                  />

                  {!preview ? (
                    <div>
                      <p className="text-green-700 font-medium">
                        📸 Click to upload payment screenshot
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG (max 5MB)
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={preview}
                        className="w-full h-40 object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setScreenshot(null);
                          setPreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </label>

              <button
                onClick={uploadScreenshot}
                disabled={loading || !screenshot}
                className={`w-full mt-3 py-2 rounded text-white ${
                  screenshot ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
                }`}
              >
                Upload Payment Screenshot
              </button>

              {screenshotUrl && (
                <p className="text-green-700 text-sm text-center mt-2">
                  ✅ Screenshot uploaded
                </p>
              )}
            </>
          ) : (
            <p>Select a competition to see payment details.</p>
          )}
        </div>
      </div>
    </div>
  );
}