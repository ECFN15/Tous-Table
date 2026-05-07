const CSV_SEPARATOR = ';';

const sanitizeCsvCell = (value) => {
  if (value == null) return '';

  const normalized = String(value).replace(/\r?\n/g, ' ').trim();
  const formulaSafe = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${formulaSafe.replace(/"/g, '""')}"`;
};

export const exportRowsToCsv = (rows, filename) => {
  if (!Array.isArray(rows) || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    `sep=${CSV_SEPARATOR}`,
    headers.map(sanitizeCsvCell).join(CSV_SEPARATOR),
    ...rows.map((row) => headers.map((header) => sanitizeCsvCell(row[header])).join(CSV_SEPARATOR)),
  ].join('\r\n');

  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
