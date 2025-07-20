# Dify Chat CLI

专为开发者设计的Dify知识库文档生成CLI工具。通过CLI与AI对话，让AI识别指定目录下的代码和文档内容，生成标准化的markdown文档，经用户核对后上传到Dify知识库。

## 🚀 功能特性

- **🎯 对话式文档生成**: 通过CLI对话让AI识别代码并生成文档
- **📁 智能文件扫描**: 自动识别代码文件，支持多种编程语言
- **📝 交互式预览**: 实时预览AI生成的markdown文档，支持修改
- **🚀 一键上传**: 确认无误后一键上传到Dify知识库
- **⚡ 现代化**: 基于React + Ink构建的现代化CLI体验

## 📦 安装

### 全局安装
```bash
pnpm add -g dify-chat-cli
```

## 🔧 配置

### 环境变量
配置文件路径: `~/.dify-chat/.env`

```bash
# 必需
DIFY_API_KEY=your_dify_api_key_here

# 可选
DIFY_BASE_URL=https://api.dify.ai
NODE_ENV=production
```

### 获取API密钥
1. 登录 [Dify平台](https://dify.ai)
2. 进入应用设置
3. 复制API密钥并配置到环境变量

## 🎯 使用指南

### 🚀 基础使用
```bash
# 启动交互式聊天
chat

# 查看帮助
chat --help
```

### 📋 交互式命令（推荐）
启动CLI后，在聊天界面中使用：

| 命令 | 功能 |
|------|------|
| `@kb` | 选择Dify知识库 |
| `@upload` | 激活上传模式 |
| `@help` | 显示所有可用命令 |

### 📁 智能文件上传
支持多种文件上传方式：

#### 1. 直接路径输入
```
> ./src/main.js
```

#### 2. 目录批量上传
```
> ./src/components
```

#### 3. 拖拽文件路径
直接拖拽文件到终端，路径会自动识别

#### 4. 复制粘贴
```
> /Users/yourname/Documents/project/README.md
```

#### 5. 多文件上传
```
> ./src/main.js ./package.json ./README.md
```

### 🎯 使用流程
1. **启动CLI**: `chat`
2. **选择知识库**: 输入 `@kb` 选择目标知识库
3. **上传文档**: 直接输入文件路径或目录路径
4. **确认上传**: 系统会显示上传进度和结果

### 📊 支持的文件类型
- **代码文件**: `.js`, `.ts`, `.tsx`, `.jsx`, `.py`, `.java`, `.go`, `.rs`, `.php`, `.rb`
- **配置文件**: `.json`, `.yaml`, `.yml`, `.toml`, `.env`
- **文档文件**: `.md`, `.txt`, `.html`, `.css`
- **其他**: `.sql`, `.sh`, `.dockerfile`, `.log`

## 🛠️ 开发

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0

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
│   ├── services/            # 服务层
│   │   ├── dify.ts          # Dify API服务
│   │   ├── openai.ts        # OpenAI API服务
│   │   ├── fileScanner.ts   # 文件扫描服务
│   │   └── config.ts        # 配置管理
│   └── types/               # 类型定义
│       ├── chat.ts          # 聊天相关类型
│       ├── cli.ts           # CLI特定类型
│       ├── dify.ts          # Dify API类型
│       ├── file.ts          # 文件相关类型
│       └── index.ts         # 类型导出索引
└── [配置文件]
```

### 使用示例
```bash
# 启动交互式文档生成
chat

# 快速文档生成
chat generate --path ./src/components

# 上传文档到知识库
chat upload --kb-id abc123 --file generated-doc.md
```

### 开发命令
```bash
# 安装依赖
pnpm install

# 开发模式（带热重载）
pnpm dev

# 生产构建
pnpm build

# 运行构建后的CLI
pnpm start

# 代码检查
pnpm lint

# 类型检查
pnpm type-check
```

## 📋 技术栈

- **Runtime**: Node.js >= 18
- **UI Framework**: React + Ink v4
- **Language**: TypeScript
- **Build Tool**: esbuild
- **HTTP Client**: Axios
- **配置管理**: dotenv


## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件