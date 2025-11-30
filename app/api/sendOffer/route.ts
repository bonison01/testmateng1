import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY || "");

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: NextRequest) {
  try {
    const { email, formid, name } = await req.json();

    if (!email || !formid) {
      return NextResponse.json(
        { error: "Missing email or formid" },
        { status: 400 }
      );
    }

    const { data: contract, error } = await supabaseAdmin
      .from("employee_contracts")
      .select("*")
      .eq("formid", formid)
      .maybeSingle();

    if (error || !contract) {
      console.error("No contract row:", error);
      return NextResponse.json(
        { error: "No contract entry for this formid" },
        { status: 404 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://justmateng.com";

    const docs: { label: string; url: string }[] = [];

    if (contract.includeterms) {
      docs.push({
        label: "Terms & Conditions / R&Rs",
        url: `${baseUrl}/terms.pdf`,
      });
    }
    if (contract.includesalarypolicy) {
      docs.push({
        label: "Salary / Commission Structure",
        url: `${baseUrl}/salary.pdf`,
      });
    }
    if (contract.includeleavepolicy) {
      docs.push({
        label: "Leave Policy",
        url: `${baseUrl}/leave.pdf`,
      });
    }
    if (contract.custompdfurl) {
      docs.push({
        label: "Additional Contract Document",
        url: contract.custompdfurl,
      });
    }

    const docsHtml =
      docs.length > 0
        ? `<ul>${docs
            .map(
              (d) =>
                `<li><a href="${d.url}" target="_blank">${d.label}</a></li>`
            )
            .join("")}</ul>`
        : "<p>No additional documents attached.</p>";

    const verifyLink = `${baseUrl}/emp_verified?formID=${encodeURIComponent(
      formid
    )}`;

    let subject = "Application Update - Justmateng";
    let html = "";

    // decide by status
    if (contract.application_status === "rejected") {
      subject = "Application Status - Justmateng";
      html = `
        <p>Dear ${name},</p>
        <p>Thank you for your interest in joining <strong>Justmateng</strong>.</p>
        <p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
        <p>We truly appreciate the time you spent applying and wish you every success in your future endeavours.</p>
        <br/>
        <p>Regards,<br/>HR Team<br/>Justmateng Service</p>
      `;
    } else if (contract.application_status === "approved") {
      subject = "Employment Offer - Justmateng";

      const empIdPart = contract.employeeid
        ? `<p>Your Employee ID is: <strong>${contract.employeeid}</strong></p>`
        : "";

      html = `
        <p>Dear ${name},</p>
        <p>Congratulations! We are pleased to inform you that your application has been <strong>APPROVED</strong> for employment at Justmateng.</p>
        ${empIdPart}
        <p>Please review the following employment documents:</p>
        ${docsHtml}
        <p>After reviewing, please confirm your acceptance by clicking the link below:</p>
        <p><a href="${verifyLink}">I agree to the terms and conditions & confirm my employment</a></p>
        <p>If the link does not work, copy and paste this URL into your browser:</p>
        <p>${verifyLink}</p>
        <br/>
        <p>We look forward to working with you.</p>
        <p>Regards,<br/>HR Team<br/>Justmateng Service</p>
      `;
    } else if (contract.employment_status === "active") {
      subject = "Welcome Onboard - Justmateng";

      const empIdPart = contract.employeeid
        ? `<p>Your Employee ID is: <strong>${contract.employeeid}</strong></p>`
        : "";

      html = `
        <p>Dear ${name},</p>
        <p>Welcome to <strong>Justmateng</strong>!</p>
        ${empIdPart}
        <p>Your employment has been marked as <strong>Active</strong>.</p>
        <p>Here are your employment documents for reference:</p>
        ${docsHtml}
        <br/>
        <p>We are excited to have you on the team.</p>
        <p>Regards,<br/>HR Team<br/>Justmateng Service</p>
      `;
    } else {
      // pending / talks, neutral update
      subject = "Application Status Update - Justmateng";
      html = `
        <p>Dear ${name},</p>
        <p>Your application status at Justmateng is now: <strong>${contract.application_status.toUpperCase()}</strong>.</p>
        <p>If applicable, please review any attached documents below:</p>
        ${docsHtml}
        <br/>
        <p>If you have any questions, you can reply to this email.</p>
        <p>Regards,<br/>HR Team<br/>Justmateng Service</p>
      `;
    }

    await resend.emails.send({
      from: "Justmateng HR <justmateng@gmail.com>",
      to: email,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("sendOffer error:", err);
    return NextResponse.json(
      { error: "Internal error sending email" },
      { status: 500 }
    );
  }
}
