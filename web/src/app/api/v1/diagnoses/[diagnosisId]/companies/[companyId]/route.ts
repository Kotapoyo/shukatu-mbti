import { NextRequest, NextResponse } from "next/server";
import { privateNoStore, sessionUserId } from "@/lib/api-v1";
import { demoCompanyDetail } from "@/lib/company-detail-api";
import { findDiagnosis } from "@/lib/diagnosis-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ diagnosisId: string; companyId: string }> },
) {
  const userId = await sessionUserId(request);
  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  const { diagnosisId, companyId } = await params;
  const diagnosis = await findDiagnosis(userId, diagnosisId);
  const recommendation = diagnosis?.recommendations.find((item) => item.id === companyId);
  const company = recommendation && demoCompanyDetail(
    companyId, recommendation.reasons, recommendation.difference, recommendation.name,
  );
  if (!recommendation || !company) {
    return NextResponse.json({ error: "提案企業が見つかりません。" }, { status: 404 });
  }
  return NextResponse.json({ company }, { headers: privateNoStore });
}
