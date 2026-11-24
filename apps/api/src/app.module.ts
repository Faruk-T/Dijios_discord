import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./common/auth/jwt-auth.guard.js";
import { TenantScopeGuard } from "./common/tenant/tenant-scope.guard.js";
import { ConfigModule } from "./config/config.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { InstitutionsModule } from "./modules/institutions/institutions.module.js";
import { RbacModule } from "./modules/rbac/rbac.module.js";

@Module({
  imports: [ConfigModule, HealthModule, AuthModule, InstitutionsModule, RbacModule],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: TenantScopeGuard },
  ],
})
export class AppModule {}
