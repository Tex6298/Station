import { createApp } from "./app";
import { env } from "./lib/env";
import { createServer } from "http";
import { attachDeveloperSpaceWebSocketServer } from "./services/developer-space-live.service";

const app = createApp();
const server = createServer(app);
attachDeveloperSpaceWebSocketServer(server);

server.listen(Number(env.PORT), () => {
  console.log(`Station API listening on http://localhost:${env.PORT}`);
});
