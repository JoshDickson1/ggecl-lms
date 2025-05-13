import { VercelRequest, VercelResponse } from "@vercel/node";
import app, { init } from "../src/server.js";
import { initSuperAdmin } from "../src/controllers/admins/index.js";

await init();
await initSuperAdmin().catch((error) => {
  console.error("Unhandled error in superadmin initialization:", error);
  process.exit(1);
});

export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};
