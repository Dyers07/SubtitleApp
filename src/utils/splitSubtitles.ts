import { Subtitle } from "@/types";

/**
 * Découpe les sous-titres de base en blocs de `maxWords` mots
 * –   NE réutilise JAMAIS une liste déjà découpée.
 * –   Coupe également dès qu’un mot se termine par . ? !
 */
export function splitSubtitles(base: Subtitle[], maxWords = 3): Subtitle[] {
  const out: Subtitle[] = [];

  base.forEach((s) => {
    if (!s.words?.length) {
      // Pas de granularité : on garde tel quel
      out.push({ ...s, id: `${s.id ?? ''}-0` });
      return;
    }

    let bucket: typeof s.words = [];
    let chunk = 0;

    const flush = () => {
      if (!bucket.length) return;
      out.push({
        ...s,
        id: `${s.id ?? s.start}-${chunk++}`,          // clé unique
        start: bucket[0].start,
        end: bucket[bucket.length - 1].end,
        text: bucket.map((w) => w.text).join(' '),
        words: bucket,
      });
      bucket = [];
    };

    s.words.forEach((w) => {
      bucket.push(w);

      const endOfSentence = /[.!?]$/.test(w.text);
      const limitReached  = bucket.length === maxWords;

      if (limitReached || endOfSentence) flush();
    });

    flush(); // reste éventuel
  });

  return out;
}
