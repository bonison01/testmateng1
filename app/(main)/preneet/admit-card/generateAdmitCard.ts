// generateAdmitCard.ts
'use client';

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from 'qrcode';

interface Document {
    document_type: string;
    s3_url: string;
}

interface CandidateData {
    id: number;
    candidate_name: string;
    father_name: string;
    mother_name?: string;
    dob: string;
    age?: number;
    gender: string;
    nationality?: string;
    category: string;
    address: string;
    city?: string;
    state: string;
    pin_code?: string;
    mobile?: string;
    email?: string;
    documents?: Document[];
}

export const generateAdmitCardPDF = async (data: CandidateData) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 10;

    // Prepare candidate data
    const candidateData = {
        rollNumber: data.id,
        applicationNumber: data.id,
        candidateName: data.candidate_name,
        fatherName: data.father_name,
        gender: data.gender,
        dob: data.dob,
        category: data.category,
        stateOfEligibility: data.state,
        pwd: "NO",
        scribeRequired: "N/A",
        disabilityType: "N/A",
        questionPaperMedium: "ENGLISH",
        examDate: "To Be Announced",
        reportingTime: "—",
        gateClosingTime: "—",
        testTiming: "—",
        testCentreNo: "—",
        testCentreName: "—",
        testCentreAddress: data.address,
    };

    const registrationNo = `BF-${String(candidateData.rollNumber).padStart(6, "0")}`;

    // Find photo and signature from documents
    const photoUrl = data.documents?.find(d => d.document_type === "passport_photo")?.s3_url;
    const signatureUrl = data.documents?.find(d => d.document_type === "candidate_signature")?.s3_url;

    // Load images as base64
    let photoBase64: string | null = null;
    let signatureBase64: string | null = null;
    let logoBase64: string | null = null;

    // Load logo from public folder
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

    // Add border around entire document
    doc.setLineWidth(0.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

    // ===== HEADER SECTION =====

    // Draw vertical line for header columns (2 columns: 2/3 for title, 1/3 for logo)
    const headerDivider = pageWidth - 60;
    doc.line(headerDivider, 5, headerDivider, 30);

    // Left/Center Column - Main Title (2/3 width)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("PRE - NEET COMPETITION", (headerDivider + 5) / 2, 17, { align: "center" });
    doc.setFontSize(11);
    doc.text("NEET (UG) - 2026", (headerDivider + 5) / 2, 23, { align: "center" });

    // Right Column - Powered By with Logo (1/3 width)
    doc.setFontSize(7);
    doc.setTextColor(30, 144, 255); // Blue color
    doc.text("POWERED BY", (headerDivider + pageWidth - 5) / 2, 11, { align: "center" });

    // Add logo image
    if (logoBase64) {
        try {
            const logoWidth = 40; // Adjust width as needed
            const logoHeight = 16; // Adjust height as needed
            const logoX = (headerDivider + pageWidth - 5) / 2 - (logoWidth / 2);
            const logoY = 13;

            doc.addImage(
                logoBase64,
                'PNG',
                logoX,
                logoY,
                logoWidth,
                logoHeight,
                undefined,
                'FAST'
            );
        } catch (error) {
            console.error('Error adding logo to PDF:', error);
            // Fallback to text if logo fails
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text("MATENG EDUFEST", (headerDivider + pageWidth - 5) / 2, 20, { align: "center" });
        }
    } else {
        // Fallback to text if logo not loaded
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("MATENG EDUFEST", (headerDivider + pageWidth - 5) / 2, 20, { align: "center" });
    }

    // Horizontal line after header
    doc.setLineWidth(0.5);
    doc.line(5, 30, pageWidth - 5, 30);

    yPosition = 30;

    // ===== CANDIDATE INFORMATION SECTION =====

    const candidateInfo = [
        // Left side
        [
            ['Roll Number:', candidateData.rollNumber.toString()],
            ['Candidate\'s Name:', candidateData.candidateName],
            ['Gender:', candidateData.gender],
            ['Category:', candidateData.category],
            ['Person with Disability (PwD)*:', candidateData.pwd],
            ['Type of Disability:', candidateData.disabilityType]
        ],
        // Right side
        [
            ['Application Number:', registrationNo],
            ['Father\'s Name:', candidateData.fatherName],
            ['Date of Birth:', candidateData.dob],
            ['State of Eligibility:', candidateData.stateOfEligibility],
            ['Scribe required*:', candidateData.scribeRequired],
            ['', '']
        ]
    ];

    const halfWidth = pageWidth / 2;

    // Left Column
    autoTable(doc, {
        startY: yPosition,
        body: candidateInfo[0],
        theme: 'grid',
        tableWidth: halfWidth,
        margin: { left: 5 }, // keep left padding if needed
        styles: {
            fontSize: 8,
            cellPadding: 2,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
        },
        columnStyles: {
            0: { cellWidth: 45, fontStyle: 'bold', fillColor: [245, 245, 245] },
            1: { cellWidth: 55 },
        }
    });

    // Right Column
    autoTable(doc, {
        startY: yPosition,
        body: candidateInfo[1],
        theme: 'grid',
        tableWidth: halfWidth,
        margin: { left: halfWidth }, // exactly next to left table
        styles: {
            fontSize: 8,
            cellPadding: 2,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
        },
        columnStyles: {
            0: { cellWidth: 45, fontStyle: 'bold', fillColor: [245, 245, 245] },
            1: { cellWidth: 55 },
        }
    });

    yPosition = (doc as any).lastAutoTable.finalY;

    // ===== QR CODE, SIGNATURE AND PHOTO SECTION (3 columns) =====

    // Generate QR Code
    const qrData = `Roll No: ${candidateData.rollNumber}, Name: ${candidateData.candidateName}, Application: ${registrationNo}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 1,
        errorCorrectionLevel: 'H'
    });

    // Calculate column widths
    const sectionWidth = pageWidth - 10; // Total width minus margins
    const col1Width = sectionWidth / 3;
    const col2Width = (sectionWidth / 3) * 2;

    const sectionHeight = 50;

    // Draw horizontal line at top of section
    doc.setLineWidth(0.5);
    doc.line(5, yPosition, pageWidth - 5, yPosition);

    // Draw vertical line separators for 3 columns
    doc.line(5 + col1Width, yPosition, 5 + col1Width, yPosition + sectionHeight);
    doc.line(5 + col2Width, yPosition, 5 + col2Width, yPosition + sectionHeight);

    // Column 1: QR Code
    const qrSize = 35;
    const qrX = 5 + (col1Width / 2) - (qrSize / 2);
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, yPosition + 3, qrSize, qrSize);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(registrationNo, 5 + (col1Width / 2), yPosition + 43, { align: "center" });

    // Column 2: Signature
    const signatureX = 5 + col1Width + (col1Width / 2);

    if (signatureBase64) {
        try {
            // Signature dimensions
            const signatureMaxWidth = col1Width - 10;
            const signatureMaxHeight = 35;

            // Add signature image
            doc.addImage(
                signatureBase64,
                'PNG',
                5 + col1Width + 5,
                yPosition + 3,
                signatureMaxWidth,
                signatureMaxHeight,
                undefined,
                'FAST'
            );
        } catch (error) {
            console.error('Error adding signature to PDF:', error);
            // Fallback: show placeholder text
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("Signature", signatureX, yPosition + 20, { align: "center" });
        }
    } else {
        // No signature available - show placeholder
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("[Signature]", signatureX, yPosition + 20, { align: "center" });
    }

    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("Signature", signatureX, yPosition + 45, { align: "center" });

    // Column 3: Photo
    const photoX = 5 + col2Width + (col1Width / 2);

    if (photoBase64) {
        try {
            // Photo dimensions - maintain aspect ratio
            const photoMaxWidth = 30;
            const photoMaxHeight = 40;

            const photoXPos = 5 + col2Width + (col1Width / 2) - (photoMaxWidth / 2);

            // Add photo image
            doc.addImage(
                photoBase64,
                'PNG',
                photoXPos,
                yPosition + 3,
                photoMaxWidth,
                photoMaxHeight,
                undefined,
                'FAST'
            );
        } catch (error) {
            console.error('Error adding photo to PDF:', error);
            // Fallback: show placeholder text
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("Photo", photoX, yPosition + 20, { align: "center" });
        }
    } else {
        // No photo available - show placeholder
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("[Photo]", photoX, yPosition + 20, { align: "center" });
    }

    // Draw horizontal line at bottom of section
    yPosition += sectionHeight;
    doc.line(5, yPosition, pageWidth - 5, yPosition);

    // yPosition += 5;

    // ===== TEST DETAILS SECTION =====

    doc.setFillColor(245, 245, 245);
    doc.rect(5, yPosition, pageWidth - 10, 7, 'F');
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Test Details", pageWidth / 2, yPosition + 5, { align: "center" });

    // yPosition += 7;

    const testDetails = [
        ['Question Paper Medium', candidateData.questionPaperMedium],
        ['Date of Examination', candidateData.examDate],
        ['Reporting/Entry Time at Centre', candidateData.reportingTime],
        ['Gate Closing Time of Centre', candidateData.gateClosingTime],
        ['Timing of Test', candidateData.testTiming],
        ['Test Centre No', candidateData.testCentreNo],
        ['Test Centre Name', candidateData.testCentreName],
        ['Test Centre Address (Venue of Test)', candidateData.testCentreAddress]
    ];

    autoTable(doc, {
        startY: yPosition,
        head: [],
        body: testDetails,
        theme: 'grid',
        margin: { left: 5, right: 5 },
        styles: {
            fontSize: 8,
            cellPadding: 2,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            textColor: [0, 0, 0],
        },
        columnStyles: {
            0: { cellWidth: 80, fontStyle: 'bold', fillColor: [245, 245, 245], textColor: [0, 0, 0] },
            1: { cellWidth: 'auto', fillColor: [255, 255, 255], textColor: [50, 50, 50] }
        }
    });

    yPosition = (doc as any).lastAutoTable.finalY;

    // ===== SIGNATURE FOOTER =====

    doc.setLineWidth(0.5);
    doc.line(5, yPosition, pageWidth - 5, yPosition);

    // Add space for signature (16mm)
    yPosition += 20;

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Invigilator Signature", pageWidth / 2, yPosition, { align: "center" });

    yPosition += 8;

    // ===== SELF DECLARATION =====

    doc.setLineWidth(0.5);
    doc.line(5, yPosition, pageWidth - 5, yPosition);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 0, 0);
    doc.text("SELF DECLARATION (UNDERTAKING)", pageWidth / 2, yPosition + 6, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    const declarationText1 = "I, _________________________________, resident of_________________________________, do hereby, declare the following:";
    doc.text(declarationText1, 10, yPosition + 12, { maxWidth: pageWidth - 20 });

    const declarationText2 = "1. I have read the Instructions, Guidelines, Information Bulletin, Instructions, and Notices related to this examination available on the website";
    doc.text(declarationText2, 10, yPosition + 18, { maxWidth: pageWidth - 20 });

    doc.setTextColor(0, 0, 255);
    doc.textWithLink("https://exams.nta.ac.in/NEET/", 10, yPosition + 24, { url: "https://exams.nta.ac.in/NEET/" });
    doc.text("and", 62, yPosition + 24);
    doc.textWithLink("www.nta.ac.in", 70, yPosition + 24, { url: "http://www.nta.ac.in" });

    doc.setTextColor(0, 0, 0);
    const declarationText3 = '2. I have read the detailed "IMPORTANT INSTRUCTIONS FOR CANDIDATES" as given on Page-3 and I undertake to abide by the same.';
    doc.text(declarationText3, 10, yPosition + 30, { maxWidth: pageWidth - 20 });

    // Download
    doc.save(`NEET_Admit_Card_${candidateData.candidateName}_${registrationNo}.pdf`);
};

// Helper function to load image from URL and convert to base64
async function loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Enable CORS

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                // Draw image on canvas
                ctx.drawImage(img, 0, 0);

                // Convert to base64
                const dataUrl = canvas.toDataURL('image/png');
                resolve(dataUrl);
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = (error) => {
            console.error('Failed to load image:', url, error);
            reject(new Error(`Failed to load image: ${url}`));
        };

        // Handle both local and remote URLs
        // For local public images, prepend with window.location.origin if needed
        if (url.startsWith('/')) {
            img.src = window.location.origin + url;
        } else {
            img.src = url;
        }
    });
}