'use client'

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Footer from "@/components/footer/Footer";

export default function Page() {
  const [parcels, setParcels] = useState(0);
  const [merchants, setMerchants] = useState(0);
  const [businesses, setBusinesses] = useState(0);

  useEffect(() => {
    const targetParcels = 100;
    const targetMerchants = 300;
    const targetBusinesses = 130;

    const startParcels = 10;
    const startMerchants = 50;
    const startBusinesses = 10;

    const stepsParcels = targetParcels - startParcels;
    const stepsMerchants = targetMerchants - startMerchants;
    const stepsBusinesses = targetBusinesses - startBusinesses;

    const maxSteps = Math.max(
      stepsParcels / 750,
      stepsMerchants / 5,
      stepsBusinesses / 2
    );

    const parcelIncrement = Math.ceil(stepsParcels / maxSteps);
    const merchantIncrement = Math.ceil(stepsMerchants / maxSteps);
    const businessIncrement = Math.ceil(stepsBusinesses / maxSteps);

    const interval = setInterval(() => {
      setParcels((prev) =>
        prev < targetParcels ? prev + parcelIncrement : targetParcels
      );
      setMerchants((prev) =>
        prev < targetMerchants ? prev + merchantIncrement : targetMerchants
      );
      setBusinesses((prev) =>
        prev < targetBusinesses ? prev + businessIncrement : targetBusinesses
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    // <div className="w-[100vw] min-h-[100svh] flex flex-col overflow-hidden">
    <div className="w-[100vw] min-h-[calc(100svh-64px)] flex flex-col">


      {/* MAIN CONTENT */}
      <div className="flex-grow">

        {/* BOOK FAIR REGISTRATION POSTER */}
        <div className="w-full flex justify-center px-4 mt-10 z-20">
          <div className="relative w-full sm:w-[85vw] md:w-[70vw] rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0f2e1d] via-[#123d27] to-[#0a1f15] shadow-xl">

            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-emerald-500/10 blur-2xl" />

            <div className="relative p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  📚 Book Fair 2026
                </h2>
                <p className="text-gray-300 mt-2 max-w-md">
                  Register now to participate in competitions, discussions, and
                  special book fair events.
                </p>
              </div>

              <Link href="/book_fair_registration">
                <button className="px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-tr from-green-500 to-emerald-600 ring-4 ring-green-500/20 hover:opacity-90 transition">
                  Register Now
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* HERO SECTION */}
        {/* <div className="min-h-[70svh] text-center font-bold text-white flex flex-col justify-center items-center gap-10"> */}
        <div className="text-center font-bold text-white flex flex-col justify-center items-center gap-10 py-20">


          <div className="flex flex-col sm:flex-row gap-1 text-5xl sm:text-[2.5rem] md:text-[3rem] lg:text-[4rem] text-transparent bg-gradient-to-b from-white to-gray-400 bg-clip-text">
            <span>We Drive,</span>
            <span> We Discover</span>
          </div>

          {/* STATS */}
          <div className="w-full">
            <div className="flex flex-row justify-center gap-2 md:gap-10 text-[#b5b6be] text-base md:text-lg lg:text-[1.3rem] w-[95vw] sm:w-fit mx-auto">
              <div>
                Delivered <span className="text-green-600">{parcels}K</span> parcels
              </div>
              <div className="w-[2px] h-7 bg-gray-200/40 rounded" />
              <div>
                Merchants <span className="text-green-600">{merchants}+</span>
              </div>
              <div className="w-[2px] h-7 bg-gray-200/40 rounded" />
              <div>
                Discovered <span className="text-green-600">{businesses}+</span> businesses
              </div>
            </div>
          </div>

          {/* CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
            <Link href="/discovery">
              <button className="px-8 py-3 rounded-full font-semibold text-teal-50 bg-gradient-to-tr from-amber-200/60 via-amber-300/70 to-amber-300/80 ring-4 ring-amber-200/25 hover:opacity-95 transition">
                Discover Now →
              </button>
            </Link>

            <Link href="/delivery-rates">
              <button className="px-8 py-3 rounded-full font-semibold text-teal-50 bg-gradient-to-tr from-teal-900/40 via-teal-900/70 to-teal-900/40 ring-4 ring-teal-900/20 hover:opacity-90 transition">
                Book Delivery →
              </button>
            </Link>
          </div>

        </div>
      </div>

      {/* FOOTER (REAL FOOTER) */}
      <footer className="w-full">
        <Footer />
      </footer>

    </div>
  );
}
