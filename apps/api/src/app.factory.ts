import "reflect-metadata";
import cookie from "@fastify/cookie";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module.js";
import { ProblemDetailsFilter } from "./common/filters/problem-details.filter.js";
import { EnvService } from "./config/env.service.js";
import { RedisIoAdapter } from "./modules/realtime/redis-io.config.js";

export async function createApp(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: false,
  });
  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(new ProblemDetailsFilter());
  const env = app.get(EnvService);
  app.useWebSocketAdapter(
    new RedisIoAdapter(app, env.config.REDIS_ADAPTER_ENABLED === "true", env.config.REDIS_URL),
  );
  app.enableCors({ origin: env.config.CORS_ORIGIN, credentials: true });
  await app.register(cookie, { secret: env.config.JWT_REFRESH_SECRET });
  app
    .getHttpAdapter()
    .getInstance()
    .addHook("onSend", async (_request, reply) => {
      reply.header("x-content-type-options", "nosniff");
      reply.header("x-frame-options", "SAMEORIGIN");
      reply.header("referrer-policy", "strict-origin-when-cross-origin");
      reply.header("x-robots-tag", "noindex, nofollow, noarchive");
    });
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}
