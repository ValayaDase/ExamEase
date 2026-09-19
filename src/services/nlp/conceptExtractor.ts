import { NLPConcept } from '@/types';
import { lemmatizeWord } from './stemmerLemmatizer';
import { tagTokens, extractNounPhrases } from './posTagger';
import { tokenize } from './tokenizer';

// Regular expressions for academic definition pattern matching
const DEFINITION_PATTERNS = [
  /\b([A-Z][A-Za-z0-9\s-]{2,40})\s+(?:is|are)\s+(?:defined\s+as|a|an|the|described\s+as|known\s+as|referred\s+to\s+as)\b/i,
  /\b([A-Z][A-Za-z0-9\s-]{2,40})\s+(?:refers\s+to|denotes|represents|means|signifies)\b/i,
  /\b([A-Z][A-Za-z0-9\s-]{2,40})\s*:\s*([^.\n]+)/i,
  /\b(?:Definition|Concept)\s*:\s*([A-Z][A-Za-z0-9\s-]{2,40})\b/i,
];

export function extractConceptsAndDefinitions(sentences: string[]): {
  concepts: NLPConcept[];
  definitionSentences: string[];
} {
  const conceptMap: Map<string, {
    concept: string;
    normalized: string;
    frequency: number;
    supportingSentences: Set<string>;
    definitionBonus: number;
    posBonus: number;
    headingBonus: number;
  }> = new Map();

  const definitionSentences: string[] = [];

  // Step 1: Scan sentences for Definition Patterns & Headings
  sentences.forEach((sentence) => {
    let isDefinition = false;

    for (const pattern of DEFINITION_PATTERNS) {
      const match = pattern.exec(sentence);
      if (match && match[1]) {
        const rawConcept = match[1].trim();
        if (rawConcept.length >= 3 && rawConcept.length <= 50 && !/^(It|This|That|These|Those|They|We|You|There|Here)$/i.test(rawConcept)) {
          isDefinition = true;
          const norm = rawConcept.toLowerCase().split(' ').map(w => lemmatizeWord(w)).join(' ');

          const existing = conceptMap.get(norm) || {
            concept: rawConcept,
            normalized: norm,
            frequency: 0,
            supportingSentences: new Set(),
            definitionBonus: 0,
            posBonus: 2.0,
            headingBonus: 0,
          };

          existing.frequency += 1;
          existing.definitionBonus += 4.5; // High signal for definition patterns
          existing.supportingSentences.add(sentence);
          conceptMap.set(norm, existing);
        }
      }
    }

    if (isDefinition) {
      definitionSentences.push(sentence);
    }

    // Step 2: Extract Noun Phrases using POS Tagger
    const tokens = tokenize(sentence);
    const tagged = tagTokens(tokens);
    const nounPhrases = extractNounPhrases(tagged);

    nounPhrases.forEach((np) => {
      const raw = np.phrase.trim();
      // Skip single weak words or general stopwords
      if (raw.length < 3 || /^(the|a|an|this|that|these|those|some|many|each|every|which|what)$/i.test(raw)) return;

      const norm = raw.toLowerCase().split(' ').map(w => lemmatizeWord(w)).join(' ');

      const existing = conceptMap.get(norm) || {
        concept: raw,
        normalized: norm,
        frequency: 0,
        supportingSentences: new Set(),
        definitionBonus: 0,
        posBonus: 1.5,
        headingBonus: 0,
      };

      existing.frequency += 1;
      if (existing.supportingSentences.size < 4) {
        existing.supportingSentences.add(sentence);
      }
      conceptMap.set(norm, existing);
    });
  });

  // Step 3: Compute final Importance Score
  const conceptsList: NLPConcept[] = Array.from(conceptMap.values())
    .map((item) => {
      // Score formula combining term frequency, POS signal, definition presence, and sentence context length
      const rawScore = (item.frequency * 1.2) + item.definitionBonus + item.posBonus + (item.supportingSentences.size * 0.8);
      // Normalized score between 1.0 and 10.0
      const importanceScore = Math.min(10.0, Math.round(rawScore * 10) / 10);

      return {
        concept: item.concept,
        importanceScore,
        supportingSentences: Array.from(item.supportingSentences),
        frequency: item.frequency,
      };
    })
    .filter((c) => c.supportingSentences.length > 0 && c.concept.length > 2)
    .sort((a, b) => b.importanceScore - a.importanceScore)
    .slice(0, 25); // Top 25 concepts

  return {
    concepts: conceptsList,
    definitionSentences,
  };
}
