# vcard-ts

A simple, modern TypeScript library for creating VCard 3.0 (RFC 2426) formatted strings. Zero dependencies, fully typed, and works in both browser and Node.js environments.

## Features

- ✅ **RFC 2426 Compliant** - Strictly follows the VCard 3.0 specification
- 🎯 **Simple API** - No complex builder patterns, just plain objects
- 🔒 **Fully Typed** - Complete TypeScript type definitions
- 📦 **Zero Dependencies** - Lightweight and fast
- 🌐 **Universal** - Works in browser and Node.js
- ✨ **Modern** - ESM + CommonJS, tree-shakeable
- 🧪 **Well Tested** - Comprehensive test coverage
- 🍏 **iOS URL Labels** - Supports multiple URLs with human-friendly labels in Apple Contacts

## Why VCard 3.0?

While VCard 4.0 exists, as of right now 3.0 remains the most widely supported format.

## Installation

```bash
npm install vcard-ts
```

## Releasing (Semantic Release)

This project uses `semantic-release` and **Conventional Commits** to automatically version, generate release notes + `CHANGELOG.md`, create a GitHub Release, and publish to npm.

### Commit message format (Conventional Commits)

Examples:

- `fix: handle folded lines correctly`
- `feat: support multiple labeled URLs`
- `docs: update usage examples`
- `chore: update dependencies`

Breaking changes:

- Add `!` after the type/scope: `feat!: change VCard type names`
- Or include `BREAKING CHANGE:` in the commit body

### First release

The initial release version is **`0.0.1`** (pre-1.0, treat as beta).

Note: Semantic Release determines versions from git tags and Conventional Commits. To guarantee the *first* Semantic Release publish ends up as `0.0.1`, create and push a bootstrap tag `v0.0.0` before the first run.

### CI / GitHub Actions setup

The workflow in [.github/workflows/release.yml](.github/workflows/release.yml) runs on pushes to `main`/`master`.

Required repo secrets:

- `NPM_TOKEN`: an npm access token with publish rights for this package

### Dry run

```bash
npm run release:dry
```

## Usage

### Basic Example

```typescript
import { formatVCard, type VCard } from 'vcard-ts';

const vcard: VCard = {
  version: '3.0',
  formattedName: 'John Doe',
  name: {
    familyName: 'Doe',
    givenName: 'John',
  },
};

const vcardString = formatVCard(vcard);
console.log(vcardString);
```

Output:

```
BEGIN:VCARD
VERSION:3.0
FN:John Doe
N:Doe;John;;;
END:VCARD
```

### Character Set Support

VCard 3.0 supports specifying a character set. You can set the `charset` property to include a Content-Type header:

```typescript
import { formatVCard, type VCard } from 'vcard-ts';

const vcard: VCard = {
  version: '3.0',
  formattedName: 'José García',
  name: {
    familyName: 'García',
    givenName: 'José',
  },
  charset: 'UTF-8', // Adds Content-Type header
};

const vcardString = formatVCard(vcard);
console.log(vcardString);
```

Output:

```
Content-Type: text/directory;profile=vcard;charset=UTF-8

BEGIN:VCARD
VERSION:3.0
FN:José García
N:García;José;;;
END:VCARD
```

Supported charsets include `UTF-8` (recommended), `ISO-8859-1`, or any valid charset string. If no charset is specified, no Content-Type header is included (suitable for most modern applications).

You can also force a Content-Type header with the default UTF-8 charset using the `includeContentType` option:

```typescript
const vcardString = formatVCard(vcard, { includeContentType: true });
```

### Photo/Logo/Sound

You can include media either as a URI reference or inline base64 data:

```typescript
// URI Reference
const vcardWithPhoto: VCard = {
  version: '3.0',
  formattedName: 'Jane Smith',
  name: { familyName: 'Smith', givenName: 'Jane' },
  photo: {
    uri: 'https://example.com/photo.jpg',
    mediaType: 'JPEG',
  },
};

// Inline Base64 (must be pre-encoded)
const vcardWithInlinePhoto: VCard = {
  version: '3.0',
  formattedName: 'Jane Smith',
  name: { familyName: 'Smith', givenName: 'Jane' },
  photo: {
    value: 'base64EncodedDataHere...',
    encoding: 'b',
    mediaType: 'JPEG',
  },
};
```

