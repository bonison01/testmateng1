//app/(main)/admin/edufest/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../events/matengfest/edufest_registration/type';
import { generateEduFestAdmitCardPDF } from '../../events/matengfest/edufest_registration/generatePDF';

type VerificationStatus = 'pending' | 'verified' | 'rejected';

interface DocumentRow {
  document_type: string;
  s3_url: string;
}

interface TeamMemberRow {
  name: string;
  dob: string;
  student_class: string;
  institute: string;
}

interface RegistrationRow {
  id: number;
  full_name: string;
  dob: string;
  student_class: string;
  institution_name: string;
  contact_number: string;
  alternate_contact_number: string | null;
  gender: string;
  email: string;
  address: string;
  father_name: string;
  father_occupation: string;
  competition_category: string[];
  participation_type: 'individual' | 'team';
  team_size: number | null;
  team_members: TeamMemberRow[] | null;
  verification_status: VerificationStatus;
  created_at: string;
  documents?: DocumentRow[];
}

const COMPETITION_LABELS: Record<string, string> = {
  painting: 'Painting',
  quiz: 'Quiz',
  mathematics: 'Mathematics',
  young_innovator: 'Young Innovator',
};

const STATUS_COLORS: Record<VerificationStatus, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  verified: { bg: '#dcfce7', text: '#166534' },
  rejected: { bg: '#fee2e2', text: '#991b1b' },
};

