import { tokenize, filterStopWords } from './tokenizer';
import { lemmatizeWord } from './stemmerLemmatizer';
import { Question } from '@/types';

/**
 * Normalizes question text into lemmatized token set
 */
export function normalizeQuestion(text: string): Set<string> {
  const tokens = tokenize(text);
  const nonStop = filterStopWords(tokens);
  const lemmatized = nonStop.map((t) => lemmatizeWord(t.text));
  return new Set(lemmatized);
}

/**
 * Compute Jaccard token similarity ratio between two normalized sets
 */
export function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  setA.forEach((token) => {
    if (setB.has(token)) {
      intersectionCount++;
    }
  });

  const unionSize = new Set([...Array.from(setA), ...Array.from(setB)]).size;
  return unionSize === 0 ? 0 : intersectionCount / unionSize;
}

/**
 * Filter duplicate or near-duplicate questions using lexical similarity threshold (0.65)
 */
export function removeDuplicateQuestions(questions: Partial<Question>[]): Partial<Question>[] {
  const uniqueQuestions: Partial<Question>[] = [];
  const normalizedSets: Set<string>[] = [];

  for (const q of questions) {
    if (!q.question) continue;

    const normSet = normalizeQuestion(q.question);
    let isDuplicate = false;

    for (const existingSet of normalizedSets) {
      const similarity = calculateJaccardSimilarity(normSet, existingSet);
      // High lexical similarity indicating duplicate question context
      if (similarity >= 0.65) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      uniqueQuestions.push(q);
      normalizedSets.push(normSet);
    }
  }

  return uniqueQuestions;
}
