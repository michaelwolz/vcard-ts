import { describe, expect, it } from 'vitest';
import { greet, version } from './index';

describe('vcard-ts', () => {
  it('should export version', () => {
    expect(version).toBe('1.0.0');
  });

  it('should greet correctly', () => {
    expect(greet('World')).toBe('Hello, World!');
  });
});
