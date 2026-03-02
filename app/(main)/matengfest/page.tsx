"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
            {/* <button
              onClick={() => setShowModal(true)}
              className={styles.primaryBtn}
            >
              Register Now
            </button> */}

            <button
              onClick={() => setShowModal(true)}
              className={styles.secondaryBtn}
            >
              Download Brochure
            </button>
          </div>
        </motion.div>
      </section>


      {/* PRE-NEET FEATURE BLOCK */}
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

            {/* ✅ WORKING BUTTON */}
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
                <li><strong>Exam Date:</strong> 29 March 2026 (Sunday)</li>
              </ul>
            </div>
          </div>

          <div className={styles.prizeCard}>
            <h3>Top Rewards</h3>
            <ul>
              <li>₹30,000 – 1st Prize</li>
              <li>₹15,000 – 2nd Prize</li>
              <li>₹10,000 – 3rd Prize</li>
              <li>10 Consolations</li>
              <li><strong>Best Institute Award</strong></li>
            </ul>
          </div>
        </div>
      </section>


      {/* SEGMENTS */}
      <section className={styles.segments}>
        <h2 className={styles.sectionTitle}>Championship Segments</h2>
        <h4>Registration links for other upcoming events will be available soon.</h4>

        <div className={styles.segmentGrid}>
          <div className={styles.segmentCard}>
            <h3>Pre-NEET Competition</h3>
            <p>UG-Neet Aspirants</p>
            <p>₹250 Registration</p>
          </div>

          <div className={styles.segmentCard}>
            <h3>Mathematics Championship</h3>
            <p>Class 3–8</p>
            <p>₹200 Registration</p>
          </div>

          <div className={styles.segmentCard}>
            <h3>Quiz Championship</h3>
            <p>Class 6–10</p>
            <p>₹300 Registration</p>
          </div>

          <div className={styles.segmentCard}>
            <h3>Young Innovators Challenge</h3>
            <p>Science • Technology • Research</p>
            <p>Class 9–12</p>
          </div>
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