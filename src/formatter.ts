/**
 * VCard 3.0 Formatter
 * Converts VCard objects to RFC 2426 compliant strings
 */

import type { Address, Email, FormatVCardOptions, Media, Name, Phone, Url, VCard } from './types.js';
import { escapeParamValue, escapeText, foldLine, formatDate, formatDateTime } from './utils.js';

/**
 * Format a VCard object into a valid VCard 3.0 string
 * @param vcard - VCard object to format
 * @param options - Optional formatting options
 * @param options.charset - (Legacy) Charset to declare via CHARSET parameters. If omitted, UTF-8 is assumed and no CHARSET is emitted.
 * @returns RFC 2426 compliant VCard string
 */
export function formatVCard(vcard: VCard, options?: FormatVCardOptions): string {
  const lines: string[] = [];

  // RFC 2426: A vCard object MUST begin with BEGIN:VCARD.
  // Note: CHARSET is not part of RFC 2426; it's kept as a legacy interoperability option.
  // Default: assume UTF-8 and do NOT emit CHARSET unless explicitly requested.
  const charset = options?.charset;
  const charsetParam = charset !== undefined ? `;CHARSET=${escapeParamValue(charset)}` : '';

  // BEGIN (REQUIRED)
  lines.push('BEGIN:VCARD');

  // VERSION (REQUIRED)
  lines.push('VERSION:3.0');

  // FN - Formatted Name (REQUIRED)
  lines.push(`FN${charsetParam}:${escapeText(vcard.formattedName)}`);

  // N - Structured Name (REQUIRED)
  lines.push(formatName(vcard.name, charsetParam));

  // NICKNAME (OPTIONAL)
  if (vcard.nickname !== undefined && vcard.nickname.length > 0) {
    lines.push(`NICKNAME${charsetParam}:${vcard.nickname.map(escapeText).join(',')}`);
  }

  // PHOTO (OPTIONAL)
  if (vcard.photo !== undefined) {
    lines.push(...formatMedia('PHOTO', vcard.photo));
  }

  // BDAY (OPTIONAL)
  if (vcard.birthday !== undefined) {
    const bdayValue = vcard.birthday instanceof Date ? formatDate(vcard.birthday) : vcard.birthday;
    lines.push(`BDAY:${bdayValue}`);
  }

  // ADR - Addresses (OPTIONAL)
  if (vcard.addresses !== undefined) {
    vcard.addresses.forEach((addr) => {
      lines.push(formatAddress(addr, charsetParam));
    });
  }

  // LABEL (OPTIONAL)
  if (vcard.labels !== undefined) {
    vcard.labels.forEach((label) => {
      const typeParam = label.types !== undefined && label.types.length > 0 ? `;TYPE=${label.types.join(',')}` : '';
      lines.push(`LABEL${typeParam}${charsetParam}:${escapeText(label.value)}`);
    });
  }

  // TEL - phones (OPTIONAL)
  if (vcard.phones !== undefined) {
    vcard.phones.forEach((tel) => {
      lines.push(formatTelephone(tel));
    });
  }

  // EMAIL (OPTIONAL)
  if (vcard.emails !== undefined) {
    vcard.emails.forEach((email) => {
      lines.push(formatEmail(email, charsetParam));
    });
  }

  // MAILER (OPTIONAL)
  if (vcard.mailer !== undefined) {
    lines.push(`MAILER${charsetParam}:${escapeText(vcard.mailer)}`);
  }

  // TZ - Timezone (OPTIONAL)
  if (vcard.timezone !== undefined) {
    // RFC 2426 default is utc-offset; it can be reset to text using VALUE=text.
    const tz = vcard.timezone;
    const isUtcOffset = /^[+-]\d{2}:\d{2}$/.test(tz);
    lines.push(isUtcOffset ? `TZ:${tz}` : `TZ;VALUE=text${charsetParam}:${escapeText(tz)}`);
  }

  // GEO - Geographic Position (OPTIONAL)
  if (vcard.geo !== undefined) {
    lines.push(`GEO:${vcard.geo.latitude.toString()};${vcard.geo.longitude.toString()}`);
  }

  // TITLE (OPTIONAL)
  if (vcard.title !== undefined) {
    lines.push(`TITLE${charsetParam}:${escapeText(vcard.title)}`);
  }

  // ROLE (OPTIONAL)
  if (vcard.role !== undefined) {
    lines.push(`ROLE${charsetParam}:${escapeText(vcard.role)}`);
  }

  // LOGO (OPTIONAL)
  if (vcard.logo !== undefined) {
    lines.push(...formatMedia('LOGO', vcard.logo));
  }

  // AGENT (OPTIONAL)
  if (vcard.agent !== undefined) {
    if (vcard.agent.uri !== undefined) {
      lines.push(`AGENT;VALUE=uri:${vcard.agent.uri}`);
    } else if (vcard.agent.value !== undefined) {
      lines.push(`AGENT${charsetParam}:${escapeText(vcard.agent.value)}`);
    }
  }

  // ORG - Organization (OPTIONAL)
  if (vcard.organization !== undefined) {
    const orgParts: string[] = [];
    if (vcard.organization.name !== undefined) {
      orgParts.push(escapeText(vcard.organization.name));
    }
    if (vcard.organization.units !== undefined && vcard.organization.units.length > 0) {
      orgParts.push(...vcard.organization.units.map(escapeText));
    }
    if (orgParts.length > 0) {
      lines.push(`ORG${charsetParam}:${orgParts.join(';')}`);
    }
  }

  // CATEGORIES (OPTIONAL)
  if (vcard.categories !== undefined && vcard.categories.length > 0) {
    lines.push(`CATEGORIES${charsetParam}:${vcard.categories.map(escapeText).join(',')}`);
  }

  // NOTE (OPTIONAL)
  if (vcard.note !== undefined) {
    lines.push(`NOTE${charsetParam}:${escapeText(vcard.note)}`);
  }

  // PRODID (OPTIONAL)
  if (vcard.productId !== undefined) {
    lines.push(`PRODID${charsetParam}:${escapeText(vcard.productId)}`);
  }

  // REV - Revision (OPTIONAL)
  if (vcard.revision !== undefined) {
    const revValue = vcard.revision instanceof Date ? formatDateTime(vcard.revision) : vcard.revision;
    lines.push(`REV:${revValue}`);
  }

  // SORT-STRING (OPTIONAL)
  if (vcard.sortString !== undefined) {
    lines.push(`SORT-STRING${charsetParam}:${escapeText(vcard.sortString)}`);
  }

  // SOUND (OPTIONAL)
  if (vcard.sound !== undefined) {
    lines.push(...formatMedia('SOUND', vcard.sound));
  }

  // UID (OPTIONAL)
  if (vcard.uid !== undefined) {
    lines.push(`UID${charsetParam}:${escapeText(vcard.uid)}`);
  }

  // URL(s) (OPTIONAL)
  // - RFC 2426: URL itself has no parameters, but group prefixes are allowed.
  // - iOS: labels for URLs are commonly supported via the Apple extension `X-ABLabel`.
  if (vcard.urls !== undefined && vcard.urls.length > 0) {
    lines.push(...formatUrlsForApple(vcard.urls));
  }

  // Keep the legacy single URL field as a plain URL line.
  // If it duplicates an entry in `urls`, omit it to avoid double display.
  if (vcard.url !== undefined) {
    const alreadyPresent = vcard.urls?.some((u) => u.value === vcard.url) ?? false;
    if (!alreadyPresent) {
      lines.push(`URL:${vcard.url}`);
    }
  }

  // CLASS (OPTIONAL)
  if (vcard.class !== undefined) {
    lines.push(`CLASS:${vcard.class}`);
  }

  // KEY (OPTIONAL)
  if (vcard.key !== undefined) {
    lines.push(...formatMedia('KEY', vcard.key));
  }

  // Custom Properties (X- properties per RFC 2426)
  if (vcard.customProperties !== undefined && vcard.customProperties.length > 0) {
    for (const prop of vcard.customProperties) {
      let line = prop.name.toUpperCase();

      // Add parameters if present
      const params: Record<string, string> = {
        ...(charset !== undefined ? { charset } : {}),
        ...(prop.params ?? {}),
      };

      if (Object.keys(params).length > 0) {
        const rendered = Object.entries(params)
          .map(([key, value]) => `${key.toUpperCase()}=${escapeParamValue(value)}`)
          .join(';');
        line += `;${rendered}`;
      }

      line += `:${escapeText(prop.value)}`;
      lines.push(line);
    }
  }

  // END (REQUIRED)
  lines.push('END:VCARD');

  // Fold lines longer than 75 characters
  return lines.map(foldLine).join('\r\n');
}

