/**
 * Resolves a client-supplied identifier (either the numeric `id` or the
 * Strapi v5 `documentId`) to the underlying numeric row id.
 *
 * Route params (`ctx.params.id`) and relation values in request bodies are,
 * by Strapi v5 convention, `documentId` strings — but `strapi.db.query(...)`
 * is a low-level query that only matches on the numeric `id` column. Without
 * this resolution step, every `db.query(...).findOne({ where: { id } })`
 * lookup keyed on a client-supplied identifier silently matches nothing.
 */
export async function resolveNumericId(
  strapi: { db: { query: (uid: any) => any } },
  uid: string,
  identifier: unknown
): Promise<number | null> {
  if (identifier === null || identifier === undefined) {
    return null;
  }

  if (/^\d+$/.test(String(identifier))) {
    return Number(identifier);
  }

  const row = await strapi.db.query(uid).findOne({
    where: { documentId: identifier },
    select: ['id'],
  });

  return row ? row.id : null;
}
