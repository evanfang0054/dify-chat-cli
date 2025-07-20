import React from 'react';
import { Box, Text } from 'ink';
import { StatusBarProps } from './interface';

export const StatusBar: React.FC<StatusBarProps> = ({ 
  selectedKb, 
  selectedKbName, 
  isTyping, 
  messageCount 
}) => {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      paddingLeft={2}
      paddingRight={2}
      paddingTop={0.5}
      paddingBottom={0.5}
      borderStyle="single"
      borderColor="cyan"
      borderTop={false}
      borderLeft={false}
      borderRight={false}
    >
      <Box flexDirection="row" gap={1}>
        <Text color="cyan" bold>
          {selectedKb ? `📚 ${selectedKbName}` : '🔍 选择知识库'}
        </Text>
        {selectedKb && (
          <Text color="gray" dimColor>
            已连接
          </Text>
        )}
      </Box>
      <Box flexGrow={1} />
      <Box flexDirection="row" gap={2}>
        <Text color="blue" dimColor>
          {isTyping ? '⚡ 处理中' : '💡 就绪'}
        </Text>
        <Text color="gray" dimColor>
          {messageCount} 条消息
        </Text>
      </Box>
    </Box>
  );
}; 