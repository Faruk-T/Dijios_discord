import type { InstitutionSummary } from "@dijios-connect/contracts";
import { Controller, Get, Param } from "@nestjs/common";
import { SEED_INSTITUTIONS } from "../../../prisma/seed-data.js";
import { CurrentTenant } from "../../common/decorators/current-tenant.decorator.js";
import { ValidationDomainException } from "../../common/errors/domain.exception.js";
import { parseUlid, parseUuidV7 } from "../../common/ids/id-generator.js";

@Controller("institutions")
export class InstitutionsController {
  @Get(":institutionId/summary")
  summary(
    @CurrentTenant() sessionInstitutionId: string,
    @Param("institutionId") institutionId: string,
  ): InstitutionSummary {
    if (sessionInstitutionId !== institutionId) {
      throw new ValidationDomainException("Institution scope does not match the route.");
    }
    const institution = SEED_INSTITUTIONS.find((item) => item.id === institutionId);
    if (institution === undefined) {
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
