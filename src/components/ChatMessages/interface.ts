import { ChatMessage } from '../../types';

export interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
}