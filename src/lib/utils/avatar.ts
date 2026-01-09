/**
 * Utility functions for generating restaurant avatars from names
 */

/**
 * Extract initials from a name
 * Examples:
 * - "La Taquería" → "LT"
 * - "El Buen Sabor" → "EBS"
 * - "Sushi" → "S"
 * - "" → "?"
 */
export function getInitials(name: string): string {
  if (!name || name.trim() === '') return '?';

  const words = name.trim().split(/\s+/).filter(w => w.length > 0);

  if (words.length === 0) return '?';
  if (words.length === 1) return words[0]?.[0]?.toUpperCase() || '?';

  // Take first letter of first 2-3 words
  return words
    .slice(0, 3)
    .map(w => w[0]?.toUpperCase() || '')
    .filter(Boolean)
    .join('');
}

/**
 * Generate consistent color from string hash
 * Returns a Tailwind-compatible color class
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-red-500',
    'bg-violet-500',
  ];

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index] || 'bg-blue-500';
}

/**
 * Get hex color from name (for inline styles)
 */
export function getAvatarColorHex(name: string): string {
  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#22c55e',
    'bg-purple-500': '#a855f7',
    'bg-pink-500': '#ec4899',
    'bg-indigo-500': '#6366f1',
    'bg-orange-500': '#f97316',
    'bg-teal-500': '#14b8a6',
    'bg-cyan-500': '#06b6d4',
    'bg-red-500': '#ef4444',
    'bg-violet-500': '#8b5cf6',
  };

  const colorClass = getAvatarColor(name);
  return colorMap[colorClass] || '#3b82f6';
}
