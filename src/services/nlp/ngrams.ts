import { Token } from './tokenizer';

export interface NGramFrequency {
  phrase: string;
  count: number;
}

export function extractNGrams(tokens: Token[]) {
  const unigramMap: Record<string, number> = {};
  const bigramMap: Record<string, number> = {};
  const trigramMap: Record<string, number> = {};

  // 1. Unigrams (non-stopwords only)
  tokens.forEach((t) => {
    if (!t.isStopWord && t.text.length > 2) {
      unigramMap[t.text] = (unigramMap[t.text] || 0) + 1;
    }
  });

  // 2. Bigrams
  for (let i = 0; i < tokens.length - 1; i++) {
    const t1 = tokens[i];
    const t2 = tokens[i + 1];

    // At least one token should be non-stopword, both non-empty
    if ((!t1.isStopWord || !t2.isStopWord) && t1.text.length > 2 && t2.text.length > 2) {
      const bigramStr = `${t1.text} ${t2.text}`;
      bigramMap[bigramStr] = (bigramMap[bigramStr] || 0) + 1;
    }
  }

  // 3. Trigrams
  for (let i = 0; i < tokens.length - 2; i++) {
    const t1 = tokens[i];
    const t2 = tokens[i + 1];
    const t3 = tokens[i + 2];

    if ((!t1.isStopWord || !t3.isStopWord) && t1.text.length > 2 && t3.text.length > 2) {
      const trigramStr = `${t1.text} ${t2.text} ${t3.text}`;
      trigramMap[trigramStr] = (trigramMap[trigramStr] || 0) + 1;
    }
  }

  const sortMap = (map: Record<string, number>, minCount = 1): NGramFrequency[] => {
    return Object.entries(map)
      .map(([phrase, count]) => ({ phrase, count }))
      .filter((item) => item.count >= minCount)
      .sort((a, b) => b.count - a.count);
  };

  return {
    unigrams: sortMap(unigramMap).slice(0, 30).map(u => ({ word: u.phrase, count: u.count })),
    bigrams: sortMap(bigramMap).slice(0, 25),
    trigrams: sortMap(trigramMap).slice(0, 20),
  };
}
