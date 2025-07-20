import { useState, useCallback } from 'react';
import { DifyService } from '../../services/dify';
import { OpenAIService } from '../../services/openai';
import { ChatMessage } from '../../types';

interface UseChatReturn {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (message: string) => Promise<void>;
  addSystemMessage: (content: string) => void;
}

export const useChat = (
  difyService: DifyService,
  openaiService: OpenAIService,
  knowledgeBaseId: string | null
): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // 添加系统消息，不触发AI聊天
  const addSystemMessage = useCallback((content: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'system',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, systemMessage]);
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!knowledgeBaseId) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        role: 'user',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, newMessage]);
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: '请先选择一个知识库',
        role: 'assistant',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiResponse]);
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
    setIsTyping(true);

    try {
      // 1. 使用Dify知识库检索相关内容
      const retrievalResponse = await difyService.retrieve(knowledgeBaseId, {
        query: message,
        retrieval_model: {
          search_method: 'semantic_search',
          reranking_enable: false,
          top_k: 5,
          score_threshold_enabled: false,
        }
      });

      // 2. 构建上下文
      const context = retrievalResponse.records
        .map(record => record.segment.content)
        .join('\n\n---\n\n');

      // 3. 使用OpenAI进行聊天
      const systemPrompt = `你是一个专业的技术助手。请基于提供的上下文信息回答问题。

规则：
1. 优先使用上下文中的信息回答
2. 如果上下文信息不足，请明确说明
3. 回答要准确、简洁、有帮助
4. 使用中文回答

上下文信息如下：
${context}`;

      const response = await openaiService.createChatCompletion(
        systemPrompt,
        message,
        context,
      );

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `错误: ${error instanceof Error ? error.message : '未知错误'}`,
        role: 'assistant',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [difyService, openaiService, knowledgeBaseId]);

  return {
    messages,
    isTyping,
    sendMessage,
    addSystemMessage
  };
}; 