import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BASE_URL, ApiRoutes } from './ApiConstants';

export interface PdfColumn<T> {
  header: string;
  key: keyof T | string;
  render?: (row: T, index: number) => any;
}

// Fetches the student photo via our backend proxy (already has CORS headers set)
async function fetchPhotoAsDataUrl(studentId: number | string): Promise<string | null> {
  try {
    const url = `${BASE_URL}${ApiRoutes.PROFILEIMAGEPROXY}/${studentId}`;
    const res = await fetch(url);
    if (!res.ok) return null; // e.g. 404 = no profile image for this student

    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function exportToPdfWithPhotos<T>(
  data: T[],
  columns: PdfColumn<T>[],
  studentIdKey: (row: T) => number | string | null | undefined,
  fileName: string,
  title: string = 'Report'
) {
  if (!data || !data.length) return;

  // Preload all photos in parallel before building the table
  const photoDataUrls: (string | null)[] = await Promise.all(
    data.map(async (row) => {
      const id = studentIdKey(row);
      if (id === null || id === undefined) return null;
      return await fetchPhotoAsDataUrl(id);
    })
  );

  const rows = data.map((row, index) =>
    columns.map((col) => {
      if (col.render) return col.render(row, index) ?? '';
      if (col.key === 'sno') return index + 1;
      return (row as any)[col.key] ?? '';
    })
  );

  const headers = columns.map((col) => col.header);
  const photoColIndex = headers.length;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  doc.setFontSize(14);
  doc.text(title, 40, 30);

  autoTable(doc, {
    head: [[...headers, 'Student Photo']],
    body: rows.map((r) => [...r, '']),
    startY: 55,
    theme: 'grid',
    rowPageBreak: 'avoid',                           // ⬅ full grid borders like the reference image
    styles: {
      fontSize: 10,                         // ⬅ bumped up from 8
      cellPadding: 6,
      overflow: 'linebreak',
      minCellHeight: 60,                    // ⬅ taller rows for photo + readability
      valign: 'middle',
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 11,
      halign: 'center',
      valign: 'middle',
    },
    bodyStyles: {
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 20, right: 20 },
    didDrawCell: (cellData) => {
      if (cellData.section === 'body' && cellData.column.index === photoColIndex) {
        const dataUrl = photoDataUrls[cellData.row.index];
        if (dataUrl) {
          const size = 45;                  // ⬅ slightly bigger photo
          const x = cellData.cell.x + (cellData.cell.width - size) / 2;
          const y = cellData.cell.y + (cellData.cell.height - size) / 2;
          try {
            doc.addImage(dataUrl, 'JPEG', x, y, size, size);
          } catch {
            // skip if embedding fails
          }
        }
      }
    },
  });

  doc.save(`${fileName}.pdf`);
}