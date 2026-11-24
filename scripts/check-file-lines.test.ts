import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { classifyLineCount, countPhysicalLines, scanWorkspace } from "./check-file-lines.mjs";

const scannerPath = fileURLToPath(new URL("./check-file-lines.mjs", import.meta.url));

function fileBody(lineCount: number): string {
  return Array.from({ length: lineCount }, (_, index) => `line ${index + 1}`).join("\n");
}

async function tempWorkspace(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "dijios-lines-"));
}

describe("countPhysicalLines", () => {
  it("counts editor lines and ignores a trailing newline", () => {
    expect(countPhysicalLines("")).toBe(0);
    expect(countPhysicalLines("alpha\n")).toBe(1);
    expect(countPhysicalLines("alpha\r\nbeta\r\n")).toBe(2);
  });
});

describe("classifyLineCount", () => {
  it("warns above 240 lines and fails only above 300", () => {
    expect(classifyLineCount(240)).toBe("ok");
    expect(classifyLineCount(241)).toBe("warn");
    expect(classifyLineCount(300)).toBe("warn");
    expect(classifyLineCount(301)).toBe("error");
  });
});

describe("scanWorkspace", () => {
  it("skips excluded directories and reports warn versus error files", async () => {
    const root = await tempWorkspace();
    await mkdir(path.join(root, "src"));
    await mkdir(path.join(root, "node_modules", "pkg"), { recursive: true });
    await mkdir(path.join(root, "dist"));
    await writeFile(path.join(root, "src", "ok.ts"), fileBody(12), "utf8");
    await writeFile(path.join(root, "src", "wide.ts"), fileBody(250), "utf8");
    await writeFile(path.join(root, "src", "huge.ts"), fileBody(301), "utf8");
    await writeFile(path.join(root, "node_modules", "pkg", "huge.ts"), fileBody(400), "utf8");
    await writeFile(path.join(root, "dist", "huge.js"), fileBody(400), "utf8");
    await writeFile(path.join(root, "pnpm-lock.yaml"), fileBody(400), "utf8");

    const report = await scanWorkspace(root);
    expect(report.warnings.map((finding) => finding.filePath)).toEqual([
      path.join("src", "wide.ts"),
    ]);
    expect(report.errors.map((finding) => finding.filePath)).toEqual([path.join("src", "huge.ts")]);
  });

  it("exits 1 from the CLI when any source file exceeds 300 lines", async () => {
    const root = await tempWorkspace();
    await mkdir(path.join(root, "src"));
    await writeFile(path.join(root, "src", "huge.ts"), fileBody(301), "utf8");

    const result = spawnSync(process.execPath, [scannerPath], {
      cwd: root,
      encoding: "utf8",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("ERROR");
    expect(result.stderr).toContain("301");
  });

  it("exits 0 from the CLI when the longest file is only a warning", async () => {
    const root = await tempWorkspace();
    await mkdir(path.join(root, "src"));
    await writeFile(path.join(root, "src", "wide.ts"), fileBody(241), "utf8");

    const result = spawnSync(process.execPath, [scannerPath], {
      cwd: root,
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toContain("WARN");
  });
});
