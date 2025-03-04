import type AIRole from "./AIRole";

interface ConversationData{
    role: AIRole;
    content: string;
}

export default ConversationData;