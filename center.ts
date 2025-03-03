import {serve} from "bun";
import {join} from "path";
import {readFile} from "fs/promises";
import homepage from "./src/client/html/index.html";

const PORT = 6969;

const MIME_TYPES: Record<string, string>={
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
        routes:{
            "/": homepage,
            "/api":{
                async GET(req){
                    return new Response("Not Found", { status: 404 });
                }
            }
        }
    },
);

console.log(`listening on ${server.url}, PORT: ${PORT}`);