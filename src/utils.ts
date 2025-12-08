/**
 * Utility functions for VCard formatting
 * RFC 2426 compliant text escaping and formatting
 */

/**
 * Escape special characters in text values according to RFC 2426
 * - Backslash (\) -> \\
 * - Semicolon (;) -> \;
 * - Comma (,) -> \,
 * - Newline (\n) -> \n
 */
export function escapeText(text: string): string {
  // Normalize all newline variants to a single LF before escaping.
  // RFC 2426: CRLF in a text value is encoded as "\n" or "\N".
  const normalized = text.replace(/\r\n|\r|\n/g, '\n');

  return normalized.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/**
 * Escape a parameter value according to the RFC 2426 ABNF.
 * Parameter values are either ptext (SAFE-CHAR*) or a quoted-string.
 * We use quoted-string when special characters would violate ptext.
 */
export function escapeParamValue(value: string): string {
  const normalized = value.replace(/\r\n|\r|\n/g, ' ');

  // Characters not allowed in ptext (SAFE-CHAR excludes DQUOTE, ';', ':', ',')
  const needsQuotes = /[";:,]/.test(normalized);
  if (!needsQuotes) {
    return normalized;
  }

  // Quoted-string disallows literal DQUOTE; replace with apostrophe to stay valid.
  const withoutQuotes = normalized.replace(/"/g, "'");
  return `"${withoutQuotes}"`;
}

/**
 * Fold lines longer than 75 characters according to RFC 2426
 * Lines are folded by inserting CRLF followed by a single space
 */
export function foldLine(line: string): string {
  if (line.length <= 75) {
    return line;
  }

  const result: string[] = [];
  let currentLine = line;

  // First line can be 75 characters
  result.push(currentLine.slice(0, 75));
  currentLine = currentLine.slice(75);

  // Continuation lines can be 74 characters (accounting for leading space)
  while (currentLine.length > 0) {
    result.push(` ${currentLine.slice(0, 74)}`);
    currentLine = currentLine.slice(74);
  }

  return result.join('\r\n');
}

/**
 * Format a Date object as an ISO 8601 date string (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date object as an ISO 8601 date-time string
 */
export function formatDateTime(date: Date): string {
  // Emit a consistent UTC timestamp ("Z")
  const year = date.getUTCFullYear().toString();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}
