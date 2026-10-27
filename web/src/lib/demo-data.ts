import { questions, type Answer } from "../app/diagnosis/questions";
import type { DummyCompany, QuestionId } from "../app/diagnosis/recommendations";

export const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
] as const;

export const schoolTypes = ["大学", "短大", "専門学校", "高校卒"] as const;
export const scoredQuestions = questions.filter((question) => question.id !== "commute");

export type DemoProfile = {
  graduationYear: number;
  schoolType: string;
  age: number | null;
  schoolName: string;
  major: string | null;
  workLocation: string;
  minimumMonthlySalaryYen: number | null;
  gender: string | null;
  hobbies: string | null;
};

export type DemoConditions = Pick<DemoProfile, "workLocation" | "minimumMonthlySalaryYen">;

export type DemoCompany = DummyCompany & {
  id: string;
  industry: string | null;
  description: string | null;
  location: string;
  monthlySalaryYen: number;
  holidays: string | null;
  plannedHires: number | null;
  workStyle: string | null;
  benefits: string | null;
  applicationUrl: string | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
};

type DemoSavedCompany = { id: string; name: string };
type JsonRecord = Record<string, unknown>;

function record(value: unknown): value is JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, max: number, required = false): value is string {
  return typeof value === "string" && value.length <= max && (!required || value.trim().length > 0);
}

function optionalText(value: unknown, max: number): value is string | null {
  return value === null || text(value, max, true);
}

export function nullableFormText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

function optionalNumber(value: unknown, min: number, max: number): value is number | null {
  return value === null || (typeof value === "number" && Number.isInteger(value) && value >= min && value <= max);
}

export function isDemoProfile(value: unknown): value is DemoProfile {
  if (!record(value)) return false;
  return optionalNumber(value.graduationYear, 2020, 2100) && value.graduationYear !== null
    && typeof value.schoolType === "string" && schoolTypes.includes(value.schoolType as typeof schoolTypes[number])
    && optionalNumber(value.age, 15, 100)
    && text(value.schoolName, 120, true) && optionalText(value.major, 120)
    && typeof value.workLocation === "string" && prefectures.includes(value.workLocation as typeof prefectures[number])
    && optionalNumber(value.minimumMonthlySalaryYen, 0, 10_000_000)
    && (value.gender === null || (typeof value.gender === "string" && ["女性", "男性", "その他"].includes(value.gender)))
    && optionalText(value.hobbies, 1000);
}

export function isDemoConditions(value: unknown): value is DemoConditions {
  return record(value) && typeof value.workLocation === "string"
    && prefectures.includes(value.workLocation as typeof prefectures[number])
    && optionalNumber(value.minimumMonthlySalaryYen, 0, 10_000_000);
}

export function isDemoCompany(value: unknown): value is DemoCompany {
  if (!record(value)) return false;
  if (!text(value.id, 64, true) || !value.id.startsWith("demo-")) return false;
  if (!text(value.name, 120, true) || !optionalText(value.industry, 120) || !optionalText(value.description, 2000)) return false;
  if (typeof value.location !== "string" || !prefectures.includes(value.location as typeof prefectures[number])) return false;
  if (!optionalNumber(value.monthlySalaryYen, 0, 10_000_000) || value.monthlySalaryYen === null) return false;
  if (!optionalText(value.holidays, 120) || !optionalNumber(value.plannedHires, 0, 100_000)) return false;
  if (!optionalText(value.workStyle, 2000) || !optionalText(value.benefits, 2000)) return false;
  if (!optionalText(value.applicationUrl, 2000) || !optionalText(value.sourceUrl, 2000) || !optionalText(value.verifiedAt, 20)) return false;
  if (typeof value.recruitingGraduates !== "boolean" || !record(value.ratings)) return false;
  return scoredQuestions.every((question) => {
    const rating = (value.ratings as JsonRecord)[question.id];
    return typeof rating === "number" && Number.isInteger(rating) && rating >= 1 && rating <= 5;
  });
}

function key(userId: string, kind: string): string {
  return `company-mbti-demo:${encodeURIComponent(userId)}:${kind}`;
}

function read<T>(storage: Storage, userId: string, kind: string, valid: (value: unknown) => value is T, fallback: T): T {
  const raw = storage.getItem(key(userId, kind));
  if (raw === null) return fallback;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("デモデータを読み込めませんでした。保存データを確認してください。");
  }
  if (!valid(parsed)) throw new Error("デモデータの形式が正しくありません。保存データを確認してください。");
  return parsed;
}

function write(storage: Storage, userId: string, kind: string, value: unknown): void {
  storage.setItem(key(userId, kind), JSON.stringify(value));
}

export function loadDemoProfile(storage: Storage, userId: string): DemoProfile | null {
  return read(storage, userId, "profile", (value): value is DemoProfile | null => value === null || isDemoProfile(value), null);
}

export function saveDemoProfile(storage: Storage, userId: string, profile: DemoProfile): void {
  if (!isDemoProfile(profile)) throw new Error("プロフィールの入力内容が正しくありません。");
  write(storage, userId, "profile", profile);
}

export function loadDemoCompanies(storage: Storage, userId: string): DemoCompany[] {
  return read(storage, userId, "companies", (value): value is DemoCompany[] => Array.isArray(value) && value.every(isDemoCompany), []);
}

export function saveDemoCompanies(storage: Storage, userId: string, companies: DemoCompany[]): void {
  if (!companies.every(isDemoCompany)) throw new Error("企業の入力内容が正しくありません。");
  write(storage, userId, "companies", companies);
}

export function loadDemoSavedCompanies(storage: Storage, userId: string): DemoSavedCompany[] {
  return read(storage, userId, "saved", (value): value is DemoSavedCompany[] => Array.isArray(value) && value.every((item) => record(item) && text(item.id, 64, true) && text(item.name, 120, true)), []);
}

export function saveDemoSavedCompany(storage: Storage, userId: string, company: DemoSavedCompany): void {
  if (!company.id.startsWith("demo-") || !text(company.name, 120, true)) throw new Error("企業が正しくありません。");
  const saved = loadDemoSavedCompanies(storage, userId);
  if (saved.some((item) => item.id === company.id)) return;
  write(storage, userId, "saved", [company, ...saved]);
}

export function ratingsFromForm(form: FormData): Partial<Record<QuestionId, Answer>> {
  return Object.fromEntries(scoredQuestions.map((question) => [question.id, Number(form.get(`rating-${question.id}`)) as Answer]));
}
