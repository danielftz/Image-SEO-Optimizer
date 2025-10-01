import { join } from "path";
import { onPostInstruction, onGetNewSession } from "./src/server/server.ts";

const PORT = 6969;
const HTML_ROOT = "/src/client/html";
const server = Bun.serve({
    port: PORT,
    routes: {
        //routes for api calls

        "/api/getNewSession": {
            // The caller asks the server for a new session.
            GET(req) {
                return onGetNewSession();
            }
        },
        
        "/api/postInstruction": {
            // The caller sends the instruction, along with the existing session info
            async POST(req) {
                const json = await req.json();
                return onPostInstruction(json);
            }
        },
    },
    
    // Fallback handler for static files and frontend
    async fetch(req: Request) {
        const url = new URL(req.url);
        const pathname = url.pathname;
        // Handle root route - serve the main HTML file
        if (pathname === '/') {
            try {
                const file = Bun.file("./src/client/html/index.html");
                return new Response(file, {
                    headers: { "Content-Type": "text/html" }
                });
            } catch (error) {
                console.log(error);
                return new Response("Not found", { status: 404 });
            }
        }
        
        // Serve static files from src/client directory
        if (pathname.startsWith('/src/client/')) {
            try {
                const file = Bun.file(`.${pathname}`);
                if (await file.exists()) {
                    // Determine content type based on file extension
                    const ext = pathname.split('.').pop()?.toLowerCase() || '';
                    const contentType = getContentType(ext);
                    
                    return new Response(file, {
                        headers: { "Content-Type": contentType }
                    });
                }
            } catch (error) {
                console.error(`Error serving file ${pathname}:`, error);
            }
        }
        
        // Fallback to 404
        return new Response("Not found", { status: 404 });
    }
});

// Helper function to determine content type
function getContentType(extension: string): string {
    const mimeTypes: Record<string, string> = {
        "html": "text/html",
        "css": "text/css",
        "js": "text/javascript",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
        "ico": "image/x-icon",
        "json": "application/json",
        "txt": "text/plain"
    };
    
    return mimeTypes[extension] || "application/octet-stream";
}

console.log(`listening on ${server.url}, PORT: ${PORT}`);