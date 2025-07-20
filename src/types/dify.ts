export interface DifyConfig {
  apiKey: string;
  baseUrl: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  provider: string;
  permission: string;
  data_source_type?: string;
  indexing_technique?: string;
  app_count: number;
  document_count: number;
  word_count: number;
  created_by: string;
  created_at: number;
  updated_by: string;
  updated_at: number;
  embedding_model?: string;
  embedding_model_provider?: string;
  embedding_available?: boolean;
  retrieval_model_dict?: RetrievalModel;
  tags?: any[];
  doc_form?: string;
}

export interface RetrievalModel {
  search_method: string;
  reranking_enable: boolean;
  reranking_mode?: string;
  reranking_model?: {
    reranking_provider_name: string;
    reranking_model_name: string;
  };
  weights?: number;
  top_k: number;
  score_threshold_enabled: boolean;
  score_threshold?: number;
}

export interface CreateKnowledgeBaseRequest {
  name: string;
  description?: string;
  indexing_technique?: 'high_quality' | 'economy';
  permission?: 'only_me' | 'all_team_members' | 'partial_members';
  provider?: 'vendor' | 'external';
  embedding_model?: string;
  embedding_model_provider?: string;
  retrieval_model?: RetrievalModel;
}

export interface DocumentUploadRequest {
  knowledge_base_id: string;
  file: File;
  metadata?: Record<string, any>;
}

export interface DocumentUploadResponse {
  id: string;
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  created_at: number;
}

export interface CreateDocumentByTextRequest {
  name: string;
  text: string;
  indexing_technique?: 'high_quality' | 'economy';
  doc_form?: 'text_model' | 'hierarchical_model' | 'qa_model';
  doc_language?: string;
  process_rule?: ProcessRule;
}

export interface ProcessRule {
  mode: 'automatic' | 'custom' | 'hierarchical';
  rules?: {
    pre_processing_rules?: PreProcessingRule[];
    segmentation?: SegmentationRule;
    parent_mode?: 'full-doc' | 'paragraph';
    subchunk_segmentation?: SubchunkSegmentationRule;
  };
}

export interface PreProcessingRule {
  id: 'remove_extra_spaces' | 'remove_urls_emails';
  enabled: boolean;
}

export interface SegmentationRule {
  separator: string;
  max_tokens: number;
  chunk_overlap?: number;
}

export interface SubchunkSegmentationRule {
  separator: string;
  max_tokens: number;
  chunk_overlap?: number;
}

export interface Document {
  id: string;
  position: number;
  data_source_type: string;
  data_source_info?: any;
  dataset_process_rule_id?: string;
  name: string;
  created_from: string;
  created_by: string;
  created_at: number;
  tokens: number;
  indexing_status: string;
  error?: string;
  enabled: boolean;
  disabled_at?: number;
  disabled_by?: string;
  archived: boolean;
  display_status: string;
  word_count: number;
  hit_count: number;
  doc_form: string;
  doc_language?: string;
}

export interface Segment {
  id: string;
  position: number;
  document_id: string;
  content: string;
  answer?: string;
  word_count: number;
  tokens: number;
  keywords: string[];
  index_node_id: string;
  index_node_hash: string;
  hit_count: number;
  enabled: boolean;
  status: string;
  created_by: string;
  created_at: number;
  indexing_at?: number;
  completed_at?: number;
  error?: string;
  stopped_at?: number;
}

export interface RetrievalRequest {
  query: string;
  retrieval_model?: RetrievalModel;
  metadata_filtering_conditions?: MetadataFilteringConditions;
}

export interface MetadataFilteringConditions {
  logical_operator: 'and' | 'or';
  conditions: MetadataCondition[];
}

export interface MetadataCondition {
  name: string;
  comparison_operator: string;
  value?: string | number | null;
}

export interface RetrievalResponse {
  query: {
    content: string;
  };
  records: Array<{
    segment: Segment;
    score: number;
    tsne_position?: any;
  }>;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: number;
}

export interface ChatRequest {
  query: string;
  knowledge_base_ids?: string[];
  streaming?: boolean;
}

export interface ChatResponse {
  answer: string;
  conversation_id?: string;
  metadata?: Record<string, any>;
}