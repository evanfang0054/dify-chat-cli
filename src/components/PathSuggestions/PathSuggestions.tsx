import React from 'react';
import { Box, Text } from 'ink';
import { PathSuggestionsProps } from './interface';

export const PathSuggestions: React.FC<PathSuggestionsProps> = ({ 
  pathSuggestions, 
  selectedPathIndex, 
  onSelect 
}) => {
  if (pathSuggestions.length === 0) return null;

  return (
    <Box flexDirection="column">
      <Text color="cyan" bold>
        📁 智能路径
      </Text>
      <Box flexDirection="column" gap={0.25}>
        {pathSuggestions.map((suggestion, index) => {
          const isDirectory = suggestion.endsWith('/');
          const icon = isDirectory ? '📂' : '📄';
          return (
            <Box key={index} flexDirection="row" gap={1}>
              <Text color={index === selectedPathIndex ? 'cyan' : 'gray'}>
                {index === selectedPathIndex ? '▶' : '○'}
              </Text>
              <Text color={index === selectedPathIndex ? 'cyan' : 'gray'}>
                {icon} {suggestion}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}; 