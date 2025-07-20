import { DifyService } from '../../services/dify';
import { OpenAIService } from '../../services/openai';

export interface ChatContainerProps {
  difyService: DifyService;
  openaiService: OpenAIService;
} 