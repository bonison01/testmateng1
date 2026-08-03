'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/footer/Footer";
import { useRouter } from "next/navigation";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export default function Page() {
  const router = useRouter();

  const [parcels, setParcels] = useState(0);
  const [merchants, setMerchants] = useState(0);
  const [businesses, setBusinesses] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const PARTNERS = [
    { name: "175c", logo: "/partners/partner1.png" },
    { name: "Coffee Culture", logo: "/partners/partner2.png" },
    { name: "Laija Trends", logo: "/partners/partner3.png" },
    { name: "Shija Hospitals and Research Institute (SHRI)", logo: "/partners/partner7.png" },
    { name: "Safe Sight Eye Care", logo: "/partners/partner5.png" },
    { name: "Vegnus Health and Beauty", logo: "/partners/partner6.png" },
    { name: "PB Online Store", logo: "/partners/partner4.png" },
    { name: "Cleaneteria", logo: "/partners/cleaneteria.png" },
  ];

  useEffect(() => {
    const targetParcels = 100;
    const targetMerchants = 300;
    const targetBusinesses = 130;

    const interval = setInterval(() => {
      setParcels((prev) => (prev < targetParcels ? prev + 2 : targetParcels));
      setMerchants((prev) => (prev < targetMerchants ? prev + 5 : targetMerchants));
      setBusinesses((prev) => (prev < targetBusinesses ? prev + 3 : targetBusinesses));
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`${fraunces.variable} ${inter.variable} ${mono.variable} w-full min-h-[calc(100svh-64px)] flex flex-col`}
      style={{
        background: "#0B1410",
        fontFamily: "var(--font-body)",
        color: "#F3F1EA",
      }}
    >
      <style jsx global>{`
        @keyframes dash-run {
          to { stroke-dashoffset: -200; }
        }
        @keyframes drift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .route-line {
          stroke-dasharray: 5 9;
          animation: dash-run 14s linear infinite;
        }
        .stub-row > div + div {
          position: relative;
        }
        .stub-row > div + div::before {
          content: "";
          position: absolute;
          left: -1px;
          top: 50%;
          transform: translateY(-50%);
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: #0B1410;
          box-shadow: 0 -34px 0 -1px #0B1410, 0 34px 0 -1px #0B1410;
        }
        .eyebrow {
          font-family: var(--font-mono);
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .tabular {
          font-family: var(--font-mono);
          font-feature-settings: "tnum" 1;
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: translateY(24px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .event-card {
          animation: pop-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
          will-change: transform;
        }
        .event-card-past {
          box-shadow: 0 0 0 1px rgba(243,241,234,0.08), 0 20px 50px -25px rgba(0,0,0,0.6);
        }
        .event-card-past:hover {
          transform: translateY(-4px);
          box-shadow: 0 0 0 1px rgba(243,241,234,0.14), 0 24px 60px -25px rgba(0,0,0,0.7);
        }
        .concluded-badge {
          background: rgba(243,241,234,0.08);
          border: 1px solid rgba(243,241,234,0.18);
        }
      `}</style>

      <div className="flex-grow">
        {/* HERO */}
        <section className="relative flex flex-col items-center text-center px-6 pt-28 pb-20 overflow-hidden">
          <svg
            className="absolute inset-x-0 top-10 w-full max-w-4xl mx-auto opacity-40 pointer-events-none"
            viewBox="0 0 800 160"
            fill="none"
          >
            <path
              d="M20 120 C 180 20, 280 140, 420 60 S 640 20, 780 90"
              stroke="#3FA637"
              strokeWidth="1.5"
              className="route-line"
            />
            <circle cx="20" cy="120" r="4" fill="#E8B84B" />
            <circle cx="420" cy="60" r="4" fill="#3FA637" />
            <circle cx="780" cy="90" r="4" fill="#E8B84B" />
          </svg>

          <span className="eyebrow relative text-[11px] text-[#8FA391] mb-6">
            All Across India — On the Move
          </span>

          <h1
            className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-4xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#F3F1EA" }}
          >
            Discover, Events & Delivery — Making a{" "}
            <em style={{ fontStyle: "italic", color: "#3FA637" }}>Difference</em>.
          </h1>

          <p className="relative text-[#92A395] mt-6 max-w-xl text-sm sm:text-base leading-relaxed">
            Mateng delivers parcels all across India, helps people
            discover great local businesses, and creates events that
            unite people — building community, joy, and healthy
            competition along the way.
          </p>

          <div className="relative flex flex-col sm:flex-row gap-4 mt-10">
            <Link href="/events">
              <button
                className="px-8 py-3 rounded-full font-semibold text-[#0B1410] transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "#3FA637" }}
              >
                Explore Events →
              </button>
            </Link>

            <Link href="https://matengdelivery.com/">
              <button
                className="px-8 py-3 rounded-full font-semibold text-[#F3F1EA] border transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3FA637]/60"
                style={{ borderColor: "rgba(243,241,234,0.18)" }}
              >
                Book Delivery →
              </button>
            </Link>
          </div>
        </section>

        {/* PAST EVENTS */}
        <section className="mt-6 px-6 flex flex-col items-center">
          <span className="eyebrow text-[11px] text-[#8FA391] mb-3">Past Events</span>
          <h2
            className="text-2xl sm:text-3xl mb-10 text-center"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            Successfully concluded
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-2xl w-full">
            {/* EDUFEST — PAST EVENT CARD */}
            <div
              className="event-card event-card-past relative rounded-2xl overflow-hidden flex flex-col"
              style={{ background: "#111812", animationDelay: "0.05s" }}
            >
              <div className="px-5 py-5 text-left">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="concluded-badge eyebrow text-[8px] px-2 py-1 rounded-full text-[#B8C4BA]">
                    Concluded
                  </span>
                  <span className="eyebrow text-[8px] text-[#5C6B5E]">EDU · 2026</span>
                </div>

                <h3
                  className="mt-2.5 text-base leading-tight text-[#D7DED9]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  Mateng Education Festival
                </h3>

                <p className="mt-2 text-[#7C8A7E] text-xs leading-relaxed line-clamp-2">
                  Thanks to everyone who joined the Maths, quiz, painting &
                  innovation tracks. Results are available.
                </p>

                <div className="mt-4">
                  <Link href="/events/matengfest">
                    <button className="px-4 py-1.5 rounded-full font-semibold text-[#F3F1EA] border border-white/15 hover:border-white/35 hover:bg-white/5 transition-all duration-200 text-xs">
                      View Results →
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* G15 FESTIVAL — PAST EVENT CARD */}
            <div
              className="event-card event-card-past relative rounded-2xl overflow-hidden flex flex-col"
              style={{ background: "#111812", animationDelay: "0.15s" }}
            >
              <div className="relative w-full h-20">
                <Image
                  src="/g15-festival.png"
                  alt="G15 Festival — past event"
                  fill
                  className="object-cover grayscale opacity-60"
                  priority={false}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(180deg, rgba(17,24,18,0.2) 0%, rgba(17,24,18,0.75) 70%, #111812 100%)",
                  }}
                />
                <span className="concluded-badge absolute top-2 right-2 eyebrow text-[8px] px-2 py-1 rounded-full text-[#B8C4BA]">
                  Concluded
                </span>
              </div>

              <div className="px-5 py-5 text-left">
                <span className="eyebrow text-[8px] text-[#5C6B5E]">24 JUL 2026</span>

                <h3
                  className="mt-1.5 text-base leading-tight text-[#D7DED9]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  G15 Festival
                </h3>

                <p className="mt-2 text-[#7C8A7E] text-xs leading-relaxed line-clamp-2">
                  Live music, food & good energy — the festival wrapped up
                  with a great turnout.
                </p>

                <div className="mt-4">
                  <Link href="/events/g15-festival">
                    <button className="px-4 py-1.5 rounded-full font-semibold text-[#F3F1EA] border border-white/15 hover:border-white/35 hover:bg-white/5 transition-all duration-200 text-xs">
                      View Highlights →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NOTICE LINK */}
        <div className="w-full flex justify-center px-6 mt-10">
          <button
            onClick={() => router.push("/events/matengfest")}
            className="eyebrow text-[11px] text-[#8FA391] hover:text-[#3FA637] transition-colors duration-200 flex items-center gap-2"
          >
            Check Pre-Neet Examination Answer Key
            <span aria-hidden>→</span>
          </button>
        </div>

        {/* WHAT WE DO */}
        <section className="mt-24 px-6 flex flex-col items-center">
          <span className="eyebrow text-[11px] text-[#8FA391] mb-3">What We Do</span>
          <h2
            className="text-2xl sm:text-3xl mb-12"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            Three ways we move Manipur
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full">
            {[
              {
                tag: "Discovery",
                title: "Events & Competitions",
                body: "Structured competitions and events helping students showcase their skills.",
                icon: (
                  <path d="M11 4a7 7 0 105.29 12.29l4.2 4.2 1.42-1.41-4.2-4.2A7 7 0 0011 4zm0 2a5 5 0 110 10 5 5 0 010-10z" />
                ),
              },
              {
                tag: "Local Business",
                title: "Business Discovery",
                body: "Helping local businesses become discoverable and connect with customers.",
                icon: (
                  <path d="M4 4h16v4l-1 1v11h-6v-6H11v6H5V9L4 8V4zm2 2v1.17L6.83 8H17.2l.8-1V6H6z" />
                ),
              },
              {
                tag: "Logistics",
                title: "Delivery",
                body: "Reliable hyperlocal delivery and porter services helping businesses move goods quickly.",
                icon: (
                  <path d="M3 6h11v7h2.5l2.5 3.5V17h1v2h-2a2 2 0 11-4 0H8a2 2 0 11-4 0H3V6zm2 2v7h.28a2 2 0 013.44 0H12V8H5zm10 4v2h2l-1.5-2H15z" />
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-8 text-left"
                style={{
                  background: "rgba(243,241,234,0.03)",
                  border: "1px dashed rgba(243,241,234,0.16)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#3FA637" className="mb-4">
                  {item.icon}
                </svg>
                <span className="eyebrow text-[10px] text-[#E8B84B]">{item.tag}</span>
                <h3
                  className="text-lg mt-2"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  {item.title}
                </h3>
                <p className="text-[#92A395] text-sm mt-3 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* DELIVERY NETWORK */}
        <section className="mt-24 px-6 flex flex-col items-center">
          <span className="eyebrow text-[11px] text-[#8FA391] mb-3">Our Network</span>
          <h2
            className="text-2xl sm:text-3xl mb-3 text-center"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            Connected across India, hyperlocal at home
          </h2>
          <p className="text-[#92A395] text-sm max-w-lg mx-auto text-center mb-10">
            Long-haul from Delhi through Guwahati into Imphal, with hyperlocal
            delivery running in both Delhi and Imphal — Manipur remains our
            main serviceable zone.
          </p>

          <div
            className="w-full max-w-5xl rounded-3xl p-6 sm:p-10"
            style={{ background: "rgba(243,241,234,0.03)", border: "1px dashed rgba(243,241,234,0.16)" }}
          >
            <svg viewBox="0 0 900 400" className="w-full h-auto" fill="none">
              {/* Long haul: Delhi -> Guwahati -> Imphal */}
              <path
                d="M110 140 C 220 100, 300 90, 420 110"
                stroke="#E8B84B"
                strokeWidth="1.5"
                className="route-line"
              />
              <path
                d="M450 125 C 540 155, 610 190, 670 235"
                stroke="#E8B84B"
                strokeWidth="1.5"
                className="route-line"
              />
              {/* Imphal -> rest of India */}
              <path d="M710 250 C 770 260, 820 290, 860 320" stroke="#3FA637" strokeWidth="1.5" className="route-line" />

              {/* Delhi node + hyperlocal loop */}
              <g>
                <path
                  d="M60 175 C 40 150, 45 120, 70 105 C 95 90, 120 100, 130 115 C 140 130, 130 160, 105 172 C 85 182, 70 185, 60 175 Z"
                  stroke="#8FA391"
                  strokeWidth="1"
                  strokeDasharray="3 6"
                  fill="rgba(232,184,75,0.05)"
                />
                <circle cx="60" cy="175" r="3" fill="#8FA391" />
                <circle cx="70" cy="105" r="3" fill="#8FA391" />
                <circle cx="130" cy="115" r="3" fill="#8FA391" />
                <circle cx="105" cy="172" r="3" fill="#8FA391" />
              </g>
              <circle cx="95" cy="140" r="8" fill="#E8B84B" />
              <text x="95" y="60" textAnchor="middle" fill="#F3F1EA" fontSize="16" fontFamily="var(--font-display)" fontWeight="600">
                Delhi
              </text>
              <text x="95" y="78" textAnchor="middle" fill="#8FA391" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="0.05em">
                HYPERLOCAL + LONG-HAUL
              </text>

              {/* Guwahati — connected relay node */}
              <circle cx="435" cy="115" r="6" fill="#E8B84B" />
              <text x="435" y="92" textAnchor="middle" fill="#D7E4D8" fontSize="13" fontFamily="var(--font-mono)">
                Guwahati
              </text>
              <text x="435" y="140" textAnchor="middle" fill="#7C8A7E" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="0.05em">
                CONNECTED RELAY
              </text>

              {/* Imphal — main hub + hyperlocal loop */}
              <g>
                <path
                  d="M615 300 C 590 265, 595 225, 630 205 C 665 185, 705 195, 725 220 C 745 245, 735 285, 700 305 C 670 322, 635 325, 615 300 Z"
                  stroke="#8FA391"
                  strokeWidth="1"
                  strokeDasharray="3 6"
                  fill="rgba(63,166,55,0.06)"
                />
                <circle cx="615" cy="300" r="3.5" fill="#8FA391" />
                <circle cx="630" cy="205" r="3.5" fill="#8FA391" />
                <circle cx="725" cy="220" r="3.5" fill="#8FA391" />
                <circle cx="700" cy="305" r="3.5" fill="#8FA391" />
              </g>
              <circle cx="670" cy="255" r="12" fill="#3FA637" />
              <circle cx="670" cy="255" r="20" stroke="#3FA637" strokeOpacity="0.4" strokeWidth="1.5" fill="none" />
              <text x="670" y="345" textAnchor="middle" fill="#F3F1EA" fontSize="18" fontFamily="var(--font-display)" fontWeight="600">
                Imphal
              </text>
              <text x="670" y="362" textAnchor="middle" fill="#E8B84B" fontSize="10" fontFamily="var(--font-mono)" letterSpacing="0.06em">
                MAIN SERVICEABLE ZONE
              </text>

              {/* Rest of India node */}
              <circle cx="865" cy="330" r="5" fill="#3FA637" />
              <text x="850" y="313" textAnchor="end" fill="#D7E4D8" fontSize="12" fontFamily="var(--font-mono)">
                Other States
              </text>
            </svg>

            <div className="mt-8 grid sm:grid-cols-3 gap-4 text-left">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0" style={{ background: "#E8B84B" }} />
                <p className="text-[#92A395] text-xs leading-relaxed">
                  <span className="text-[#F3F1EA] font-semibold">Delhi ↔ Guwahati ↔ Imphal</span> is our
                  main long-haul corridor connecting Delhi to the Northeast.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0" style={{ background: "#8FA391" }} />
                <p className="text-[#92A395] text-xs leading-relaxed">
                  <span className="text-[#F3F1EA] font-semibold">Hyperlocal delivery</span> runs in both
                  Delhi and Imphal — same-day pickup and drop within each city.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0" style={{ background: "#3FA637" }} />
                <p className="text-[#92A395] text-xs leading-relaxed">
                  <span className="text-[#F3F1EA] font-semibold">Manipur is our main serviceable zone</span>,
                  with the deepest coverage centered on Imphal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DELIVERY CTA */}
        <section className="mt-24 px-6 flex justify-center">
          <div
            className="relative overflow-hidden p-10 sm:p-12 rounded-2xl text-center max-w-3xl w-full shadow-xl"
            style={{ background: "linear-gradient(120deg, #14710f, #0f550c)" }}
          >
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 140">
              <path d="M-10 100 C 100 40, 200 130, 410 50" stroke="#F3F1EA" strokeWidth="1.5" className="route-line" />
            </svg>

            <h2
              className="relative text-2xl sm:text-3xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              Need something delivered?
            </h2>
            <p className="relative text-sm text-[#D7E4D8] mt-3">
              Book a fast, reliable local delivery with Mateng.
            </p>

            <Link href="https://matengdelivery.com/">
              <button className="relative mt-6 px-8 py-3 rounded-full bg-white text-[#14710f] font-semibold shadow-md hover:scale-[1.03] transition">
                Book Delivery
              </button>
            </Link>
          </div>
        </section>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div
            className="p-8 rounded-2xl max-w-md w-full text-center shadow-xl border border-dashed"
            style={{ background: "#101B15", borderColor: "rgba(243,241,234,0.2)" }}
          >
            <span className="eyebrow text-[10px] text-[#E8B84B]">Admit One</span>
            <h3
              className="text-xl mt-2"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              Tickets coming soon
            </h3>
            <p className="text-[#92A395] mt-3 text-sm">
              Online ticket booking for this event will be available soon.
              Stay tuned for updates.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 px-6 py-2 rounded-full text-white font-semibold"
              style={{ background: "#14710f" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* IMPACT — TICKET STUB ROW */}
      <section className="mt-24 flex flex-col items-center text-center px-6">
        <span className="eyebrow text-[11px] text-[#8FA391] mb-3">Our Impact</span>
        <h2
          className="text-2xl sm:text-3xl mb-10"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          On the road, every day
        </h2>

        <div
          className="stub-row flex flex-row justify-center gap-8 md:gap-16 rounded-2xl px-8 sm:px-14 py-8"
          style={{ background: "rgba(243,241,234,0.03)", border: "1px dashed rgba(243,241,234,0.16)" }}
        >
          <div>
            <p className="tabular text-2xl sm:text-3xl text-[#3FA637] font-semibold">
              {Math.floor(parcels)}K
            </p>
            <p className="text-[#92A395] text-xs mt-1">Parcels delivered</p>
          </div>

          <div>
            <p className="tabular text-2xl sm:text-3xl text-[#3FA637] font-semibold">
              {Math.floor(merchants)}+
            </p>
            <p className="text-[#92A395] text-xs mt-1">Merchants</p>
          </div>

          <div>
            <p className="tabular text-2xl sm:text-3xl text-[#3FA637] font-semibold">
              {Math.floor(businesses)}+
            </p>
            <p className="text-[#92A395] text-xs mt-1">Businesses discovered</p>
          </div>
        </div>
      </section>

      {/* TRUSTED PARTNERS */}
      <section className="mt-28 px-6 flex flex-col items-center">
        <div className="text-center mb-12">
          <span className="eyebrow text-[11px] text-[#E8B84B] mb-3 block">Our Network</span>
          <h2
            className="text-2xl sm:text-3xl mb-3"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            Trusted Partners
          </h2>
          <p className="text-[#92A395] text-sm max-w-md mx-auto">
            Proudly working with 400+ local businesses across Imphal and Delhi
          </p>
        </div>

        <div className="relative w-full max-w-5xl">
          <button
            onClick={() => {
              const el = document.getElementById("partner-track");
              if (el) el.scrollBy({ left: -200, behavior: "smooth" });
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-[#F3F1EA] transition-all duration-200 shadow-lg backdrop-blur-sm -translate-x-1/2"
            style={{ background: "rgba(243,241,234,0.08)", border: "1px solid rgba(243,241,234,0.16)" }}
          >
            ‹
          </button>

          <button
            onClick={() => {
              const el = document.getElementById("partner-track");
              if (el) el.scrollBy({ left: 200, behavior: "smooth" });
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-[#F3F1EA] transition-all duration-200 shadow-lg backdrop-blur-sm translate-x-1/2"
            style={{ background: "rgba(243,241,234,0.08)", border: "1px solid rgba(243,241,234,0.16)" }}
          >
            ›
          </button>

          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0B1410] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0B1410] to-transparent z-10 pointer-events-none" />

          <div
            id="partner-track"
            className="flex gap-5 overflow-x-auto scroll-smooth px-8 pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`#partner-track::-webkit-scrollbar { display: none; }`}</style>

            {[...PARTNERS, ...PARTNERS].map((partner, i) => (
              <div
                key={i}
                className="flex-shrink-0 group relative w-40 h-24 rounded-2xl flex flex-col items-center justify-center px-5 gap-2 transition-all duration-300 cursor-pointer"
                style={{
                  background: "rgba(243,241,234,0.04)",
                  border: "1px dashed rgba(243,241,234,0.14)",
                }}
              >
                <div
                  className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                  style={{ background: "#3FA637" }}
                />
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-10 max-w-[75%] object-contain opacity-50 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-300"
                />
                <span className="eyebrow text-[10px] text-[#8FA391] group-hover:text-[#F3F1EA] truncate w-full text-center transition-all duration-300">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="w-full mt-20">
        <Footer />
      </footer>
    </div>
  );
}