function formatUrlsForApple(urls: Url[]): string[] {
  const lines: string[] = [];

  urls.forEach((entry, index) => {
    const group = `item${(index + 1).toString()}`;
    lines.push(`${group}.URL:${entry.value}`);

    if (entry.type !== undefined && entry.type.trim() !== '') {
      // iOS label; value is TEXT and must be escaped.
      lines.push(`${group}.X-ABLabel:${escapeText(entry.type)}`);
    }
  });

  return lines;
}

/**
 * Format the N (Name) property
 */
function formatName(name: Name, charsetParam: string): string {
  const familyName = name.familyName !== undefined ? escapeText(name.familyName) : '';
  const givenName = name.givenName !== undefined ? escapeText(name.givenName) : '';
  const additionalNames =
    name.additionalNames !== undefined && name.additionalNames.length > 0
      ? name.additionalNames.map(escapeText).join(',')
      : '';
  const prefixes =
    name.honorificPrefixes !== undefined && name.honorificPrefixes.length > 0
      ? name.honorificPrefixes.map(escapeText).join(',')
      : '';
  const suffixes =
    name.honorificSuffixes !== undefined && name.honorificSuffixes.length > 0
      ? name.honorificSuffixes.map(escapeText).join(',')
      : '';

  return `N${charsetParam}:${familyName};${givenName};${additionalNames};${prefixes};${suffixes}`;
}

