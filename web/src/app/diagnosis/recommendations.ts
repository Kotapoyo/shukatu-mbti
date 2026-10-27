import { questions, type Answer } from "./questions";
import type { DemoConditions } from "../../lib/demo-data";

export type QuestionId = (typeof questions)[number]["id"];
export type DiagnosisAnswers = Record<QuestionId, Answer>;

export type Recommendation = {
  id: string;
  name: string;
  difference: number;
  reasons: string[];
};

export type DummyCompany = {
  id: string;
  name: string;
  recruitingGraduates: boolean | null;
  ratings: Partial<Record<QuestionId, Answer | null>>;
  location?: string | null;
  monthlySalaryYen?: number | null;
};

export const ANSWERS_STORAGE_KEY = "company-mbti-demo-answers";

// 通勤距離は学生の勤務地が決まらないと企業側の値を評価できないため、集計しない。
const scoredQuestions = questions.filter((question) => question.id !== "commute");

const reasonLabels: Record<QuestionId, string> = {
  "work-style": "仕事内容の好み",
  commute: "通勤距離の希望",
  training: "研修の重視度",
  teamwork: "チームで働く好み",
  remote: "リモート勤務の希望",
  relocation: "転勤に対する希望",
  motivation: "仕事のやりがい",
  "night-shift": "夜勤に対する希望",
  "customer-contact": "顧客との関わり方",
  autonomy: "仕事の進め方",
  "work-variety": "仕事の変化への希望",
  "career-breadth": "キャリアの広げ方",
};

export const dummyCompanies: readonly DummyCompany[] = [
  {
    id: "sample-tech",
    name: "サンプル情報技研株式会社",
    recruitingGraduates: true,
    location: "東京都",
    monthlySalaryYen: 260000,
    ratings: { "work-style": 1, training: 5, teamwork: 4, remote: 5, relocation: 5, motivation: 1, "night-shift": 4, "customer-contact": 2, autonomy: 4, "work-variety": 4, "career-breadth": 3 },
  },
  {
    id: "sample-service",
    name: "サンプル地域サービス株式会社",
    recruitingGraduates: true,
    location: "大阪府",
    monthlySalaryYen: 220000,
    ratings: { "work-style": 4, training: 4, teamwork: 5, remote: 1, relocation: 5, motivation: 5, "night-shift": 4, "customer-contact": 5, autonomy: 2, "work-variety": 3, "career-breadth": 5 },
  },
  {
    id: "sample-manufacturing",
    name: "サンプルものづくり株式会社",
    recruitingGraduates: true,
    location: "東京都",
    monthlySalaryYen: 230000,
    ratings: { "work-style": 5, training: 3, teamwork: 3, remote: 1, relocation: 2, motivation: 3, "night-shift": 2, "customer-contact": 1, autonomy: 3, "work-variety": 2, "career-breadth": 2 },
  },
  {
    id: "sample-closed",
    name: "サンプル募集終了株式会社",
    recruitingGraduates: false,
    location: "東京都",
    monthlySalaryYen: 250000,
    ratings: { "work-style": 3, training: 3, teamwork: 3, remote: 3, relocation: 3, motivation: 3, "night-shift": 3, "customer-contact": 3, autonomy: 3, "work-variety": 3, "career-breadth": 3 },
  },
  {
    id: "sample-unconfirmed",
    name: "サンプル評価未確認株式会社",
    recruitingGraduates: true,
    location: "東京都",
    monthlySalaryYen: 250000,
    ratings: { "work-style": null, training: 3, teamwork: 3, remote: 3, relocation: 3, motivation: 3, "night-shift": 3, "customer-contact": 3, autonomy: 3, "work-variety": 3, "career-breadth": 3 },
  },
];

export function isDiagnosisAnswers(value: unknown): value is DiagnosisAnswers {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const answers = value as Record<string, unknown>;
  return questions.every((question) => {
    const answer = answers[question.id];
    return typeof answer === "number" && Number.isInteger(answer) && answer >= 1 && answer <= 5;
  });
}

export function recommendCompanies(
  answers: DiagnosisAnswers,
  companies: readonly DummyCompany[] = dummyCompanies,
  profile: DemoConditions | null = null,
): Recommendation[] {
  return companies
    .flatMap((company, order) => {
      if (company.recruitingGraduates !== true) return [];
      if (profile && company.location !== profile.workLocation) return [];
      if (profile?.minimumMonthlySalaryYen !== null && profile?.minimumMonthlySalaryYen !== undefined &&
          (company.monthlySalaryYen === null || company.monthlySalaryYen === undefined || company.monthlySalaryYen < profile.minimumMonthlySalaryYen)) return [];
      const differences = scoredQuestions.map((question, questionOrder) => {
        const rating = company.ratings[question.id];
        if (rating === null || rating === undefined) return null;
        return { questionOrder, label: reasonLabels[question.id], value: Math.abs(answers[question.id] - rating) };
      });
      if (differences.some((difference) => difference === null)) return [];
      const validDifferences = differences.filter((difference) => difference !== null);
      const difference = validDifferences.reduce((total, item) => total + item.value, 0);
      const reasons = validDifferences
        .sort((a, b) => a.value - b.value || a.questionOrder - b.questionOrder)
        .slice(0, 2)
        .map((item) => `${item.label}が近い`);
      return [{ id: company.id, name: company.name, difference, reasons, order }];
    })
    .sort((a, b) => a.difference - b.difference || a.order - b.order)
    .slice(0, 2)
    .map(({ order: _order, ...recommendation }) => recommendation);
}
