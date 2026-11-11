import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/auth";
import type { Recommendation } from "@/app/diagnosis/recommendations";

type DiagnosisRow = RowDataPacket & {
  id: string;
  recommendations_json: string;
};

export type DiagnosisResponse = {
  diagnosisId: string;
  recommendations: Recommendation[];
};

function fromRow(row: DiagnosisRow): DiagnosisResponse {
  const recommendations: unknown = JSON.parse(row.recommendations_json);
  if (!Array.isArray(recommendations) || !recommendations.every((item) =>
    item && typeof item === "object" && typeof item.id === "string" && typeof item.name === "string" &&
    typeof item.difference === "number" && Array.isArray(item.reasons) &&
    item.reasons.every((reason: unknown) => typeof reason === "string"))) {
    throw new Error(`診断結果の保存形式が正しくありません: ${row.id}`);
  }
  return { diagnosisId: row.id, recommendations: recommendations as Recommendation[] };
}

export async function findDiagnosis(userId: string, diagnosisId: string): Promise<DiagnosisResponse | null> {
  const [rows] = await db.execute<DiagnosisRow[]>(
    "SELECT id, recommendations_json FROM diagnosis WHERE id = ? AND user_id = ?",
    [diagnosisId, userId],
  );
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function latestDiagnosis(userId: string): Promise<DiagnosisResponse | null> {
  const [rows] = await db.execute<DiagnosisRow[]>(
    "SELECT id, recommendations_json FROM diagnosis WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 1",
    [userId],
  );
  return rows[0] ? fromRow(rows[0]) : null;
}
