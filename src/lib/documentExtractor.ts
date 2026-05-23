// Document text extraction using browser APIs
// Uses pdf.js for PDF and mammorth for DOCX parsing

export interface ExtractionResult {
  success: boolean;
  text: string;
  error?: string;
  fileType: string;
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

// Extract text from PDF using pdf.js
export async function extractPDFText(file: File): Promise<ExtractionResult> {
  try {
    // Dynamically import pdf.js to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const textParts: string[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: unknown) => (
          typeof item === 'object' && item !== null && 'str' in item
            ? String(item.str)
            : ''
        ))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      textParts.push(pageText);
    }
    
    return {
      success: true,
      text: textParts.join('\n\n'),
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
    
    return {
      success: true,
      text: result.value,
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
