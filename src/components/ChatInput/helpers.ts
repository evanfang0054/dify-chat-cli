/**
 * 获取智能占位符文本
 */
export const getPlaceholderText = (selectedKb: string | null, inputValue: string): string => {
  if (!selectedKb) return '@kb 选择知识库开始对话...';
  if (inputValue.startsWith('@')) return '输入命令...';
  return '输入消息、@命令 或拖入文件上传...';
};

/**
 * 获取动态上下文帮助
 */
export const getContextHelp = (
  inputValue: string, 
  selectedKb: string | null, 
  showPathSuggestions: boolean,
  showCommandSuggestions: boolean
): string => {
  if (inputValue.startsWith('@')) {
    return '↑↓ 选择 • Enter 执行 • ESC 取消';
  }
  if (showPathSuggestions) {
    return '↑↓ 选择 • Tab/Enter 补全 • ESC 取消';
  }
  if (!selectedKb) {
    return '@kb 选择 • @help 帮助 • Ctrl+C 退出';
  }
  return '@upload 上传 • @help 更多命令 • 拖拽文件';
}; 