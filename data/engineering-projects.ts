import type { Project } from './project-types'

export const engineeringProjects: Project[] = [{
  slug: 'interactive-lab',
  title: { zh: '互动算法实验室', en: 'Interactive Algorithm Lab' },
  description: { zh: '把搜索、学习与路径规划做成可操作的浏览器实验：AI 四子棋、微型神经网络和可分享的 A* 迷宫。', en: 'Hands-on browser experiments in search, learning, and planning: AI Connect Four, a tiny neural network, and shareable A* mazes.' },
  category: 'engineering', year: 2026, featured: true, status: 'implemented', sourceAvailability: 'local',
  cover: '/images/projects/interactive-lab.svg', tags: ['TypeScript', 'Vue', 'Web Workers', 'Minimax', 'A*'], demo: '/lab',
  details: {
    problem: { zh: '算法的输入、决策和结果往往藏在代码里。这个实验室把关键过程变成可以操作、观察和复位的交互，让读者通过改变输入来理解算法。', en: 'Algorithm inputs, decisions, and outcomes are often hidden in code. This lab makes them interactive, observable, and resettable so readers can learn by changing the input.' },
    contributions: [
      { zh: '四子棋使用 Minimax 与 Alpha–Beta 剪枝，在后台 Worker 中搜索，并支持悔棋与同屏双人。', en: 'Connect Four uses Minimax and alpha–beta pruning in a background Worker, with undo and local two-player modes.' },
      { zh: '神经网络画布包含真实的 2→8→1 网络与反向传播，可观察训练损失和决策边界。', en: 'The neural canvas implements a real 2→8→1 network with backpropagation, displaying training loss and decision boundaries.' },
      { zh: '确定性迷宫由种子生成，支持手动探索、A* 路径和同题分享。', en: 'Seeded deterministic mazes support manual exploration, A* paths, and sharing the same challenge.' },
    ],
    contributionNote: { zh: '这些是现有站点中的实际模块；生成式辅助开发与算法原理不等于个人发明算法。', en: 'These are actual modules in the site. AI-assisted development and algorithm implementations are not claims of inventing those algorithms.' },
    architecture: [
      { title: { zh: '用户输入', en: 'Input' }, description: { zh: '棋步、训练点或迷宫种子', en: 'Moves, training points, or a maze seed' } },
      { title: { zh: '纯算法模块', en: 'Algorithm' }, description: { zh: '搜索、反向传播与路径规划', en: 'Search, backpropagation, and pathfinding' } },
      { title: { zh: '交互状态', en: 'State' }, description: { zh: 'Worker 通信与 Vue 状态', en: 'Worker messages and Vue state' } },
      { title: { zh: '可见反馈', en: 'Feedback' }, description: { zh: '棋盘、损失、边界与路径', en: 'Board, loss, boundaries, and paths' } },
    ],
    architectureNote: { zh: '仅四子棋搜索使用 Worker；神经网络与迷宫使用浏览器内算法。没有外部 LLM 调用或实时联网房间。', en: 'Only Connect Four search uses a Worker. Neural and maze algorithms run in the browser. There are no external LLM calls or live multiplayer rooms.' },
    implementation: [
      { zh: 'lib/lab 将核心算法与界面分离，方便以确定性输入进行单元验证。', en: 'lib/lab separates algorithms from the UI for deterministic unit checks.' },
      { zh: '分享内容仅承载经过校验的棋局码或种子，不上传个人数据。', en: 'Sharing carries validated board codes or seeds rather than uploading personal data.' },
      { zh: '中英文界面、键盘与触屏按钮沿用站点的主题与路由系统。', en: 'Bilingual interfaces and keyboard / touch controls use the site’s existing themes and routing.' },
    ],
    contentBlocks: {
      implementation: [
        {
          id: 'neural-forward-code', kind: 'code', language: 'typescript',
          title: { zh: '神经网络的前向计算', en: 'The network’s forward pass' },
          code: `const sigmoid = (x: number) => 1 / (1 + Math.exp(-Math.max(-40, Math.min(40, x))))
export function predict(network: Network, x: number, y: number): number {
  let sum = network.outputBias
  for (let i = 0; i < 8; i++) sum += Math.tanh(network.hidden[i]![0]! * x + network.hidden[i]![1]! * y + network.bias[i]!) * network.output[i]!
  return sigmoid(sum)
}`,
          caption: { zh: '摘自现有实验室的 sigmoid 与 predict 函数，依赖项目中的 Network 类型；这是前向计算的代码摘录，不是独立脚本或训练结果。', en: 'An excerpt of the lab’s existing sigmoid and predict functions, using the project’s Network type. This is forward-pass source, not a standalone script or a training result.' },
        },
        {
          id: 'neural-forward-equations', kind: 'math',
          title: { zh: '与源码对应的计算关系', en: 'The same computation, in equations' },
          latex: String.raw`\begin{aligned}
h_i &= \tanh(w_{i1}x + w_{i2}y + b_i), \quad i = 1,\ldots,8 \\
z &= c + \sum_{i=1}^{8} v_i h_i \\
p &= \frac{1}{1 + \exp(-\operatorname{clip}(z,-40,40))}
\end{aligned}`,
          explanation: { zh: '两个输入 x、y 经过八个 tanh 隐藏单元，再加权求和并加入输出偏置 c。源码先把输出限制在 −40 到 40，再用 sigmoid 得到概率 p。', en: 'Inputs x and y pass through eight tanh hidden units. Their weighted sum includes output bias c; the source clips it to −40…40 before applying sigmoid to obtain probability p.' },
          caption: { zh: '公式说明现有实现；节点数量和截断范围是代码常量，不是实验指标。', en: 'These equations describe the implementation. Unit counts and clipping bounds are code constants, not experimental metrics.' },
        },
      ],
    },
    results: [
      { zh: '三种交互均有现存算法源码、组件与站内演示入口。', en: 'All three interactions have algorithm source, UI components, and in-site demos.' },
      { zh: '算法测试覆盖棋局校验、搜索结果、神经网络训练和路径正确性；本轮运行状态以验证报告为准。', en: 'Algorithm tests cover board validation, search, neural training, and path correctness. This update’s execution status is recorded in the validation report.' },
    ],
    limitations: [
      { zh: '神经网络拟合率是演示训练集指标，不是独立测试集或研究性能。', en: 'Neural accuracy describes the demo training set, not independent test or research performance.' },
      { zh: '分享不等于实时联机；没有账号、排行榜、消息后端或服务器端 Agent。', en: 'Sharing is not live multiplayer. There are no accounts, leaderboards, messaging backends, or server-side agents.' },
    ],
    nextSteps: [
      { zh: '补充实体触屏和辅助技术上的交互检查。', en: 'Expand checks on physical touchscreens and assistive technology.' },
      { zh: '保持算法模块独立，新增实验时同时添加确定性测试与解释。', en: 'Keep algorithm modules independent, with deterministic tests and explanations for new experiments.' },
    ],
    reviewed: '2026-10-11',
  },
}]
