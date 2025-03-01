import {serve} from "bun";
import {join} from "path";
import {readFile} from "fs/promises";

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

async function serverStatic(path: string){
    try{
        const filePath=join(PUBLIC_DIR, path);
        const content = await readFile(filePath);
        const extension = path.substring(path.lastIndexOf("."));
        const contentType=MIME_TYPES[extension] || "application/octet-stream";
    
        return new Response(content, {
            headers: {"Content-Type": contentType},
        });
    }catch(e){
        console.error(`Error serving ${path}: `, e);
        return new Response("Not Found", {status: 404});
    }
}

const server = serve(
    {
        port: PORT,
        async fetch(req){
            const url = new URL(req.url);
            let path=url.pathname;

            switch(path){
                case "/":{
                    path="/index.html";
                    break;
                }
            }
            return serverStatic(path);
        }
    },
);

console.log(`listening on ${server.url}, PORT: ${PORT}`);