import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyBoard, dropDisc, outcome, chooseMove, replayMoves } from '../lib/lab/connectFour.ts'
import { createNetwork, makeSamples, predict, trainEpoch, metrics } from '../lib/lab/neural.ts'
import { makeMaze, solveMaze, neighbors, validSeed } from '../lib/lab/maze.ts'

test('Connect Four: gravity, immutability and full-column rejection', () => {
  const initial = emptyBoard()
  let board = dropDisc(initial, 3, 1)
  assert.equal(initial[38], 0); assert.equal(board[38], 1)
  for (let i = 0; i < 5; i++) board = dropDisc(board, 3, i % 2 ? 1 : 2)
  assert.equal(dropDisc(board, 3, 1), null)
  for (const column of [-1, 7, NaN, 1.5]) assert.equal(dropDisc(board, column, 1), null)
})
test('Connect Four: all four win directions, with no row wrapping', () => {
  for (const line of [[35, 36, 37, 38], [0, 7, 14, 21], [0, 8, 16, 24], [6, 12, 18, 24]]) {
    const board = emptyBoard(); line.forEach(index => { board[index] = 1 })
    assert.equal(outcome(board).winner, 1); assert.equal(outcome(board).line.length, 4)
  }
  const board = emptyBoard(); [5, 6, 7, 8].forEach(i => { board[i] = 1 })
  assert.equal(outcome(board).winner, 0)
})
test('Connect Four: AI takes a win, blocks an immediate threat, and leaves input untouched', () => {
  const winning = replayMoves('1212324').board
  assert.equal(chooseMove(winning, 2, 4).column, 1)
  const threat = emptyBoard(); [35, 36, 37].forEach(i => { threat[i] = 1 }); threat[41] = 2; threat[34] = 2
  const original = threat.slice()
  assert.equal(chooseMove(threat, 2, 3).column, 3)
  assert.deepEqual(threat, original)
})
test('Connect Four: replay validation rejects malformed and post-win input', () => {
  for (const code of ['0', '8', 'x', '1111111', '1'.repeat(100), '12121212', '<script>']) assert.equal(replayMoves(code), null, code)
  assert.equal(replayMoves('1212121').moves.length, 7)
  assert.equal(outcome(replayMoves('1212121').board).winner, 1)
  assert.equal(chooseMove(replayMoves('1212121').board, 2).column, -1)
  assert.deepEqual(replayMoves('').board, emptyBoard())
})
test('Connect Four: full drawn board and draw search', () => {
  const board = [1,1,2,2,1,1,2, 2,2,1,1,2,2,1, 1,1,2,2,1,1,2, 2,2,1,1,2,2,1, 1,1,2,2,1,1,2, 2,2,1,1,2,2,1]
  assert.equal(outcome(board).winner, 0); assert.equal(outcome(board).draw, true)
  assert.equal(chooseMove(board, 1).column, -1)
})
for (const kind of ['xor', 'ring']) test(`Neural network: deterministic ${kind} training reduces loss and fits the examples`, () => {
  const network = createNetwork(), samples = makeSamples(kind), before = metrics(network, samples)
  assert.deepEqual(samples, makeSamples(kind))
  for (let epoch = 0; epoch < 1000; epoch++) trainEpoch(network, samples, .8)
  const after = metrics(network, samples)
  assert.ok(after.loss < before.loss * .15, `${before.loss} -> ${after.loss}`)
  assert.ok(after.accuracy >= .95)
  for (const sample of samples) { const value = predict(network, sample.x, sample.y); assert.ok(Number.isFinite(value) && value >= 0 && value <= 1) }
})
test('Neural network: empty data and reset are safe', () => {
  const network = createNetwork(), initial = structuredClone(network)
  trainEpoch(network, []); assert.deepEqual(network, initial)
  assert.deepEqual(metrics(network, []), { loss: 0, accuracy: 0 })
  assert.deepEqual(network, createNetwork())
})
test('Maze: same seed is reproducible, different seed changes the puzzle, input is bounded', () => {
  assert.deepEqual(makeMaze('2026-09-28'), makeMaze('2026-09-28'))
  assert.notDeepEqual(makeMaze('2026-09-28').cells, makeMaze('friend-02').cells)
  for (const value of ['', 'x'.repeat(33), '<script>', 'hello world', [], undefined]) assert.equal(validSeed(value), false)
  assert.equal(validSeed('friend-02'), true)
})
test('Maze: A* produces valid shortest paths across 40 seeds (independent BFS check)', () => {
  for (let seed = 0; seed < 40; seed++) {
    const maze = makeMaze(`test-${seed}`), result = solveMaze(maze)
    assert.equal(result.path[0], maze.start); assert.equal(result.path.at(-1), maze.goal)
    result.path.slice(1).forEach((index, i) => assert.ok(neighbors(maze, result.path[i]).includes(index)))
    const queue = [maze.start], distances = new Map([[maze.start, 0]])
    for (let i = 0; i < queue.length; i++) for (const next of neighbors(maze, queue[i])) if (!distances.has(next)) { distances.set(next, distances.get(queue[i]) + 1); queue.push(next) }
    assert.equal(result.path.length - 1, distances.get(maze.goal))
    assert.equal(new Set(result.visited).size, result.visited.length)
  }
})
