"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── TIMELINE DATA ────────────────────────────────────────────────
const timelineEvents = [
  {
    id: "preneet",
    date: "7th April 2026",
    name: "Pre-NEET Competition",
    chips: ["UG NEET Aspirants", "₹250 Fee", "Tuesday"],
    open: true,
    body: "First structured Pre-NEET simulation platform in Manipur. A real-time NEET-pattern exam with 180 questions across Physics, Chemistry, and Biology.",
    info: [
      { label: "Admit Card", value: "5th April 2026" },
      { label: "Venue", value: "Manipur University, Imphal" },
      { label: "Duration", value: "3 hours 20 minutes" },
      { label: "Last Date", value: "4th April 2026" },
    ],
    prizes: [
      ["1st Prize", "₹30,000 + Book worth ₹1,000 + Certificate"],
      ["2nd Prize", "₹15,000 + Book worth ₹1,000 + Certificate"],
      ["3rd Prize", "₹10,000 + Book worth ₹1,000 + Certificate"],
      ["10 Consolation Prizes", "Cash + Book worth ₹1,000 + Certificate"],
      ["Best Institute Award", "Special Recognition"],
      ["MBBS Scholarship", "₹1,00,000 (abroad via Mateng Events)"],
    ],
    registerHref: "/preneet",
    rulesHref: "/preneetrules",
  },
  {
    id: "maths",
    date: "26th April 2026",
    name: "Mathematics Championship",
    chips: ["Class 3–8", "₹200 Fee"],
    open: false,
    body: "A rigorous mathematics olympiad to identify and celebrate young math talent across primary and middle school students in Manipur.",
    info: [
      { label: "Venue", value: "Kakching, Thoubal, Bishnupur, Imphal West" },
      { label: "Format", value: "MCQ" },
      { label: "Duration", value: "2 hours" },
      { label: "Last Date", value: "TBA" },
    ],
    prizes: [
      ["1st Prize", "₹3,000(each Category) + Certificate +  Book worth 1000 + T shirt"],
                ["2nd Prize", "₹2,000(each Category) + Certificate + Book worth 1000 + T shirt"],
                ["3rd Prize", "₹1,000(each Category)  + Certificate +  Book worth 1000 + T shirt"],
                ["5 Consolation Prizes", "Cash + Certificate"],
      ["Best School Award", "Special Trophy"],
    ],
  },
  {
    id: "grand",
    date: "24th May 2026",
    name: "Grand Final — Multi-Event Day",
    chips: ["All Segments", "Prize Ceremony"],
    open: false,
    body: "The culminating event of Mateng EduFest 2026. Three on-spot championships plus the grand prize distribution ceremony for all segment winners.",
    info: [
      { label: "Events", value: "Quiz · Painting · Innovators" },
      { label: "Venue", value: "To be announced" },
      { label: "Ceremony", value: "All segment prizes distributed" },
    ],
    prizes: [
      ["Quiz Championship", "Class 6–10 · ₹300"],
      ["Painting Championship", "Class 3–8 · ₹200"],
      ["Young Innovators", "Class 9–12 · Open"],
      ["Prize Ceremony", "All segment winners felicitated"],
    ],
  },
];

