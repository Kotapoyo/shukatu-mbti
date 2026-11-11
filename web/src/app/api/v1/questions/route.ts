import { NextResponse } from "next/server";
import { questions } from "@/app/diagnosis/questions";

export function GET() {
  return NextResponse.json({
    questions: questions.map(({ id, title, choices }) => ({ id, title, choices })),
  });
}
