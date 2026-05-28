---
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

```typescript
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
```

Si no hay porteros suficientes, el sistema asigna jugadores de campo como porteros de facto. El draft posicional reduce el espacio de búsqueda para las fases siguientes.

## Fase 2 — Igualación por ELO (serpentín)

Con los campos restantes, usamos un draft en serpentín ordenado por ELO. El serpentín es el método estándar para drafts en sports analytics porque produce distribuciones más equitativas que el draft lineal.

```typescript
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
```

El serpentín funciona porque el jugador más fuerte va al Equipo 1, el segundo más fuerte va al Equipo 2, el tercero más fuerte va al Equipo 2 (ronda 2 empieza al revés), etc. Esto nivela las diferencias acumuladas.

Después del serpentín, la diferencia de ELO entre equipos suele estar en ±50-100 puntos.

## Fase 3 — Swap-optimización

El serpentín produce buenos resultados pero no necesariamente el óptimo. La fase 3 es una optimización greedy: intercambiar pares de jugadores hasta que no haya ningún swap que mejore el equilibrio.

```typescript
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
```

Esta fase generalmente converge en 1-3 iteraciones. Para 10 jugadores, el espacio de búsqueda es pequeño (25 pares posibles), así que es rápido.

## Resultado

El algoritmo de 3 fases produce diferencias de ELO entre equipos de ±10-30 puntos en la mayoría de los casos, comparado con ±100-200 del aleatorio puro.

Métricas reales con 9 partidos organizados:
- Diferencia media de ELO entre equipos: 18 puntos
- Partidos con resultado ajustado (diferencia ≤ 2 goles): 6 de 9

Los usuarios notan los partidos más equilibrados. La retención mejora.

**Código fuente:** [github.com/gustavintavo8/PachagasApp](https://github.com/gustavintavo8/PachagasApp)
