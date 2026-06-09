import assert from "node:assert/strict";
import test from "node:test";
import {
  PASSWORD_RESET_UPDATE_PATH,
  passwordResetRedirectUrl,
  validateNewPassword,
} from "./password-reset";

test("password reset helper keeps the Supabase redirect target stable", () => {
  assert.equal(PASSWORD_RESET_UPDATE_PATH, "/reset-password/update");
  assert.equal(
    passwordResetRedirectUrl("https://stationweb-production.up.railway.app/"),
    "https://stationweb-production.up.railway.app/reset-password/update"
  );
  assert.equal(
    passwordResetRedirectUrl("http://localhost:3000"),
    "http://localhost:3000/reset-password/update"
  );
});

test("password reset helper validates the new password before Supabase update", () => {
  assert.equal(validateNewPassword("", ""), "Enter and confirm your new password.");
  assert.equal(validateNewPassword("short", "short"), "Use at least 8 characters.");
  assert.equal(validateNewPassword("long-enough", "different"), "Passwords do not match.");
  assert.equal(validateNewPassword("long-enough", "long-enough"), null);
});
