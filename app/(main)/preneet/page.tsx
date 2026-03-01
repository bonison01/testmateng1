"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import QRCode from "react-qr-code";

export default function BookFairRegistrationPage() {
  const REGISTRATION_FEE = 300;

  const [formData, setFormData] = useState({
    candidate_name: "",
    father_name: "",
    mother_name: "",
    dob: "",
    age: "",
    gender: "",
    nationality: "Indian",
    category: "",
    address: "",
    city: "",
    state: "",
    pin_code: "",
    mobile: "",
    alternate_mobile: "",
    email: "",
    qualifying_exam: "",
    passing_year: "",
    school_name_address: "",
  });

  const [registrationNo, setRegistrationNo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= FILE STATES ================= */
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [passportPhotoUrl, setPassportPhotoUrl] = useState<string | null>(null);

  const [signature, setSignature] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  const inputStyle =
    "border border-black p-2 w-full text-black focus:outline-none";
  const labelStyle = "text-sm font-medium text-black mb-1 block";

  const generateRegNo = () =>
    `BF-${Math.floor(100000 + Math.random() * 900000)}`;

  const upiLink = `upi://pay?pa=khumbongmayumbonison@icici&pn=BookFair2026&am=${REGISTRATION_FEE}&cu=INR`;

  /* ================= AGE CALCULATION ================= */
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "dob") {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

      setFormData((prev) => ({
        ...prev,
        dob: value,
        age: age.toString(),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /* ================= FILE UPLOAD FUNCTION ================= */
  const uploadFile = async (
    file: File,
    bucket: string,
    setUrl: any
  ) => {
    const fileName = `${bucket}-${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      alert("Upload failed");
      return false;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    setUrl(data.publicUrl);
    return true;
  };
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const [photoStatus, setPhotoStatus] = useState("");
const [signatureStatus, setSignatureStatus] = useState("");
const [paymentStatusMsg, setPaymentStatusMsg] = useState("");

const uploadFileDirect = async (
  file: File,
  bucket: string,
  setUrl: any,
  setStatus: any
) => {
  if (file.size > MAX_FILE_SIZE) {
    setStatus("❌ File must be under 2MB");
    return;
  }

  setStatus("Uploading...");

  const fileName = `${bucket}-${Date.now()}.${file.name.split(".").pop()}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    setStatus("❌ Upload failed");
    return;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  setUrl(data.publicUrl);
  setStatus("✅ Uploaded Successfully");
};
  /* ================= SUBMIT ================= */
  const submitForm = async (e: any) => {
    e.preventDefault();

    if (!passportPhoto || !signature || !screenshot) {
      alert("Upload Photo, Signature and Payment Proof");
      return;
    }

    if (passportPhoto.size > 51200) {
      alert("Passport photo must be under 50KB");
      return;
    }

    setLoading(true);

    const regNo = generateRegNo();

    const photoUploaded = await uploadFile(
      passportPhoto,
      "passport-photos",
      setPassportPhotoUrl
    );

    const signatureUploaded = await uploadFile(
      signature,
      "signatures",
      setSignatureUrl
    );

    const paymentUploaded = await uploadFile(
      screenshot,
      "payment-screenshots",
      setScreenshotUrl
    );

    if (!photoUploaded || !signatureUploaded || !paymentUploaded) {
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("book_fair_registrations")
      .insert([
        {
          ...formData,
          registration_no: regNo,
          amount: REGISTRATION_FEE,
          payment_status: "pending_verification",
          passport_photo_url: passportPhotoUrl,
          signature_url: signatureUrl,
          payment_screenshot_url: screenshotUrl,
        },
      ]);

    if (error) {
      alert("Registration Failed");
      setLoading(false);
      return;
    }

    setRegistrationNo(regNo);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-200 py-10 text-black">
      <div className="max-w-4xl mx-auto bg-white border border-black p-8">

        <div className="text-center border-b border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold">
            BOOK FAIR REGISTRATION FORM – 2026
          </h1>
          <p className="text-sm mt-2">
            Organized by Mateng Group | Registration Fee: ₹300
          </p>
        </div>

        <form onSubmit={submitForm} className="space-y-6">

          {/* ALL YOUR EXISTING FIELDS REMAIN UNCHANGED */}
          {/* (I am keeping everything exactly same structure) */}

          {/* Candidate Name */}
          <div>
            <label className={labelStyle}>Candidate Name</label>
            <input name="candidate_name" required className={inputStyle}
              value={formData.candidate_name} onChange={handleChange}/>
          </div>

          {/* Father & Mother */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Father's Name</label>
              <input name="father_name" required className={inputStyle}
                value={formData.father_name} onChange={handleChange}/>
            </div>
            <div>
              <label className={labelStyle}>Mother's Name</label>
              <input name="mother_name" required className={inputStyle}
                value={formData.mother_name} onChange={handleChange}/>
            </div>
          </div>

          {/* DOB / Age / Gender / Category */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className={labelStyle}>Date of Birth</label>
              <input type="date" name="dob" required className={inputStyle}
                value={formData.dob} onChange={handleChange}/>
            </div>
            <div>
              <label className={labelStyle}>Age</label>
              <input name="age" readOnly className={inputStyle}
                value={formData.age}/>
            </div>
            <div>
              <label className={labelStyle}>Gender</label>
              <select name="gender" required className={inputStyle}
                value={formData.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Category</label>
              <select name="category" required className={inputStyle}
                value={formData.category} onChange={handleChange}>
                <option value="">Select</option>
                <option>General</option>
                <option>OBC</option>
                <option>SC</option>
                <option>ST</option>
              </select>
            </div>
          </div>

          {/* CONTACT */}
          <div className="grid grid-cols-2 gap-6">
            <input name="mobile" placeholder="Mobile" required className={inputStyle}
              value={formData.mobile} onChange={handleChange}/>
            <input name="alternate_mobile" placeholder="Alternate Mobile"
              className={inputStyle}
              value={formData.alternate_mobile} onChange={handleChange}/>
            <input name="email" placeholder="Email" required className={inputStyle}
              value={formData.email} onChange={handleChange}/>
            <input name="nationality" placeholder="Nationality" required className={inputStyle}
              value={formData.nationality} onChange={handleChange}/>
          </div>

          {/* ADDRESS */}
          <textarea name="address" placeholder="Full Address" required className={inputStyle}
            value={formData.address} onChange={handleChange}/>
          <div className="grid grid-cols-3 gap-6">
            <input name="city" placeholder="City" required className={inputStyle}
              value={formData.city} onChange={handleChange}/>
            <input name="state" placeholder="State" required className={inputStyle}
              value={formData.state} onChange={handleChange}/>
            <input name="pin_code" placeholder="Pin Code" required className={inputStyle}
              value={formData.pin_code} onChange={handleChange}/>
          </div>

          {/* QUALIFICATION */}
          <div className="grid grid-cols-2 gap-6">
            <input name="qualifying_exam" placeholder="Highest Qualification" required className={inputStyle}
              value={formData.qualifying_exam} onChange={handleChange}/>
            <input name="passing_year" placeholder="Year of Passing" required className={inputStyle}
              value={formData.passing_year} onChange={handleChange}/>
          </div>

          <textarea name="school_name_address" placeholder="School/College" required className={inputStyle}
            value={formData.school_name_address} onChange={handleChange}/>

          {/* ================= DOCUMENT UPLOAD SECTION ================= */}
<div className="border border-black p-6 space-y-8">

  <h2 className="text-lg font-semibold border-b border-black pb-2">
    Document Upload Section
  </h2>

  <div className="grid md:grid-cols-2 gap-10">

    {/* ================= PASSPORT PHOTO ================= */}
    <div>
      <label className="block font-medium mb-2">
        Passport Size Photograph (≤50KB)
      </label>

      <div className="border border-black w-40 h-48 flex items-center justify-center mb-3 bg-gray-50">
        {passportPreview ? (
          <img
            src={passportPreview}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-center px-2">
            Photo Preview
          </span>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        className="block w-full text-sm border border-black p-2"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB

if (file.size > MAX_PHOTO_SIZE) {
  alert("Photo must be under 2MB");
  return;
}
          setPassportPhoto(file);
          setPassportPreview(URL.createObjectURL(file));
        }}
      />
    </div>

    {/* ================= SIGNATURE ================= */}
    <div>
      <label className="block font-medium mb-2">
        Candidate Signature
      </label>

      <div className="border border-black w-60 h-24 flex items-center justify-center mb-3 bg-gray-50">
        {signaturePreview ? (
          <img
            src={signaturePreview}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-xs text-center px-2">
            Signature Preview
          </span>
        )}
      </div>

      <input
  type="file"
  accept="image/*"
  className="block w-full text-sm border border-black p-2"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB

    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoStatus("❌ Photo must be under 2MB");
      return;
    }

    setPassportPhoto(file);
    setPassportPreview(URL.createObjectURL(file));
    setPhotoStatus("✅ Photo Selected Successfully");
  }}
/>

{photoStatus && (
  <p className="text-sm mt-2">{photoStatus}</p>
)}
    </div>

  </div>

  {/* ================= PAYMENT SECTION ================= */}
  <div className="border-t border-black pt-6">

    <h3 className="font-semibold mb-4">
      Payment Section (₹300 Registration Fee)
    </h3>

    <div className="grid md:grid-cols-2 gap-8 items-start">

      {/* QR Code */}
      <div className="flex flex-col items-center border border-black p-4 bg-gray-50">
        <p className="text-sm font-medium mb-3">
          Scan QR Code to Pay
        </p>
        <QRCode value={upiLink} size={150} />
      </div>

      {/* Upload Payment Screenshot */}
      <div>
        <label className="block font-medium mb-2">
          Upload Payment Screenshot
        </label>

        <div className="border border-black w-full h-32 flex items-center justify-center mb-3 bg-gray-50">
          {screenshotPreview ? (
            <img
              src={screenshotPreview}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-xs">
              Payment Screenshot Preview
            </span>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          className="block w-full text-sm border border-black p-2"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setScreenshot(file);
            setScreenshotPreview(URL.createObjectURL(file));
          }}
        />
      </div>

    </div>
  </div>

</div>

          <button type="submit"
            disabled={loading}
            className="w-full border border-black py-2 mt-6 font-semibold">
            {loading ? "Submitting..." : "Submit Application"}
          </button>

        </form>

      </div>
    </div>
  );
}