export default function EduFestAdminPage() {
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | VerificationStatus>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<RegistrationRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [verifiedDialog, setVerifiedDialog] = useState<RegistrationRow | null>(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      let query = supabase.from('registrations').select('*').order('created_at', { ascending: false });
      if (filter !== 'all') query = query.eq('verification_status', filter);

      const { data: regs, error: regError } = await query;
      if (regError) throw regError;
      if (!regs) {
        setRegistrations([]);
        return;
      }

      const ids = regs.map((r: any) => r.id);
      const { data: docs, error: docError } = await supabase
        .from('documents')
        .select('registration_id, document_type, s3_url')
        .in('registration_id', ids);

      if (docError) throw docError;

      const docsByReg: Record<number, DocumentRow[]> = {};
      (docs || []).forEach((d: any) => {
        if (!docsByReg[d.registration_id]) docsByReg[d.registration_id] = [];
        docsByReg[d.registration_id].push({ document_type: d.document_type, s3_url: d.s3_url });
      });

      setRegistrations(regs.map((r: any) => ({ ...r, documents: docsByReg[r.id] || [] })));
    } catch (err) {
      console.error('Failed to load registrations:', err);
      alert('❌ Failed to fetch: ' + (err as any)?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const updateStatus = async (id: number, status: VerificationStatus, registration?: RegistrationRow) => {
    const { data, error } = await supabase
      .from('registrations')
      .update({ verification_status: status })
      .eq('id', id)
      .select();

    if (error) {
      alert('❌ Failed: ' + error.message);
      return;
    }

    // Supabase can return error: null even when RLS blocks the write —
    // in that case the UPDATE matches zero rows and `data` comes back empty.
    if (!data || data.length === 0) {
      alert(
        '❌ The update did not apply. This is usually caused by a missing RLS UPDATE policy on the "registrations" table for the anon role. Check Supabase → Authentication → Policies.'
      );
      return;
    }

    setRegistrations(prev => prev.map(r => (r.id === id ? { ...r, verification_status: status } : r)));
    setSelected(prev => (prev && prev.id === id ? { ...prev, verification_status: status } : prev));

    if (status === 'verified') {
      const updated = { ...(registration as RegistrationRow), verification_status: status };
      setVerifiedDialog(updated);
    } else {
      setToast(`✅ Marked as ${status}`);
    }
  };

  const handleDownloadAdmitCard = async (reg: RegistrationRow) => {
    setDownloadingId(reg.id);
    try {
      await generateEduFestAdmitCardPDF(reg as any);
    } catch (err) {
      console.error('Admit card download failed:', err);
      alert('❌ Could not generate admit card.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Registration No', 'Full Name', 'DOB', 'Gender', 'Class', 'Institution',
      'Contact Number', 'Alternate Contact', 'Email', 'Address',
      "Father's Name", "Father's Occupation",
      'Competitions', 'Participation Type', 'Team Size', 'Team Members',
      'Verification Status', 'Registered At',
    ];

    const rows = filteredRegistrations.map(r => [
      `MED${String(r.id).padStart(6, '0')}`,
      r.full_name,
      r.dob,
      r.gender,
      r.student_class,
      r.institution_name,
      r.contact_number,
      r.alternate_contact_number || '',
      r.email,
      r.address,
      r.father_name,
      r.father_occupation,
      (r.competition_category || []).map(c => COMPETITION_LABELS[c] || c).join('; '),
      r.participation_type,
      r.team_size ?? '',
      (r.team_members || []).map(m => `${m.name} (${m.student_class}, ${m.institute})`).join('; '),
      r.verification_status,
      new Date(r.created_at).toLocaleString('en-IN'),
    ]);

    const escapeCell = (val: any) => {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const csv = [headers, ...rows].map(row => row.map(escapeCell).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edufest_registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast('✅ CSV exported');
  };

  const filteredRegistrations = registrations.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.full_name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.institution_name?.toLowerCase().includes(q) ||
      String(r.id).includes(q)
    );
  });

  const regNo = (id: number) => `MED${String(id).padStart(6, '0')}`;

  if (loading && registrations.length === 0) {
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  return (
    <>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: '#16a34a',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 10,
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            zIndex: 999,
          }}
        >
          {toast}
        </div>
      )}

      <div style={{ padding: 24, background: '#f9fafb', minHeight: '100vh', fontFamily: 'sans-serif', color: '#111827', colorScheme: 'light', opacity: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: '#111827' }}>Admin – EduFest Registrations</h1>
            <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
              Review documents, verify candidates, and manage admit card access.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              background: '#111827',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            ⬇ Export CSV
          </button>
        </div>

        {/* Search */}
        <div style={{ marginTop: 16 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, institution, or ID…"
            style={{
              width: '100%',
              maxWidth: 420,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              fontSize: 13,
              background: '#fff',
              color: '#111827',
            }}
          />
        </div>

        {/* Filter */}
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(['all', 'pending', 'verified', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: filter === f ? '#111827' : '#fff',
                color: filter === f ? '#fff' : '#111827',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Counts */}
        <div style={{ marginTop: 20, marginBottom: 10, display: 'flex', gap: 20, fontSize: 13, flexWrap: 'wrap', color: '#111827' }}>
          <div><b>{registrations.length}</b> Total</div>
          <div><b>{registrations.filter(r => r.verification_status === 'verified').length}</b> Verified</div>
          <div><b>{registrations.filter(r => r.verification_status === 'pending').length}</b> Pending</div>
          <div><b>{registrations.filter(r => r.verification_status === 'rejected').length}</b> Rejected</div>
        </div>

        {/* List */}
        <div style={{ marginTop: 20, display: 'grid', gap: 16 }}>
          {filteredRegistrations.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', background: '#fff', borderRadius: 16 }}>
              No registrations found.
            </div>
          ) : (
            filteredRegistrations.map(r => {
              const colors = STATUS_COLORS[r.verification_status];
              return (
                <div
                  key={r.id}
                  style={{
                    padding: 18,
                    borderRadius: 16,
                    background: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid #f1f5f9',
                    transition: '0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0px)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 18, color: '#111827' }}>{r.full_name}</h2>
                      <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
                        {regNo(r.id)} • {r.student_class} • {r.institution_name}
                      </p>
                      <p style={{ fontSize: 13, margin: '4px 0 0', color: '#111827' }}>
                        Contact: <b>{r.contact_number}</b> &nbsp;·&nbsp; Email: <b>{r.email}</b>
                      </p>
                      <p style={{ fontSize: 13, margin: '4px 0 0', color: '#111827' }}>
                        Father: <b>{r.father_name}</b> ({r.father_occupation})
                      </p>

                      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {r.competition_category?.map(c => (
                          <span
                            key={c}
                            style={{
                              padding: '3px 10px',
                              borderRadius: 999,
                              background: '#fef3c7',
                              color: '#92400e',
                              fontWeight: 600,
                              fontSize: 11,
                            }}
                          >
                            {COMPETITION_LABELS[c] || c}
                          </span>
                        ))}
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 999,
                            background: '#e0e7ff',
                            color: '#3730a3',
                            fontWeight: 600,
                            fontSize: 11,
                            textTransform: 'capitalize',
                          }}
                        >
                          {r.participation_type}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 999,
                          background: colors.bg,
                          color: colors.text,
                          fontWeight: 700,
                          fontSize: 12,
                          textTransform: 'capitalize',
                        }}
                      >
                        {r.verification_status}
                      </span>
                      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setSelected(r)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 10,
                        border: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        background: '#fff',
                        color: '#111827',
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      View Details
                    </button>

                    {r.verification_status !== 'verified' && (
                      <button
                        onClick={() => updateStatus(r.id, 'verified', r)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 10,
                          border: 'none',
                          cursor: 'pointer',
                          background: '#14710F',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        Verify
                      </button>
                    )}

                    {r.verification_status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus(r.id, 'rejected')}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 10,
                          border: 'none',
                          cursor: 'pointer',
                          background: '#ef4444',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        Reject
                      </button>
                    )}

                    {r.verification_status !== 'pending' && (
                      <button
                        onClick={() => updateStatus(r.id, 'pending')}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 10,
                          border: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          background: '#fff',
                          color: '#92400e',
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        Reset to Pending
                      </button>
                    )}

                    <button
                      onClick={() => handleDownloadAdmitCard(r)}
                      disabled={downloadingId === r.id}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 10,
                        border: 'none',
                        cursor: downloadingId === r.id ? 'not-allowed' : 'pointer',
                        background: downloadingId === r.id ? '#9ca3af' : '#2563eb',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {downloadingId === r.id ? 'Generating…' : '⬇ Admit Card'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <DetailModal
          registration={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={updateStatus}
          onDownloadAdmitCard={handleDownloadAdmitCard}
          downloading={downloadingId === selected.id}
          regNo={regNo(selected.id)}
        />
      )}

      {/* Verified confirmation dialog */}
      {verifiedDialog && (
        <VerifiedDialog
          registration={verifiedDialog}
          regNo={regNo(verifiedDialog.id)}
          onClose={() => setVerifiedDialog(null)}
        />
      )}
    </>
  );
}

function DetailModal({
  registration,
  onClose,
  onUpdateStatus,
  onDownloadAdmitCard,
  downloading,
  regNo,
}: {
  registration: RegistrationRow;
  onClose: () => void;
  onUpdateStatus: (id: number, status: VerificationStatus, registration?: RegistrationRow) => void;
  onDownloadAdmitCard: (r: RegistrationRow) => void;
  downloading: boolean;
  regNo: string;
}) {
  const photoUrl = registration.documents?.find(d => d.document_type === 'passport_photo')?.s3_url;
  const sigUrl = registration.documents?.find(d => d.document_type === 'candidate_signature')?.s3_url;
  const paymentUrl = registration.documents?.find(d => d.document_type === 'payment_screenshot')?.s3_url;
  const colors = STATUS_COLORS[registration.verification_status];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          maxWidth: 700,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: 24, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, color: '#111827' }}>{registration.full_name}</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
              {regNo} • {new Date(registration.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
            <span
              style={{
                display: 'inline-block',
                marginTop: 8,
                padding: '3px 10px',
                borderRadius: 999,
                background: colors.bg,
                color: colors.text,
                fontWeight: 700,
                fontSize: 12,
                textTransform: 'capitalize',
              }}
            >
              {registration.verification_status}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#9ca3af' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <SectionTitle>Personal Information</SectionTitle>
          <Grid>
            <Field label="Date of Birth" value={registration.dob} />
            <Field label="Gender" value={registration.gender} />
            <Field label="Contact Number" value={registration.contact_number} />
            <Field label="Alternate Contact" value={registration.alternate_contact_number || '—'} />
            <Field label="Email" value={registration.email} />
            <Field label="Class / Grade" value={registration.student_class} />
          </Grid>
          <div style={{ marginTop: 12 }}>
            <Field label="Institution" value={registration.institution_name} />
          </div>
          <div style={{ marginTop: 12 }}>
            <Field label="Address" value={registration.address} />
          </div>

          <SectionTitle style={{ marginTop: 24 }}>Guardian Information</SectionTitle>
          <Grid>
            <Field label="Father's Name" value={registration.father_name} />
            <Field label="Father's Occupation" value={registration.father_occupation} />
          </Grid>

          {registration.participation_type === 'team' && registration.team_members && registration.team_members.length > 0 && (
            <>
              <SectionTitle style={{ marginTop: 24 }}>Team Members ({registration.team_size} total)</SectionTitle>
              {registration.team_members.map((m, i) => (
                <div key={i} style={{ border: '1px solid #f1f5f9', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                  <Grid>
                    <Field label="Name" value={m.name} />
                    <Field label="Class" value={m.student_class} />
                    <Field label="DOB" value={m.dob} />
                    <Field label="Institution" value={m.institute} />
                  </Grid>
                </div>
              ))}
            </>
          )}

          <SectionTitle style={{ marginTop: 24 }}>Documents</SectionTitle>
          <Grid>
            <DocPreview label="Passport Photo" url={photoUrl} />
            <DocPreview label="Signature" url={sigUrl} />
          </Grid>
          <div style={{ marginTop: 12 }}>
            <DocPreview label="Payment Screenshot" url={paymentUrl} wide />
          </div>
        </div>

        <div style={{ padding: 24, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => onUpdateStatus(registration.id, 'verified', registration)}
            style={{ padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#14710F', color: '#fff', fontWeight: 600, fontSize: 13 }}
          >
            Verify
          </button>
          <button
            onClick={() => onUpdateStatus(registration.id, 'rejected')}
            style={{ padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#ef4444', color: '#fff', fontWeight: 600, fontSize: 13 }}
          >
            Reject
          </button>
          <button
            onClick={() => onUpdateStatus(registration.id, 'pending')}
            style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#92400e', fontWeight: 600, fontSize: 13 }}
          >
            Reset to Pending
          </button>
          <button
            onClick={() => onDownloadAdmitCard(registration)}
            disabled={downloading}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              cursor: downloading ? 'not-allowed' : 'pointer',
              background: downloading ? '#9ca3af' : '#2563eb',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {downloading ? 'Generating…' : '⬇ Download Admit Card'}
          </button>
        </div>
      </div>
    </div>
  );
}

function VerifiedDialog({
  registration,
  regNo,
  onClose,
}: {
  registration: RegistrationRow;
  regNo: string;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          padding: 32,
          textAlign: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            fontSize: 30,
            color: '#16a34a',
          }}
        >
          ✓
        </div>

        <h2 style={{ margin: 0, fontSize: 19, color: '#111827' }}>Candidate Verified!</h2>

        <p style={{ fontSize: 14, color: '#4b5563', marginTop: 10, lineHeight: 1.5 }}>
          <b style={{ color: '#111827' }}>{registration.full_name}</b> ({regNo}) has been successfully verified.
          They can now download their admit card.
        </p>

        <button
          onClick={onClose}
          style={{
            marginTop: 22,
            width: '100%',
            padding: '12px 18px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            background: '#16a34a',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, ...style }}>
      {children}
    </p>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 13, color: '#111827', margin: '2px 0 0', fontWeight: 600 }}>{value || '—'}</p>
    </div>
  );
}

function DocPreview({ label, url, wide }: { label: string; url?: string; wide?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            style={{
              maxHeight: wide ? 220 : 140,
              maxWidth: '100%',
              objectFit: 'contain',
              borderRadius: 10,
              border: '1px solid #f1f5f9',
              background: '#fff',
            }}
          />
        </a>
      ) : (
        <div
          style={{
            height: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed #e5e7eb',
            borderRadius: 10,
            color: '#9ca3af',
            fontSize: 12,
          }}
        >
          Not uploaded
        </div>
      )}
    </div>
  );
}