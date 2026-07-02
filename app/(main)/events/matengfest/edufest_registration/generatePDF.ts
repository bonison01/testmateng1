// generatePDF.ts
'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

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
  exam_center: string | null;
  documents?: DocumentRow[];
}

const COMPETITION_LABELS: Record<string, string> = {
  painting: 'Painting',
  quiz: 'Quiz',
  mathematics: 'Mathematics',
  young_innovator: 'Young Innovator',
};

// Fixed for all candidates
const EXAM_DATE_DISPLAY = '12 July 2026';
const EXAM_TIME_DISPLAY = '10:00 AM';

function getImageFormat(dataUrl: string): string {
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'JPEG';
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
  return 'PNG';
}

export const generateEduFestAdmitCardPDF = async (data: RegistrationData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 5;

  const regNo = `MED${String(data.id).padStart(6, '0')}`;

  const photoUrl = data.documents?.find(d => d.document_type === 'passport_photo')?.s3_url;
  const signatureUrl = data.documents?.find(d => d.document_type === 'candidate_signature')?.s3_url;

  let photoBase64: string | null = null;
  let signatureBase64: string | null = null;
  let logoBase64: string | null = null;

  try { logoBase64 = await loadImageAsBase64('/mateng-edufest-logo.png'); } catch (e) { console.error('Logo:', e); }
  if (photoUrl) { try { photoBase64 = await loadImageAsBase64(photoUrl); } catch (e) { console.error('Photo:', e); } }
  if (signatureUrl) { try { signatureBase64 = await loadImageAsBase64(signatureUrl); } catch (e) { console.error('Sig:', e); } }

  // ===== Outer Border =====
  doc.setLineWidth(0.5);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

  // ===== Header =====
  const headerDivider = pageWidth - 55;
  doc.line(headerDivider, 5, headerDivider, 28);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('MATENG EDUFEST 2026', (headerDivider + 5) / 2, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Competition Admit Card', (headerDivider + 5) / 2, 21, { align: 'center' });

  if (logoBase64) {
    try {
      const logoWidth = 36;
      const logoHeight = 15;
      doc.addImage(logoBase64, getImageFormat(logoBase64), (headerDivider + pageWidth - 5) / 2 - logoWidth / 2, 10, logoWidth, logoHeight, undefined, 'FAST');
    } catch (e) { console.error('Logo add:', e); }
  }

  doc.setLineWidth(0.5);
  doc.line(5, 28, pageWidth - 5, 28);
  yPosition = 28;

  // ===== Candidate Information =====
  const halfWidth = pageWidth / 2;

  autoTable(doc, {
    startY: yPosition,
    body: [
      ['Registration No:', regNo],
      ["Candidate's Name:", data.full_name],
      ['Gender:', data.gender],
      ['Class / Grade:', data.student_class],
    ],
    theme: 'grid',
    tableWidth: halfWidth,
    margin: { left: 5 },
    styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.1 },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold', fillColor: [245, 245, 245] },
      1: { cellWidth: 62 },
    },
  });

  autoTable(doc, {
    startY: yPosition,
    body: [
      ['Date of Birth:', data.dob],
      ["Father's Name:", data.father_name],
      ['Institution:', data.institution_name],
      ['Participation:', data.participation_type === 'team' ? 'Team' : 'Individual'],
    ],
    theme: 'grid',
    tableWidth: halfWidth,
    margin: { left: halfWidth },
    styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.1 },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold', fillColor: [245, 245, 245] },
      1: { cellWidth: 62 },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY;

  // ===== Exam Details Band (only if centre assigned) =====
  if (data.exam_center) {
    const examCols = [data.exam_center, EXAM_DATE_DISPLAY, EXAM_TIME_DISPLAY];
    const examLabels = ['Exam Centre', 'Date', 'Time'];
    const colW = (pageWidth - 10) / 3;
    const bandH = 19;

    // Header row
    doc.setFillColor(239, 246, 255);
    doc.rect(5, yPosition, pageWidth - 10, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 78, 216);
    doc.text('EXAM DETAILS', pageWidth / 2, yPosition + 5, { align: 'center' });
    yPosition += 7;

    // Data row
    doc.setLineWidth(0.1);
    doc.setDrawColor(0, 0, 0);
    examCols.forEach((val, i) => {
      const x = 5 + i * colW;
      doc.setFillColor(239, 246, 255);
      doc.rect(x, yPosition, colW, bandH - 7, 'FD');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(examLabels[i].toUpperCase(), x + 3, yPosition + 4.5);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text(val, x + 3, yPosition + 10);
    });

    yPosition += bandH - 7;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(5, yPosition, pageWidth - 5, yPosition);
  }

  // ===== QR + Signature + Photo =====
  const qrCodeDataUrl = await QRCode.toDataURL(
    `Registration: ${regNo}, Name: ${data.full_name}`,
    { width: 400, margin: 1, errorCorrectionLevel: 'H' }
  );

  const sectionWidth = pageWidth - 10;
  const col1Width = sectionWidth / 3;
  const col2Width = (sectionWidth / 3) * 2;
  const sectionHeight = 45;

  doc.setLineWidth(0.5);
  doc.line(5, yPosition, pageWidth - 5, yPosition);
  doc.line(5 + col1Width, yPosition, 5 + col1Width, yPosition + sectionHeight);
  doc.line(5 + col2Width, yPosition, 5 + col2Width, yPosition + sectionHeight);

  const qrSize = 32;
  doc.addImage(qrCodeDataUrl, 'PNG', 5 + col1Width / 2 - qrSize / 2, yPosition + 3, qrSize, qrSize);
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
  doc.text(regNo, 5 + col1Width / 2, yPosition + 40, { align: 'center' });

  const signatureX = 5 + col1Width + col1Width / 2;
  if (signatureBase64) {
    try { doc.addImage(signatureBase64, getImageFormat(signatureBase64), 5 + col1Width + 5, yPosition + 3, col1Width - 10, 30, undefined, 'FAST'); }
    catch (e) { console.error('Sig add:', e); }
  } else {
    doc.setFontSize(8); doc.setTextColor(150, 150, 150);
    doc.text('[Signature]', signatureX, yPosition + 18, { align: 'center' });
  }
  doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(100, 100, 100);
  doc.text('Signature', signatureX, yPosition + 40, { align: 'center' });

  const photoX = 5 + col2Width + col1Width / 2;
  if (photoBase64) {
    try { doc.addImage(photoBase64, getImageFormat(photoBase64), photoX - 14, yPosition + 3, 28, 36, undefined, 'FAST'); }
    catch (e) { console.error('Photo add:', e); }
  } else {
    doc.setFontSize(8); doc.setTextColor(150, 150, 150);
    doc.text('[Photo]', photoX, yPosition + 18, { align: 'center' });
  }

  yPosition += sectionHeight;
  doc.line(5, yPosition, pageWidth - 5, yPosition);

  // ===== Competition Details =====
  doc.setFillColor(245, 245, 245);
  doc.rect(5, yPosition, pageWidth - 10, 7, 'F');
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
  doc.text('Competition Details', pageWidth / 2, yPosition + 5, { align: 'center' });

  autoTable(doc, {
    startY: yPosition,
    body: data.competition_category.map(cat => [COMPETITION_LABELS[cat] || cat, EXAM_DATE_DISPLAY]),
    theme: 'grid',
    margin: { left: 5, right: 5 },
    styles: { fontSize: 8, cellPadding: 2.2, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0] },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold', fillColor: [245, 245, 245] },
      1: { cellWidth: 'auto' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY;

  // ===== Team Members =====
  if (data.participation_type === 'team' && data.team_members && data.team_members.length > 0) {
    doc.setFillColor(245, 245, 245);
    doc.rect(5, yPosition, pageWidth - 10, 7, 'F');
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
    doc.text('Team Members', pageWidth / 2, yPosition + 5, { align: 'center' });

    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Class', 'Institution']],
      body: data.team_members.map(m => [m.name, m.student_class, m.institute]),
      theme: 'grid',
      margin: { left: 5, right: 5 },
      styles: { fontSize: 8, cellPadding: 2.2, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0] },
      headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
    });

    yPosition = (doc as any).lastAutoTable.finalY;
  }

  doc.setLineWidth(0.5);
  doc.line(5, yPosition, pageWidth - 5, yPosition);

  // ===== Self Declaration =====
  const declTop = yPosition + 3;
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 0, 0);
  doc.text('SELF DECLARATION (UNDERTAKING)', pageWidth / 2, declTop + 4, { align: 'center' });

  doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  const declarationText =
    'I, _________________________________, resident of _________________________________, do hereby declare ' +
    'that the information provided above is true to the best of my knowledge, and I undertake to abide by all ' +
    'rules and instructions of Mateng EduFest 2026.';
  const declLines = doc.splitTextToSize(declarationText, pageWidth - 20);
  doc.text(declLines, 10, declTop + 11);

  const sigLineY = declTop + 11 + declLines.length * 4.5 + 12;
  doc.setLineWidth(0.3);
  doc.line(pageWidth - 65, sigLineY, pageWidth - 10, sigLineY);
  doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(80, 80, 80);
  doc.text("Candidate's Signature", pageWidth - 37, sigLineY + 4, { align: 'center' });

  // ===== Footer =====
  const footerY = pageHeight - 8;
  doc.setLineWidth(0.3);
  doc.line(5, footerY - 5, pageWidth - 5, footerY - 5);
  doc.setFontSize(6.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(100, 100, 100);
  doc.text('This admit card is computer generated and does not require a physical signature. For assistance, contact', pageWidth / 2, footerY - 1.5, { align: 'center' });
  doc.text('Mateng at justmatengservice@gmail.com or call 600 944 9928.', pageWidth / 2, footerY + 2.5, { align: 'center' });

  doc.save(`EduFest_Admit_Card_${data.full_name}_${regNo}.pdf`);
};

// ─── Image loader ─────────────────────────────────────────────────────────────

async function loadImageAsBase64(url: string): Promise<string> {
  const fullUrl = url.startsWith('/') ? window.location.origin + url : url;

  try {
    const response = await fetch(fullUrl, { mode: 'cors', cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => { const r = reader.result as string; if (r) resolve(r); else reject(new Error('Empty')); };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(blob);
    });
  } catch (fetchError) {
    console.warn('fetch() failed, trying canvas fallback:', fetchError);
  }

  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('No canvas context')); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error(`Failed to load: ${fullUrl}`));
    img.src = fullUrl;
  });
}