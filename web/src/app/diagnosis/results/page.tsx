import ResultsView, { type ProposedCompany } from "./ResultsView";

// Explicit preview fixtures, not calculated recommendations or an API response.
const sampleCompanies: readonly ProposedCompany[] = [
  { id: "sample-a", name: "株式会社サンプルA", reasons: ["チームで協力する働き方", "研修の充実を重視"] },
  { id: "sample-b", name: "株式会社サンプルB", reasons: ["出社中心の働き方", "身近なサービスに関わる仕事"] },
];

export default async function ResultsPage({ searchParams }: { searchParams: Promise<{ preview?: string | string[] }> }) {
  // Design preview only. The future API can pass its empty array directly to ResultsView.
  const { preview } = await searchParams;
  return <ResultsView companies={preview === "empty" ? [] : sampleCompanies} />;
}
