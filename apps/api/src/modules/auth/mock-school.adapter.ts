import type { LoginRequestDto, MockPersonaSummary } from "@dijios-connect/contracts";
import { UnauthorizedDomainException } from "../../common/errors/domain.exception.js";
import { SEED_INSTITUTIONS, SEED_TEACHERS } from "../../../prisma/seed-data.js";
import type { AuthenticatedTeacher, AuthProviderPort } from "./auth-provider.port.js";

function toTeacher(
  institution: (typeof SEED_INSTITUTIONS)[number],
  teacher: (typeof SEED_TEACHERS)[number],
): AuthenticatedTeacher {
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

export class MockSchoolAuthAdapter implements AuthProviderPort {
  authenticateCredentials(input: LoginRequestDto): Promise<AuthenticatedTeacher> {
    const institution = SEED_INSTITUTIONS.find((item) => item.alias === input.institutionAlias);
    const teacher = SEED_TEACHERS.find(
      (item) => item.dijiosUserId === input.dijiosUserId && item.institutionId === institution?.id,
    );
    if (institution === undefined || teacher === undefined) {
      throw new UnauthorizedDomainException("Unknown teacher credentials.");
    }
    return Promise.resolve(toTeacher(institution, teacher));
  }

  async exchangeDijiosToken(input: {
    readonly exchangeToken: string;
  }): Promise<AuthenticatedTeacher> {
    const [alias, dijiosUserId] = input.exchangeToken.split(":");
    if (alias === undefined || dijiosUserId === undefined || dijiosUserId.length === 0) {
      throw new UnauthorizedDomainException("Exchange token is malformed.");
    }
    return this.authenticateCredentials({ institutionAlias: alias, dijiosUserId });
  }

  listDevPersonas(): readonly MockPersonaSummary[] {
    return SEED_TEACHERS.map((teacher) => {
      const institution = SEED_INSTITUTIONS.find((item) => item.id === teacher.institutionId);
      return {
        dijiosUserId: teacher.dijiosUserId,
        fullName: teacher.fullName,
        systemRole: teacher.systemRole,
        branchName: teacher.branchName,
        title: teacher.title,
        institutionAlias: institution?.alias ?? "fen-koleji",
        institutionName: institution?.name ?? "Örnek Fen ve Teknoloji Koleji",
      };
    });
  }
}
