/**
 * Porter Stemmer Implementation & English Morphological Lemmatizer
 */

// Irregular English Lemmatization dictionary
const IRREGULAR_LEMMAS: Record<string, string> = {
  // Plural nouns -> Singular
  children: 'child',
  people: 'person',
  men: 'man',
  women: 'woman',
  feet: 'foot',
  teeth: 'tooth',
  geese: 'goose',
  mice: 'mouse',
  matrices: 'matrix',
  indices: 'index',
  analyses: 'analysis',
  hypotheses: 'hypothesis',
  phenomena: 'phenomenon',
  criteria: 'criterion',
  data: 'datum',
  categories: 'category',
  entities: 'entity',
  capabilities: 'capability',
  technologies: 'technology',
  queries: 'query',
  processes: 'process',
  // Verbs -> Base Infinitive
  are: 'be',
  is: 'be',
  was: 'be',
  were: 'be',
  been: 'be',
  being: 'be',
  has: 'have',
  had: 'have',
  having: 'have',
  does: 'do',
  did: 'do',
  done: 'do',
  doing: 'do',
  went: 'go',
  gone: 'go',
  going: 'go',
  made: 'make',
  making: 'make',
  built: 'build',
  building: 'build',
  written: 'write',
  wrote: 'write',
  writing: 'write',
};

// Morphological Suffix Rules for Lemmatization
export function lemmatizeWord(word: string): string {
  if (!word) return '';
  const lower = word.toLowerCase();

  // Check irregular dictionary first
  if (IRREGULAR_LEMMAS[lower]) {
    return IRREGULAR_LEMMAS[lower];
  }

  // Common Morphological Noun/Verb Lemmatization Rules
  if (lower.endsWith('ies') && lower.length > 4) {
    return lower.slice(0, -3) + 'y';
  }
  if (lower.endsWith('ves') && lower.length > 4) {
    return lower.slice(0, -3) + 'f';
  }
  if (lower.endsWith('ing') && lower.length > 5) {
    if (lower.endsWith('tting') || lower.endsWith('nning') || lower.endsWith('pping') || lower.endsWith('mming')) {
      return lower.slice(0, -4);
    }
    return lower.slice(0, -3);
  }
  if (lower.endsWith('ed') && lower.length > 4) {
    if (lower.endsWith('ied')) return lower.slice(0, -3) + 'y';
    if (lower.endsWith('ated') || lower.endsWith('ized') || lower.endsWith('uted')) {
      return lower.slice(0, -1);
    }
    return lower.slice(0, -2);
  }
  if (lower.endsWith('es') && (lower.endsWith('shes') || lower.endsWith('ches') || lower.endsWith('xesses') || lower.endsWith('oses'))) {
    return lower.slice(0, -2);
  }
  if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 3) {
    return lower.slice(0, -1);
  }

  return lower;
}

/**
 * Standard Porter Stemmer for English words
 */
export function stemWord(w: string): string {
  if (w.length < 3) return w;

  let stem = w.toLowerCase();

  // Step 1a
  if (stem.endsWith('sses')) stem = stem.slice(0, -2);
  else if (stem.endsWith('ies')) stem = stem.slice(0, -2);
  else if (stem.endsWith('ss')) { /* keep */ }
  else if (stem.endsWith('s')) stem = stem.slice(0, -1);

  // Step 1b
  if (stem.endsWith('eed')) {
    if (stem.length > 4) stem = stem.slice(0, -1);
  } else if ((stem.endsWith('ed') || stem.endsWith('ing')) && /[aeiou]/.test(stem.slice(0, -3))) {
    if (stem.endsWith('ed')) stem = stem.slice(0, -2);
    else if (stem.endsWith('ing')) stem = stem.slice(0, -3);

    if (stem.endsWith('at') || stem.endsWith('bl') || stem.endsWith('iz')) stem += 'e';
    else if (/(bb|dd|ff|gg|mm|nn|pp|rr|tt)$/.test(stem)) stem = stem.slice(0, -1);
  }

  return stem;
}
