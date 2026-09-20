// src/services/pdf.service.ts

import { GoogleGenAI } from '@google/genai';

/**
 * Universal PDF Text Extraction using Gemini Vision OCR.
 * Handles standard text PDFs, scanned images, handwritten notes,
 * and custom font encodings (Identity-H / CID) seamlessly without 3rd party parser issues.
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is missing. Please add your GEMINI_API_KEY in the .env.local file to process PDF files.'
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBuffer.toString('base64'),
          },
        },
        'Extract and return all the readable text from this PDF document clearly. Retain headings, paragraphs, bullet points, and structure. Do not output any markdown code blocks, metadata headers, or commentary.',
      ],
    });

    const extractedText = (response.text || '').trim();

    if (!extractedText || extractedText.length < 20) {
      throw new Error('No readable text content could be found in this PDF file.');
    }

    return extractedText;
  } catch (error: unknown) {
    console.error('PDF text extraction error:', error);
    const message = error instanceof Error ? error.message : 'Failed to extract text from PDF.';
    throw new Error(message);
  }
}


