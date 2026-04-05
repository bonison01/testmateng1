'use client'

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/footer/Footer";
import styles from "./../matengfest/page.module.css";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const [parcels, setParcels] = useState(0);
  const [merchants, setMerchants] = useState(0);
  const [businesses, setBusinesses] = useState(0);
  const [showModal, setShowModal] = useState(false);

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

        



        {/* APPLE STYLE EVENTS */}

        <section className="w-full flex flex-col items-center px-4 mt-10">

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">
            Upcoming Events
          </h2>
          <div className={styles.noticeContainer}>
      <h4
        className={styles.heroTitle1}
        onClick={() => router.push("/preneet/admit-card")}
        style={{ cursor: "pointer" }}
      >
        Download your Pre-NEET admit card here
      </h4>
    </div>
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

            <Link href="/matengfest">
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



      {/* FOOTER */}

      <footer className="w-full mt-20">
        <Footer />
      </footer>

    </div>

  );

}