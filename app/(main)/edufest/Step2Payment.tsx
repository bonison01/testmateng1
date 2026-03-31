/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, calculateTotalFee, COMPETITION_LABELS, API_BASE } from './type';
import { Smartphone } from 'lucide-react';

interface Props {
  formData: FormData;
  registrationId: number;
}

export default function Step2Payment({ formData, registrationId }: Props) {
  const router = useRouter();
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const teamSize = formData.participation_type === 'team' ? (formData.team_members.length + 1) : null;
  const totalFee = calculateTotalFee(formData.competition_category, formData.participation_type, teamSize);

  const upiLink = `upi://pay?pa=khumbongmayumbonison@icici&pn=MatengEduFest2026&am=${totalFee}&cu=INR&tn=EduFest-${registrationId}`;

  // Generate QR code via a free QR service
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiLink)}&size=240x240&bgcolor=0a0a0f&color=ffffff&margin=16`;

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = ev => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setError('');
  };

  const handleSubmit = async () => {
    if (!screenshotFile) {
      setError('Please upload the payment screenshot to proceed.');
      return;
    }
    setUploading(true);
    try {
      const fd = new globalThis.FormData();
      fd.append('document_type', 'payment_screenshot');
      fd.append('file', screenshotFile);
      const res = await fetch(`${API_BASE}/edu-fest/${registrationId}/documents`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      router.push(`/edufest/complete?id=${registrationId}`);
    } catch {
      setError('Failed to upload screenshot. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Order summary */}
      <div className="rounded-2xl border border-white/20 bg-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
            <span>🧾</span> Order Summary
          </h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex justify-between text-xs md:text-sm text-gray-400">
            <span>Candidate</span>
            <span className="text-white">{formData.full_name}</span>
          </div>
          <div className="flex justify-between text-xs md:text-sm text-gray-400">
            <span>Registration ID</span>
            <span className="text-white font-mono">#{String(registrationId).padStart(6, '0')}</span>
          </div>
          {formData.participation_type === 'team' && (
            <div className="flex justify-between text-xs md:text-sm text-gray-400">
              <span>Team Size</span>
              <span className="text-white">{formData.team_members.length + 1} members</span>
            </div>
          )}
          <div className="border-t border-white/5 pt-3 mt-3 space-y-2">
            {formData.competition_category.map(cat => {
              const fee = formData.participation_type === 'team' && (cat === 'quiz' || cat === 'young_innovator')
                ? import('./type').then(() => 0) // placeholder
                : null;
              const catFee = (() => {
                const base = { painting: 150, quiz: 300, mathematics: 200, young_innovator: 300 }[cat];
                if (formData.participation_type === 'team' && (cat === 'quiz' || cat === 'young_innovator')) {
                  return base * (formData.team_members.length + 1);
                }
                return base;
              })();
              return (
                <div key={cat} className="flex justify-between text-base md:text-lg">
                  <span className="text-green-200">{COMPETITION_LABELS[cat]}</span>
                  <span className="text-white font-mono">₹{catFee}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between items-center">
            <span className="text-white font-semibold md:text-lg">Total Amount</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">₹{totalFee}</span>
          </div>
        </div>
      </div>

      {/* QR Code payment */}
      <div className="rounded-2xl border border-emerald-500/60 bg-emerald-800/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-emerald-500/15">
          <h2 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
            <span>📱</span> Scan & Pay via UPI
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* QR Code */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#0a0a0f] border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <img
                  src={qrUrl}
                  alt="UPI QR Code"
                  width={200}
                  height={200}
                  className="rounded-xl"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              {/* <a
                href={upiLink}
                className="text-xs text-emerald-400 border border-emerald-500/30 rounded-lg px-4 py-2 hover:bg-emerald-500/10 transition-all text-center"
              >
                Open in UPI App
              </a> */}
            </div>

            {/* Payment details */}
            <div className="flex-1 space-y-4">
              <div className="space-y-3">
                <InfoRow label="UPI ID" value="khumbongmayumbonison@icici" mono />
                <InfoRow label="Amount" value={`₹${totalFee}`} highlight />
                {/* <InfoRow label="Name" value="MatengEduFest 2026" /> */}
                <InfoRow label="Reference" value={`EduFest-${registrationId}`} mono />
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs md:text-sm text-amber-300/90">
                ⚠️ &nbsp; After completing payment, take a screenshot of the payment confirmation and upload it below.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot upload */}
      <div className="rounded-2xl border border-white/20 bg-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
            <span>📸</span> Upload Payment Screenshot
          </h2>
        </div>
        <div className="p-6">
          <div
            className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all ${
              error ? 'border-red-500/40 bg-red-500/5' :
              screenshotPreview ? 'border-emerald-500/30 bg-emerald-500/5' :
              'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
            }`}
            style={{ minHeight: 160 }}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleScreenshot}
            />
            {screenshotPreview ? (
              <div className="flex flex-col items-center justify-center p-4">
                <img src={screenshotPreview} alt="Payment screenshot" className="max-h-40 max-w-full object-contain rounded-lg" />
                <p className="text-xs text-emerald-400 mt-3">✓ Screenshot uploaded — click to change</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl"><Smartphone /></div>
                <p className="text-gray-400 text-sm">Upload payment confirmation screenshot</p>
                <p className="text-white/40 text-xs">JPG, PNG or WEBP</p>
              </div>
            )}
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={uploading}
        className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
      >
        {uploading ? (
          <>
            <span className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
            Submitting…
          </>
        ) : (
          'Complete Registration ✓'
        )}
      </button>
    </div>
  );
}

function InfoRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs md:text-sm text-gray-400 font-mono uppercase tracking-wide">{label}</span>
      <span className={`text-xs md:text-sm ${highlight ? 'text-emerald-400 font-bold' : 'text-white'} ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}