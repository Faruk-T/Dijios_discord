import type { INestApplication } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import type { ServerOptions } from "socket.io";

export class RedisIoAdapter extends IoAdapter {
  constructor(
    app: INestApplication,
    private readonly enabled: boolean,
    private readonly redisUrl: string,
  ) {
    super(app);
  }

  override createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options) as {
      adapter: (adapter: ReturnType<typeof createAdapter>) => void;
    };
    if (this.enabled) {
      const publisher = createClient({ url: this.redisUrl });
      const subscriber = publisher.duplicate();
      void Promise.all([publisher.connect(), subscriber.connect()]).then(() => {
        server.adapter(createAdapter(publisher, subscriber));
      });
    }
    return server;
  }
}