// ─── SEGMENT DATA ─────────────────────────────────────────────────
const segments = [
  {
    id: "preneet",
    name: "Pre-NEET Competition",
    sub: "UG NEET Aspirants",
    fee: "₹250",
    date: "7th April 2026",
    open: true,
    about:
      "A real-time NEET simulation exam — the first of its kind in Manipur. 180 questions across Physics, Chemistry, and Biology. All participants are eligible for a ₹1,00,000 scholarship toward MBBS abroad through Mateng Events.",
    info: [
      { label: "Eligibility", value: "NEET 2026 Aspirants" },
      { label: "Duration", value: "3 hours 20 min" },
      { label: "Format", value: "180 Questions (PCB)" },
      { label: "Last Date", value: "4th April 2026" },
      { label: "Admit Card", value: "5th April 2026" },
      { label: "Venue", value: "Naoremthong, Imphal" },
    ],
    prizes: [
      ["1st Prize", "₹30,000 + Book worth ₹1,000 + Certificate"],
      ["2nd Prize", "₹15,000 + Book worth ₹1,000 + Certificate"],
      ["3rd Prize", "₹10,000 + Book worth ₹1,000 + Certificate"],
      ["10 Consolation Prizes", "Cash + Book + Certificate"],
      ["Best Institute Award", "Special Recognition"],
      ["MBBS Scholarship", "₹1,00,000 (abroad)"],
    ],
    registerHref: "/preneet",
    rulesHref: "/preneetrules",
  },
  {
    id: "maths",
    name: "Mathematics Championship",
    sub: "Class 3 – 8",
    fee: "₹200",
    date: "26th April 2026",
    open: false,
    about:
      "A structured mathematics olympiad designed to challenge and celebrate young problem-solvers. Topics span arithmetic, geometry, logical reasoning, and applied mathematics across age-appropriate difficulty levels for Class 3 to 8.",
    info: [
      { label: "Eligibility", value: "Class 3 to 8" },
      { label: "Duration", value: "2 hours" },
      { label: "Format", value: "MCQ" },
      { label: "Last Date", value: "20th April 2026" },
      { label: "Venue", value: "Kakching, Thoubal, Bishnupur, Imphal West" },
    ],
    prizes: [
      ["1st Prize", "₹3,000(each Category) + Certificate +  Book worth 1000 + T shirt"],
                ["2nd Prize", "₹2,000(each Category) + Certificate + Book worth 1000 + T shirt"],
                ["3rd Prize", "₹1,000(each Category)  + Certificate +  Book worth 1000 + T shirt"],
                ["5 Consolation Prizes", "Cash + Certificate"],
      ["Best School Award", "Special Trophy"],
    ],
  },
  {
    id: "painting",
    name: "Painting Championship",
    sub: "Class 3–8 (Open)",
    fee: "₹200",
    date: "24th May 2026",
    open: false,
    about:
      "An on-the-spot painting competition exploring creativity and artistic expression. Themes will be revealed on the day of the event. All basic art materials will be provided on site.",
    info: [
      { label: "Eligibility", value: "Class 3 to 8 (Open)" },
      { label: "Duration", value: "2 hours" },
      { label: "Format", value: "On-spot painting" },
      { label: "Last Date", value: "TBA" },
      { label: "Venue", value: "To be announced" },
    ],
    prizes: [
      ["1st Prize", "₹3,000 + Certificate + Trophy + Book worth 1000 + T shirt"],
      ["2nd Prize", "₹1,500 + Certificate +  Book worth 1000 + T shirt"],
      ["3rd Prize", "₹1,000 + Certificate + Book worth 1000 + T shirt"],
      ["Consolation Prizes", "Certificate + Goodies"],
    ],
  },
  {
    id: "quiz",
    name: "Quiz Championship",
    sub: "Class 6 – 10",
    fee: "₹300",
    date: "24th May 2026",
    open: false,
    about:
      "A multi-round quiz championship covering General Knowledge, Science, History, Current Affairs, and Logical Reasoning. Top teams from the preliminary round advance to the Grand Final stage.",
    info: [
      { label: "Eligibility", value: "Class 6 to 10" },
      { label: "Duration", value: "2.5 hours" },
      { label: "Format", value: "Preliminary + Finals" },
      { label: "Last Date", value: "TBA" },
      { label: "Venue", value: "To be announced" },
    ],
    prizes: [
      ["1st Prize", "Cash + Certificate + Trophy"],
      ["2nd Prize", "Cash + Certificate"],
      ["3rd Prize", "Cash + Certificate"],
      ["Best Speaker", "Special Award"],
    ],
  },
  {
    id: "innovators",
    name: "Young Innovators Challenge",
    sub: "Class 9–12 · Science & Tech",
    fee: "Open",
    date: "24th May 2026",
    open: false,
    about:
      "Students present original projects, research, or innovations in Science, Technology, Engineering, or Mathematics. Individual and team entries are welcome. Projects are evaluated on originality, feasibility, and presentation quality.",
    info: [
      { label: "Eligibility", value: "Class 9 to 12" },
      { label: "Duration", value: "Project Presentation" },
      { label: "Format", value: "Science · Technology · Research" },
      { label: "Last Date", value: "TBA" },
      { label: "Venue", value: "TBA" },
    ],
    prizes: [
      ["Best Innovation", "5000 + Certificate + Mentorship + Book worth 2000 + Tshirt"],
      ["2nd Prize", "3000 + Certificate + Book worth 1000 + Tshirt"],
      ["3rd Prize", "2000 + Certificate + Book worth 1000 + Tshirt"],
      ["Best Presentation", "Special Award"],
    ],
  },
];

