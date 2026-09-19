const ABBREVIATIONS = [
  'e.g.', 'i.e.', 'dr.', 'mr.', 'mrs.', 'ms.', 'prof.', 'fig.', 'figs.', 'vol.', 'vs.', 'etc.', 'al.', 'dept.',
  'no.', 'sec.', 'ref.', 'st.', 'nd.', 'rd.', 'th.'
];

export function segmentSentences(text: string): string[] {
  if (!text || typeof text !== 'string') return [];

  // Normalize line breaks and multiple spaces
  const sanitized = text.replace(/\r\n/g, '\n').replace(/\n+/g, ' ');

  // Place special placeholder markers for known abbreviations
  let protectedText = sanitized;
  ABBREVIATIONS.forEach((abbr, idx) => {
    const regex = new RegExp(`\\b${abbr.replace('.', '\\.')}`, 'gi');
    protectedText = protectedText.replace(regex, `__ABBR_${idx}__`);
  });

  // Protect decimal numbers like 3.14 or 1.5
  protectedText = protectedText.replace(/(\d+)\.(\d+)/g, '$1__DECIMAL__$2');

  // Sentence split regex looking for [.!?] followed by whitespace and capital letter / end of string
  const rawSentences = protectedText.split(/(?<=[.!?])\s+(?=[A-Z0-9"']|$)/);

  const sentences: string[] = [];

  for (let s of rawSentences) {
    // Restore protected placeholders
    ABBREVIATIONS.forEach((abbr, idx) => {
      s = s.replace(new RegExp(`__ABBR_${idx}__`, 'g'), abbr);
    });
    s = s.replace(/__DECIMAL__/g, '.');

    const trimmed = s.trim();
    if (trimmed.length > 10) {
      sentences.push(trimmed);
    }
  }

  return sentences;
}
