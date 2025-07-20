import { useState, useCallback } from 'react';
import * as fs from 'fs';
import * as path from 'path';
import { DifyService } from '../../services/dify';
import { FileScanner } from '../../services/fileScanner';
import { FileUploadProgress, FileUploadResult } from '../../types';

interface UseFileUploadReturn {
  uploading: boolean;
  uploadProgress: FileUploadProgress;
  fileScanner: FileScanner | null;
  initFileScanner: (options: any) => void;
  uploadFiles: (paths: string[], knowledgeBaseId: string) => Promise<FileUploadResult[]>;
  extractFilePaths: (input: string) => string[];
}

export const useFileUpload = (difyService: DifyService) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress>({});
  const [fileScanner, setFileScanner] = useState<FileScanner | null>(null);

  // 防抖处理，减少闪烁
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const debouncedSetProgress = debounce((progress: FileUploadProgress) => {
    setUploadProgress(progress);
  }, 100);

  const initFileScanner = useCallback((options: any) => {
    const scanner = new FileScanner({
      includePatterns: options.includePatterns || [
        '**/*.{js,ts,tsx,jsx,py,java,go,rs,md,json,yaml,yml,txt,html,css,scss,less}',
      ],
      excludePatterns: options.excludePatterns || [
        'node_modules/**',
        '**/*.test.js',
        '**/*.spec.js',
        'dist/**',
        'build/**',
        '.git/**',
      ],
      maxFileSize: options.maxFileSize || 5242880, // 5MB
    });
    setFileScanner(scanner);
  }, []);

  const uploadFiles = useCallback(async (paths: string[], knowledgeBaseId: string): Promise<FileUploadResult[]> => {
    if (!fileScanner || !knowledgeBaseId) return [];
    
    setUploading(true);
    setUploadProgress({});
    const uploadResults: FileUploadResult[] = [];

    try {
      for (const filePath of paths) {
        try {
          const stats = fs.statSync(filePath);

          if (stats.isFile()) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const fileName = path.basename(filePath);

            setUploadProgress((prev) => ({ ...prev, [fileName]: 0 }));

            // 优化上传进度显示，减少闪烁
            const progressSteps = [0, 25, 50, 75, 100];
            for (const progress of progressSteps) {
              setUploadProgress((prev) => ({ ...prev, [fileName]: progress }));
              await new Promise((resolve) => setTimeout(resolve, 150));
            }

            await difyService.uploadTextToKnowledgeBase(knowledgeBaseId, content, fileName, {
              indexing_technique: 'high_quality',
              process_rule: { mode: 'automatic' },
            });

            uploadResults.push({ name: fileName, success: true });
          } else if (stats.isDirectory()) {
            // 扫描目录
            const result = await fileScanner.scanDirectory(filePath);

            for (const file of result.files) {
              const fileName = file.name;
              setUploadProgress((prev) => ({ ...prev, [fileName]: 0 }));

              for (let progress = 0; progress <= 100; progress += 25) {
                setUploadProgress((prev) => ({ ...prev, [fileName]: progress }));
                await new Promise((resolve) => setTimeout(resolve, 100));
              }

              await difyService.uploadTextToKnowledgeBase(knowledgeBaseId, file.content, file.name, {
                indexing_technique: 'high_quality',
                process_rule: { mode: 'automatic' },
              });

              uploadResults.push({ name: file.name, success: true });
            }
          }
        } catch (error) {
          uploadResults.push({
            name: filePath,
            success: false,
            error: error instanceof Error ? error.message : '未知错误',
          });
        }
      }
    } catch (error) {
      console.error('上传文件时发生错误:', error);
    } finally {
      setUploading(false);
    }

    return uploadResults;
  }, [difyService, fileScanner]);

  const extractFilePaths = useCallback((input: string): string[] => {
    // 智能提取文件路径
    const lines = input.trim().split(/\n+/);
    const paths: string[] = [];

    // 更精确的文件路径检测
    const pathPattern = /^(\.\.\/|\.\/|\/|[A-Z]:\\|~\/)[^\s]+$/;

    for (const line of lines) {
      const trimmed = line.trim().replace(/^["']|["']$/g, '');
      if (trimmed && (pathPattern.test(trimmed) || fs.existsSync(trimmed))) {
        paths.push(trimmed);
      }
    }

    // 也检查空格分隔的路径
    const spaceSeparated = input.trim().split(/\s+/);
    for (const part of spaceSeparated) {
      const trimmed = part.trim().replace(/^["']|["']$/g, '');
      if (trimmed && fs.existsSync(trimmed) && !paths.includes(trimmed)) {
        paths.push(trimmed);
      }
    }

    return paths;
  }, []);

  return {
    uploading,
    uploadProgress,
    fileScanner,
    initFileScanner,
    uploadFiles,
    extractFilePaths
  };
}; 