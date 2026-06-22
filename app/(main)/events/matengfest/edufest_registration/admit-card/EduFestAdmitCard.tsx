'use client';

import QRCode from 'react-qr-code';

const COMPETITION_LABELS: Record<string, string> = {
  painting: 'Painting',
  quiz: 'Quiz',
  mathematics: 'Mathematics',
  young_innovator: 'Young Innovator',
};

const COMPETITION_DATES: Record<string, string> = {
  painting: 'TBA',
  quiz: 'TBA',
  mathematics: 'TBA',
  young_innovator: 'TBA',
};

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

interface RegistrationData {
  id: number;
  full_name: string;
  dob: string;
  student_class: string;
  institution_name: string;
  gender: string;
  contact_number: string;
  email: string;
  father_name: string;
  competition_category: string[];
  participation_type: 'individual' | 'team';
  team_size: number | null;
  team_members: TeamMemberRow[] | null;
  documents?: DocumentRow[];
}

export default function EduFestAdmitCard({ data }: { data: RegistrationData }) {
  const photo = data.documents?.find(d => d.document_type === 'passport_photo')?.s3_url;
  const signature = data.documents?.find(d => d.document_type === 'candidate_signature')?.s3_url;

  const regNo = `MED${String(data.id).padStart(6, '0')}`;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div id="edufest-admit-card" className="bg-gray-100 p-4 md:p-8 max-w-3xl mx-auto">
        <div className="w-full bg-white shadow-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
          <div className="border-2 border-black">
            {/* Header */}
            <div className="grid grid-cols-[2fr_1fr] border-b-2 border-black">
              <div className="border-r-2 border-black p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-black">MATENG EDUFEST 2026</div>
                  <div className="text-sm font-semibold mt-1 text-black">Competition Admit Card</div>
                </div>
              </div>
              <div className="p-4 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mateng-edufest-logo.png" alt="" className="w-[140px]" />
              </div>
            </div>

            {/* Candidate Information */}
            <div className="grid grid-cols-2 border-b-2 border-black">
              <div className="border-r-2 border-black">
                <Row label="Registration No:" value={regNo} bold />
                <Row label="Candidate's Name:" value={data.full_name} />
                <Row label="Gender:" value={data.gender} />
                <Row label="Class / Grade:" value={data.student_class} last />
              </div>
              <div>
                <Row label="Date of Birth:" value={data.dob} />
                <Row label="Father's Name:" value={data.father_name} />
                <Row label="Institution:" value={data.institution_name} />
                <Row label="Participation:" value={data.participation_type} capitalize last />
              </div>
            </div>

            {/* QR + Signature + Photo */}
            <div className="grid grid-cols-3 border-b-2 border-black">
              <div className="border-r-2 border-black p-4 flex flex-col items-center justify-center">
                <div className="bg-white p-2">
                  <QRCode
                    value={`Registration: ${regNo}, Name: ${data.full_name}`}
                    size={110}
                    level="H"
                  />
                </div>
                <div className="text-sm font-bold mt-2 text-black">{regNo}</div>
              </div>
              <div className="border-r-2 border-black p-4 flex items-center justify-center">
                <div className="text-center">
                  {signature ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={signature} alt="signature" className="h-28 rounded-lg mx-auto" />
                  ) : (
                    <div className="h-28 w-36 flex items-center justify-center text-gray-400 text-xs border border-dashed border-gray-300">
                      No signature
                    </div>
                  )}
                  <p className="text-gray-600 italic text-sm mt-1">Signature</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-center">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="photo" className="h-28 rounded-lg" />
                ) : (
                  <div className="h-28 w-24 flex items-center justify-center text-gray-400 text-xs border border-dashed border-gray-300">
                    No photo
                  </div>
                )}
              </div>
            </div>

            {/* Competition Details Header */}
            <div className="bg-gray-50 p-2 text-center font-bold border-b-2 border-black text-black">
              Competition Details
            </div>

            <div className="border-b-2 border-black">
              {data.competition_category?.map((cat, i) => (
                <Row
                  key={cat}
                  label={COMPETITION_LABELS[cat] || cat}
                  value={COMPETITION_DATES[cat] || 'TBA'}
                  last={i === data.competition_category.length - 1}
                />
              ))}
            </div>

            {/* Team members, if applicable */}
            {data.participation_type === 'team' && data.team_members && data.team_members.length > 0 && (
              <>
                <div className="bg-gray-50 p-2 text-center font-bold border-b-2 border-black text-black">
                  Team Members
                </div>
                <div className="border-b-2 border-black">
                  {data.team_members.map((m, i) => (
                    <Row
                      key={i}
                      label={m.name}
                      value={`${m.student_class} · ${m.institute}`}
                      last={i === data.team_members!.length - 1}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Self declaration */}
            <div className="p-4 text-xs text-gray-800">
              <div className="text-center font-bold text-red-600 mb-2">SELF DECLARATION (UNDERTAKING)</div>
              <div>
                I, _________________________________, resident of _________________________________, do hereby
                declare that the information provided above is true to the best of my knowledge, and I undertake to
                abide by all rules and instructions of Mateng EduFest 2026.
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 text-center border-t-2 border-black text-[10px] text-gray-500 italic">
              This admit card is computer generated and does not require a physical signature. For assistance, contact
              Mateng at justmatengservice@gmail.com or call 600 944 9928.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  capitalize,
  last,
}: {
  label: string;
  value: string;
  bold?: boolean;
  capitalize?: boolean;
  last?: boolean;
}) {
  return (
    <div className={`grid grid-cols-2 ${last ? '' : 'border-b border-black'}`}>
      <div className="border-r border-black p-2 font-bold text-sm bg-gray-50 text-black">{label}</div>
      <div className={`p-2 text-sm text-gray-900 ${bold ? 'font-bold' : ''} ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </div>
    </div>
  );
}