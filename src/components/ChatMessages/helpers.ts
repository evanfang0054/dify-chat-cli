/**
 * 格式化时间戳为时:分:秒格式
 */
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * 格式化消息内容，根据消息类型进行不同处理
 */
export const formatContent = (content: string, isSystem: boolean): string[] => {
  if (isSystem) {
    // 系统消息格式化
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
  
  // 用户和AI消息格式化
  return [content];
}; 