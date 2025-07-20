import React, { useEffect, useState } from 'react';
import { Text, Box } from 'ink';
import { DifyService } from './services/dify';
import { OpenAIService } from './services/openai';
import { configService } from './services/config';
import { ChatContainer } from './components/Chat';

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difyService, setDifyService] = useState<DifyService | null>(null);
  const [openaiService, setOpenaiService] = useState<OpenAIService | null>(null);

  useEffect(() => {
    const initServices = async () => {
      try {
        const config = await configService.loadConfig();
        
        // 初始化Dify服务
        if (!config.dify?.apiKey || !config.dify?.baseUrl) {
          throw new Error('Dify API配置缺失，请检查配置文件');
        }
        const dify = new DifyService({
          apiKey: config.dify.apiKey,
          baseUrl: config.dify.baseUrl,
        });
        setDifyService(dify);
        
        // 初始化OpenAI服务
        if (!config.openai?.apiKey) {
          throw new Error('OpenAI API配置缺失，请检查配置文件');
        }
        const openai = new OpenAIService(
          config.openai.apiKey,
          config.openai.baseUrl || 'https://api.openai.com',
          config.openai.model || 'gpt-3.5-turbo',
          config.openai.maxTokens || 4000,
          config.openai.temperature || 0.7
        );
        setOpenaiService(openai);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '初始化服务失败');
        setLoading(false);
      }
    };

    initServices();
  }, []);

  if (loading) {
    return (
      <Box flexDirection="column" alignItems="center" justifyContent="center" height={10}>
        <Text color="yellow">加载中，请稍候...</Text>
        <Text color="gray" dimColor>正在初始化服务</Text>
      </Box>
    );
  }

  if (error || !difyService || !openaiService) {
    return (
      <Box flexDirection="column" alignItems="center" justifyContent="center" height={10}>
        <Text color="red">错误: {error}</Text>
        <Text color="gray" dimColor>请检查配置文件并重试</Text>
      </Box>
    );
  }

  return <ChatContainer difyService={difyService} openaiService={openaiService} />;
}; 