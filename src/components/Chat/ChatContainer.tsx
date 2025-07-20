import React, { useState, useEffect } from 'react';
import { Box, useInput, useApp } from 'ink';
import { ChatContainerProps } from './interface';
import { useChat } from '../../common/hooks/useChat';
import { useKnowledgeBase } from '../../common/hooks/useKnowledgeBase';
import { useFileUpload } from '../../common/hooks/useFileUpload';
import { usePathSuggestions } from '../../common/hooks/usePathSuggestions';
import { useCommandSuggestions } from '../../common/hooks/useCommandSuggestions';
import { ChatMessages } from '../ChatMessages';
import { ChatInput } from '../ChatInput';
import { StatusBar } from '../StatusBar';
import { KnowledgeBaseSelector } from '../KnowledgeBaseSelector';
import { FileUploader } from '../FileUploader';
import { CommandSuggestions } from '../CommandSuggestions';
import { PathSuggestions } from '../PathSuggestions';
import { initializeFileScanner } from './helpers';
import { Command, KnowledgeBase } from '../../types';

export const ChatContainer: React.FC<ChatContainerProps> = ({ difyService, openaiService }) => {
  const { exit } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [showKbSelector, setShowKbSelector] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  // 使用自定义钩子
  const {
    knowledgeBases,
    loadingKbs,
    kbError,
    selectedKb,
    selectedKbName,
    loadKnowledgeBases,
    selectKnowledgeBase
  } = useKnowledgeBase(difyService);

  const {
    messages,
    isTyping,
    sendMessage,
    addSystemMessage
  } = useChat(difyService, openaiService, selectedKb);

  const {
    uploading,
    uploadProgress,
    fileScanner,
    initFileScanner,
    uploadFiles,
    extractFilePaths
  } = useFileUpload(difyService);

  const {
    pathSuggestions,
    showPathSuggestions,
    selectedPathIndex,
    setShowPathSuggestions,
    setSelectedPathIndex,
    handlePathSuggestions,
    selectPath
  } = usePathSuggestions(fileScanner);

  const handleCommandSubmit = async (command: string) => {
    setInputValue('');
    setShowCommandSuggestions(false);
    setSelectedCommandIndex(0);
    setShowPathSuggestions(false);

    // 处理命令
    if (command.startsWith('@')) {
      const cmd = command.toLowerCase().trim();

      if (cmd === '@kb' || cmd === '@knowledge') {
        setShowKbSelector(true);
        setInputValue('');
        return; // 重要：执行命令后不再继续处理
      } else if (cmd === '@upload') {
        if (!selectedKb) {
          addSystemMessage('请先选择知识库，使用 @kb 命令选择');
          setInputValue('');
          return;
        }
        addSystemMessage(
          '💡 上传模式已激活！\n• 直接输入文件路径: ./src/main.js\n• 输入目录路径: ./src\n• 拖拽文件路径到聊天框\n• 支持多个路径，用空格分隔\n• 输入完成后按回车开始上传'
        );
        setInputValue('');
        return; // 重要：执行命令后不再继续处理
      } else if (cmd === '@help') {
        addSystemMessage(
          '🚀 可用命令：\n@kb - 选择知识库\n@upload - 上传文档\n@help - 显示帮助\n\n📁 文件上传：\n• 直接输入文件或目录路径\n• 支持相对路径和绝对路径\n• 支持通配符和批量上传\n• 拖拽文件到聊天框自动识别'
        );
        setInputValue('');
        return; // 重要：执行命令后不再继续处理
      } else {
        setInputValue('');
        return; // 重要：执行命令后不再继续处理
      }
    } else if (command.trim()) {
      // 普通消息或文件路径
      if (!selectedKb) {
        addSystemMessage('请先选择知识库，使用 @kb 命令选择');
        setInputValue('');
        return;
      }

      // 检测是否为文件上传
      const paths = extractFilePaths(command);
      if (paths.length > 0) {
        const results = await uploadFiles(paths, selectedKb);
        
        const successCount = results.filter((r) => r.success).length;
        const errorCount = results.filter((r) => !r.success).length;

        if (successCount > 0) {
          addSystemMessage(`✅ 成功上传 ${successCount} 个文档到知识库 "${selectedKbName}"`);
        }

        if (errorCount > 0) {
          const errors = results.filter((r) => !r.success).slice(0, 3);
          addSystemMessage(
            `❌ ${errorCount} 个文件上传失败：\n${errors.map((e) => `- ${e.name}: ${e.error}`).join('\n')}`
          );
        }
        
        setInputValue('');
        return;
      }

      // 普通聊天消息
      sendMessage(command);
      setInputValue('');
    }
  };

  const {
    commands,
    showCommandSuggestions,
    selectedCommandIndex,
    setShowCommandSuggestions,
    setSelectedCommandIndex,
    handleCommandChange,
    getFilteredCommands,
    handleCommandSelect
  } = useCommandSuggestions(handleCommandSubmit);

  // 添加状态提示，避免频繁更新
  const setStatus = (status: string) => {
    setCurrentStatus(status);
    if (status) {
      setTimeout(() => setCurrentStatus(''), 2000);
    }
  };

  // 初始化文件扫描器
  useEffect(() => {
    const init = async () => {
      try {
        const scanner = await initializeFileScanner();
        // 使用类型断言避免类型错误
        initFileScanner({
          includePatterns: (scanner as any).options?.includePatterns || [],
          excludePatterns: (scanner as any).options?.excludePatterns || [],
          maxFileSize: (scanner as any).options?.maxFileSize || 5242880
        });
      } catch (error) {
        console.error('初始化文件扫描器失败:', error);
      }
    };

    init();
  }, [initFileScanner]);

  // 加载知识库列表
  useEffect(() => {
    if (showKbSelector) {
      loadKnowledgeBases();
    }
  }, [showKbSelector, loadKnowledgeBases]);

  // 处理键盘输入
  useInput((_input, key) => {
    if (key.escape) {
      if (showKbSelector) {
        setShowKbSelector(false);
      } else if (showPathSuggestions) {
        setShowPathSuggestions(false);
      } else if (uploading) {
        // 取消上传
      } else {
        exit();
      }
    }

    // 处理路径补全
    if (showPathSuggestions && pathSuggestions.length > 0) {
      if (key.tab || key.return) {
        // Tab键或回车补全当前选择的建议
        const newValue = selectPath(selectedPathIndex);
        if (newValue) {
          setInputValue(newValue);
          setShowPathSuggestions(false);
          setSelectedPathIndex(0);
        }
        return;
      }
      if (key.upArrow) {
        setSelectedPathIndex((prev: number) => 
          prev > 0 ? prev - 1 : pathSuggestions.length - 1
        );
        return;
      }
      if (key.downArrow) {
        setSelectedPathIndex((prev: number) => 
          prev < pathSuggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
    }

    // 处理命令选择
    if (showCommandSuggestions) {
      if (key.upArrow) {
        setSelectedCommandIndex((prev: number) => (prev > 0 ? prev - 1 : commands.length - 1));
        return;
      }
      if (key.downArrow) {
        setSelectedCommandIndex((prev: number) => (prev < commands.length - 1 ? prev + 1 : 0));
        return;
      }
      if (key.return) {
        const filteredCommands = getFilteredCommands(inputValue);
        if (filteredCommands.length > 0 && selectedCommandIndex < filteredCommands.length) {
          const selectedCommand = filteredCommands[selectedCommandIndex];
          handleCommandSelect(selectedCommand);
        }
        return;
      }
    }
  });

  const handleInputChange = (value: string) => {
    setInputValue(value);

    // 智能路径提示
    if (value.trim()) {
      handlePathSuggestions(value);
    } else {
      setShowPathSuggestions(false);
      setSelectedPathIndex(0);
    }

    // 显示命令建议
    handleCommandChange(value);
  };

  const handleKnowledgeBaseSelect = (kb: KnowledgeBase) => {
    selectKnowledgeBase(kb);
    setShowKbSelector(false);
    setInputValue('');
  };

  // 知识库选择器
  if (showKbSelector) {
    return (
      <KnowledgeBaseSelector 
        knowledgeBases={knowledgeBases} 
        loadingKbs={loadingKbs} 
        kbError={kbError} 
        onSelect={handleKnowledgeBaseSelect} 
      />
    );
  }

  // 上传进度显示
  if (uploading) {
    return (
      <FileUploader 
        uploading={uploading} 
        uploadProgress={uploadProgress} 
        onCancel={() => {}} 
      />
    );
  }

  // 主聊天界面
  return (
    <Box flexDirection="column" height="100%">
      {/* 状态栏 */}
      <StatusBar 
        selectedKb={selectedKb}
        selectedKbName={selectedKbName}
        isTyping={isTyping}
        messageCount={messages.length}
      />

      {/* 主消息区域 */}
      <Box 
        flexGrow={1} 
        flexDirection="column" 
        padding={1}
        borderStyle="single"
        borderColor="gray"
        borderTop={false}
        borderBottom={false}
        borderLeft={false}
        borderRight={false}
      >
        <ChatMessages messages={messages} isTyping={isTyping} />
      </Box>

      {/* 智能输入区域 */}
      <Box flexDirection="column" padding={0}>
        {/* 动态建议面板 */}
        {(showPathSuggestions || showCommandSuggestions) && (
          <Box 
            flexDirection="column" 
            marginBottom={1}
            borderStyle="round"
            borderColor="cyan"
            padding={1}
          >
            {showPathSuggestions && pathSuggestions.length > 0 && (
              <PathSuggestions 
                pathSuggestions={pathSuggestions}
                selectedPathIndex={selectedPathIndex}
                onSelect={() => {}}
              />
            )}
            
            {showCommandSuggestions && getFilteredCommands(inputValue).length > 0 && (
              <CommandSuggestions
                commands={getFilteredCommands(inputValue)}
                selectedCommandIndex={selectedCommandIndex}
                onSelect={handleCommandSelect}
              />
            )}
          </Box>
        )}

        {/* 输入框 */}
        <ChatInput 
          inputValue={inputValue}
          selectedKb={selectedKb}
          showPathSuggestions={showPathSuggestions}
          showCommandSuggestions={showCommandSuggestions}
          onChange={handleInputChange}
          onSubmit={handleCommandSubmit}
        />
      </Box>
    </Box>
  );
};