// esbuild.config.js
import { build } from 'esbuild';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

const config = {
  entryPoints: ['src/index.tsx'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/index.js',
  sourcemap: isDev,
  minify: true, // 始终不压缩代码
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.DEV': JSON.stringify(isDev ? 'true' : 'false'),
  },
  plugins: [
    {
      name: 'copy-files',
      setup(build) {
        build.onEnd(() => {
          try {
            // 仅复制必要的运行时文件
            const yogaWasmPath = resolve(__dirname, 'public/yoga.wasm');
            if (fs.existsSync(yogaWasmPath)) {
              fs.copyFileSync(yogaWasmPath, resolve(__dirname, 'dist/yoga.wasm'));
              console.log('✅ Copied yoga.wasm to dist/');
            }
          } catch (error) {
            console.warn('Failed to copy files:', error.message);
          }
        });
      }
    },
    {
      name: 'mock-react-devtools',
      setup(build) {
        build.onResolve({ filter: /^react-devtools-core$/ }, () => {
          return { path: '/dev/null' };
        });
      }
    },
    {
      name: 'alias-yoga-wasm-web',
      setup(build) {
        // 将 yoga-wasm-web 重定向到我们的兼容性包装器
        build.onResolve({ filter: /^yoga-wasm-web$/ }, () => {
          return { path: resolve(__dirname, 'src/common/utils/yoga-compat.ts') };
        });
      }
    }
  ],
  external: [
    'fsevents',
  ],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
};

build(config).catch(console.error);