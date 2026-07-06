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
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
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
        .live-dot {
          animation: pulse-glow 1.8s ease-in-out infinite;
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
            Imphal · Delhi — On the Move
          </span>

          <h1
            className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-4xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#F3F1EA" }}
          >
            Discover, deliver, and{" "}
            <em style={{ fontStyle: "italic", color: "#3FA637" }}>grow</em> — together.
          </h1>

          <p className="relative text-[#92A395] mt-6 max-w-xl text-sm sm:text-base leading-relaxed">
            Mateng connects people with local businesses, moves parcels
            across Imphal and Delhi quickly, and opens doors for young
            people through competitions and events.
          </p>

          <div className="relative flex flex-col sm:flex-row gap-4 mt-10">
            <Link href="/events/matengfest">
              <button
                className="px-8 py-3 rounded-full font-semibold text-[#0B1410] transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "#3FA637" }}
              >
                Explore Events →
              </button>
            </Link>

            <Link href="/delivery-rates">
              <button
                className="px-8 py-3 rounded-full font-semibold text-[#F3F1EA] border transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3FA637]/60"
                style={{ borderColor: "rgba(243,241,234,0.18)" }}
              >
                Book Delivery →
              </button>
            </Link>
          </div>
        </section>

        {/* EDUFEST TICKET BANNER */}
        <section className="w-full flex justify-center px-4 mt-6">
          <div
            className="relative w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            style={{ background: "linear-gradient(120deg, #17240F 0%, #0F550C 60%, #0B1410 100%)" }}
          >
            <div className="flex-1 px-8 sm:px-12 py-10 text-left">
              <span className="eyebrow text-[11px] text-[#E8B84B]">Registrations Open</span>

              <h2
                className="mt-3 text-3xl sm:text-4xl md:text-5xl leading-tight"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
              >
                Mateng Education{" "}
                <em style={{ fontStyle: "italic", color: "#E8B84B" }}>Festival</em> 2026
              </h2>

              <p className="mt-4 text-[#D7E4D8] max-w-xl text-sm sm:text-base leading-relaxed">
                Enter the Mathematics Competition and put your problem-solving
                to the test — plus quiz, painting, and innovation tracks for
                every kind of student.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Quiz Competition", "Painting", "Young Innovators", "Mathematics"].map((tag) => (
                  <span
                    key={tag}
                    className="eyebrow px-3 py-1.5 rounded-full text-[10px] text-[#F3F1EA]"
                    style={{ background: "rgba(243,241,234,0.08)", border: "1px solid rgba(243,241,234,0.15)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/events/matengfest/edufest_registration">
                  <button
                    className="px-8 py-3 rounded-full font-bold text-[#0F550C] bg-white hover:bg-[#F3F1EA] hover:scale-[1.03] transition-all duration-200 text-sm"
                  >
                    Register Now →
                  </button>
                </Link>
                <Link href="/events/matengfest">
                  <button className="px-8 py-3 rounded-full font-semibold text-white border border-white/30 hover:border-white/70 hover:bg-white/10 transition-all duration-200 text-sm">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>

            {/* Ticket stub */}
            <div
              className="relative md:w-48 flex md:flex-col items-center justify-center gap-3 py-6 md:py-0 border-t md:border-t-0 md:border-l border-dashed"
              style={{ borderColor: "rgba(243,241,234,0.25)" }}
            >
              <span
                className="eyebrow text-[10px] text-[#E8B84B] md:[writing-mode:vertical-rl]"
              >
                Admit One
              </span>
              <span className="tabular text-xs text-[#D7E4D8]">EDU·26</span>
            </div>
          </div>
        </section>

        {/* G15 FESTIVAL TICKET BANNER */}
        <section className="w-full flex justify-center px-4 mt-6">
          <div
            className="relative w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "#150C33" }}
          >
            {/* PHOTO HERO STRIP */}
            <div className="relative w-full h-48 sm:h-56 md:h-64">
              <Image
                src="/g15-festival.png"
                alt="G15 Festival — live crowd and stage lights"
                fill
                className="object-cover"
                priority={false}
              />
              {/* readability gradient over the photo */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(21,12,51,0.15) 0%, rgba(21,12,51,0.55) 65%, #150C33 100%)",
                }}
              />

              <div className="absolute bottom-4 left-6 sm:left-10 flex items-center gap-2">
                <span
                  className="live-dot inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "#50C273" }}
                />
                <span
                  className="eyebrow text-[11px] text-[#F3F1EA] px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(0,0,0,0.35)" }}
                >
                  Booking Open · New Date Confirmed
                </span>
              </div>
            </div>

            {/* CONTENT */}
            <div className="relative flex flex-col md:flex-row">
              <div className="relative flex-1 px-8 sm:px-12 py-10 text-left">
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl leading-tight"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  G15{" "}
                  <em style={{ fontStyle: "italic", color: "#50C273" }}>Festival</em> 2026
                </h2>

                <p className="mt-4 text-[#E4DEF5] max-w-xl text-sm sm:text-base leading-relaxed">
                  Live music, food, and good energy — the ultimate vibe is
                  back. Now happening{" "}
                  <strong className="text-white">24th July 2026</strong>.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {["Live Music", "Food & Drinks", "Community"].map((tag) => (
                    <span
                      key={tag}
                      className="eyebrow px-3 py-1.5 rounded-full text-[10px] text-[#F3F1EA]"
                      style={{ background: "rgba(243,241,234,0.08)", border: "1px solid rgba(243,241,234,0.15)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link href="/events/g15-festival">
                    <button className="px-8 py-3 rounded-full font-bold text-[#2D1B69] bg-white hover:bg-[#F3F1EA] hover:scale-[1.03] transition-all duration-200 text-sm">
                      Book Your Pass →
                    </button>
                  </Link>
                  <Link href="/events/g15-festival">
                    <button className="px-8 py-3 rounded-full font-semibold text-white border border-white/30 hover:border-white/70 hover:bg-white/10 transition-all duration-200 text-sm">
                      Learn More
                    </button>
                  </Link>
                </div>
              </div>

              {/* Ticket stub */}
              <div
                className="relative md:w-48 flex md:flex-col items-center justify-center gap-3 py-6 md:py-0 border-t md:border-t-0 md:border-l border-dashed"
                style={{ borderColor: "rgba(243,241,234,0.25)" }}
              >
                <span className="eyebrow text-[10px] text-[#E2DE59] md:[writing-mode:vertical-rl]">
                  Admit One
                </span>
                <span className="tabular text-xs text-[#E4DEF5]">24 JUL</span>
              </div>
            </div>
          </div>
        </section>

        {/* NOTICE LINK */}
        <div className="w-full flex justify-center px-6 mt-8">
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

            <Link href="/delivery-rates">
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