'use client';

import { useState } from 'react';
import EduFestAdmitCardSearch from './EduFestAdmitCardSearch';
import EduFestAdmitCard from './EduFestAdmitCard';
import { generateEduFestAdmitCardPDF } from '../generatePDF';

export default function EduFestAdmitCardPage() {
  const [candidate, setCandidate] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!candidate) return;
    try {
      setDownloading(true);
      await generateEduFestAdmitCardPDF(candidate);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 md:px-10">
      <h1 className="text-2xl font-bold mb-6 text-center text-white">EduFest Admit Card Portal</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        <div className="lg:w-[420px] lg:flex-shrink-0">
          <EduFestAdmitCardSearch onFound={setCandidate} />

          {candidate && (
            <button
              onClick={() => setCandidate(null)}
              className="w-full mt-3 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-all"
            >
              Search Again
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center gap-4 w-full">
          {candidate && (
            <>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  downloading
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                }`}
              >
                {downloading ? 'Downloading…' : 'Download Admit Card (PDF)'}
              </button>
              <EduFestAdmitCard data={candidate} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}