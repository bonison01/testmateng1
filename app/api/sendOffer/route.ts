// app/api/sendOffer/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

// ----------------------
// SUPABASE ADMIN CLIENT
// ----------------------
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ----------------------
// URL RESOLVER (FIXED)
// ----------------------
function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) 
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  if (process.env.NEXT_PUBLIC_VERCEL_URL)
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}


// ----------------------
// HELPERS TO LOAD PDFs
// ----------------------
async function loadLocalPdf(dir: string, filename: string) {
  try {
    const filePath = path.join(dir, filename);
    const buf = await fs.readFile(filePath);
    return { filename, content: buf, contentType: "application/pdf" };
  } catch {
    console.warn("Missing local file:", filename);
    return null;
  }
}

async function loadRemotePdf(url: string, fallbackName: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch remote PDF");
    const buf = Buffer.from(await res.arrayBuffer());
    return { filename: fallbackName, content: buf, contentType: "application/pdf" };
  } catch (err) {
    console.warn("Remote PDF load error:", err);
    return null;
  }
}

// ----------------------
// MAIN ROUTE
// ----------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      email,
      name,
      formid,
      rejected = false,
      selectedDocs = null,
      includeTerms = false,
      includeSalary = false,
      includeLeave = false,
      custompdfurl = null,
      subjectOverride = null,
    } = body;

    if (!email || !formid) {
      return NextResponse.json({ error: "Missing email or formid" }, { status: 400 });
    }

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER!,
        pass: process.env.GMAIL_PASS!,
      },
    });

    // -----------------------------
    // REJECTION EMAIL
    // -----------------------------
    if (rejected) {
      await transporter.sendMail({
        from: `"Justmateng HR" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: subjectOverride ?? "Application Update – Justmateng",
        html: `
          <p>Dear ${name},</p>
          <p>Thank you for your interest in <strong>Justmateng Service</strong>.</p>
          <p>We regret to inform you that your application was not selected.</p>
          <p>We appreciate your time and encourage you to apply again.</p>
          <p>Best regards,<br/>Justmateng HR Team</p>
        `,
      });

      return NextResponse.json({ success: true, message: "Rejection email sent." });
    }

    // -----------------------------
    // APPROVAL — GENERATE TOKEN
    // -----------------------------
    const token = crypto.randomUUID();
    const sentAt = new Date().toISOString();

    await supabaseAdmin
      .from("employee_contracts")
      .update({
        agreement_token: token,
        agreement_sent_at: sentAt,
      })
      .eq("formid", formid);

    const baseUrl = getBaseUrl();
    const agreeLink = `${baseUrl}/api/agree?token=${encodeURIComponent(
      token
    )}&formid=${encodeURIComponent(formid)}`;

    // -----------------------------
    // ATTACHMENTS PREPARATION
    // -----------------------------
    const attachments: any[] = [];
    const dir = path.join(process.cwd(), "public", "employee-contract-pdfs");

    let docsToAttach: string[] = [];

    if (Array.isArray(selectedDocs) && selectedDocs.length > 0) {
      docsToAttach = selectedDocs;
    } else {
      if (includeTerms) docsToAttach.push("terms.pdf");
      if (includeSalary) docsToAttach.push("salary.pdf");
      if (includeLeave) docsToAttach.push("leave.pdf");
    }

    // Local docs
    for (const filename of docsToAttach) {
      const clean = path.basename(filename);
      const pdf = await loadLocalPdf(dir, clean);
      if (pdf) attachments.push(pdf);
    }

    // Remote custom PDF
    if (
      (Array.isArray(selectedDocs) && selectedDocs.includes("custom.pdf")) ||
      (!Array.isArray(selectedDocs) && custompdfurl)
    ) {
      if (custompdfurl) {
        const custom = await loadRemotePdf(custompdfurl, "Custom-Offer-Letter.pdf");
        if (custom) attachments.push(custom);
      }
    }

    // -----------------------------
    // SEND APPROVAL EMAIL
    // -----------------------------
    await transporter.sendMail({
      from: `"Justmateng HR" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subjectOverride ?? "Official Offer Letter – Justmateng",
      html: `
        <p>Dear ${name},</p>
        <p>Your application has been <strong>approved</strong>.</p>
        <p>Please review the attached documents.</p>
        <p>
          <a href="${agreeLink}"
            style="
              background:black;
              color:white;
              padding:10px 16px;
              border-radius:6px;
              text-decoration:none;
              font-weight:bold;
            ">
            Accept Offer & Agree
          </a>
        </p>
        <p>If the button doesn't work, use this link:</p>
        <p><a href="${agreeLink}">${agreeLink}</a></p>
        <p>Regards,<br/>Justmateng HR Team</p>
      `,
      attachments,
    });

    return NextResponse.json({ success: true, message: "Approval email sent." });
  } catch (err: any) {
    console.error("sendOffer error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
