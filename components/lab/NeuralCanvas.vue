<template>
  <div class="lab-workbench">
    <div class="lab-stage neural-stage">
      <div class="lab-stage-top"><span><i class="lab-dot" />DECISION BOUNDARY</span><span>2 → 8 → 1</span></div>
      <div class="neural-legend"><span><b class="sample-a">● A</b> {{ isEn ? 'Class A' : 'A 类样本' }}</span><span><b class="sample-b">◆ B</b> {{ isEn ? 'Class B' : 'B 类样本' }}</span></div>
      <svg ref="plot" class="neural-plot" viewBox="0 0 400 320" role="img" :aria-label="isEn ? 'Classifier map. Use the coordinate inputs to add samples with a keyboard.' : '分类平面。键盘用户可用右侧坐标输入添加样本。'" @pointerdown="startPointer" @pointerup="addFromPointer" @pointercancel="pointerStart = null" @pointerleave="pointerStart = null">
        <rect width="400" height="320" fill="var(--surface)" />
        <rect v-for="(cell, index) in heatmap" :key="index" :x="cell.x" :y="cell.y" width="12.6" height="13.45" :fill="cell.color" />
        <g stroke="var(--ink)" stroke-opacity=".14" stroke-dasharray="3 5"><path d="M200 0v320M0 160h400" /></g>
        <g v-for="(sample, index) in samples" :key="`point-${index}`" :transform="`translate(${(sample.x + 1) * 200},${(1 - sample.y) * 160})`" stroke="var(--surface)" stroke-width="1.8"><circle v-if="sample.label === 0" r="5" fill="var(--lab-green)" /><path v-else d="M0-6 6 0 0 6-6 0Z" fill="var(--lab-clay)" /></g>
        <g fill="var(--ink)" font-size="10" font-family="monospace"><text x="8" y="15">y</text><text x="385" y="151">x</text></g>
      </svg>
      <p class="lab-help mt-3">{{ isEn ? 'Click the plane to add a sample. Color shows the model output, not a calibrated confidence score.' : '点击平面即可加样本。背景颜色表示模型输出，不是经过校准的置信度。' }}</p>
      <div class="neural-metrics"><div><span>{{ isEn ? 'EPOCHS' : '训练轮次' }}</span><strong>{{ epochs }}</strong></div><div><span>{{ isEn ? 'TRAIN ACC.' : '训练集拟合率' }}</span><strong>{{ Math.round(report.accuracy * 100) }}<small>%</small></strong></div><div><span>LOSS</span><strong>{{ report.loss.toFixed(3) }}</strong></div></div>
      <svg v-if="losses.length > 1" class="loss-chart" viewBox="0 0 400 48" role="img" :aria-label="isEn ? 'Training loss history' : '训练损失变化'"><path d="M0 47h400" stroke="var(--line)" /><polyline :points="lossLine" fill="none" stroke="var(--accent)" stroke-width="2" /></svg>
    </div>
    <div class="lab-console">
      <p class="eyebrow">TEACH A TINY NEURAL NETWORK</p><h3>{{ isEn ? 'You provide the examples.' : '这次，换你来教 AI。' }}</h3>
      <p class="lab-help">{{ isEn ? 'A real, small neural network learns the boundary between two classes. Start training, add a few samples, and watch how its decisions change.' : '一个真正的小型神经网络，学习区分两类样本。开始训练，再加入几个你自己的点，看看决策边界如何改变。' }}</p>
      <div class="lab-form-row"><label>{{ isEn ? 'Dataset' : '样本布局' }}<select v-model="dataset" class="field" :aria-label="isEn ? 'Dataset' : '样本布局'"><option value="xor">{{ isEn ? 'XOR · four islands' : '异或 · 四座岛屿' }}</option><option value="ring">{{ isEn ? 'Inner / outer ring' : '内外圆环' }}</option></select></label><label>{{ isEn ? 'Learning rate' : '学习率' }}<select v-model.number="rate" class="field" :aria-label="isEn ? 'Learning rate' : '学习率'"><option :value=".2">0.2</option><option :value=".8">0.8</option><option :value="1.2">1.2</option></select></label></div>
      <div class="lab-actions"><button type="button" class="btn-primary" @click="toggleTraining"><SiteIcon :name="running ? 'pause' : 'play'" class="h-4 w-4" />{{ running ? (isEn ? 'Pause' : '暂停训练') : epochs >= LIMIT ? (isEn ? 'Train again' : '重新训练') : (isEn ? 'Train the network' : '开始训练') }}</button><button type="button" class="btn-ghost" @click="resetModel">{{ isEn ? 'Reset weights' : '重置模型' }}</button></div>
      <p class="lab-help" role="status">{{ running ? (isEn ? 'Learning locally…' : '正在本地学习…') : epochs >= LIMIT ? (isEn ? 'Training complete. Try changing the data.' : '本轮训练完成，试着改变样本。') : (isEn ? 'Paused. Your data stays in this page.' : '已暂停，样本只保留在当前页面。') }}</p>
      <div class="lab-insight"><p class="eyebrow">ADD YOUR OWN DATA</p><div class="lab-segment" :aria-label="isEn ? 'Sample class' : '样本类别'"><button type="button" :aria-pressed="selected === 0" @click="selected = 0"><span class="sample-a">●</span> {{ isEn ? 'Class A' : 'A 类' }}</button><button type="button" :aria-pressed="selected === 1" @click="selected = 1"><span class="sample-b">◆</span> {{ isEn ? 'Class B' : 'B 类' }}</button></div><div class="lab-coordinate-inputs"><label>X <input v-model.number="coordinateX" type="number" min="-1" max="1" step="0.1" class="field" aria-label="Sample X"></label><label>Y <input v-model.number="coordinateY" type="number" min="-1" max="1" step="0.1" class="field" aria-label="Sample Y"></label><button type="button" class="btn-ghost" :disabled="samples.length >= 100" @click="addSample(coordinateX, coordinateY)">{{ isEn ? 'Add' : '添加' }}</button></div><p class="lab-help mt-2">{{ samples.length }} / 100 {{ isEn ? 'samples · adding pauses training' : '个样本 · 添加时暂停训练' }}</p><button type="button" class="text-link mt-3 text-xs" @click="resetData">{{ isEn ? 'Restore the example dataset' : '恢复示例样本' }}</button><p v-if="sampleMessage" class="lab-help mt-2" role="status">{{ sampleMessage }}</p></div>
      <p class="lab-help lab-disclosure">{{ isEn ? 'Algorithm: backpropagation + batch gradient descent, 8 tanh hidden units. The percentage is training-set fit, not test accuracy or a research result. No API, uploads, or model downloads.' : '算法：反向传播 + 批量梯度下降，8 个 tanh 隐藏单元。百分比只是训练集拟合程度，不代表测试性能或科研成果。无 API 调用、无上传、无模型下载。' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { createNetwork, makeSamples, metrics, predict, trainEpoch, type Sample } from '~/lib/lab/neural'
const { locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
const dataset = ref<'xor' | 'ring'>('xor'), rate = ref(.8), selected = ref<0 | 1>(0)
const samples = ref<Sample[]>(makeSamples('xor')), network = shallowRef(createNetwork()), revision = ref(0)
const epochs = ref(0), running = ref(false), losses = ref<number[]>([]), sampleMessage = ref('')
const coordinateX = ref(0), coordinateY = ref(0), plot = ref<SVGSVGElement | null>(null)
const LIMIT = 1500
let timer: ReturnType<typeof setInterval> | undefined
let pointerStart: { id: number; x: number; y: number } | null = null
const report = computed(() => { void revision.value; return metrics(network.value, samples.value) })
const heatmap = computed(() => {
  void revision.value
  return Array.from({ length: 32 * 24 }, (_, index) => {
    const col = index % 32, row = Math.floor(index / 32)
    const p = predict(network.value, (col + .5) / 16 - 1, 1 - (row + .5) / 12)
    return { x: col * 12.5, y: row * (320 / 24), color: `rgba(${p < .5 ? '39,112,83' : '190,102,64'},${.12 + Math.abs(p - .5) * 1.18})` }
  })
})
const lossLine = computed(() => {
  const max = Math.max(.1, ...losses.value)
  return losses.value.map((loss: number, index: number) => `${index / Math.max(1, losses.value.length - 1) * 400},${46 - loss / max * 42}`).join(' ')
})
function stop() { if (timer) clearInterval(timer); timer = undefined; running.value = false }
function resetModel() { stop(); network.value = createNetwork(); epochs.value = 0; losses.value = [metrics(network.value, samples.value).loss]; revision.value++ }
function resetData() { samples.value = makeSamples(dataset.value); sampleMessage.value = ''; resetModel() }
watch(dataset, resetData)
function toggleTraining() {
  if (running.value) { stop(); return }
  if (epochs.value >= LIMIT) resetModel()
  if (!losses.value.length) losses.value = [report.value.loss]
  running.value = true
  timer = setInterval(() => {
    for (let i = 0; i < 20 && epochs.value < LIMIT; i++) { trainEpoch(network.value, samples.value, rate.value); epochs.value++ }
    revision.value++; losses.value.push(report.value.loss)
    if (epochs.value >= LIMIT) stop()
  }, 60)
}
function addSample(x: number, y: number) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < -1 || x > 1 || y < -1 || y > 1) { sampleMessage.value = isEn.value ? 'Coordinates must be between −1 and 1.' : '坐标需要是 −1 到 1 之间的数字。'; return }
  if (samples.value.length >= 100) { sampleMessage.value = isEn.value ? '100-sample limit reached. Restore the examples to start again.' : '已达到 100 个样本上限，可恢复示例后重试。'; return }
  stop(); samples.value.push({ x, y, label: selected.value }); losses.value = []; epochs.value = 0; revision.value++
  sampleMessage.value = isEn.value ? 'Sample added. Resume training to adapt the boundary.' : '已添加样本，继续训练即可调整边界。'
}
function startPointer(event: PointerEvent) {
  pointerStart = event.isPrimary && event.button === 0 ? { id: event.pointerId, x: event.clientX, y: event.clientY } : null
}
function addFromPointer(event: PointerEvent) {
  const start = pointerStart
  pointerStart = null
  // A tap adds data; swiping the chart should remain normal page scrolling.
  if (!start || start.id !== event.pointerId || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8 || !plot.value) return
  const rect = plot.value.getBoundingClientRect()
  addSample(Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)), Math.max(-1, Math.min(1, 1 - (event.clientY - rect.top) / rect.height * 2)))
}
onBeforeUnmount(stop)
</script>
