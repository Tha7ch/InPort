import test from "node:test";
import assert from "node:assert/strict";
import { validateDrinkProfile, restaurantSaveError } from "../lib/drink-profile.ts";
const valid = { beer: { min: 5, max: 8 }, sourceUrl: "https://example.com/menu", checkedAt: "2026-11-08" };
test("accepts partial, single-price, unknown and cleared profiles", () => {
  for (const value of [valid, { ...valid, beer: { min: 5, max: 5 } }, undefined, null]) assert.equal(validateDrinkProfile(value), null);
});
test("rejects nonfinite, reversed, zero, negative and incomplete ranges", () => {
  for (const range of [{min:NaN,max:8},{min:5,max:Infinity},{min:8,max:5},{min:0,max:8},{min:-1,max:8},{min:5},{min:"5",max:8},null]) assert.ok(validateDrinkProfile({...valid,beer:range}));
});
test("requires a safe source and real calendar date", () => {
  for (const sourceUrl of ["javascript:alert(1)","http://example.com","https://user:pass@example.com","not a URL"]) assert.ok(validateDrinkProfile({...valid,sourceUrl}));
  for (const checkedAt of ["2026-02-30","2026-13-01","2026-1-01",""]) assert.ok(validateDrinkProfile({...valid,checkedAt}));
  assert.equal(validateDrinkProfile({...valid,checkedAt:"2024-02-29"}),null);
});
test("rejects empty profiles and oversized coverage", () => {
  assert.ok(validateDrinkProfile({sourceUrl:valid.sourceUrl,checkedAt:valid.checkedAt}));
  assert.ok(validateDrinkProfile({...valid,coverage:"x".repeat(1001)}));
  assert.ok(validateDrinkProfile([]));
});
test("schema error is actionable without exposing database details", () => {
  assert.match(restaurantSaveError({code:"42703"}),/migration/);
  assert.equal(restaurantSaveError(new Error("private database value")),"Could not save the restaurant. Please try again.");
});
