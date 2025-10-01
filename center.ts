import { join } from "path";
import { onPostInstruction, onGetNewSession } from "./src/server/server.ts";

const PORT = process.env.PORT || 6969;

const server = Bun.serve({
    port: PORT,
    routes: {
        //routes for api calls only

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
        const pathName = url.pathname;
        // Handle root route - serve the main HTML file
        // This is for dev build only, deploy build static files will be handled by NGINX
        if (pathName === '/') {
            try {
                const file = Bun.file("./src/client/index.html");
                return new Response(file, {
                    headers: { "Content-Type": "text/html" }
                });
            } catch (error) {
                console.log(error);
                return new Response("Not found", { status: 404 });
            }
        }
        console.log(pathName);
        // Serve static files from css, codeBehind from directory
        if (pathName.startsWith('/css/') || pathName.startsWith('/codeBehind/') ) {
            try {
                const file = Bun.file(`./src/client/${pathName}`);
                if (await file.exists()) {
                    // Determine content type based on file extension
                    const ext = pathName.split('.').pop()?.toLowerCase() || '';
                    const contentType = getContentType(ext);
                    
                    return new Response(file, {
                        headers: { "Content-Type": contentType }
                    });
                }
            } catch (error) {
                console.error(`Error serving file ${pathName}:`, error);
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