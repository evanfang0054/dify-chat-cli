import { KnowledgeBase } from '../../types';

export interface KnowledgeBaseSelectorProps {
  knowledgeBases: KnowledgeBase[];
  loadingKbs: boolean;
  kbError: string | null;
  onSelect: (kb: KnowledgeBase) => void;
} 