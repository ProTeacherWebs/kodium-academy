# Kodium Academy

Сайт учебного IT-центра с AI-ассистентом. Next.js (App Router), TypeScript, Tailwind, Gemini API.

- Курсы на сайте берутся из `knowledge/courses.xlsx`: добавили строку — курс появился, удалили — пропал.
- AI-ассистент отвечает по документам из папки `knowledge/` (md, txt, pdf, docx, xlsx), RAG без базы данных.
- Все данные в `src/data/site.ts` и `knowledge/` — образцы, их нужно заменить реальными.

## Запуск

```bash
npm install
cp .env.example .env.local   # впишите GEMINI_API_KEY
npm run dev
```

План работ: [tasks.md](tasks.md).
