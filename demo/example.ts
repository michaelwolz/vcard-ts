/**
 * Example usage of vcard-ts library
 * This file demonstrates how to create various VCard 3.0 objects
 */

import { formatVCard, type VCard } from '../src/index.js';

// Example 1: Minimal VCard
console.log('=== Example 1: Minimal VCard ===\n');
const minimalVCard: VCard = {
  version: '3.0',
  formattedName: 'John Doe',
  name: {
    familyName: 'Doe',
    givenName: 'John',
  },
};
console.log(formatVCard(minimalVCard));
console.log('\n');

// Example 2: Business Contact
console.log('=== Example 2: Business Contact ===\n');
const businessContact: VCard = {
  version: '3.0',
  formattedName: 'Jane Smith',
  name: {
    familyName: 'Smith',
    givenName: 'Jane',
    honorificPrefixes: ['Ms.'],
    honorificSuffixes: ['MBA'],
  },
  organization: {
    name: 'Tech Corp',
    units: ['Engineering', 'Frontend'],
  },
  title: 'Senior Full Stack Developer',
  emails: [{ value: 'jane.smith@techcorp.com', types: ['internet', 'pref'] }],
  phones: [
    { value: '+1-555-0100', types: ['work', 'voice'] },
    { value: '+1-555-0101', types: ['work', 'cell'] },
  ],
  addresses: [
    {
      street: '100 Tech Plaza',
      locality: 'San Francisco',
      region: 'CA',
      postalCode: '94105',
      country: 'United States of America',
      types: ['work'],
    },
  ],
  url: 'https://techcorp.com/jane',
  note: 'Available Mon-Fri, 9am-5pm PST',
};
console.log(formatVCard(businessContact));
console.log('\n');

// Example 3: Personal Contact with Photo
console.log('=== Example 3: Personal Contact with Photo ===\n');
const personalContact: VCard = {
  version: '3.0',
  formattedName: 'Robert Johnson',
  name: {
    familyName: 'Johnson',
    givenName: 'Robert',
  },
  nickname: ['Bob', 'Bobby'],
  birthday: new Date('1990-06-15'),
  emails: [{ value: 'bob@example.com', types: ['internet'] }],
  phones: [
    { value: '+1-555-0200', types: ['home', 'voice'] },
    { value: '+1-555-0201', types: ['cell'] },
  ],
  addresses: [
    {
      street: '456 Elm Street',
      locality: 'Springfield',
      region: 'IL',
      postalCode: '62701',
      country: 'USA',
      types: ['home'],
    },
  ],
  photo: {
    uri: 'https://example.com/photos/bob.jpg',
    mediaType: 'JPEG',
  },
  categories: ['FRIENDS', 'PERSONAL'],
};
console.log(formatVCard(personalContact));
console.log('\n');

// Example 4: Contact with Geographic Information
console.log('=== Example 4: Contact with Geographic Information ===\n');
const contactWithGeo: VCard = {
  version: '3.0',
  formattedName: 'Alice Brown',
  name: {
    familyName: 'Brown',
    givenName: 'Alice',
  },
  emails: [{ value: 'alice@example.com', types: ['internet'] }],
  addresses: [
    {
      street: '789 Oak Avenue',
      locality: 'Mountain View',
      region: 'CA',
      postalCode: '94043',
      country: 'USA',
      types: ['work'],
    },
  ],
  geo: {
    latitude: 37.386013,
    longitude: -122.082932,
  },
  timezone: '-08:00',
};
console.log(formatVCard(contactWithGeo));
console.log('\n');

// Example 5: Complete VCard with All Fields
console.log('=== Example 5: Complete VCard ===\n');
const completeVCard: VCard = {
  version: '3.0',
  formattedName: 'Dr. Michael David Thompson Jr.',
  name: {
    familyName: 'Thompson',
    givenName: 'Michael',
    additionalNames: ['David'],
    honorificPrefixes: ['Dr.'],
    honorificSuffixes: ['Jr.'],
  },
  nickname: ['Mike'],
  birthday: new Date('1985-03-20'),
  organization: {
    name: 'Medical Center',
    units: ['Cardiology', 'Research'],
  },
  title: 'Chief Cardiologist',
  role: 'Physician',
  emails: [
    { value: 'm.thompson@medcenter.org', types: ['internet', 'pref'] },
    { value: 'mike@personal.com', types: ['internet'] },
  ],
  phones: [
    { value: '+1-555-0300', types: ['work', 'voice'] },
    { value: '+1-555-0301', types: ['work', 'fax'] },
    { value: '+1-555-0302', types: ['cell'] },
  ],
  addresses: [
    {
      street: '1000 Medical Drive',
      locality: 'Boston',
      region: 'MA',
      postalCode: '02115',
      country: 'USA',
      types: ['work'],
    },
    {
      street: '25 Residential Lane',
      locality: 'Cambridge',
      region: 'MA',
      postalCode: '02138',
      country: 'USA',
      types: ['home'],
    },
  ],
  url: 'https://medcenter.org/dr-thompson',
  categories: ['MEDICAL', 'CARDIOLOGY', 'RESEARCH'],
  note: 'Specializes in cardiovascular research.\nAvailable for consultations by appointment.',
  uid: 'urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  revision: new Date('2024-01-15T10:30:00Z'),
  class: 'PUBLIC',
};
console.log(formatVCard(completeVCard));
console.log('\n');

// Example 6: Multiple links with different types
console.log('=== Example 6: VCard with Multiple Links ===\n');
const vcardWithLinks: VCard = {
  version: '3.0',
  formattedName: 'Emily White',
  name: {
    familyName: 'White',
    givenName: 'Emily',
  },
  urls: [
    { value: 'https://linkedin.com/in/emilywhite', type: 'LinkedIn' },
    { value: 'https://emiliywhite.dev', type: 'Personal' },
  ],
};
console.log(formatVCard(vcardWithLinks, { charset: 'UTF-8' }));