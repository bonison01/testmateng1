// app/api/sendOffer/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helpers
async function loadLocalPdf(dir: string, filename: string) {
  try {
    const filePath = path.join(dir, filename);
    const buf = await fs.readFile(filePath);
    return { filename, content: buf, contentType: "application/pdf" };
  } catch (err) {
    console.warn(`Local PDF missing: ${filename}`);
    return null;
  }
}

async function loadRemotePdf(url: string, filename: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch remote PDF");
    const buf = Buffer.from(await res.arrayBuffer());
    return { filename, content: buf, contentType: "application/pdf" };
  } catch (err) {
    console.warn(`Remote PDF failed: ${url}`);
    return null;
  }
}

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

    // --------------------------------------------------------
    // BASE URL (Local vs Production)
    // --------------------------------------------------------
    const isLocal = process.env.NODE_ENV === "development";

    const baseUrl = isLocal
      ? "http://localhost:3000"
      : "https://justmateng.com";

    // --------------------------------------------------------
    // MAIL TRANSPORT
    // --------------------------------------------------------
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER!,
        pass: process.env.GMAIL_PASS!,
      },
    });

    // --------------------------------------------------------
    // CASE 1 — REJECTION
    // --------------------------------------------------------
    if (rejected) {
      await transporter.sendMail({
        from: `"Justmateng HR" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: subjectOverride ?? "Application Update – Justmateng",
        html: `
          <p>Dear ${name},</p>
          <p>Thank you for applying to <strong>Justmateng Service</strong>.</p>
          <p>After careful review, we regret to inform you that your application was not selected.</p>
          <p>We encourage you to apply again in the future.</p>
          <p>Best regards,<br/>Justmateng HR Team</p>
        `,
      });

      return NextResponse.json({ success: true, message: "Rejection email sent." });
    }

    // --------------------------------------------------------
    // CASE 2 — APPROVAL
    // --------------------------------------------------------

    // Generate agreement token
    const token = crypto.randomUUID();
    const sentAt = new Date().toISOString();

    await supabaseAdmin
      .from("employee_contracts")
      .update({
        agreement_token: token,
        agreement_sent_at: sentAt,
      })
      .eq("formid", formid);

    const agreeLink = `${baseUrl}/api/agree?token=${encodeURIComponent(
      token
    )}&formid=${encodeURIComponent(formid)}`;

    // Attachments
    const attachments: any[] = [];
    const dir = path.join(process.cwd(), "public", "employee-contract-pdfs");

    let docsToAttach: string[] = [];

    // Use selectedDocs if provided
    if (Array.isArray(selectedDocs) && selectedDocs.length > 0) {
      docsToAttach = selectedDocs;
    } else {
      if (includeTerms) docsToAttach.push("terms.pdf");
      if (includeSalary) docsToAttach.push("salary.pdf");
      if (includeLeave) docsToAttach.push("leave.pdf");
    }

    // Load local PDFs
    for (const filename of docsToAttach) {
      const clean = path.basename(filename);
      const pdf = await loadLocalPdf(dir, clean);
      if (pdf) attachments.push(pdf);
    }

    // Custom PDF (remote Supabase URL)
    if (custompdfurl && docsToAttach.includes("custom.pdf")) {
      const custom = await loadRemotePdf(custompdfurl, "Custom-Offer-Letter.pdf");
      if (custom) attachments.push(custom);
    }

    // --------------------------------------------------------
    // SEND APPROVAL EMAIL
    // --------------------------------------------------------
    await transporter.sendMail({
      from: `"Justmateng HR" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subjectOverride ?? "Official Offer Letter – Justmateng",
      html: `
        <p>Dear ${name},</p>
        <p>Your application has been <strong>approved</strong>.</p>
        <p>Please find the attached documents.</p>
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
        <p>If the button does not work, use the link below:</p>
        <p>${agreeLink}</p>
        <p>Regards,<br/>Justmateng HR Team</p>
      `,
      attachments,
    });

    return NextResponse.json({ success: true, message: "Approval email sent." });
  } catch (err: any) {
    console.error("sendOffer error:", err);
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
