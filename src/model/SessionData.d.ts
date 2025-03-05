import ConversationData from "./ConversationLine";

interface SessionData{
    id:string;
    lastInteraction: Date;
    conversation: ConversationData[];
}

export default SessionData;