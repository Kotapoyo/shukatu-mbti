import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/auth";
import { allowedWriteOrigin, conditionsFromBody, jsonBody, privateNoStore, sessionUserId } from "@/lib/api-v1";

type ConditionRow = RowDataPacket & {
  work_location: string;
  minimum_monthly_salary_yen: number | null;
};

export async function GET(request: NextRequest) {
  const userId = await sessionUserId(request);
  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });

  const [rows] = await db.execute<ConditionRow[]>(
    "SELECT work_location, minimum_monthly_salary_yen FROM student_condition WHERE user_id = ?",
    [userId],
  );
  const row = rows[0];
  const conditions = row ? {
    workLocation: row.work_location,
    minimumMonthlySalaryYen: row.minimum_monthly_salary_yen,
  } : null;
  return NextResponse.json({ conditions }, { headers: privateNoStore });
}

export async function PUT(request: NextRequest) {
  if (!allowedWriteOrigin(request)) return NextResponse.json({ error: "許可されていない送信元です。" }, { status: 403 });
  const userId = await sessionUserId(request);
  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });

  const conditions = conditionsFromBody(await jsonBody(request));
  if (!conditions) return NextResponse.json({ error: "希望条件が正しくありません。" }, { status: 400 });

  await db.execute(
    "INSERT INTO student_condition (user_id, work_location, minimum_monthly_salary_yen) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE work_location = VALUES(work_location), minimum_monthly_salary_yen = VALUES(minimum_monthly_salary_yen)",
    [userId, conditions.workLocation, conditions.minimumMonthlySalaryYen],
  );
  return NextResponse.json({ conditions }, { headers: privateNoStore });
}
