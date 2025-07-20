import { useState, useCallback } from 'react';
import { DifyService } from '../../services/dify';
import { KnowledgeBase } from '../../types';

interface UseKnowledgeBaseReturn {
  knowledgeBases: KnowledgeBase[];
  loadingKbs: boolean;
  kbError: string | null;
  selectedKb: string | null;
  selectedKbName: string;
  loadKnowledgeBases: () => Promise<void>;
  selectKnowledgeBase: (kb: KnowledgeBase) => void;
}

export const useKnowledgeBase = (difyService: DifyService): UseKnowledgeBaseReturn => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loadingKbs, setLoadingKbs] = useState(false);
  const [kbError, setKbError] = useState<string | null>(null);
  const [selectedKb, setSelectedKb] = useState<string | null>(null);
  const [selectedKbName, setSelectedKbName] = useState<string>('');

  const loadKnowledgeBases = useCallback(async () => {
    try {
      setLoadingKbs(true);
      setKbError(null);
      const response = await difyService.listDatasets('', 1, 20);
      setKnowledgeBases(response.data);
    } catch (err) {
      setKbError(err instanceof Error ? err.message : '加载知识库失败');
    } finally {
      setLoadingKbs(false);
    }
  }, [difyService]);

  const selectKnowledgeBase = useCallback((kb: KnowledgeBase) => {
    setSelectedKb(kb.id);
    setSelectedKbName(kb.name);
  }, []);

  return {
    knowledgeBases,
    loadingKbs,
    kbError,
    selectedKb,
    selectedKbName,
    loadKnowledgeBases,
    selectKnowledgeBase
  };
}; 