/** Minúsculas, sin tildes y sin espacios en los bordes. Base de las búsquedas de `SearchableSelect`. */
export function normalizeSearch(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}
