/**
 * VCard 3.0 TypeScript Library
 * Implements RFC 2426 - vCard MIME Directory Profile
 */

export const version = '1.0.0';

// Re-export all types
export type {
  Address,
  AddressType,
  Agent,
  Classification,
  CustomProperty,
  Email,
  Geo,
  Media,
  Name,
  Telephone,
  TelephoneType,
  VCard,
} from './types.js';

// Export formatter function
export { formatVCard } from './formatter.js';
