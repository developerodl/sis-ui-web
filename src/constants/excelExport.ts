import * as XLSX from 'xlsx';

export interface ExcelColumn<T> {
  header: string;              // Column name in Excel
  key: keyof T | string;       // Data key from row object
  render?: (row: T, index: number) => any; // Optional formatter
}

export function exportToExcel<T>(
  data: T[],
  columns: ExcelColumn<T>[],
  fileName: string,
  sheetName: string = 'Sheet1'
) {
  if (!data || !data.length) return;

  // Prepare rows for Excel
  const formattedData = data.map((row, index) => {
    const obj: Record<string, any> = {};
    columns.forEach((col) => {
      if (col.render) {
        obj[col.header] = col.render(row, index);
      } else if (col.key === 'sno') {
        obj[col.header] = index + 1; // special S.No case
      } else {
        obj[col.header] = (row as any)[col.key] ?? '';
      }
    });
    return obj;
  });

  // Generate sheet & workbook
  // const worksheet = XLSX.utils.json_to_sheet(formattedData);
  // const workbook = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // // Download Excel file
  // XLSX.writeFile(workbook, `${fileName}.xlsx`);
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Auto-size columns based on header length and longest cell content
  worksheet['!cols'] = columns.map((col) => {
    const headerLength = col.header.length;
    const maxContentLength = formattedData.reduce((max, row) => {
      const cellValue = row[col.header];
      const cellLength = cellValue !== null && cellValue !== undefined ? String(cellValue).length : 0;
      return Math.max(max, cellLength);
    }, 0);
    const width = Math.max(headerLength, maxContentLength) + 4;   // +4 padding
    return { wch: Math.min(width, 40) };                          // cap at 40 chars wide
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  // Download Excel file
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
