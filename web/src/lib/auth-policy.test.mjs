import assert from "node:assert/strict";
import test from "node:test";
import { isDemoEmail } from "./auth-policy.ts";

test("開発用の架空メールだけを受け付ける", () => {
  assert.equal(isDemoEmail("student@example.com"), true);
  assert.equal(isDemoEmail("STUDENT@EXAMPLE.COM"), true);
  assert.equal(isDemoEmail("student@gmail.com"), false);
  assert.equal(isDemoEmail("student@example.com.evil.test"), false);
  assert.equal(isDemoEmail("student@example.com "), false);
  assert.equal(isDemoEmail(undefined), false);
});
