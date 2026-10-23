// Local design-preview data only; this does not define the shared API contract.
type PreviewCompany = {
  name: string;
  letter: string;
  description: string;
  reasons: readonly [string, string];
  teamwork: string | null;
  training: string | null;
  location: string | null;
  employeeCount: number | null;
  sourceUrl: string | null;
  checkedOn: string | null;
  applicationUrl: string | null;
};

export const sampleCompanies: Readonly<Record<string, PreviewCompany>> = {
  "sample-a": {
    name: "株式会社サンプルA", letter: "A",
    description: "暮らしを支えるサービスを提供しています（表示例）",
    reasons: ["チームで協力する働き方", "研修の充実を重視"],
    teamwork: "チーム中心（表示例）", training: "入社後研修あり（表示例）",
    location: null, employeeCount: null, sourceUrl: null, checkedOn: null, applicationUrl: null,
  },
  "sample-b": {
    name: "株式会社サンプルB", letter: "B",
    description: "身近なサービスを通じて暮らしを支えています（表示例）",
    reasons: ["出社中心の働き方", "身近なサービスに関わる仕事"],
    teamwork: null, training: null,
    location: null, employeeCount: null, sourceUrl: null, checkedOn: null, applicationUrl: null,
  },
};
