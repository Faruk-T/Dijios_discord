import type { InstitutionSummary } from "@dijios-connect/contracts";
import { Controller, Get, Inject, Param } from "@nestjs/common";
import { CurrentTenant } from "../../common/decorators/current-tenant.decorator.js";
import { ValidationDomainException } from "../../common/errors/domain.exception.js";
import { parseUlid, parseUuidV7 } from "../../common/ids/id-generator.js";
import {
  SCHOOL_DIRECTORY_PORT,
  type SchoolDirectoryPort,
} from "../directory/school-directory.port.js";

@Controller("institutions")
export class InstitutionsController {
  constructor(@Inject(SCHOOL_DIRECTORY_PORT) private readonly directory: SchoolDirectoryPort) {}

  @Get(":institutionId/summary")
  summary(
    @CurrentTenant() sessionInstitutionId: string,
    @Param("institutionId") institutionId: string,
  ): InstitutionSummary {
    if (sessionInstitutionId !== institutionId) {
      throw new ValidationDomainException("Institution scope does not match the route.");
    }
    const institution = this.directory.findInstitutionById(institutionId);
    if (institution === null) {
      throw new ValidationDomainException("Institution was not found.");
    }
    return {
      id: parseUuidV7(institution.id),
      publicId: parseUlid(institution.publicId),
      alias: institution.alias,
      name: institution.name,
      primaryColor: institution.primaryColor,
    };
  }
}
