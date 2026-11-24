import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module.js";
import { ProblemDetailsFilter } from "./common/filters/problem-details.filter.js";

export async function createApp(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: false,
  });
  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(new ProblemDetailsFilter());
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}
