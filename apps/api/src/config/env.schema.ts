import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AUTH_MODE: z.enum(["mock", "dijios"]).default("mock"),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  DIJIOS_API_BASE_URL: z.url(),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv): EnvConfig {
  const defined = Object.fromEntries(
    Object.entries(source).flatMap(([key, value]) => (value === undefined ? [] : [[key, value]])),
  );
  const parsed = envSchema.safeParse(defined);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid environment: ${fields}`);
  }
  return parsed.data;
}
