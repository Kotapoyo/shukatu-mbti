import assert from "node:assert/strict";
import test from "node:test";
import { isDemoConditions, loadDemoCompanies, loadDemoProfile, loadDemoSavedCompanies, nullableFormText, saveDemoCompanies, saveDemoProfile, saveDemoSavedCompany, scoredQuestions, type DemoCompany, type DemoProfile } from "./demo-data";

function memoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() { return items.size; },
    clear() { items.clear(); },
    getItem(key) { return items.get(key) ?? null; },
    key(index) { return [...items.keys()][index] ?? null; },
    removeItem(key) { items.delete(key); },
    setItem(key, value) { items.set(key, value); },
  };
}

const profile: DemoProfile = { graduationYear: 2028, schoolType: "専門学校", age: 21, schoolName: "デモ学校", major: "情報", workLocation: "東京都", minimumMonthlySalaryYen: 250000, gender: null, hobbies: null };
const company: DemoCompany = {
  id: "demo-123", name: "デモ企業", industry: "IT", description: null, location: "東京都", monthlySalaryYen: 260000,
  holidays: null, plannedHires: null, workStyle: null, benefits: null, applicationUrl: null, sourceUrl: null, verifiedAt: null,
  recruitingGraduates: true, ratings: Object.fromEntries(scoredQuestions.map((question) => [question.id, 3])),
};

test("デモデータは利用者ごとに分離して保存できる", () => {
  const storage = memoryStorage();
  saveDemoProfile(storage, "student-a", profile);
  saveDemoCompanies(storage, "student-a", [company]);
  saveDemoSavedCompany(storage, "student-a", { id: company.id, name: company.name });
  assert.deepEqual(loadDemoProfile(storage, "student-a"), profile);
  assert.deepEqual(loadDemoCompanies(storage, "student-a"), [company]);
  assert.deepEqual(loadDemoSavedCompanies(storage, "student-a"), [{ id: company.id, name: company.name }]);
  assert.equal(loadDemoProfile(storage, "student-b"), null);
  assert.deepEqual(loadDemoCompanies(storage, "student-b"), []);
  assert.deepEqual(loadDemoSavedCompanies(storage, "student-b"), []);
});

test("不正な評価や破損した保存データを採用しない", () => {
  const storage = memoryStorage();
  assert.throws(() => saveDemoCompanies(storage, "student-a", [{ ...company, ratings: { ...company.ratings, training: 6 } } as unknown as DemoCompany]));
  storage.setItem("company-mbti-demo:student-a:profile", "{");
  assert.throws(() => loadDemoProfile(storage, "student-a"));
  assert.throws(() => saveDemoCompanies(storage, "student-a", [{ ...company, benefits: "" }]));
  assert.equal(nullableFormText("  "), null);
  assert.equal(nullableFormText(" 福利厚生 "), "福利厚生");
});

test("保存APIへ送る希望条件は勤務地と最低月給だけを検証する", () => {
  assert.equal(isDemoConditions({ workLocation: "東京都", minimumMonthlySalaryYen: 250000 }), true);
  assert.equal(isDemoConditions({ workLocation: "東京都", minimumMonthlySalaryYen: null }), true);
  assert.equal(isDemoConditions({ workLocation: "不明", minimumMonthlySalaryYen: 250000 }), false);
  assert.equal(isDemoConditions({ workLocation: "東京都", minimumMonthlySalaryYen: -1 }), false);
});
