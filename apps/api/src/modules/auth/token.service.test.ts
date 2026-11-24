import { afterEach, describe, expect, it } from "vitest";
import { SEED_INSTITUTIONS, SEED_TEACHERS } from "../../../prisma/seed-data.js";
import { EnvService } from "../../config/env.service.js";
import type { AuthenticatedTeacher } from "./auth-provider.port.js";
import { TokenService } from "./token.service.js";

const SHARED_SECRET = "shared-token-secret-value";

function founder(): AuthenticatedTeacher {
  const teacher = SEED_TEACHERS[0];
  const institution = SEED_INSTITUTIONS[0];
  if (teacher === undefined || institution === undefined) {
    throw new Error("Seed directory is empty.");
  }
  return {
    userId: teacher.id,
    publicId: teacher.publicId,
    institutionId: institution.id,
    institutionPublicId: institution.publicId,
    institutionAlias: institution.alias,
    institutionName: institution.name,
    primaryColor: institution.primaryColor,
    fullName: teacher.fullName,
    systemRole: teacher.systemRole,
    branchName: teacher.branchName,
    title: teacher.title,
    avatarUrl: null,
  };
}

describe("token use", () => {
  const previousAccess = process.env.JWT_ACCESS_SECRET;
  const previousRefresh = process.env.JWT_REFRESH_SECRET;

  afterEach(() => {
    process.env.JWT_ACCESS_SECRET = previousAccess;
    process.env.JWT_REFRESH_SECRET = previousRefresh;
  });

  it("rejects an access token presented as refresh and the reverse", () => {
    process.env.JWT_ACCESS_SECRET = SHARED_SECRET;
    process.env.JWT_REFRESH_SECRET = SHARED_SECRET;
    process.env.NODE_ENV = "test";
    process.env.DIJIOS_API_BASE_URL = "https://app.dijios.com";
    process.env.DATABASE_URL = "postgresql://dijios:dijios@localhost:5432/dijios_connect";
    process.env.REDIS_URL = "redis://localhost:6379";
    const tokens = new TokenService(new EnvService());
    const issued = tokens.issue(founder());

    expect(tokens.verifyAccess(issued.response.accessToken).tokenUse).toBe("access");
    expect(tokens.verifyRefresh(issued.refreshToken).tokenUse).toBe("refresh");
    expect(() => tokens.verifyAccess(issued.refreshToken)).toThrow(/Token use is not accepted/);
    expect(() => tokens.verifyRefresh(issued.response.accessToken)).toThrow(
      /Token use is not accepted/,
    );
  });
});
