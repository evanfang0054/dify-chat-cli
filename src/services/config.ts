import fs from 'fs-extra';
import path from 'path';
import { homedir } from 'os';

export interface Config {
  openai: {
    apiKey: string;
    baseUrl?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  };
  dify: {
    apiKey: string;
    baseUrl?: string;
    knowledgeBaseId?: string;
    timeout?: number;
  };
  scan: {
    includePatterns: string[];
    excludePatterns: string[];
    ignoreFiles: string[];
    maxFileSize: number;
  };
  generation: {
    style: 'technical' | 'api' | 'tutorial' | 'overview';
    includeExamples: boolean;
    language: string;
    includeTOC: boolean;
    includeAPI: boolean;
  };
}

export class ConfigService {
  private static instance: ConfigService;
  private config: Config | null = null;
  private configPath: string | null = null;

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  async loadConfig(): Promise<Config> {
    if (this.config) {
      return this.config;
    }

    const config = await this.findAndLoadConfig();
    this.config = config;
    return config;
  }

  private async findAndLoadConfig(): Promise<Config> {
    const defaultConfig = this.getDefaultConfig();
    
    // 配置查找优先级：
    // 1. 环境变量（最高优先级）
    // 2. 当前项目目录配置文件
    // 3. 用户主目录配置文件
    // 4. 默认配置（最低优先级）

    let config = { ...defaultConfig };

    // 1. 从配置文件加载（项目目录优先）
    const projectConfig = await this.loadProjectConfig();
    if (projectConfig) {
      config = this.mergeConfig(config, projectConfig);
      console.log(`📁 使用项目配置: ${this.configPath}`);
    } else {
      const homeConfig = await this.loadHomeConfig();
      if (homeConfig) {
        config = this.mergeConfig(config, homeConfig);
        console.log(`🏠 使用用户配置: ${this.configPath}`);
      }
    }

    // 2. 环境变量覆盖（最高优先级）
    config = this.applyEnvOverrides(config);

    // 3. 验证配置
    this.validateConfig(config);

    return config;
  }

  private async loadProjectConfig(): Promise<Partial<Config> | null> {
    const configFiles = [
      '.diffrc.json',
      '.diffrc.js',
      'dify.config.json',
      'dify.config.js',
    ];

    let currentDir = process.cwd();
    
    // 向上查找配置文件
    while (currentDir !== path.dirname(currentDir)) {
      for (const file of configFiles) {
        const filePath = path.join(currentDir, file);
        if (await fs.pathExists(filePath)) {
          this.configPath = filePath;
          return await this.loadConfigFile(filePath);
        }
      }
      currentDir = path.dirname(currentDir);
    }

    return null;
  }

  private async loadHomeConfig(): Promise<Partial<Config> | null> {
    const configFiles = [
      '.diffrc.json',
      'dify.config.json',
    ];

    const homeDir = homedir();
    
    for (const file of configFiles) {
      const filePath = path.join(homeDir, file);
      if (await fs.pathExists(filePath)) {
        this.configPath = filePath;
        return await this.loadConfigFile(filePath);
      }
    }

    return null;
  }

  private async loadConfigFile(filePath: string): Promise<Partial<Config> | null> {
    try {
      const ext = path.extname(filePath);
      let config: any;

      if (ext === '.json') {
        const content = await fs.readFile(filePath, 'utf-8');
        config = JSON.parse(content);
      } else if (ext === '.js') {
        // 动态导入JS配置文件
        const fullPath = path.resolve(filePath);
        delete require.cache[fullPath];
        config = require(fullPath);
        if (config.default) {
          config = config.default;
        }
      }

      return config;
    } catch (error) {
      console.warn(`⚠️ 加载配置文件失败: ${filePath}`, error);
      return null;
    }
  }

  private applyEnvOverrides(config: Config): Config {
    const merged = { ...config };

    // OpenAI 配置
    if (process.env.OPENAI_API_KEY) {
      merged.openai.apiKey = process.env.OPENAI_API_KEY;
    }
    if (process.env.OPENAI_BASE_URL) {
      merged.openai.baseUrl = process.env.OPENAI_BASE_URL;
    }
    if (process.env.OPENAI_MODEL) {
      merged.openai.model = process.env.OPENAI_MODEL;
    }
    if (process.env.OPENAI_MAX_TOKENS) {
      merged.openai.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS);
    }
    if (process.env.OPENAI_TEMPERATURE) {
      merged.openai.temperature = parseFloat(process.env.OPENAI_TEMPERATURE);
    }

