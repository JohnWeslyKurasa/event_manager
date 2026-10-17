import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique, human-readable ticket code.
 * Format: EVT-XXXX-YYYY (where X is numeric and Y is alphanumeric)
 */
export const generateTicketCode = (): string => {
  const uuid = uuidv4().replace(/-/g, '').toUpperCase();
  const part1 = uuid.substring(0, 4);
  const part2 = uuid.substring(4, 8);
  return `EVT-${part1}-${part2}`;
};

/**
 * Generates a slug from a title string.
 * Adds a short unique suffix to prevent collisions.
 */
export const generateSlug = (title: string): string => {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 80);

  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${suffix}`;
};

/**
 * Formats a currency amount as a display string.
 */
export const formatCurrency = (amount: number): string => {
  if (amount === 0) return 'Free';
  return `$${amount.toFixed(2)}`;
};
