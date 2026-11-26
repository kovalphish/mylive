# Путь 30 — публикация на Vercel

Этот архив содержит полную исходную версию приложения «Путь 30» (React + Vite + Tailwind CSS), включая все иллюстрации и готовый файл конфигурации `vercel.json`.

## Способ 1 — через GitHub и сайт Vercel (проще всего)

1. Распакуйте архив и загрузите файлы в новый репозиторий на GitHub.
2. Перейдите на https://vercel.com/new и импортируйте этот репозиторий.
3. Vercel автоматически определит Vite (`npm run build` → `dist`). Нажмите **Deploy**.

## Способ 2 — через терминал (Vercel CLI)

```bash
npm install
npx vercel --prod
```

## Локальный запуск

```bash
npm install
npm run dev
```
