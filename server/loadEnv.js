/**
 * server/loadEnv.js
 * Side-effect module: load server/.env before other local modules read process.env.
 * Import this first from index.js.
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
