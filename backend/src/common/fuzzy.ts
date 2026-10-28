import { Prisma } from '@prisma/client';

/**
 * Recherche tolérante aux fautes d'orthographe (pg_trgm) : un texte est
 * retenu s'il contient le motif, ou si un de ses mots ressemble assez au
 * motif (word_similarity ≥ 0,35 : « ovulatoin » trouve « ovulation »,
 * « regle » trouve « règles » grâce à unaccent). Le score sert au tri.
 */
export const FUZZY_THRESHOLD = 0.35;

/** Normalise le motif : espaces réduits, 80 caractères max. */
export const normalizeQuery = (q?: string) => (q ?? '').trim().replace(/\s+/g, ' ').slice(0, 80);

/** Condition SQL « colonne ressemble au motif » (colonne = expression texte). */
export const fuzzyMatch = (column: Prisma.Sql, q: string) =>
  Prisma.sql`(
    unaccent(lower(${column})) ILIKE ('%' || unaccent(lower(${q})) || '%')
    OR word_similarity(unaccent(lower(${q})), unaccent(lower(${column}))) >= ${FUZZY_THRESHOLD}
  )`;

/** Score de pertinence d'une colonne pour le motif (0 à 1). */
export const fuzzyScore = (column: Prisma.Sql, q: string) =>
  Prisma.sql`GREATEST(
    CASE WHEN unaccent(lower(${column})) ILIKE ('%' || unaccent(lower(${q})) || '%') THEN 1 ELSE 0 END,
    word_similarity(unaccent(lower(${q})), unaccent(lower(${column})))
  )`;
