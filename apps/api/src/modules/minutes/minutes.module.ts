import { Module } from "@nestjs/common";
import { MediaLivekitModule } from "../media-livekit/media-livekit.module.js";
import { MessagingModule } from "../messaging/messaging.module.js";
import { InMemoryMinutesStore } from "./in-memory-minutes.store.js";
import { MINUTES_STORE_PORT } from "./minutes-store.port.js";
import { MinutesController } from "./minutes.controller.js";
import { MinutesService } from "./minutes.service.js";

@Module({
  imports: [MessagingModule, MediaLivekitModule],
  controllers: [MinutesController],
  providers: [MinutesService, { provide: MINUTES_STORE_PORT, useClass: InMemoryMinutesStore }],
})
export class MinutesModule {}
