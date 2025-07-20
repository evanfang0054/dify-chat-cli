import { useState, useCallback } from 'react';
import * as fs from 'fs';
import * as path from 'path';
import { FileScanner } from '../../services/fileScanner';

interface UsePathSuggestionsReturn {
  pathSuggestions: string[];
  showPathSuggestions: boolean;
  selectedPathIndex: number;
  setShowPathSuggestions: (show: boolean) => void;
  setSelectedPathIndex: (indexOrFn: number | ((prev: number) => number)) => void;
  handlePathSuggestions: (value: string) => void;
  selectPath: (index: number) => string | null;
}

export const usePathSuggestions = (fileScanner: FileScanner | null): UsePathSuggestionsReturn => {
  const [pathSuggestions, setPathSuggestions] = useState<string[]>([]);
  const [showPathSuggestions, setShowPathSuggestions] = useState(false);
  const [selectedPathIndex, setSelectedPathIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');

  const handlePathSuggestions = useCallback((value: string) => {
    if (!fileScanner) {
      setShowPathSuggestions(false);
      return;
    }

    setCurrentInput(value);

    // 提取可能的文件路径
    const words = value.trim().split(/\s+/);
    const lastWord = words[words.length - 1];

    if (!lastWord || lastWord.length < 1) {
      setShowPathSuggestions(false);
      setSelectedPathIndex(0);
      return;
    }

    try {
      // 智能路径推导
      let searchPath = lastWord;
      let baseDir = process.cwd();

      // 处理相对路径和绝对路径
      if (searchPath.startsWith('./')) {
        searchPath = searchPath.substring(2);
      } else if (searchPath.startsWith('../')) {
        // 处理多级上级目录
        const upLevels = (searchPath.match(/\.\.\//g) || []).length;
        searchPath = searchPath.substring(upLevels * 3);
        baseDir = path.resolve(process.cwd(), '../'.repeat(upLevels));
      } else if (searchPath.startsWith('/')) {
        searchPath = searchPath.substring(1);
        baseDir = '/';
      } else if (searchPath.startsWith('~')) {
        searchPath = searchPath.substring(1);
        baseDir = require('os').homedir();
      }

      // 处理目录补全
      let targetDir = baseDir;
      let filePrefix = searchPath;

      // 检查是否包含目录路径
      const lastSlashIndex = searchPath.lastIndexOf('/');
      if (lastSlashIndex !== -1) {
        const dirPart = searchPath.substring(0, lastSlashIndex);
        filePrefix = searchPath.substring(lastSlashIndex + 1);
        targetDir = path.resolve(baseDir, dirPart);
      }

      // 获取目录内容
      if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
        setShowPathSuggestions(false);
        setSelectedPathIndex(0);
        return;
      }

      const items = fs.readdirSync(targetDir, { withFileTypes: true });
      
      // 过滤和排序建议
      const suggestions = items
        .filter(item => {
          const name = item.name;
          const fullPath = path.join(targetDir, name);
          const relativePath = path.relative(process.cwd(), fullPath);

          // 隐藏隐藏文件
          if (name.startsWith('.') && !filePrefix.startsWith('.')) return false;

          // 名称匹配
          if (!name.toLowerCase().includes(filePrefix.toLowerCase())) return false;

          // 如果是目录，直接通过
          if (item.isDirectory()) return true;

          // 文件类型过滤 - 简化版本，避免minimatch依赖
          const supportedExtensions = ['.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.go', '.rs', 
                                     '.md', '.json', '.yaml', '.yml', '.txt', '.html', '.css', '.scss', '.less'];
          const ext = path.extname(name).toLowerCase();
          const isSupported = supportedExtensions.includes(ext);
          
          // 排除常见构建目录
          const isExcluded = name.includes('node_modules') || 
                           name.includes('.git') || 
                           name.includes('dist') || 
                           name.includes('build') ||
                           name.includes('.test.') ||
                           name.includes('.spec.');

          return isSupported && !isExcluded;
        })
        .sort((a, b) => {
          // 目录优先排序
          if (a.isDirectory() && !b.isDirectory()) return -1;
          if (!a.isDirectory() && b.isDirectory()) return 1;
          return a.name.localeCompare(b.name);
        })
        .slice(0, 8)
        .map(item => {
          const fullPath = path.join(targetDir, item.name);
          const relativePath = path.relative(process.cwd(), fullPath);
          
          // 构建显示路径
          let displayPath = '';
          if (lastWord.startsWith('/')) {
            displayPath = fullPath;
          } else if (lastWord.startsWith('~')) {
            displayPath = '~' + fullPath.replace(require('os').homedir(), '');
          } else {
            displayPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
          }

          // 添加目录标记
          return item.isDirectory() ? displayPath + '/' : displayPath;
        });

      setPathSuggestions(suggestions);
      setShowPathSuggestions(suggestions.length > 0);
      setSelectedPathIndex(0); // 重置选择索引
    } catch (error) {
      setShowPathSuggestions(false);
      setSelectedPathIndex(0);
    }
  }, [fileScanner]);

  const selectPath = useCallback((index: number): string | null => {
    if (index < 0 || index >= pathSuggestions.length) return null;
    
    const suggestedPath = pathSuggestions[index];
    const words = currentInput.trim().split(/\s+/);
    words[words.length - 1] = suggestedPath;
    return words.join(' ');
  }, [pathSuggestions, currentInput]);

  return {
    pathSuggestions,
    showPathSuggestions,
    selectedPathIndex,
    setShowPathSuggestions,
    setSelectedPathIndex,
    handlePathSuggestions,
    selectPath
  };
}; 