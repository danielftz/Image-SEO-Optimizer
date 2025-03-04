import ConversationData from "../model/ConversationData";
import Session from "../model/Session";
import {v4 as uuidv4} from "uuid";

const inMemoryData = new Map<Session,ConversationData[]>();

function onPostInstruction(input: any): Response {
    
    return new Response();
}

function onGetNewSession(): Response {

    const newId = uuidv4();

    inMemoryData[newId] = new Array<ConversationData>();
    return Response.json(
    {
        "id": newId,
    });
}


export { onPostInstruction, onGetNewSession };