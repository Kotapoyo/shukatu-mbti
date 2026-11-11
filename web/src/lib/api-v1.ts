import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { isDemoConditions, type DemoConditions } from "@/lib/demo-data";
import { isDiagnosisAnswers, type DiagnosisAnswers } from "@/app/diagnosis/recommendations";

export async function sessionUserId(request: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user.id ?? null;
}

export function allowedWriteOrigin(request: NextRequest): boolean {
  if (request.headers.get("authorization")?.startsWith("Bearer ")) return true;
  return request.headers.get("origin") === request.nextUrl.origin;
}

export async function jsonBody(request: NextRequest): Promise<unknown | undefined> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export function conditionsFromBody(value: unknown): DemoConditions | null {
  if (!isDemoConditions(value)) return null;
  return { workLocation: value.workLocation, minimumMonthlySalaryYen: value.minimumMonthlySalaryYen };
}

export function answersFromBody(value: unknown): DiagnosisAnswers | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const answers = (value as Record<string, unknown>).answers;
  return isDiagnosisAnswers(answers) ? answers : null;
}

export const privateNoStore = { "Cache-Control": "private, no-store" };
