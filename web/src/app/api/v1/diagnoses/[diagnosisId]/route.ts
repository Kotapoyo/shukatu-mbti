import { NextRequest, NextResponse } from "next/server";
import { sessionUserId, privateNoStore } from "@/lib/api-v1";
import { findDiagnosis } from "@/lib/diagnosis-api";

export async function GET(request: NextRequest, context: { params: Promise<{ diagnosisId: string }> }) {
  const userId = await sessionUserId(request);
  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  const { diagnosisId } = await context.params;
  const diagnosis = await findDiagnosis(userId, diagnosisId);
  if (!diagnosis) return NextResponse.json({ error: "診断結果がありません。" }, { status: 404 });
  return NextResponse.json(diagnosis, { headers: privateNoStore });
}
