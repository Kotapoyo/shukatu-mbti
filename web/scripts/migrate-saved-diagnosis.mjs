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
  const [columns] = await connection.execute(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = ? AND table_name = 'saved_company' AND column_name = 'diagnosis_id'",
    [process.env.MYSQL_DATABASE],
  );
  if (columns.length) throw new Error("saved_company.diagnosis_id は既に存在します。状態を確認してください。");
  const [rows] = await connection.execute("SELECT COUNT(*) AS count FROM saved_company");
  console.log(`既存の保存企業 ${rows[0].count} 件を保持して列を追加します。`);
  const sql = await readFile(path.join(webRoot, "db", "003_saved_diagnosis.sql"), "utf8");
  await connection.query(sql);
  console.log("saved_company.diagnosis_id を追加しました。");
} finally {
  await connection.end();
}
