import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { createPool } from "mysql2/promise";
import { isDemoEmail } from "./auth-policy";

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} を設定してください。`);
  return value;
}

const port = Number(process.env.MYSQL_PORT ?? "3306");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("MYSQL_PORT に有効なポート番号を設定してください。");
}

requiredEnvironment("BETTER_AUTH_SECRET");
requiredEnvironment("BETTER_AUTH_URL");

export const db = createPool({
    host: requiredEnvironment("MYSQL_HOST"),
    port,
    user: requiredEnvironment("MYSQL_USER"),
    password: requiredEnvironment("MYSQL_PASSWORD"),
    database: requiredEnvironment("MYSQL_DATABASE"),
    timezone: "Z",
  });

export const auth = betterAuth({
  database: db,
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;
      const email = ctx.body?.email;
      if (!isDemoEmail(email)) {
        throw new APIError("BAD_REQUEST", {
          message: "開発中は @example.com の架空メールアドレスだけ登録できます。",
        });
      }
      return { context: { ...ctx, body: { ...ctx.body, name: "デモ学生" } } };
    }),
  },
});
