import { Token } from './tokenizer';

export type POSTag = 'NNP' | 'NN' | 'NNS' | 'JJ' | 'VB' | 'VBD' | 'VBG' | 'RB' | 'IN' | 'DT' | 'OTHER';

export interface TaggedToken {
  token: Token;
  pos: POSTag;
}

// Known common suffix rules for POS tagging
export function tagToken(token: Token): POSTag {
  const word = token.original;
  const lower = token.text;

  // Capitalized word not at sentence start -> NNP (Proper Noun)
  if (/^[A-Z][a-zA-Z0-9_-]+$/.test(word) && token.position > 0) {
    return 'NNP';
  }

  // Morphological Suffix rules
  if (lower.endsWith('tion') || lower.endsWith('sion') || lower.endsWith('ment') || lower.endsWith('ness') || lower.endsWith('ance') || lower.endsWith('ence') || lower.endsWith('ism') || lower.endsWith('ity')) {
    return 'NN';
  }
  if (lower.endsWith('able') || lower.endsWith('ible') || lower.endsWith('al') || lower.endsWith('ic') || lower.endsWith('ous') || lower.endsWith('ful') || lower.endsWith('less') || lower.endsWith('ive')) {
    return 'JJ';
  }
  if (lower.endsWith('ly')) {
    return 'RB';
  }
  if (lower.endsWith('ing')) {
    return 'VBG';
  }
  if (lower.endsWith('ed')) {
    return 'VBD';
  }
  if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 3) {
    return 'NNS';
  }

  // Default noun or other
  if (!token.isStopWord) {
    return 'NN';
  }

  return 'OTHER';
}

export function tagTokens(tokens: Token[]): TaggedToken[] {
  return tokens.map((token) => ({
    token,
    pos: tagToken(token),
  }));
}

export interface NounPhrase {
  phrase: string;
  tokens: TaggedToken[];
  startIndex: number;
}

/**
 * Extract Noun Phrases using POS patterns: [Adjective]* [Noun|ProperNoun]+
 */
export function extractNounPhrases(taggedTokens: TaggedToken[]): NounPhrase[] {
  const nounPhrases: NounPhrase[] = [];
  let currentPhrase: TaggedToken[] = [];

  for (let i = 0; i < taggedTokens.length; i++) {
    const item = taggedTokens[i];
    const pos = item.pos;

    if (pos === 'JJ' || pos === 'NN' || pos === 'NNS' || pos === 'NNP') {
      currentPhrase.push(item);
    } else {
      if (currentPhrase.length > 0) {
        // Filter phrase: must contain at least one Noun
        const hasNoun = currentPhrase.some((t) => t.pos === 'NN' || t.pos === 'NNS' || t.pos === 'NNP');
        if (hasNoun) {
          const phraseStr = currentPhrase.map((t) => t.token.original).join(' ');
          if (phraseStr.length > 3) {
            nounPhrases.push({
              phrase: phraseStr,
              tokens: [...currentPhrase],
              startIndex: currentPhrase[0].token.position,
            });
          }
        }
        currentPhrase = [];
      }
    }
  }

  if (currentPhrase.length > 0) {
    const hasNoun = currentPhrase.some((t) => t.pos === 'NN' || t.pos === 'NNS' || t.pos === 'NNP');
    if (hasNoun) {
      const phraseStr = currentPhrase.map((t) => t.token.original).join(' ');
      if (phraseStr.length > 3) {
        nounPhrases.push({
          phrase: phraseStr,
          tokens: [...currentPhrase],
          startIndex: currentPhrase[0].token.position,
        });
      }
    }
  }

  return nounPhrases;
}
