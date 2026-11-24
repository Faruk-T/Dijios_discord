import type { MockPersonaSummary, ProblemCode, ProblemDetails } from "@dijios-connect/contracts";
import type { AuthClientPort, ClientSession } from "./auth-client.port.js";
import { SimulatedAuthClient } from "./simulated-auth.client.js";

const PROBLEM_CODES = [
  "TENANT_FORBIDDEN",
  "UNAUTHORIZED",
  "VALIDATION_FAILED",
  "ROOM_FULL",
  "PDR_ACCESS_DENIED",
] as const;

export class AuthClientError extends Error {
  readonly problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail);
    this.name = "AuthClientError";
    this.problem = problem;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing ${key}`);
  }
  return value;
}

function isRole(value: string): value is ClientSession["systemRole"] {
  return (
    value === "FOUNDER" ||
    value === "PRINCIPAL" ||
    value === "DEPT_HEAD" ||
    value === "TEACHER" ||
    value === "COUNSELOR"
  );
}

function isProblemCode(value: string): value is ProblemCode {
  return PROBLEM_CODES.some((code) => code === value);
}

export function readSession(value: unknown): ClientSession {
  if (!isRecord(value) || !isRecord(value["user"]) || !isRecord(value["institution"])) {
    throw new Error("Auth response is incomplete.");
  }
  const user = value["user"];
  const institution = value["institution"];
  const systemRole = readString(user, "systemRole");
  if (!isRole(systemRole)) {
    throw new Error("Auth response role is unknown.");
  }
  return {
    accessToken: readString(value, "accessToken"),
    userId: readString(user, "id"),
    fullName: readString(user, "fullName"),
    systemRole,
    branchName: readString(user, "branchName"),
    title: readString(user, "title"),
    institutionId: readString(institution, "id"),
    institutionAlias: readString(institution, "alias"),
    institutionName: readString(institution, "name"),
    primaryColor: readString(institution, "primaryColor"),
  };
}

function readPersona(value: unknown): MockPersonaSummary | null {
  if (!isRecord(value)) {
    return null;
  }
  const systemRole = readString(value, "systemRole");
  if (!isRole(systemRole)) {
    return null;
  }
  return {
    dijiosUserId: readString(value, "dijiosUserId"),
    fullName: readString(value, "fullName"),
    systemRole,
    branchName: readString(value, "branchName"),
    title: readString(value, "title"),
    institutionAlias: readString(value, "institutionAlias"),
    institutionName: readString(value, "institutionName"),
  };
}

async function readProblem(response: Response): Promise<ProblemDetails> {
  const body: unknown = await response.json();
  if (!isRecord(body)) {
    throw new Error("Problem response is incomplete.");
  }
  const code = readString(body, "code");
  return {
    type: readString(body, "type"),
    title: readString(body, "title"),
    status: response.status,
    detail: readString(body, "detail"),
    code: isProblemCode(code) ? code : "UNAUTHORIZED",
  };
}

export class HttpAuthClient implements AuthClientPort {
  constructor(private readonly baseUrl: string) {}

  login(input: { institutionAlias: string; dijiosUserId: string }): Promise<ClientSession> {
    return this.postSession("/api/v1/auth/login", input);
  }

  exchangeDijiosToken(input: { exchangeToken: string }): Promise<ClientSession> {
    return this.postSession("/api/v1/auth/dijios-exchange", input);
  }

  refresh(): Promise<ClientSession> {
    return this.postSession("/api/v1/auth/refresh", {});
  }

  async logout(): Promise<void> {
    await this.send("/api/v1/auth/logout", {});
  }

  async listPersonas(): Promise<readonly MockPersonaSummary[]> {
    const body = await this.send("/api/v1/auth/personas", undefined);
    if (!Array.isArray(body)) {
      throw new Error("Persona response is incomplete.");
    }
    return body.flatMap((item) => {
      const persona = readPersona(item);
      return persona === null ? [] : [persona];
    });
  }

  private async postSession(path: string, body: unknown): Promise<ClientSession> {
    return readSession(await this.send(path, body));
  }

  private async send(path: string, body: unknown): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: body === undefined ? "GET" : "POST",
      credentials: "include",
      headers: body === undefined ? {} : { "content-type": "application/json" },
      body: body === undefined ? null : JSON.stringify(body),
    });
    if (!response.ok) {
      throw new AuthClientError(await readProblem(response));
    }
    const payload: unknown = await response.json();
    return payload;
  }
}

export function createAuthClient(): AuthClientPort {
  if (import.meta.env.VITE_AUTH_CLIENT === "simulated") {
    return new SimulatedAuthClient();
  }
  return new HttpAuthClient(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000");
}
