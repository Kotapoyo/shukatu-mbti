import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/auth";
import { privateNoStore, sessionUserId } from "@/lib/api-v1";
import { demoCompanyDetail } from "@/lib/company-detail-api";

export async function GET(request: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  const userId = await sessionUserId(request);
  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  const { companyId } = await params;
  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT diagnosis_id FROM saved_company WHERE user_id = ? AND company_id = ?",
    [userId, companyId],
  );
  if (!rows.length) return NextResponse.json({ error: "保存企業が見つかりません。" }, { status: 404 });
  const company = demoCompanyDetail(companyId, [], null);
  if (!company) return NextResponse.json({ error: "企業が見つかりません。" }, { status: 404 });
  return NextResponse.json({ company }, { headers: privateNoStore });
}
