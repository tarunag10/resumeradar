// Document text extraction using browser APIs
// Uses pdf.js for PDF and mammoth for DOCX parsing

export interface ExtractionResult {
  success: boolean;
  text: string;
  error?: string;
  fileType: string;
}

export interface PdfTextItem {
  str?: string;
  transform?: number[];
}

// Check if a File object is a PDF
export function isPDF(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

// Check if a File object is a DOCX
export function isDOCX(file: File): boolean {
  return (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.docx')
  );
}

/**
 * Rebuild readable lines from positioned PDF text items.
 *
 * pdf.js returns text as positioned fragments. Joining them with spaces loses every line
 * break, which breaks bullet detection, action-verb checks and responsibility extraction.
 * Items are grouped into rows by their vertical position and ordered left to right; a wide
 * horizontal gap inside a row starts a new line so two-column resumes do not merge columns.
 */
export function groupTextItemsIntoLines(
  items: PdfTextItem[],
  options: { rowTolerance?: number; columnGap?: number } = {}
): string {
  const rowTolerance = options.rowTolerance ?? 2;
  const columnGap = options.columnGap ?? 120;

  const positioned: Array<{ text: string; x: number; y: number }> = [];

  for (const item of items) {
    const text = (item.str || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;

    const transform = item.transform;
    const x = transform && typeof transform[4] === 'number' ? transform[4] : 0;
    const y = transform && typeof transform[5] === 'number' ? transform[5] : 0;

    positioned.push({ text, x, y });
  }

  if (positioned.length === 0) return '';

  const rows: Array<{ y: number; items: Array<{ text: string; x: number }> }> = [];

  for (const entry of positioned) {
    const row = rows.find(candidate => Math.abs(candidate.y - entry.y) <= rowTolerance);
    if (row) {
      row.items.push({ text: entry.text, x: entry.x });
    } else {
      rows.push({ y: entry.y, items: [{ text: entry.text, x: entry.x }] });
    }
  }

  rows.sort((a, b) => b.y - a.y);

  return rows
    .map(row => {
      const sorted = [...row.items].sort((a, b) => a.x - b.x);
      const segments: string[] = [];
      let current: string[] = [];
      let previousX: number | null = null;

      for (const item of sorted) {
        if (previousX !== null && item.x - previousX > columnGap) {
          segments.push(current.join(' '));
          current = [];
        }
        current.push(item.text);
        previousX = item.x;
      }

      if (current.length > 0) segments.push(current.join(' '));

      return segments.join('\n');
    })
    .filter(line => line.trim().length > 0)
    .join('\n');
}

// Extract text from PDF using pdf.js
export async function extractPDFText(file: File): Promise<ExtractionResult> {
  try {
    // Dynamically import pdf.js to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');

    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pageTexts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = groupTextItemsIntoLines(content.items as PdfTextItem[]);
      if (pageText.trim()) {
        pageTexts.push(pageText);
      }
    }

    const text = pageTexts.join('\n\n').trim();

    if (!text) {
      return {
        success: false,
        text: '',
        error: 'No selectable text was found in this PDF. It may be a scan or an image; paste the text instead.',
        fileType: 'PDF',
      };
    }

    return {
      success: true,
      text,
      fileType: 'PDF',
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      error: error instanceof Error ? error.message : 'Failed to extract PDF text',
      fileType: 'PDF',
    };
  }
}

// Extract text from DOCX using mammoth
export async function extractDOCXText(file: File): Promise<ExtractionResult> {
  try {
    const mammoth = await import('mammoth');

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value.trim();

    if (!text) {
      return {
        success: false,
        text: '',
        error: 'This DOCX file does not contain readable text. Paste the text instead.',
        fileType: 'DOCX',
      };
    }

    return {
      success: true,
      text,
      fileType: 'DOCX',
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      error: error instanceof Error ? error.message : 'Failed to extract DOCX text',
      fileType: 'DOCX',
    };
  }
}

// Auto-detect file type and extract text
export async function extractTextFromFile(file: File): Promise<ExtractionResult> {
  if (isPDF(file)) {
    return extractPDFText(file);
  } else if (isDOCX(file)) {
    return extractDOCXText(file);
  } else {
    return {
      success: false,
      text: '',
      error: 'Unsupported file type. Please use PDF or DOCX files.',
      fileType: 'Unknown',
    };
  }
}

// Get supported file types
export function getSupportedTypes(): { extensions: string[]; mimeTypes: string[] } {
  return {
    extensions: ['.pdf', '.docx'],
    mimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  };
}
