<template>
  <div class="lab-share">
    <button type="button" class="btn-ghost w-full" @click="copyLink"><SiteIcon name="share" class="h-4 w-4" />{{ isEn ? 'Copy challenge link' : '复制挑战链接' }}</button>
    <p v-if="message" class="lab-help mt-2" role="status">{{ message }}</p>
    <label v-if="generated" class="lab-help mt-3 block">{{ isEn ? 'You can also select and copy this address:' : '也可以选中并复制下方地址：' }}
      <input :value="generated" readonly class="field mt-2 font-mono text-xs" :aria-label="isEn ? 'Challenge link' : '挑战链接'" @focus="selectAll">
    </label>
    <p v-if="local" class="lab-help mt-3">{{ isEn ? 'Local preview: this link only works on this computer. Deploy the site to a public domain before sending links to friends.' : '当前是本地预览，链接只能在这台电脑打开。部署到公开域名后，才能发给朋友访问。' }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ params: Record<string, string>; anchor: string }>()
const { locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
const url = useLocaleUrl()
const { withBase } = useBaseUrl()
const generated = ref(''), message = ref(''), local = ref(false)
onMounted(() => { local.value = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname) })
watch(() => JSON.stringify(props.params), () => { generated.value = ''; message.value = '' })
function selectAll(event: FocusEvent) { (event.target as HTMLInputElement).select() }
async function copyLink() {
  const target = new URL(withBase(url.to('/lab')), window.location.origin)
  for (const [key, value] of Object.entries(props.params)) target.searchParams.set(key, value)
  target.hash = props.anchor
  generated.value = target.toString()
  try {
    await navigator.clipboard.writeText(generated.value)
    message.value = isEn.value ? 'Link copied. No data was sent to a server.' : '链接已复制，没有向服务器发送数据。'
  } catch {
    message.value = isEn.value ? 'Clipboard unavailable. Select the address below to copy it manually.' : '无法自动复制，请选中下方地址手动复制。'
  }
}
</script>
