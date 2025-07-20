export interface ChatInputProps {
  inputValue: string;
  selectedKb: string | null;
  showPathSuggestions: boolean;
  showCommandSuggestions: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
} 