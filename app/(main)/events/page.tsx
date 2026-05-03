"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type CategoryId =
  | "all" | "education" | "concerts" | "business"
  | "medical" | "sports" | "cultural" | "workshops" | "exhibitions";
export type EventStatus = "upcoming" | "ongoing" | "past" | "postponed" | "open" | "cancelled";

export interface Banner {
  id: string; title: string; subtitle?: string; image_url: string;
  link_href?: string; link_label?: string; bg_color?: string; display_order: number;
}
export interface LineupItem {
  id: string; role: string; name: string; sub_role?: string; genre?: string;
  origin?: string; company?: string; team?: string; avatar_initials?: string;
  avatar_color?: string; photo_url?: string; upcoming_shows?: number; topic?: string;
}
export interface ScheduleItem { id: string; slot_label: string; title: string; speaker_name?: string; display_order: number; }
export interface PrizeItem { id: string; rank_label: string; reward: string; display_order: number; }
export interface DBEvent {
  id: string; title: string; subtitle?: string; category: CategoryId; status: EventStatus;
  tags: string[]; featured: boolean; accent_color: string; description: string;
  organizer_name: string; date_start: string; date_end?: string; time_start?: string;
  venue: string; city: string; fee_label: string; capacity?: number; attendees_count?: number;
  sponsors: string[]; register_href?: string;
  // ── public event page path ──
  page_href?: string;
  contact_phone?: string; contact_email?: string; contact_name?: string;
  website_url?: string; maps_url?: string; social_instagram?: string; social_facebook?: string;
  lineup: LineupItem[]; schedule: ScheduleItem[]; prizes: PrizeItem[];
}

export const CATEGORIES: { id: CategoryId; label: string; icon: string; accent: string }[] = [
  { id: "all", label: "All Events", icon: "◈", accent: "#374151" },
  { id: "education", label: "Education", icon: "◎", accent: "#14710f" },
  { id: "concerts", label: "Concerts", icon: "♪", accent: "#7c3d94" },
  { id: "business", label: "Business", icon: "◇", accent: "#1a56a8" },
  { id: "medical", label: "Medical", icon: "✦", accent: "#b91c1c" },
  { id: "sports", label: "Sports", icon: "◉", accent: "#b45309" },
  { id: "cultural", label: "Cultural", icon: "❋", accent: "#0e7490" },
  { id: "workshops", label: "Workshops", icon: "⬡", accent: "#c2410c" },
  { id: "exhibitions", label: "Exhibitions", icon: "▣", accent: "#4338ca" },
];

function statusConfig(s: EventStatus) {
  return ({ upcoming: { label: "Upcoming", color: "#1a56a8", bg: "#eff6ff" }, open: { label: "Open Now", color: "#14710f", bg: "#f0fdf4" }, ongoing: { label: "Live Now", color: "#b91c1c", bg: "#fef2f2" }, past: { label: "Past", color: "#6b7280", bg: "#f9fafb" }, postponed: { label: "Postponed", color: "#92400e", bg: "#fffbeb" }, cancelled: { label: "Cancelled", color: "#6b7280", bg: "#f3f4f6" } } as any)[s] ?? { label: s, color: "#6b7280", bg: "#f9fafb" };
}
function timeAgo(d: string) { const diff = new Date(d).getTime() - Date.now(); const days = Math.round(Math.abs(diff) / 86400000); if (diff > 0) return `in ${days}d`; if (days === 0) return "today"; return `${days}d ago`; }
function lineupLabel(items: LineupItem[]) { if (!items?.length) return ""; const r = items.map(i => i.role); if (r.includes("artist") || r.includes("performer")) return "Artists"; if (r.includes("speaker")) return "Speakers"; if (r.includes("athlete")) return "Athletes"; if (r.includes("exhibitor")) return "Exhibitors"; return "Participants"; }

