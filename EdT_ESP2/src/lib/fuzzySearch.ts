/**
 * Fuzzy Search Utilities
 * Provides intelligent search that tolerates typos and partial matches
 */

/**
 * Calculate fuzzy match score between text and query
 * Higher score = better match
 * Returns 0 if no match
 */
export function fuzzyScore(text: string, query: string): number {
  if (!query) return 1 // Empty query matches everything
  if (!text) return 0

  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()

  // Exact match gets highest score
  if (textLower === queryLower) return 100

  // Contains exact query
  if (textLower.includes(queryLower)) {
    // Bonus for matching at start
    if (textLower.startsWith(queryLower)) return 90
    // Bonus for matching at word boundary
    if (textLower.includes(` ${queryLower}`)) return 85
    return 80
  }

  // Check if all query characters appear in order (fuzzy)
  let score = 0
  let textIndex = 0
  let consecutiveMatches = 0
  let lastMatchIndex = -2

  for (let i = 0; i < queryLower.length; i++) {
    const char = queryLower[i]
    const foundIndex = textLower.indexOf(char, textIndex)

    if (foundIndex === -1) {
      // Character not found - try with common substitutions
      const substitutions: Record<string, string[]> = {
        'e': ['é', 'è', 'ê', 'ë'],
        'a': ['à', 'â', 'ä'],
        'i': ['î', 'ï'],
        'o': ['ô', 'ö'],
        'u': ['ù', 'û', 'ü'],
        'c': ['ç'],
      }

      let found = false
      const subs = substitutions[char] || []
      for (const sub of subs) {
        const subIndex = textLower.indexOf(sub, textIndex)
        if (subIndex !== -1) {
          textIndex = subIndex + 1
          score += 5
          found = true
          break
        }
      }

      if (!found) {
        // Allow skipping one character in query (typo tolerance)
        if (i < queryLower.length - 1) {
          continue
        }
        return 0 // No match
      }
    } else {
      // Check for consecutive matches
      if (foundIndex === lastMatchIndex + 1) {
        consecutiveMatches++
        score += 10 + consecutiveMatches * 2 // Bonus for consecutive matches
      } else {
        consecutiveMatches = 0
        score += 5
      }

      // Bonus for matching at word boundaries
      if (foundIndex === 0 || textLower[foundIndex - 1] === ' ') {
        score += 5
      }

      lastMatchIndex = foundIndex
      textIndex = foundIndex + 1
    }
  }

  // Normalize score based on query length coverage
  const coverage = queryLower.length / textLower.length
  score = score * (0.5 + coverage * 0.5)

  return Math.min(score, 79) // Cap below exact/contains match scores
}

/**
 * Check if text fuzzy-matches the query
 */
export function fuzzyMatch(text: string, query: string): boolean {
  return fuzzyScore(text, query) > 0
}

/**
 * Perform fuzzy search on a list of items
 * Returns items sorted by match score (best first)
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getSearchableFields: (item: T) => string[]
): T[] {
  if (!query.trim()) return items

  const scored = items
    .map((item) => {
      const fields = getSearchableFields(item)
      // Get the best score among all searchable fields
      const bestScore = Math.max(...fields.map((field) => fuzzyScore(field, query)))
      return { item, score: bestScore }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.map(({ item }) => item)
}

/**
 * Highlight matching parts in text for display
 * Returns array of { text, highlight } segments
 */
export function getMatchHighlights(
  text: string,
  query: string
): Array<{ text: string; highlight: boolean }> {
  if (!query.trim()) {
    return [{ text, highlight: false }]
  }

  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()
  const result: Array<{ text: string; highlight: boolean }> = []

  // Find all positions where query characters match
  const matchPositions: number[] = []
  let textIndex = 0

  for (const char of queryLower) {
    const foundIndex = textLower.indexOf(char, textIndex)
    if (foundIndex !== -1) {
      matchPositions.push(foundIndex)
      textIndex = foundIndex + 1
    }
  }

  // Build result with highlighted segments
  let lastEnd = 0
  let currentHighlightStart = -1

  for (let i = 0; i < matchPositions.length; i++) {
    const pos = matchPositions[i]
    const isConsecutive = i > 0 && pos === matchPositions[i - 1] + 1

    if (!isConsecutive && currentHighlightStart !== -1) {
      // End current highlight
      if (lastEnd < currentHighlightStart) {
        result.push({ text: text.slice(lastEnd, currentHighlightStart), highlight: false })
      }
      result.push({ text: text.slice(currentHighlightStart, matchPositions[i - 1] + 1), highlight: true })
      lastEnd = matchPositions[i - 1] + 1
      currentHighlightStart = pos
    } else if (currentHighlightStart === -1) {
      currentHighlightStart = pos
    }
  }

  // Handle final segment
  if (currentHighlightStart !== -1 && matchPositions.length > 0) {
    if (lastEnd < currentHighlightStart) {
      result.push({ text: text.slice(lastEnd, currentHighlightStart), highlight: false })
    }
    result.push({
      text: text.slice(currentHighlightStart, matchPositions[matchPositions.length - 1] + 1),
      highlight: true,
    })
    lastEnd = matchPositions[matchPositions.length - 1] + 1
  }

  if (lastEnd < text.length) {
    result.push({ text: text.slice(lastEnd), highlight: false })
  }

  return result.length > 0 ? result : [{ text, highlight: false }]
}
