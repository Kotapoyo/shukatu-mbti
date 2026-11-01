import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { dummyCompanies } from "@/app/diagnosis/recommendations";
import { db } from "@/lib/auth";
import { allowedWriteOrigin, jsonBody, privateNoStore, sessionUserId } from "@/lib/api-v1";
import { findDiagnosis } from "@/lib/diagnosis-api";

type SavedRow = RowDataPacket & { company_id: string; diagnosis_id: string | null };

export async function GET(request: NextRequest) {
  const userId = await sessionUserId(request);
  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  const [rows] = await db.execute<SavedRow[]>(
    "SELECT company_id, diagnosis_id FROM saved_company WHERE user_id = ? ORDER BY saved_at DESC, company_id",
    [userId],
  );
  const companies = rows.map((row) => {
    const company = dummyCompanies.find((item) => item.id === row.company_id);
    if (!company) throw new Error(`保存企業IDがありません: ${row.company_id}`);
    return { id: company.id, name: company.name, diagnosisId: row.diagnosis_id };
  });
  return NextResponse.json({ companies }, { headers: privateNoStore });
}

export async function POST(request: NextRequest) {
  if (!allowedWriteOrigin(request)) return NextResponse.json({ error: "許可されていない送信元です。" }, { status: 403 });
  const userId = await sessionUserId(request);
  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  const body = await jsonBody(request);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "入力が正しくありません。" }, { status: 400 });
  }
  const { diagnosisId, companyId } = body as Record<string, unknown>;
  if (typeof diagnosisId !== "string" || typeof companyId !== "string") {
    return NextResponse.json({ error: "診断IDまたは企業IDが正しくありません。" }, { status: 400 });
  }
  const diagnosis = await findDiagnosis(userId, diagnosisId);
  if (!diagnosis?.recommendations.some((item) => item.id === companyId) ||
      !dummyCompanies.some((item) => item.id === companyId)) {
    return NextResponse.json({ error: "提案企業が見つかりません。" }, { status: 404 });
  }
  await db.execute(
    "INSERT INTO saved_company (user_id, company_id, diagnosis_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE diagnosis_id = VALUES(diagnosis_id)",
    [userId, companyId, diagnosisId],
  );
  return NextResponse.json({ saved: true, companyId, diagnosisId }, { headers: privateNoStore });
}
