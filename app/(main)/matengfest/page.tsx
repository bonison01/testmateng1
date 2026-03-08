"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MatengFestPage() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  return (
    <div className={styles.container}>

      {/* HERO */}
      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.heroInner}
        >
          <Image
            src="/mateng-edufest-logo.png"
            alt="Mateng EduFest 2026"
            width={600}
            height={100}
            priority
          />

          <h1 className={styles.heroTitle}>
            Academic Excellence Platform 2026
          </h1>

          <p className={styles.heroSub}>
            Competitive • Structured • Scholarship Driven
          </p>

          <div className={styles.heroButtons}>
            <button
              onClick={() => window.open("/Mateng Edu Fest.pdf", "_blank")}
              className={styles.secondaryBtn}
            >
              Download Brochure
            </button>
          </div>
        </motion.div>
      </section>

      {/* CO-POWERED SECTION (Reduced Gap) */}
      <div className="w-full flex justify-center px-4 mt-10">

        <Link
          href="https://kangleicareersolution.co.in/index"
          target="_blank"
          className="w-full sm:w-[95vw] md:w-[85vw] lg:w-[75vw]"
        >
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition">

            <div className="px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-10">

              {/* Left Content */}
              <div className="text-center md:text-left max-w-xl">
                <h1 className="text-2xl md:text-4xl font-extrabold text-[#14710f] tracking-tight">
                  Co-Powered By
                </h1>

                <p className="text-base md:text-lg text-gray-600 mt-3">
                  In Strategic Partnership With
                </p>

                <p className="text-sm md:text-base mt-4 font-semibold text-gray-800">
                  Empowering Students Through Structured Competitive Platforms
                </p>
              </div>

              {/* Logo */}
              <div className="bg-gray-50 rounded-2xl px-10 py-8 shadow-md">
                <Image
                  src="/kanglei.png"
                  alt="Kanglei Career Solutions"
                  width={260}
                  height={120}
                />
              </div>

            </div>
          </div>
        </Link>

      </div>

      {/* PRE-NEET FEATURE */}
      <section className={styles.feature}>
        <div className={styles.featureGrid}>
          <div>
            <h2>Pre-NEET Competition</h2>

            <p className={styles.highlight}>
              First Structured Pre-NEET Platform in Manipur.
              A Real-Time NEET Performance Experience.
            </p>

            <p>
              All participants will be eligible for a ₹1,00,000 scholarship
              if they choose to pursue MBBS abroad through Mateng Events.
            </p>

            <p className={styles.meta}>Registration Fee: ₹250</p>

            <button
              type="button"
              onClick={() => router.push("/preneet")}
              style={{
                marginTop: "16px",
                padding: "12px 22px",
                backgroundColor: "#14710F",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "15px"
              }}
            >
              Register for Pre-NEET
            </button>

            <div className={styles.dateBox}>
              <h4>Important Dates</h4>
              <ul>
                <li><strong>Last Date:</strong> 25 March 2026</li>
                <li><strong>Admit Card:</strong> 27 March 2026</li>
                <li><strong>Exam Date:</strong> 30th March 2026 (Monday)</li>
              </ul>
            </div>
          </div>

          <div className={styles.prizeCard}>
            <h3>Top Rewards</h3>
            <ul>
              <li><strong>1st Prize:</strong> ₹30,000 + Certificate + Book worth ₹1,000 + T-shirt</li>
              <li><strong>2nd Prize:</strong> ₹15,000 + Certificate + Book worth ₹1,000 + T-shirt</li>
              <li><strong>3rd Prize:</strong> ₹10,000 + Certificate + Book worth ₹1,000 + T-shirt</li>
              <li><strong>10 Consolation Prizes:</strong> Cash Prize + Certificate + Book worth ₹2,000 + T-shirt</li>
              <li><strong>Best Institute Award</strong></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ACADEMIC PARTNER SECTION */}
      <div className="w-full flex justify-center px-4 mt-6">
        <div className="w-full sm:w-[95vw] md:w-[85vw] lg:w-[75vw] 
            rounded-2xl border border-gray-200 
            bg-white shadow-sm">

          <div className="px-10 py-12 
              flex flex-col md:flex-row 
              items-center justify-between 
              gap-10">

            {/* Left Content */}
            <div className="text-center md:text-left max-w-xl">
              <h1 className="text-2xl md:text-4xl font-extrabold text-[#14710f] tracking-tight">
                Academic Partner
              </h1>

              <p className="text-base md:text-lg text-gray-600 mt-3">
                In Collaboration With
              </p>

              <p className="text-sm md:text-base mt-4 font-semibold text-gray-800">
                Supporting Educational Growth Through Strategic Academic Partnership
              </p>
            </div>

            {/* Logo */}
            <a
              href="https://www.facebook.com/khan.sarori"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="bg-gray-50 rounded-2xl px-10 py-8 shadow-md cursor-pointer hover:shadow-lg transition">
                <Image
                  src="/nefsa.png"
                  alt="Academic Partner"
                  width={260}
                  height={120}
                />
              </div>
            </a>

          </div>
        </div>
      </div>

      {/* CHAMPIONSHIP SEGMENTS (CTA Buttons) */}
      <section className={styles.segments}>
        <h2 className={styles.sectionTitle}>Championship Segments</h2>
        <h4>Registration links for other upcoming events will be available soon.</h4>

        <div className={styles.segmentGrid}>

          <button
            className={styles.segmentCard}
            onClick={() => router.push("/preneet")}
          >
            <h3>Pre-NEET Competition</h3>
            <p>UG-Neet Aspirants</p>
            <p>₹250 Registration</p>
            <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
              Last Date of Registration: 25th March 2026.
            </p>
            <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
              Exam Date: 29th March 2026
            </p>
          </button>

          <button
            className={styles.segmentCard}
            // onClick={() => router.push("/maths")}
            onClick={() => setShowModal(true)}
          >
            <h3>Mathematics Championship</h3>
            <p>Class 3–8</p>
            <p>₹200 Registration</p>
            <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
              April last week / May first week.
              Venue & exact date will be announced soon.
            </p>
          </button>

          <button
            className={styles.segmentCard}
            // onClick={() => router.push("/quiz")}
            onClick={() => setShowModal(true)}
          >
            <h3>Quiz Championship</h3>
            <p>Class 6–10</p>
            <p>₹300 Registration</p>
            <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
              June 2026.
              Venue & exact date will be announced soon.
            </p>
          </button>

          <button
            className={styles.segmentCard}
            // onClick={() => router.push("/innovators")}
            onClick={() => setShowModal(true)}

          >
            <h3>Young Innovators Challenge</h3>
            <p>Science • Technology • Research</p>
            <p>Class 9–12</p>
            <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
              June 2026.
              Venue & exact date will be announced soon.
            </p>
          </button>

        </div>
      </section>

      {/* GRAND FINAL */}
      <section className={styles.grandFinal}>
        <h2 className={styles.sectionTitle}>Grand Final Event – June 2026</h2>

        <div className={styles.grandCard}>
          <p>
            The Grand Final Event will be conducted in June 2026.
            Venue and exact time will be announced soon.
          </p>

          <h4>On-Spot Competitions:</h4>
          <ul>
            <li>Grand Final Quiz Competition</li>
            <li>Painting Competition</li>
            <li>Young Innovators Challenge</li>
          </ul>

          <p>
            The Grand Final will also include the Prize Distribution Ceremony
            for all Mateng EduFest 2026 championship segments.
          </p>
        </div>
      </section>

      {/* MODAL */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>Available Soon</h3>
            <p>For more details contact:</p>
            <p>+91 70855 71865</p>

            <button
              onClick={() => setShowModal(false)}
              className={styles.closeBtn}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className={styles.footer}>
        © 2026 Justmateng Service Pvt. Ltd.
      </footer>

    </div>
  );
}