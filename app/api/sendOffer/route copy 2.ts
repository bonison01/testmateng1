import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

// Supabase Admin Client
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      email,
      name,
      formid,
      employeeid = null,
      includeTerms = false,
      includeSalary = false,
      includeLeave = false,
      custompdfurl = null,
      rejected = false,
    } = body;

    // Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER!,
        pass: process.env.GMAIL_PASS!,
      },
    });

    await transporter.verify();

    // ---------------------------
    // 1️⃣ REJECT EMAIL
    // ---------------------------
    if (rejected) {
      await transporter.sendMail({
        from: `"Justmateng HR" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Application Status – Justmateng",
        html: `
          <p>Dear ${name},</p>
          <p>Thank you for applying to Justmateng.</p>
          <p>After review, we regret to inform you that your application was not selected.</p>
          <p>We encourage you to apply again in the future.</p>
          <p>Regards,<br/>Justmateng HR Team</p>
        `,
      });

      return NextResponse.json({ success: true });
    }

    // ---------------------------
    // 2️⃣ APPROVAL TOKEN
    // ---------------------------
    const token = crypto.randomUUID();
    const agreement_sent_at = new Date().toISOString();

    await supabaseAdmin
      .from("employee_contracts")
      .upsert(
        {
          formid,
          agreement_token: token,
          agreement_sent_at,
        },
        { onConflict: "formid" }
      )
      .throwOnError();

    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      "http://localhost:3000";

    const baseUrl = base.startsWith("http") ? base : `https://${base}`;

    const agreeLink = `${baseUrl}/api/agree?token=${encodeURIComponent(
      token
    )}&formid=${encodeURIComponent(formid)}`;

    // ---------------------------
    // 3️⃣ BUILD ATTACHMENTS (FILESYSTEM)
    // ---------------------------

    // Folder where PDFs are stored
    // ---------------------------
// 3️⃣ ATTACHMENTS — GUARANTEED WORKING
// ---------------------------

const pdfDir = path.join(process.cwd(), "public", "employee-contract-pdfs");

async function loadAttachment(filename: string) {
  const filePath = path.join(pdfDir, filename);

  try {
    const buffer = await fs.readFile(filePath);
    console.log("📎 Loaded attachment:", filePath);
    return {
      filename,
      content: buffer,
      contentType: "application/pdf",
    };
  } catch (err) {
    console.error("❌ Attachment missing:", filePath);
    return null;
  }
}

let attachments: any[] = [];

// Terms
if (includeTerms) {
  const pdf = await loadAttachment("terms.pdf");
  if (pdf) attachments.push(pdf);
}

// Salary
if (includeSalary) {
  const pdf = await loadAttachment("salary.pdf");
  if (pdf) attachments.push(pdf);
}

// Leave
if (includeLeave) {
  const pdf = await loadAttachment("leave.pdf");
  if (pdf) attachments.push(pdf);
}

// Offer Letter — Custom or default
if (custompdfurl) {
  const res = await fetch(custompdfurl);
  const buf = Buffer.from(await res.arrayBuffer());
  attachments.push({
    filename: "Offer-Letter.pdf",
    content: buf,
    contentType: "application/pdf",
  });
} else {
  const pdf = await loadAttachment("default-offer-letter.pdf");
  if (pdf) attachments.push(pdf);
}


    // ---------------------------
    // 4️⃣ SEND EMAIL
    // ---------------------------
    await transporter.sendMail({
      from: `"Justmateng HR" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Official Offer Letter – Justmateng",
      html: `
        <p>Dear ${name},</p>
        <p>Your application has been <strong>approved</strong>.</p>
        <p><strong>Employee ID:</strong> ${employeeid ?? "Pending"}</p>

        <p>Please review the attached documents.</p>

        <p>
          <a href="${agreeLink}"
             style="background:#111;color:#fff;padding:10px 16px;text-decoration:none;
                    border-radius:6px;display:inline-block;margin-top:10px;"
             target="_blank">
            Accept Offer & Agree to Policies
          </a>
        </p>

        <p>If the button does not work, here is the link:</p>
        <p>${agreeLink}</p>

        <p>Regards,<br/>Justmateng HR Team</p>
      `,
      attachments,
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ sendOffer ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
