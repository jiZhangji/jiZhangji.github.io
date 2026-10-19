<template>
  <figure class="vision-figure" :aria-label="isEn ? 'A schematic of visual representation learning' : '视觉表征学习的抽象示意图'">
    <div class="vision-caption"><span><span class="vision-caption-dot" />FIELD STUDY — 01</span><span>REPRESENTATION LEARNING</span></div>
    <svg class="vision-diagram" viewBox="0 0 460 350" role="img" :aria-label="isEn ? 'From observations to structure' : '从观测到结构'">
      <defs>
        <pattern id="vision-grid" width="23" height="23" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".75" fill="currentColor" opacity=".16" /></pattern>
        <clipPath id="vision-field"><rect x="40" y="45" width="280" height="242" rx="1" /></clipPath>
      </defs>
      <circle cx="194" cy="167" r="137" class="vision-halo" />
      <rect x="18" y="20" width="400" height="290" fill="url(#vision-grid)" />
      <circle cx="194" cy="167" r="145" fill="none" stroke="currentColor" opacity=".1" stroke-dasharray="2 7" />
      <g stroke="currentColor" fill="none" opacity=".16"><path d="M40 285h338M42 285V43M328 45v242" /><rect x="78" y="75" width="220" height="174" /><path d="m78 249 53-132 89 26 78-68M78 75l54 111 88-43 78 106" /></g>
      <g clip-path="url(#vision-field)" fill="none" stroke="currentColor" opacity=".32">
        <ellipse cx="194" cy="167" rx="133" ry="42" transform="rotate(-32 194 167)" />
        <ellipse cx="194" cy="167" rx="104" ry="54" transform="rotate(-32 194 167)" />
        <ellipse cx="194" cy="167" rx="71" ry="71" transform="rotate(-32 194 167)" />
        <ellipse cx="194" cy="167" rx="42" ry="102" transform="rotate(-32 194 167)" />
        <path d="M57 248C114 87 213 96 316 88M57 233c109-73 157-44 259-53M70 142c86 33 146 92 233 93" />
      </g>
      <g fill="currentColor" opacity=".65"><circle cx="111" cy="204" r="3" /><circle cx="142" cy="112" r="3" /><circle cx="279" cy="119" r="3" /><circle cx="260" cy="218" r="3" /><circle cx="169" cy="226" r="3" /></g>
      <path d="m111 204 83-37 85-48m-85 48 66 51m-66-51-52-55" fill="none" class="vision-accent" stroke-width="1.6" />
      <circle cx="194" cy="167" r="34" fill="none" class="vision-accent vision-orbit" stroke-dasharray="3 5" opacity=".6" />
      <circle cx="194" cy="167" r="7" class="vision-fill" />
      <circle cx="194" cy="167" r="13" fill="none" class="vision-accent" opacity=".4" />
      <g font-family="ui-monospace, monospace" font-size="9" fill="currentColor" opacity=".55"><text x="345" y="51">z ∈ ℝᵈ</text><text x="335" y="290">STRUCTURE</text><text x="40" y="321">OBSERVATION</text><text x="209" y="164">z</text><text x="29" y="38">y</text><text x="381" y="290">x</text></g>
      <path d="M40 36v15M33 43h15M328 279v15m-7-7h15" stroke="currentColor" opacity=".45" />
    </svg>
    <div class="vision-note"><span class="vision-note-mark" aria-hidden="true">↳</span><div><p>{{ isEn ? 'Finding structure in complexity.' : '在复杂的观测中，寻找结构。' }}</p><span>{{ isEn ? 'An abstract study, not experimental data.' : '表征学习示意 · 非实验数据' }}</span></div></div>
    <figcaption><span>{{ isEn ? 'Observe. Represent. Understand.' : '观测 · 表征 · 理解' }}</span><span>LATENT SPACE / ℝᵈ <span aria-hidden="true">↗</span></span></figcaption>
  </figure>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
</script>
