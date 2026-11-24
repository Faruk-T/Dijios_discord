import { Module } from "@nestjs/common";
import { EnvService } from "../../config/env.service.js";
import { AuthController } from "./auth.controller.js";
import { AUTH_PROVIDER_PORT, type AuthProviderPort, type FetchLike } from "./auth-provider.port.js";
import { DijiosSanctumAuthAdapter } from "./dijios-sanctum.adapter.js";
import { MockSchoolAuthAdapter } from "./mock-school.adapter.js";
import { TokenService } from "./token.service.js";

@Module({
  controllers: [AuthController],
  providers: [
    TokenService,
    {
      provide: AUTH_PROVIDER_PORT,
      inject: [EnvService],
      useFactory: (env: EnvService): AuthProviderPort => {
        if (env.authMode === "mock") {
          return new MockSchoolAuthAdapter();
        }
        const fetchImpl: FetchLike = (input, init) => fetch(input, init);
        return new DijiosSanctumAuthAdapter(env.config.DIJIOS_API_BASE_URL, fetchImpl);
      },
    },
  ],
  exports: [TokenService, AUTH_PROVIDER_PORT],
})
export class AuthModule {}
