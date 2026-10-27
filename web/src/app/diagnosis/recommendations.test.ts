import assert from "node:assert/strict";
import test from "node:test";
import { questions, type Answer } from "./questions";
import {
  isDiagnosisAnswers,
  recommendCompanies,
  type DiagnosisAnswers,
  type DummyCompany,
  type QuestionId,
} from "./recommendations";

function answersWith(value: Answer): DiagnosisAnswers {
  return Object.fromEntries(questions.map((question) => [question.id, value])) as DiagnosisAnswers;
}

function ratingsWith(value: Answer): Partial<Record<QuestionId, Answer | null>> {
  return Object.fromEntries(questions.filter((question) => question.id !== "commute").map((question) => [question.id, value]));
}

test("新卒募集と評価が揃う企業から、評価差の小さい順に2社を選ぶ", () => {
  const companies: DummyCompany[] = [
    { id: "closed", name: "募集終了", recruitingGraduates: false, ratings: ratingsWith(3) },
    { id: "unknown", name: "評価未確認", recruitingGraduates: true, ratings: { ...ratingsWith(3), training: null } },
    { id: "far", name: "差が大きい", recruitingGraduates: true, ratings: ratingsWith(5) },
    { id: "exact", name: "一致", recruitingGraduates: true, ratings: ratingsWith(3) },
    { id: "near", name: "差が小さい", recruitingGraduates: true, ratings: ratingsWith(4) },
  ];

  const result = recommendCompanies(answersWith(3), companies);
  assert.deepEqual(result.map((company) => [company.id, company.difference]), [["exact", 0], ["near", 11]]);
  assert.equal(result[0].reasons.length, 2);
});

test("同点はダミーデータの登録順とし、候補がなければ空一覧にする", () => {
  const companies: DummyCompany[] = [
    { id: "first", name: "先", recruitingGraduates: true, ratings: ratingsWith(3) },
    { id: "second", name: "後", recruitingGraduates: true, ratings: ratingsWith(3) },
  ];

  assert.deepEqual(recommendCompanies(answersWith(3), companies).map((company) => company.id), ["first", "second"]);
  assert.deepEqual(recommendCompanies(answersWith(3), []), []);
});

test("回答を変えると、提案される架空企業も変わる", () => {
  assert.equal(recommendCompanies(answersWith(3))[0].id, "sample-manufacturing");
  assert.equal(recommendCompanies(answersWith(5))[0].id, "sample-service");
});

test("欠損や範囲外の回答を診断結果として扱わない", () => {
  assert.equal(isDiagnosisAnswers(answersWith(3)), true);
  assert.equal(isDiagnosisAnswers({ ...answersWith(3), training: 6 }), false);
  assert.equal(isDiagnosisAnswers({ training: 3 }), false);
});

test("希望勤務地と最低月給を満たす候補だけを採点し、0社なら空一覧にする", () => {
  const companies: DummyCompany[] = [
    { id: "near-wrong-place", name: "勤務地違い", recruitingGraduates: true, location: "大阪府", monthlySalaryYen: 300000, ratings: ratingsWith(3) },
    { id: "near-low-pay", name: "月給不足", recruitingGraduates: true, location: "東京都", monthlySalaryYen: 230000, ratings: ratingsWith(3) },
    { id: "matched", name: "条件一致", recruitingGraduates: true, location: "東京都", monthlySalaryYen: 250000, ratings: ratingsWith(4) },
    { id: "salary-unknown", name: "月給不明", recruitingGraduates: true, location: "東京都", monthlySalaryYen: null, ratings: ratingsWith(3) },
  ];
  const profile = { workLocation: "東京都", minimumMonthlySalaryYen: 250000 };
  assert.deepEqual(recommendCompanies(answersWith(3), companies, profile).map((company) => company.id), ["matched"]);
  assert.deepEqual(recommendCompanies(answersWith(3), companies, { ...profile, minimumMonthlySalaryYen: 350000 }), []);
  assert.deepEqual(recommendCompanies(answersWith(3), companies, { ...profile, minimumMonthlySalaryYen: 220000 }).map((company) => company.id), ["near-low-pay", "matched"]);
});

test("保存APIの再判定にも使う希望条件で、既存の3位企業を保存可能な候補へ繰り上げる", () => {
  const answers = answersWith(5);
  const conditions = { workLocation: "東京都", minimumMonthlySalaryYen: 200000 };
  assert.deepEqual(recommendCompanies(answers).map((company) => company.id), ["sample-service", "sample-tech"]);
  assert.deepEqual(recommendCompanies(answers, undefined, conditions).map((company) => company.id), ["sample-tech", "sample-manufacturing"]);
});
