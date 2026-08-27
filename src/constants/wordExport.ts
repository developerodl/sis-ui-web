import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType } from "docx";
import { saveAs } from "file-saver";

interface WordExportMeta {
  programName: string;
  batch: string;
  semester: string;
  course: string;
  markType: string;
  admissionYear?: string;
}

interface WordExportRow {
  sno: number;
  reg_no: string | null;
  name: string;
  attendance_percentage: string | number | null;
  final_marks: string | number | null;
  pass_status: string;
  admission_year: string | null;
  batch: string | null;
}

export async function exportToWord(meta: WordExportMeta, rows: WordExportRow[], fileName: string) {
  const headerCell = (text: string) =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
    });

  const dataCell = (text: string) =>
    new TableCell({
      children: [new Paragraph(text)],
    });

  const tableHeader = new TableRow({
    children: [
      headerCell("S.No"),
      headerCell("Register No"),
      headerCell("Student Name"),
      headerCell("Attendance %"),
      headerCell("Marks"),
      headerCell("Pass / Fail"),
      headerCell("Academic Year"),
    //   headerCell("Batch"),
    ],
  });

  const tableRows = rows.map(
    (r) =>
      new TableRow({
        children: [
          dataCell(String(r.sno)),
          dataCell(r.reg_no || "-"),
          dataCell(r.name || "-"),
          dataCell(String(r.attendance_percentage ?? "-")),
          dataCell(String(r.final_marks ?? "-")),
          dataCell((r.pass_status || "-").toUpperCase()),
          dataCell(r.admission_year || "-"),
        //   dataCell(r.batch || "-"),
        ],
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: "Student Mark Entry Report", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: `Program: ${meta.programName}` }),
          new Paragraph({ text: `Batch: ${meta.batch}` }),
          new Paragraph({ text: `Semester: ${meta.semester}` }),
          new Paragraph({ text: `Course: ${meta.course}` }),
          new Paragraph({ text: `Mark Type: ${meta.markType}` }),
          new Paragraph({ text: `Academic Year: ${meta.admissionYear || "-"}` }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [tableHeader, ...tableRows],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
}