/**
 * Format the ADR (Address) property
 */
function formatAddress(address: Address, charsetParam: string): string {
  const typeParam = address.types !== undefined && address.types.length > 0 ? `;TYPE=${address.types.join(',')}` : '';

  const poBox = address.postOfficeBox !== undefined ? escapeText(address.postOfficeBox) : '';
  const extAddr = address.extendedAddress !== undefined ? escapeText(address.extendedAddress) : '';
  const street = address.street !== undefined ? escapeText(address.street) : '';
  const locality = address.locality !== undefined ? escapeText(address.locality) : '';
  const region = address.region !== undefined ? escapeText(address.region) : '';
  const postalCode = address.postalCode !== undefined ? escapeText(address.postalCode) : '';
  const country = address.country !== undefined ? escapeText(address.country) : '';

  return `ADR${typeParam}${charsetParam}:${poBox};${extAddr};${street};${locality};${region};${postalCode};${country}`;
}

/**
 * Format the TEL (Telephone) property
 */
function formatTelephone(tel: Phone): string {
  const typeParam = tel.types !== undefined && tel.types.length > 0 ? `;TYPE=${tel.types.join(',')}` : '';
  return `TEL${typeParam}:${tel.value}`;
}

/**
 * Format the EMAIL property
 */
function formatEmail(email: Email, charsetParam: string): string {
  const typeParam = email.types !== undefined && email.types.length > 0 ? `;TYPE=${email.types.join(',')}` : '';
  return `EMAIL${typeParam}${charsetParam}:${escapeText(email.value)}`;
}

/**
 * Format media properties (PHOTO, LOGO, SOUND, KEY)
 */
function formatMedia(propertyName: string, media: Media): string[] {
  const lines: string[] = [];

  // KEY is special in RFC 2426: it supports text or inline binary, not uri.
  if (propertyName === 'KEY') {
    if (media.uri !== undefined) {
      // Treat uri as a plain text key value (e.g., a URL string). Do NOT emit VALUE=uri.
      lines.push(`KEY:${escapeText(media.uri)}`);
      return lines;
    }

    const typeParam = media.mediaType !== undefined ? `;TYPE=${media.mediaType}` : '';
    lines.push(`KEY;ENCODING=b${typeParam}:${media.value}`);
    return lines;
  }

  if (media.uri !== undefined) {
    // URI reference
    const typeParam = media.mediaType !== undefined ? `;TYPE=${media.mediaType}` : '';
    lines.push(`${propertyName};VALUE=uri${typeParam}:${media.uri}`);
  } else {
    // Inline binary data
    const typeParam = media.mediaType !== undefined ? `;TYPE=${media.mediaType}` : '';
    // RFC 2426 requires ENCODING=b for inline binary values.
    lines.push(`${propertyName};ENCODING=b${typeParam}:${media.value}`);
  }

  return lines;
}
