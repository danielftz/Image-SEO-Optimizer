import ConversationData from "../model/ConversationData";
import Session from "../model/Session";
import {v4 as uuidv4} from "uuid";

const inMemoryData = new Map<Session,ConversationData[]>();

function onPostInstruction(input: any): Response {
    
    return new Response();
}


//Creates a new sessionID (uuid)
//Add new instance to inMemoryData
//return the id in json format
function onGetNewSession(): Response {

    const newId = uuidv4();
    // const timeStamp = Date.now;
    const newSession: Session = {
        "id": newId, 
        "lastInteraction": new Date()
    };

    inMemoryData.set(newSession, new Array<ConversationData>());

    return Response.json(
    {
        "id": newId,
    });
}


export { onPostInstruction, onGetNewSession };