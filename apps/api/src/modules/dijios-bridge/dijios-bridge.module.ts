import { Module } from "@nestjs/common";
import { RealtimeModule } from "../realtime/realtime.module.js";
import { CampusBroadcastService } from "./campus-broadcast.service.js";
import { DijiosBridgeController } from "./dijios-bridge.controller.js";
import { StudentSummaryService } from "./student-summary.service.js";

@Module({
  imports: [RealtimeModule],
  controllers: [DijiosBridgeController],
  providers: [StudentSummaryService, CampusBroadcastService],
})
export class DijiosBridgeModule {}
