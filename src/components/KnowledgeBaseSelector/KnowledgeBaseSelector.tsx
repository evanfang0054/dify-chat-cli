import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import SelectInput from 'ink-select-input';
import { KnowledgeBaseSelectorProps } from './interface';

export const KnowledgeBaseSelector: React.FC<KnowledgeBaseSelectorProps> = ({ 
  knowledgeBases, 
  loadingKbs, 
  kbError, 
  onSelect 
}) => {
  const kbItems = knowledgeBases.map((kb) => ({
    label: `${kb.name} (${kb.document_count || 0} 文档) - ${kb.description || '无描述'}`,
    value: kb,
  }));

  return (
    <Box flexDirection="column" height="100%" padding={2}>
      {/* 标题区域 - 现代化标题栏 */}
      <Box flexDirection="column" marginBottom={2}>
        <Box flexDirection="row" alignItems="center" gap={1}>
          <Text color="cyan" bold>
            🏗️ 知识库管理
          </Text>
          <Text color="gray" dimColor>
            选择目标知识库
          </Text>
        </Box>
        <Text color="gray" dimColor>
          使用 ↑↓ 选择 • Enter 确认 • ESC 返回
        </Text>
      </Box>

      <Box flexGrow={1} flexDirection="column" gap={1}>
        {/* 加载状态 - 动画骨架屏 */}
        {loadingKbs && (
          <Box flexDirection="column" alignItems="center" justifyContent="center" height={10}>
            <Spinner type="dots" />
            <Box marginTop={1} flexDirection="column" alignItems="center" gap={0.5}>
              <Text color="cyan" bold>
                正在同步知识库...
              </Text>
              <Text color="gray" dimColor>
                与Dify服务建立连接
              </Text>
            </Box>
          </Box>
        )}

        {/* 错误状态 - 优雅错误处理 */}
        {kbError && (
          <Box flexDirection="column" alignItems="center" justifyContent="center" height={10}>
            <Text color="red" bold>
              ⚠️
            </Text>
            <Box marginTop={1} flexDirection="column" alignItems="center" gap={0.5}>
              <Text color="red" bold>
                连接失败
              </Text>
              <Text color="gray" wrap="truncate-middle">
                {kbError}
              </Text>
              <Text color="yellow" dimColor>
                检查网络连接或API配置
              </Text>
            </Box>
          </Box>
        )}

        {/* 空状态 - 引导式设计 */}
        {!loadingKbs && !kbError && kbItems.length === 0 && (
          <Box flexDirection="column" alignItems="center" justifyContent="center" height={10}>
            <Text color="yellow">
              📚
            </Text>
            <Box marginTop={1} flexDirection="column" alignItems="center" gap={0.5}>
              <Text color="yellow" bold>
                暂无知识库
              </Text>
              <Text color="gray" dimColor>
                前往 Dify 控制台创建您的第一个知识库
              </Text>
              <Text color="cyan" dimColor>
                https://dify.ai/dashboard/datasets
              </Text>
            </Box>
          </Box>
        )}

        {/* 知识库列表 - 现代化卡片布局 */}
        {!loadingKbs && !kbError && kbItems.length > 0 && (
          <SelectInput
            items={kbItems}
            onSelect={({ value }) => onSelect(value)}
            limit={10}
            indicatorComponent={({ isSelected }) => (
              <Box flexDirection="row" alignItems="center" gap={1}>
                <Text color={isSelected ? 'cyan' : 'gray'}>
                  {isSelected ? '▶' : '○'}
                </Text>
                <Text color={isSelected ? 'cyan' : 'gray'}>
                  {isSelected ? '已选择' : '选择'}
                </Text>
              </Box>
            )}
            itemComponent={({ label, isSelected }) => {
              const parts = label.split(' - ');
              const name = parts[0].replace(/\([^)]*\)/, '').trim();
              const count = parts[0].match(/\((\d+) 文档\)/)?.[1] || '0';
              const desc = parts[1] || '暂无描述';

              return (
                <Box flexDirection="column" paddingY={1} gap={0.25}>
                  <Box flexDirection="row" alignItems="center" gap={1}>
                    <Text color={isSelected ? 'cyan' : 'white'} bold>
                      📁 {name}
                    </Text>
                    <Text color={isSelected ? 'green' : 'gray'} bold>
                      {count} 文档
                    </Text>
                  </Box>
                  <Text 
                    color={isSelected ? 'gray' : 'gray'} 
                    dimColor={!isSelected}
                  >
                    {desc}
                  </Text>
                </Box>
              );
            }}
          />
        )}
      </Box>
    </Box>
  );
}; 