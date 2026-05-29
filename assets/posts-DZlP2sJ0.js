const fn=`---
title: "Balancear equipos de fútbol con ELO en 3 fases"
slug: "balanceo-equipos-elo"
date: "2025-11-20"
tags: ["Algoritmos", "TypeScript", "PachagasApp", "PostgreSQL"]
summary: "El algoritmo de balanceo de equipos de PachagasApp: draft posicional, igualación por ELO, y swap-optimización hasta que no hay mejora posible."
readingTime: 6
---

## El problema

PachagasApp organiza partidos de fútbol 5 entre amigos. Tenemos 31 usuarios con distintos niveles registrados. El problema: cuando llegan 10 personas al partido, ¿cómo formas equipos equilibrados?

La solución naive es asignar aleatoriamente. Funciona, pero genera partidos desequilibrados con frecuencia. Con el tiempo, los jugadores perciben el desequilibrio y la app pierde credibilidad.

Usamos ratings ELO. Cada usuario tiene un valor numérico que sube o baja según los resultados de sus partidos. El algoritmo de balanceo necesita maximizar la equidad entre equipos usando esos ratings.

## Fase 1 — Draft posicional

Antes del balanceo por ELO, hacemos un draft posicional. Cada jugador declara su posición preferida (portero, defensa, centrocampista, delantero). Los equipos deben tener al menos un portero cada uno.

\`\`\`typescript
function draftPositional(players: Player[]): [Player[], Player[], Player[]] {
  const goalkeepers = players.filter(p => p.position === 'GK')
  const fieldPlayers = players.filter(p => p.position !== 'GK')
  
  // Asignar un portero a cada equipo (por ELO)
  const sortedGK = goalkeepers.sort((a, b) => b.elo - a.elo)
  const team1: Player[] = sortedGK[0] ? [sortedGK[0]] : []
  const team2: Player[] = sortedGK[1] ? [sortedGK[1]] : []
  
  // Los porteros adicionales pasan a campo
  const remaining = [...fieldPlayers, ...sortedGK.slice(2)]
  return [team1, team2, remaining]
}
\`\`\`

Si no hay porteros suficientes, el sistema asigna jugadores de campo como porteros de facto. El draft posicional reduce el espacio de búsqueda para las fases siguientes.

## Fase 2 — Igualación por ELO (serpentín)

Con los campos restantes, usamos un draft en serpentín ordenado por ELO. El serpentín es el método estándar para drafts en sports analytics porque produce distribuciones más equitativas que el draft lineal.

\`\`\`typescript
function serpentineDraft(players: Player[], team1: Player[], team2: Player[]): void {
  const sorted = [...players].sort((a, b) => b.elo - a.elo)
  let round = 0
  
  for (const player of sorted) {
    if (round % 2 === 0) {
      team1.push(player)
    } else {
      team2.push(player)
    }
    round++
  }
}
\`\`\`

El serpentín funciona porque el jugador más fuerte va al Equipo 1, el segundo más fuerte va al Equipo 2, el tercero más fuerte va al Equipo 2 (ronda 2 empieza al revés), etc. Esto nivela las diferencias acumuladas.

Después del serpentín, la diferencia de ELO entre equipos suele estar en ±50-100 puntos.

## Fase 3 — Swap-optimización

El serpentín produce buenos resultados pero no necesariamente el óptimo. La fase 3 es una optimización greedy: intercambiar pares de jugadores hasta que no haya ningún swap que mejore el equilibrio.

\`\`\`typescript
function swapOptimize(team1: Player[], team2: Player[]): void {
  const sumElo = (team: Player[]) => team.reduce((acc, p) => acc + p.elo, 0)
  
  let improved = true
  while (improved) {
    improved = false
    const diff = Math.abs(sumElo(team1) - sumElo(team2))
    
    for (let i = 0; i < team1.length; i++) {
      for (let j = 0; j < team2.length; j++) {
        // Simular el swap
        const newDiff = Math.abs(
          sumElo(team1) - team1[i].elo + team2[j].elo -
          (sumElo(team2) - team2[j].elo + team1[i].elo)
        )
        
        if (newDiff < diff) {
          // Ejecutar el swap
          [team1[i], team2[j]] = [team2[j], team1[i]]
          improved = true
          break
        }
      }
      if (improved) break
    }
  }
}
\`\`\`

Esta fase generalmente converge en 1-3 iteraciones. Para 10 jugadores, el espacio de búsqueda es pequeño (25 pares posibles), así que es rápido.

## Resultado

El algoritmo de 3 fases produce diferencias de ELO entre equipos de ±10-30 puntos en la mayoría de los casos, comparado con ±100-200 del aleatorio puro.

Métricas reales con 9 partidos organizados:
- Diferencia media de ELO entre equipos: 18 puntos
- Partidos con resultado ajustado (diferencia ≤ 2 goles): 6 de 9

Los usuarios notan los partidos más equilibrados. La retención mejora.

**Código fuente:** [github.com/gustavintavo8/PachagasApp](https://github.com/gustavintavo8/PachagasApp)
`,dn=`---
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

\`\`\`typescript
const result = await generateText({
  model: openai('gpt-4o-mini'),
  system: PANENKA_SYSTEM_PROMPT,
  messages: conversationHistory,
  tools: pachagasTools,
  temperature: 0,
  maxSteps: 5, // máximo 5 tool calls por respuesta
})
\`\`\`

El coste es mayor que Groq con Llama, pero para un asistente con 31 usuarios y uso esporádico, es completamente asumible.

## Criterios que uso ahora para elegir modelos con function calling

1. **Precisión en tool selection** > velocidad > coste. Un error silencioso es peor que una respuesta lenta.

2. **Determinismo con temperatura 0**: Testea tu caso de uso con temperatura 0. Si el modelo sigue siendo inconsistente, el problema es el modelo, no el sampling.

3. **Complejidad de los schemas**: Para schemas simples (1-2 parámetros por tool), muchos modelos funcionan bien. Para schemas complejos con parámetros opcionales y múltiples tools relacionadas, OpenAI sigue siendo el benchmark.

4. **Evalúa con tus queries reales**: Los benchmarks públicos de function calling no reflejan tu caso específico. Construye un conjunto de 20-30 queries representativas y mide precision/recall de tool calls.

**Código fuente:** [github.com/gustavintavo8/PachagasApp](https://github.com/gustavintavo8/PachagasApp)
`,mn=`---
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

\`\`\`python
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
\`\`\`

El efecto fue inmediato: en lugar de alucinar sobre preguntas fuera de scope, el sistema responde honestamente "no encuentro normativa relevante". Mucho más útil y seguro.

## Defensa 2 — Temperatura 0

La temperatura controla la aleatoriedad del sampling. Con temperatura > 0, el modelo puede elegir tokens menos probables, lo que introduce variedad creativa. En dominio legal, esa variedad es un defecto.

Quiero que el modelo sea maximalmente determinista dado el contexto. Con temperatura 0, el LLM selecciona siempre el token más probable. Esto no elimina las alucinaciones (el modelo puede aún generar texto incorrecto si el contexto no es suficiente), pero las reduce drásticamente y hace el sistema reproducible.

\`\`\`python
response = client.chat.completions.create(
    model="llama-4-scout-17b-16e-instruct",
    messages=messages,
    temperature=0,  # máximo determinismo
    max_tokens=2048,
)
\`\`\`

Una ventaja secundaria: los tests de evaluación se vuelven deterministas. Puedo comparar respuestas entre versiones del corpus con la misma query y saber que las diferencias vienen del corpus, no del sampling.

## Defensa 3 — Citas textuales forzadas

La defensa más efectiva fue estructural: el system prompt exige que cada obligación citada incluya el fragmento textual exacto del documento legal que la respalda.

\`\`\`python
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
\`\`\`

Esto crea un mecanismo de auto-verificación: si el modelo incluye una cita, es verificable. Si alucina una obligación sin cita, el formato roto lo delata. En la práctica, Llama 4 Scout cumple esta restricción con alta fidelidad con temperatura 0.

## Lo que aprendí

**Un sistema de evaluación que no replica producción no es solo incompleto: es engañoso.** Mis primeras métricas de evaluación usaban preguntas con buena cobertura en el corpus. El sistema parecía funcionar bien. Cuando introduje preguntas fuera del scope del corpus en los tests, descubrí todos los problemas.

El pipeline de RAG más robusto no es el que tiene el mejor retriever ni el mejor LLM. Es el que tiene los mejores puntos de parada: los momentos en los que el sistema dice "no sé" en lugar de inventar.

**Recursos útiles:**
- [RAGAS framework](https://github.com/explodinggradients/ragas) para evaluación de RAG
- [LangChain score threshold retriever](https://python.langchain.com/docs/modules/data_connection/retrievers/MultiQueryRetriever)
- Repositorio: [github.com/gustavintavo8/legaldev](https://github.com/gustavintavo8/legaldev)
`;function Ee(e){return typeof e>"u"||e===null}function hn(e){return typeof e=="object"&&e!==null}function gn(e){return Array.isArray(e)?e:Ee(e)?[]:[e]}function xn(e,n){var i,o,r,a;if(n)for(a=Object.keys(n),i=0,o=a.length;i<o;i+=1)r=a[i],e[r]=n[r];return e}function vn(e,n){var i="",o;for(o=0;o<n;o+=1)i+=e;return i}function An(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}var yn=Ee,bn=hn,Cn=gn,En=vn,_n=An,Sn=xn,y={isNothing:yn,isObject:bn,toArray:Cn,repeat:En,isNegativeZero:_n,extend:Sn};function _e(e,n){var i="",o=e.reason||"(unknown reason)";return e.mark?(e.mark.name&&(i+='in "'+e.mark.name+'" '),i+="("+(e.mark.line+1)+":"+(e.mark.column+1)+")",!n&&e.mark.snippet&&(i+=`

`+e.mark.snippet),o+" "+i):o}function R(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=_e(this,!1),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}R.prototype=Object.create(Error.prototype);R.prototype.constructor=R;R.prototype.toString=function(n){return this.name+": "+_e(this,n)};var E=R;function Q(e,n,i,o,r){var a="",l="",u=Math.floor(r/2)-1;return o-n>u&&(a=" ... ",n=o-u+a.length),i-o>u&&(l=" ...",i=o+u-l.length),{str:a+e.slice(n,i).replace(/\t/g,"→")+l,pos:o-n+a.length}}function $(e,n){return y.repeat(" ",n-e.length)+e}function wn(e,n){if(n=Object.create(n||null),!e.buffer)return null;n.maxLength||(n.maxLength=79),typeof n.indent!="number"&&(n.indent=1),typeof n.linesBefore!="number"&&(n.linesBefore=3),typeof n.linesAfter!="number"&&(n.linesAfter=2);for(var i=/\r?\n|\r|\0/g,o=[0],r=[],a,l=-1;a=i.exec(e.buffer);)r.push(a.index),o.push(a.index+a[0].length),e.position<=a.index&&l<0&&(l=o.length-2);l<0&&(l=o.length-1);var u="",c,t,p=Math.min(e.line+n.linesAfter,r.length).toString().length,s=n.maxLength-(n.indent+p+3);for(c=1;c<=n.linesBefore&&!(l-c<0);c++)t=Q(e.buffer,o[l-c],r[l-c],e.position-(o[l]-o[l-c]),s),u=y.repeat(" ",n.indent)+$((e.line-c+1).toString(),p)+" | "+t.str+`
`+u;for(t=Q(e.buffer,o[l],r[l],e.position,s),u+=y.repeat(" ",n.indent)+$((e.line+1).toString(),p)+" | "+t.str+`
`,u+=y.repeat("-",n.indent+p+3+t.pos)+`^
`,c=1;c<=n.linesAfter&&!(l+c>=r.length);c++)t=Q(e.buffer,o[l+c],r[l+c],e.position-(o[l]-o[l+c]),s),u+=y.repeat(" ",n.indent)+$((e.line+c+1).toString(),p)+" | "+t.str+`
`;return u.replace(/\n$/,"")}var Ln=wn,Tn=["kind","multi","resolve","construct","instanceOf","predicate","represent","representName","defaultStyle","styleAliases"],Fn=["scalar","sequence","mapping"];function On(e){var n={};return e!==null&&Object.keys(e).forEach(function(i){e[i].forEach(function(o){n[String(o)]=i})}),n}function In(e,n){if(n=n||{},Object.keys(n).forEach(function(i){if(Tn.indexOf(i)===-1)throw new E('Unknown option "'+i+'" is met in definition of "'+e+'" YAML type.')}),this.options=n,this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(i){return i},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.representName=n.representName||null,this.defaultStyle=n.defaultStyle||null,this.multi=n.multi||!1,this.styleAliases=On(n.styleAliases||null),Fn.indexOf(this.kind)===-1)throw new E('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var b=In;function ce(e,n){var i=[];return e[n].forEach(function(o){var r=i.length;i.forEach(function(a,l){a.tag===o.tag&&a.kind===o.kind&&a.multi===o.multi&&(r=l)}),i[r]=o}),i}function kn(){var e={scalar:{},sequence:{},mapping:{},fallback:{},multi:{scalar:[],sequence:[],mapping:[],fallback:[]}},n,i;function o(r){r.multi?(e.multi[r.kind].push(r),e.multi.fallback.push(r)):e[r.kind][r.tag]=e.fallback[r.tag]=r}for(n=0,i=arguments.length;n<i;n+=1)arguments[n].forEach(o);return e}function X(e){return this.extend(e)}X.prototype.extend=function(n){var i=[],o=[];if(n instanceof b)o.push(n);else if(Array.isArray(n))o=o.concat(n);else if(n&&(Array.isArray(n.implicit)||Array.isArray(n.explicit)))n.implicit&&(i=i.concat(n.implicit)),n.explicit&&(o=o.concat(n.explicit));else throw new E("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");i.forEach(function(a){if(!(a instanceof b))throw new E("Specified list of YAML types (or a single Type object) contains a non-Type object.");if(a.loadKind&&a.loadKind!=="scalar")throw new E("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");if(a.multi)throw new E("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.")}),o.forEach(function(a){if(!(a instanceof b))throw new E("Specified list of YAML types (or a single Type object) contains a non-Type object.")});var r=Object.create(X.prototype);return r.implicit=(this.implicit||[]).concat(i),r.explicit=(this.explicit||[]).concat(o),r.compiledImplicit=ce(r,"implicit"),r.compiledExplicit=ce(r,"explicit"),r.compiledTypeMap=kn(r.compiledImplicit,r.compiledExplicit),r};var Se=X,we=new b("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),Le=new b("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),Te=new b("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),Fe=new Se({explicit:[we,Le,Te]});function Nn(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function Pn(){return null}function Mn(e){return e===null}var Oe=new b("tag:yaml.org,2002:null",{kind:"scalar",resolve:Nn,construct:Pn,predicate:Mn,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"},empty:function(){return""}},defaultStyle:"lowercase"});function Dn(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function Rn(e){return e==="true"||e==="True"||e==="TRUE"}function qn(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var Ie=new b("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Dn,construct:Rn,predicate:qn,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"});function jn(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function Bn(e){return 48<=e&&e<=55}function Yn(e){return 48<=e&&e<=57}function Hn(e){if(e===null)return!1;var n=e.length,i=0,o=!1,r;if(!n)return!1;if(r=e[i],(r==="-"||r==="+")&&(r=e[++i]),r==="0"){if(i+1===n)return!0;if(r=e[++i],r==="b"){for(i++;i<n;i++)if(r=e[i],r!=="_"){if(r!=="0"&&r!=="1")return!1;o=!0}return o&&r!=="_"}if(r==="x"){for(i++;i<n;i++)if(r=e[i],r!=="_"){if(!jn(e.charCodeAt(i)))return!1;o=!0}return o&&r!=="_"}if(r==="o"){for(i++;i<n;i++)if(r=e[i],r!=="_"){if(!Bn(e.charCodeAt(i)))return!1;o=!0}return o&&r!=="_"}}if(r==="_")return!1;for(;i<n;i++)if(r=e[i],r!=="_"){if(!Yn(e.charCodeAt(i)))return!1;o=!0}return!(!o||r==="_")}function Gn(e){var n=e,i=1,o;if(n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),o=n[0],(o==="-"||o==="+")&&(o==="-"&&(i=-1),n=n.slice(1),o=n[0]),n==="0")return 0;if(o==="0"){if(n[1]==="b")return i*parseInt(n.slice(2),2);if(n[1]==="x")return i*parseInt(n.slice(2),16);if(n[1]==="o")return i*parseInt(n.slice(2),8)}return i*parseInt(n,10)}function Un(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!y.isNegativeZero(e)}var ke=new b("tag:yaml.org,2002:int",{kind:"scalar",resolve:Hn,construct:Gn,predicate:Un,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0o"+e.toString(8):"-0o"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),Kn=new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function zn(e){return!(e===null||!Kn.test(e)||e[e.length-1]==="_")}function Wn(e){var n,i;return n=e.replace(/_/g,"").toLowerCase(),i=n[0]==="-"?-1:1,"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?i===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:i*parseFloat(n,10)}var Qn=/^[-+]?[0-9]+e/;function $n(e,n){var i;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(y.isNegativeZero(e))return"-0.0";return i=e.toString(10),Qn.test(i)?i.replace("e",".e"):i}function Vn(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||y.isNegativeZero(e))}var Ne=new b("tag:yaml.org,2002:float",{kind:"scalar",resolve:zn,construct:Wn,predicate:Vn,represent:$n,defaultStyle:"lowercase"}),Pe=Fe.extend({implicit:[Oe,Ie,ke,Ne]}),Me=Pe,De=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),Re=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function Xn(e){return e===null?!1:De.exec(e)!==null||Re.exec(e)!==null}function Zn(e){var n,i,o,r,a,l,u,c=0,t=null,p,s,d;if(n=De.exec(e),n===null&&(n=Re.exec(e)),n===null)throw new Error("Date resolve error");if(i=+n[1],o=+n[2]-1,r=+n[3],!n[4])return new Date(Date.UTC(i,o,r));if(a=+n[4],l=+n[5],u=+n[6],n[7]){for(c=n[7].slice(0,3);c.length<3;)c+="0";c=+c}return n[9]&&(p=+n[10],s=+(n[11]||0),t=(p*60+s)*6e4,n[9]==="-"&&(t=-t)),d=new Date(Date.UTC(i,o,r,a,l,u,c)),t&&d.setTime(d.getTime()-t),d}function Jn(e){return e.toISOString()}var qe=new b("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:Xn,construct:Zn,instanceOf:Date,represent:Jn});function ei(e){return e==="<<"||e===null}var je=new b("tag:yaml.org,2002:merge",{kind:"scalar",resolve:ei}),ie=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function ni(e){if(e===null)return!1;var n,i,o=0,r=e.length,a=ie;for(i=0;i<r;i++)if(n=a.indexOf(e.charAt(i)),!(n>64)){if(n<0)return!1;o+=6}return o%8===0}function ii(e){var n,i,o=e.replace(/[\r\n=]/g,""),r=o.length,a=ie,l=0,u=[];for(n=0;n<r;n++)n%4===0&&n&&(u.push(l>>16&255),u.push(l>>8&255),u.push(l&255)),l=l<<6|a.indexOf(o.charAt(n));return i=r%4*6,i===0?(u.push(l>>16&255),u.push(l>>8&255),u.push(l&255)):i===18?(u.push(l>>10&255),u.push(l>>2&255)):i===12&&u.push(l>>4&255),new Uint8Array(u)}function ri(e){var n="",i=0,o,r,a=e.length,l=ie;for(o=0;o<a;o++)o%3===0&&o&&(n+=l[i>>18&63],n+=l[i>>12&63],n+=l[i>>6&63],n+=l[i&63]),i=(i<<8)+e[o];return r=a%3,r===0?(n+=l[i>>18&63],n+=l[i>>12&63],n+=l[i>>6&63],n+=l[i&63]):r===2?(n+=l[i>>10&63],n+=l[i>>4&63],n+=l[i<<2&63],n+=l[64]):r===1&&(n+=l[i>>2&63],n+=l[i<<4&63],n+=l[64],n+=l[64]),n}function oi(e){return Object.prototype.toString.call(e)==="[object Uint8Array]"}var Be=new b("tag:yaml.org,2002:binary",{kind:"scalar",resolve:ni,construct:ii,predicate:oi,represent:ri}),li=Object.prototype.hasOwnProperty,ai=Object.prototype.toString;function ui(e){if(e===null)return!0;var n=[],i,o,r,a,l,u=e;for(i=0,o=u.length;i<o;i+=1){if(r=u[i],l=!1,ai.call(r)!=="[object Object]")return!1;for(a in r)if(li.call(r,a))if(!l)l=!0;else return!1;if(!l)return!1;if(n.indexOf(a)===-1)n.push(a);else return!1}return!0}function ci(e){return e!==null?e:[]}var Ye=new b("tag:yaml.org,2002:omap",{kind:"sequence",resolve:ui,construct:ci}),ti=Object.prototype.toString;function si(e){if(e===null)return!0;var n,i,o,r,a,l=e;for(a=new Array(l.length),n=0,i=l.length;n<i;n+=1){if(o=l[n],ti.call(o)!=="[object Object]"||(r=Object.keys(o),r.length!==1))return!1;a[n]=[r[0],o[r[0]]]}return!0}function pi(e){if(e===null)return[];var n,i,o,r,a,l=e;for(a=new Array(l.length),n=0,i=l.length;n<i;n+=1)o=l[n],r=Object.keys(o),a[n]=[r[0],o[r[0]]];return a}var He=new b("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:si,construct:pi}),fi=Object.prototype.hasOwnProperty;function di(e){if(e===null)return!0;var n,i=e;for(n in i)if(fi.call(i,n)&&i[n]!==null)return!1;return!0}function mi(e){return e!==null?e:{}}var Ge=new b("tag:yaml.org,2002:set",{kind:"mapping",resolve:di,construct:mi}),re=Me.extend({implicit:[qe,je],explicit:[Be,Ye,He,Ge]}),F=Object.prototype.hasOwnProperty,H=1,Ue=2,Ke=3,G=4,V=1,hi=2,te=3,gi=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,xi=/[\x85\u2028\u2029]/,vi=/[,\[\]\{\}]/,ze=/^(?:!|!!|![a-z\-]+!)$/i,We=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function se(e){return Object.prototype.toString.call(e)}function w(e){return e===10||e===13}function O(e){return e===9||e===32}function _(e){return e===9||e===32||e===10||e===13}function N(e){return e===44||e===91||e===93||e===123||e===125}function Ai(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function yi(e){return e===120?2:e===117?4:e===85?8:0}function bi(e){return 48<=e&&e<=57?e-48:-1}function pe(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function Ci(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function Qe(e,n,i){n==="__proto__"?Object.defineProperty(e,n,{configurable:!0,enumerable:!0,writable:!0,value:i}):e[n]=i}var $e=new Array(256),Ve=new Array(256);for(var I=0;I<256;I++)$e[I]=pe(I)?1:0,Ve[I]=pe(I);function Ei(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||re,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.firstTabInLine=-1,this.documents=[]}function Xe(e,n){var i={name:e.filename,buffer:e.input.slice(0,-1),position:e.position,line:e.line,column:e.position-e.lineStart};return i.snippet=Ln(i),new E(n,i)}function f(e,n){throw Xe(e,n)}function U(e,n){e.onWarning&&e.onWarning.call(null,Xe(e,n))}var fe={YAML:function(n,i,o){var r,a,l;n.version!==null&&f(n,"duplication of %YAML directive"),o.length!==1&&f(n,"YAML directive accepts exactly one argument"),r=/^([0-9]+)\.([0-9]+)$/.exec(o[0]),r===null&&f(n,"ill-formed argument of the YAML directive"),a=parseInt(r[1],10),l=parseInt(r[2],10),a!==1&&f(n,"unacceptable YAML version of the document"),n.version=o[0],n.checkLineBreaks=l<2,l!==1&&l!==2&&U(n,"unsupported YAML version of the document")},TAG:function(n,i,o){var r,a;o.length!==2&&f(n,"TAG directive accepts exactly two arguments"),r=o[0],a=o[1],ze.test(r)||f(n,"ill-formed tag handle (first argument) of the TAG directive"),F.call(n.tagMap,r)&&f(n,'there is a previously declared suffix for "'+r+'" tag handle'),We.test(a)||f(n,"ill-formed tag prefix (second argument) of the TAG directive");try{a=decodeURIComponent(a)}catch{f(n,"tag prefix is malformed: "+a)}n.tagMap[r]=a}};function T(e,n,i,o){var r,a,l,u;if(n<i){if(u=e.input.slice(n,i),o)for(r=0,a=u.length;r<a;r+=1)l=u.charCodeAt(r),l===9||32<=l&&l<=1114111||f(e,"expected valid JSON character");else gi.test(u)&&f(e,"the stream contains non-printable characters");e.result+=u}}function de(e,n,i,o){var r,a,l,u;for(y.isObject(i)||f(e,"cannot merge mappings; the provided source object is unacceptable"),r=Object.keys(i),l=0,u=r.length;l<u;l+=1)a=r[l],F.call(n,a)||(Qe(n,a,i[a]),o[a]=!0)}function P(e,n,i,o,r,a,l,u,c){var t,p;if(Array.isArray(r))for(r=Array.prototype.slice.call(r),t=0,p=r.length;t<p;t+=1)Array.isArray(r[t])&&f(e,"nested arrays are not supported inside keys"),typeof r=="object"&&se(r[t])==="[object Object]"&&(r[t]="[object Object]");if(typeof r=="object"&&se(r)==="[object Object]"&&(r="[object Object]"),r=String(r),n===null&&(n={}),o==="tag:yaml.org,2002:merge")if(Array.isArray(a))for(t=0,p=a.length;t<p;t+=1)de(e,n,a[t],i);else de(e,n,a,i);else!e.json&&!F.call(i,r)&&F.call(n,r)&&(e.line=l||e.line,e.lineStart=u||e.lineStart,e.position=c||e.position,f(e,"duplicated mapping key")),Qe(n,r,a),delete i[r];return n}function oe(e){var n;n=e.input.charCodeAt(e.position),n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):f(e,"a line break is expected"),e.line+=1,e.lineStart=e.position,e.firstTabInLine=-1}function A(e,n,i){for(var o=0,r=e.input.charCodeAt(e.position);r!==0;){for(;O(r);)r===9&&e.firstTabInLine===-1&&(e.firstTabInLine=e.position),r=e.input.charCodeAt(++e.position);if(n&&r===35)do r=e.input.charCodeAt(++e.position);while(r!==10&&r!==13&&r!==0);if(w(r))for(oe(e),r=e.input.charCodeAt(e.position),o++,e.lineIndent=0;r===32;)e.lineIndent++,r=e.input.charCodeAt(++e.position);else break}return i!==-1&&o!==0&&e.lineIndent<i&&U(e,"deficient indentation"),o}function W(e){var n=e.position,i;return i=e.input.charCodeAt(n),!!((i===45||i===46)&&i===e.input.charCodeAt(n+1)&&i===e.input.charCodeAt(n+2)&&(n+=3,i=e.input.charCodeAt(n),i===0||_(i)))}function le(e,n){n===1?e.result+=" ":n>1&&(e.result+=y.repeat(`
`,n-1))}function _i(e,n,i){var o,r,a,l,u,c,t,p,s=e.kind,d=e.result,m;if(m=e.input.charCodeAt(e.position),_(m)||N(m)||m===35||m===38||m===42||m===33||m===124||m===62||m===39||m===34||m===37||m===64||m===96||(m===63||m===45)&&(r=e.input.charCodeAt(e.position+1),_(r)||i&&N(r)))return!1;for(e.kind="scalar",e.result="",a=l=e.position,u=!1;m!==0;){if(m===58){if(r=e.input.charCodeAt(e.position+1),_(r)||i&&N(r))break}else if(m===35){if(o=e.input.charCodeAt(e.position-1),_(o))break}else{if(e.position===e.lineStart&&W(e)||i&&N(m))break;if(w(m))if(c=e.line,t=e.lineStart,p=e.lineIndent,A(e,!1,-1),e.lineIndent>=n){u=!0,m=e.input.charCodeAt(e.position);continue}else{e.position=l,e.line=c,e.lineStart=t,e.lineIndent=p;break}}u&&(T(e,a,l,!1),le(e,e.line-c),a=l=e.position,u=!1),O(m)||(l=e.position+1),m=e.input.charCodeAt(++e.position)}return T(e,a,l,!1),e.result?!0:(e.kind=s,e.result=d,!1)}function Si(e,n){var i,o,r;if(i=e.input.charCodeAt(e.position),i!==39)return!1;for(e.kind="scalar",e.result="",e.position++,o=r=e.position;(i=e.input.charCodeAt(e.position))!==0;)if(i===39)if(T(e,o,e.position,!0),i=e.input.charCodeAt(++e.position),i===39)o=e.position,e.position++,r=e.position;else return!0;else w(i)?(T(e,o,r,!0),le(e,A(e,!1,n)),o=r=e.position):e.position===e.lineStart&&W(e)?f(e,"unexpected end of the document within a single quoted scalar"):(e.position++,r=e.position);f(e,"unexpected end of the stream within a single quoted scalar")}function wi(e,n){var i,o,r,a,l,u;if(u=e.input.charCodeAt(e.position),u!==34)return!1;for(e.kind="scalar",e.result="",e.position++,i=o=e.position;(u=e.input.charCodeAt(e.position))!==0;){if(u===34)return T(e,i,e.position,!0),e.position++,!0;if(u===92){if(T(e,i,e.position,!0),u=e.input.charCodeAt(++e.position),w(u))A(e,!1,n);else if(u<256&&$e[u])e.result+=Ve[u],e.position++;else if((l=yi(u))>0){for(r=l,a=0;r>0;r--)u=e.input.charCodeAt(++e.position),(l=Ai(u))>=0?a=(a<<4)+l:f(e,"expected hexadecimal character");e.result+=Ci(a),e.position++}else f(e,"unknown escape sequence");i=o=e.position}else w(u)?(T(e,i,o,!0),le(e,A(e,!1,n)),i=o=e.position):e.position===e.lineStart&&W(e)?f(e,"unexpected end of the document within a double quoted scalar"):(e.position++,o=e.position)}f(e,"unexpected end of the stream within a double quoted scalar")}function Li(e,n){var i=!0,o,r,a,l=e.tag,u,c=e.anchor,t,p,s,d,m,h=Object.create(null),x,v,S,g;if(g=e.input.charCodeAt(e.position),g===91)p=93,m=!1,u=[];else if(g===123)p=125,m=!0,u={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=u),g=e.input.charCodeAt(++e.position);g!==0;){if(A(e,!0,n),g=e.input.charCodeAt(e.position),g===p)return e.position++,e.tag=l,e.anchor=c,e.kind=m?"mapping":"sequence",e.result=u,!0;i?g===44&&f(e,"expected the node content, but found ','"):f(e,"missed comma between flow collection entries"),v=x=S=null,s=d=!1,g===63&&(t=e.input.charCodeAt(e.position+1),_(t)&&(s=d=!0,e.position++,A(e,!0,n))),o=e.line,r=e.lineStart,a=e.position,M(e,n,H,!1,!0),v=e.tag,x=e.result,A(e,!0,n),g=e.input.charCodeAt(e.position),(d||e.line===o)&&g===58&&(s=!0,g=e.input.charCodeAt(++e.position),A(e,!0,n),M(e,n,H,!1,!0),S=e.result),m?P(e,u,h,v,x,S,o,r,a):s?u.push(P(e,null,h,v,x,S,o,r,a)):u.push(x),A(e,!0,n),g=e.input.charCodeAt(e.position),g===44?(i=!0,g=e.input.charCodeAt(++e.position)):i=!1}f(e,"unexpected end of the stream within a flow collection")}function Ti(e,n){var i,o,r=V,a=!1,l=!1,u=n,c=0,t=!1,p,s;if(s=e.input.charCodeAt(e.position),s===124)o=!1;else if(s===62)o=!0;else return!1;for(e.kind="scalar",e.result="";s!==0;)if(s=e.input.charCodeAt(++e.position),s===43||s===45)V===r?r=s===43?te:hi:f(e,"repeat of a chomping mode identifier");else if((p=bi(s))>=0)p===0?f(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):l?f(e,"repeat of an indentation width identifier"):(u=n+p-1,l=!0);else break;if(O(s)){do s=e.input.charCodeAt(++e.position);while(O(s));if(s===35)do s=e.input.charCodeAt(++e.position);while(!w(s)&&s!==0)}for(;s!==0;){for(oe(e),e.lineIndent=0,s=e.input.charCodeAt(e.position);(!l||e.lineIndent<u)&&s===32;)e.lineIndent++,s=e.input.charCodeAt(++e.position);if(!l&&e.lineIndent>u&&(u=e.lineIndent),w(s)){c++;continue}if(e.lineIndent<u){r===te?e.result+=y.repeat(`
`,a?1+c:c):r===V&&a&&(e.result+=`
`);break}for(o?O(s)?(t=!0,e.result+=y.repeat(`
`,a?1+c:c)):t?(t=!1,e.result+=y.repeat(`
`,c+1)):c===0?a&&(e.result+=" "):e.result+=y.repeat(`
`,c):e.result+=y.repeat(`
`,a?1+c:c),a=!0,l=!0,c=0,i=e.position;!w(s)&&s!==0;)s=e.input.charCodeAt(++e.position);T(e,i,e.position,!1)}return!0}function me(e,n){var i,o=e.tag,r=e.anchor,a=[],l,u=!1,c;if(e.firstTabInLine!==-1)return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=a),c=e.input.charCodeAt(e.position);c!==0&&(e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,f(e,"tab characters must not be used in indentation")),!(c!==45||(l=e.input.charCodeAt(e.position+1),!_(l))));){if(u=!0,e.position++,A(e,!0,-1)&&e.lineIndent<=n){a.push(null),c=e.input.charCodeAt(e.position);continue}if(i=e.line,M(e,n,Ke,!1,!0),a.push(e.result),A(e,!0,-1),c=e.input.charCodeAt(e.position),(e.line===i||e.lineIndent>n)&&c!==0)f(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return u?(e.tag=o,e.anchor=r,e.kind="sequence",e.result=a,!0):!1}function Fi(e,n,i){var o,r,a,l,u,c,t=e.tag,p=e.anchor,s={},d=Object.create(null),m=null,h=null,x=null,v=!1,S=!1,g;if(e.firstTabInLine!==-1)return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=s),g=e.input.charCodeAt(e.position);g!==0;){if(!v&&e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,f(e,"tab characters must not be used in indentation")),o=e.input.charCodeAt(e.position+1),a=e.line,(g===63||g===58)&&_(o))g===63?(v&&(P(e,s,d,m,h,null,l,u,c),m=h=x=null),S=!0,v=!0,r=!0):v?(v=!1,r=!0):f(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,g=o;else{if(l=e.line,u=e.lineStart,c=e.position,!M(e,i,Ue,!1,!0))break;if(e.line===a){for(g=e.input.charCodeAt(e.position);O(g);)g=e.input.charCodeAt(++e.position);if(g===58)g=e.input.charCodeAt(++e.position),_(g)||f(e,"a whitespace character is expected after the key-value separator within a block mapping"),v&&(P(e,s,d,m,h,null,l,u,c),m=h=x=null),S=!0,v=!1,r=!1,m=e.tag,h=e.result;else if(S)f(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=t,e.anchor=p,!0}else if(S)f(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=t,e.anchor=p,!0}if((e.line===a||e.lineIndent>n)&&(v&&(l=e.line,u=e.lineStart,c=e.position),M(e,n,G,!0,r)&&(v?h=e.result:x=e.result),v||(P(e,s,d,m,h,x,l,u,c),m=h=x=null),A(e,!0,-1),g=e.input.charCodeAt(e.position)),(e.line===a||e.lineIndent>n)&&g!==0)f(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return v&&P(e,s,d,m,h,null,l,u,c),S&&(e.tag=t,e.anchor=p,e.kind="mapping",e.result=s),S}function Oi(e){var n,i=!1,o=!1,r,a,l;if(l=e.input.charCodeAt(e.position),l!==33)return!1;if(e.tag!==null&&f(e,"duplication of a tag property"),l=e.input.charCodeAt(++e.position),l===60?(i=!0,l=e.input.charCodeAt(++e.position)):l===33?(o=!0,r="!!",l=e.input.charCodeAt(++e.position)):r="!",n=e.position,i){do l=e.input.charCodeAt(++e.position);while(l!==0&&l!==62);e.position<e.length?(a=e.input.slice(n,e.position),l=e.input.charCodeAt(++e.position)):f(e,"unexpected end of the stream within a verbatim tag")}else{for(;l!==0&&!_(l);)l===33&&(o?f(e,"tag suffix cannot contain exclamation marks"):(r=e.input.slice(n-1,e.position+1),ze.test(r)||f(e,"named tag handle cannot contain such characters"),o=!0,n=e.position+1)),l=e.input.charCodeAt(++e.position);a=e.input.slice(n,e.position),vi.test(a)&&f(e,"tag suffix cannot contain flow indicator characters")}a&&!We.test(a)&&f(e,"tag name cannot contain such characters: "+a);try{a=decodeURIComponent(a)}catch{f(e,"tag name is malformed: "+a)}return i?e.tag=a:F.call(e.tagMap,r)?e.tag=e.tagMap[r]+a:r==="!"?e.tag="!"+a:r==="!!"?e.tag="tag:yaml.org,2002:"+a:f(e,'undeclared tag handle "'+r+'"'),!0}function Ii(e){var n,i;if(i=e.input.charCodeAt(e.position),i!==38)return!1;for(e.anchor!==null&&f(e,"duplication of an anchor property"),i=e.input.charCodeAt(++e.position),n=e.position;i!==0&&!_(i)&&!N(i);)i=e.input.charCodeAt(++e.position);return e.position===n&&f(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function ki(e){var n,i,o;if(o=e.input.charCodeAt(e.position),o!==42)return!1;for(o=e.input.charCodeAt(++e.position),n=e.position;o!==0&&!_(o)&&!N(o);)o=e.input.charCodeAt(++e.position);return e.position===n&&f(e,"name of an alias node must contain at least one character"),i=e.input.slice(n,e.position),F.call(e.anchorMap,i)||f(e,'unidentified alias "'+i+'"'),e.result=e.anchorMap[i],A(e,!0,-1),!0}function M(e,n,i,o,r){var a,l,u,c=1,t=!1,p=!1,s,d,m,h,x,v;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,a=l=u=G===i||Ke===i,o&&A(e,!0,-1)&&(t=!0,e.lineIndent>n?c=1:e.lineIndent===n?c=0:e.lineIndent<n&&(c=-1)),c===1)for(;Oi(e)||Ii(e);)A(e,!0,-1)?(t=!0,u=a,e.lineIndent>n?c=1:e.lineIndent===n?c=0:e.lineIndent<n&&(c=-1)):u=!1;if(u&&(u=t||r),(c===1||G===i)&&(H===i||Ue===i?x=n:x=n+1,v=e.position-e.lineStart,c===1?u&&(me(e,v)||Fi(e,v,x))||Li(e,x)?p=!0:(l&&Ti(e,x)||Si(e,x)||wi(e,x)?p=!0:ki(e)?(p=!0,(e.tag!==null||e.anchor!==null)&&f(e,"alias node should not have any properties")):_i(e,x,H===i)&&(p=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):c===0&&(p=u&&me(e,v))),e.tag===null)e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);else if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&f(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),s=0,d=e.implicitTypes.length;s<d;s+=1)if(h=e.implicitTypes[s],h.resolve(e.result)){e.result=h.construct(e.result),e.tag=h.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else if(e.tag!=="!"){if(F.call(e.typeMap[e.kind||"fallback"],e.tag))h=e.typeMap[e.kind||"fallback"][e.tag];else for(h=null,m=e.typeMap.multi[e.kind||"fallback"],s=0,d=m.length;s<d;s+=1)if(e.tag.slice(0,m[s].tag.length)===m[s].tag){h=m[s];break}h||f(e,"unknown tag !<"+e.tag+">"),e.result!==null&&h.kind!==e.kind&&f(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+h.kind+'", not "'+e.kind+'"'),h.resolve(e.result,e.tag)?(e.result=h.construct(e.result,e.tag),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):f(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")}return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||p}function Ni(e){var n=e.position,i,o,r,a=!1,l;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap=Object.create(null),e.anchorMap=Object.create(null);(l=e.input.charCodeAt(e.position))!==0&&(A(e,!0,-1),l=e.input.charCodeAt(e.position),!(e.lineIndent>0||l!==37));){for(a=!0,l=e.input.charCodeAt(++e.position),i=e.position;l!==0&&!_(l);)l=e.input.charCodeAt(++e.position);for(o=e.input.slice(i,e.position),r=[],o.length<1&&f(e,"directive name must not be less than one character in length");l!==0;){for(;O(l);)l=e.input.charCodeAt(++e.position);if(l===35){do l=e.input.charCodeAt(++e.position);while(l!==0&&!w(l));break}if(w(l))break;for(i=e.position;l!==0&&!_(l);)l=e.input.charCodeAt(++e.position);r.push(e.input.slice(i,e.position))}l!==0&&oe(e),F.call(fe,o)?fe[o](e,o,r):U(e,'unknown document directive "'+o+'"')}if(A(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,A(e,!0,-1)):a&&f(e,"directives end mark is expected"),M(e,e.lineIndent-1,G,!1,!0),A(e,!0,-1),e.checkLineBreaks&&xi.test(e.input.slice(n,e.position))&&U(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&W(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,A(e,!0,-1));return}if(e.position<e.length-1)f(e,"end of the stream or a document separator is expected");else return}function Ze(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var i=new Ei(e,n),o=e.indexOf("\0");for(o!==-1&&(i.position=o,f(i,"null byte is not allowed in input")),i.input+="\0";i.input.charCodeAt(i.position)===32;)i.lineIndent+=1,i.position+=1;for(;i.position<i.length-1;)Ni(i);return i.documents}function Pi(e,n,i){n!==null&&typeof n=="object"&&typeof i>"u"&&(i=n,n=null);var o=Ze(e,i);if(typeof n!="function")return o;for(var r=0,a=o.length;r<a;r+=1)n(o[r])}function Mi(e,n){var i=Ze(e,n);if(i.length!==0){if(i.length===1)return i[0];throw new E("expected a single document in the stream, but found more")}}var Di=Pi,Ri=Mi,Je={loadAll:Di,load:Ri},en=Object.prototype.toString,nn=Object.prototype.hasOwnProperty,ae=65279,qi=9,q=10,ji=13,Bi=32,Yi=33,Hi=34,Z=35,Gi=37,Ui=38,Ki=39,zi=42,rn=44,Wi=45,K=58,Qi=61,$i=62,Vi=63,Xi=64,on=91,ln=93,Zi=96,an=123,Ji=124,un=125,C={};C[0]="\\0";C[7]="\\a";C[8]="\\b";C[9]="\\t";C[10]="\\n";C[11]="\\v";C[12]="\\f";C[13]="\\r";C[27]="\\e";C[34]='\\"';C[92]="\\\\";C[133]="\\N";C[160]="\\_";C[8232]="\\L";C[8233]="\\P";var er=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"],nr=/^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;function ir(e,n){var i,o,r,a,l,u,c;if(n===null)return{};for(i={},o=Object.keys(n),r=0,a=o.length;r<a;r+=1)l=o[r],u=String(n[l]),l.slice(0,2)==="!!"&&(l="tag:yaml.org,2002:"+l.slice(2)),c=e.compiledTypeMap.fallback[l],c&&nn.call(c.styleAliases,u)&&(u=c.styleAliases[u]),i[l]=u;return i}function rr(e){var n,i,o;if(n=e.toString(16).toUpperCase(),e<=255)i="x",o=2;else if(e<=65535)i="u",o=4;else if(e<=4294967295)i="U",o=8;else throw new E("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+i+y.repeat("0",o-n.length)+n}var or=1,j=2;function lr(e){this.schema=e.schema||re,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=y.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=ir(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.quotingType=e.quotingType==='"'?j:or,this.forceQuotes=e.forceQuotes||!1,this.replacer=typeof e.replacer=="function"?e.replacer:null,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function he(e,n){for(var i=y.repeat(" ",n),o=0,r=-1,a="",l,u=e.length;o<u;)r=e.indexOf(`
`,o),r===-1?(l=e.slice(o),o=u):(l=e.slice(o,r+1),o=r+1),l.length&&l!==`
`&&(a+=i),a+=l;return a}function J(e,n){return`
`+y.repeat(" ",e.indent*n)}function ar(e,n){var i,o,r;for(i=0,o=e.implicitTypes.length;i<o;i+=1)if(r=e.implicitTypes[i],r.resolve(n))return!0;return!1}function z(e){return e===Bi||e===qi}function B(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==ae||65536<=e&&e<=1114111}function ge(e){return B(e)&&e!==ae&&e!==ji&&e!==q}function xe(e,n,i){var o=ge(e),r=o&&!z(e);return(i?o:o&&e!==rn&&e!==on&&e!==ln&&e!==an&&e!==un)&&e!==Z&&!(n===K&&!r)||ge(n)&&!z(n)&&e===Z||n===K&&r}function ur(e){return B(e)&&e!==ae&&!z(e)&&e!==Wi&&e!==Vi&&e!==K&&e!==rn&&e!==on&&e!==ln&&e!==an&&e!==un&&e!==Z&&e!==Ui&&e!==zi&&e!==Yi&&e!==Ji&&e!==Qi&&e!==$i&&e!==Ki&&e!==Hi&&e!==Gi&&e!==Xi&&e!==Zi}function cr(e){return!z(e)&&e!==K}function D(e,n){var i=e.charCodeAt(n),o;return i>=55296&&i<=56319&&n+1<e.length&&(o=e.charCodeAt(n+1),o>=56320&&o<=57343)?(i-55296)*1024+o-56320+65536:i}function cn(e){var n=/^\n* /;return n.test(e)}var tn=1,ee=2,sn=3,pn=4,k=5;function tr(e,n,i,o,r,a,l,u){var c,t=0,p=null,s=!1,d=!1,m=o!==-1,h=-1,x=ur(D(e,0))&&cr(D(e,e.length-1));if(n||l)for(c=0;c<e.length;t>=65536?c+=2:c++){if(t=D(e,c),!B(t))return k;x=x&&xe(t,p,u),p=t}else{for(c=0;c<e.length;t>=65536?c+=2:c++){if(t=D(e,c),t===q)s=!0,m&&(d=d||c-h-1>o&&e[h+1]!==" ",h=c);else if(!B(t))return k;x=x&&xe(t,p,u),p=t}d=d||m&&c-h-1>o&&e[h+1]!==" "}return!s&&!d?x&&!l&&!r(e)?tn:a===j?k:ee:i>9&&cn(e)?k:l?a===j?k:ee:d?pn:sn}function sr(e,n,i,o,r){e.dump=(function(){if(n.length===0)return e.quotingType===j?'""':"''";if(!e.noCompatMode&&(er.indexOf(n)!==-1||nr.test(n)))return e.quotingType===j?'"'+n+'"':"'"+n+"'";var a=e.indent*Math.max(1,i),l=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-a),u=o||e.flowLevel>-1&&i>=e.flowLevel;function c(t){return ar(e,t)}switch(tr(n,u,e.indent,l,c,e.quotingType,e.forceQuotes&&!o,r)){case tn:return n;case ee:return"'"+n.replace(/'/g,"''")+"'";case sn:return"|"+ve(n,e.indent)+Ae(he(n,a));case pn:return">"+ve(n,e.indent)+Ae(he(pr(n,l),a));case k:return'"'+fr(n)+'"';default:throw new E("impossible error: invalid scalar style")}})()}function ve(e,n){var i=cn(e)?String(n):"",o=e[e.length-1]===`
`,r=o&&(e[e.length-2]===`
`||e===`
`),a=r?"+":o?"":"-";return i+a+`
`}function Ae(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function pr(e,n){for(var i=/(\n+)([^\n]*)/g,o=(function(){var t=e.indexOf(`
`);return t=t!==-1?t:e.length,i.lastIndex=t,ye(e.slice(0,t),n)})(),r=e[0]===`
`||e[0]===" ",a,l;l=i.exec(e);){var u=l[1],c=l[2];a=c[0]===" ",o+=u+(!r&&!a&&c!==""?`
`:"")+ye(c,n),r=a}return o}function ye(e,n){if(e===""||e[0]===" ")return e;for(var i=/ [^ ]/g,o,r=0,a,l=0,u=0,c="";o=i.exec(e);)u=o.index,u-r>n&&(a=l>r?l:u,c+=`
`+e.slice(r,a),r=a+1),l=u;return c+=`
`,e.length-r>n&&l>r?c+=e.slice(r,l)+`
`+e.slice(l+1):c+=e.slice(r),c.slice(1)}function fr(e){for(var n="",i=0,o,r=0;r<e.length;i>=65536?r+=2:r++)i=D(e,r),o=C[i],!o&&B(i)?(n+=e[r],i>=65536&&(n+=e[r+1])):n+=o||rr(i);return n}function dr(e,n,i){var o="",r=e.tag,a,l,u;for(a=0,l=i.length;a<l;a+=1)u=i[a],e.replacer&&(u=e.replacer.call(i,String(a),u)),(L(e,n,u,!1,!1)||typeof u>"u"&&L(e,n,null,!1,!1))&&(o!==""&&(o+=","+(e.condenseFlow?"":" ")),o+=e.dump);e.tag=r,e.dump="["+o+"]"}function be(e,n,i,o){var r="",a=e.tag,l,u,c;for(l=0,u=i.length;l<u;l+=1)c=i[l],e.replacer&&(c=e.replacer.call(i,String(l),c)),(L(e,n+1,c,!0,!0,!1,!0)||typeof c>"u"&&L(e,n+1,null,!0,!0,!1,!0))&&((!o||r!=="")&&(r+=J(e,n)),e.dump&&q===e.dump.charCodeAt(0)?r+="-":r+="- ",r+=e.dump);e.tag=a,e.dump=r||"[]"}function mr(e,n,i){var o="",r=e.tag,a=Object.keys(i),l,u,c,t,p;for(l=0,u=a.length;l<u;l+=1)p="",o!==""&&(p+=", "),e.condenseFlow&&(p+='"'),c=a[l],t=i[c],e.replacer&&(t=e.replacer.call(i,c,t)),L(e,n,c,!1,!1)&&(e.dump.length>1024&&(p+="? "),p+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),L(e,n,t,!1,!1)&&(p+=e.dump,o+=p));e.tag=r,e.dump="{"+o+"}"}function hr(e,n,i,o){var r="",a=e.tag,l=Object.keys(i),u,c,t,p,s,d;if(e.sortKeys===!0)l.sort();else if(typeof e.sortKeys=="function")l.sort(e.sortKeys);else if(e.sortKeys)throw new E("sortKeys must be a boolean or a function");for(u=0,c=l.length;u<c;u+=1)d="",(!o||r!=="")&&(d+=J(e,n)),t=l[u],p=i[t],e.replacer&&(p=e.replacer.call(i,t,p)),L(e,n+1,t,!0,!0,!0)&&(s=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,s&&(e.dump&&q===e.dump.charCodeAt(0)?d+="?":d+="? "),d+=e.dump,s&&(d+=J(e,n)),L(e,n+1,p,!0,s)&&(e.dump&&q===e.dump.charCodeAt(0)?d+=":":d+=": ",d+=e.dump,r+=d));e.tag=a,e.dump=r||"{}"}function Ce(e,n,i){var o,r,a,l,u,c;for(r=i?e.explicitTypes:e.implicitTypes,a=0,l=r.length;a<l;a+=1)if(u=r[a],(u.instanceOf||u.predicate)&&(!u.instanceOf||typeof n=="object"&&n instanceof u.instanceOf)&&(!u.predicate||u.predicate(n))){if(i?u.multi&&u.representName?e.tag=u.representName(n):e.tag=u.tag:e.tag="?",u.represent){if(c=e.styleMap[u.tag]||u.defaultStyle,en.call(u.represent)==="[object Function]")o=u.represent(n,c);else if(nn.call(u.represent,c))o=u.represent[c](n,c);else throw new E("!<"+u.tag+'> tag resolver accepts not "'+c+'" style');e.dump=o}return!0}return!1}function L(e,n,i,o,r,a,l){e.tag=null,e.dump=i,Ce(e,i,!1)||Ce(e,i,!0);var u=en.call(e.dump),c=o,t;o&&(o=e.flowLevel<0||e.flowLevel>n);var p=u==="[object Object]"||u==="[object Array]",s,d;if(p&&(s=e.duplicates.indexOf(i),d=s!==-1),(e.tag!==null&&e.tag!=="?"||d||e.indent!==2&&n>0)&&(r=!1),d&&e.usedDuplicates[s])e.dump="*ref_"+s;else{if(p&&d&&!e.usedDuplicates[s]&&(e.usedDuplicates[s]=!0),u==="[object Object]")o&&Object.keys(e.dump).length!==0?(hr(e,n,e.dump,r),d&&(e.dump="&ref_"+s+e.dump)):(mr(e,n,e.dump),d&&(e.dump="&ref_"+s+" "+e.dump));else if(u==="[object Array]")o&&e.dump.length!==0?(e.noArrayIndent&&!l&&n>0?be(e,n-1,e.dump,r):be(e,n,e.dump,r),d&&(e.dump="&ref_"+s+e.dump)):(dr(e,n,e.dump),d&&(e.dump="&ref_"+s+" "+e.dump));else if(u==="[object String]")e.tag!=="?"&&sr(e,e.dump,n,a,c);else{if(u==="[object Undefined]")return!1;if(e.skipInvalid)return!1;throw new E("unacceptable kind of an object to dump "+u)}e.tag!==null&&e.tag!=="?"&&(t=encodeURI(e.tag[0]==="!"?e.tag.slice(1):e.tag).replace(/!/g,"%21"),e.tag[0]==="!"?t="!"+t:t.slice(0,18)==="tag:yaml.org,2002:"?t="!!"+t.slice(18):t="!<"+t+">",e.dump=t+" "+e.dump)}return!0}function gr(e,n){var i=[],o=[],r,a;for(ne(e,i,o),r=0,a=o.length;r<a;r+=1)n.duplicates.push(i[o[r]]);n.usedDuplicates=new Array(a)}function ne(e,n,i){var o,r,a;if(e!==null&&typeof e=="object")if(r=n.indexOf(e),r!==-1)i.indexOf(r)===-1&&i.push(r);else if(n.push(e),Array.isArray(e))for(r=0,a=e.length;r<a;r+=1)ne(e[r],n,i);else for(o=Object.keys(e),r=0,a=o.length;r<a;r+=1)ne(e[o[r]],n,i)}function xr(e,n){n=n||{};var i=new lr(n);i.noRefs||gr(e,i);var o=e;return i.replacer&&(o=i.replacer.call({"":o},"",o)),L(i,0,o,!0,!0)?i.dump+`
`:""}var vr=xr,Ar={dump:vr};function ue(e,n){return function(){throw new Error("Function yaml."+e+" is removed in js-yaml 4. Use yaml."+n+" instead, which is now safe by default.")}}var yr=b,br=Se,Cr=Fe,Er=Pe,_r=Me,Sr=re,wr=Je.load,Lr=Je.loadAll,Tr=Ar.dump,Fr=E,Or={binary:Be,float:Ne,map:Te,null:Oe,pairs:He,set:Ge,timestamp:qe,bool:Ie,int:ke,merge:je,omap:Ye,seq:Le,str:we},Ir=ue("safeLoad","load"),kr=ue("safeLoadAll","loadAll"),Nr=ue("safeDump","dump"),Pr={Type:yr,Schema:br,FAILSAFE_SCHEMA:Cr,JSON_SCHEMA:Er,CORE_SCHEMA:_r,DEFAULT_SCHEMA:Sr,load:wr,loadAll:Lr,dump:Tr,YAMLException:Fr,types:Or,safeLoad:Ir,safeLoadAll:kr,safeDump:Nr};const Mr=Object.assign({"/src/content/posts/balanceo-equipos-elo.md":fn,"/src/content/posts/elegir-llm-function-calling.md":dn,"/src/content/posts/rag-legal-anti-alucinacion.md":mn});let Y=null;function Dr(e){return e instanceof Date?e.toISOString().split("T")[0]:String(e)}const Rr=/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;function qr(e){const n=Rr.exec(e);return n?{data:Pr.load(n[1])||{},content:n[2]}:{data:{},content:e}}function jr(){return Y||(Y=Object.entries(Mr).map(([,e])=>{const{data:n,content:i}=qr(e);return{slug:n.slug,title:n.title,date:Dr(n.date),tags:n.tags||[],summary:n.summary||"",readingTime:n.readingTime||5,cover:n.cover||null,content:i}}).filter(e=>e.slug).sort((e,n)=>new Date(n.date)-new Date(e.date)),Y)}function Br(e){return jr().find(n=>n.slug===e)}export{Br as g,jr as l};
