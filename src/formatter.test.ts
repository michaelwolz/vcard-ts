import { describe, expect, it } from 'vitest';
import { formatVCard, type VCard } from './index';

describe('formatVCard', () => {
  it('should create a minimal valid VCard with required fields', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'John Doe',
      name: {
        familyName: 'Doe',
        givenName: 'John',
      },
    };

    const result = formatVCard(vcard);

    expect(result).toContain('BEGIN:VCARD');
    expect(result).toContain('VERSION:3.0');
    expect(result).toContain('FN:John Doe');
    expect(result).toContain('N:Doe;John;;;');
    expect(result).toContain('END:VCARD');
  });

  it('should handle full name structure with all components', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Mr. John Quinlan Public, Esq.',
      name: {
        familyName: 'Public',
        givenName: 'John',
        additionalNames: ['Quinlan'],
        honorificPrefixes: ['Mr.'],
        honorificSuffixes: ['Esq.'],
      },
    };

    const result = formatVCard(vcard);
    expect(result).toContain('N:Public;John;Quinlan;Mr.;Esq.');
  });

  it('should escape special characters in text fields', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Test; User, with\\special chars',
      name: {
        familyName: 'User',
        givenName: 'Test',
      },
      note: 'Line 1\nLine 2',
    };

    const result = formatVCard(vcard);
    expect(result).toContain('FN:Test\\; User\\, with\\\\special chars');
    expect(result).toContain('NOTE:Line 1\\nLine 2');
  });

  it('should normalize CRLF newlines to a single \\n escape', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'CRLF Test',
      name: {
        familyName: 'Test',
      },
      note: 'Line 1\r\nLine 2',
    };

    const result = formatVCard(vcard);
    expect(result).toContain('NOTE:Line 1\\nLine 2');
    expect(result).not.toContain('NOTE:Line 1\\n\\nLine 2');
  });

  it('should format addresses correctly', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Jane Smith',
      name: {
        familyName: 'Smith',
        givenName: 'Jane',
      },
      addresses: [
        {
          street: '123 Main Street',
          locality: 'Any Town',
          region: 'CA',
          postalCode: '91921-1234',
          country: 'U.S.A.',
          types: ['home', 'postal'],
        },
      ],
    };

    const result = formatVCard(vcard);
    expect(result).toContain('ADR;TYPE=home,postal:;;123 Main Street;Any Town;CA;91921-1234;U.S.A.');
  });

  it('should format telephone numbers with types', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Bob Johnson',
      name: {
        familyName: 'Johnson',
        givenName: 'Bob',
      },
      phones: [
        {
          value: '+1-555-1234',
          types: ['work', 'voice'],
        },
        {
          value: '+1-555-5678',
          types: ['home', 'cell'],
        },
      ],
    };

    const result = formatVCard(vcard);
    expect(result).toContain('TEL;TYPE=work,voice:+1-555-1234');
    expect(result).toContain('TEL;TYPE=home,cell:+1-555-5678');
  });

  it('should format email addresses', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Alice Brown',
      name: {
        familyName: 'Brown',
        givenName: 'Alice',
      },
      emails: [
        {
          value: 'alice@example.com',
          types: ['internet', 'pref'],
        },
      ],
    };

    const result = formatVCard(vcard);
    expect(result).toContain('EMAIL;TYPE=internet,pref:alice@example.com');
  });

  it('should format organizational information', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Tim Developer',
      name: {
        familyName: 'Developer',
        givenName: 'Tim',
      },
      organization: {
        name: 'ABC, Inc.',
        units: ['Engineering', 'Software'],
      },
      title: 'Senior Developer',
      role: 'Programmer',
    };

    const result = formatVCard(vcard);
    expect(result).toContain('ORG:ABC\\, Inc.;Engineering;Software');
    expect(result).toContain('TITLE:Senior Developer');
    expect(result).toContain('ROLE:Programmer');
  });

  it('should format geographic coordinates', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Location Test',
      name: {
        familyName: 'Test',
      },
      geo: {
        latitude: 37.386013,
        longitude: -122.082932,
      },
    };

    const result = formatVCard(vcard);
    expect(result).toContain('GEO:37.386013;-122.082932');
  });

  it('should format dates correctly', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Birthday Person',
      name: {
        familyName: 'Person',
      },
      birthday: new Date('1990-05-15'),
    };

    const result = formatVCard(vcard);
    expect(result).toContain('BDAY:1990-05-15');
  });

  it('should format categories and notes', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Category Test',
      name: {
        familyName: 'Test',
      },
      categories: ['WORK', 'BUSINESS', 'DEVELOPER'],
      note: 'This is a test note',
    };

    const result = formatVCard(vcard);
    expect(result).toContain('CATEGORIES:WORK,BUSINESS,DEVELOPER');
    expect(result).toContain('NOTE:This is a test note');
  });

  it('should format photo with URI', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Photo Person',
      name: {
        familyName: 'Person',
      },
      photo: {
        uri: 'http://example.com/photo.jpg',
        mediaType: 'JPEG',
      },
    };

    const result = formatVCard(vcard);
    expect(result).toContain('PHOTO;VALUE=uri;TYPE=JPEG:http://example.com/photo.jpg');
  });

  it('should format URL and UID', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Web User',
      name: {
        familyName: 'User',
      },
      url: 'https://example.com',
      uid: 'urn:uuid:12345678-1234-1234-1234-123456789012',
    };

    const result = formatVCard(vcard);
    expect(result).toContain('URL:https://example.com');
    expect(result).toContain('UID:urn:uuid:12345678-1234-1234-1234-123456789012');
  });

  it('should format multiple URLs with iOS labels using itemN.URL and itemN.X-ABLabel', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Michael Wolz',
      name: { familyName: 'Wolz', givenName: 'Michael' },
      urls: [
        { value: 'https://www.linkedin.com/in/michaelwolz', type: 'LinkedIn' },
        { value: 'https://michaelwolz.de', type: 'Website' },
      ],
    };

    const result = formatVCard(vcard);
    expect(result).toContain('item1.URL:https://www.linkedin.com/in/michaelwolz');
    expect(result).toContain('item1.X-ABLabel:LinkedIn');
    expect(result).toContain('item2.URL:https://michaelwolz.de');
    expect(result).toContain('item2.X-ABLabel:Website');
  });

  it('should escape special characters in iOS URL labels', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Label Test',
      name: { familyName: 'Test' },
      urls: [{ value: 'https://example.com', type: 'Foo; Bar, Inc.' }],
    };

    const result = formatVCard(vcard);
    expect(result).toContain('item1.X-ABLabel:Foo\\; Bar\\, Inc.');
  });

  it('should not emit both urls[] and url when they are the same', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Dedup Test',
      name: { familyName: 'Test' },
      url: 'https://example.com',
      urls: [{ value: 'https://example.com', type: 'Website' }],
    };

    const result = formatVCard(vcard);
    expect(result).toContain('item1.URL:https://example.com');
    expect(result).toContain('item1.X-ABLabel:Website');
    expect(result).not.toMatch(/(^|\r\n)URL:https:\/\/example\.com(\r\n|$)/);
  });

  it('should format classification', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Private User',
      name: {
        familyName: 'User',
      },
      class: 'PRIVATE',
    };

    const result = formatVCard(vcard);
    expect(result).toContain('CLASS:PRIVATE');
  });

  it('should create a complete vCard with multiple properties', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'John Q. Public',
      name: {
        familyName: 'Public',
        givenName: 'John',
        additionalNames: ['Quinlan'],
      },
      nickname: ['Johnny', 'JQ'],
      organization: {
        name: 'Company Inc.',
        units: ['Development'],
      },
      title: 'Software Engineer',
      emails: [{ value: 'john@example.com', types: ['internet', 'pref'] }],
      phones: [{ value: '+1-555-1234', types: ['work', 'voice'] }],
      addresses: [
        {
          street: '123 Main St',
          locality: 'Anytown',
          region: 'CA',
          postalCode: '12345',
          country: 'USA',
          types: ['work'],
        },
      ],
      url: 'https://example.com',
      note: 'This is a comprehensive test',
    };

    const result = formatVCard(vcard);

    // Verify structure
    expect(result.startsWith('BEGIN:VCARD')).toBe(true);
    expect(result.endsWith('END:VCARD')).toBe(true);
    expect(result).toContain('VERSION:3.0');
    expect(result).toContain('FN:John Q. Public');
    expect(result).toContain('N:Public;John;Quinlan;;');
    expect(result).toContain('NICKNAME:Johnny,JQ');
  });

  it('should support charset parameter', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'José García',
      name: {
        familyName: 'García',
        givenName: 'José',
      },
      charset: 'UTF-8',
    };

    const result = formatVCard(vcard);
    expect(result).toContain('Content-Type: text/directory;profile=vcard;charset=UTF-8');
    expect(result).toContain('BEGIN:VCARD');
    expect(result).toContain('FN:José García');
  });

  it('should support charset without Content-Type header when includeContentType is false', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'José García',
      name: {
        familyName: 'García',
        givenName: 'José',
      },
    };

    const result = formatVCard(vcard);
    expect(result).not.toContain('Content-Type:');
    expect(result).toContain('FN:José García');
  });

  it('should add Content-Type header when includeContentType option is true', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'John Doe',
      name: {
        familyName: 'Doe',
        givenName: 'John',
      },
    };

    const result = formatVCard(vcard, { includeContentType: true });
    expect(result).toContain('Content-Type: text/directory;profile=vcard;charset=UTF-8');
    expect(result).toContain('BEGIN:VCARD');
  });

  it('should support ISO-8859-1 charset', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'François Müller',
      name: {
        familyName: 'Müller',
        givenName: 'François',
      },
      charset: 'ISO-8859-1',
    };

    const result = formatVCard(vcard);
    expect(result).toContain('Content-Type: text/directory;profile=vcard;charset=ISO-8859-1');
  });

  it('should support custom X- properties', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'John Doe',
      name: {
        familyName: 'Doe',
        givenName: 'John',
      },
      customProperties: [
        {
          name: 'X-TWITTER',
          value: '@johndoe',
        },
        {
          name: 'X-SOCIALPROFILE',
          value: 'https://twitter.com/johndoe',
          params: {
            type: 'twitter',
          },
        },
      ],
    };

    const result = formatVCard(vcard);
    expect(result).toContain('X-TWITTER:@johndoe');
    expect(result).toContain('X-SOCIALPROFILE;TYPE=twitter:https://twitter.com/johndoe');
  });

  it('should support custom properties with multiple parameters', () => {
    const vcard: VCard = {
      version: '3.0',
      formattedName: 'Jane Smith',
      name: {
        familyName: 'Smith',
        givenName: 'Jane',
      },
      customProperties: [
        {
          name: 'X-SOCIALPROFILE',
          value: 'https://linkedin.com/in/janesmith',
          params: {
            type: 'linkedin',
            userid: 'janesmith',
          },
        },
      ],
    };

    const result = formatVCard(vcard);
    // Check for the property with both parameters (may be folded across lines)
    expect(result.replace(/\r\n /g, '')).toContain(
      'X-SOCIALPROFILE;TYPE=linkedin;USERID=janesmith:https://linkedin.com/in/janesmith'
    );
  });

  it('should emit TZ as utc-offset by default or VALUE=text otherwise', () => {
    const vcardOffset: VCard = {
      version: '3.0',
      formattedName: 'TZ Offset',
      name: { familyName: 'Test' },
      timezone: '-05:00',
    };

    const vcardText: VCard = {
      version: '3.0',
      formattedName: 'TZ Text',
      name: { familyName: 'Test' },
      timezone: '-05:00; EST',
    };

    expect(formatVCard(vcardOffset)).toContain('TZ:-05:00');
    expect(formatVCard(vcardText)).toContain('TZ;VALUE=text:-05:00\\; EST');
  });
});
