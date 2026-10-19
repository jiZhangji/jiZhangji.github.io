import { seededRandom } from './neural.ts'
export interface Maze { width: number; height: number; cells: number[]; start: number; goal: number }
export function validSeed(seed: unknown): seed is string { return typeof seed === 'string' && /^[a-zA-Z0-9-]{1,32}$/.test(seed) }
export function makeMaze(seed: string): Maze {
  let hash = 2166136261
  for (const character of seed) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0
  const random = seededRandom(hash), width = 17, height = 13
  const cells = Array(width * height).fill(1), start = width + 1, goal = (height - 2) * width + width - 2
  const stack = [start]; cells[start] = 0
  while (stack.length) {
    const current = stack[stack.length - 1]!, x = current % width, y = Math.floor(current / width)
    const options = [[0, -2], [2, 0], [0, 2], [-2, 0]].filter(([dx, dy]) => {
      const nx = x + dx!, ny = y + dy!
      return nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && cells[ny * width + nx] === 1
    })
    if (!options.length) { stack.pop(); continue }
    const [dx, dy] = options[Math.floor(random() * options.length)]!
    const next = (y + dy!) * width + x + dx!
    cells[(y + dy! / 2) * width + x + dx! / 2] = 0; cells[next] = 0; stack.push(next)
  }
  return { width, height, cells, start, goal }
}
export function neighbors(maze: Maze, current: number): number[] {
  const x = current % maze.width, y = Math.floor(current / maze.width)
  return [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]
    .filter(([nx, ny]) => nx! >= 0 && nx! < maze.width && ny! >= 0 && ny! < maze.height)
    .map(([nx, ny]) => ny! * maze.width + nx!).filter(index => maze.cells[index] === 0)
}
/** A* with a Manhattan heuristic. Returns the path and actual expansion order. */
export function solveMaze(maze: Maze) {
  const distance = new Map<number, number>([[maze.start, 0]]), parent = new Map<number, number>()
  const open = new Set([maze.start]), visited: number[] = []
  const heuristic = (index: number) => Math.abs(index % maze.width - maze.goal % maze.width) + Math.abs(Math.floor(index / maze.width) - Math.floor(maze.goal / maze.width))
  while (open.size) {
    const current = [...open].sort((a, b) => distance.get(a)! + heuristic(a) - distance.get(b)! - heuristic(b) || a - b)[0]!
    open.delete(current); visited.push(current)
    if (current === maze.goal) {
      const path = [current]
      while (parent.has(path[0]!)) path.unshift(parent.get(path[0]!)!)
      return { path, visited }
    }
    for (const next of neighbors(maze, current)) {
      const tentative = distance.get(current)! + 1
      if (tentative >= (distance.get(next) ?? Infinity)) continue
      distance.set(next, tentative); parent.set(next, current); open.add(next)
    }
  }
  return { path: [] as number[], visited }
}