### Special Characters

The library automatically escapes special characters according to RFC 2426:

```typescript
const vcard: VCard = {
  version: '3.0',
  formattedName: 'Test; User, with\\special chars',
  name: {
    familyName: 'User',
    givenName: 'Test',
  },
  note: 'Line 1\nLine 2',
};

// Special characters are automatically escaped:
// ; -> \;
// , -> \,
// \ -> \\
// newline -> \n
```

### Multiple URLs + iOS Labels

Many consumers (including iOS Contacts) support multiple `URL` entries but won’t display a meaningful label unless you use Apple’s extension fields.

This library supports that via `urls`, emitting `itemN.URL` + `itemN.X-ABLabel`. The `item1.`, `item2.`, etc. prefix is the vCard *group* syntax: it scopes multiple related lines under the same group name. So that `item1.X-ABLabel` can be associated with `item1.URL`.

The `X-ABLabel` property is an Apple-specific `X-` extension used by iOS Contacts to display a human-friendly label for the preceding `itemN.URL` field (e.g. “LinkedIn”, “Website”). This is usually not supported on Android.

```typescript
import { formatVCard, type VCard } from 'vcard-ts';

const vcard: VCard = {
  version: '3.0',
  formattedName: 'Michael Wolz',
  name: { familyName: 'Wolz', givenName: 'Michael' },
  urls: [
    { value: 'https://www.linkedin.com/in/michaelwolz', type: 'LinkedIn' },
    { value: 'https://michaelwolz.de', type: 'Website' },
  ],
};

console.log(formatVCard(vcard));
```

Output (excerpt):

```
item1.URL:https://www.linkedin.com/in/michaelwolz
item1.X-ABLabel:LinkedIn
item2.URL:https://michaelwolz.de
item2.X-ABLabel:Website
```

Notes:

- iOS: shows both URLs and the labels.
- Android: typically shows both URLs, but often ignores the `X-ABLabel` labels.
- vCard 4.0 supports richer, standardized URL typing, but vCard 3.0 tends to have broader real-world compatibility; this is a practical workaround.

## API Reference

### Type: VCard

The main VCard type representing a complete vCard object.

**Required Fields:**

- `version: '3.0'` - Must be "3.0"
- `formattedName: string` - Formatted name (FN property)
- `name: Name` - Structured name (N property)

**Optional Fields:**

See the TypeScript definitions for the complete list of optional fields including:

- Character Set: `charset` - Character encoding (e.g., 'UTF-8', 'ISO-8859-1')
- Identification: `nickname`, `photo`, `birthday`
- Delivery Addressing: `addresses`, `labels`
- Telecommunications: `phones`, `emails`, `mailer`
- Geographical: `timezone`, `geo`
- Organizational: `title`, `role`, `logo`, `agent`, `organization`
- Explanatory: `categories`, `note`, `productId`, `revision`, `sortString`, `sound`, `url`, `uid`
- URLs: `url` (single) and `urls` (multiple + optional iOS labels)
- Security: `class`, `key`

### Function: formatVCard

```typescript
function formatVCard(vcard: VCard, options?: { includeContentType?: boolean }): string;
```

Converts a VCard object into an RFC 2426 compliant VCard 3.0 string.

**Parameters:**

- `vcard: VCard` - The VCard object to format
- `options?: { includeContentType?: boolean }` - Optional formatting options
  - `includeContentType` - If true, includes a Content-Type header with UTF-8 charset (default: false, unless `charset` is specified in vcard)

**Returns:**

- `string` - RFC 2426 compliant VCard string with CRLF line endings

**Features:**

- Automatic text escaping for special characters
- Line folding for lines longer than 75 characters
- Optional Content-Type header with charset support
- Proper formatting of all VCard 3.0 properties
- Date/DateTime formatting

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the library
npm run build

# Type check
npm run typecheck

# Lint code
npm run lint

# Format code
npm run format
```

## Browser Support

Works in all modern browsers and Node.js 16+.

## Contributing

Contributions are welcome! Please ensure all tests pass and follow the existing code style.

## References

- [RFC 2426 - vCard MIME Directory Profile](https://www.ietf.org/rfc/rfc2426.txt)
- [MIME Directory Profile (RFC 2425)](https://www.ietf.org/rfc/rfc2425.txt)
