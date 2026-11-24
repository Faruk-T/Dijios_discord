import { Module } from "@nestjs/common";
import { ChannelPermissionGuard } from "./channel-permission.guard.js";
import { RbacController } from "./rbac.controller.js";
import { RbacEvaluatorService } from "./rbac-evaluator.service.js";

@Module({
  controllers: [RbacController],
  providers: [RbacEvaluatorService, ChannelPermissionGuard],
  exports: [RbacEvaluatorService],
})
export class RbacModule {}
