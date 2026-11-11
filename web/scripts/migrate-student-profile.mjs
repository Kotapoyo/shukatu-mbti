import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import nextEnv from "@next/env";
import mysql from "mysql2/promise";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(webRoot);
for (const name of ["MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE"]) {
  if (!process.env[name]) throw new Error(`${name} を設定してください。`);
}
const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT ?? "3306"),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});
try {
  const [rows] = await connection.execute(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = 'student_profile'",
    [process.env.MYSQL_DATABASE],
  );
  if (rows.length) throw new Error("student_profile は既に存在します。状態を確認してください。");
  const sql = await readFile(path.join(webRoot, "db", "004_student_profile.sql"), "utf8");
  await connection.query(sql);
  console.log("student_profile を作成しました。");
} finally {
  await connection.end();
}
