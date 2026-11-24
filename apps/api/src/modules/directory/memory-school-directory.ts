import { SEED_INSTITUTIONS, SEED_TEACHERS } from "../../../prisma/seed-data.js";
import type { AuthenticatedTeacher } from "../auth/auth-provider.port.js";
import type {
  DirectoryInstitution,
  DirectoryTeacher,
  SchoolDirectoryPort,
} from "./school-directory.port.js";

export class MemorySchoolDirectory implements SchoolDirectoryPort {
  private readonly teachers = new Map<string, DirectoryTeacher>();
  private readonly institutions = new Map<string, DirectoryInstitution>();

  constructor(preloadSeed: boolean) {
    if (!preloadSeed) {
      return;
    }
    for (const institution of SEED_INSTITUTIONS) {
      this.institutions.set(institution.id, institution);
    }
    for (const teacher of SEED_TEACHERS) {
      this.teachers.set(teacher.id, {
        id: teacher.id,
        publicId: teacher.publicId,
        institutionId: teacher.institutionId,
        fullName: teacher.fullName,
        systemRole: teacher.systemRole,
        branchName: teacher.branchName,
        title: teacher.title,
        avatarUrl: null,
      });
    }
  }

  findTeacherById(userId: string): DirectoryTeacher | null {
    return this.teachers.get(userId) ?? null;
  }

  findInstitutionById(institutionId: string): DirectoryInstitution | null {
    return this.institutions.get(institutionId) ?? null;
  }

  upsertAuthenticatedTeacher(teacher: AuthenticatedTeacher): void {
    this.institutions.set(teacher.institutionId, {
      id: teacher.institutionId,
      publicId: teacher.institutionPublicId,
      alias: teacher.institutionAlias,
      name: teacher.institutionName,
      primaryColor: teacher.primaryColor,
    });
    this.teachers.set(teacher.userId, {
      id: teacher.userId,
      publicId: teacher.publicId,
      institutionId: teacher.institutionId,
      fullName: teacher.fullName,
      systemRole: teacher.systemRole,
      branchName: teacher.branchName,
      title: teacher.title,
      avatarUrl: teacher.avatarUrl,
    });
  }
}
