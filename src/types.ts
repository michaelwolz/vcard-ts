/**
 * VCard 3.0 Type Definitions
 * Following RFC 2426 specification
 */

/**
 * Allowed values for the `TYPE` parameter on ADR/LABEL.
 *
 * RFC 2426: values are case-insensitive; these are the commonly used ones.
 */
export type AddressType = 'dom' | 'intl' | 'postal' | 'parcel' | 'home' | 'work' | 'pref';

/**
 * Structured address value for ADR.
 * Components map to: PO Box; Extended Address; Street; Locality; Region; Postal Code; Country.
 */
export type Address = {
  postOfficeBox?: string;
  extendedAddress?: string;
  street?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  types?: AddressType[];
};

/**
 * Allowed values for the `TYPE` parameter on TEL.
 * RFC 2426 allows additional IANA tokens / X- names.
 */
export type PhoneType =
  | 'home'
  | 'msg'
  | 'work'
  | 'pref'
  | 'voice'
  | 'fax'
  | 'cell'
  | 'video'
  | 'pager'
  | 'bbs'
  | 'modem'
  | 'car'
  | 'isdn'
  | 'pcs';

export type Phone = {
  value: string;
  types?: PhoneType[];
};

/**
 * Allowed values for the `TYPE` parameter on EMAIL.
 *
 * RFC 2426 allows IANA tokens and X- names; keep this unrestricted.
 */
/**
 * Email address property.
 * `types` are emitted as `EMAIL;TYPE=a,b:...`.
 */
export type Email = {
  value: string;
  types?: string[];
};

/**
 * Encoding for inline binary values.
 * RFC 2426 requires `ENCODING=b` for inline PHOTO/LOGO/SOUND/KEY binary.
 */
/**
 * Media value for PHOTO/LOGO/SOUND/KEY.
 * Use `uri` to reference external content, or `value` for inline binary.
 */
export type Media =
  | {
      value: string;
      mediaType?: string;
      encoding?: 'b';
      uri?: never;
    }
  | {
      value?: never;
      mediaType?: string;
      encoding?: never;
      uri: string;
    };

/**
 * Structured name value for N.
 * Components map to: Family; Given; Additional; Prefixes; Suffixes.
 */
export type Name = {
  familyName?: string;
  givenName?: string;
  additionalNames?: string[];
  honorificPrefixes?: string[];
  honorificSuffixes?: string[];
};

/** Geographic coordinates for GEO (latitude;longitude). */
export type Geo = {
  latitude: number;
  longitude: number;
};

/**
 * AGENT value.
 * RFC 2426 supports uri, text, or an embedded vCard value.
 */
export type Agent = {
  value?: string;
  uri?: string;
};

/** Access classification for CLASS. */
export type Classification = 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL';

/**
 * Custom extension property.
 * RFC 2426 allows non-standard properties prefixed with `X-`.
 */
export type CustomProperty = {
  name: string; // e.g., 'X-SOCIALPROFILE', 'X-TWITTER', etc.
  value: string;
  params?: Record<string, string>; // e.g., { type: 'twitter', userid: '@handle' }
};

/**
 * URL entry.
 *
 * If `type` is provided, it is used as an iOS label via `itemN.X-ABLabel`.
 * This is an Apple extension (not part of RFC 2426), but is widely supported on iOS.
 */
export type Url = {
  value: string;
  type?: string;
};

/**
 * Main vCard object.
 * RFC 2426 requires FN, N and VERSION.
 */
export type VCard = {
  // REQUIRED
  version: '3.0';
  formattedName: string;
  name: Name;

  // OPTIONAL - Character Set (for MIME Content-Type header)
  charset?: string;

  // OPTIONAL - Identification
  nickname?: string[];
  photo?: Media;
  birthday?: Date | string;

  // OPTIONAL - Delivery Addressing
  addresses?: Address[];
  labels?: { value: string; types?: AddressType[] }[];

  // OPTIONAL - Telecommunications
  phones?: Phone[];
  emails?: Email[];
  mailer?: string;

  // OPTIONAL - Geographical
  timezone?: string;
  geo?: Geo;

  // OPTIONAL - Organizational
  title?: string;
  role?: string;
  logo?: Media;
  agent?: Agent;
  organization?: { name?: string; units?: string[] };

  // OPTIONAL - Explanatory
  categories?: string[];
  note?: string;
  productId?: string;
  revision?: Date | string;
  sortString?: string;
  sound?: Media;
  url?: string;
  /**
   * Multiple URLs, optionally with labels.
   *
   * When present, the formatter emits grouped URL lines (`itemN.URL`) and, if `type` is set,
   * also emits `itemN.X-ABLabel` for iOS display labels.
   */
  urls?: Url[];
  uid?: string;

  // OPTIONAL - Security
  class?: Classification;
  key?: Media;

  // OPTIONAL - Custom Extension Properties (X- properties per RFC 2426)
  customProperties?: CustomProperty[];
};
