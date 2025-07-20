import axios, { AxiosInstance } from 'axios';
import {
  KnowledgeBase,
  CreateKnowledgeBaseRequest,
  Document,
  Segment,
  CreateDocumentByTextRequest,
  ProcessRule,
  RetrievalRequest,
  RetrievalResponse
} from '../types/dify';

export interface DifyMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DifyRequest {
  inputs: Record<string, any>;
  query: string;
  response_mode?: 'blocking' | 'streaming';
  conversation_id?: string;
  user?: string;
}

export interface DifyResponse {
  answer: string;
  conversation_id: string;
  message_id: string;
  created_at: number;
}

export interface KnowledgeBaseUploadRequest {
  dataset_id: string;
  file: Buffer;
  filename: string;
  metadata?: Record<string, any>;
}

export interface CreateDocumentByFileRequest {
  dataset_id: string;
  file: Buffer;
  filename: string;
  indexing_technique?: 'high_quality' | 'economy';
  doc_form?: 'text_model' | 'hierarchical_model' | 'qa_model';
  doc_language?: string;
  process_rule?: ProcessRule;
}

export interface DifyServiceConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export class DifyService {
  private client: AxiosInstance;
  private config: DifyServiceConfig;

  constructor(config: DifyServiceConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.dify.ai',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: config.timeout || 30000,
    });
  }

  async chat(query: string, inputs: Record<string, any> = {}, conversationId?: string): Promise<DifyResponse> {
    const request: DifyRequest = {
      inputs,
      query,
      response_mode: 'blocking',
      conversation_id: conversationId,
      user: 'cli-user',
    };

    try {
      const response = await this.client.post('/chat-messages', request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Dify API错误: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async *chatStream(query: string, inputs: Record<string, any> = {}, conversationId?: string): AsyncGenerator<string, void, unknown> {
    const request: DifyRequest = {
      inputs,
      query,
      response_mode: 'streaming',
      conversation_id: conversationId,
      user: 'cli-user',
    };

    try {
      const response = await this.client.post('/chat-messages', request, {
        responseType: 'stream',
      });

      const stream = response.data;
      
      for await (const chunk of stream) {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.answer) {
                yield data.answer;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Dify API错误: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async uploadToKnowledgeBase(request: KnowledgeBaseUploadRequest): Promise<any> {
    const formData = new FormData();
    formData.append('file', new Blob([request.file]), request.filename);
    
    const data: any = {};
    data.indexing_technique = 'high_quality';
    data.process_rule = { mode: 'automatic' };
    
    formData.append('data', JSON.stringify(data));

    try {
      const response = await this.client.post(
        `/datasets/${request.dataset_id}/document/create-by-file`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`上传失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async uploadTextToKnowledgeBase(
    knowledgeBaseId: string,
    content: string,
    filename: string,
    metadata?: Record<string, any>
  ): Promise<any> {
    try {
      const response = await this.client.post(
        `/datasets/${knowledgeBaseId}/document/create-by-text`,
        {
          name: filename,
          text: content,
          indexing_technique: 'high_quality',
          process_rule: { mode: 'automatic' }
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`上传文本失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async createDocumentByFile(
    datasetId: string,
    request: CreateDocumentByFileRequest
  ): Promise<{ document: Document; batch: string }> {
    const formData = new FormData();
    
    const data: any = {};
    if (request.indexing_technique) data.indexing_technique = request.indexing_technique;
    if (request.doc_form) data.doc_form = request.doc_form;
    if (request.doc_language) data.doc_language = request.doc_language;
    if (request.process_rule) data.process_rule = request.process_rule;
    
    if (Object.keys(data).length > 0) {
      formData.append('data', JSON.stringify(data));
    }
    
    formData.append('file', new Blob([request.file]), request.filename);

    try {
      const response = await this.client.post(
        `/datasets/${datasetId}/document/create-by-file`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`上传文档失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async listDatasets(
    keyword?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: Array<{
      id: string;
      name: string;
      description: string;
      provider: string;
      permission: string;
      data_source_type: string;
      indexing_technique: string;
      app_count: number;
      document_count: number;
      word_count: number;
      created_by: string;
      created_at: number;
      updated_at: number;
    }>;
    has_more: boolean;
    limit: number;
    total: number;
    page: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await this.client.get(`/datasets?${params.toString()}`);
      console.log(response);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`获取知识库列表失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async listDocuments(
    datasetId: string,
    keyword?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: Document[];
    has_more: boolean;
    limit: number;
    total: number;
    page: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await this.client.get(
        `/datasets/${datasetId}/documents?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`获取文档列表失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async getDocument(datasetId: string, documentId: string): Promise<Document> {
    try {
      const response = await this.client.get<Document>(
        `/datasets/${datasetId}/documents/${documentId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`获取文档详情失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async updateDocumentByText(
    datasetId: string,
    documentId: string,
    request: Partial<CreateDocumentByTextRequest>
  ): Promise<{ document: Document }> {
    try {
      const response = await this.client.post(
        `/datasets/${datasetId}/documents/${documentId}/update-by-text`,
        request
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`更新文档失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async deleteDocument(datasetId: string, documentId: string): Promise<void> {
    try {
      await this.client.delete(`/datasets/${datasetId}/documents/${documentId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`删除文档失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async getIndexingStatus(datasetId: string, batch: string): Promise<{
    data: Array<{
      id: string;
      indexing_status: string;
      processing_started_at?: number;
      parsing_completed_at?: number;
      cleaning_completed_at?: number;
      splitting_completed_at?: number;
      completed_at?: number;
      paused_at?: number;
      error?: string;
      stopped_at?: number;
      completed_segments?: number;
      total_segments?: number;
    }>;
  }> {
    try {
      const response = await this.client.get(
        `/datasets/${datasetId}/documents/${batch}/indexing-status`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`获取索引状态失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async listSegments(
    datasetId: string,
    documentId: string,
    keyword?: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: Segment[];
    has_more: boolean;
    limit: number;
    total: number;
    page: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await this.client.get(
        `/datasets/${datasetId}/documents/${documentId}/segments?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`获取分段列表失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async createSegments(
    datasetId: string,
    documentId: string,
    segments: Array<{
      content: string;
      answer?: string;
      keywords?: string[];
    }>
  ): Promise<{ data: Segment[] }> {
    try {
      const response = await this.client.post(
        `/datasets/${datasetId}/documents/${documentId}/segments`,
        { segments }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`创建分段失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async getSegment(
    datasetId: string,
    documentId: string,
    segmentId: string
  ): Promise<Segment> {
    try {
      const response = await this.client.get<Segment>(
        `/datasets/${datasetId}/documents/${documentId}/segments/${segmentId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`获取分段详情失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async updateSegment(
    datasetId: string,
    documentId: string,
    segmentId: string,
    segment: {
      content: string;
      answer?: string;
      keywords?: string[];
      enabled?: boolean;
      regenerate_child_chunks?: boolean;
    }
  ): Promise<{ data: Segment }> {
    try {
      const response = await this.client.post(
        `/datasets/${datasetId}/documents/${documentId}/segments/${segmentId}`,
        { segment }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`更新分段失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async deleteSegment(
    datasetId: string,
    documentId: string,
    segmentId: string
  ): Promise<void> {
    try {
      await this.client.delete(
        `/datasets/${datasetId}/documents/${documentId}/segments/${segmentId}`
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`删除分段失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async retrieve(
    datasetId: string,
    request: RetrievalRequest
  ): Promise<RetrievalResponse> {
    try {
      const response = await this.client.post<RetrievalResponse>(
        `/datasets/${datasetId}/retrieve`,
        request
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`检索失败: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }


  validateConfig(): boolean {
    if (!this.config.apiKey) {
      throw new Error('DIFY_API_KEY 未配置');
    }
    
    if (!this.config.baseUrl) {
      throw new Error('DIFY_BASE_URL 未配置');
    }

    return true;
  }
}