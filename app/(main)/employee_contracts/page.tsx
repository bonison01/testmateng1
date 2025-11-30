"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Import TypeScript types
import {
  CandidateRow,
  Counts,
  ProfileFormRow,
  ContractRow,
} from "./types";

// Import UI components
import StatusSummary from "./components/employee_contracts/StatusSummary";
import Filters from "./components/employee_contracts/Filters";
import CandidateTable from "./components/employee_contracts/CandidateTable";
import EditModal from "./components/employee_contracts/EditModal";
import ProfileModal from "./components/employee_contracts/ProfileModal";

export default function EmployeeContractsPage() {
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [counts, setCounts] = useState<Counts>({
    pending: 0,
    talks: 0,
    approved: 0,
    rejected: 0,
    active: 0,
    inactive: 0,
  });

  const [filterAppStatus, setFilterAppStatus] = useState("all");
  const [filterEmpStatus, setFilterEmpStatus] = useState("all");

  // currently selected candidate row
  const [selected, setSelected] = useState<CandidateRow | null>(null);

  // profile data containers
  const [profileForm, setProfileForm] = useState<ProfileFormRow | null>(null);
  const [profileContract, setProfileContract] = useState<ContractRow | null>(
    null
  );

  // modal visibility
  const [showProfile, setShowProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // =====================================================================
  // LOAD ALL CANDIDATES + STATUS COUNTS
  // =====================================================================

  const loadCandidates = async () => {
    const { data, error } = await supabase
      .from("employee_forms")
      .select(`
        formid,
        fullname,
        email,
        applyposition,
        positiontype,
        created_at,
        application_status,
        employment_status,
        employee_contracts (employeeid)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load employee_forms:", error);
      return;
    }

    const list: CandidateRow[] = data!.map((r: any) => ({
      formid: r.formid,
      fullname: r.fullname,
      email: r.email,
      applyposition: r.applyposition,
      positiontype: r.positiontype,
      appliedDate: new Date(r.created_at).toISOString().split("T")[0],
      application_status: r.application_status ?? "pending",
      employment_status: r.employment_status ?? null,
      employeeid: r.employee_contracts?.employeeid ?? null,
    }));

    setCandidates(list);

    // compute summary counts
    setCounts({
      pending: list.filter((c) => c.application_status === "pending").length,
      talks: list.filter((c) => c.application_status === "talks").length,
      approved: list.filter((c) => c.application_status === "approved").length,
      rejected: list.filter((c) => c.application_status === "rejected").length,
      active: list.filter((c) => c.employment_status === "active").length,
      inactive: list.filter((c) => c.employment_status === "inactive").length,
    });
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  // =====================================================================
  // MODAL – PROFILE
  // =====================================================================

  const openProfile = async (row: CandidateRow) => {
    setSelected(row);

    const [{ data: formRow }, { data: contractRow }] = await Promise.all([
      supabase.from("employee_forms").select("*").eq("formid", row.formid).maybeSingle(),
      supabase.from("employee_contracts").select("*").eq("formid", row.formid).maybeSingle(),
    ]);

    if (!formRow) {
      alert("Candidate profile not found");
      return;
    }

    setProfileForm(formRow as ProfileFormRow);
    setProfileContract(contractRow as ContractRow | null);
    setShowProfile(true);
  };

  // =====================================================================
  // MODAL – EDIT
  // =====================================================================

  const openEdit = (row: CandidateRow) => {
    setSelected(row);
    setShowEdit(true);
  };

  // =====================================================================
  // SEND EMAIL
  // =====================================================================

  async function sendEmail(email: string, formid: string, name: string) {
    try {
      const res = await fetch("/api/sendOffer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, formid, name }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("EMAIL ERROR:", err);
        alert("Email sending failed");
        return;
      }

      alert("📨 Email sent!");
    } catch (err) {
      alert("Network/email error");
      console.error(err);
    }
  }

  // =====================================================================
  // RENDER
  // =====================================================================

  return (
    <div className="max-w-70xl mx-auto p-15 bg-white">
      
      <StatusSummary counts={counts} />

      <Filters
        filterAppStatus={filterAppStatus}
        filterEmpStatus={filterEmpStatus}
        setFilterAppStatus={setFilterAppStatus}
        setFilterEmpStatus={setFilterEmpStatus}
      />

      <CandidateTable
  candidates={candidates}
  filterAppStatus={filterAppStatus}
  filterEmpStatus={filterEmpStatus}
  openProfile={openProfile}
  openEdit={openEdit}
  sendEmail={sendEmail}
/>


      <EditModal
        showEdit={showEdit}
        setShowEdit={setShowEdit}
        selected={selected}
        loadCandidates={loadCandidates}
      />

      <ProfileModal
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        selected={selected}
      />
    </div>
  );
}
