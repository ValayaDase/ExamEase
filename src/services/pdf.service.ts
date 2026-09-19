// src/services/pdf.service.ts

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    // Dynamic runtime require to prevent top-level static evaluation issues during build
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(pdfBuffer);
    const extractedText = data?.text || '';

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('The uploaded PDF appears to be empty or contains scanned images without extractable text.');
    }

    return extractedText;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('scanned images')) {
      throw error;
    }
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF document. Please ensure the file is a valid readable PDF file.');
  }
}
