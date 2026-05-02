'use client'

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/footer/Footer";
import styles from "./../events/matengfest/page.module.css";
import { useRouter } from "next/navigation";

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

      setParcels(prev => prev < targetParcels ? prev + 2 : targetParcels);
      setMerchants(prev => prev < targetMerchants ? prev + 5 : targetMerchants);
      setBusinesses(prev => prev < targetBusinesses ? prev + 3 : targetBusinesses);

    }, 40);

    return () => clearInterval(interval);

  }, []);

  return (

    <div className="w-full min-h-[calc(100svh-64px)] flex flex-col">

      <div className="flex-grow">


        {/* HERO */}
        <section className="flex flex-col items-center text-center px-6 pt-24 pb-16">

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-transparent bg-gradient-to-b from-white to-gray-400 bg-clip-text">
            Discover • Deliver • Events
          </h1>
          <br />
          <p className="text-gray-400 mt-6 max-w-xl text-sm sm:text-base">
            Mateng connects people with local businesses, delivers essentials quickly,
            and creates opportunities for youths through competitions and events.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mt-10">

            <Link href="/events/matengfest">
              <button className="px-8 py-3 rounded-full font-semibold text-white
              bg-gradient-to-tr from-[#14710f] to-[#0f550c]
              ring-4 ring-green-500/20 hover:opacity-90 transition">
                Explore Events →
              </button>
            </Link>

            <Link href="/delivery-rates">
              <button className="px-8 py-3 rounded-full font-semibold text-white
              bg-gradient-to-tr from-gray-800 to-gray-900
              ring-4 ring-gray-700/30 hover:opacity-90 transition">
                Book Delivery →
              </button>
            </Link>

          </div>

        </section><div className={styles.noticeContainer}>
            <h4
              className={styles.heroTitle1}
              onClick={() => router.push("/events/matengfest")}
              style={{ cursor: "pointer" }}
            >
              Check Pre Neet Examination Answer Key
            </h4>
          </div>

        {/* REGISTRATION OPEN BANNER - BIG */}

<section className="w-full flex justify-center px-4 mt-8">

  <div className="relative w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl min-h-[180px] sm:min-h-[220px] md:min-h-[260px] flex items-center">

    {/* Background */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#14710f] via-[#1f9d1a] to-[#0f550c]" />

    {/* Glow Effects */}
    <div className="absolute -top-12 -left-12 w-52 h-52 bg-green-400/30 blur-3xl rounded-full" />
    <div className="absolute -bottom-12 -right-12 w-52 h-52 bg-yellow-300/20 blur-3xl rounded-full" />

    {/* Content */}
    <div className="relative z-10 w-full text-center px-6 sm:px-10 py-8">
      

  <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide text-white">
    🎉 Mateng Education Festival 2026
  </h2>

  <p className="mt-3 text-base sm:text-lg md:text-xl text-green-100">
    Registrations are now open 🚀
  </p>

  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
    <Link href="/events/matengfest/edufest_registration">
      <button className="px-8 py-3 rounded-full font-bold text-[#0f550c] bg-white
        hover:bg-green-50 hover:scale-105
        shadow-[0_0_24px_rgba(255,255,255,0.3)]
        transition-all duration-200 text-sm sm:text-base">
        Register Now →
      </button>
    </Link>

    <Link href="/events/matengfest">
      <button className="px-8 py-3 rounded-full font-semibold text-white
        border-2 border-white/40 hover:border-white/80 hover:bg-white/10
        transition-all duration-200 text-sm sm:text-base">
        Learn More
      </button>
    </Link>
  </div>

</div>

  </div>

</section>

        {/* APPLE STYLE EVENTS */}

        <section className="w-full flex flex-col items-center px-4 mt-10">

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">
            Upcoming Events
          </h2>
          <div className="w-full max-w-4xl bg-red-600/10 border border-red-500 rounded-2xl p-6 text-center shadow-lg">

            <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-3">
              ⚠️ Important Notice
            </h2>

            <p className="text-white text-sm sm:text-base leading-relaxed">
              Due to the ongoing tensions in Manipur, all upcoming events have been{" "}
              <span className="font-semibold text-red-300">
                postponed until further notice
              </span>.
            </p>

            <p className="text-gray-300 mt-3 text-sm sm:text-base">
              We sincerely apologize for any inconvenience caused and appreciate your understanding and support during this time.
            </p>

            <div className="mt-5 text-sm sm:text-base">
              <p className="text-gray-400">For any queries or assistance:</p>
              <p className="text-green-400 font-semibold mt-1">
                📞 6009449928 / 6009459928
              </p>
            </div>

          </div>

          <br />
          
          <br />
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">


            {/* FEATURED EVENT */}

            <Link href="/matengfest" className="lg:col-span-2">

              <div className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-2xl">

                <Image
                  src="/edufest.png"
                  alt="Mateng Edu Fest"
                  width={1200}
                  height={700}
                  className="w-full h-[320px] sm:h-[420px] object-cover group-hover:scale-105 transition duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute bottom-0 p-8 text-white">

                  {/* <h3 className="text-2xl sm:text-7xl font-semibold">
                    Mateng Edu Fest 2026
                  </h3> */}

                  {/* <p className="text-sm sm:text-base opacity-90 mt-2"> */}
                  <p className="text-base sm:text-lg md:text-3xl opacity-90 mt-2">
                    Pre-NEET • Mathematics • Quiz • Painting Competition • Innovation Challenge
                  </p>

                  <p className="text-yellow-300 mt-3 font-semibold">
                    Explore Event →
                  </p>

                </div>

              </div>

            </Link>



            {/* SECOND EVENT */}
            <Link href="/g15-festival">
              <div
                className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-xl"
              >

                <Image
                  src="/g15-festival.png"
                  alt="G15 Festival"
                  width={600}
                  height={700}
                  className="w-full h-[320px] sm:h-[420px] object-cover group-hover:scale-105 transition duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute bottom-0 p-6 text-white">

                  <h3 className="text-xl font-semibold">
                    G15 Music Festival + Art Fair
                  </h3>

                  <p className="text-sm opacity-90">
                    Music • Art • Nature
                  </p>

                  <p className="text-green-400 mt-2 font-semibold hover:underline">
                    Get Your Pass Now →
                  </p>

                </div>

              </div>
            </Link>
          </div>

        </section>



        {/* WHAT WE DO */}

        <section className="mt-24 px-6 flex flex-col items-center">

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-12">
            What We Do
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl">

            <div className="bg-[#0f172a] p-8 rounded-2xl text-center shadow-md">

              <h3 className="text-lg font-semibold text-white">
                Events & Competitions
              </h3>

              <p className="text-gray-400 text-sm mt-3">
                Structured competitions and events helping students
                showcase their skills.
              </p>

            </div>

            <div className="bg-[#0f172a] p-8 rounded-2xl text-center shadow-md">

              <h3 className="text-lg font-semibold text-white">
                Business Discovery
              </h3>

              <p className="text-gray-400 text-sm mt-3">
                Helping local businesses become discoverable and connect
                with customers.
              </p>

            </div>

            <div className="bg-[#0f172a] p-8 rounded-2xl text-center shadow-md">

              <h3 className="text-lg font-semibold text-white">
                Delivery
              </h3>

              <p className="text-gray-400 text-sm mt-3">
                {/* Reliable hyperlocal delivery and porter services helping businesses move and deliver products quickly and efficiently. */}
                Reliable hyperlocal delivery and porter services helping businesses move and deliver goods quickly.
              </p>

            </div>

          </div>

        </section>



        {/* STATS */}

        <section className="mt-24 flex flex-col items-center text-center">

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">
            Our Impact
          </h2>

          <div className="flex flex-row justify-center gap-6 md:gap-16 text-gray-400 text-lg">

            <div>
              Delivered <span className="text-green-500 font-semibold">
                {Math.floor(parcels)}K
              </span> parcels
            </div>

            <div className="w-[2px] h-7 bg-gray-500/30" />

            <div>
              Merchants <span className="text-green-500 font-semibold">
                {Math.floor(merchants)}+
              </span>
            </div>

            <div className="w-[2px] h-7 bg-gray-500/30" />

            <div>
              Discovered <span className="text-green-500 font-semibold">
                {Math.floor(businesses)}+
              </span> businesses
            </div>

          </div>

        </section>



        {/* DELIVERY CTA */}

        <section className="mt-24 px-6 flex justify-center">

          <div className="bg-gradient-to-r from-[#14710f] to-[#0f550c]
          p-10 rounded-2xl text-white text-center max-w-3xl shadow-xl">

            <h2 className="text-2xl font-bold">
              Need Something Delivered?
            </h2>

            <p className="text-sm opacity-90 mt-3">
              Book a fast and reliable local delivery with Mateng.
            </p>

            <Link href="/delivery-rates">

              <button className="mt-6 px-8 py-3 rounded-full bg-white text-[#14710f] font-semibold shadow-md hover:scale-105 transition">
                Book Delivery
              </button>

            </Link>

          </div>

        </section>

      </div>



      {/* MODAL */}

      {showModal && (

        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">

          <div className="bg-[#0f172a] p-8 rounded-2xl max-w-md w-full text-center shadow-xl">

            <h3 className="text-xl font-semibold text-white">
              Tickets Coming Soon
            </h3>

            <p className="text-gray-400 mt-3 text-sm">
              Online ticket booking for this event will be available soon.
              Stay tuned for updates.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 px-6 py-2 rounded-full bg-[#14710f] text-white font-semibold"
            >
              Close
            </button>

          </div>

        </div>

      )}

{/* TRUSTED PARTNERS */}
{/* TRUSTED PARTNERS */}
<section className="mt-28 px-6 flex flex-col items-center">

  {/* Header */}
  <div className="text-center mb-12">
    <span className="text-xs font-bold tracking-[0.2em] text-green-500/80 uppercase mb-3 block">
      Our Network
    </span>
    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
      Trusted Partners
    </h2>
    <p className="text-white-500 text-sm max-w-md mx-auto">
      Proudly working with 400+ local businesses across Manipur
    </p>
  </div>

  {/* Marquee + Arrows wrapper */}
  <div className="relative w-full max-w-5xl">

    {/* LEFT ARROW */}
    <button
      onClick={() => {
        const el = document.getElementById("partner-track");
        if (el) el.scrollBy({ left: -200, behavior: "smooth" });
      }}
      className="absolute left-0 top-1/2 -translate-y-1/2 z-20
        w-10 h-10 rounded-full
        bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40
        flex items-center justify-center
        text-white transition-all duration-200 shadow-lg backdrop-blur-sm
        -translate-x-1/2"
    >
      ‹
    </button>

    {/* RIGHT ARROW */}
    <button
      onClick={() => {
        const el = document.getElementById("partner-track");
        if (el) el.scrollBy({ left: 200, behavior: "smooth" });
      }}
      className="absolute right-0 top-1/2 -translate-y-1/2 z-20
        w-10 h-10 rounded-full
        bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40
        flex items-center justify-center
        text-white transition-all duration-200 shadow-lg backdrop-blur-sm
        translate-x-1/2"
    >
      ›
    </button>

    {/* Fade edges */}
    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

    {/* Scrollable track — no auto-scroll, manual only */}
    <div
      id="partner-track"
      className="flex gap-5 overflow-x-auto scroll-smooth px-8 pb-2"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`#partner-track::-webkit-scrollbar { display: none; }`}</style>

      {[...PARTNERS, ...PARTNERS].map((partner, i) => (
        <div
          key={i}
          className="flex-shrink-0 group relative w-40 h-24 rounded-2xl flex flex-col items-center justify-center px-5 gap-2
            bg-white/[0.06] border-2 border-white/[0.12]
            hover:bg-white/[0.12] hover:border-green-500/50
            hover:shadow-[0_0_24px_rgba(20,113,15,0.2)]
            transition-all duration-300 cursor-pointer"
        >
          {/* Glow dot top-right */}
          <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-green-500/0 group-hover:bg-green-500/70 transition-all duration-300" />

          <img
            src={partner.logo}
            alt={partner.name}
            className="max-h-10 max-w-[75%] object-contain
              opacity-50 group-hover:opacity-100
              grayscale group-hover:grayscale-0
              transition-all duration-300"
          />
          <span className="text-[11px] font-bold text-white/30 group-hover:text-white/70
            tracking-wide transition-all duration-300 truncate w-full text-center uppercase">
            {partner.name}
          </span>
        </div>
      ))}
    </div>
  </div>

  {/* Bottom stat bar */}
  {/* <div className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-12">
    {[
      { value: "400+", label: "Partner Businesses" },
      { value: "7+",   label: "Categories" },
      { value: "3",    label: "Districts Covered" },
    ].map(({ value, label }) => (
      <div key={label} className="text-center">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
      </div>
    ))}
  </div> */}

</section>

      {/* FOOTER */}

      <footer className="w-full mt-20">
        <Footer />
      </footer>

    </div>

  );

}