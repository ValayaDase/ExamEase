import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { extractTextFromPDF } from '@/services/pdf.service';
import { processDocumentText } from '@/services/nlp/nlpPipeline';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file was uploaded.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Invalid file format. Please upload a PDF file.' }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 1: Extract PDF text
    const rawText = await extractTextFromPDF(buffer);

    // Step 2: Run modular Classical NLP pipeline
    const nlpResult = processDocumentText(rawText);

    return NextResponse.json({
      message: 'PDF text extracted and NLP pipeline processing completed successfully.',
      fileName: file.name,
      fileSize: file.size,
      nlpResult,
    });
  } catch (error: unknown) {
    console.error('PDF upload & NLP processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during PDF processing.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
