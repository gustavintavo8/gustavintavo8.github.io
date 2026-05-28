---
title: "Elegir el LLM correcto para function calling: una iteración de 3 modelos"
slug: "elegir-llm-function-calling"
date: "2025-12-15"
tags: ["LLMs", "TypeScript", "PachagasApp", "Vercel AI SDK"]
summary: "Cómo iteré de Gemini a Llama 70B a GPT-4o-mini para el asistente de PachagasApp, y qué criterios uso ahora para elegir modelos con function calling."
readingTime: 5
---

## Panenka, el asistente de PachagasApp

PachagasApp tiene un asistente de IA llamado Panenka. Su trabajo es responder preguntas sobre la base de datos en tiempo real: "¿Quién es el máximo goleador?", "¿Cuántos partidos tiene registrados Juan?", "¿Cuál es el mejor equipo de la historia?".

Para responder esas preguntas, Panenka tiene 11 herramientas de function calling que hacen queries a Supabase (PostgreSQL con Row Level Security). El LLM recibe la pregunta, decide qué tool llamar, recibe los datos, y formula la respuesta.

La elección del LLM es crítica: un modelo que llama a las tools de forma incorrecta produce respuestas incorrectas, y los errores de function calling son silenciosos (el modelo puede fabricar una respuesta en lugar de admitir que no puede hacer la tool call correctamente).

## Iteración 1 — Gemini Flash 1.5

Empecé con Gemini Flash 1.5 por coste y velocidad. El modelo tiene buena capacidad de razonamiento en general, pero en mis tests de function calling con el Vercel AI SDK tenía dos problemas:

1. **Selección incorrecta de tool**: Para preguntas compuestas ("¿Quién marcó más goles en los últimos 3 partidos?"), Gemini a veces elegía la tool equivocada o no hacía la segunda tool call necesaria para combinar datos.

2. **Extracción de parámetros**: Los parámetros opcionales (filtros de fecha, límites de resultados) a veces eran ignorados o extraídos incorrectamente del mensaje del usuario.

Descarté Gemini Flash 1.5 para este caso de uso. No es un problema del modelo en general, sino de este dominio específico con herramientas con schemas complejos.

## Iteración 2 — Llama 3.1 70B (via Groq)

Probé Llama 3.1 70B via Groq por latencia (Groq tiene inferencia muy rápida). El modelo tiene mejor precisión en function calling para mis schemas específicos.

El problema fue distinto: **inconsistencia**. Para la misma pregunta, el modelo a veces hacía la tool call correcta y a veces respondía directamente sin llamar a ninguna herramienta. Con temperatura 0, la inconsistencia era menor pero seguía presente.

Sospecho que el fine-tuning de Llama 3.1 70B para instruction following no está tan optimizado para function calling como los modelos de OpenAI.

## Iteración 3 — GPT-4o-mini (modelo actual)

GPT-4o-mini resolvió los dos problemas:

1. **Selección correcta y consistente**: Para preguntas compuestas, hace correctamente las tool calls secuenciales o paralelas que necesita. Con temperatura 0, la selección es determinista.

2. **Extracción de parámetros**: Extrae correctamente parámetros opcionales y entiende cuando una pregunta requiere filtros de fecha o límites no explícitos.

```typescript
const result = await generateText({
  model: openai('gpt-4o-mini'),
  system: PANENKA_SYSTEM_PROMPT,
  messages: conversationHistory,
  tools: pachagasTools,
  temperature: 0,
  maxSteps: 5, // máximo 5 tool calls por respuesta
})
```

El coste es mayor que Groq con Llama, pero para un asistente con 31 usuarios y uso esporádico, es completamente asumible.

## Criterios que uso ahora para elegir modelos con function calling

1. **Precisión en tool selection** > velocidad > coste. Un error silencioso es peor que una respuesta lenta.

2. **Determinismo con temperatura 0**: Testea tu caso de uso con temperatura 0. Si el modelo sigue siendo inconsistente, el problema es el modelo, no el sampling.

3. **Complejidad de los schemas**: Para schemas simples (1-2 parámetros por tool), muchos modelos funcionan bien. Para schemas complejos con parámetros opcionales y múltiples tools relacionadas, OpenAI sigue siendo el benchmark.

4. **Evalúa con tus queries reales**: Los benchmarks públicos de function calling no reflejan tu caso específico. Construye un conjunto de 20-30 queries representativas y mide precision/recall de tool calls.

**Código fuente:** [github.com/gustavintavo8/PachagasApp](https://github.com/gustavintavo8/PachagasApp)
