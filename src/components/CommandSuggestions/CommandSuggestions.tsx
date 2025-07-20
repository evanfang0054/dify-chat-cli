import React from 'react';
import { Box, Text } from 'ink';
import { CommandSuggestionsProps } from './interface';

export const CommandSuggestions: React.FC<CommandSuggestionsProps> = ({ 
  commands, 
  selectedCommandIndex, 
  onSelect 
}) => {
  if (commands.length === 0) return null;
  
  return (
    <Box flexDirection="column">
      <Text color="yellow" bold>
        ⚡ 快捷命令
      </Text>
      <Box flexDirection="column" gap={0.25}>
        {commands.slice(0, 5).map((cmd, index) => (
          <Box key={cmd.value} flexDirection="row" gap={1}>
            <Text color={index === selectedCommandIndex ? 'yellow' : 'gray'}>
              {index === selectedCommandIndex ? '▶' : '○'}
            </Text>
            <Text color={index === selectedCommandIndex ? 'yellow' : 'gray'}>
              <Text bold>{cmd.value}</Text>
              <Text dimColor> - {cmd.label.split(' - ')[1]}</Text>
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}; 