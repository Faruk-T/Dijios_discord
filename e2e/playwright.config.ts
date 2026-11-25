import { defineConfig } from "@playwright/test";

const apiEnv = {
  PORT: "3100",
  AUTH_MODE: "mock",
  CORS_ORIGIN: "http://127.0.0.1:4173",
  REDIS_ADAPTER_ENABLED: "false",
  JWT_ACCESS_SECRET: "local-dev-access-secret-change-me",
  JWT_REFRESH_SECRET: "local-dev-refresh-secret-change-me",
  DIJIOS_API_BASE_URL: "https://app.dijios.com",
  DATABASE_URL: "postgresql://dijios:dijios@127.0.0.1:5432/dijios_connect",
  REDIS_URL: "redis://127.0.0.1:6379",
};

export default defineConfig({
  testDir: ".",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    launchOptions: {
      args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
    },
  },
  webServer: [
    {
      command: "pnpm --filter @dijios-connect/api exec node dist/src/main.js",
      url: "http://127.0.0.1:3100/api/v1/health",
      reuseExistingServer: false,
      timeout: 120_000,
      env: apiEnv,
    },
    {
      command: "pnpm --filter @dijios-connect/web-osgl exec vite --host 127.0.0.1 --port 4173",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        VITE_API_BASE_URL: "http://127.0.0.1:3100",
        VITE_MEDIA_CLIENT: "simulated",
      },
    },
  ],
});
