import { serve } from "bun";
import { join } from "path";
import { onPostInstruction, onGetNewSession } from "./src/server/server.ts";

const PORT = 6969;

const server = serve({
    port: PORT,
    routes: {
        "/": async () => {
            // Serve the main HTML file
            const html = await Bun.file("./src/client/html/index.html").text();
            return new Response(html, { headers: { "Content-Type": "text/html" } });
        },
        
        "/src/client/*": async (req) => {
            // Serve static files from src/client directory
            const path = new URL(req.url).pathname;
            const filePath = `.${path}`;
            
            try {
                const file = Bun.file(filePath);
                
                // Check if file exists
                if (await file.exists()) {
                    // Determine content type based on file extension
                    const ext = path.split('.').pop()?.toLowerCase() || '';
                    const contentType = getContentType(ext);
                    
                    return new Response(file, { 
                        headers: { "Content-Type": contentType } 
                    });
                } else {
                    return new Response("Not found", { status: 404 });
                }
            } catch (error) {
                console.error(`Error serving file ${path}:`, error);
                return new Response("Internal server error", { status: 500 });
            }
        },
        
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