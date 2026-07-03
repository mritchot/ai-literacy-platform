// Shared arrow-key math for ARIA radio groups (APG pattern): given the
// pressed key and the current index, return the index to activate, or
// null when the key isn't a radio-navigation key. Callers activate the
// option AND move DOM focus to it (activation follows focus).

export function nextRadioIndex(key: string, current: number, count: number): number | null {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
