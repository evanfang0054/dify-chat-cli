import { configService } from '../../services/config';
import { FileScanner } from '../../services/fileScanner';

/**
 * 初始化文件扫描器
 */
export const initializeFileScanner = async (): Promise<FileScanner> => {
  const config = await configService.loadConfig();
  return new FileScanner({
    includePatterns: config.scan?.includePatterns || [
      '**/*.{js,ts,tsx,jsx,py,java,go,rs,md,json,yaml,yml,txt,html,css,scss,less}',
    ],
    excludePatterns: config.scan?.excludePatterns || [
      'node_modules/**',
      '**/*.test.js',
      '**/*.spec.js',
      'dist/**',
      'build/**',
      '.git/**',
    ],
    maxFileSize: config.scan?.maxFileSize || 5242880, // 5MB
  });
}; 