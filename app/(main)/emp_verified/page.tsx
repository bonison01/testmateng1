"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "next/navigation";

export default function EmpVerifiedPage() {
  const searchParams = useSearchParams();
  const formID = searchParams.get("formID");

  const [accepted, setAccepted] = useState(false);
  const [candidate, setCandidate] = useState<any>(null);

  useEffect(() => {
    if (formID) {
      fetchCandidateData(formID);
    }
  }, [formID]);

  const fetchCandidateData = async (id: string) => {
    const { data, error } = await supabase
      .from("employee_forms")
      .select(`
        fullName,
        mobile,
        applyPosition,
        positionType,
        created_at,
        employee_contracts(
          rolesResponsibilitiesPDF,
          leavePolicyPDF,
          salaryCommissionPDF,
          assignedPosition
        )
      `)
      .eq("formID", id)
      .single();

    if (!error && data) {
      setCandidate(data);
    }
  };

  const handleConfirm = async () => {
    const { error } = await supabase
      .from("employee_contracts")
      .update({
        verificationAccepted: true,
        verificationDate: new Date().toISOString(),
      })
      .eq("formID", formID);

    if (!error) {
      alert("Thank you — your acceptance has been recorded.");
      window.location.href = "/thanks";
    }
  };

  if (!formID) return <div className="p-10 text-center">Invalid verification link.</div>;
  if (!candidate) return <div className="p-10 text-center">Loading contract…</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">

      <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">
        Employment Contract Review
      </h2>

      <p className="text-center text-gray-500 mb-8">
        Form ID: {formID}
      </p>

      {/* Candidate SUMMARY */}
      <div className="border rounded-lg p-4 mb-6 bg-gray-50">
        <h3 className="font-semibold mb-2 text-gray-800">Candidate</h3>
        <p><strong>Name:</strong> {candidate.fullName}</p>
        <p><strong>Applying for:</strong> {candidate.applyPosition ?? candidate.positionType}</p>
        <p><strong>Assigned Position:</strong> {candidate.employee_contracts?.assignedPosition ?? "HR not yet assigned"}</p>
      </div>

      {/* PDFs */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-800">Documents</h3>

        <ul className="space-y-2">
          <li>
            📄 <a className="text-blue-600" href={candidate.employee_contracts.rolesResponsibilitiesPDF} target="_blank">Roles & Responsibilities</a>
          </li>
          <li>
            📄 <a className="text-blue-600" href={candidate.employee_contracts.leavePolicyPDF} target="_blank">Leave Policy</a>
          </li>
          <li>
            📄 <a className="text-blue-600" href={candidate.employee_contracts.salaryCommissionPDF} target="_blank">Salary / Commission Structure</a>
          </li>
        </ul>
      </div>

      {/* ACCEPT AGREEMENT */}
      <div className="flex items-start mb-6">
        <input
          type="checkbox"
          checked={accepted}
          onChange={() => setAccepted(!accepted)}
          className="mt-1"
        />
        <span className="ml-3 text-gray-700 text-sm">
          I have thoroughly reviewed the attached terms, documents, and policies, and I
          voluntarily accept them and agree to the employment conditions with Justmateng.
        </span>
      </div>

      <button
        disabled={!accepted}
        onClick={handleConfirm}
        className={`w-full py-3 rounded-lg text-white text-lg font-semibold ${
          accepted ? "bg-black hover:bg-gray-800" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Confirm & Accept Employment Terms
      </button>
    </div>
  );
}
