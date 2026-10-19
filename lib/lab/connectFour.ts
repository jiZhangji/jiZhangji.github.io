export type Player = 1 | 2
export type Board = number[]
export const ROWS = 6
export const COLS = 7
const ORDER = [3, 2, 4, 1, 5, 0, 6]

export function emptyBoard(): Board { return Array(ROWS * COLS).fill(0) }

export function dropDisc(board: Board, column: number, player: Player): Board | null {
  if (!Number.isInteger(column) || column < 0 || column >= COLS || board[column]) return null
  const next = board.slice()
  for (let row = ROWS - 1; row >= 0; row--) {
    const index = row * COLS + column
    if (!next[index]) { next[index] = player; return next }
  }
  return null
}

export function outcome(board: Board): { winner: number; line: number[]; draw: boolean } {
  for (let row = 0; row < ROWS; row++) for (let col = 0; col < COLS; col++) {
    const start = row * COLS + col
    if (!board[start]) continue
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      const endRow = row + dr! * 3, endCol = col + dc! * 3
      if (endRow < 0 || endRow >= ROWS || endCol < 0 || endCol >= COLS) continue
      const line = Array.from({ length: 4 }, (_, i) => (row + dr! * i) * COLS + col + dc! * i)
      if (line.every(i => board[i] === board[start])) return { winner: board[start]!, line, draw: false }
    }
  }
  return { winner: 0, line: [], draw: board.every(Boolean) }
}

function evaluate(board: Board, player: Player): number {
  const rival = player === 1 ? 2 : 1
  let score = 0
  for (let row = 0; row < ROWS; row++) {
    if (board[row * COLS + 3] === player) score += 5
    if (board[row * COLS + 3] === rival) score -= 5
    for (let col = 0; col < COLS; col++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      if (row + dr! * 3 >= ROWS || col + dc! * 3 < 0 || col + dc! * 3 >= COLS) continue
      const cells = Array.from({ length: 4 }, (_, i) => board[(row + dr! * i) * COLS + col + dc! * i])
      const mine = cells.filter(x => x === player).length, theirs = cells.filter(x => x === rival).length
      if (!theirs) score += [0, 1, 12, 90, 10000][mine]!
      if (!mine) score -= [0, 1, 12, 100, 10000][theirs]!
    }
  }
  return score
}

/** Bounded, deterministic minimax with alpha-beta pruning; not a learned model. */
export function chooseMove(board: Board, player: Player, depth = 4) {
  const maxDepth = Math.min(5, Math.max(1, Math.floor(depth) || 1))
  let nodes = 0
  const search = (position: Board, remaining: number, turn: Player, alpha: number, beta: number): number => {
    nodes++
    const result = outcome(position)
    if (result.winner) return result.winner === player ? 100000 + remaining : -100000 - remaining
    if (result.draw) return 0
    if (!remaining) return evaluate(position, player)
    const maximizing = turn === player
    let best = maximizing ? -Infinity : Infinity
    for (const col of ORDER) {
      const child = dropDisc(position, col, turn)
      if (!child) continue
      const value = search(child, remaining - 1, turn === 1 ? 2 : 1, alpha, beta)
      best = maximizing ? Math.max(best, value) : Math.min(best, value)
      if (maximizing) alpha = Math.max(alpha, best)
      else beta = Math.min(beta, best)
      if (beta <= alpha) break
    }
    return best
  }
  if (outcome(board).winner || outcome(board).draw) return { column: -1, score: 0, nodes, depth: maxDepth }
  let column = -1, score = -Infinity
  for (const col of ORDER) {
    const child = dropDisc(board, col, player)
    if (!child) continue
    const value = search(child, maxDepth - 1, player === 1 ? 2 : 1, -Infinity, Infinity)
    if (value > score) { score = value; column = col }
  }
  return { column, score, nodes, depth: maxDepth }
}

/** Reject illegal, oversized, full-column and post-victory replay sequences. */
export function replayMoves(code: string): { board: Board; moves: number[] } | null {
  if (!/^[1-7]{0,42}$/.test(code)) return null
  let board = emptyBoard()
  const moves: number[] = []
  for (const digit of code) {
    const result = outcome(board)
    if (result.winner || result.draw) return null
    const column = Number(digit) - 1
    const next = dropDisc(board, column, moves.length % 2 ? 2 : 1)
    if (!next) return null
    board = next
    moves.push(column)
  }
  return { board, moves }
}
