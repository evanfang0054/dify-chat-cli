import { useState, useCallback } from 'react';
import { Command } from '../../types';

interface UseCommandSuggestionsReturn {
  commands: Command[];
  showCommandSuggestions: boolean;
  selectedCommandIndex: number;
  setShowCommandSuggestions: (show: boolean) => void;
  setSelectedCommandIndex: (indexOrFn: number | ((prev: number) => number)) => void;
  handleCommandChange: (input: string) => void;
  getFilteredCommands: (input: string) => Command[];
  handleCommandSelect: (command: Command) => void;
}

export const useCommandSuggestions = (
  onCommandSelect: (command: string) => void
): UseCommandSuggestionsReturn => {
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  
  const commands: Command[] = [
    { label: '@kb - 选择知识库', value: '@kb' },
    { label: '@upload - 上传文档', value: '@upload' },
    { label: '@help - 显示帮助', value: '@help' },
  ];

  const handleCommandChange = useCallback((input: string) => {
    if (input.startsWith('@') && input.length > 0) {
      setShowCommandSuggestions(true);
      setSelectedCommandIndex(0);
    } else {
      setShowCommandSuggestions(false);
    }
  }, []);

  const getFilteredCommands = useCallback((input: string) => {
    return commands.filter(
      (cmd) => cmd.value.startsWith(input) || cmd.label.toLowerCase().includes(input.toLowerCase())
    );
  }, [commands]);

  const handleCommandSelect = useCallback((command: Command) => {
    onCommandSelect(command.value);
    setShowCommandSuggestions(false);
    setSelectedCommandIndex(0);
  }, [onCommandSelect]);

  return {
    commands,
    showCommandSuggestions,
    selectedCommandIndex,
    setShowCommandSuggestions,
    setSelectedCommandIndex,
    handleCommandChange,
    getFilteredCommands,
    handleCommandSelect
  };
}; 