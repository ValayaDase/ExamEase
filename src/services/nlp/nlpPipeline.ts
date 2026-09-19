import { NLPAnalysisResult } from '@/types';
import { tokenize } from './tokenizer';
import { segmentSentences } from './sentenceSegmenter';
import { extractNGrams } from './ngrams';
import { extractConceptsAndDefinitions } from './conceptExtractor';

export function processDocumentText(rawText: string): NLPAnalysisResult {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('No readable text content provided for NLP processing.');
  }

  // Stage 1: Text Cleaning (normalize whitespace, control characters, special breaks)
  const cleanedText = rawText
    .replace(/[\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanedText.length < 50) {
    throw new Error('Not enough readable content was found in this PDF to generate reliable questions.');
  }

  // Stage 2: Sentence Segmentation
  const sentences = segmentSentences(cleanedText);

  // Stage 3: Tokenization & Word Statistics
  const tokens = tokenize(cleanedText);
  const tokenCount = tokens.length;
  const uniqueTokenCount = new Set(tokens.map((t) => t.text)).size;

  // Stage 4: N-gram Extraction (Unigrams, Bigrams, Trigrams)
  const ngrams = extractNGrams(tokens);

  // Stage 5: POS Analysis & Concept / Definition Extraction
  const { concepts, definitionSentences } = extractConceptsAndDefinitions(sentences);

  return {
    rawText,
    cleanedText,
    sentenceCount: sentences.length,
    tokenCount,
    uniqueTokenCount,
    sentences,
    ngrams,
    concepts,
    definitionSentences,
  };
}
