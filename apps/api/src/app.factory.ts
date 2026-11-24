import "reflect-metadata";
import cookie from "@fastify/cookie";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module.js";
import { ProblemDetailsFilter } from "./common/filters/problem-details.filter.js";
import { EnvService } from "./config/env.service.js";

export async function createApp(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: false,
  });
  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(new ProblemDetailsFilter());
  const env = app.get(EnvService);
  app.enableCors({ origin: env.config.CORS_ORIGIN, credentials: true });
  await app.register(cookie, { secret: env.config.JWT_REFRESH_SECRET });
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}
