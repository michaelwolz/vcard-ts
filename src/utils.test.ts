import { describe, expect, it } from 'vitest';
import { escapeParamValue, escapeText, foldLine, formatDate, formatDateTime } from './utils';

describe('utils', () => {
  describe('escapeText', () => {
    it('escapes backslash, semicolon, comma and normalizes all newline variants', () => {
      expect(escapeText('a\\b;c,d')).toBe('a\\\\b\\;c\\,d');
      expect(escapeText('Line1\nLine2')).toBe('Line1\\nLine2');
      expect(escapeText('Line1\rLine2')).toBe('Line1\\nLine2');
      expect(escapeText('Line1\r\nLine2')).toBe('Line1\\nLine2');
    });
  });

  describe('escapeParamValue', () => {
    it('returns ptext unchanged when no quoting is required', () => {
      // Covers the early-return branch
      expect(escapeParamValue('simple-token_123')).toBe('simple-token_123');
    });

    it('quotes values containing forbidden ptext characters and normalizes newlines to spaces', () => {
      expect(escapeParamValue('a;b')).toBe('"a;b"');
      expect(escapeParamValue('a:b')).toBe('"a:b"');
      expect(escapeParamValue('a,b')).toBe('"a,b"');
      // Newlines are normalized to spaces; quoting isn't required after normalization.
      expect(escapeParamValue('Line1\r\nLine2')).toBe('Line1 Line2');
    });

    it('replaces embedded double quotes to keep a valid quoted-string', () => {
      expect(escapeParamValue('a"b')).toBe('"a\'b"');
    });
  });

  describe('foldLine', () => {
    it('does not fold lines of length <= 75', () => {
      const line = 'a'.repeat(75);
      expect(foldLine(line)).toBe(line);
    });

    it('folds lines longer than 75 characters using CRLF + SP', () => {
      const line = 'A'.repeat(76);
      const folded = foldLine(line);
      expect(folded).toBe('A'.repeat(75) + '\r\n ' + 'A');
    });

    it('folds very long lines into multiple continuation lines', () => {
      // 75 + 74 + 1 => 150 chars total
      const line = 'B'.repeat(150);
      const folded = foldLine(line);
      expect(folded).toBe('B'.repeat(75) + '\r\n ' + 'B'.repeat(74) + '\r\n ' + 'B');
    });
  });

  describe('formatDate', () => {
    it('formats dates as YYYY-MM-DD in local time', () => {
      expect(formatDate(new Date(1990, 4, 15))).toBe('1990-05-15');
    });
  });

  describe('formatDateTime', () => {
    it('formats date-times as UTC with a trailing Z', () => {
      expect(formatDateTime(new Date('1995-10-31T22:27:10Z'))).toBe('1995-10-31T22:27:10Z');
    });
  });
});
