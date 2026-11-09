import assert from 'node:assert/strict';
import test from 'node:test';
import { getPlaceResearch, getPlaceStatus, hasConfirmedDrinksMenu } from '../lib/place-research.ts';
import { getDrinkProfile } from '../lib/drinks.ts';
import { validateDrinkProfile } from '../lib/drink-profile.ts';
const place = name => ({ name, id: 'test', operating_hours: { monday: { open: '11:00', close: '21:00' } } });
test('current sourced menus provide independent ranges without inventing missing categories', () => {
  assert.deepEqual(getDrinkProfile(place("Michael’s Harborside"))?.beer, { min: 6, max: 12 });
  assert.deepEqual(getDrinkProfile(place('The Grog'))?.wine, { min: 10, max: 16 });
  assert.equal(getDrinkProfile(place('The Grog'))?.beer, undefined);
  assert.deepEqual(getDrinkProfile(place('Tuscan Sea Grill & Bar'))?.wine, { min: 12, max: 26 });
  assert.equal(getDrinkProfile(place('Port Vida'))?.wine, undefined);
  assert.deepEqual(getDrinkProfile(place('The Goat'))?.wine, { min: 10, max: 14 });
  assert.equal(getPlaceResearch(place('The Paddle Inn'))?.priceNotes?.wine, 'Market price');
  for (const name of ["Michael's Harborside", 'Smoke on the Water', 'Port Vida', 'The Goat', 'The Grog', 'Tuscan Sea Grill', 'The Paddle Inn', 'The Poynt']) assert.equal(validateDrinkProfile(getDrinkProfile(place(name))), null);
});
test('saved prices and explicit clearing retain priority over curated research', () => {
  assert.equal(getDrinkProfile({ ...place('The Grog'), drink_profile: null }), undefined);
  const saved = { beer: { min: 4, max: 8 }, sourceUrl: 'https://example.com/menu', checkedAt: '2026-11-09' };
  assert.deepEqual(getDrinkProfile({ ...place('The Grog'), drink_profile: saved }), saved);
  assert.equal(getDrinkProfile(place('The Grog in another city')), undefined);
});
test('Park Lunch drinks use published 1 AM bar close rather than saved kitchen close', () => {
  const now = new Date('2026-11-10T03:00:00Z');
  assert.equal(getPlaceStatus(place('Park Lunch'), 'food', now).state, 'closed');
  const bar = getPlaceStatus(place('Park Lunch'), 'drinks', now);
  assert.equal(bar.state, 'open');
  assert.match(bar.label, /Closes at 1 AM/);
});
test('seasonal closures override stale saved opening hours and expire to unknown', () => {
  const now = new Date('2026-11-09T17:00:00Z');
  assert.equal(getPlaceStatus(place('The Deck'), 'drinks', now).state, 'closed');
  assert.match(getPlaceStatus(place('Sunset Club'), 'food', now).label, /April 1, 2027/);
  assert.equal(getPlaceStatus(place('Sunset Club'), 'drinks', new Date('2027-04-01T17:00:00Z')).state, 'unknown');
});
test('unconfirmed cafes can be separated without claiming alcohol is unavailable', () => {
  assert.equal(hasConfirmedDrinksMenu(place('Angie\'s Food and Diner')), false);
  assert.equal(hasConfirmedDrinksMenu(place('Dunkin Donuts')), false);
  assert.equal(hasConfirmedDrinksMenu(place('Anchor Stone Deck Pizza')), true);
  assert.equal(hasConfirmedDrinksMenu(place('Metzy\'s')), true);
  assert.equal(hasConfirmedDrinksMenu({ ...place('Dunkin Donuts'), drink_profile: { beer: { min: 5, max: 8 } } }), true);
});

test('fresh restaurant schedules override stale saved hours while bar overrides retain priority', () => {
  const mondayLate = new Date('2026-11-10T02:30:00Z');
  const grog = getPlaceStatus(place('The Grog'), 'drinks', mondayLate);
  assert.equal(grog.state, 'open');
  assert.match(grog.label, /Closes at 10 PM/);
  assert.equal(getPlaceStatus(place('The Poynt'), 'food', new Date('2026-11-09T17:00:00Z')).state, 'closed');
  assert.match(getPlaceStatus(place('Park Lunch'), 'drinks', mondayLate).label, /Closes at 1 AM/);
});
test('research corrects Smoke location without inferring Monday closure or Poynt Sunday service gaps', () => {
  assert.equal(getPlaceResearch(place('Smoke on The Water'))?.displayAddress, 'Salisbury, MA');
  assert.equal(getPlaceStatus(place('Smoke on The Water'), 'food', new Date('2026-11-09T17:00:00Z')).state, 'unknown');
  assert.equal(getPlaceStatus(place('The Poynt'), 'drinks', new Date('2026-11-15T20:15:00Z')).state, 'unknown');
});
