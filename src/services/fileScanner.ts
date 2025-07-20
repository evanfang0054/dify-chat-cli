import * as fs from 'fs';
import * as path from 'path';
import { FileInfo, DirectoryScanResult } from '../types/file';

export interface ScannerConfig {
  includePatterns: string[];
  excludePatterns: string[];
  maxFileSize: number;
  includeHidden?: boolean;
}

export class FileScanner {
  private config: ScannerConfig;

  constructor(config: ScannerConfig) {
    this.config = config;
  }

  async scanDirectory(dirPath: string): Promise<DirectoryScanResult> {
    const files: FileInfo[] = [];
    const largeFiles: FileInfo[] = [];
    let totalSize = 0;
    const languages = new Set<string>();

    try {
      await this.walkDirectory(dirPath, async (filePath) => {
        if (this.shouldIncludeFile(filePath)) {
          try {
            const stats = await fs.promises.stat(filePath);
            
            if (stats.isFile() && stats.size <= this.config.maxFileSize) {
              const content = await fs.promises.readFile(filePath, 'utf-8');
              const extension = path.extname(filePath).toLowerCase();
              const language = this.getLanguageFromExtension(extension);
              
              const fileInfo: FileInfo = {
                path: filePath,
                name: path.basename(filePath),
                size: stats.size,
                extension,
                content,
                language,
                lastModified: stats.mtime
              };

              files.push(fileInfo);
              languages.add(language);
              totalSize += stats.size;

              if (stats.size > this.config.maxFileSize * 0.8) {
                largeFiles.push(fileInfo);
              }
            }
          } catch (err) {
            // 忽略无法读取的文件
            console.warn(`跳过文件 ${filePath}: ${err}`);
          }
        }
      });

      const estimatedTokens = this.estimateTokens(files);
      let warning: string | undefined;

      if (estimatedTokens > 100000) {
        warning = `文档过大，预计token数: ${estimatedTokens.toLocaleString()}，建议分批处理`;
      }

      return {
        files,
        totalFiles: files.length,
        totalSize,
        languages: Array.from(languages),
        estimatedTokens,
        largeFiles,
        warning
      };
    } catch (error) {
      throw new Error(`扫描目录失败: ${error}`);
    }
  }

  async scanFile(filePath: string): Promise<FileInfo> {
    try {
      const stats = await fs.promises.stat(filePath);
      
      if (!stats.isFile()) {
        throw new Error('路径不是文件');
      }

      if (stats.size > this.config.maxFileSize) {
        throw new Error(`文件过大: ${(stats.size / 1024 / 1024).toFixed(2)}MB > ${(this.config.maxFileSize / 1024 / 1024).toFixed(2)}MB`);
      }

      const content = await fs.promises.readFile(filePath, 'utf-8');
      const extension = path.extname(filePath).toLowerCase();
      const language = this.getLanguageFromExtension(extension);

      return {
        path: filePath,
        name: path.basename(filePath),
        size: stats.size,
        extension,
        content,
        language,
        lastModified: stats.mtime
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`扫描文件失败: ${error.message}`);
      }
      throw new Error(`扫描文件失败: ${error}`);
    }
  }

  private async walkDirectory(
    dir: string, 
    callback: (filePath: string) => Promise<void>
  ): Promise<void> {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!this.shouldIgnoreDirectory(fullPath)) {
          await this.walkDirectory(fullPath, callback);
        }
      } else if (entry.isFile()) {
        await callback(fullPath);
      }
    }
  }

  private shouldIncludeFile(filePath: string): boolean {
    const relativePath = path.relative(process.cwd(), filePath);
    
    // 检查排除模式
    for (const pattern of this.config.excludePatterns) {
      if (this.matchesPattern(relativePath, pattern)) {
        return false;
      }
    }

    // 检查隐藏文件
    if (!this.config.includeHidden && path.basename(filePath).startsWith('.')) {
      return false;
    }

    // 检查包含模式
    for (const pattern of this.config.includePatterns) {
      if (this.matchesPattern(relativePath, pattern)) {
        return true;
      }
    }

    return this.config.includePatterns.length === 0;
  }

  private shouldIgnoreDirectory(dirPath: string): boolean {
    const relativePath = path.relative(process.cwd(), dirPath);
    
    for (const pattern of this.config.excludePatterns) {
      if (this.matchesPattern(relativePath, pattern)) {
        return true;
      }
    }

    return false;
  }

  private matchesPattern(filePath: string, pattern: string): boolean {
    const regex = new RegExp(
      pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '.')
    );
    return regex.test(filePath);
  }

  private getLanguageFromExtension(extension: string): string {
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala',
      '.md': 'markdown',
      '.json': 'json',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.xml': 'xml',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.less': 'less',
      '.sql': 'sql',
      '.sh': 'shell',
      '.bash': 'shell',
      '.zsh': 'shell',
      '.fish': 'shell',
      '.ps1': 'powershell',
      '.dockerfile': 'dockerfile',
      '.env': 'env',
      '.txt': 'text',
      '.log': 'log',
      '.conf': 'config',
      '.ini': 'config',
      '.toml': 'config',
    };

    return languageMap[extension] || 'text';
  }

  private estimateTokens(files: FileInfo[]): number {
    // 粗略估计：1个token约等于4个字符
    const totalChars = files.reduce((sum, file) => sum + file.content.length, 0);
    return Math.ceil(totalChars / 4);
  }

  async scanPath(inputPath: string): Promise<FileInfo | DirectoryScanResult> {
    try {
      const stats = await fs.promises.stat(inputPath);
      
      if (stats.isFile()) {
        return await this.scanFile(inputPath);
      } else if (stats.isDirectory()) {
        return await this.scanDirectory(inputPath);
      } else {
        throw new Error('路径既不是文件也不是目录');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`扫描路径失败: ${error.message}`);
      }
      throw new Error(`扫描路径失败: ${error}`);
    }
  }
}