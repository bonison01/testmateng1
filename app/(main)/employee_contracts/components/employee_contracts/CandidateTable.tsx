"use client";
import { CandidateRow } from "../../types";

interface Props {
  candidates: CandidateRow[];
  filterAppStatus: string;
  filterEmpStatus: string;
  openProfile: (row: CandidateRow) => void;
  openEdit: (row: CandidateRow) => void;
  sendEmail: (email: string, formid: string, name: string) => void;
}

export default function CandidateTable({
  candidates,
  filterAppStatus,
  filterEmpStatus,
  openProfile,
  openEdit,
  sendEmail,
}: Props) {
  
  // FILTERING
  const filtered = candidates.filter((c) => {
    if (filterAppStatus !== "all" && c.application_status !== filterAppStatus)
      return false;
    if (filterEmpStatus !== "all" && c.employment_status !== filterEmpStatus)
      return false;
    return true;
  });

  const appStatusBadge = (s: string) => {
    switch (s) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "talks": return "bg-blue-100 text-blue-700";
      case "approved": return "bg-purple-100 text-purple-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const empStatusBadge = (s: string | null) => {
    switch (s) {
      case "active": return "bg-green-100 text-green-700";
      case "inactive": return "bg-gray-300 text-gray-800";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">

      <table className="w-full">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="p-3 border">FormID</th>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Position</th>
            <th className="p-3 border">Application</th>
            <th className="p-3 border">Employment</th>
            <th className="p-3 border">ID</th>
            <th className="p-3 border">Applied</th>
            <th className="p-3 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((c) => (
            <tr key={c.formid} className="border-t">
              
              <td className="p-3 border font-mono">{c.formid}</td>
              <td className="p-3 border">{c.fullname}</td>
              <td className="p-3 border">{c.email}</td>
              
              <td className="p-3 border">
                {c.applyposition || c.positiontype}
              </td>

              {/* Application Status */}
              <td className="p-3 border">
                <span className={`px-2 py-1 text-xs rounded ${appStatusBadge(c.application_status)}`}>
                  {c.application_status}
                </span>
              </td>

              {/* Employment Status */}
              <td className="p-3 border">
                <span className={`px-2 py-1 text-xs rounded ${empStatusBadge(c.employment_status)}`}>
                  {c.employment_status ?? "—"}
                </span>
              </td>

              {/* Employee ID */}
              <td className="p-3 border font-mono text-xs">
                {c.employeeid ?? "—"}
              </td>

              {/* Applied Date */}
              <td className="p-3 border">{c.appliedDate}</td>

              {/* ACTIONS */}
              <td className="p-3 border">
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

          {filtered.length === 0 && (
            <tr>
              <td colSpan={9} className="p-4 text-center text-gray-500">
                No candidates found
              </td>
            </tr>
          )}

        </tbody>
      </table>
    </div>
  );
}
