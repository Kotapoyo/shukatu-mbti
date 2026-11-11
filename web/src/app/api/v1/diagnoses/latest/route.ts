import { NextRequest, NextResponse } from "next/server";
import { sessionUserId, privateNoStore } from "@/lib/api-v1";
import { latestDiagnosis } from "@/lib/diagnosis-api";

export async function GET(request: NextRequest) {
  const userId = await sessionUserId(request);
  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  return NextResponse.json({ diagnosis: await latestDiagnosis(userId) }, { headers: privateNoStore });
}