function AvatarCircle({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color + "22", border: `1.5px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.33), fontWeight: 700, color, flexShrink: 0 }}>{initials || "?"}</div>;
}
function StatusPill({ status }: { status: EventStatus }) {
  const cfg = statusConfig(status);
  return <span style={{ padding: "2px 9px", borderRadius: 999, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, border: `1px solid ${cfg.color}33`, display: "inline-flex", alignItems: "center", gap: 4 }}>{status === "open" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, display: "inline-block", animation: "pulse 2s infinite" }} />}{cfg.label}</span>;
}

function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimer = useCallback(() => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = setInterval(() => { if (!paused) setIdx(p => (p + 1) % banners.length); }, 5000); }, [banners.length, paused]);
  useEffect(() => { if (banners.length > 1) startTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [banners.length, startTimer]);
  if (!banners.length) return null;
  const cur = banners[idx];
  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} style={{ position: "relative", width: "100%", borderRadius: 16, overflow: "hidden", background: cur.bg_color || "#0f172a", minHeight: 220 }}>
      <AnimatePresence mode="wait">
        <motion.div key={cur.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.38 }} style={{ position: "relative", width: "100%", minHeight: 220 }}>
          {cur.image_url && <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${cur.image_url})`, backgroundSize: "cover", backgroundPosition: "center" }}><div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.28) 60%,transparent 100%)" }} /></div>}
          <div style={{ position: "relative", padding: "36px 32px", zIndex: 1 }}>
            <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ margin: "0 0 8px", fontSize: "clamp(18px,3vw,28px)", fontWeight: 900, color: "#fff", lineHeight: 1.2, maxWidth: 480 }}>{cur.title}</motion.h2>
            {cur.subtitle && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} style={{ margin: "0 0 20px", fontSize: 14, color: "rgba(255,255,255,0.78)", maxWidth: 400 }}>{cur.subtitle}</motion.p>}
            {cur.link_href && <motion.a initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} href={cur.link_href} style={{ display: "inline-block", padding: "10px 20px", background: "#6ee7b7", color: "#064e3b", borderRadius: 9, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>{cur.link_label || "Learn More"} →</motion.a>}
          </div>
        </motion.div>
      </AnimatePresence>
      {banners.length > 1 && <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 10 }}>{banners.map((_, i) => <button key={i} onClick={() => { setIdx(i); startTimer(); }} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 999, background: i === idx ? "#6ee7b7" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }} />)}</div>}
      {banners.length > 1 && <><button onClick={() => { setIdx((idx - 1 + banners.length) % banners.length); startTimer(); }} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.4)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>‹</button><button onClick={() => { setIdx((idx + 1) % banners.length); startTimer(); }} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.4)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>›</button></>}
    </div>
  );
}

// ── EVENT CARD ─────────────────────────────────────────────────────
function EventCard({ event, onSelect }: { event: DBEvent; onSelect: (e: DBEvent) => void }) {
  const cat = CATEGORIES.find(c => c.id === event.category);
  const lineup = event.lineup || [];
  const lLabel = lineupLabel(lineup);
  return (
    <motion.button layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.13)" }} transition={{ duration: 0.22 }} onClick={() => onSelect(event)}
      style={{ all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", textAlign: "left", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", ...(event.featured ? { borderTop: `3px solid ${event.accent_color}` } : {}) }}>
      <div style={{ height: 4, background: event.accent_color + "30" }}><div style={{ height: "100%", width: event.status === "past" ? "100%" : "40%", background: event.accent_color + "80" }} /></div>
      <div style={{ padding: "16px 18px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: event.accent_color + "16", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: event.accent_color }}>{cat?.icon || "◈"}</div>
            <div><span style={{ fontSize: 9, fontWeight: 800, color: event.accent_color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{cat?.label}</span>{event.featured && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: "#d97706" }}>★ Featured</span>}</div>
          </div>
          <StatusPill status={event.status} />
        </div>
        <h3 style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 800, color: "#111827", lineHeight: 1.25 }}>{event.title}</h3>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6b7280", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{event.subtitle}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[["📅", event.date_start + (event.date_end ? ` – ${event.date_end}` : "")], ["📍", event.venue], ["🎟", event.fee_label]].map(([icon, val]) => (
            <div key={icon} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}><span style={{ fontSize: 12, flexShrink: 0 }}>{icon}</span><span style={{ fontSize: 12, color: "#374151", lineHeight: 1.4 }}>{val}</span></div>
          ))}
        </div>
        {lineup.length > 0 && <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}><div style={{ display: "flex" }}>{lineup.slice(0, 5).map((item, i) => <div key={i} style={{ marginLeft: i === 0 ? 0 : -8, borderRadius: "50%", border: "2px solid #fff" }}><AvatarCircle initials={item.avatar_initials || item.name.slice(0, 2).toUpperCase()} color={item.avatar_color || "#374151"} size={26} /></div>)}</div><span style={{ fontSize: 11, color: "#6b7280" }}>{lineup.length} {lLabel}</span></div>}
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>{(event.tags || []).slice(0, 3).map(t => <span key={t} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600, background: event.accent_color + "12", color: event.accent_color, border: `1px solid ${event.accent_color}20` }}>{t}</span>)}</div>
      </div>
      <div style={{ marginTop: "auto", padding: "10px 18px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>{timeAgo(event.date_start)}</span>
        {/* Show "Learn More" hint on card footer if page_href is set */}
        <span style={{ fontSize: 12, fontWeight: 700, color: event.accent_color }}>
          {event.page_href ? "Learn More →" : "Details →"}
        </span>
      </div>
    </motion.button>
  );
}

