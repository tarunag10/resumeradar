// Common stop words to ignore during keyword matching
export const STOP_WORDS = new Set([
  'the', 'and', 'or', 'to', 'of', 'in', 'for', 'with', 'a', 'an', 'is', 'are',
  'be', 'as', 'by', 'from', 'this', 'that', 'it', 'its', 'on', 'at', 'have',
  'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
  'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to',
  'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'but', 'if', 'because', 'until', 'while', 'although', 'though',
  'after', 'before', 'since', 'when', 'where', 'which', 'who', 'whom', 'whose',
  'why', 'how', 'all', 'any', 'about', 'into', 'through', 'during', 'above',
  'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just'
]);

export function isStopWord(word: string): boolean {
  return STOP_WORDS.has(word.toLowerCase());
}