export type LineSeverity = "ok" | "warn" | "error";

export interface LineScanFinding {
  readonly filePath: string;
  readonly lines: number;
  readonly severity: Exclude<LineSeverity, "ok">;
}

export interface LineScanReport {
  readonly warnings: readonly LineScanFinding[];
  readonly errors: readonly LineScanFinding[];
}

export function countPhysicalLines(content: string): number;

export function classifyLineCount(lineCount: number): LineSeverity;

export function scanWorkspace(rootDir: string): Promise<LineScanReport>;

export function formatFinding(finding: LineScanFinding): string;