// ─── TYPES ────────────────────────────────────────────────────────
type Segment = (typeof segments)[number];

// ─── MAIN PAGE ────────────────────────────────────────────────────
export default function MatengFestPage() {
  const [openTl, setOpenTl] = useState<string | null>("preneet");
  const [modalSeg, setModalSeg] = useState<Segment | null>(null);
  const router = useRouter();

  const toggleTl = (id: string) =>
    setOpenTl((prev) => (prev === id ? null : id));

  return (
    <div className={styles.container}>

      {/* ── HERO ── */}
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
          <h1 className={styles.heroTitle}>Academic Excellence Platform 2026</h1>
          <p className={styles.heroSub}>Competitive • Structured • Scholarship Driven</p>
          <div className={styles.heroButtons}>
  {/* <button
    onClick={() => window.open("/Mateng Edu Fest.pdf", "_blank")}
    className={styles.secondaryBtn}
  >
    Download Brochure
  </button> */}
  <button
    onClick={() => router.push("/preneet")}
    className={styles.secondaryBtn}
  >
    Register for Pre-NEET
  </button>
  <button
    onClick={() => router.push("/edufest")}
    className={styles.primaryBtn}
  >
    Register for EduFest →
  </button>
</div>
        </motion.div>
      </section>

      {/* ── CO-POWERED ── */}
      <div className="w-full flex justify-center px-4 mt-10">
        <Link
          href="https://kangleicareersolution.co.in/index"
          target="_blank"
          className="w-full sm:w-[95vw] md:w-[85vw] lg:w-[75vw]"
        >
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
            <div className="px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="text-center md:text-left max-w-xl">
                <h1 className="text-2xl md:text-4xl font-extrabold text-[#14710f] tracking-tight">Co-Powered By</h1>
                <p className="text-base md:text-lg text-gray-600 mt-3">In Strategic Partnership With</p>
                <p className="text-sm md:text-base mt-4 font-semibold text-gray-800">
                  Empowering Students Through Structured Competitive Platforms
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl px-10 py-8 shadow-md">
                <Image src="/kanglei.png" alt="Kanglei Career Solutions" width={260} height={120} />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ── INTERACTIVE TIMELINE ── */}
      <section className={styles.timelineSection}>
        <h2 className={styles.sectionTitle}>EduFest Timeline</h2>

        {/* Horizontal pin row — exact layout from screenshot */}
        <div className={styles.timelineWrapper}>
          <div className={styles.timelineLine} />

          {timelineEvents.map((ev) => {
            const isOpen = openTl === ev.id;
            return (
              <motion.div
                key={ev.id}
                className={styles.timelineItem}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Clickable pin */}
                <button
                  onClick={() => toggleTl(ev.id)}
                  className={`${styles.timelineCircleBtn} ${isOpen ? styles.timelineCircleActive : ""}`}
                  aria-label={`Toggle ${ev.name}`}
                />

                <h4>{ev.date}</h4>

                {ev.id === "grand" ? (
                  <>
                    <p className={styles.grandLabel}>Grand Final</p>
                    <div className={styles.eventGroup}>
                      <p>Painting Competition</p>
                      <p>Quiz Championship</p>
                      <p>Young Innovators Challenge</p>
                      <p>Prize Distribution Ceremony</p>
                    </div>
                  </>
                ) : (
                  <p>{ev.name}</p>
                )}

                {ev.open && (
                  <span className={styles.tlPinOpenBadge}>Open</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Expand panel — rendered below the full timeline row */}
        <AnimatePresence initial={false}>
          {openTl && (() => {
            const ev = timelineEvents.find((e) => e.id === openTl);
            if (!ev) return null;
            return (
              <motion.div
                key={openTl}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <div className={styles.tlDetailPanel}>
                  <div className={styles.tlDetailLeft}>
                    <div className={styles.tlChips}>
                      {ev.chips.map((c) => (
                        <span key={c} className={styles.tlChip}>{c}</span>
                      ))}
                      {ev.open && (
                        <span className={`${styles.tlChip} ${styles.tlChipGreen}`}>
                          Registration Open
                        </span>
                      )}
                    </div>

                    <p className={styles.tlBody}>{ev.body}</p>

                    <div className={styles.tlInfoGrid}>
                      {ev.info.map((row) => (
                        <div key={row.label} className={styles.tlInfoRow}>
                          <span className={styles.tlInfoLabel}>{row.label}</span>
                          <span className={styles.tlInfoValue}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.tlCta}>
                      {ev.open ? (
                        <>
                          <button
                            onClick={() => router.push(ev.registerHref!)}
                            className={styles.primaryBtn}
                          >
                            Register Now
                          </button>
                          <button
                            onClick={() => router.push(ev.rulesHref!)}
                            className={styles.secondaryBtn}
                          >
                            Rules &amp; Regulations
                          </button>
                        </>
                      ) : (
                        <button
                          className={styles.secondaryBtn}
                          onClick={() => {
                            const seg = segments.find((s) => s.id === ev.id);
                            if (seg) setModalSeg(seg);
                          }}
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.tlDetailRight}>
                    <p className={styles.tlPrizesTitle}>Prizes &amp; Rewards</p>
                    <ul className={styles.tlPrizeList}>
                      {ev.prizes.map(([rank, reward]) => (
                        <li key={rank}>
                          <strong>{rank}:</strong> {reward}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </section>

      {/* ── PRE-NEET FEATURE ── */}
      <section className={styles.feature}>
        <div className={styles.featureGrid}>
          <div>
            <h2>Pre-NEET Competition</h2>
            <p className={styles.highlight}>
              First Structured Pre-NEET Platform in Manipur. A Real-Time NEET Performance Experience.
            </p>
            <p>
              All participants will be eligible for a ₹1,00,000 scholarship if they choose to
              pursue MBBS abroad through Mateng Events.
            </p>
            <p className={styles.meta}>Registration Fee: ₹250</p>
            <button
              type="button"
              onClick={() => router.push("/preneet")}
              style={{
                marginTop: "16px", padding: "12px 22px",
                backgroundColor: "#14710F", color: "#ffffff",
                border: "none", borderRadius: "8px",
                fontWeight: "600", cursor: "pointer",
                fontSize: "15px", marginRight: "10px",
              }}
            >
              Register for Pre-NEET
            </button>
            <button
              type="button"
              onClick={() => router.push("/preneetrules")}
              style={{
                marginTop: "16px", padding: "12px 22px",
                backgroundColor: "#ffffff", color: "#14710F",
                border: "2px solid #14710F", borderRadius: "8px",
                fontWeight: "600", cursor: "pointer", fontSize: "15px",
              }}
            >
              Rules &amp; Regulations
            </button>
            <div className={styles.dateBox}>
              <h2>Important Dates &amp; Venue</h2>
              <ul>
                <li><strong>Last Date:</strong> 04th April 2026</li>
                <li><strong>Admit Card:</strong> 05th April 2026</li>
                <li><strong>Exam Date:</strong> 7th April 2026 (Tuesday)</li>
                <h4><strong>Venue: </strong>Manipur University, Imphal</h4>
              </ul>
            </div>
          </div>
          <div className={styles.prizeCard}>
            <h2><strong>Top Rewards</strong></h2>
            <ul>
              <li><strong>1st Prize:</strong> ₹30,000 + Book worth ₹1,000 + Certificate of Appreciation</li>
              <li><strong>2nd Prize:</strong> ₹15,000 + Book worth ₹1,000 + Certificate of Appreciation</li>
              <li><strong>3rd Prize:</strong> ₹10,000 + Book worth ₹1,000 + Certificate of Appreciation</li>
              <li><strong>10 Consolation Prizes:</strong> Cash Prize + Book worth ₹1,000 + Certificate</li>
              <li><strong>Best Institute Award</strong></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── MATHEMATICS SECTION ── */}
      <section className={styles.mathsSection}>
        <h2 className={styles.sectionTitle}>Mathematics Championship</h2>
        <div className={styles.mathsCard}>
          <div className={styles.mathsHeader}>
            <div className={styles.mathsIconWrap}>∑</div>
            <div>
              <h3 className={styles.mathsTitle}>Mathematics Championship</h3>
              <p className={styles.mathsSub}>
                First structured math olympiad for young minds in Manipur — Class 3 to 8
              </p>
            </div>
          </div>

          <div className={styles.mathsBody}>
            {/* Left: details */}
            <div className={styles.mathsCol}>
              <p className={styles.mathsColLabel}>Event Details</p>
              {[
                ["Eligibility", "Class 3 – 8"],
                ["Registration Fee", "₹200"],
                ["Exam Date", "26th April 2026"],
                ["Venue", "Kakching, Thoubal, Bishnupur, Imphal West"],
                ["Duration", "2 hours"],
                ["Format", "MCQ"],
              ].map(([k, v]) => (
                <div key={k} className={styles.mathsRow}>
                  <span className={styles.mathsRowLabel}>{k}</span>
                  <span className={styles.mathsRowVal}>{v}</span>
                </div>
              ))}
            </div>

            {/* Right: prizes */}
            <div className={styles.mathsCol}>
              <p className={styles.mathsColLabel}>Prizes &amp; Rewards</p>
              {[
                ["1st Prize", "₹3,000(each Category) + Certificate +  Book worth 1000 + T shirt"],
                ["2nd Prize", "₹2,000(each Category) + Certificate + Book worth 1000 + T shirt"],
                ["3rd Prize", "₹1,000(each Category)  + Certificate +  Book worth 1000 + T shirt"],
                ["25 Consolation Prizes", "Cash + Certificate"],
                ["Best School Award", "Special Trophy"],
              ].map(([rank, reward]) => (
                <div key={rank} className={styles.mathsPrizeRow}>
                  <strong>{rank}</strong>
                  <span>{reward}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.mathsFooter}>
            <span className={styles.mathsNote}>Registration link opening soon</span>
            <button className={styles.secondaryBtn} onClick={() => setModalSeg(segments.find((s) => s.id === "maths")!)}>
              Full Details
            </button>
            <button
              className={styles.primaryBtn}
              onClick={() => setModalSeg(segments.find((s) => s.id === "maths")!)}
            >
              Register →
            </button>
          </div>
        </div>
      </section>

      {/* ── ACADEMIC PARTNER ── */}
      <div className="w-full flex justify-center px-4 mt-6">
        <div className="w-full sm:w-[95vw] md:w-[85vw] lg:w-[75vw] rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left max-w-xl">
              <h1 className="text-2xl md:text-4xl font-extrabold text-[#14710f] tracking-tight">Academic Partner</h1>
              <p className="text-base md:text-lg text-gray-600 mt-3">In Collaboration With</p>
              <p className="text-sm md:text-base mt-4 font-semibold text-gray-800">
                Supporting Educational Growth Through Strategic Academic Partnership
              </p>
            </div>
            <a href="https://www.facebook.com/khan.sarori" target="_blank" rel="noopener noreferrer">
              <div className="bg-gray-50 rounded-2xl px-10 py-8 shadow-md cursor-pointer hover:shadow-lg transition">
                <Image src="/nefsa.png" alt="Academic Partner" width={260} height={120} />
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* ── CHAMPIONSHIP SEGMENTS ── */}
      <section className={styles.segments}>
        <h2 className={styles.sectionTitle}>Championship Segments</h2>
        <p className={styles.segmentsNote}>
          Click any segment to view full details and registration options.
        </p>

        <div className={styles.segmentGrid}>
          {segments.map((seg) => (
            <button
              key={seg.id}
              className={styles.segmentCard}
              onClick={() => setModalSeg(seg)}
            >
              {/* Badge */}
              {seg.open ? (
                <span className={styles.segOpenBadge}>Open</span>
              ) : (
                <span className={styles.segSoonBadge}>Soon</span>
              )}

              <h3>{seg.name}</h3>
              <p>{seg.sub}</p>
              <p className={styles.segFee}>₹{seg.fee.replace("₹", "")} Registration</p>
              <p className={styles.segDate}>{seg.date}</p>

              <span className={styles.segViewBtn}>View Details →</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── GRAND FINAL ── */}
      <section className={styles.grandFinal}>
  <h2 className={styles.sectionTitle}>Grand Final Event – 24th May 2026</h2>
  <div className={styles.grandCard}>
    <p>The Grand Final Event will be conducted on 24th May 2026. Venue will be announced soon.</p>
    <h4>On-Spot Competitions:</h4>
    <ul>
      <li>Grand Final Quiz Competition</li>
      <li>Painting Competition</li>
      <li>Young Innovators Challenge</li>
    </ul>
    <p>
      The Grand Final will also include the Prize Distribution Ceremony for all Mateng EduFest
      2026 championship segments.
    </p>
    {/* ── NEW BUTTON ── */}
    <button
      type="button"
      onClick={() => router.push("/edufest")}
      style={{
        marginTop: "20px", padding: "12px 24px",
        backgroundColor: "#14710F", color: "#ffffff",
        border: "none", borderRadius: "8px",
        fontWeight: "600", cursor: "pointer",
        fontSize: "15px",
      }}
    >
      Register for EduFest →
    </button>
  </div>
</section>

      {/* ── SEGMENT MODAL ── */}
      <AnimatePresence>
        {modalSeg && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalSeg(null);
            }}
          >
            <motion.div
              className={styles.modalBox}
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25 }}
            >
              {/* Header */}
              <div className={styles.modalHead}>
                <div>
                  <h3 className={styles.modalTitle}>{modalSeg.name}</h3>
                  <p className={styles.modalSub}>
                    {modalSeg.sub} · {modalSeg.fee} Registration
                  </p>
                </div>
                <button className={styles.modalClose} onClick={() => setModalSeg(null)}>✕</button>
              </div>

              {/* Body */}
              <div className={styles.modalBody}>
                {/* About */}
                <div className={styles.modalSection}>
                  <p className={styles.modalSectionLabel}>About</p>
                  <p className={styles.modalAbout}>{modalSeg.about}</p>
                </div>

                {/* Info grid */}
                <div className={styles.modalSection}>
                  <p className={styles.modalSectionLabel}>Event Info</p>
                  <div className={styles.modalInfoGrid}>
                    {modalSeg.info.map((row) => (
                      <div key={row.label} className={styles.modalInfoCell}>
                        <span className={styles.modalInfoLabel}>{row.label}</span>
                        <span className={styles.modalInfoVal}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prizes */}
                <div className={styles.modalSection}>
                  <p className={styles.modalSectionLabel}>Prizes &amp; Rewards</p>
                  <table className={styles.modalPrizeTable}>
                    <tbody>
                      {modalSeg.prizes.map(([rank, reward]) => (
                        <tr key={rank}>
                          <td className={styles.modalPrizeRank}>{rank}</td>
                          <td className={styles.modalPrizeReward}>{reward}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              {/* Footer */}
<div className={styles.modalFooter}>
  {modalSeg.open && modalSeg.registerHref ? (
    <button
      className={styles.primaryBtn}
      onClick={() => {
        setModalSeg(null);
        router.push(modalSeg.registerHref!);
      }}
    >
      Register Now →
    </button>
  ) : (
    <button
      className={styles.primaryBtn}
      onClick={() => {
        setModalSeg(null);
        router.push("/edufest");
      }}
    >
      Register on EduFest →
    </button>
  )}
  <button className={styles.secondaryBtn} onClick={() => setModalSeg(null)}>
    Close
  </button>
  <span className={styles.modalContact}>Contact: +91 70855 71865</span>
</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>© 2026 Justmateng Service Pvt. Ltd.</footer>
    </div>
  );
}