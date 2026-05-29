export const projects = [
  {
    slug: "legaldev",
    name: "LegalDev",
    tagline: "API RAG de normativa legal para developers",
    year: "2026 — actualidad",
    description:
      "API que analiza un cuestionario sobre tu proyecto de software y devuelve las normativas españolas y europeas aplicables, con implicaciones técnicas concretas. Sistema RAG sobre 22 documentos legales (RGPD, EU AI Act, LOPDGDD, guías AEPD).",
    highlights: [
      "RAG sobre 22 documentos con ChromaDB y sentence-transformers",
      "Score threshold anti-alucinación + temperatura 0 + citas forzadas",
      "FastAPI con rate limiting, Prometheus y mitigación de prompt injection",
      "Docker + Hugging Face Spaces · 69 tests / 84% cobertura · cold start <3s",
    ],
    stack: ["Python 3.11", "FastAPI", "ChromaDB", "LangChain", "Groq (Llama 4)", "Docker", "pytest"],
    demo: "https://legaldev-web.vercel.app/",
    repo: "https://github.com/gustavintavo8/legaldev",
    cover: "/projects/legaldev-cover.svg",
  },
  {
    slug: "pachagas",
    name: "PachagasApp",
    tagline: "Plataforma full-stack para organizar partidos de fútbol",
    year: "2025 — actualidad",
    description:
      "App web con autenticación, chat en tiempo real, asistente con IA (Panenka) y PWA instalable. Equipos balanceados por ELO. 31 usuarios reales y 9 partidos organizados en producción.",
    highlights: [
      "Algoritmo de balanceo de equipos en 3 fases sobre ratings ELO",
      "PostgreSQL con Row Level Security como capa de autorización",
      "Asistente con 11 herramientas de function calling sobre la BD en tiempo real",
      "Server Components + Realtime (CDC de PostgreSQL) + PWA instalable",
    ],
    stack: ["Next.js 16", "React 19", "TypeScript", "Supabase", "Tailwind", "Vercel AI SDK", "Playwright"],
    demo: "https://pachagas-app.vercel.app",
    repo: "https://github.com/gustavintavo8/PachagasApp",
    cover: "/projects/pachagas-banner.png",
  },
];
