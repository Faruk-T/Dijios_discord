import { Module } from "@nestjs/common";
import { MessagingModule } from "../messaging/messaging.module.js";
import { FilesController } from "./files.controller.js";
import { FilesService } from "./files.service.js";
import { InMemoryObjectStorage } from "./in-memory-object.storage.js";
import { OBJECT_STORAGE_PORT } from "./object-storage.port.js";

@Module({
  imports: [MessagingModule],
  controllers: [FilesController],
  providers: [FilesService, { provide: OBJECT_STORAGE_PORT, useClass: InMemoryObjectStorage }],
  exports: [OBJECT_STORAGE_PORT],
})
export class FilesModule {}
