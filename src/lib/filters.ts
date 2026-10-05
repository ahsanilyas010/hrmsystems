// Shared helpers for text filters (Candidates list, Pipeline board)

// Treat user input literally in ILIKE: escape the % and _ wildcards and backslash
export function likeLiteral(s: string) {
  return s.replace(/[\\%_]/g, c => '\\' + c)
}

// Value for a PostgREST or=(...) filter: double-quoted so commas/brackets can't break it
export function orLikeValue(s: string) {
  return '"' + `%${likeLiteral(s)}%`.replace(/["\\]/g, c => '\\' + c) + '"'
}
