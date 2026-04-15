import * as XLSX from 'xlsx';
import { INSURANCE_COLUMNS as EXPORT_COLUMNS } from '../../shared/insuranceColumns.js';

function parseDateValue(value) {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value;
  }

  const stringValue = String(value).trim();

  const isoMatch = stringValue.match(/^(\d{4})[-/.](\d{2})[-/.](\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const dmyMatch = stringValue.match(/^(\d{2})[-/.](\d{2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsedDate = new Date(stringValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
}

function parseNumberValue(value) {
  if (value === '' || value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return value;
  }

  const normalizedValue = String(value).replace(/,/g, '').replace(/%/g, '').trim();
  const parsedNumber = Number(normalizedValue);

  return Number.isFinite(parsedNumber) ? parsedNumber : value;
}

function formatCellValue(column, policy, index) {
  if (column.type === 'serial') {
    return index + 1;
  }

  const rawValue = policy[column.key];

  if (column.type === 'date') {
    return parseDateValue(rawValue);
  }

  if (column.type === 'number') {
    return parseNumberValue(rawValue);
  }

  return rawValue || '';
}

function buildRows(policies) {
  return policies.map((policy, index) => {
    const row = {};

    for (const column of EXPORT_COLUMNS) {
      row[column.header] = formatCellValue(column, policy, index);
    }

    return row;
  });
}

export function downloadInsuranceExcel(
  policies,
  fileName,
  {
    sheetName = 'Sheet1',
  } = {}
) {
  const rows = buildRows(policies);
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    cellDates: true,
    dateNF: 'dd-mmm-yyyy',
  });

  worksheet['!cols'] = EXPORT_COLUMNS.map(column => ({ wch: column.width }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
}
