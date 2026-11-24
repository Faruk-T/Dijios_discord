import type { AcademicSystemRole } from "@dijios-connect/contracts";
import type { AuthenticatedTeacher } from "../auth/auth-provider.port.js";

export const SCHOOL_DIRECTORY_PORT = Symbol("SCHOOL_DIRECTORY_PORT");

export interface DirectoryTeacher {
  readonly id: string;
  readonly publicId: string;
  readonly institutionId: string;
  readonly fullName: string;
  readonly systemRole: AcademicSystemRole;
  readonly branchName: string;
  readonly title: string;
  readonly avatarUrl: string | null;
}

export interface DirectoryInstitution {
  readonly id: string;
  readonly publicId: string;
  readonly alias: string;
  readonly name: string;
  readonly primaryColor: string;
}

export interface SchoolDirectoryPort {
  findTeacherById(userId: string): DirectoryTeacher | null;
  listTeachers(institutionId: string): readonly DirectoryTeacher[];
  findInstitutionById(institutionId: string): DirectoryInstitution | null;
  upsertAuthenticatedTeacher(teacher: AuthenticatedTeacher): void;
}
