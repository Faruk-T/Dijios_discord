import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Injectable } from "@nestjs/common";
import { parseEnv, type EnvConfig } from "./env.schema.js";

function applyDotEnv(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#") || trimmed.startsWith("export ")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

@Injectable()
export class EnvService {
  readonly config: EnvConfig;

  constructor() {
    applyDotEnv(resolve(process.cwd(), ".env"));
    applyDotEnv(resolve(process.cwd(), "../../.env"));
    this.config = parseEnv(process.env);
  }

  get port(): number {
    return this.config.PORT;
  }

  get nodeEnv(): EnvConfig["NODE_ENV"] {
    return this.config.NODE_ENV;
  }

  get authMode(): EnvConfig["AUTH_MODE"] {
    return this.config.AUTH_MODE;
  }
}
