export interface ContextLimits {
  maxTokens: number;
  currentTokens: number;
  warningThreshold: number;
}

export class ContextManager {
  private static readonly ESTIMATED_TOKENS_PER_CHAR = 4;
  private static readonly MAX_TOKENS = 8000; // 预留空间给响应
  private static readonly WARNING_THRESHOLD = 6000;

  static estimateTokens(text: string): number {
    return Math.ceil(text.length * this.ESTIMATED_TOKENS_PER_CHAR);
  }

  static analyzeFiles(files: any[]): {
    manageableFiles: any[];
    largeFiles: any[];
    totalTokens: number;
    strategy: 'single' | 'batch' | 'summary' | 'hierarchical';
  } {
    const totalTokens = files.reduce((sum, file) => sum + this.estimateTokens(file.content || ''), 0);
    
    const largeFiles = files.filter(file => this.estimateTokens(file.content || '') > 4000);
    const manageableFiles = files.filter(file => this.estimateTokens(file.content || '') <= 4000);

    let strategy: 'single' | 'batch' | 'summary' | 'hierarchical' = 'single';

    if (totalTokens <= 4000) {
      strategy = 'single';
    } else if (totalTokens <= 8000) {
      strategy = 'batch';
    } else if (largeFiles.length > 0) {
      strategy = 'hierarchical';
    } else {
      strategy = 'summary';
    }

    return {
      manageableFiles,
      largeFiles,
      totalTokens,
      strategy,
    };
  }

  static createFileSummary(file: any): string {
    const content = file.content || '';
    const lines = content.split('\n');
    const estimatedTokens = this.estimateTokens(content);

    return `文件: ${file.name}
大小: ${(file.size / 1024).toFixed(2)}KB
行数: ${lines.length}
估计tokens: ${estimatedTokens}
语言: ${file.language}
路径: ${file.path}`;
  }

  static splitLargeFile(file: any, maxChunkSize = 4000): any[] {
    const content = file.content || '';
    const chunks = [];
    
    // 按函数/类边界智能拆分
    const boundaries = this.findCodeBoundaries(content);
    
    if (boundaries.length > 1) {
      // 按边界拆分
      for (let i = 0; i < boundaries.length - 1; i++) {
        const chunk = content.substring(boundaries[i], boundaries[i + 1]);
        if (chunk.trim()) {
          chunks.push({
            ...file,
            content: chunk,
            chunk: i + 1,
            totalChunks: boundaries.length - 1,
          });
        }
      }
    } else {
      // 按行数拆分
      const lines = content.split('\n');
      const linesPerChunk = Math.floor(maxChunkSize / this.ESTIMATED_TOKENS_PER_CHAR / 80); // 假设平均80字符/行
      
      for (let i = 0; i < lines.length; i += linesPerChunk) {
        const chunk = lines.slice(i, i + linesPerChunk).join('\n');
        chunks.push({
          ...file,
          content: chunk,
          chunk: Math.floor(i / linesPerChunk) + 1,
          totalChunks: Math.ceil(lines.length / linesPerChunk),
        });
      }
    }

    return chunks;
  }

  private static findCodeBoundaries(content: string): number[] {
    const boundaries = [0];
    
    // 查找函数定义
    const functionRegex = /(?:function|const|let|var)\s+\w+\s*[(:]|(?:async\s+)?(?:function\s+)?\w+\s*\(/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      boundaries.push(match.index);
    }

    // 查找类定义
    const classRegex = /(?:class|interface)\s+\w+/g;
    while ((match = classRegex.exec(content)) !== null) {
      boundaries.push(match.index);
    }

    boundaries.push(content.length);
    boundaries.sort((a, b) => a - b);
    
    return [...new Set(boundaries)]; // 去重
  }

  static generateContextWarning(totalTokens: number, maxTokens: number = this.MAX_TOKENS): string | null {
    const warningThreshold = this.WARNING_THRESHOLD;
    
    if (totalTokens > maxTokens) {
      return `⚠️  总token数(${totalTokens})超出限制(${maxTokens})，将使用分层处理策略`;
    }
    
    if (totalTokens > warningThreshold) {
      return `⚠️  总token数(${totalTokens})接近限制(${maxTokens})，建议分批处理`;
    }

    return null;
  }
} 