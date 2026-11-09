import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeDrinkProfile, normalizeRestaurantDrinkStorage } from '../lib/drink-storage.ts';
import { getDrinkProfile } from '../lib/drinks.ts';
const row = { id: 'test', name: 'The Grog', operating_hours: null };
const saved = { beer: { min: 6, max: 9 }, sourceUrl: 'https://example.com/menu', checkedAt: '2026-11-09' };
test('untouched SQL or JSON null and absent columns retain researched fallback', () => {
  for (const value of [undefined, null]) {
    const normalized = normalizeRestaurantDrinkStorage({ ...row, drink_profile: value });
    assert.equal(normalized.drink_profile, undefined);
    assert.deepEqual(getDrinkProfile(normalized)?.wine, { min: 10, max: 16 });
  }
});
test('explicit clear marker roundtrips to UI null and suppresses curated fallback', () => {
  const encoded = JSON.parse(JSON.stringify(encodeDrinkProfile(null)));
  assert.deepEqual(encoded, { cleared: true });
  const normalized = normalizeRestaurantDrinkStorage({ ...row, drink_profile: encoded });
  assert.equal(normalized.drink_profile, null);
  assert.equal(getDrinkProfile(normalized), undefined);
  assert.equal(JSON.stringify(normalized).includes('cleared'), false);
});
test('saved profile roundtrips unchanged and normalization preserves other fields', () => {
  const input = { ...row, drink_profile: JSON.parse(JSON.stringify(encodeDrinkProfile(saved))) };
  const normalized = normalizeRestaurantDrinkStorage(input);
  assert.deepEqual(normalized.drink_profile, saved);
  assert.equal(normalized.id, row.id);
  assert.equal(normalized.name, row.name);
  assert.deepEqual(input.drink_profile, saved);
});
