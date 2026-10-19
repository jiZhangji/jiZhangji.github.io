export type ExperimentText = { zh: string; en: string }

export interface PelicanExperiment {
  id: 'frontier' | 'codex' | 'workbuddy'
  title: ExperimentText
  description: ExperimentText
  kind: '3d'
  demo: string
  cover: string
  /** The cover is a separate, authentic SVG study, not a 3D screenshot. */
  coverType: 'svg-study'
  tags: string[]
  /** A label found in a session record, not independently verified model identity. */
  model: string | null
  source: string
  status: ExperimentText
}

export const pelicanExperiments: PelicanExperiment[] = [
  {
    id: 'frontier',
    title: { zh: '海岸骑行 · 本地实验', en: 'Coastal Ride · Frontier' },
    description: {
      zh: '海岸公路、世界空间围巾与海面着色器，加入昼夜、捕鱼和多镜头切换。',
      en: 'A coastal road with a world-space scarf, ocean shaders, a day–night cycle, fishing, and multiple cameras.',
    },
    kind: '3d',
    demo: '/experiments/pelican/frontier/index.html',
    cover: '/experiments/pelican/svg/frontier-pelican-bicycle.svg',
    coverType: 'svg-study',
    tags: ['Three.js r160', 'WebGL', 'Verlet'],
    model: null,
    source: 'Frontier',
    status: { zh: '本地归档 · 创建软件与模型待确认', en: 'Local archive · creator app and model unconfirmed' },
  },
  {
    id: 'codex',
    title: { zh: '鹈鹕海岸夜骑', en: 'Pelican After Dark' },
    description: {
      zh: '从海岸驶入星空：布料网格、捕鱼连击、触屏按钮与闲置自动驾驶。',
      en: 'Ride from the coast into the stars, with cloth animation, fishing combos, touch controls, and idle autopilot.',
    },
    kind: '3d',
    demo: '/experiments/pelican/codex/index.html',
    cover: '/experiments/pelican/svg/codex-pelican-bicycle.svg',
    coverType: 'svg-study',
    tags: ['Three.js r170', 'Web Audio', 'Touch'],
    model: 'gpt-6-luna',
    source: 'Codex',
    status: { zh: '本地归档 · 依赖已本地化', en: 'Local archive · dependencies included' },
  },
  {
    id: 'workbuddy',
    title: { zh: '环岛海岸骑行', en: 'Island Coast Ride' },
    description: {
      zh: '沿环形样条赛道穿过海岸，以扫掠地形、局部空间围巾和四档画质探索另一种实现。',
      en: 'A circular spline track with swept terrain, a local-space scarf, and four quality presets.',
    },
    kind: '3d',
    demo: '/experiments/pelican/workbuddy/index.html',
    cover: '/experiments/pelican/svg/workbuddy-pelican-bicycle.svg',
    coverType: 'svg-study',
    tags: ['Three.js r160', 'CatmullRom', 'WebGL'],
    model: 'deepseek-v4.1-flash',
    source: 'WorkBuddy',
    status: { zh: '本地归档 · 原始脚本保留', en: 'Local archive · original scripts retained' },
  },
]

export interface SvgExperiment {
  id: string
  title: ExperimentText
  description: ExperimentText
  kind: 'svg' | 'stack'
  source: string
  src: string
}

export const svgExperiments: SvgExperiment[] = [
  {
    id: 'frontier-bicycle',
    title: { zh: '晴空与草地', en: 'Sky and Meadow' },
    description: { zh: '800 × 600 的鹈鹕骑车 SVG；创建软件与模型未确认。', en: 'An 800 × 600 SVG study; creator app and model are unconfirmed.' },
    kind: 'svg',
    source: 'Frontier',
    src: '/experiments/pelican/svg/frontier-pelican-bicycle.svg',
  },
  {
    id: 'codex-bicycle',
    title: { zh: '浅色晴空', en: 'A Clear Day' },
    description: { zh: '1000 × 720，浅色天空与青绿自行车。', en: 'A 1000 × 720 composition with a pale sky and a teal bicycle.' },
    kind: 'svg',
    source: 'Codex',
    src: '/experiments/pelican/svg/codex-pelican-bicycle.svg',
  },
  {
    id: 'workbuddy-bicycle',
    title: { zh: '深色骑行练习', en: 'A Dark-Canvas Study' },
    description: { zh: '680 × 440，以深色背景衬托青绿自行车。', en: 'A 680 × 440 study with a dark background and a teal bicycle.' },
    kind: 'svg',
    source: 'WorkBuddy',
    src: '/experiments/pelican/svg/workbuddy-pelican-bicycle.svg',
  },
  {
    id: 'frontier-stack',
    title: { zh: '不可能的叠罗汉', en: 'An Unlikely Stack' },
    description: { zh: '自行车 → 鹈鹕 → 宇航员 → 马，900 × 1200 的纵向构图。', en: 'Bicycle → pelican → astronaut → horse, arranged in a 900 × 1200 portrait study.' },
    kind: 'stack',
    source: 'Frontier',
    src: '/experiments/pelican/svg/frontier-chaotic-stack.svg',
  },
  {
    id: 'workbuddy-stack',
    title: { zh: '混乱之塔', en: 'Chaos Tower' },
    description: { zh: '同一个叠罗汉题目，680 × 700 的另一份独立 SVG。', en: 'An independent 680 × 700 SVG exploring the same stacking prompt.' },
    kind: 'stack',
    source: 'WorkBuddy',
    src: '/experiments/pelican/svg/workbuddy-chaos-tower.svg',
  },
]

export const pelicanArchiveDate = '2026-09-27'

export const pelicanArchiveNote: ExperimentText = {
  zh: '3 个独立 3D 实验、3 份骑车 SVG、2 份叠罗汉 SVG；另有 1 条叠罗汉生成记录尚未找到图片。3D 卡片使用同来源的 2D SVG 练习作封面，不是场景截图。模型名称仅为会话记录标签，不构成身份鉴定或性能排名。',
  en: 'Three independent 3D experiments, three cycling SVGs, and two stacking SVGs; one additional stacking record has no located image. The 3D covers are separate 2D SVG studies from the same source, not scene screenshots. Model names are session-record labels, not verified identities or a performance ranking.',
}
