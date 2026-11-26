import JSZip from 'jszip';
import { IMAGE_URLS, SOURCE_LOADERS } from './projectFiles';
import projectFilesRaw from './projectFiles.ts?raw';

// Clean Vercel-ready package.json without conflicting esbuild@0.25 / tsx / server deps
const VERCEL_PACKAGE_JSON = `${JSON.stringify(
  {
    name: 'put-30',
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      jszip: '^3.10.1',
      'lucide-react': '^0.546.0',
      motion: '^12.23.24',
      react: '^19.0.1',
      'react-dom': '^19.0.1',
    },
    devDependencies: {
      '@tailwindcss/vite': '^4.3.3',
      '@types/node': '^22.14.0',
      '@types/react': '^19.3.0',
      '@types/react-dom': '^19.3.0',
      '@vitejs/plugin-react': '^6.1.1',
      tailwindcss: '^4.3.3',
      typescript: '^5.8.3',
      vite: '^8.3.0',
    },
  },
  null,
  2,
)}\n`;

const VERCEL_NPMRC = `legacy-peer-deps=true\n`;

const VERCEL_README = `# Путь 30 — публикация на Vercel

Этот архив содержит чистую версию проекта «Путь 30» (React + Vite + Tailwind CSS) без конфликтующих зависимостей, готовую к публикации на Vercel.

## Способ 1 — через GitHub и сайт Vercel

1. Распакуйте архив и загрузите все файлы в репозиторий на GitHub (заменив старые \`package.json\` и \`vercel.json\`).
2. Откройте https://vercel.com/new и импортируйте репозиторий (или нажмите **Redeploy**).
3. Vercel автоматически установит зависимости и соберёт проект (\`npm run build\` → \`dist\`).

## Способ 2 — через терминал (Vercel CLI)

\`\`\`bash
npm install
npx vercel --prod
\`\`\`
`;

export interface ExportResult {
  fileCount: number;
  sizeKb: number;
}

export async function downloadProjectForVercel(): Promise<ExportResult> {
  const zip = new JSZip();
  let fileCount = 0;

  // 1. Add clean conflict-free package.json, .npmrc & glob manifest (excluded by Vite self-glob)
  zip.file('package.json', VERCEL_PACKAGE_JSON);
  zip.file('.npmrc', VERCEL_NPMRC);
  zip.file('src/utils/projectFiles.ts', projectFilesRaw);
  fileCount += 3;

  // 2. Add all live project source files (excluding raw template package.json)
  const sourceEntries = Object.entries(SOURCE_LOADERS);
  for (const [rawPath, loader] of sourceEntries) {
    const cleanPath = rawPath.replace(/^\/+/, '');
    const content = await loader();
    zip.file(cleanPath, content);
    fileCount += 1;
  }

  // 3. Add all generated artwork images as binary blobs
  const imageEntries = Object.entries(IMAGE_URLS);
  for (const [rawPath, urlLoader] of imageEntries) {
    const cleanPath = rawPath.replace(/^\/+/, '');
    try {
      const resolvedUrl = await urlLoader();
      const response = await fetch(resolvedUrl);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        zip.file(cleanPath, buffer);
        fileCount += 1;
      }
    } catch {
      try {
        const fallbackResp = await fetch(rawPath);
        if (fallbackResp.ok) {
          const buffer = await fallbackResp.arrayBuffer();
          zip.file(cleanPath, buffer);
          fileCount += 1;
        }
      } catch {
        // Skip unreadable image without aborting export
      }
    }
  }

  // 4. Add deployment README
  zip.file('README.md', VERCEL_README);
  fileCount += 1;

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'put30-vercel.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 4000);

  return {
    fileCount,
    sizeKb: Math.max(1, Math.round(blob.size / 1024)),
  };
}
