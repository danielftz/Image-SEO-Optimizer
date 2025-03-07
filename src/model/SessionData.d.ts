import {ConversationLine} from "./ConversationLine";

export class SessionData{
    id:string;
    lastInteraction: Date;
    conversation: ConversationLine[];
}
