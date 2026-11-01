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
  multipleStatements: true,
});

try {
  const [rows] = await connection.execute(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name IN ('student_condition', 'diagnosis')",
    [process.env.MYSQL_DATABASE],
  );
  if (rows.length !== 0) {
    throw new Error("Android APIのテーブルが既に存在します。既存の状態を確認してから移行してください。");
  }
  const sql = await readFile(path.join(webRoot, "db", "002_android_api.sql"), "utf8");
  await connection.query(sql);
  console.log("student_condition と diagnosis を作成しました。");
} finally {
  await connection.end();
}
