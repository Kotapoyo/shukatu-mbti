import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { auth, db } from "@/lib/auth";
import { isDemoConditions } from "@/lib/demo-data";
import {
  dummyCompanies,
  isDiagnosisAnswers,
  recommendCompanies,
} from "@/app/diagnosis/recommendations";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });

  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT company_id FROM saved_company WHERE user_id = ? ORDER BY saved_at DESC, company_id",
    [session.user.id],
  );
  const companies = rows.map((row) => {
    const company = dummyCompanies.find((item) => item.id === row.company_id);
    if (!company) throw new Error(`保存企業IDがダミーデータにありません: ${row.company_id}`);
    return { id: company.id, name: company.name };
  });
  return NextResponse.json({ companies }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "許可されていない送信元です。" }, { status: 403 });
  }
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON形式で送信してください。" }, { status: 400 });
  }
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "入力が正しくありません。" }, { status: 400 });
  }
  const { companyId, answers, conditions } = body as Record<string, unknown>;
  if (typeof companyId !== "string" || !isDiagnosisAnswers(answers) ||
      (conditions !== undefined && conditions !== null && !isDemoConditions(conditions))) {
    return NextResponse.json({ error: "企業または診断回答が正しくありません。" }, { status: 400 });
  }
  if (!recommendCompanies(answers, dummyCompanies, conditions && isDemoConditions(conditions) ? conditions : null).some((company) => company.id === companyId)) {
    return NextResponse.json({ error: "今回の提案に含まれない企業です。" }, { status: 400 });
  }

  await db.execute(
    "INSERT INTO saved_company (user_id, company_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE saved_at = saved_at",
    [session.user.id, companyId],
  );
  return NextResponse.json({ saved: true, companyId });
}
