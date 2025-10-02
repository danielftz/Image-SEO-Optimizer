export interface DeepSeekChoice {
    message: {
        content: string;
    };
}

export interface DeepSeekResponse {
    choices: DeepSeekChoice[];
}

export interface DeepSeekParsedContent {
    seo_title: string;
    seo_description: string;
    explanation: string;
}