// ── DETAIL MODAL ───────────────────────────────────────────────────
function DetailModal({ event, onClose }: { event: DBEvent; onClose: () => void }) {
  const router = useRouter();
  type TabId = "overview" | "lineup" | "schedule" | "prizes";
  const [tab, setTab] = useState<TabId>("overview");
  const lineup = event.lineup || [];
  const lLabel = lineupLabel(lineup);
  const tabs = [
    { id: "overview" as TabId, label: "Overview" },
    ...(lineup.length > 0 ? [{ id: "lineup" as TabId, label: lLabel }] : []),
    ...((event.schedule?.length || 0) > 0 ? [{ id: "schedule" as TabId, label: "Schedule" }] : []),
    ...((event.prizes?.length || 0) > 0 ? [{ id: "prizes" as TabId, label: "Prizes" }] : []),
  ];

  // Resolve navigation target: page_href first, register_href as fallback
  const learnMoreHref = event.page_href || null;
  const registerHref = event.register_href || null;
  const isLearnMoreExternal = learnMoreHref?.startsWith("http");
  const isRegisterExternal = registerHref?.startsWith("http");

  const handleLearnMore = () => {
    if (!learnMoreHref) return;
    onClose();
    if (isLearnMoreExternal) {
      window.open(learnMoreHref, "_blank", "noopener,noreferrer");
    } else {
      router.push(learnMoreHref);
    }
  };

  const handleRegister = () => {
    if (!registerHref) return;
    onClose();
    if (isRegisterExternal) {
      window.open(registerHref, "_blank", "noopener,noreferrer");
    } else {
      router.push(registerHref);
    }
  };

  const isPast = event.status === "past" || event.status === "cancelled";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, top: 80, background: "rgba(0,0,0,0.58)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(3px)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.22 }}
        style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 620, maxHeight: "calc(100vh - 100px)", overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" }}
      >
        {/* Sticky header */}
        <div style={{ padding: "20px 22px 0", position: "sticky", top: 0, background: "#fff", zIndex: 10, borderRadius: "20px 20px 0 0", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ flex: 1, marginRight: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, background: event.accent_color + "18", color: event.accent_color, border: `1px solid ${event.accent_color}28`, letterSpacing: "0.06em" }}>
                  {CATEGORIES.find(c => c.id === event.category)?.label.toUpperCase()}
                </span>
                <StatusPill status={event.status} />
                {/* ── Page path indicator — visible to attendees as a subtle cue ── */}
                {learnMoreHref && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#14710f", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 999 }}>
                    🔗 Full event page available
                  </span>
                )}
              </div>
              <h2 style={{ margin: "0 0 3px", fontSize: 19, fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>{event.title}</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{event.subtitle}</p>
            </div>
            <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "8px 14px", background: "none", border: "none", borderBottom: tab === t.id ? `2px solid ${event.accent_color}` : "2px solid transparent", color: tab === t.id ? event.accent_color : "#6b7280", fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: "pointer", marginBottom: -1, fontFamily: "inherit" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: "20px 22px", flex: 1, overflowY: "auto" }}>
          {tab === "overview" && <>
            <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.78, color: "#374151" }}>{event.description}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {([
                ["Date", event.date_start + (event.date_end ? ` – ${event.date_end}` : "")],
                ["Time", event.time_start || "All Day"],
                ["Venue", event.venue],
                ["City", event.city],
                ["Fee", event.fee_label],
                ["Organiser", event.organizer_name],
                event.capacity ? ["Capacity", event.capacity.toLocaleString()] : null,
                event.attendees_count ? ["Attended", event.attendees_count.toLocaleString()] : null,
              ] as ([string, string | number] | null)[]).filter((x): x is [string, string | number] => x !== null).map(([k, v]) => (
                <div key={String(k)} style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 12px" }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em" }}>{k}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 600, color: "#111827" }}>{String(v)}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: (event.sponsors?.length || 0) > 0 ? 16 : 0 }}>
              {(event.tags || []).map(t => <span key={t} style={{ padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: event.accent_color + "14", color: event.accent_color }}>{t}</span>)}
            </div>
            {(event.sponsors?.length || 0) > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>Sponsors & Partners</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{event.sponsors.map(s => <span key={s} style={{ padding: "4px 12px", background: "#f3f4f6", borderRadius: 6, fontSize: 12, color: "#374151", fontWeight: 500 }}>{s}</span>)}</div>
              </div>
            )}

            {/* Contact details */}
            {(event.contact_phone || event.contact_email || event.website_url || event.maps_url || event.social_instagram || event.social_facebook) && (
              <div style={{ marginTop: 16, background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
                <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>Contact & Links</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {event.contact_name && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 14 }}>👤</span>
                      <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{event.contact_name}</span>
                    </div>
                  )}
                  {event.contact_phone && (
                    <a href={`tel:${event.contact_phone}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                      <span style={{ fontSize: 14 }}>📞</span>
                      <span style={{ fontSize: 13, color: "#1a56a8", fontWeight: 600 }}>{event.contact_phone}</span>
                    </a>
                  )}
                  {event.contact_email && (
                    <a href={`mailto:${event.contact_email}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                      <span style={{ fontSize: 14 }}>✉️</span>
                      <span style={{ fontSize: 13, color: "#1a56a8", fontWeight: 600 }}>{event.contact_email}</span>
                    </a>
                  )}
                  {event.website_url && (
                    <a href={event.website_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                      <span style={{ fontSize: 14 }}>🌐</span>
                      <span style={{ fontSize: 13, color: "#1a56a8", fontWeight: 600 }}>{event.website_url.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}
                  {event.maps_url && (
                    <a href={event.maps_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                      <span style={{ fontSize: 14 }}>📍</span>
                      <span style={{ fontSize: 13, color: "#1a56a8", fontWeight: 600 }}>View on Google Maps</span>
                    </a>
                  )}
                  {(event.social_instagram || event.social_facebook) && (
                    <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                      {event.social_instagram && (
                        <a
                          href={event.social_instagram.startsWith("http") ? event.social_instagram : `https://instagram.com/${event.social_instagram.replace("@", "")}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, color: "#374151", fontWeight: 600, textDecoration: "none" }}>
                          <span>📷</span> Instagram
                        </a>
                      )}
                      {event.social_facebook && (
                        <a href={event.social_facebook} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, color: "#374151", fontWeight: 600, textDecoration: "none" }}>
                          <span>👥</span> Facebook
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>}

          {tab === "lineup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {lineup.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: "#f9fafb", borderRadius: 12, padding: "12px 16px" }}>
                  {item.photo_url
                    ? <img src={item.photo_url} alt={item.name} style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    : <AvatarCircle initials={item.avatar_initials || item.name.slice(0, 2).toUpperCase()} color={item.avatar_color || "#374151"} size={46} />
                  }
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#111827" }}>{item.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{[item.sub_role, item.genre, item.company, item.team, item.origin ? `From ${item.origin}` : null].filter(Boolean).join(" · ")}</p>
                    {item.topic && <span style={{ display: "inline-block", marginTop: 4, padding: "2px 8px", background: event.accent_color + "14", color: event.accent_color, borderRadius: 999, fontSize: 11, fontWeight: 600 }}>"{item.topic}"</span>}
                  </div>
                  {item.upcoming_shows !== undefined && (
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: item.avatar_color || event.accent_color }}>{item.upcoming_shows}</p>
                      <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>upcoming</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "schedule" && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {(event.schedule || []).map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 14, paddingBottom: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: event.accent_color, marginTop: 4, flexShrink: 0 }} />
                    {i < (event.schedule?.length ?? 0) - 1 && <div style={{ width: 1, flex: 1, background: "#e5e7eb", marginTop: 4 }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, color: event.accent_color, letterSpacing: "0.05em" }}>{item.slot_label}</p>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>{item.title}</p>
                    {item.speaker_name && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>by {item.speaker_name}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "prizes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(event.prizes || []).map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: i === 0 ? "#fffbeb" : "#f9fafb", borderRadius: 10, padding: "12px 16px", border: `1px solid ${i === 0 ? "#fde68a" : "#f3f4f6"}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: i === 0 ? "#fbbf24" : i === 1 ? "#d1d5db" : i === 2 ? "#fb923c" : event.accent_color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: i === 0 ? "#92400e" : i === 1 ? "#374151" : i === 2 ? "#9a3412" : event.accent_color, flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#111827" }}>{item.rank_label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{item.reward}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sticky footer ── */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", position: "sticky", bottom: 0, background: "#fff", borderRadius: "0 0 20px 20px", flexShrink: 0 }}>

          {/* Learn More — ALWAYS visible. Active when page_href set, greyed + tooltip when not */}
          {learnMoreHref ? (
            <button
              onClick={handleLearnMore}
              style={{
                flex: 2,
                padding: "12px 22px",
                background: event.accent_color,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                minWidth: 140,
              }}
            >
              {isLearnMoreExternal ? "🌐" : "→"} Learn More
            </button>
          ) : (
            // No page_href set — show a "coming soon" pill so the slot is never empty
            <div
              style={{
                flex: 2,
                padding: "12px 22px",
                background: "#f9fafb",
                border: "1px dashed #d1d5db",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minWidth: 140,
              }}
            >
              <span style={{ fontSize: 13 }}>🔗</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af" }}>More details coming soon</span>
            </div>
          )}

          {/* Register — shown when active and register_href exists */}
          {!isPast && registerHref && (
            <button
              onClick={handleRegister}
              style={{
                flex: learnMoreHref ? 1 : 2,
                padding: "12px 22px",
                background: learnMoreHref ? "#f3f4f6" : event.accent_color,
                color: learnMoreHref ? "#374151" : "#fff",
                border: learnMoreHref ? "1px solid #e5e7eb" : "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                minWidth: 100,
              }}
            >
              {event.status === "postponed" ? "Get Notified" : "Register →"}
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              padding: "12px 18px",
              background: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Close
          </button>

          {/* Contact quick-link */}
          {(event.contact_phone || event.contact_email) && (
            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto", flexShrink: 0 }}>
              {event.contact_phone
                ? <a href={`tel:${event.contact_phone}`} style={{ color: "#6b7280", textDecoration: "none", fontWeight: 600 }}>📞 {event.contact_phone}</a>
                : <a href={`mailto:${event.contact_email}`} style={{ color: "#6b7280", textDecoration: "none", fontWeight: 600 }}>✉️ {event.contact_email}</a>
              }
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SkeletonCard() {
  return <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", padding: "16px 18px" }}>{[80, 140, 40, 40, 40].map((w, i) => <div key={i} style={{ height: i === 0 ? 18 : 14, width: `${w}%`, background: "#f3f4f6", borderRadius: 6, marginBottom: 10, animation: "shimmer 1.5s infinite" }} />)}</div>;
}

function EventDiscoveryIllustration() {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ position: "relative", width: "100%", height: 340 }}>
      {[
        { icon: "♪", label: "Concerts", color: "#7c3d94", top: "0%", left: "10%", delay: 0 },
        { icon: "◎", label: "Education", color: "#14710f", top: "12%", left: "55%", delay: 0.1 },
        { icon: "◉", label: "Sports", color: "#b45309", top: "38%", left: "0%", delay: 0.2 },
        { icon: "❋", label: "Cultural", color: "#0e7490", top: "42%", left: "50%", delay: 0.15 },
        { icon: "⬡", label: "Workshops", color: "#c2410c", top: "68%", left: "15%", delay: 0.25 },
        { icon: "▣", label: "Exhibitions", color: "#4338ca", top: "72%", left: "58%", delay: 0.3 },
        { icon: "◇", label: "Business", color: "#1a56a8", top: "22%", left: "28%", delay: 0.05 },
      ].map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + item.delay, duration: 0.4, type: "spring" }}
          style={{ position: "absolute", top: item.top, left: item.left, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.07)", border: `1px solid ${item.color}44`, borderRadius: 12, padding: "10px 14px", backdropFilter: "blur(8px)" }}>
          <span style={{ fontSize: 20, color: item.color }}>{item.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{item.label}</span>
        </motion.div>
      ))}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle, rgba(110,231,183,0.2) 0%, transparent 70%)", border: "1.5px solid rgba(110,231,183,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, animation: "ripple 2.5s ease-in-out infinite" }}>🎯</div>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15, pointerEvents: "none" }}>
        <line x1="50%" y1="50%" x2="20%" y2="10%" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="75%" y2="20%" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="10%" y2="45%" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="70%" y2="50%" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="70%" y2="78%" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="4 4" />
      </svg>
      <style>{`@keyframes ripple{0%,100%{box-shadow:0 0 0 0 rgba(110,231,183,0.3)}50%{box-shadow:0 0 0 16px rgba(110,231,183,0)}}`}</style>
    </motion.div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────
export default function EventDiscoveryPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [selectedEvent, setSelectedEvent] = useState<DBEvent | null>(null);
  const [events, setEvents] = useState<DBEvent[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { supabase.from("active_banners").select("*").then(({ data, error }) => { if (!error && data) setBanners(data as Banner[]); }); }, []);
  useEffect(() => { setLoading(true); setError(null); supabase.from("events_full").select("*").neq("status", "draft").then(({ data, error }) => { if (error) setError(error.message); else setEvents((data || []) as DBEvent[]); setLoading(false); }); }, []);

  const filtered = useMemo(() => {
    let res = events.filter(ev => {
      const matchCat = activeCategory === "all" || ev.category === activeCategory;
      const matchStatus = statusFilter === "all" || ev.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || [ev.title, ev.subtitle || "", ev.description, ev.city, ev.organizer_name, ...(ev.tags || [])].some(s => s.toLowerCase().includes(q));
      return matchCat && matchStatus && matchSearch;
    });
    if (sortBy === "date") res = res.sort((a, b) => a.date_start.localeCompare(b.date_start));
    if (sortBy === "name") res = res.sort((a, b) => a.title.localeCompare(b.title));
    return res;
  }, [events, activeCategory, search, statusFilter, sortBy]);

  const counts = useMemo(() => { const c: Record<string, number> = { all: events.length }; CATEGORIES.forEach(cat => { c[cat.id] = events.filter(e => e.category === cat.id).length; }); return c; }, [events]);
  const featured = events.filter(e => e.featured).slice(0, 5);

  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}} @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.5}} *{box-sizing:border-box} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px} input:focus,select:focus{outline:none} @media(max-width:768px){.hero-right-panel{display:none!important}}`}</style>
      <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

        {/* HERO */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "48px 24px 36px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 36, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 380px" }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                  <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 999, background: "rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 14 }}>MANIPUR EVENT DISCOVERY</span>
                  <h1 style={{ margin: "0 0 12px", fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, color: "#fff", lineHeight: 1.12, letterSpacing: "-0.03em" }}>Every Event.<br /><span style={{ color: "#6ee7b7" }}>One Platform.</span></h1>
                  <p style={{ margin: "0 0 24px", fontSize: 15, color: "#94a3b8", lineHeight: 1.65, maxWidth: 420 }}>Concerts, summits, medical conclaves, education fests, cultural festivals, sports championships, workshops and exhibitions — all in one place.</p>
                  <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 28 }}>
                    {([[events.length, "Events"], [events.filter(e => e.status === "open" || e.status === "upcoming").length, "Upcoming"], [CATEGORIES.length - 1, "Categories"]] as [number, string][]).map(([n, l]) => (
                      <div key={l}><p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#fff" }}>{n}</p><p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 600 }}>{l}</p></div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a href="/businesses" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", backdropFilter: "blur(4px)" }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="12" height="11" rx="2" /><line x1="2" y1="7" x2="14" y2="7" /><line x1="5" y1="1.5" x2="5" y2="4.5" /><line x1="11" y1="1.5" x2="11" y2="4.5" /></svg>
                      Discover Businesses
                    </a>
                    <a href="/delivery-rates" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#6ee7b7", border: "1px solid transparent", borderRadius: 10, color: "#064e3b", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="10" height="7" rx="1" /><path d="M11 8h2.2l1.8 3v2h-4V8z" /><circle cx="4" cy="13.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="13.5" r="1.2" fill="currentColor" stroke="none" /></svg>
                      Delivery Service
                    </a>
                  </div>
                </motion.div>
              </div>
              <div className="hero-right-panel" style={{ flex: "0 0 340px", maxWidth: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                {featured.length > 0 ? (
                  <>
                    <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, color: "#64748b", letterSpacing: "0.1em" }}>FEATURED EVENTS</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {featured.map(ev => {
                        const cat = CATEGORIES.find(c => c.id === ev.category);
                        return (
                          <motion.button key={ev.id} whileHover={{ x: 3 }} onClick={() => setSelectedEvent(ev)}
                            style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.07)", borderLeft: `3px solid ${ev.accent_color}`, borderRadius: "0 10px 10px 0", padding: "10px 14px", textAlign: "left" }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: ev.accent_color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: ev.accent_color }}>{cat?.icon || "◈"}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</p>
                              <p style={{ margin: "1px 0 0", fontSize: 11, color: "#9ca3af" }}>{ev.date_start} · {ev.city}</p>
                            </div>
                            <StatusPill status={ev.status} />
                          </motion.button>
                        );
                      })}
                    </div>
                    <div style={{ position: "relative", maxWidth: 480 }}>
                      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94a3b8" }}>🔍</span>
                      <input type="text" placeholder="Search events, artists, topics, venues…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "13px 40px 13px 44px", fontSize: 14, border: "1.5px solid transparent", borderRadius: 12, background: "#fff", color: "#111827", boxShadow: "0 4px 18px rgba(0,0,0,0.18)" }} />
                      {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 16 }}>✕</button>}
                    </div>
                  </>
                ) : (
                  <EventDiscoveryIllustration />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BANNER CAROUSEL */}
        {banners.length > 0 && <div style={{ maxWidth: 1100, margin: "28px auto 0", padding: "0 20px" }}><BannerCarousel banners={banners} /></div>}

        {/* CATEGORY TABS */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100, marginTop: banners.length > 0 ? 24 : 0, overflowX: "auto" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", padding: "0 16px" }}>
            {CATEGORIES.map(cat => {
              const active = activeCategory === cat.id;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  style={{ padding: "13px 12px", background: "none", border: "none", borderBottom: `2px solid ${active ? cat.accent : "transparent"}`, color: active ? cat.accent : "#6b7280", fontWeight: active ? 700 : 500, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}>
                  <span style={{ fontSize: 13 }}>{cat.icon}</span>{cat.label}
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 999, background: active ? cat.accent + "18" : "#f3f4f6", color: active ? cat.accent : "#9ca3af" }}>{counts[cat.id] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BODY */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 64px" }}>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "14px 18px", marginBottom: 20, color: "#991b1b", fontSize: 14 }}>Failed to load events: {error}. Check Supabase credentials in .env.local</div>}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, gap: 10, flexWrap: "wrap" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}><strong style={{ color: "#111827" }}>{filtered.length}</strong> events{activeCategory !== "all" && ` · ${CATEGORIES.find(c => c.id === activeCategory)?.label}`}</p>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {(["all", "upcoming", "open", "past", "postponed"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  style={{ padding: "5px 11px", borderRadius: 999, border: `1px solid ${statusFilter === s ? "#111827" : "#e5e7eb"}`, background: statusFilter === s ? "#111827" : "#fff", color: statusFilter === s ? "#fff" : "#6b7280", fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
                  {s === "all" ? "All Status" : s}
                </button>
              ))}
              <select value={sortBy} onChange={e => setSortBy(e.target.value as "date" | "name")}
                style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, color: "#374151", fontWeight: 600, cursor: "pointer" }}>
                <option value="date">Date</option>
                <option value="name">Name</option>
              </select>
              {(activeCategory !== "all" || statusFilter !== "all" || search) && (
                <button onClick={() => { setActiveCategory("all"); setStatusFilter("all"); setSearch(""); }}
                  style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Clear</button>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(285px,1fr))", gap: 18 }}>{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(285px,1fr))", gap: 18 }}>
                  {filtered.map(ev => <EventCard key={ev.id} event={ev} onSelect={setSelectedEvent} />)}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "80px 24px" }}>
                  <p style={{ fontSize: 44, margin: "0 0 12px" }}>🔍</p>
                  <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#111827" }}>No events found</h3>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>Try adjusting filters or clear your search.</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <AnimatePresence>{selectedEvent && <DetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}</AnimatePresence>

        <footer style={{ background: "#fff", borderTop: "1px solid #e5e7eb", padding: "20px 24px", textAlign: "center", fontSize: 13, color: "#9ca3af" }}>© 2026 Justmateng Service Pvt. Ltd. · Event Discovery Platform</footer>
      </div>
    </>
  );
}