    // Dify 配置
    if (process.env.DIFY_API_KEY) {
      merged.dify.apiKey = process.env.DIFY_API_KEY;
    }
    if (process.env.DIFY_BASE_URL) {
      merged.dify.baseUrl = process.env.DIFY_BASE_URL;
    }
    if (process.env.DIFY_KNOWLEDGE_BASE_ID) {
      merged.dify.knowledgeBaseId = process.env.DIFY_KNOWLEDGE_BASE_ID;
    }

    return merged;
  }

  private mergeConfig(defaultConfig: Config, userConfig: Partial<Config>): Config {
    return {
      openai: { ...defaultConfig.openai, ...userConfig.openai },
      dify: { ...defaultConfig.dify, ...userConfig.dify },
      scan: { ...defaultConfig.scan, ...userConfig.scan },
      generation: { ...defaultConfig.generation, ...userConfig.generation },
    };
  }

  private getDefaultConfig(): Config {
    return {
      openai: {
        apiKey: '',
        baseUrl: 'https://api.openai.com',
        model: 'gpt-3.5-turbo',
        maxTokens: 4000,
        temperature: 0.7,
      },
      dify: {
        apiKey: '',
        baseUrl: 'https://api.dify.ai',
        knowledgeBaseId: '',
        timeout: 30000,
      },
      scan: {
        includePatterns: [
          '**/*.{js,ts,tsx,jsx,py,java,go,rs,php,rb}',
          '**/*.{md,txt,json,yml,yaml}',
        ],
        excludePatterns: [
          'node_modules/**',
          'dist/**',
          'build/**',
          '.git/**',
          '**/*.test.{js,ts,tsx,jsx}',
          '**/*.spec.{js,ts,tsx,jsx}',
          '**/*.min.js',
          '**/*.d.ts',
        ],
        ignoreFiles: ['.gitignore', '.difyignore'],
        maxFileSize: 5242880, // 5MB
      },
      generation: {
        style: 'technical',
        includeExamples: true,
        language: 'zh-CN',
        includeTOC: true,
        includeAPI: true,
      },
    };
  }

  private validateConfig(config: Config): void {
    const errors: string[] = [];

    if (!config.openai?.apiKey) {
      errors.push('❌ OPENAI_API_KEY 未配置');
    }
    if (!config.dify?.apiKey) {
      errors.push('❌ DIFY_API_KEY 未配置');
    }
    if (!config.dify?.knowledgeBaseId) {
      errors.push('❌ DIFY_KNOWLEDGE_BASE_ID 未配置');
    }

    if (errors.length > 0) {
      throw new Error(`配置错误:\n${errors.join('\n')}`);
    }
  }

  async createDefaultConfig(targetPath?: string): Promise<void> {
    const configPath = targetPath || path.join(process.cwd(), '.diffrc.json');
    
    if (await fs.pathExists(configPath)) {
      console.log(`ℹ️ 配置文件已存在: ${configPath}`);
      return;
    }

    const config = {
      openai: {
        apiKey: 'your-openai-api-key-here',
        baseUrl: 'https://api.openai.com',
        model: 'gpt-3.5-turbo',
        maxTokens: 4000,
        temperature: 0.7,
      },
      dify: {
        apiKey: 'your-dify-api-key-here',
        baseUrl: 'https://api.dify.ai',
        knowledgeBaseId: 'your-knowledge-base-id',
        timeout: 30000,
      },
      scan: this.getDefaultConfig().scan,
      generation: this.getDefaultConfig().generation,
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ 已创建配置文件: ${configPath}`);
  }

  getConfigPath(): string | null {
    return this.configPath;
  }

  clearCache(): void {
    this.config = null;
    this.configPath = null;
  }
}

// 导出单例实例
export const configService = ConfigService.getInstance();