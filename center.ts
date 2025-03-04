import { serve } from "bun";
import { join } from "path";
import { readFile } from "fs/promises";
import homepage from "./src/client/html/index.html";
import { onPostInstruction, onGetNewSession } from "./src/server/server.ts";
const PORT = 6969;

const MIME_TYPES: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    "webp": "image/webp",
    ".ico": "image/x-icon",
};

const PUBLIC_DIR = join(import.meta.dir, "public");

const server = serve(
    {
        port: PORT,
        routes: {
            "/": homepage,
            "/api/getNewSession": {
                //the caller asks the server for a new session.
                GET(req) {
                    console.log("Get New Session Called");
                    return onGetNewSession();
                }
            },
            "/api/postInstruction": {
                //the caller sends the instruction, along with the existing session info
                async POST(req) {
                    const json = await req.json();
                    return onPostInstruction(json);
                }
            },

        }
    },
);

console.log(`listening on ${server.url}, PORT: ${PORT}`);