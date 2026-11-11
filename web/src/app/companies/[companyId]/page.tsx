import type { Metadata } from "next";
import CompanyDetails from "./CompanyDetails";

export const metadata: Metadata = { title: "企業詳細 | 企業MBTI" };

export default async function CompanyDetailPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  return <CompanyDetails companyId={companyId} />;
}
