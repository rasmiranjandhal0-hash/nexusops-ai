/**
 * NexusOps AI - Enterprise File Upload & Dataset Processing Pipeline
 * 
 * Ingests, parses, cleans, and audits structured datasets (CSV, JSON, TXT).
 * Flags sensitive data exposure without silently discarding invalid records.
 */

// Helper to inspect row text for sensitive PII
function inspectRowPrivacy(rowObj) {
  const leaks = [];
  const text = Object.values(rowObj).join(' ');

  // 1. Aadhaar
  if (/\b[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}\b/.test(text)) {
    leaks.push({ type: 'Aadhaar ID', severity: 'CRITICAL', description: '12-digit Indian national identity number in plaintext' });
  }

  // 2. PAN Card
  if (/\b[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}\b/.test(text)) {
    leaks.push({ type: 'PAN Tax ID', severity: 'HIGH', description: 'Indian tax identity number exposed' });
  }

  // 3. Payment Card
  if (/\b(?:\d{4}[ -]?){3}\d{4}\b/.test(text)) {
    leaks.push({ type: 'PCI Payment Card', severity: 'CRITICAL', description: 'Debit or credit card sequence exposed' });
  }

  // 4. Exposed Private Keys or Passwords
  if (/(?:api[_-]?key|secret|password|bearer|token)\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{8,}['"]?/i.test(text)) {
    leaks.push({ type: 'Exposed Secret/Credential', severity: 'CRITICAL', description: 'API key, secret, or password string exposed' });
  }

  return leaks;
}

// Inferred data type helper
function inferType(val) {
  if (val === null || val === undefined || val === '') return 'null';
  const str = String(val).trim();
  if (!isNaN(Number(str)) && !str.startsWith('0') && str.length < 15) return 'number';
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return 'date';
  if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(str)) return 'email';
  if (/^(true|false)$/i.test(str)) return 'boolean';
  return 'string';
}

export function parseCsvContent(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { columns: [], rows: [] };

  // Parse header
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Basic CSV cell extraction respecting quotes
    const cells = [];
    let insideQuotes = false;
    let currentCell = '';

    for (let charIndex = 0; charIndex < rawLine.length; charIndex++) {
      const char = rawLine[charIndex];
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());

    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h || `column_${idx + 1}`] = cells[idx] || '';
    });
    rows.push(rowObj);
  }

  return { columns: headers, rows };
}

export function processDatasetFile({ filename, mimeType, buffer, textContent }) {
  let content = textContent;
  if (!content && buffer) {
    content = buffer.toString('utf8');
  }

  if (!content || content.trim().length === 0) {
    throw new Error('File payload is empty.');
  }

  let parsedColumns = [];
  let parsedRows = [];

  const lowerName = (filename || '').toLowerCase();

  if (lowerName.endsWith('.json') || mimeType === 'application/json') {
    try {
      const json = JSON.parse(content);
      if (Array.isArray(json)) {
        parsedRows = json;
        parsedColumns = Object.keys(json[0] || {});
      } else if (typeof json === 'object') {
        parsedRows = [json];
        parsedColumns = Object.keys(json);
      }
    } catch {
      throw new Error('Invalid JSON dataset format.');
    }
  } else {
    // Default to CSV / TXT parser
    const res = parseCsvContent(content);
    parsedColumns = res.columns;
    parsedRows = res.rows;
  }

  if (parsedRows.length === 0) {
    throw new Error('No structured data rows could be parsed from the file.');
  }

  // Column Analysis & Inferred Data Types
  const columnStats = {};
  parsedColumns.forEach((col) => {
    columnStats[col] = {
      name: col,
      nullCount: 0,
      types: {},
    };
  });

  const rowHashes = new Set();
  let duplicateCount = 0;
  const processedRecords = [];
  const validationErrors = [];
  let criticalLeaksCount = 0;
  let highLeaksCount = 0;

  parsedRows.forEach((row, idx) => {
    const rowString = JSON.stringify(row);
    const isDuplicate = rowHashes.has(rowString);
    if (isDuplicate) {
      duplicateCount++;
    } else {
      rowHashes.add(rowString);
    }

    const rowIssues = [];
    if (isDuplicate) {
      rowIssues.push('Duplicate row content identified.');
    }

    // Inspect columns for nulls and types
    let hasNull = false;
    parsedColumns.forEach((col) => {
      const val = row[col];
      if (val === null || val === undefined || val === '') {
        columnStats[col].nullCount++;
        hasNull = true;
      } else {
        const t = inferType(val);
        columnStats[col].types[t] = (columnStats[col].types[t] || 0) + 1;
      }
    });

    if (hasNull) {
      rowIssues.push('One or more columns contain missing/null values.');
    }

    // Inspect privacy and sensitive data exposure
    const leaks = inspectRowPrivacy(row);
    if (leaks.length > 0) {
      leaks.forEach((leak) => {
        rowIssues.push(`[${leak.severity}] ${leak.type}: ${leak.description}`);
        if (leak.severity === 'CRITICAL') criticalLeaksCount++;
        else highLeaksCount++;
      });
    }

    const isValid = rowIssues.length === 0;

    const processedRow = {
      rowIndex: idx + 1,
      data: row,
      isValid,
      isDuplicate,
      leaks,
      issues: rowIssues,
      status: leaks.some((l) => l.severity === 'CRITICAL')
        ? 'QUARANTINED'
        : leaks.length > 0
        ? 'FLAGGED'
        : isDuplicate
        ? 'DUPLICATE'
        : hasNull
        ? 'INCOMPLETE'
        : 'VALID',
    };

    processedRecords.push(processedRow);

    if (!isValid) {
      validationErrors.push({
        rowIndex: idx + 1,
        issues: rowIssues,
        preview: Object.entries(row).slice(0, 3).map(([k, v]) => `${k}=${v}`).join(', '),
      });
    }
  });

  // Calculate Dataset Quality & Security Score (0 - 100)
  const totalRows = processedRows.length;
  const validRows = processedRecords.filter((r) => r.isValid).length;
  const validityRatio = validRows / totalRows;

  let scoreDeductions = (duplicateCount / totalRows) * 15 + (criticalLeaksCount * 25) + (highLeaksCount * 10);
  const dataQualityScore = Math.max(0, Math.min(100, Math.round(validityRatio * 100 - scoreDeductions)));

  let riskLevel = 'LOW';
  if (criticalLeaksCount > 0 || dataQualityScore < 40) riskLevel = 'CRITICAL';
  else if (highLeaksCount > 0 || dataQualityScore < 70) riskLevel = 'HIGH';
  else if (dataQualityScore < 85) riskLevel = 'MODERATE';

  return {
    datasetMetadata: {
      id: `SET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      filename,
      fileSize: buffer ? buffer.length : content.length,
      rowCount: totalRows,
      columnCount: parsedColumns.length,
      columns: parsedColumns,
      validRowCount: validRows,
      invalidRowCount: totalRows - validRows,
      duplicateCount,
      criticalLeaksCount,
      highLeaksCount,
      dataQualityScore,
      riskLevel,
      createdAt: new Date().toISOString(),
    },
    columnStats,
    processedRecords,
    validationErrors,
  };
}
