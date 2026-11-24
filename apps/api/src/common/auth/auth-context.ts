import type { AcademicSystemRole } from "@dijios-connect/contracts";

export interface AuthContext {
  readonly userId: string;
  readonly institutionId: string;
  readonly systemRole: AcademicSystemRole;
  readonly branchName: string;
}

declare module "fastify" {
  interface FastifyRequest {
    authContext?: AuthContext;
  }
}
