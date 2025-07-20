import axios from 'axios';

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatOptions {
  stream?: boolean;
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(apiKey: string, baseUrl: string = 'https://api.openai.com', model: string = 'gpt-3.5-turbo', maxTokens: number = 4000, temperature: number = 0.7) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  async chat(
    messages: OpenAIMessage[],
    options: ChatOptions = {}
  ): Promise<OpenAIResponse> {
    const {
      stream = false
    } = options;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          stream
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `OpenAI API错误: ${error.response?.data?.error?.message || error.message}${JSON.stringify(this)}`
        );
      }
      throw error;
    }
  }

  async createChatCompletion(
    systemPrompt: string,
    userMessage: string,
    context: string,
    options?: ChatOptions
  ): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `基于以下上下文回答问题：

上下文：
${context}

用户问题：${userMessage}`
      }
    ];

    const response = await this.chat(messages, options);
    return response.choices[0]?.message?.content || '';
  }
}