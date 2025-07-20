/**
 * CLI 特定的类型定义
 */

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  document_count: number;
}

export interface Command {
  label: string;
  value: string;
}

export interface FileUploadProgress {
  [filename: string]: number;
}

export interface FileUploadResult {
  name: string;
  success: boolean;
  error?: string;
} 