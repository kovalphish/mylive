export const SOURCE_LOADERS = import.meta.glob<string>(
  [
    '/index.html',
    '/tsconfig.json',
    '/vite.config.ts',
    '/vercel.json',
    '/src/**/*.{ts,tsx,css}',
  ],
  { query: '?raw', import: 'default' },
);

export const IMAGE_URLS = import.meta.glob<string>('/src/assets/images/*.{jpg,jpeg,png,webp}', {
  query: '?url',
  import: 'default',
});
