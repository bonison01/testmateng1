"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "next/navigation";

export default function EditContractPage() {

  const searchParams = useSearchParams();
  const formID = searchParams.get("formID");

  const [contract, setContract] = useState<any>(null);
  const [status, setStatus] = useState("pending");
  const [joiningDate, setJoiningDate] = useState("");
  const [assignedPosition, setAssignedPosition] = useState("");
  const [remarks, setRemarks] = useState("");

  const [rrPDF, setRRpdf] = useState<FileList | null>(null);
  const [leavePDF, setLeavePDF] = useState<FileList | null>(null);
  const [salaryPDF, setSalaryPDF] = useState<FileList | null>(null);

  useEffect(() => {
    if (formID) loadContract();
  }, [formID]);

  const loadContract = async () => {
    const { data, error } = await supabase
      .from("employee_contracts")
      .select("*")
      .eq("formID", formID)
      .single();

    if (!error && data) {
      setContract(data);
      setStatus(data.approval_status);
      setAssignedPosition(data.assignedPosition ?? "");
      setJoiningDate(data.joiningDate ?? "");
      setRemarks(data.adminRemarks ?? "");
    }
  };

  const uploadPDF = async (file: File, type: string) => {
    const { data, error } = await supabase.storage
      .from("employee-contract-pdfs")
      .upload(`${formID}-${type}.pdf`, file, { upsert: true });

    if (error) return null;

    const { data: url } = supabase.storage
      .from("employee-contract-pdfs")
      .getPublicUrl(`${formID}-${type}.pdf`);

    return url.publicUrl;
  };

  const saveContract = async () => {

    let rolesURL = contract?.rolesResponsibilitiesPDF || null;
    let leaveURL = contract?.leavePolicyPDF || null;
    let salaryURL = contract?.salaryCommissionPDF || null;

    if (rrPDF?.[0]) rolesURL = await uploadPDF(rrPDF[0], "roles");
    if (leavePDF?.[0]) leaveURL = await uploadPDF(leavePDF[0], "leave");
    if (salaryPDF?.[0]) salaryURL = await uploadPDF(salaryPDF[0], "salary");

    const { error } = await supabase
      .from("employee_contracts")
      .update({
        approval_status: status,
        joiningDate,
        assignedPosition,
        adminRemarks: remarks,
        rolesResponsibilitiesPDF: rolesURL,
        leavePolicyPDF: leaveURL,
        salaryCommissionPDF: salaryURL,
      })
      .eq("formID", formID);

    if (error) {
      alert("❗ Failed to save update");
      console.log(error);
      return;
    }

    alert("Contract updated successfully ✔");
  };

  if (!formID) return <div className="p-10">Invalid Contract</div>;
  if (!contract) return <div className="p-10">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">

      <h2 className="text-2xl font-bold mb-6">Edit Employment Contract</h2>

      <p className="text-gray-500 mb-6">
        Form ID: <strong>{formID}</strong>
      </p>

      {/* APPROVAL STATUS */}
      <label>Status</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      >
        <option value="pending">Pending</option>
        <option value="talks">In Talks</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {/* JOINING DATE */}
      <label>Joining Date</label>
      <input
        type="date"
        value={joiningDate}
        onChange={(e) => setJoiningDate(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />

      {/* ASSIGNED POSITION */}
      <label>Assigned Position</label>
      <input
        type="text"
        value={assignedPosition}
        onChange={(e) => setAssignedPosition(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />

      {/* Upload PDFs */}
      <h3 className="mt-6 mb-2 font-semibold text-gray-800">Upload Documents</h3>

      <label>Roles & Responsibilities (PDF)</label>
      <input type="file" accept="application/pdf" onChange={(e)=>setRRpdf(e.target.files)} className="mb-4"/>

      <label>Leave Policy (PDF)</label>
      <input type="file" accept="application/pdf" onChange={(e)=>setLeavePDF(e.target.files)} className="mb-4"/>

      <label>Salary & Commission Structure (PDF)</label>
      <input type="file" accept="application/pdf" onChange={(e)=>setSalaryPDF(e.target.files)} className="mb-4"/>

      <label>Remarks / Notes</label>
      <textarea
        className="border p-2 w-full mb-4 rounded"
        rows={4}
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
      ></textarea>

      <button
        onClick={saveContract}
        className="bg-black hover:bg-gray-800 text-white px-4 py-3 rounded w-full mt-4"
      >
        Save Contract
      </button>

    </div>
  );
}
