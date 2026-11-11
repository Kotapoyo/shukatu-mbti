import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/auth";
import { allowedWriteOrigin, answersFromBody, jsonBody, privateNoStore, sessionUserId } from "@/lib/api-v1";
import { dummyCompanies, recommendCompanies } from "@/app/diagnosis/recommendations";

type ConditionRow = RowDataPacket & {
  work_location: string;
  minimum_monthly_salary_yen: number | null;
};

export async function POST(request: NextRequest) {
  if (!allowedWriteOrigin(request)) return NextResponse.json({ error: "許可されていない送信元です。" }, { status: 403 });
  const userId = await sessionUserId(request);
  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });

  const answers = answersFromBody(await jsonBody(request));
  if (!answers) return NextResponse.json({ error: "診断回答が正しくありません。" }, { status: 400 });

  const [rows] = await db.execute<ConditionRow[]>(
    "SELECT work_location, minimum_monthly_salary_yen FROM student_condition WHERE user_id = ?",
    [userId],
  );
  const row = rows[0];
  const conditions = row ? {
    workLocation: row.work_location,
    minimumMonthlySalaryYen: row.minimum_monthly_salary_yen,
  } : null;
  const recommendations = recommendCompanies(answers, dummyCompanies, conditions);
  const diagnosisId = randomUUID();
  await db.execute(
    "INSERT INTO diagnosis (id, user_id, answers_json, recommendations_json) VALUES (?, ?, ?, ?)",
    [diagnosisId, userId, JSON.stringify(answers), JSON.stringify(recommendations)],
  );
  return NextResponse.json({ diagnosisId, recommendations }, { status: 201, headers: privateNoStore });
}
