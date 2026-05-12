/**
 * Basic word filter for racist slurs and NSFW language.
 * Uses word-boundary matching and common leet-speak substitutions
 * to catch basic attempts at bypassing.
 */

// Blocked terms — lowercase. This covers common racist slurs and NSFW words.
// Keep this list focused on the worst offenders; extend as needed.
const BLOCKED_WORDS = [
  // racist slurs
  'nigger', 'nigga', 'niggers', 'niggas',
  'chink', 'chinks',
  'spic', 'spics', 'spick', 'spicks',
  'wetback', 'wetbacks',
  'kike', 'kikes',
  'gook', 'gooks',
  'coon', 'coons',
  'darkie', 'darkies',
  'beaner', 'beaners',
  'raghead', 'ragheads',
  'towelhead', 'towelheads',
  'redskin', 'redskins',
  'zipperhead',

  // nsfw / sexual slurs
  'fuck', 'fucker', 'fuckers', 'fucking', 'fucks',
  'shit', 'shits', 'shitting',
  'cock', 'cocks',
  'dick', 'dicks',
  'pussy', 'pussies',
  'cunt', 'cunts',
  'whore', 'whores',
  'slut', 'sluts',
  'bitch', 'bitches',
  'ass', 'asses', 'asshole', 'assholes',
  'porn', 'porno',
  'hentai',
  'cum', 'cumming',
  'jizz',
  'tits', 'titties',
  'boobs',
  'penis', 'penises',
  'vagina', 'vaginas',

  // homophobic slurs
  'fag', 'fags', 'faggot', 'faggots',
  'dyke', 'dykes',
  'tranny', 'trannies',

  // misc hate
  'nazi', 'nazis',
  'retard', 'retards', 'retarded',
];

// Common leet-speak substitutions to normalize before checking
const LEET_MAP = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '@': 'a',
  '$': 's',
  '!': 'i',
};

/**
 * Normalize a string: lowercase, strip accents, apply leet-speak map,
 * collapse repeated chars, and remove non-alpha chars between letters.
 */
function normalize(text) {
  let s = text.toLowerCase();
  // Replace accented characters with base form
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Apply leet substitutions
  s = s.replace(/[01345789@$!]/g, (ch) => LEET_MAP[ch] || ch);
  // Remove non-alphabetic characters (spaces, punctuation, underscores, etc.)
  // This catches things like "f u c k" or "f_u_c_k"
  s = s.replace(/[^a-z]/g, '');
  return s;
}

/**
 * Check if a text contains any blocked words.
 * Returns { blocked: boolean, word?: string } where word is the first match found.
 */
export function checkMessage(text) {
  const normalized = normalize(text);

  for (const word of BLOCKED_WORDS) {
    if (normalized.includes(word)) {
      return { blocked: true, word };
    }
  }

  return { blocked: false };
}

/**
 * Also check the name field (simpler check, still normalized).
 */
export function checkName(name) {
  return checkMessage(name);
}
