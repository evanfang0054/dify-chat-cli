# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在本代码仓库中工作时提供指导。

## 项目概述

专为开发者设计的Dify知识库管理CLI工具，支持知识库创建、文档检索和数据采集清洗。基于React + Ink + TypeScript构建，提供现代化的命令行交互体验。

## 技术栈
- **运行环境**: Node.js >=18
- **UI框架**: React + Ink v4 (最新版)
- **编程语言**: TypeScript
- **HTTP客户端**: Axios
- **打包工具**: esbuild
- **配置管理**: dotenv
- **聊天模型**: OpenAI GPT-3.5-turbo
- **知识库**: Dify API (仅用于检索)
- **markdown渲染**: ink-markdown

## 产品定位
- **目标用户**: 开发者
- **核心场景**: CLI对话 → AI识别目录内容 → 生成文档 → 用户核对 → 上传到Dify知识库
- **使用模式**: 单窗口滚动式聊天，支持markdown渲染和打字指示器，交互式文档审核流程

## 开发环境设置

### 安装依赖
```bash
# 全局安装
pnpm add -g dify-chat-cli

# 本地开发
pnpm install
```

### 配置文件
支持多种配置方式，优先从项目目录扫描配置文件：

#### 1. 配置文件（推荐）
在项目根目录创建以下任一文件：
- `.diffrc.json`
- `.diffrc.js`
- `dify.config.json`
- `dify.config.js`

**示例 .diffrc.json:**
```json
{
  "openai": {
    "apiKey": "your-openai-api-key",
    "baseUrl": "https://api.openai.com",
    "model": "gpt-3.5-turbo",
    "maxTokens": 4000,
    "temperature": 0.7
  },
  "dify": {
    "apiKey": "your-dify-api-key",
    "baseUrl": "https://api.dify.ai"
  },
  "scan": {
    "includePatterns": ["**/*.{js,ts,tsx}"],
    "excludePatterns": ["node_modules/**", "**/*.test.js"],
    "maxFileSize": 5242880
  },
  "generation": {
    "style": "technical",
    "includeExamples": true,
    "language": "zh-CN"
  }
}
```

#### 2. 环境变量
```bash
# OpenAI配置 (用于聊天)
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com
OPENAI_MODEL=gpt-3.5-turbo

# Dify配置 (用于知识库检索)
DIFY_API_KEY=your_dify_api_key
DIFY_BASE_URL=https://api.dify.ai
```

#### 3. 自动配置发现
CLI会自动从当前目录向上查找配置文件，支持项目级配置。

### 开发命令
- `pnpm dev` - 开发模式（带热重载）
- `pnpm build` - 使用esbuild生产构建
- `pnpm start` - 运行构建后的CLI
- `pnpm lint` - ESLint + Prettier代码检查
- `pnpm type-check` - TypeScript类型检查

### 项目结构
```
dify-chat-cli/
├── src/
│   ├── App.tsx              # 应用程序主组件
│   ├── index.tsx            # 应用入口
│   ├── components/          # React组件
│   │   ├── Chat/            # 主聊天容器组件
│   │   ├── ChatInput/       # 聊天输入组件
│   │   ├── ChatMessages/    # 消息显示组件
│   │   ├── CommandSuggestions/ # 命令建议组件
│   │   ├── FileUploader/    # 文件上传组件
│   │   ├── KnowledgeBaseSelector/ # 知识库选择器组件
│   │   ├── PathSuggestions/ # 路径建议组件
│   │   └── StatusBar/       # 状态栏组件
│   ├── common/              # 共享代码
│   │   ├── hooks/           # 自定义钩子
│   │   │   ├── useChat.ts
│   │   │   ├── useCommandSuggestions.ts
│   │   │   ├── useFileUpload.ts
│   │   │   ├── useKnowledgeBase.ts
│   │   │   └── usePathSuggestions.ts
│   │   └── utils/           # 工具函数
│   │       ├── contextManager.ts  # 上下文管理工具
│   │       ├── yoga-compat.ts     # Yoga布局兼容层
│   │       └── index.ts           # 工具函数导出
│   ├── services/
│   │   ├── dify.ts          # Dify API服务
│   │   ├── openai.ts        # OpenAI API服务
│   │   ├── fileScanner.ts   # 文件扫描服务
│   │   └── config.ts        # 配置管理
│   └── types/               # TypeScript类型定义
│       ├── chat.ts          # 聊天相关类型
│       ├── cli.ts           # CLI特定类型
│       ├── dify.ts          # Dify API类型
│       ├── file.ts          # 文件相关类型
│       └── index.ts         # 类型导出索引
├── .env.example             # 环境变量模板
├── package.json
├── tsconfig.json
├── esbuild.config.js
├── .eslintrc.json
├── .prettierrc
└── README.md
```

## 核心功能模块

### 1. 对话式文档生成流程
- **目录扫描**: 用户指定目录路径，自动识别代码文件和文档
- **容量评估**: 自动评估总token使用量，提供处理建议
- **分层处理**: 大项目分层级处理，先结构后细节
- **AI分析**: 通过对话让AI理解代码结构和业务逻辑
- **文档生成**: AI生成符合需求的markdown格式文档
- **预览审核**: 交互式文档预览，支持修改和确认
- **上传到Dify**: 一键上传到指定知识库

