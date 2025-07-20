#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import { App } from './App';

const program = new Command();

program
  .name('chat')
  .description('Dify知识库管理CLI工具')
  .version('1.0.0');

program
  .command('chat')
  .description('启动交互式聊天界面')
  .action(() => {
    render(<App />);
  });

program
  .command('kb')
  .description('知识库管理')
  .option('--list', '列出所有知识库')
  .option('--create --name <name>', '创建知识库')
  .option('--delete --id <id>', '删除知识库');

program
  .command('upload')
  .description('上传文档到知识库')
  .requiredOption('--kb-id <id>', '知识库ID')
  .option('--file <file>', '单个文件路径')
  .option('--dir <dir>', '目录路径')
  .option('--pattern <pattern>', '文件匹配模式', '**/*.{md,txt,js,ts}');

program
  .command('search')
  .description('在知识库中搜索')
  .requiredOption('--kb-id <id>', '知识库ID')
  .requiredOption('--query <query>', '搜索查询')
  .option('--top-k <number>', '返回结果数量', '5');

program.parse();