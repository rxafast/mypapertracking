import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AppSettings, ClassRecord, ExaminationPaper, PaperStatus } from '../types';

export class ExportService {
  /**
   * Download Excel report file
   */
  static exportToExcel(
    papers: ExaminationPaper[],
    classes: ClassRecord[],
    settings: AppSettings,
    reportTitle: string = 'Paper_Tracking_Report'
  ) {
    const dataRows = papers.map((paper, index) => {
      const parentClass = classes.find((c) => c.id === paper.classId);
      return {
        'S.No': index + 1,
        Program: paper.programName,
        Semester: `Sem ${paper.semester}`,
        Section: paper.section,
        Session: paper.academicSession,
        Year: paper.academicYear,
        Subject: paper.subjectName,
        'Subject Code': paper.subjectCode,
        'Exam Type': paper.examinationType,
        Status: paper.status,
        'Creation Date': paper.creationDate || 'N/A',
        'Exam Date': paper.examinationDate || 'N/A',
        Students: parentClass?.studentCount || 0,
        Remarks: paper.remarks || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);

    // Auto-fit column widths
    const colWidths = [
      { wch: 5 }, // S.No
      { wch: 25 }, // Program
      { wch: 10 }, // Semester
      { wch: 8 }, // Section
      { wch: 10 }, // Session
      { wch: 8 }, // Year
      { wch: 35 }, // Subject
      { wch: 12 }, // Subject Code
      { wch: 20 }, // Exam Type
      { wch: 12 }, // Status
      { wch: 14 }, // Creation Date
      { wch: 14 }, // Exam Date
      { wch: 10 }, // Students
      { wch: 40 }, // Remarks
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Paper Tracking');

    // Generate filename
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${reportTitle}_${dateStr}.xlsx`;
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Download PDF report file with formal University header
   */
  static exportToPdf(
    papers: ExaminationPaper[],
    classes: ClassRecord[],
    settings: AppSettings,
    title: string = 'University Paper Preparation & Tracking Report'
  ) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Title & Header styling
    doc.setFillColor(15, 23, 42); // Navy slate background banner
    doc.rect(0, 0, 297, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text((settings.portalTitle || "Rizwan's Personal Class Paper Portal").toUpperCase(), 14, 12);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${title} | Session: ${settings.activeSession} ${settings.academicYear}`, 14, 20);

    // Metadata Sub-header
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.text(`Lecturer: ${settings.lecturerName}  |  Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 34);

    // Metrics Summary Bar
    const total = papers.length;
    const created = papers.filter((p) => p.status === 'Created' || p.status === 'Reviewed' || p.status === 'Finalized').length;
    const pending = papers.filter((p) => p.status === 'Pending').length;
    const inProgress = papers.filter((p) => p.status === 'In Progress').length;
    const pct = total > 0 ? Math.round((created / total) * 100) : 0;

    doc.setFillColor(241, 245, 249);
    doc.rect(14, 38, 269, 12, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(
      `Total Required Papers: ${total}   |   Created/Finalized: ${created}   |   In Progress: ${inProgress}   |   Pending: ${pending}   |   Overall Completion: ${pct}%`,
      18,
      45.5
    );

    // Table Data
    const tableRows = papers.map((p, idx) => [
      (idx + 1).toString(),
      p.programName,
      `Sem ${p.semester} (${p.section})`,
      `${p.academicSession} ${p.academicYear}`,
      p.subjectCode ? `${p.subjectName} (${p.subjectCode})` : p.subjectName,
      p.examinationType,
      p.status,
      p.creationDate || '-',
      p.examinationDate || '-',
      p.remarks ? (p.remarks.length > 30 ? p.remarks.slice(0, 27) + '...' : p.remarks) : '-',
    ]);

    autoTable(doc, {
      startY: 53,
      head: [['#', 'Program', 'Sem/Sec', 'Session', 'Subject', 'Exam Type', 'Status', 'Created', 'Exam Date', 'Remarks']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59], // Slate 800
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [15, 23, 42],
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 42 },
        2: { cellWidth: 20 },
        3: { cellWidth: 22 },
        4: { cellWidth: 50 },
        5: { cellWidth: 30 },
        6: { cellWidth: 22 },
        7: { cellWidth: 22 },
        8: { cellWidth: 22 },
        9: { cellWidth: 32 },
      },
      didParseCell: (data) => {
        // Color-code status cell text
        if (data.section === 'body' && data.column.index === 6) {
          const val = String(data.cell.raw) as PaperStatus;
          if (val === 'Pending') {
            data.cell.styles.textColor = [220, 38, 38]; // Red
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'In Progress') {
            data.cell.styles.textColor = [37, 99, 235]; // Blue
          } else if (val === 'Created') {
            data.cell.styles.textColor = [5, 150, 105]; // Emerald
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'Finalized' || val === 'Reviewed') {
            data.cell.styles.textColor = [124, 58, 237]; // Purple
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.pdf`);
  }
}
