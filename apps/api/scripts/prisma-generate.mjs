import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

process.env.PRISMA_HIDE_UPDATE_MESSAGE = "1";
process.env.CHECKPOINT_DISABLE = "1";

if (process.env.DATABASE_URL === undefined) {
  process.env.DATABASE_URL =
    "postgresql://dijios:dijios_dev_password@localhost:5432/dijios_connect";
}

const require = createRequire(import.meta.url);
const prismaCli = require.resolve("prisma/build/index.js");
const result = spawnSync(process.execPath, [prismaCli, "generate", "--schema", "prisma/schema"], {
  stdio: ["inherit", "pipe", "inherit"],
  encoding: "utf8",
  env: process.env,
});

if ((result.status ?? 1) !== 0) {
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  process.exit(result.status ?? 1);
}
