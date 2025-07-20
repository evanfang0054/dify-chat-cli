export interface PathSuggestionsProps {
  pathSuggestions: string[];
  selectedPathIndex: number;
  onSelect: (path: string) => void;
} 