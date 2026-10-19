<template>
  <div class="container-wide lab-page">
    <header class="lab-intro">
      <div><p class="eyebrow"><span class="status-dot" />THE INTERACTIVE NOTEBOOK</p><h1>{{ isEn ? 'A little less reading.' : '不只阅读，' }}<br><em>{{ isEn ? 'A little more wondering.' : '也来动手。' }}</em></h1><p class="lead mt-6">{{ isEn ? 'Play against an algorithm, teach a neural network, or find your way through a maze. Small experiments that invite you in.' : '和算法下一局棋，亲手教会一个神经网络，或走进一座迷宫。把抽象的问题，变成可以参与的小实验。' }}</p><div class="lab-promises"><span>{{ isEn ? 'No sign-up' : '无需注册' }}</span><span>{{ isEn ? 'Runs in your browser' : '浏览器本地运算' }}</span><span>{{ isEn ? 'Made for curiosity' : '欢迎带着好奇心' }}</span></div></div>
      <div class="lab-intro-art" aria-hidden="true"><div class="lab-art-label">INPUT → EXPLORE → UNDERSTAND</div><svg viewBox="0 0 320 230"><g stroke="currentColor" fill="none" opacity=".18"><path d="M34 50 145 40 264 73M34 50 145 115 264 73M34 174 145 115 264 177M34 174 145 192 264 177M34 50 145 192M34 174 145 40M145 40 264 177M145 192 264 73" /></g><g fill="var(--paper)" stroke="var(--accent)" stroke-width="1.5"><circle cx="34" cy="50" r="15"/><circle cx="34" cy="174" r="15"/><circle cx="145" cy="40" r="12"/><circle cx="145" cy="115" r="22"/><circle cx="145" cy="192" r="12"/><circle cx="264" cy="73" r="15"/><circle cx="264" cy="177" r="15"/></g><path d="m137 115 6 6 11-13" fill="none" stroke="var(--clay)" stroke-width="2"/><circle cx="264" cy="73" r="5" fill="var(--clay)"/><circle cx="34" cy="174" r="5" fill="var(--accent)"/></svg><span class="lab-art-note">{{ isEn ? 'What happens if…?' : '如果这样，会怎样？' }}</span></div>
    </header>
    <nav class="lab-directory" :aria-label="isEn ? 'Choose an experiment' : '选择互动实验'">
      <a v-for="item in experiments" :key="item.id" :href="`#${item.id}`"><span class="lab-directory-number">{{ item.number }}</span><SiteIcon :name="item.icon" class="h-6 w-6" /><span><strong>{{ item.title }}</strong><small>{{ item.subtitle }}</small></span><SiteIcon name="arrow-up-right" class="lab-directory-arrow h-4 w-4" /></a>
    </nav>
    <section id="connect-four" class="lab-experiment" aria-labelledby="connect-title"><div class="lab-section-heading"><div><p class="eyebrow">01 / STRATEGY GAME</p><h2 id="connect-title">{{ isEn ? 'Your move.' : '该你落子了。' }}</h2></div><span class="lab-badge">MINIMAX · ALPHA–BETA</span></div><LabConnectFour /></section>
    <section id="neural-canvas" class="lab-experiment" aria-labelledby="neural-title"><div class="lab-section-heading"><div><p class="eyebrow">02 / MACHINE LEARNING</p><h2 id="neural-title">{{ isEn ? 'Draw the data. See it learn.' : '画下样本，看见学习。' }}</h2></div><span class="lab-badge">NEURAL NETWORK · BACKPROP</span></div><LabNeuralCanvas /></section>
    <section id="pathfinder" class="lab-experiment" aria-labelledby="maze-title"><div class="lab-section-heading"><div><p class="eyebrow">03 / DAILY CHALLENGE</p><h2 id="maze-title">{{ isEn ? 'There is a way through.' : '总有一条路，通向答案。' }}</h2></div><span class="lab-badge">A* · SEEDED MAZE</span></div><LabMaze /></section>
    <aside class="lab-footnote"><SiteIcon name="shield" class="h-5 w-5 shrink-0" /><p>{{ isEn ? 'These algorithms run entirely on your device. No sign-in, tracking, API key, or paid inference. Sharing creates a position or puzzle link; it does not start a live multiplayer session. Reloading resets unsaved progress.' : '这些算法完全在你的设备上运行，不需要登录、追踪脚本、API Key 或付费推理。分享的是棋局或题目链接，不会创建实时多人房间。刷新页面会重置未保存的进度。' }}</p></aside>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/lab.css'
const { locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
const experiments = computed(() => [
  { id: 'connect-four', number: '01', icon: 'gamepad', title: isEn.value ? 'Connect Four' : 'AI 四子棋', subtitle: isEn.value ? 'AI · two players · pass a position' : '人机对弈 · 双人同屏 · 传递棋局' },
  { id: 'neural-canvas', number: '02', icon: 'network', title: isEn.value ? 'Neural Canvas' : '神经网络画布', subtitle: isEn.value ? 'Your examples, its decisions' : '亲手加样本，观察决策边界' },
  { id: 'pathfinder', number: '03', icon: 'route', title: isEn.value ? 'The Daily Maze' : '每日迷宫', subtitle: isEn.value ? 'Explore · solve · challenge a friend' : '手动探索 · 算法解题 · 朋友挑战' },
])
usePageSeo(() => isEn.value ? 'Interactive Lab' : '互动实验室', () => isEn.value ? 'Play Connect Four, train a tiny neural network, and explore A* pathfinding. Local, interactive experiments by Zhang Ji.' : '挑战 AI 四子棋、亲手训练小型神经网络、探索 A* 迷宫寻路。完全在浏览器本地运行的互动实验。')
</script>
