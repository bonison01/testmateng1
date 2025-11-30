"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface CandidateRow {
  formid: string;
  fullname: string;
  email: string;
  applyposition: string | null;
  positiontype: string | null;
  application_status: "pending" | "talks" | "approved" | "rejected";
  employment_status: "active" | "inactive" | null;
  appliedDate: string;
  employeeid: string | null;
}

interface ProfileFormRow {
  formid: string;
  email: string | null;
  fullname: string;
  permanentaddress: string | null;
  residentialaddress: string | null;
  vehicletype: string | null;
  mobile: string | null;
  altcontact: string | null;
  reason: string | null;
  strengthsweakness: string | null;
  goals5years: string | null;
  applyposition: string | null;
  positiontype: string | null;
  aadharurl: string[] | null;
  panurl: string[] | null;
  cvurl: string | null;
  driverlicenseurl: string | null;
  vehicledocsurl: string[] | null;
}

interface ContractRow {
  formid: string;
  application_status: "pending" | "talks" | "approved" | "rejected";
  employment_status: "active" | "inactive" | null;
  joiningdate: string | null;
  assignedposition: string | null;
  adminremarks: string | null;
  includeterms: boolean | null;
  includesalarypolicy: boolean | null;
  includeleavepolicy: boolean | null;
  custompdfurl: string | null;
  employeeid: string | null;
}

interface Counts {
  pending: number;
  talks: number;
  approved: number;
  rejected: number;
  active: number;
  inactive: number;
}

