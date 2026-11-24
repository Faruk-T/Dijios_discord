import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const WARN_LINE_LIMIT = 240;
export const ERROR_LINE_LIMIT = 300;

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".css",
  ".prisma",
  ".rs",
  ".astro",
]);

const EXCLUDED_DIRECTORIES = new Set([
  "node_modules",
  "dist",
  ".git",
  ".turbo",
  "coverage",
  "build",
  "out",
  ".astro",
  "target",
  "generated",
]);

const EXCLUDED_FILE_NAMES = new Set(["pnpm-lock.yaml"]);

export function countPhysicalLines(content) {
  if (content.length === 0) {
    return 0;
  }

  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const segments = normalized.split("\n");
  if (segments.at(-1) === "") {
    segments.pop();
  }
  return segments.length;
}

export function classifyLineCount(lineCount) {
  if (lineCount > ERROR_LINE_LIMIT) {
    return "error";
  }
  if (lineCount > WARN_LINE_LIMIT) {
    return "warn";
  }
  return "ok";
}

export async function scanWorkspace(rootDir) {
  const warnings = [];
  const errors = [];
  await walk(rootDir, rootDir, warnings, errors);
  return { warnings, errors };
}

async function walk(rootDir, currentDir, warnings, errors) {
  const entries = await readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRECTORIES.has(entry.name)) {
        await walk(rootDir, path.join(currentDir, entry.name), warnings, errors);
      }
      continue;
    }

    if (!entry.isFile() || EXCLUDED_FILE_NAMES.has(entry.name)) {
      continue;
    }

    const extension = path.extname(entry.name);
    if (!SOURCE_EXTENSIONS.has(extension)) {
      continue;
    }

    const absolutePath = path.join(currentDir, entry.name);
    const lines = countPhysicalLines(await readFile(absolutePath, "utf8"));
    const severity = classifyLineCount(lines);
    if (severity === "ok") {
      continue;
    }

    const finding = {
      filePath: path.relative(rootDir, absolutePath),
      lines,
      severity,
    };
    if (severity === "error") {
      errors.push(finding);
    } else {
      warnings.push(finding);
    }
  }
}

export function formatFinding(finding) {
  const label = finding.severity === "error" ? "ERROR" : "WARN";
  const limit = finding.severity === "error" ? ERROR_LINE_LIMIT : WARN_LINE_LIMIT;
  return `${label} ${finding.filePath}: ${finding.lines} lines (limit ${limit})`;
}

async function main() {
  const report = await scanWorkspace(process.cwd());
  for (const warning of report.warnings) {
    console.warn(formatFinding(warning));
  }
  for (const error of report.errors) {
    console.error(formatFinding(error));
  }
  if (report.errors.length > 0) {
    console.error(
      `check:lines failed with ${report.errors.length} file(s) over ${ERROR_LINE_LIMIT} lines.`,
    );
    process.exit(1);
  }
  console.log(`check:lines passed (${report.warnings.length} warning(s), 0 errors).`);
}

const invokedPath = process.argv[1];
if (invokedPath !== undefined && path.resolve(invokedPath) === fileURLToPath(import.meta.url)) {
  main().catch((caught) => {
    const message = caught instanceof Error ? caught.message : "Unknown scanner failure";
    console.error(message);
    process.exit(1);
  });
}
