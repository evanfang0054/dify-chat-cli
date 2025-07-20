import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { ChatInputProps } from './interface';
import { getPlaceholderText, getContextHelp } from './helpers';

export const ChatInput: React.FC<ChatInputProps> = ({ 
  inputValue, 
  selectedKb, 
  showPathSuggestions,
  showCommandSuggestions,
  onChange, 
  onSubmit 
}) => {
  return (
    <Box flexDirection="column" padding={1}>
      {/* 现代化输入框 */}
      <Box 
        flexDirection="row" 
        alignItems="center" 
        borderStyle="round"
        borderColor={inputValue ? "cyan" : "gray"}
        paddingLeft={1}
        paddingRight={1}
      >
        <Text color={selectedKb ? "green" : "yellow"} bold>
          {selectedKb ? '❯' : '❯'}
        </Text>
        <TextInput
          value={inputValue}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={getPlaceholderText(selectedKb, inputValue)}
          showCursor={true}
          highlightPastedText={true}
        />
      </Box>

      {/* 智能上下文提示 */}
      <Box marginTop={0.5}>
        <Text color="gray" dimColor>
          {getContextHelp(inputValue, selectedKb, showPathSuggestions, showCommandSuggestions)}
        </Text>
      </Box>
    </Box>
  );
}; 