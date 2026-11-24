import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ValidationDomainException } from "../../common/errors/domain.exception.js";
import { EnvService } from "../../config/env.service.js";

@Controller()
export class HealthController {
  constructor(@Inject(EnvService) private readonly env: EnvService) {}

  @Get("health")
  health(@Query("probe") probe?: string): { readonly status: "ok" } {
    if (probe === "invalid") {
      throw new ValidationDomainException("Health probe was rejected.", [
        { field: "probe", message: "unsupported probe" },
      ]);
    }
    return { status: "ok" };
  }

  @Get("version")
  version(): {
    readonly name: "@dijios-connect/api";
    readonly version: "0.0.0";
    readonly environment: string;
  } {
    return {
      name: "@dijios-connect/api",
      version: "0.0.0",
      environment: this.env.nodeEnv,
    };
  }
}
