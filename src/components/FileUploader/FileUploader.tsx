import React from 'react';
import { Box, Text } from 'ink';
import { FileUploaderProps } from './interface';

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  uploading, 
  uploadProgress, 
  onCancel 
}) => {
  if (!uploading) return null;

  const uploadedCount = Object.values(uploadProgress).filter((p) => p === 100).length;
  const totalCount = Object.keys(uploadProgress).length;
  const currentFile = Object.entries(uploadProgress).find(([_, p]) => p < 100)?.[0];

  return (
    <Box flexDirection="column" height="100%" padding={1}>
      {/* 进度头部 - 简洁明了 */}
      <Box flexDirection="column" marginBottom={1}>
        <Text color="cyan" bold>
          ⬆️ 上传进度
        </Text>
        <Text color="gray">
          {uploadedCount}/{totalCount} 已完成 {currentFile ? `(${currentFile})` : ''}
        </Text>
      </Box>

      <Box flexGrow={1} flexDirection="column" gap={1}>
        {/* 总进度 - 现代化进度环 */}
        <Box flexDirection="column" alignItems="center" marginBottom={1}>
          <Box flexDirection="column" alignItems="center" gap={0.5}>
            <Text color="cyan" bold>
              {Math.round((uploadedCount / totalCount) * 100)}%
            </Text>
            <Text color="gray">
              {uploadedCount} / {totalCount} 文件完成
            </Text>
          </Box>
        </Box>

        {/* 当前文件状态 */}
        {currentFile && (
          <Box flexDirection="column" alignItems="center" marginBottom={1}>
            <Text color="cyan" dimColor>
              当前处理:
            </Text>
            <Text color="white" wrap="truncate-middle">
              {currentFile}
            </Text>
          </Box>
        )}

        {/* 文件列表 - 现代化列表 */}
        <Box flexDirection="column" gap={0.5}>
          {Object.entries(uploadProgress).map(([file, progress]) => {
            const filename = file.length > 30 ? file.substring(0, 27) + '...' : file;
            const statusIcon = progress === 100 ? '✅' : progress > 80 ? '🔄' : progress > 50 ? '⚡' : progress > 20 ? '⏳' : '📄';
            const statusColor = progress === 100 ? 'green' : 'cyan';
            const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));

            return (
              <Box 
                key={file} 
                flexDirection="column" 
                borderStyle="round"
                borderColor={statusColor}
                borderDimColor={progress !== 100}
                padding={0.5}
              >
                <Box flexDirection="row" alignItems="center" gap={1}>
                  <Text color={statusColor}>
                    {statusIcon}
                  </Text>
                  <Text color="white" wrap="truncate-end">
                    {filename}
                  </Text>
                  <Box flexGrow={1} />
                  <Text color={statusColor} bold>
                    {progress}%
                  </Text>
                </Box>
                <Box flexDirection="row" alignItems="center" gap={0.5}>
                  <Text color="gray" dimColor>
                    [{progressBar}]
                  </Text>
                  <Text color={statusColor} dimColor>
                    {progress === 100 ? '完成' : '处理中'}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* 完成庆祝动画 */}
        {uploadedCount === totalCount && (
          <Box 
            flexDirection="column" 
            alignItems="center" 
            gap={1}
            marginTop={2}
            borderStyle="round"
            borderColor="green"
            borderDimColor
            padding={1}
          >
            <Text color="green" bold>
              🎉 上传完成!
            </Text>
            <Box flexDirection="column" alignItems="center" gap={0.5}>
              <Text color="green">
                成功上传 {totalCount} 个文件到知识库
              </Text>
              <Text color="gray" dimColor>
                按任意键返回聊天界面
              </Text>
            </Box>
          </Box>
        )}
      </Box>

      {/* 操作提示 */}
      <Box marginTop={1} flexDirection="column" gap={0.5}>
        <Box flexDirection="row" gap={2}>
          <Text color="gray" dimColor>
            ⌨️  ESC 取消上传
          </Text>
          <Text color="gray" dimColor>
            📁 支持拖拽更多文件
          </Text>
        </Box>
      </Box>
    </Box>
  );
}; 