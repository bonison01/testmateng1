'use client';

import jsPDF from 'jspdf';

interface TeamMember {
  name: string;
  class_institution: string;
  address_contact: string;
}

interface RegistrationFormData {
  id: number;
  candidate_name: string;
  dob: string;
  class_institution: string;
  contact_number: string;
  gender: string;
  alternative_contact: string;
  address: string;
  father_name: string;
  father_occupation: string;
  competitions: string[];
  participation_type: string;
  team_members?: TeamMember[];
  documents?: any[];
}

async function tryLoadImageAsBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onerror = () => resolve(null);
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(null); return; }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch { resolve(null); }
      };
      img.src = url;
    } catch { resolve(null); }
  });
}

function addImageSafe(doc: jsPDF, b64: string | null, x: number, y: number, w: number, h: number) {
  if (!b64) return;
  try {
    doc.addImage(b64, 'PNG', x, y, w, h, undefined, 'FAST');
  } catch (e) {
    console.warn('Failed to add image:', e);
  }
}

export const generateRegistrationFormPDF = async (data: RegistrationFormData): Promise<void> => {
  // Load images
  const signatureUrl = data.documents?.find((d: any) => d.document_type === 'candidate_signature')?.s3_url;
  const passportUrl = data.documents?.find((d: any) => d.document_type === 'passport_photo')?.s3_url;

  let logoBase64: string | null = null;
  try {
    logoBase64 = await tryLoadImageAsBase64('/mateng-edufest-logo.png');
  } catch (error) {
    console.error('Error loading logo:', error);
  }

  const [signatureBase64, passportBase64] = await Promise.all([
    signatureUrl ? tryLoadImageAsBase64(signatureUrl) : Promise.resolve(null),
    passportUrl ? tryLoadImageAsBase64(passportUrl) : Promise.resolve(null),
  ]);

  const selectedCompetitions: string[] = Array.isArray(data.competitions) ? data.competitions : [];
  const participationType: string = data.participation_type ?? '';

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const formNumber = `MEF-${String(data.id).padStart(6, '0')}`;

  const st = (text: string | null | undefined, x: number, y: number, opts?: any) => {
    const str = text ?? '';
    doc.text(str, x, y, opts || {});
  };

  const field = (label: string, value: string | null | undefined, y: number, maxWidth?: number) => {
    doc.setFont('helvetica', 'bold');
    st(label, 15, y);
    doc.setFont('helvetica', 'normal');
    doc.line(75, y + 1, pageWidth - 15, y + 1);
    const val = value ?? '';
    if (maxWidth) st(val, 77, y, { maxWidth });
    else st(val, 77, y);
  };

  let yPos = 22;

  // Outer Border
  doc.setLineWidth(0.6);
  doc.rect(10, 10, pageWidth - 20, 275);

  // ====================== HEADER ======================
  
  // Logo in the middle
  if (logoBase64) {
    addImageSafe(doc, logoBase64, (pageWidth - 55) / 2, yPos, 55, 22); // Centered logo
    yPos += 28;
  } else {
    yPos += 10; // space if logo fails to load
  }

  // Registration Form - 2026
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  st('Registration Form - 2026', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  // Organizer Details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  st('Justmateng Service Pvt. Ltd | Sagolband, Imphal West, Manipur-795004', 
     pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // Form Number (Bold, Top Right)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  st(`Form No: ${formNumber}`, pageWidth - 18, 22, { align: 'right' });

  // Separator Line
  doc.setLineWidth(0.4);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 14;

  doc.setFontSize(10);

  // ====================== FORM FIELDS ======================

  field('Full Name', data.candidate_name, yPos);
  yPos += 9;

  field('Date of Birth', data.dob, yPos);
  yPos += 9;

  field('Class & Institution', data.class_institution, yPos, pageWidth - 105);
  yPos += 9;

  field('Contact Number', data.contact_number, yPos);
  yPos += 9;

  field('Alternative Contact', data.alternative_contact, yPos);
  yPos += 9;

  field('Gender', data.gender, yPos);
  yPos += 9;

  // Address
  doc.setFont('helvetica', 'bold');
  st('Address', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.line(75, yPos + 1, pageWidth - 15, yPos + 1);
  st(data.address ?? '', 77, yPos, { maxWidth: pageWidth - 92 });
  yPos += 11;

  // Father's Name (Separate Line)
  doc.setFont('helvetica', 'bold');
  st("Father's Name", 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.line(75, yPos + 1, pageWidth - 15, yPos + 1);
  st(data.father_name ?? '', 77, yPos);
  yPos += 9;

  // Father's Occupation (Separate Line)
  doc.setFont('helvetica', 'bold');
  st("Father's Occupation", 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.line(75, yPos + 1, pageWidth - 15, yPos + 1);
  st(data.father_occupation ?? '', 77, yPos);
  yPos += 12;

  // Competition Category
  doc.setFont('helvetica', 'bold');
  st('Competition Category (Selected Events)', 15, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const competitions = [
    { key: 'painting', label: 'Painting Competition', fee: '- Rs. 150' },
    { key: 'quiz', label: 'Quiz Competition', fee: 'Rs. 300' },
    { key: 'mathematics', label: 'Mathematics Championship', fee: '- Rs. 200' },
    { key: 'young_innovator', label: 'Young Innovators Challenge', fee: '- Rs. 300' },
  ];

  competitions.forEach(comp => {
    const selected = selectedCompetitions.includes(comp.key);
    doc.rect(18, yPos - 3.5, 4, 4);
    if (selected) st('X', 18.8, yPos - 0.2);

    st(comp.label, 26, yPos);
    if (selected) {
      doc.setFont('helvetica', 'bold');
      st(comp.fee, 100, yPos, { align: 'left' });
      doc.setFont('helvetica', 'normal');
    }
    yPos += 7.5;
  });

  // Participation Type
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  st('Participation Type', 15, yPos);
  yPos += 7;

  const partOptions = [
    { label: 'Individual', key: 'individual' },
    { label: 'Team (Quiz — max 2 members)', key: 'team_quiz' },
    { label: 'Team (Young Innovators — max 3 members)', key: 'team_innovator' },
  ];

  partOptions.forEach(opt => {
    const isChecked =
      (opt.key === 'individual' && participationType === 'individual') ||
      (opt.key === 'team_quiz' && participationType === 'team' && selectedCompetitions.includes('quiz')) ||
      (opt.key === 'team_innovator' && participationType === 'team' && selectedCompetitions.includes('young_innovator'));

    doc.rect(18, yPos - 3.5, 4, 4);
    if (isChecked) st('X', 18.8, yPos - 0.2);
    st(opt.label, 26, yPos);
    yPos += 7;
  });

  // Team Members
  if (data.team_members && data.team_members.length > 0) {
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    st('Team Members', 15, yPos);
    yPos += 8;

    data.team_members.forEach((member, index) => {
      doc.setFont('helvetica', 'bold');
      st(`Member ${index + 2}:`, 15, yPos);
      doc.setFont('helvetica', 'normal');
      st(member.name, 45, yPos);
      yPos += 6;

      st(`Class & Institution : ${member.class_institution}`, 18, yPos);
      yPos += 6;
      st(`Contact / Address   : ${member.address_contact}`, 18, yPos);
      yPos += 8;
    });
  }

  // Save PDF
  doc.save(`MatengEduFest_Registration_${data.candidate_name ?? 'Candidate'}_${formNumber}.pdf`);
};