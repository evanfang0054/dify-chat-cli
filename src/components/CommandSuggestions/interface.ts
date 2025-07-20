import { Command } from '../../types';

export interface CommandSuggestionsProps {
  commands: Command[];
  selectedCommandIndex: number;
  onSelect: (command: Command) => void;
}