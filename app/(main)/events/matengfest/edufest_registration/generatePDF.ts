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
  documents?: DocumentRow[];
}

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

  try {
    logoBase64 = await loadImageAsBase64('/mateng-edufest-logo.png');
  } catch (error) {
    console.error('Error loading logo:', error);
  }

  if (photoUrl) {
    try {
      photoBase64 = await loadImageAsBase64(photoUrl);
    } catch (error) {
      console.error('Error loading photo:', error);
    }
  }

  if (signatureUrl) {
    try {
      signatureBase64 = await loadImageAsBase64(signatureUrl);
    } catch (error) {
      console.error('Error loading signature:', error);
    }
  }

  // ===== Border =====
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
      const logoX = (headerDivider + pageWidth - 5) / 2 - logoWidth / 2;
      doc.addImage(logoBase64, getImageFormat(logoBase64), logoX, 10, logoWidth, logoHeight, undefined, 'FAST');
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }

  doc.setLineWidth(0.5);
  doc.line(5, 28, pageWidth - 5, 28);
  yPosition = 28;

  // ===== Candidate Information =====
  const candidateInfo = [
    [
      ['Registration No:', regNo],
      ["Candidate's Name:", data.full_name],
      ['Gender:', data.gender],
      ['Class / Grade:', data.student_class],
    ],
    [
      ['Date of Birth:', data.dob],
      ["Father's Name:", data.father_name],
      ['Institution:', data.institution_name],
      ['Participation:', data.participation_type === 'team' ? 'Team' : 'Individual'],
    ],
  ];

  const halfWidth = pageWidth / 2;

  autoTable(doc, {
    startY: yPosition,
    body: candidateInfo[0],
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
    body: candidateInfo[1],
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

  // ===== QR + Signature + Photo =====
  const qrData = `Registration: ${regNo}, Name: ${data.full_name}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 400, margin: 1, errorCorrectionLevel: 'H' });

  const sectionWidth = pageWidth - 10;
  const col1Width = sectionWidth / 3;
  const col2Width = (sectionWidth / 3) * 2;
  const sectionHeight = 45;

  doc.setLineWidth(0.5);
  doc.line(5, yPosition, pageWidth - 5, yPosition);
  doc.line(5 + col1Width, yPosition, 5 + col1Width, yPosition + sectionHeight);
  doc.line(5 + col2Width, yPosition, 5 + col2Width, yPosition + sectionHeight);

  const qrSize = 32;
  const qrX = 5 + col1Width / 2 - qrSize / 2;
  doc.addImage(qrCodeDataUrl, 'PNG', qrX, yPosition + 3, qrSize, qrSize);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(regNo, 5 + col1Width / 2, yPosition + 40, { align: 'center' });

  const signatureX = 5 + col1Width + col1Width / 2;
  if (signatureBase64) {
    try {
      doc.addImage(
        signatureBase64,
        getImageFormat(signatureBase64),
        5 + col1Width + 5,
        yPosition + 3,
        col1Width - 10,
        30,
        undefined,
        'FAST'
      );
    } catch (error) {
      console.error('Error adding signature to PDF:', error);
    }
  } else {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('[Signature]', signatureX, yPosition + 18, { align: 'center' });
  }
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Signature', signatureX, yPosition + 40, { align: 'center' });

  const photoX = 5 + col2Width + col1Width / 2;
  if (photoBase64) {
    try {
      const photoW = 28;
      const photoH = 36;
      doc.addImage(
        photoBase64,
        getImageFormat(photoBase64),
        5 + col2Width + col1Width / 2 - photoW / 2,
        yPosition + 3,
        photoW,
        photoH,
        undefined,
        'FAST'
      );
    } catch (error) {
      console.error('Error adding photo to PDF:', error);
    }
  } else {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('[Photo]', photoX, yPosition + 18, { align: 'center' });
  }

  yPosition += sectionHeight;
  doc.line(5, yPosition, pageWidth - 5, yPosition);

  // ===== Competition Details =====
  doc.setFillColor(245, 245, 245);
  doc.rect(5, yPosition, pageWidth - 10, 7, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Competition Details', pageWidth / 2, yPosition + 5, { align: 'center' });

  const competitionRows = data.competition_category.map(cat => [
    COMPETITION_LABELS[cat] || cat,
    COMPETITION_DATES[cat] || 'TBA',
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: competitionRows,
    theme: 'grid',
    margin: { left: 5, right: 5 },
    styles: { fontSize: 8, cellPadding: 2.2, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0] },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold', fillColor: [245, 245, 245] },
      1: { cellWidth: 'auto' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY;

  // ===== Team Members (if applicable) =====
  if (data.participation_type === 'team' && data.team_members && data.team_members.length > 0) {
    doc.setFillColor(245, 245, 245);
    doc.rect(5, yPosition, pageWidth - 10, 7, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Team Members', pageWidth / 2, yPosition + 5, { align: 'center' });

    const teamRows = data.team_members.map(m => [m.name, m.student_class, m.institute]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Class', 'Institution']],
      body: teamRows,
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
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 0, 0);
  doc.text('SELF DECLARATION (UNDERTAKING)', pageWidth / 2, declTop + 4, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const declarationText =
    'I, _________________________________, resident of _________________________________, do hereby declare ' +
    'that the information provided above is true to the best of my knowledge, and I undertake to abide by all ' +
    'rules and instructions of Mateng EduFest 2026.';
  const declLines = doc.splitTextToSize(declarationText, pageWidth - 20);
  doc.text(declLines, 10, declTop + 11);

  const sigLineY = declTop + 11 + declLines.length * 4.5 + 12;
  doc.setLineWidth(0.3);
  doc.line(pageWidth - 65, sigLineY, pageWidth - 10, sigLineY);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(80, 80, 80);
  doc.text("Candidate's Signature", pageWidth - 37, sigLineY + 4, { align: 'center' });

  // ===== Footer =====
  const footerY = pageHeight - 8;
  doc.setLineWidth(0.3);
  doc.line(5, footerY - 5, pageWidth - 5, footerY - 5);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(
    'This admit card is computer generated and does not require a physical signature. For assistance, contact',
    pageWidth / 2,
    footerY - 1.5,
    { align: 'center' }
  );
  doc.text('Mateng at justmatengservice@gmail.com or call 600 944 9928.', pageWidth / 2, footerY + 2.5, { align: 'center' });

  doc.save(`EduFest_Admit_Card_${data.full_name}_${regNo}.pdf`);
};

// Same image-loading helper as the admit card generator used elsewhere in the project.
async function loadImageAsBase64(url: string): Promise<string> {
  const fullUrl = url.startsWith('/') ? window.location.origin + url : url;

  try {
    const response = await fetch(fullUrl, { mode: 'cors', cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (result) resolve(result);
        else reject(new Error('FileReader returned empty result'));
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(blob);
    });
  } catch (fetchError) {
    console.warn('fetch() failed for image, trying img+canvas fallback:', fetchError);
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
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (canvasError) {
        reject(canvasError);
      }
    };

    img.onerror = () => reject(new Error(`Failed to load image: ${fullUrl}`));
    img.src = fullUrl;
  });
}