### 2. 智能文件识别与上下文优化
- **文件大小检测**: 自动检测文件大小，超过阈值(如50KB)进行分段处理
- **智能分段**: 按函数、类、模块边界智能拆分大文件
- **摘要生成**: 为大文件先生成摘要，再按需深入细节
- **上下文管理**: 动态调整上下文窗口，优先处理重要内容
- **文件过滤**: 支持多种代码文件类型（.js, .ts, .tsx, .py, .java等）
- **递归扫描**: 递归扫描子目录，支持自定义忽略模式
- **容量预警**: 实时显示预计token使用量，避免超出限制

### 3. 交互式聊天界面
- 单窗口滚动式界面
- 实时打字指示器
- Markdown格式渲染和编辑
- 当前会话文档预览
- 确认/修改/取消操作流程

### 4. 知识库集成
- 连接到指定Dify知识库
- 文档分段和标签管理
- 上传进度指示
- 错误处理和重试机制

### 5. 上下文管理策略
- **实时容量监控**: 动态监控token使用量
- **分层处理**: 大项目分层级处理（结构→模块→函数）
- **智能摘要**: 为大文件生成结构化摘要
- **用户决策**: 提供处理策略选择（精简/分批/忽略）
- **性能优化**: 缓存机制减少重复分析
- **容量预警**: 实时提示和建议处理方案

## CLI命令设计
```bash
# 启动对话式文档生成
chat                          # 启动交互式对话
chat --help                   # 查看帮助

# 快速文档生成
chat generate --path ./src/components  # 扫描并生成文档
chat generate --path ./src --pattern "*.ts"  # 指定文件类型

# 知识库操作
chat upload --kb-id <kb-id> --file <doc.md>  # 上传单个文档
chat upload-batch --kb-id <kb-id> --dir ./docs  # 批量上传
```

## 项目进度更新 ✅

### ✅ 已完成
1. ~~创建package.json和依赖配置~~
2. ~~配置TypeScript + esbuild~~
3. ~~设置ESLint + Prettier规范~~
4. ~~实现核心CLI框架~~
5. ~~开发Dify API集成~~ - 已使用官方API文档完整实现
   - ✅ 使用正确的 `/datasets` API端点
   - ✅ 完整的知识库管理功能
   - ✅ 文档管理（创建、更新、删除）
   - ✅ 分段管理功能
   - ✅ 检索功能
   - ✅ 上传进度监控
6. ~~构建聊天界面组件~~ - 基础框架已存在
7. ~~实现数据采集清洗功能~~ - 基础框架已存在

### ✅ 已移除测试相关配置
- ~~jest.config.js~~ - 已删除
- ~~package.json中的测试脚本和依赖~~ - 已移除
- ~~文档中的测试相关命令~~ - 已更新

### ✅ 已完成重大更新（2025-07-19）
1. **🔄 完全重构了上传功能**
   - ✅ 从mock数据升级为真实Dify API上传
   - ✅ 统一所有上传场景到单个聊天界面
   - ✅ 支持文件拖拽、粘贴、路径输入等多种方式
   - ✅ 智能路径检测和实时提示

2. **🎯 用户体验重大优化**
   - ✅ 命令触发从`/`改为`@`符号（@kb, @upload, @help）
   - ✅ 系统消息与AI聊天完全分离，避免误触发
   - ✅ 上传进度可视化显示
   - ✅ 实时文件路径建议和自动补全

3. **🔧 技术架构完善**
   - ✅ 修复了配置文件导入问题
   - ✅ 创建了完整的FileScanner文件扫描服务
   - ✅ 实现了智能文件大小和类型过滤
   - ✅ 支持递归目录扫描和忽略模式

4. **📊 智能化增强**
   - ✅ 自动检测文件大小，超过5MB智能处理
   - ✅ 支持多种编程语言识别（JS/TS/Python/Java等）
   - ✅ 实时token使用量预估和警告
   - ✅ 大文件智能分段和摘要生成

### ✅ 代码结构优化更新（2025-07-20）
1. **🏗️ 组件架构优化**
   - ✅ 将大型ChatInterface组件拆分为多个独立、可复用的组件
   - ✅ 创建了专门的组件目录，如ChatMessages、ChatInput等
   - ✅ 每个组件都有明确的职责和接口定义

2. **🧩 状态管理改进**
   - ✅ 创建了专门的hooks目录，抽象业务逻辑
   - ✅ 实现了useChat、useKnowledgeBase等自定义钩子
   - ✅ 组件只负责渲染，业务逻辑由钩子处理

3. **📁 目录结构优化**
   - ✅ 将App.tsx从components目录移至src根目录
   - ✅ 创建了common/utils目录存放工具函数
   - ✅ 将contextManager和yoga-compat工具移至common/utils
   - ✅ 优化了整体项目结构，提高可维护性