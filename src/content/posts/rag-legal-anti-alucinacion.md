---
title: "Cómo evité que mi RAG legal alucinara normativas"
slug: "rag-legal-anti-alucinacion"
date: "2026-03-10"
tags: ["RAG", "Python", "IA", "LegalDev"]
summary: "Tres defensas contra la alucinación en un dominio donde inventar una obligación legal es inaceptable: score threshold, temperatura 0 y citas textuales forzadas."
readingTime: 7
---

## El problema

Construí LegalDev para responder preguntas sobre normativa española y europea aplicable a proyectos de software. El sistema recibe un cuestionario (¿almacenas datos de menores? ¿usas IA para tomar decisiones automatizadas?) y devuelve las obligaciones legales concretas con implicaciones técnicas.

El dominio tiene una propiedad brutal: **un LLM que improvisa una obligación legal plausible pero falsa es peor que no responder**. Un desarrollador que implemente una medida de seguridad inventada por el modelo puede ignorar la real. La alucinación aquí no es un fallo de UX, es un riesgo de cumplimiento normativo.

Empecé con una pipeline básica de RAG: embed query → cosine similarity → top-k chunks → prompt al LLM. Funcionaba bien con preguntas directas. Fallaba de forma preocupante con preguntas que tocaban múltiples documentos o que el corpus no cubría bien.

## Defensa 1 — Score threshold (el knee en 0.35)

El primer problema era el retriever. Sin umbral de similitud, ChromaDB devuelve *siempre* k resultados aunque la query no tenga buena cobertura en el corpus. Con poca cobertura, el LLM recibe contexto débil y rellena los huecos con inferencias.

Medí la distribución de scores para ~200 queries representativas. Había un *knee* claro alrededor de 0.35: las consultas bien cubiertas tenían scores >= 0.40 para sus chunks más relevantes; las mal cubiertas se quedaban en 0.20-0.30.

```python
results = collection.query(
    query_embeddings=[query_embedding],
    n_results=10,
    include=["documents", "metadatas", "distances"]
)

# Filtrar por score mínimo (ChromaDB devuelve distancias, no similitudes)
min_distance = 0.65  # equivale a similitud ~0.35 con coseno normalizado
valid_chunks = [
    (doc, meta, dist) 
    for doc, meta, dist in zip(results["documents"][0], results["metadatas"][0], results["distances"][0])
    if dist <= min_distance
]

if not valid_chunks:
    return {"error": "no_coverage", "message": "No encontré normativa relevante para esta pregunta."}
```

El efecto fue inmediato: en lugar de alucinar sobre preguntas fuera de scope, el sistema responde honestamente "no encuentro normativa relevante". Mucho más útil y seguro.

## Defensa 2 — Temperatura 0

La temperatura controla la aleatoriedad del sampling. Con temperatura > 0, el modelo puede elegir tokens menos probables, lo que introduce variedad creativa. En dominio legal, esa variedad es un defecto.

Quiero que el modelo sea maximalmente determinista dado el contexto. Con temperatura 0, el LLM selecciona siempre el token más probable. Esto no elimina las alucinaciones (el modelo puede aún generar texto incorrecto si el contexto no es suficiente), pero las reduce drásticamente y hace el sistema reproducible.

```python
response = client.chat.completions.create(
    model="llama-4-scout-17b-16e-instruct",
    messages=messages,
    temperature=0,  # máximo determinismo
    max_tokens=2048,
)
```

Una ventaja secundaria: los tests de evaluación se vuelven deterministas. Puedo comparar respuestas entre versiones del corpus con la misma query y saber que las diferencias vienen del corpus, no del sampling.

## Defensa 3 — Citas textuales forzadas

La defensa más efectiva fue estructural: el system prompt exige que cada obligación citada incluya el fragmento textual exacto del documento legal que la respalda.

```python
SYSTEM_PROMPT = """Eres un asistente legal especializado en normativa española y europea de software.

REGLAS ESTRICTAS:
1. Solo menciones obligaciones que estén EXPLÍCITAMENTE en los fragmentos proporcionados.
2. Para cada obligación, incluye la cita textual exacta entre comillas con el nombre del documento.
3. Si los fragmentos no cubren la pregunta, di "No encuentro normativa relevante en mi corpus".
4. No inferas, no extrapoles, no uses conocimiento general.

Formato requerido:
- Obligación: [descripción concreta]
  Cita: "[fragmento textual]" — [nombre del documento, artículo]
"""
```

Esto crea un mecanismo de auto-verificación: si el modelo incluye una cita, es verificable. Si alucina una obligación sin cita, el formato roto lo delata. En la práctica, Llama 4 Scout cumple esta restricción con alta fidelidad con temperatura 0.

## Lo que aprendí

**Un sistema de evaluación que no replica producción no es solo incompleto: es engañoso.** Mis primeras métricas de evaluación usaban preguntas con buena cobertura en el corpus. El sistema parecía funcionar bien. Cuando introduje preguntas fuera del scope del corpus en los tests, descubrí todos los problemas.

El pipeline de RAG más robusto no es el que tiene el mejor retriever ni el mejor LLM. Es el que tiene los mejores puntos de parada: los momentos en los que el sistema dice "no sé" en lugar de inventar.

**Recursos útiles:**
- [RAGAS framework](https://github.com/explodinggradients/ragas) para evaluación de RAG
- [LangChain score threshold retriever](https://python.langchain.com/docs/modules/data_connection/retrievers/MultiQueryRetriever)
- Repositorio: [github.com/gustavintavo8/legaldev](https://github.com/gustavintavo8/legaldev)
