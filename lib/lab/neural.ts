export interface Sample { x: number; y: number; label: 0 | 1 }
export interface Network { hidden: number[][]; bias: number[]; output: number[]; outputBias: number }
export function seededRandom(seed = 17) {
  let state = seed >>> 0
  return () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296 }
}
export function createNetwork(): Network {
  const random = seededRandom(73)
  return {
    hidden: Array.from({ length: 8 }, () => [random() * 3 - 1.5, random() * 3 - 1.5]),
    bias: Array.from({ length: 8 }, () => random() - .5),
    output: Array.from({ length: 8 }, () => random() * 2 - 1), outputBias: 0,
  }
}
const sigmoid = (x: number) => 1 / (1 + Math.exp(-Math.max(-40, Math.min(40, x))))
export function predict(network: Network, x: number, y: number): number {
  let sum = network.outputBias
  for (let i = 0; i < 8; i++) sum += Math.tanh(network.hidden[i]![0]! * x + network.hidden[i]![1]! * y + network.bias[i]!) * network.output[i]!
  return sigmoid(sum)
}
/** Full-batch gradient descent, tanh hidden layer, sigmoid + binary cross entropy. */
export function trainEpoch(network: Network, samples: Sample[], rate = .8): void {
  if (!samples.length) return
  const dw = Array.from({ length: 8 }, () => [0, 0]), db = Array(8).fill(0), dv = Array(8).fill(0)
  let dc = 0
  for (const sample of samples) {
    const hidden = network.hidden.map((w, i) => Math.tanh(w[0]! * sample.x + w[1]! * sample.y + network.bias[i]!))
    const probability = sigmoid(hidden.reduce((sum, value, i) => sum + value * network.output[i]!, network.outputBias))
    const error = probability - sample.label
    dc += error
    for (let i = 0; i < 8; i++) {
      dv[i] += error * hidden[i]!
      const delta = error * network.output[i]! * (1 - hidden[i]! ** 2)
      dw[i]![0]! += delta * sample.x; dw[i]![1]! += delta * sample.y; db[i] += delta
    }
  }
  const step = Math.min(1.5, Math.max(.01, rate)) / samples.length
  network.outputBias -= step * dc
  for (let i = 0; i < 8; i++) {
    network.hidden[i]![0]! -= step * dw[i]![0]!; network.hidden[i]![1]! -= step * dw[i]![1]!
    network.bias[i]! -= step * db[i]; network.output[i]! -= step * dv[i]
  }
}
export function metrics(network: Network, samples: Sample[]) {
  if (!samples.length) return { loss: 0, accuracy: 0 }
  let loss = 0, correct = 0
  for (const sample of samples) {
    const p = Math.max(1e-8, Math.min(1 - 1e-8, predict(network, sample.x, sample.y)))
    loss -= sample.label * Math.log(p) + (1 - sample.label) * Math.log(1 - p)
    if ((p >= .5 ? 1 : 0) === sample.label) correct++
  }
  return { loss: loss / samples.length, accuracy: correct / samples.length }
}
export function makeSamples(kind: 'xor' | 'ring'): Sample[] {
  const random = seededRandom(kind === 'xor' ? 17 : 31)
  return Array.from({ length: 48 }, (_, index) => {
    if (kind === 'xor') {
      const sx = index % 4 < 2 ? -1 : 1, sy = index % 2 ? -1 : 1
      return { x: sx * (.35 + random() * .5), y: sy * (.35 + random() * .5), label: sx === sy ? 1 : 0 }
    }
    const label = (index % 2) as 0 | 1, angle = random() * Math.PI * 2
    const radius = label ? .65 + random() * .25 : .08 + random() * .25
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, label }
  })
}
