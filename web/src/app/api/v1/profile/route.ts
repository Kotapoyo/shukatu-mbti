import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/auth";
import { isDemoProfile, prefectures, schoolTypes } from "@/lib/demo-data";
import { allowedWriteOrigin, jsonBody, privateNoStore, sessionUserId } from "@/lib/api-v1";

type ProfileRow = RowDataPacket & {
  graduation_year: number;
  school_type: string;
  age: number | null;
  school_name: string;
  major: string | null;
  gender: string | null;
  hobbies: string | null;
  work_location: string | null;
  minimum_monthly_salary_yen: number | null;
};

const options = { prefectures, schoolTypes, genders: ["女性", "男性", "その他"] };

export async function GET(request: NextRequest) {
  const userId = await sessionUserId(request);
  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  const [rows] = await db.execute<ProfileRow[]>(
    `SELECT p.graduation_year, p.school_type, p.age, p.school_name, p.major,
            p.gender, p.hobbies, c.work_location, c.minimum_monthly_salary_yen
       FROM student_profile AS p
       LEFT JOIN student_condition AS c ON c.user_id = p.user_id
      WHERE p.user_id = ?`,
    [userId],
  );
  const row = rows[0];
  if (!row) return NextResponse.json({ profile: null, options }, { headers: privateNoStore });
  if (row.work_location === null) throw new Error(`希望条件のないプロフィールです: ${userId}`);
  return NextResponse.json({ profile: {
    graduationYear: row.graduation_year,
    schoolType: row.school_type,
    age: row.age,
    schoolName: row.school_name,
    major: row.major,
    gender: row.gender,
    hobbies: row.hobbies,
    workLocation: row.work_location,
    minimumMonthlySalaryYen: row.minimum_monthly_salary_yen,
  }, options }, { headers: privateNoStore });
}

export async function PUT(request: NextRequest) {
  if (!allowedWriteOrigin(request)) return NextResponse.json({ error: "許可されていない送信元です。" }, { status: 403 });
  const userId = await sessionUserId(request);
  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  const body = await jsonBody(request);
  if (!isDemoProfile(body)) return NextResponse.json({ error: "プロフィールの入力が正しくありません。" }, { status: 400 });

  const profile = {
    graduationYear: body.graduationYear,
    schoolType: body.schoolType,
    age: body.age,
    schoolName: body.schoolName,
    major: body.major,
    gender: body.gender,
    hobbies: body.hobbies,
    workLocation: body.workLocation,
    minimumMonthlySalaryYen: body.minimumMonthlySalaryYen,
  };
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO student_profile
        (user_id, graduation_year, school_type, age, school_name, major, gender, hobbies)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE graduation_year = VALUES(graduation_year), school_type = VALUES(school_type),
         age = VALUES(age), school_name = VALUES(school_name), major = VALUES(major),
         gender = VALUES(gender), hobbies = VALUES(hobbies)`,
      [userId, profile.graduationYear, profile.schoolType, profile.age, profile.schoolName,
        profile.major, profile.gender, profile.hobbies],
    );
    await connection.execute(
      `INSERT INTO student_condition (user_id, work_location, minimum_monthly_salary_yen)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE work_location = VALUES(work_location),
         minimum_monthly_salary_yen = VALUES(minimum_monthly_salary_yen)`,
      [userId, profile.workLocation, profile.minimumMonthlySalaryYen],
    );
    await connection.commit();
  } catch (cause) {
    await connection.rollback();
    throw cause;
  } finally {
    connection.release();
  }
  return NextResponse.json({ profile }, { headers: privateNoStore });
}
