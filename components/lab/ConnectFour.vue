<template>
  <div class="lab-workbench">
    <div class="lab-stage c4-stage">
      <div class="lab-stage-top"><span><i class="lab-dot" />{{ isEn ? 'CONNECT FOUR' : '四子棋' }}</span><span>{{ moves.length.toString().padStart(2, '0') }} / 42</span></div>
      <div class="c4-player-row"><span><b class="c4-legend player-one">×</b>{{ isEn ? 'Player 1 / You' : '一号 / 你' }}</span><span><b class="c4-legend player-two">○</b>{{ mode === 'ai' ? 'AI' : (isEn ? 'Player 2' : '二号') }}</span></div>
      <div class="c4-controls" :aria-label="isEn ? 'Choose a column' : '选择落子列'">
        <button v-for="col in 7" :key="col" type="button" :disabled="busy || !!result.winner || result.draw || !!board[col - 1] || (mode === 'ai' && turn === 2)" :aria-label="isEn ? `Drop in column ${col}` : `在第 ${col} 列落子`" @click="play(col - 1)">{{ col }}<span aria-hidden="true">↓</span></button>
      </div>
      <div class="c4-board" role="img" :aria-label="boardDescription">
        <span v-for="(cell, index) in board" :key="index" class="c4-cell" :class="{ 'player-one': cell === 1, 'player-two': cell === 2, 'c4-winning': result.line.includes(index) }"><span v-if="cell">{{ cell === 1 ? '×' : '○' }}</span></span>
      </div>
      <p class="lab-status" role="status" aria-live="polite"><span class="status-dot" :class="{ 'lab-thinking': busy }" />{{ status }}</p>
    </div>
    <div class="lab-console">
      <p class="eyebrow">PLAY / THINK / PASS IT ON</p>
      <h3>{{ isEn ? 'An opponent that looks ahead.' : '它会比你，多想几步。' }}</h3>
      <p class="lab-help">{{ isEn ? 'Connect four horizontally, vertically, or diagonally. Click a column to drop a disc. Play against the algorithm or take turns on the same device.' : '横、竖或斜向连成四子即获胜。点击棋盘上方列号落子；可以挑战算法，也可以和朋友在同一台设备轮流下棋。' }}</p>
      <div class="lab-form-row">
        <label>{{ isEn ? 'Opponent' : '对战方式' }}<select v-model="mode" class="field" :aria-label="isEn ? 'Opponent' : '对战方式'"><option value="ai">{{ isEn ? 'Play the AI' : '挑战 AI' }}</option><option value="duo">{{ isEn ? 'Two players · same device' : '双人同屏' }}</option></select></label>
        <label v-if="mode === 'ai'">{{ isEn ? 'Search depth' : '思考深度' }}<select v-model.number="depth" class="field" :disabled="busy" :aria-label="isEn ? 'Search depth' : '思考深度'"><option :value="2">{{ isEn ? 'Casual · 2 plies' : '轻松 · 2 层' }}</option><option :value="4">{{ isEn ? 'Tactical · 4 plies' : '策略 · 4 层' }}</option><option :value="5">{{ isEn ? 'Deep · 5 plies' : '深入 · 5 层' }}</option></select></label>
      </div>
      <p class="lab-help">{{ isEn ? 'Changing opponent starts a new game.' : '切换对战方式会开始新的一局。' }}</p>
      <div class="lab-actions"><button type="button" class="btn-primary" @click="reset">{{ isEn ? 'New game' : '重新开局' }}</button><button type="button" class="btn-ghost" :disabled="!moves.length" @click="undo">{{ isEn ? 'Undo turn' : '悔一步' }}</button></div>
      <div class="lab-insight"><p class="eyebrow">UNDER THE HOOD</p><p>{{ isEn ? 'Minimax + alpha–beta pruning. The AI searches possible moves in a background worker; it is not a large language model or an unbeatable opponent.' : 'Minimax 博弈搜索 + Alpha–Beta 剪枝。AI 在后台线程中推演局面，不是大语言模型，也不保证永远不输。' }}</p><p v-if="lastSearch" class="lab-mono">{{ isEn ? 'Last search' : '上次搜索' }} · {{ lastSearch.nodes.toLocaleString() }} {{ isEn ? 'nodes' : '个节点' }} / {{ lastSearch.depth }} {{ isEn ? 'plies' : '层' }}</p></div>
      <p v-if="notice" class="lab-help" role="status">{{ notice }}</p>
      <details class="lab-details"><summary>{{ isEn ? 'Pass a position to a friend' : '把这一局传给朋友' }}</summary><p class="lab-help my-3">{{ isEn ? 'Share a snapshot, then let your friend make the next move. This is asynchronous turn-taking, not a live room. Importing replaces this board and switches to two-player mode.' : '发送当前棋局快照，让朋友接着走下一步。这是异步传棋，不是实时房间。导入会替换当前棋局并切换为双人模式。' }}</p><label class="lab-label">{{ isEn ? 'Current position code' : '当前棋局码' }}<input :value="`C4:${code}`" readonly class="field font-mono" @focus="selectCode"></label><label class="lab-label mt-3">{{ isEn ? 'Paste a position code' : '粘贴收到的棋局码' }}<input v-model="incoming" maxlength="45" placeholder="C4:4433" class="field font-mono" :aria-label="isEn ? 'Position code to import' : '待导入棋局码'"></label><button type="button" class="btn-ghost mt-3" @click="importCode(incoming)">{{ isEn ? 'Import position' : '导入棋局' }}</button><p v-if="importMessage" class="lab-help mt-2" role="status">{{ importMessage }}</p><LabShare :params="{ board: code }" anchor="connect-four" class="mt-4" /></details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { emptyBoard, dropDisc, outcome, replayMoves, chooseMove, type Board, type Player } from '~/lib/lab/connectFour'
const { locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
const route = useRoute()
const moves = ref<number[]>([]), board = ref<Board>(emptyBoard()), mode = ref<'ai' | 'duo'>('ai'), depth = ref(4)
const busy = ref(false), notice = ref(''), incoming = ref(''), importMessage = ref('')
const lastSearch = ref<ReturnType<typeof chooseMove> | null>(null)
let worker: Worker | null = null, generation = 0
const code = computed(() => moves.value.map((col: number) => col + 1).join(''))
const turn = computed<Player>(() => moves.value.length % 2 ? 2 : 1)
const result = computed(() => outcome(board.value))
const status = computed(() => {
  if (result.value.winner) return isEn.value ? `${result.value.winner === 2 && mode.value === 'ai' ? 'AI' : `Player ${result.value.winner}`} wins. Play again?` : `${result.value.winner === 2 && mode.value === 'ai' ? 'AI' : `${result.value.winner} 号玩家`}获胜，再来一局？`
  if (result.value.draw) return isEn.value ? 'A draw. The board is full.' : '棋盘已满，本局平局。'
  if (busy.value) return isEn.value ? 'AI is exploring possible moves…' : 'AI 正在推演可能的落子…'
  return isEn.value ? `Player ${turn.value}, choose a column.` : `轮到 ${turn.value} 号玩家，请选择一列。`
})
const boardDescription = computed(() => `${isEn.value ? 'Board, top to bottom. 0 is empty.' : '棋盘从上到下，0 为空格。'} ${Array.from({ length: 6 }, (_, row) => board.value.slice(row * 7, row * 7 + 7).join(' ')).join('; ')}`)
function cancel() { generation++; worker?.terminate(); worker = null; busy.value = false }
function reset() { cancel(); board.value = emptyBoard(); moves.value = []; lastSearch.value = null; notice.value = ''; importMessage.value = '' }
watch(mode, reset, { flush: 'sync' })
function commit(column: number) {
  const next = dropDisc(board.value, column, turn.value)
  if (!next) return false
  board.value = next; moves.value.push(column); return true
}
function play(column: number) {
  if (busy.value || result.value.winner || result.value.draw || (mode.value === 'ai' && turn.value === 2)) return
  if (commit(column) && mode.value === 'ai' && !result.value.winner && !result.value.draw) think()
}
function think() {
  cancel(); busy.value = true
  const ticket = generation
  const accept = (choice: ReturnType<typeof chooseMove>) => {
    if (ticket !== generation) return
    worker?.terminate(); worker = null; busy.value = false; lastSearch.value = choice
    if (choice.column >= 0) commit(choice.column)
  }
  const fallback = () => {
    if (ticket !== generation) return
    notice.value = isEn.value ? 'Background workers are unavailable; using a lightweight 2-ply fallback.' : '当前环境不支持后台线程，已改用轻量的 2 层搜索。'
    accept(chooseMove(board.value.slice(), 2, 2))
  }
  try {
    worker = new Worker(new URL('../../workers/connect-four.ts', import.meta.url), { type: 'module' })
    worker.onmessage = event => accept(event.data)
    worker.onerror = fallback
    worker.postMessage({ board: board.value.slice(), player: 2, depth: depth.value })
  } catch { fallback() }
}
function undo() {
  const remove = mode.value === 'ai' && moves.value.length % 2 === 0 ? 2 : 1
  const restored = replayMoves(code.value.slice(0, Math.max(0, moves.value.length - remove)))!
  cancel(); board.value = restored.board; moves.value = restored.moves; lastSearch.value = null
}
function importCode(value: string) {
  const match = /^C4:([1-7]{0,42})$/i.exec(value.trim()), restored = match ? replayMoves(match[1]!) : null
  if (!restored) { importMessage.value = isEn.value ? 'Invalid position. Check the code; the current board was kept.' : '棋局码不合法，请检查；当前棋局未被替换。'; return }
  mode.value = 'duo'; cancel(); board.value = restored.board; moves.value = restored.moves; lastSearch.value = null
  importMessage.value = isEn.value ? 'Position imported. Take turns from here.' : '已导入棋局，可以继续轮流落子。'
}
function selectCode(event: FocusEvent) { (event.target as HTMLInputElement).select() }
onMounted(() => { if (typeof route.query.board === 'string') { incoming.value = `C4:${route.query.board}`; importCode(incoming.value) } })
onBeforeUnmount(cancel)
</script>
