import ExcelJS from "exceljs";

export type Sheet = { name: string; headers: string[]; rows: Record<string, string>[] };

// Первая строка листа — заголовки, остальные — записи. Пустые строки пропускаются.
export async function readWorkbook(buffer: Buffer): Promise<Sheet[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

  return workbook.worksheets.map((ws) => {
    const headers: string[] = [];
    ws.getRow(1).eachCell({ includeEmpty: true }, (cell, col) => {
      headers[col - 1] = cell.text.trim();
    });

    const rows: Record<string, string>[] = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const record: Record<string, string> = {};
      let filled = false;
      headers.forEach((header, i) => {
        if (!header) return;
        const value = row.getCell(i + 1).text.trim();
        if (value) filled = true;
        record[header] = value;
      });
      if (filled) rows.push(record);
    });
    return { name: ws.name, headers: headers.filter(Boolean), rows };
  });
}
