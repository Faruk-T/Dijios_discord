import { createApp } from "./app.factory.js";
import { EnvService } from "./config/env.service.js";

const app = await createApp();
const env = app.get(EnvService);
await app.listen(env.port, "0.0.0.0");
