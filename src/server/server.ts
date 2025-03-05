import ConversationLine from "../model/ConversationLine";
import SessionData from "../model/SessionData";
import { v4 as uuidv4 } from "uuid";

const inMemoryData = new Map<string, SessionData>();


//Creates a new sessionID (uuid)
//Add new instance to inMemoryData
//return the id in json format
function onGetNewSession(): Response {

    const newId = uuidv4();
    // const timeStamp = Date.now;
    const newSession: SessionData = {
        "id": newId,
        "lastInteraction": new Date(),
        "conversation": new Array<ConversationLine>(),
    };

    inMemoryData.set(newId, newSession);

    return Response.json(
        {
            "id": newId,
        });
}


//Called when caller has sent an instruction
async function onPostInstruction(input: any): Promise<Response> {

    try {
        const id: string = input["id"];
        const userPrompt: string = input["userPrompt"];

        /*
        const deepSeekResponse = await fetch(
            "https://api.deepseek.com/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.IMAGE_SEO_DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({ message: "Hello from Bun!" }),
            });
        */


        return Response.json({
            "assistantResponse": "Sounds good",
            "suggestedTitle": "ayyy",
            "suggestedDescription": "LMAOOOO"
        });

    } catch (ex) {
        return new Response("Bad request. ", { status: 400 });
    }
}



export { onPostInstruction, onGetNewSession };