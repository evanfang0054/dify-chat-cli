export interface FileInfo {
  path: string;
  name: string;
  size: number;
  extension: string;
  content: string;
  language: string;
  lastModified: Date;
}

export interface DirectoryScanResult {
  files: FileInfo[];
  totalFiles: number;
  totalSize: number;
  languages: string[];
  estimatedTokens: number;
  largeFiles: FileInfo[];
  warning?: string;
}

export interface DocumentGenerationRequest {
  files: FileInfo[];
  context?: string;
  style?: 'technical' | 'api' | 'tutorial' | 'overview';
  includeExamples?: boolean;
}

export interface GeneratedDocument {
  title: string;
  content: string;
  summary: string;
  tags: string[];
  filePaths: string[];
  metadata: {
    generatedAt: Date;
    aiModel: string;
    wordCount: number;
  };
}

export interface DocumentReviewStatus {
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  originalContent: string;
  modifiedContent?: string;
  feedback?: string;
}