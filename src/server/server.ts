import { AIRole } from "../model/AIRole";
import { ConversationLine } from "../model/ConversationLine";
import { SessionData } from "../model/SessionData";
import { v4 as uuidv4 } from "uuid";

const inMemoryData = new Map<string, SessionData>();
//test
const systemPrompt = `
        You are an AI assistant specialized in generating SEO-friendly titles and descriptions for images based on user-provided details. The user will describe a picture and may include a specific request for modification (e.g., 'make the title shorter,' 'focus on the colors,' etc.).
        Your output must be a valid JSON object containing the required data. Ensure the response is a clean JSON object with no additional tags, such as \`\`\`json\`\`\`, or other formatting. Only provide the JSON object as the output.
        Your task is to:
        1. Generate an SEO title: a concise phrase (under 60 characters) with relevant keywords.
        2. Generate an SEO description: a detailed sentence (150-160 characters) that provides context and encourages engagement.
        3. Provide an explanation: a brief write-up (2-3 sentences) that acknowledges any specific modification request from the user and explains how you addressed it. If no modification request is made, explain your choices based on SEO best practices.

        Output your response as a JSON object with the following keys:
        - 'seo_title': the generated title
        - 'seo_description': the generated description
        - 'explanation': the explanation of your choices, including acknowledgment of any modification request

        Ensure the output is a valid JSON object and nothing else.
    `;

//Creates a new sessionID (uuid)
//Add new instance to inMemoryData
//return the id in json format
function onGetNewSession(): Response {


    const newId = uuidv4();

    //create new session with systemPrompt
    const newSession: SessionData = {
        "id": newId,
        "lastInteraction": new Date(),
        "conversation": new Array<ConversationLine>(
            {
                role: AIRole.system,
                content: systemPrompt,
            })
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

        //add user prompt into object located in inMemoryData
        let userSession: SessionData | undefined = inMemoryData.get(id);

        if (!userSession) {
            //no user session found. Shouldnt happen
            userSession = {
                "id": id,
                "lastInteraction": new Date(),
                "conversation": new Array<ConversationLine>(
                    {
                        role: AIRole.system,
                        content: systemPrompt,
                    })
            };
            inMemoryData.set(id, userSession);
        }

        userSession.lastInteraction = new Date();
        const existingConversation: ConversationLine[] = userSession.conversation;
        existingConversation.push({
            role: AIRole.user,
            content: userPrompt,
        })

        const deepSeekResponse: Response = await fetch(
            "https://api.deepseek.com/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.IMAGE_SEO_DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify(
                    {
                        model: "deepseek-chat",
                        "messages": existingConversation,
                        stream: false
                    }
                ),
            });
        // console.log(deepSeekResponse);
        const responseJson: any = await deepSeekResponse.json();
        const body: any = responseJson["choices"][0]["message"];
       
        // console.log(body);
        const content: string = body["content"];

        existingConversation.push({
            role: AIRole.assistant,
            content: content
        });

        const parsedContent = JSON.parse(content);
        // console.log(parsedContent);


        return Response.json({
            "assistantResponse": parsedContent["explanation"],
            "suggestedTitle": parsedContent["seo_title"],
            "suggestedDescription": parsedContent["seo_description"],
        });

    } catch (ex) {
        console.log(ex);

        return new Response("Bad request. ", { status: 400 });
    }
}



export { onPostInstruction, onGetNewSession };