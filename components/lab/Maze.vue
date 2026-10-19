<template>
  <div class="lab-workbench">
    <div class="lab-stage maze-stage">
      <div class="lab-stage-top"><span><i class="lab-dot" />PATHFINDING CHALLENGE</span><span>17 × 13</span></div>
      <div ref="arena" class="maze-arena" tabindex="0" role="group" :aria-label="isEn ? 'Maze. Use arrow keys or WASD to move. Tab exits the maze.' : '迷宫。使用方向键或 WASD 移动，Tab 键离开迷宫。'" @keydown="onKey">
        <svg viewBox="0 0 340 260" role="img" :aria-label="isEn ? 'Maze: circle is you, flag is the goal' : '迷宫：圆点是你，旗帜是终点'">
          <rect width="340" height="260" rx="4" fill="var(--surface)" />
          <rect v-for="(wall, index) in maze.cells" :key="index" :x="index % maze.width * 20" :y="Math.floor(index / maze.width) * 20" width="20.2" height="20.2" :fill="wall ? 'var(--maze-wall)' : explored.has(index) ? 'var(--maze-explored)' : 'var(--surface)'" />
          <polyline v-if="trail.length > 1" :points="points(trail)" fill="none" stroke="var(--lab-clay)" stroke-width="3" opacity=".7" stroke-linejoin="round" />
          <polyline v-if="showPath" :points="points(solution.path)" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <g :transform="`translate(${maze.goal % maze.width * 20 + 5},${Math.floor(maze.goal / maze.width) * 20 + 3})`" fill="var(--lab-clay)"><path d="M1 0h9v7H1zM0 0h2v14H0z" /></g>
          <circle :cx="position % maze.width * 20 + 10" :cy="Math.floor(position / maze.width) * 20 + 10" r="6" fill="var(--lab-clay)" stroke="var(--surface)" stroke-width="2" />
        </svg>
      </div>
      <div class="maze-bottom"><span class="lab-help">{{ isEn ? 'Arrow keys / WASD · or use the controls' : '方向键 / WASD，也可点击方向按钮' }}</span><div class="maze-dpad"><button type="button" :aria-label="isEn ? 'Move up' : '向上移动'" @click="move(0, -1)">↑</button><button type="button" :aria-label="isEn ? 'Move left' : '向左移动'" @click="move(-1, 0)">←</button><button type="button" :aria-label="isEn ? 'Move down' : '向下移动'" @click="move(0, 1)">↓</button><button type="button" :aria-label="isEn ? 'Move right' : '向右移动'" @click="move(1, 0)">→</button></div></div>
      <p class="lab-status" role="status">{{ won ? (isEn ? `Goal reached in ${steps} moves${assisted ? ' · assisted' : ''}.` : `抵达终点！共走了 ${steps} 步${assisted ? '（已看提示）' : ''}。`) : moveMessage || (isEn ? 'Find your way to the flag.' : '试着找到通往旗帜的路。') }}</p>
    </div>
    <div class="lab-console">
      <p class="eyebrow">YOU & AN ALGORITHM</p><h3>{{ isEn ? 'Two minds. One maze.' : '同一座迷宫，两种思路。' }}</h3>
      <p class="lab-help">{{ isEn ? 'Try it yourself, then watch A* explore. Share the same seed with a friend to compare routes. Same seed, same maze — no account needed.' : '先自己走一遍，再看 A* 如何探索。把同一个挑战种子发给朋友，比较你们的路线；相同种子生成相同迷宫，不需要注册。' }}</p>
      <div class="lab-metric-pair"><div><span>{{ isEn ? 'YOUR MOVES' : '你的步数' }}</span><strong>{{ steps }}</strong></div><div><span>{{ isEn ? 'SHORTEST PATH' : '最短路径' }}</span><strong>{{ showPath || won ? solution.path.length - 1 : '—' }}</strong></div></div>
      <div class="lab-actions"><button type="button" class="btn-primary" :disabled="solving || showPath" @click="demonstrate"><SiteIcon name="route" class="h-4 w-4" />{{ solving ? (isEn ? 'Exploring…' : '正在探索…') : (isEn ? 'Watch A* solve it' : '看 A* 如何解题') }}</button><button type="button" class="btn-ghost" @click="restart">{{ isEn ? 'Start over' : '重走一遍' }}</button></div>
      <p class="lab-help" role="status">{{ isEn ? `Expanded ${explored.size} cells. Viewing a solution marks this run as assisted.` : `已探索 ${explored.size} 个格子。查看解答后，本局会标记为已看提示。` }}</p>
      <div class="lab-insight"><p class="eyebrow">A* SEARCH</p><p class="maze-formula">f(n) = g(n) + h(n)</p><p>{{ isEn ? 'Actual distance so far + estimated distance to the goal. A* prioritizes promising cells, using a Manhattan-distance heuristic on this grid.' : '已走距离 + 到终点的估计距离。A* 使用曼哈顿距离启发式，优先探索更有希望到达终点的格子。' }}</p></div>
      <label class="lab-label">{{ isEn ? 'Challenge seed' : '挑战种子' }}<input v-model="seedInput" maxlength="32" class="field font-mono" :aria-label="isEn ? 'Challenge seed' : '挑战种子'" @keydown.enter="applySeed"></label>
      <div class="lab-actions"><button type="button" class="btn-ghost" @click="applySeed">{{ isEn ? 'Load challenge' : '载入挑战' }}</button><button type="button" class="text-link text-xs" @click="daily">{{ isEn ? 'Today’s maze (UTC)' : '今日迷宫（UTC）' }}</button></div>
      <p v-if="seedMessage" class="lab-help" role="status">{{ seedMessage }}</p>
      <LabShare :params="{ maze: seed }" anchor="pathfinder" />
      <p class="lab-help lab-disclosure">{{ isEn ? 'This is a shared puzzle, not live multiplayer or an online leaderboard. Scores are not uploaded or verified.' : '这是共享题目挑战，不是实时多人房间或在线排行榜。步数不会上传，也不作为经过验证的成绩。' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { makeMaze, solveMaze, validSeed } from '~/lib/lab/maze'
const { locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
const route = useRoute()
const seed = ref('field-notes'), seedInput = ref('field-notes'), seedMessage = ref('')
const maze = shallowRef(makeMaze(seed.value)), solution = computed(() => solveMaze(maze.value))
const position = ref(maze.value.start), trail = ref([maze.value.start]), steps = ref(0)
const explored = ref(new Set<number>()), showPath = ref(false), solving = ref(false), assisted = ref(false), moveMessage = ref('')
const arena = ref<HTMLDivElement | null>(null), won = computed(() => position.value === maze.value.goal)
let timer: ReturnType<typeof setInterval> | undefined
function stop() { if (timer) clearInterval(timer); timer = undefined; solving.value = false }
function restart() { stop(); position.value = maze.value.start; trail.value = [position.value]; steps.value = 0; explored.value = new Set(); showPath.value = false; assisted.value = false; moveMessage.value = '' }
function applySeed() {
  const value = seedInput.value.trim()
  if (!validSeed(value)) { seedMessage.value = isEn.value ? 'Use 1–32 letters, numbers, or hyphens.' : '请使用 1–32 位字母、数字或连字符。'; return }
  seed.value = value; maze.value = makeMaze(value); restart(); seedMessage.value = ''
}
function daily() { seedInput.value = new Date().toISOString().slice(0, 10); applySeed() }
function points(indices: number[]) { return indices.map(index => `${index % maze.value.width * 20 + 10},${Math.floor(index / maze.value.width) * 20 + 10}`).join(' ') }
function move(dx: number, dy: number) {
  if (won.value) return
  const x = position.value % maze.value.width + dx, y = Math.floor(position.value / maze.value.width) + dy
  const next = y * maze.value.width + x
  if (x < 0 || x >= maze.value.width || y < 0 || y >= maze.value.height || maze.value.cells[next]) { moveMessage.value = isEn.value ? 'A wall. Try another direction.' : '前面是墙，试试其他方向。'; return }
  position.value = next; steps.value++; trail.value.push(next)
  // Keep the drawing bounded during long back-and-forth sessions.
  if (trail.value.length > 600) trail.value.shift()
  moveMessage.value = isEn.value ? `Row ${y}, column ${x}. ${steps.value} moves.` : `第 ${y} 行，第 ${x} 列，已走 ${steps.value} 步。`
}
function onKey(event: KeyboardEvent) {
  const direction: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }
  const delta = direction[event.key] || direction[event.key.toLowerCase()]
  if (delta && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); move(...delta) }
}
function demonstrate() {
  if (solving.value || showPath.value) return
  assisted.value = true; solving.value = true
  let index = 0
  const order = solution.value.visited
  timer = setInterval(() => {
    explored.value = new Set(order.slice(0, index += 3))
    if (index >= order.length) { showPath.value = true; stop() }
  }, 40)
}
onMounted(() => {
  if (route.query.maze !== undefined) {
    if (validSeed(route.query.maze)) { seedInput.value = route.query.maze; applySeed() }
    else { daily(); seedMessage.value = isEn.value ? 'Invalid shared seed; loaded today’s maze instead.' : '分享种子不合法，已改为今日迷宫。' }
  } else daily()
})
onBeforeUnmount(stop)
</script>
