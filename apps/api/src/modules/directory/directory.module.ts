import { Global, Module } from "@nestjs/common";
import { EnvService } from "../../config/env.service.js";
import { MemorySchoolDirectory } from "./memory-school-directory.js";
import { SCHOOL_DIRECTORY_PORT, type SchoolDirectoryPort } from "./school-directory.port.js";

@Global()
@Module({
  providers: [
    {
      provide: SCHOOL_DIRECTORY_PORT,
      inject: [EnvService],
      useFactory: (env: EnvService): SchoolDirectoryPort => {
        return new MemorySchoolDirectory(env.authMode === "mock");
      },
    },
  ],
  exports: [SCHOOL_DIRECTORY_PORT],
})
export class DirectoryModule {}