interface EditState {
  application_status: "pending" | "talks" | "approved" | "rejected";
  employment_status: "" | "active" | "inactive";
  joiningDate: string;
  positionPreset: "" | "Operational" | "Delivery" | "Other";
  positionCustom: string;
  adminRemarks: string;
  includeTerms: boolean;
  includeSalary: boolean;
  includeLeave: boolean;
  customPDFFile: File | null;
  customPDFUrl: string | null;
}

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

  const [filterAppStatus, setFilterAppStatus] = useState<string>("all");
  const [filterEmpStatus, setFilterEmpStatus] = useState<string>("all");

  const [selected, setSelected] = useState<CandidateRow | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormRow | null>(null);
  const [profileContract, setProfileContract] = useState<ContractRow | null>(
    null
  );

  const [showProfile, setShowProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editState, setEditState] = useState<EditState>({
    application_status: "pending",
    employment_status: "",
    joiningDate: "",
    positionPreset: "",
    positionCustom: "",
    adminRemarks: "",
    includeTerms: false,
    includeSalary: false,
    includeLeave: false,
    customPDFFile: null,
    customPDFUrl: null,
  });

  // -------- helpers --------
  const generateEmployeeId = () => {
    const num = Math.floor(100000 + Math.random() * 900000);
    return `EMP-${num}`;
  };

  const loadCandidates = async () => {
    const { data, error } = await supabase
      .from("employee_forms")
      .select(
        `
        formid,
        fullname,
        email,
        positiontype,
        applyposition,
        created_at,
        application_status,
        employment_status,
        employee_contracts(employeeid)
      `
      )
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Load candidates error:", error);
      return;
    }

    const list: CandidateRow[] = data.map((r: any) => ({
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

  const filteredCandidates = candidates.filter((c) => {
    if (filterAppStatus !== "all" && c.application_status !== filterAppStatus)
      return false;
    if (filterEmpStatus !== "all" && c.employment_status !== filterEmpStatus)
      return false;
    return true;
  });

  // -------- profile modal --------
  const openProfile = async (row: CandidateRow) => {
    setSelected(row);

    const [{ data: formRow }, { data: contractRow }] = await Promise.all([
      supabase
        .from("employee_forms")
        .select("*")
        .eq("formid", row.formid)
        .maybeSingle(),
      supabase
        .from("employee_contracts")
        .select("*")
        .eq("formid", row.formid)
        .maybeSingle(),
    ]);

    if (!formRow) {
      alert("Unable to load profile data");
      return;
    }

    setProfileForm(formRow as ProfileFormRow);
    setProfileContract(contractRow as ContractRow | null);
    setShowProfile(true);
  };

  // -------- edit modal --------
  const mapPositionToEdit = (
    assigned: string | null,
    fallback: string | null
  ) => {
    const val = assigned || fallback || "";
    if (val === "" || val === "Operational" || val === "Delivery") {
      return {
        positionPreset: val as "" | "Operational" | "Delivery",
        positionCustom: "",
      };
    }
    return { positionPreset: "Other" as const, positionCustom: val };
  };

  const openEdit = async (row: CandidateRow) => {
    setSelected(row);

    const { data: contractRow, error } = await supabase
      .from("employee_contracts")
      .select("*")
      .eq("formid", row.formid)
      .maybeSingle();

    if (error) {
      console.error("Load contract error:", error);
    }

    const cr = contractRow as ContractRow | null;

    const { positionPreset, positionCustom } = mapPositionToEdit(
      cr?.assignedposition ?? null,
      row.applyposition ?? row.positiontype
    );

    setEditState({
      application_status: cr?.application_status ?? row.application_status,
      employment_status: cr?.employment_status ?? "",
      joiningDate: cr?.joiningdate ?? "",
      positionPreset,
      positionCustom,
      adminRemarks: cr?.adminremarks ?? "",
      includeTerms: cr?.includeterms ?? false,
      includeSalary: cr?.includesalarypolicy ?? false,
      includeLeave: cr?.includeleavepolicy ?? false,
      customPDFFile: null,
      customPDFUrl: cr?.custompdfurl ?? null,
    });

    setShowEdit(true);
  };

  const getFinalAssignedPosition = () => {
    if (editState.positionPreset === "Other") {
      return editState.positionCustom.trim() || null;
    }
    return editState.positionPreset || null;
  };

  const saveEdit = async () => {
    if (!selected) return;
    setSaving(true);

    // load existing contract row to check employeeid
    const { data: existingContract } = await supabase
      .from("employee_contracts")
      .select("*")
      .eq("formid", selected.formid)
      .maybeSingle();

    let employeeid: string | null = existingContract?.employeeid ?? null;
    let custompdfurl: string | null = editState.customPDFUrl ?? null;

    // upload custom PDF if any
    if (editState.customPDFFile) {
      const filename = `${selected.formid}-custom-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("employee-contract-pdfs")
        .upload(filename, editState.customPDFFile, { upsert: true });

      if (uploadError) {
        console.error("Upload custom pdf error:", uploadError);
      } else {
        const { data } = supabase.storage
          .from("employee-contract-pdfs")
          .getPublicUrl(filename);
        custompdfurl = data.publicUrl;
      }
    }

    // business rules:
    // - if application_status == approved and no employeeid yet -> generate one
    // - employment_status allowed only when approved, else null
    if (editState.application_status === "approved" && !employeeid) {
      employeeid = generateEmployeeId();
    }

    const finalEmploymentStatus =
      editState.application_status === "approved"
        ? (editState.employment_status || null)
        : null;

    const finalAssignedPosition = getFinalAssignedPosition();

    // upsert into employee_contracts
    const { error: upsertErr } = await supabase.from("employee_contracts").upsert(
      {
        formid: selected.formid,
        application_status: editState.application_status,
        employment_status: finalEmploymentStatus,
        joiningdate: editState.joiningDate || null,
        assignedposition: finalAssignedPosition,
        adminremarks: editState.adminRemarks || null,
        includeterms: editState.includeTerms,
        includesalarypolicy: editState.includeSalary,
        includeleavepolicy: editState.includeLeave,
        custompdfurl,
        employeeid,
      },
      { onConflict: "formid" }
    );

    if (upsertErr) {
      console.error("Contract upsert error:", upsertErr);
      alert("Failed to save");
      setSaving(false);
      return;
    }

    // mirror into employee_forms
    const { error: formUpdateErr } = await supabase
      .from("employee_forms")
      .update({
        application_status: editState.application_status,
        employment_status: finalEmploymentStatus,
      })
      .eq("formid", selected.formid);

    if (formUpdateErr) {
      console.error("Update forms error:", formUpdateErr);
      alert("Saved contract but failed to sync forms");
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowEdit(false);
    await loadCandidates();
    alert("✅ Saved");
  };

  const sendEmail = async (email: string, formid: string, name: string) => {
    try {
      const res = await fetch("/api/sendOffer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, formid, name }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Email error:", txt);
        alert("Email failed");
        return;
      }
      alert("📨 Email sent");
    } catch (err) {
      console.error(err);
      alert("Email failed");
    }
  };

  const appStatusBadge = (s: string) => {
    switch (s) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "talks":
        return "bg-blue-100 text-blue-700";
      case "approved":
        return "bg-purple-100 text-purple-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const empStatusBadge = (s: string | null) => {
    switch (s) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6">Employee Applications Dashboard</h2>

      {/* APPLICATION STATUS SUMMARY */}
      <h3 className="text-md font-semibold mb-2">Application Status</h3>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-100 p-4 text-center rounded">
          <p className="text-xs">Pending</p>
          <p className="text-lg font-bold">{counts.pending}</p>
        </div>
        <div className="bg-blue-100 p-4 text-center rounded">
          <p className="text-xs">In Talks</p>
          <p className="text-lg font-bold">{counts.talks}</p>
        </div>
        <div className="bg-purple-100 p-4 text-center rounded">
          <p className="text-xs">Approved</p>
          <p className="text-lg font-bold">{counts.approved}</p>
        </div>
        <div className="bg-red-100 p-4 text-center rounded">
          <p className="text-xs">Rejected</p>
          <p className="text-lg font-bold">{counts.rejected}</p>
        </div>
      </div>

      {/* EMPLOYMENT STATUS SUMMARY */}
      <h3 className="text-md font-semibold mb-2">Employment Status</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-100 p-4 text-center rounded">
          <p className="text-xs">Active</p>
          <p className="text-lg font-bold">{counts.active}</p>
        </div>
        <div className="bg-gray-200 p-4 text-center rounded">
          <p className="text-xs">Inactive</p>
          <p className="text-lg font-bold">{counts.inactive}</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Application Filter:</span>
          <select
            className="border rounded p-2 text-sm"
            value={filterAppStatus}
            onChange={(e) => setFilterAppStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="talks">In Talks</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Employment Filter:</span>
          <select
            className="border rounded p-2 text-sm"
            value={filterEmpStatus}
            onChange={(e) => setFilterEmpStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="p-2 border">FormID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Position</th>
              <th className="p-2 border">Application</th>
              <th className="p-2 border">Employment</th>
              <th className="p-2 border">Emp ID</th>
              <th className="p-2 border">Applied</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((c) => (
              <tr key={c.formid} className="border-t">
                <td className="p-2 border font-mono">{c.formid}</td>
                <td className="p-2 border">{c.fullname}</td>
                <td className="p-2 border">{c.email}</td>
                <td className="p-2 border">{c.applyposition || c.positiontype}</td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 text-xs rounded ${appStatusBadge(
                      c.application_status
                    )}`}
                  >
                    {c.application_status}
                  </span>
                </td>
                <td className="p-2 border">
                  {c.employment_status ? (
                    <span
                      className={`px-2 py-1 text-xs rounded ${empStatusBadge(
                        c.employment_status
                      )}`}
                    >
                      {c.employment_status}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="p-2 border font-mono text-xs">
                  {c.employeeid ?? "—"}
                </td>
                <td className="p-2 border">{c.appliedDate}</td>
                <td className="p-2 border">
                  <div className="flex gap-2">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => openProfile(c)}
                    >
                      Profile
                    </button>
                    <button
                      className="text-emerald-700 underline"
                      onClick={() => openEdit(c)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-purple-600 underline"
                      onClick={() => sendEmail(c.email, c.formid, c.fullname)}
                    >
                      Email
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredCandidates.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">
                  No candidates found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {showEdit && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Edit Application — {selected.fullname}
            </h3>

            <div className="space-y-4 text-sm">
              {/* Application Status */}
              <div>
                <label className="font-medium text-sm">Application Status</label>
                <select
                  className="border rounded p-2 mt-1 w-full"
                  value={editState.application_status}
                  onChange={(e) =>
                    setEditState((prev) => ({
                      ...prev,
                      application_status:
                        e.target.value as EditState["application_status"],
                      // if we change away from approved, clear employment status
                      employment_status:
                        e.target.value === "approved"
                          ? prev.employment_status
                          : "",
                    }))
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="talks">In Talks</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Employment Status (only when approved) */}
              {editState.application_status === "approved" && (
                <div>
                  <label className="font-medium text-sm">
                    Employment Status (after joining)
                  </label>
                  <select
                    className="border rounded p-2 mt-1 w-full"
                    value={editState.employment_status}
                    onChange={(e) =>
                      setEditState((prev) => ({
                        ...prev,
                        employment_status:
                          e.target.value as EditState["employment_status"],
                      }))
                    }
                  >
                    <option value="">Not yet joined</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              {/* Joining date */}
              <div>
                <label className="font-medium text-sm">Joining Date</label>
                <input
                  type="date"
                  className="border rounded p-2 mt-1 w-full"
                  value={editState.joiningDate}
                  onChange={(e) =>
                    setEditState((prev) => ({
                      ...prev,
                      joiningDate: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Position */}
              <div>
                <label className="font-medium text-sm">Assigned Position</label>
                <select
                  className="border rounded p-2 mt-1 w-full"
                  value={editState.positionPreset}
                  onChange={(e) =>
                    setEditState((prev) => ({
                      ...prev,
                      positionPreset: e.target.value as EditState["positionPreset"],
                    }))
                  }
                >
                  <option value="">Select</option>
                  <option value="Operational">Operational</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Other">Other</option>
                </select>
                {editState.positionPreset === "Other" && (
                  <input
                    className="border rounded p-2 mt-2 w-full"
                    placeholder="Custom position title"
                    value={editState.positionCustom}
                    onChange={(e) =>
                      setEditState((prev) => ({
                        ...prev,
                        positionCustom: e.target.value,
                      }))
                    }
                  />
                )}
              </div>

              {/* Admin remarks */}
              <div>
                <label className="font-medium text-sm">Admin Remarks</label>
                <textarea
                  className="border rounded p-2 mt-1 w-full h-20"
                  value={editState.adminRemarks}
                  onChange={(e) =>
                    setEditState((prev) => ({
                      ...prev,
                      adminRemarks: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Included documents */}
              <div>
                <p className="font-medium text-sm mb-1">
                  Documents to include in email
                </p>
                <label className="flex items-center gap-2 text-xs mb-1">
                  <input
                    type="checkbox"
                    checked={editState.includeTerms}
                    onChange={(e) =>
                      setEditState((prev) => ({
                        ...prev,
                        includeTerms: e.target.checked,
                      }))
                    }
                  />
                  Terms & Conditions / R&Rs (terms.pdf)
                </label>
                <label className="flex items-center gap-2 text-xs mb-1">
                  <input
                    type="checkbox"
                    checked={editState.includeSalary}
                    onChange={(e) =>
                      setEditState((prev) => ({
                        ...prev,
                        includeSalary: e.target.checked,
                      }))
                    }
                  />
                  Salary / Commission package (salary.pdf)
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={editState.includeLeave}
                    onChange={(e) =>
                      setEditState((prev) => ({
                        ...prev,
                        includeLeave: e.target.checked,
                      }))
                    }
                  />
                  Leave policy (leave.pdf)
                </label>
              </div>

              {/* Custom pdf */}
              <div>
                <label className="font-medium text-sm">
                  Custom PDF (optional, attaches in email)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="border rounded p-2 mt-1 w-full"
                  onChange={(e) =>
                    setEditState((prev) => ({
                      ...prev,
                      customPDFFile: e.target.files?.[0] ?? null,
                    }))
                  }
                />
                {editState.customPDFUrl && (
                  <p className="text-xs mt-1">
                    Existing:{" "}
                    <a
                      href={editState.customPDFUrl}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      View current custom document
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-4 py-2 rounded bg-black text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfile && selected && profileForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-sm">
            <h3 className="text-lg font-semibold mb-4">
              Profile — {profileForm.fullname}
            </h3>

            {/* basic info */}
            <div className="space-y-2 mb-4">
              <p>
                <span className="font-semibold">Form ID:</span>{" "}
                {profileForm.formid}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {profileForm.email}
              </p>
              <p>
                <span className="font-semibold">Mobile:</span>{" "}
                {profileForm.mobile}
              </p>
              <p>
                <span className="font-semibold">Alt Contact:</span>{" "}
                {profileForm.altcontact}
              </p>
            </div>

            {/* addresses */}
            <div className="mb-4">
              <p className="font-semibold">Addresses</p>
              <p>
                <span className="font-semibold">Permanent:</span>{" "}
                {profileForm.permanentaddress}
              </p>
              <p>
                <span className="font-semibold">Residential:</span>{" "}
                {profileForm.residentialaddress}
              </p>
            </div>

            {/* position & motivation */}
            <div className="mb-4">
              <p className="font-semibold">Position & Motivation</p>
              <p>
                <span className="font-semibold">Position Type:</span>{" "}
                {profileForm.positiontype}
              </p>
              <p>
                <span className="font-semibold">Applied For:</span>{" "}
                {profileForm.applyposition}
              </p>
              {profileForm.reason && (
                <p className="mt-1">
                  <span className="font-semibold">Why join:</span>{" "}
                  {profileForm.reason}
                </p>
              )}
              {profileForm.strengthsweakness && (
                <p className="mt-1">
                  <span className="font-semibold">Strengths & Weakness:</span>{" "}
                  {profileForm.strengthsweakness}
                </p>
              )}
              {profileForm.goals5years && (
                <p className="mt-1">
                  <span className="font-semibold">Goal in 5 years:</span>{" "}
                  {profileForm.goals5years}
                </p>
              )}
            </div>

            {/* vehicle */}
            {profileForm.vehicletype && (
              <div className="mb-4">
                <p className="font-semibold">Vehicle Details</p>
                <p>
                  <span className="font-semibold">Vehicle Type:</span>{" "}
                  {profileForm.vehicletype}
                </p>
              </div>
            )}

            {/* docs from form */}
            <div className="mb-4">
              <p className="font-semibold">Application Documents</p>

              {profileForm.aadharurl && profileForm.aadharurl.length > 0 && (
                <div className="mt-1">
                  <p className="text-xs font-semibold">Aadhar</p>
                  {profileForm.aadharurl.map((u, i) => (
                    <a
                      key={i}
                      href={u}
                      target="_blank"
                      className="block text-blue-600 underline text-xs"
                    >
                      Aadhar {i + 1}
                    </a>
                  ))}
                </div>
              )}

              {profileForm.panurl && profileForm.panurl.length > 0 && (
                <div className="mt-1">
                  <p className="text-xs font-semibold">PAN</p>
                  {profileForm.panurl.map((u, i) => (
                    <a
                      key={i}
                      href={u}
                      target="_blank"
                      className="block text-blue-600 underline text-xs"
                    >
                      PAN {i + 1}
                    </a>
                  ))}
                </div>
              )}

              {profileForm.cvurl && (
                <div className="mt-1">
                  <p className="text-xs font-semibold">CV / Resume</p>
                  <a
                    href={profileForm.cvurl}
                    target="_blank"
                    className="text-blue-600 underline text-xs"
                  >
                    Open CV
                  </a>
                </div>
              )}

              {profileForm.driverlicenseurl && (
                <div className="mt-1">
                  <p className="text-xs font-semibold">Driver License</p>
                  <a
                    href={profileForm.driverlicenseurl}
                    target="_blank"
                    className="text-blue-600 underline text-xs"
                  >
                    Open License
                  </a>
                </div>
              )}

              {profileForm.vehicledocsurl &&
                profileForm.vehicledocsurl.length > 0 && (
                  <div className="mt-1">
                    <p className="text-xs font-semibold">Vehicle Documents</p>
                    {profileForm.vehicledocsurl.map((u, i) => (
                      <a
                        key={i}
                        href={u}
                        target="_blank"
                        className="block text-blue-600 underline text-xs"
                      >
                        Vehicle Document {i + 1}
                      </a>
                    ))}
                  </div>
                )}
            </div>

            {/* contract info for approved/active */}
            {profileContract && (
              <div className="border-t pt-3 mt-3">
                <p className="font-semibold mb-1">Contract / Employment</p>
                <p>
                  <span className="font-semibold">Application Status:</span>{" "}
                  {profileContract.application_status}
                </p>
                <p>
                  <span className="font-semibold">Employment Status:</span>{" "}
                  {profileContract.employment_status || "—"}
                </p>
                {profileContract.employeeid && (
                  <p>
                    <span className="font-semibold">Employee ID:</span>{" "}
                    {profileContract.employeeid}
                  </p>
                )}
                {profileContract.assignedposition && (
                  <p>
                    <span className="font-semibold">Assigned Position:</span>{" "}
                    {profileContract.assignedposition}
                  </p>
                )}
                {profileContract.joiningdate && (
                  <p>
                    <span className="font-semibold">Joining Date:</span>{" "}
                    {profileContract.joiningdate}
                  </p>
                )}
                {profileContract.adminremarks && (
                  <p className="mt-1">
                    <span className="font-semibold">Admin Remarks:</span>{" "}
                    {profileContract.adminremarks}
                  </p>
                )}

                <div className="mt-2">
                  <p className="font-semibold text-xs mb-1">
                    Employment Documents
                  </p>
                  <ul className="list-disc ml-4 text-xs">
                    {profileContract.includeterms && (
                      <li>
                        <a
                          href="/terms.pdf"
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          Terms & Conditions / R&Rs
                        </a>
                      </li>
                    )}
                    {profileContract.includesalarypolicy && (
                      <li>
                        <a
                          href="/salary.pdf"
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          Salary / Commission Structure
                        </a>
                      </li>
                    )}
                    {profileContract.includeleavepolicy && (
                      <li>
                        <a
                          href="/leave.pdf"
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          Leave Policy
                        </a>
                      </li>
                    )}
                    {profileContract.custompdfurl && (
                      <li>
                        <a
                          href={profileContract.custompdfurl}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          Additional Contract Document
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowProfile(false)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
