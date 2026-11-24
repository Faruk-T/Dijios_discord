import { spawnSync } from "node:child_process";

process.env.PRISMA_HIDE_UPDATE_MESSAGE = "1";
process.env.CHECKPOINT_DISABLE = "1";

if (process.env.DATABASE_URL === undefined) {
  process.env.DATABASE_URL =
    "postgresql://dijios:dijios_dev_password@localhost:5432/dijios_connect";
}

const result = spawnSync("prisma", ["generate", "--schema", "prisma/schema"], {
  stdio: ["inherit", "pipe", "inherit"],
  encoding: "utf8",
  shell: true,
  env: process.env,
});

if ((result.status ?? 1) !== 0) {
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  process.exit(result.status ?? 1);
}
