import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import nextEnv from "@next/env";
import mysql from "mysql2/promise";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(webRoot);
const baseUrl = process.env.BETTER_AUTH_URL;
if (!baseUrl) throw new Error("BETTER_AUTH_URL を設定してください。");

const emails = [0, 1].map(() => `android-api-${randomUUID()}@example.com`);
const password = randomBytes(24).toString("base64url");
const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT ?? "3306"),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

async function request(pathname, { method = "GET", token, body } = {}) {
  const response = await fetch(new URL(pathname, baseUrl), {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body ? { "content-type": "application/json" } : {}),
      origin: baseUrl,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  return { response, data: response.headers.get("content-type")?.includes("application/json") ? JSON.parse(text) : text };
}

async function signUp(email) {
  const { response } = await request("/api/auth/sign-up/email", {
    method: "POST", body: { name: "デモ学生", email, password },
  });
  assert.equal(response.status, 200, `登録HTTP ${response.status}`);
  const token = response.headers.get("set-auth-token");
  assert.ok(token, "Bearerトークンがありません。");
  return token;
}

try {
  const questionsResult = await request("/api/v1/questions");
  assert.equal(questionsResult.response.status, 200);
  assert.equal(questionsResult.data.questions.length, 12);
  assert.equal((await request("/api/v1/conditions")).response.status, 401);
  assert.equal((await request("/api/v1/conditions", { token: "invalid-token" })).response.status, 401);

  const firstToken = await signUp(emails[0]);
  const secondToken = await signUp(emails[1]);
  const conditions = { workLocation: "東京都", minimumMonthlySalaryYen: 250000 };
  assert.equal((await request("/api/v1/conditions", { method: "PUT", token: firstToken, body: conditions })).response.status, 200);
  assert.deepEqual((await request("/api/v1/conditions", { token: firstToken })).data.conditions, conditions);
  assert.equal((await request("/api/v1/conditions", { token: secondToken })).data.conditions, null);

  assert.equal((await request("/api/v1/profile")).response.status, 401);
  const emptyProfile = await request("/api/v1/profile", { token: firstToken });
  assert.equal(emptyProfile.data.profile, null);
  assert.ok(emptyProfile.data.options.prefectures.includes("東京都"));
  assert.ok(emptyProfile.data.options.schoolTypes.includes("専門学校"));
  const profile = {
    graduationYear: 2028, schoolType: "専門学校", age: 20,
    schoolName: "架空デモ専門学校", major: "情報技術", gender: null, hobbies: "読書",
    workLocation: "東京都", minimumMonthlySalaryYen: 240000,
  };
  assert.equal((await request("/api/v1/profile", { method: "PUT", token: firstToken,
    body: { ...profile, graduationYear: 1900 } })).response.status, 400);
  assert.equal((await request("/api/v1/profile", { method: "PUT", token: firstToken,
    body: { ...profile, schoolType: "架空" } })).response.status, 400);
  assert.equal((await request("/api/v1/profile", { method: "PUT", token: firstToken, body: profile })).response.status, 200);
  assert.deepEqual((await request("/api/v1/profile", { token: firstToken })).data.profile, profile);
  assert.equal((await request("/api/v1/profile", { token: secondToken })).data.profile, null);
  assert.deepEqual((await request("/api/v1/conditions", { token: firstToken })).data.conditions,
    { workLocation: profile.workLocation, minimumMonthlySalaryYen: profile.minimumMonthlySalaryYen });

  const answers = Object.fromEntries(questionsResult.data.questions.map((question) => [question.id, 3]));
  assert.equal((await request("/api/v1/diagnoses", { method: "POST", token: firstToken, body: { answers: { ...answers, training: 6 } } })).response.status, 400);
  const created = await request("/api/v1/diagnoses", { method: "POST", token: firstToken, body: { answers } });
  assert.equal(created.response.status, 201);
  assert.ok(created.data.diagnosisId);
  assert.ok(Array.isArray(created.data.recommendations));
  assert.equal((await request(`/api/v1/diagnoses/${created.data.diagnosisId}`, { token: firstToken })).response.status, 200);
  assert.equal((await request(`/api/v1/diagnoses/${created.data.diagnosisId}`, { token: secondToken })).response.status, 404);
  assert.equal((await request("/api/v1/diagnoses/latest", { token: firstToken })).data.diagnosis.diagnosisId, created.data.diagnosisId);
  assert.equal((await request("/api/v1/diagnoses/latest", { token: secondToken })).data.diagnosis, null);

  const recommendedId = created.data.recommendations[0]?.id;
  assert.ok(recommendedId, "詳細・保存の検証に必要な提案がありません。");
  const detailPath = `/api/v1/diagnoses/${created.data.diagnosisId}/companies/${recommendedId}`;
  const detail = await request(detailPath, { token: firstToken });
  assert.equal(detail.response.status, 200);
  assert.equal(detail.data.company.id, recommendedId);
  assert.deepEqual(detail.data.company.reasons, created.data.recommendations[0].reasons);
  assert.equal(detail.data.company.sourceUrl, null);
  assert.equal(detail.data.company.verifiedAt, null);
  assert.equal(detail.data.company.applicationUrl, null);
  assert.equal((await request(detailPath, { token: secondToken })).response.status, 404);
  assert.equal((await request(`/api/v1/diagnoses/${created.data.diagnosisId}/companies/sample-closed`, { token: firstToken })).response.status, 404);

  assert.deepEqual((await request("/api/v1/saved-companies", { token: firstToken })).data.companies, []);
  assert.equal((await request("/api/v1/saved-companies", { method: "POST", token: firstToken,
    body: { diagnosisId: created.data.diagnosisId, companyId: "sample-closed" } })).response.status, 404);
  assert.equal((await request("/api/v1/saved-companies", { method: "POST", token: secondToken,
    body: { diagnosisId: created.data.diagnosisId, companyId: recommendedId } })).response.status, 404);
  const saved = await request("/api/v1/saved-companies", { method: "POST", token: firstToken,
    body: { diagnosisId: created.data.diagnosisId, companyId: recommendedId } });
  assert.equal(saved.response.status, 200);
  assert.deepEqual((await request("/api/v1/saved-companies", { token: firstToken })).data.companies,
    [{ id: recommendedId, name: created.data.recommendations[0].name, diagnosisId: created.data.diagnosisId }]);
  assert.deepEqual((await request("/api/v1/saved-companies", { token: secondToken })).data.companies, []);
  assert.equal((await request(`/api/v1/saved-companies/${recommendedId}`, { token: firstToken })).response.status, 200);
  assert.equal((await request(`/api/v1/saved-companies/${recommendedId}`, { token: secondToken })).response.status, 404);
  await connection.execute(
    "UPDATE saved_company AS saved JOIN user AS account ON account.id = saved.user_id SET saved.diagnosis_id = NULL WHERE account.email = ? AND saved.company_id = ?",
    [emails[0], recommendedId],
  );
  const legacySaved = await request("/api/v1/saved-companies", { token: firstToken });
  assert.equal(legacySaved.data.companies[0].diagnosisId, null);
  const legacyDetail = await request(`/api/v1/saved-companies/${recommendedId}`, { token: firstToken });
  assert.deepEqual(legacyDetail.data.company.reasons, []);

  assert.equal((await request("/api/v1/conditions", { method: "PUT", token: firstToken, body: { ...conditions, minimumMonthlySalaryYen: 10_000_000 } })).response.status, 200);
  const empty = await request("/api/v1/diagnoses", { method: "POST", token: firstToken, body: { answers } });
  assert.equal(empty.response.status, 201);
  assert.deepEqual(empty.data.recommendations, []);
  assert.equal((await request("/api/auth/sign-out", { method: "POST", token: firstToken, body: {} })).response.status, 200);
  assert.equal((await request("/api/v1/conditions", { token: firstToken })).response.status, 401);
  console.log("Android API: 認証、本人分離、診断、企業詳細、保存、0社結果、ログアウトを確認しました。");
} finally {
  await connection.execute("DELETE FROM user WHERE email IN (?, ?)", emails);
  await connection.end();
}
