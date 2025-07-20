import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { ChatMessagesProps } from './interface';
import { formatTime, formatContent } from './helpers';

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isTyping }) => {
  const renderMessage = (message: any, index: number) => {
    const isSystem = message.role === 'system';
    const isUser = message.role === 'user';
    
    if (isSystem) {
      const lines = formatContent(message.content, true);
      return (
        <Box key={index} flexDirection="column" marginY={1}>
          <Box 
            flexDirection="column" 
            borderStyle="round" 
            borderColor="cyan" 
            borderDimColor
            padding={1}
          >
            <Box flexDirection="row" alignItems="center" gap={1} marginBottom={0.5}>
              <Text color="cyan" bold>
                💡 系统消息
              </Text>
              <Text color="gray" dimColor>
                {formatTime(message.timestamp)}
              </Text>
            </Box>
            <Box flexDirection="column" gap={0.25}>
              {lines.map((line: string, i: number) => (
                <Text key={i} color="cyan" wrap="wrap">
                  {line}
                </Text>
              ))}
            </Box>
          </Box>
        </Box>
      );
    }

    return (
      <Box key={index} flexDirection="column" marginY={0.5}>
        <Box 
          flexDirection="row" 
          alignItems="flex-start"
          justifyContent={isUser ? 'flex-end' : 'flex-start'}
          gap={1}
        >
          <Box 
            flexDirection="column" 
            borderStyle="round"
            borderColor={isUser ? 'blue' : 'green'}
            borderDimColor={!isUser}
            padding={1}
          >
            <Box flexDirection="row" alignItems="center" gap={1} marginBottom={0.5}>
              <Text color={isUser ? 'white' : 'green'} bold>
                {isUser ? '👤 你' : '🤖 AI'}
              </Text>
              <Text color="gray" dimColor>
                {formatTime(message.timestamp)}
              </Text>
            </Box>
            
            <Text color={isUser ? 'white' : 'white'} wrap="wrap">
              {message.content}
            </Text>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box flexDirection="column" flexGrow={1}>
        {messages.map(renderMessage)}
        
        {/* AI思考状态 - 现代化动画 */}
        {isTyping && (
          <Box flexDirection="column" marginTop={1} marginBottom={1}>
            <Box 
              flexDirection="row" 
              alignItems="center" 
              gap={1}
              borderStyle="round"
              borderColor="yellow"
              borderDimColor
              padding={1}
            >
              <Text color="yellow">
                <Spinner type="dots" />
              </Text>
              <Box flexDirection="column">
                <Text color="yellow" bold>
                  🤖 AI 思考中...
                </Text>
                <Text color="gray" dimColor>
                  正在分析您的消息
                </Text>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      
      {/* 空状态提示 - 现代化欢迎界面 */}
      {messages.length === 0 && !isTyping && (
        <Box 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          flexGrow={1}
          gap={1}
        >
          <Text color="cyan">
            🚀
          </Text>
          <Box flexDirection="column" alignItems="center" gap={0.5}>
            <Text color="cyan" bold>
              欢迎使用 Dify Chat
            </Text>
            <Text color="gray" dimColor>
              开始您的AI知识库对话
            </Text>
            <Text color="gray" dimColor>
              输入 @help 查看所有命令
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}; 