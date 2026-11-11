import { dummyCompanies } from "@/app/diagnosis/recommendations";
import { companyDetailFields } from "@/lib/demo-data";

export function demoCompanyDetail(companyId: string, reasons: string[], difference: number | null, name?: string) {
  const company = dummyCompanies.find((item) => item.id === companyId);
  if (!company) return null;
  return {
    id: company.id,
    name: name ?? company.name,
    location: company.location ?? null,
    monthlySalaryYen: company.monthlySalaryYen ?? null,
    difference,
    reasons,
    details: Object.fromEntries(companyDetailFields.map(([field]) => [field, null])),
    sourceUrl: null,
    verifiedAt: null,
    applicationUrl: null,
  };
}
