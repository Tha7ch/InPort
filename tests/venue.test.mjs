import assert from 'node:assert/strict';
import test from 'node:test';
import { getVenueStatus } from '../lib/venue.ts';
import { getDrinkProfile } from '../lib/drinks.ts';

test('missing hours are unknown; explicit closed differs', () => {
  assert.equal(getVenueStatus(null).state, 'unknown');
  assert.equal(getVenueStatus({}, new Date('2026-11-09T17:00:00Z')).state, 'unknown');
  assert.equal(getVenueStatus({ monday: null }, new Date('2026-11-09T17:00:00Z')).state, 'closed');
});
test('uses Newburyport date and exclusive close boundary', () => {
  const hours = { monday: { open: '16:00', close: '21:00' } };
  assert.equal(getVenueStatus(hours, new Date('2026-11-10T01:00:00Z')).closingSoon, true);
  assert.equal(getVenueStatus(hours, new Date('2026-11-10T01:59:00Z')).state, 'open');
  assert.equal(getVenueStatus(hours, new Date('2026-11-10T02:00:00Z')).state, 'closed');
});
test('yesterday overnight remains open after midnight then closes', () => {
  const hours = { monday: { open: '17:00', close: '02:00' }, tuesday: null };
  assert.equal(getVenueStatus(hours, new Date('2026-11-10T06:30:00Z')).state, 'open');
  assert.equal(getVenueStatus(hours, new Date('2026-11-10T07:00:00Z')).state, 'closed');
});
test('midnight close and invalid same-time hours', () => {
  assert.equal(getVenueStatus({ monday: { open: '17:00', close: '00:00' }, tuesday: null }, new Date('2026-11-10T05:00:00Z')).state, 'closed');
  assert.equal(getVenueStatus({ monday: { open: '00:00', close: '00:00' } }, new Date('2026-11-09T17:00:00Z')).state, 'unknown');
});
test('known upcoming opening and invalid clock values', () => {
  assert.match(getVenueStatus({ monday: null, tuesday: { open: '16:00', close: '21:00' } }, new Date('2026-11-09T17:00:00Z')).label, /tomorrow at 4 PM/);
  assert.equal(getVenueStatus({ monday: { open: '25:00', close: '26:00' } }, new Date('2026-11-09T17:00:00Z')).state, 'unknown');
});
test('DST closing-soon uses real elapsed time', () => {
  assert.equal(getVenueStatus({ sunday: { open: '01:00', close: '03:30' } }, new Date('2026-03-08T06:30:00Z')).closingSoon, true);
  assert.equal(getVenueStatus({ sunday: { open: '00:00', close: '02:00' } }, new Date('2026-11-01T05:30:00Z')).closingSoon, false);
});
test('Poynt has source-backed partial ranges, no invented other prices', () => {
  const profile = getDrinkProfile({ id: '166c62ff-a404-42f6-bb9c-3cbdd3b5ad71', name: 'The Poynt' });
  assert.deepEqual(profile?.beer, { min: 5, max: 8 });
  assert.deepEqual(profile?.wine, { min: 13, max: 19 });
  assert.deepEqual(profile?.cocktails, { min: 15, max: 15 });
  assert.ok(profile?.coverage?.includes('drafts unpriced'));
  assert.equal(getDrinkProfile({ id: 'other', name: 'The Goat' }), undefined);
  assert.equal(getDrinkProfile({ id: 'other', name: 'The Poynt elsewhere' }), undefined);
});

import { isActiveDeal } from '../lib/deals.ts';
test('deals use Newburyport weekdays and exclusive endpoints', () => {
  const deal = { days: ['monday'], type: 'happy-hour', time_start: '16:00', time_end: '21:00' };
  assert.equal(isActiveDeal(deal, new Date('2026-11-10T01:00:00Z')), true);
  assert.equal(isActiveDeal(deal, new Date('2026-11-10T02:00:00Z')), false);
});
test('overnight deals match yesterday; recurring timed offers respect times', () => {
  assert.equal(isActiveDeal({ days: ['monday'], type: 'happy-hour', time_start: '22:00', time_end: '02:00' }, new Date('2026-11-10T06:00:00Z')), true);
  assert.equal(isActiveDeal({ days: ['monday'], type: 'recurring', time_start: '16:00', time_end: '18:00' }, new Date('2026-11-09T17:00:00Z')), false);
  assert.equal(isActiveDeal({ days: ['monday'], type: 'happy-hour', time_start: null, time_end: null }, new Date('2026-11-09T17:00:00Z')), false);
});

test('unknown intervening days do not imply confirmed next opening', () => {
  assert.match(getVenueStatus({ monday: null, friday: { open: '16:00', close: '21:00' } }, new Date('2026-11-09T17:00:00Z')).label, /Next known opening friday/);
});
test('valid saved prices override curated prices; invalid saved values are not shown', () => {
  const saved = { beer: { min: 6, max: 9 }, sourceUrl: 'https://example.com/menu', checkedAt: '2026-11-08' };
  assert.deepEqual(getDrinkProfile({ id: 'other', name: 'Other', drink_profile: saved }), saved);
  assert.equal(getDrinkProfile({ id: 'other', name: 'Other', drink_profile: { ...saved, beer: { min: 9, max: 6 } } }), undefined);
});

test('explicitly cleared Poynt profile suppresses curated fallback', () => {
  assert.equal(getDrinkProfile({ id: '166c62ff-a404-42f6-bb9c-3cbdd3b5ad71', name: 'The Poynt', drink_profile: null }), undefined);
  assert.ok(getDrinkProfile({ id: '166c62ff-a404-42f6-bb9c-3cbdd3b5ad71', name: 'The Poynt' }));
});
