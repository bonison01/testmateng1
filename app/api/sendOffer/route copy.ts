import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, formid, name } = await req.json();

    console.log("📩 SENDING EMAIL TO:", email);
    console.log("✔ Using Gmail user:", process.env.GMAIL_USER);
    console.log("✔ Has Gmail app password:", process.env.GMAIL_PASS ? "YES" : "NO");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER!,
        pass: process.env.GMAIL_PASS!,
      },
    });

    await transporter.verify();
    console.log("SMTP AUTH SUCCESS ✔");

    await transporter.sendMail({
      from: `"Justmateng HR" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Test Email",
      html: `<p>Hello ${name}, this is a test.</p>`,
    });

    console.log("Email sent successfully ✔");

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ EMAIL FAILED:", err);
    return NextResponse.json(
      { error: err.message || "Internal error sending email" },
      { status: 500 }
    );
  }
}
