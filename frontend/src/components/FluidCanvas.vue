<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useFluidStore } from '../store/fluid'

const store = useFluidStore()
const canvas = ref<HTMLCanvasElement | null>(null)

const W = 800
const H = 500

let isDragging = false
let dragStartX = 0
let dragStartY = 0
let dragOffsetX = 0
let dragOffsetY = 0

function velocityToColor(speed: number): string {
  const maxSpeed = 200
  const t = Math.min(speed / maxSpeed, 1)
  const hue = (1 - t) * 240
  const sat = 80
  const light = 40 + t * 20
  return `hsl(${hue}, ${sat}%, ${light}%)`
}

function densityToColor(density: number, avgDensity: number): string {
  const ratio = avgDensity > 0 ? density / avgDensity : 1
  const t = Math.min(Math.max((ratio - 0.5) * 2, 0), 1)
  const hue = (1 - t) * 60 + 180
  const sat = 70
  const light = 35 + t * 20
  return `hsl(${hue}, ${sat}%, ${light}%)`
}

function pressureToColor(pressure: number): string {
  const minP = -50000
  const maxP = 50000
  const t = Math.min(Math.max((pressure - minP) / (maxP - minP), 0), 1)
  const hue = (1 - t) * 240
  return `hsl(${hue}, 75%, 45%)`
}

function getParticleColor(p: { vx: number; vy: number; density: number; pressure: number }, avgDensity: number): string {
  switch (store.currentHighlight) {
    case 'velocity':
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      return velocityToColor(speed)
    case 'density':
      return densityToColor(p.density, avgDensity)
    case 'pressure':
      return pressureToColor(p.pressure)
    case 'particles':
    default:
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      return velocityToColor(spd)
  }
}

function draw() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#0c1222'
  ctx.fillRect(0, 0, W, H)

  ctx.save()
  ctx.translate(W / 2 + store.camera.offsetX, H / 2 + store.camera.offsetY)
  ctx.scale(store.camera.scale, store.camera.scale)
  ctx.translate(-W / 2, -H / 2)

  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 3
  ctx.strokeRect(2, 2, W - 4, H - 4)

  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 0.3
  for (let x = 0; x < W; x += 50) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = 0; y < H; y += 50) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }

  if (!store.engine) {
    ctx.restore()
    return
  }

  const avgDensity = store.avgDensity

  if (store.currentHighlight === 'density' || store.currentHighlight === 'none') {
    const gridSize = 20
    const gw = Math.ceil(W / gridSize)
    const gh = Math.ceil(H / gridSize)
    const densityGrid = new Float32Array(gw * gh)
    for (const p of store.engine.particles) {
      const gx = Math.floor(p.x / gridSize)
      const gy = Math.floor(p.y / gridSize)
      if (gx >= 0 && gx < gw && gy >= 0 && gy < gh) {
        densityGrid[gy * gw + gx] += p.density
      }
    }
    const maxDens = Math.max(...densityGrid, 1)
    for (let gy = 0; gy < gh; gy++) {
      for (let gx = 0; gx < gw; gx++) {
        const d = densityGrid[gy * gw + gx]
        if (d > 0) {
          const alpha = Math.min(d / maxDens * 0.15, 0.15)
          ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`
          ctx.fillRect(gx * gridSize, gy * gridSize, gridSize, gridSize)
        }
      }
    }
  }

  const particles = store.engine.particles
  const radius = store.currentHighlight === 'particles' ? 5 : 4
  for (const p of particles) {
    const color = getParticleColor(p, avgDensity)
    ctx.beginPath()
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }

  if (store.currentHighlight !== 'none') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(5, 5, 140, 24)
    ctx.fillStyle = getHighlightColor()
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(`高亮: ${getHighlightLabel()}`, 12, 22)
  }

  ctx.restore()

  if (store.camera.scale !== 1 || store.camera.offsetX !== 0 || store.camera.offsetY !== 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(5, H - 29, 120, 24)
    ctx.fillStyle = '#fbbf24'
    ctx.font = '11px monospace'
    ctx.fillText(`缩放: ${store.camera.scale.toFixed(2)}x`, 12, H - 12)
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(W - 80, 5, 75, 22)
  ctx.fillStyle = '#22c55e'
  ctx.font = 'bold 12px monospace'
  ctx.fillText(`FPS: ${store.fps}`, W - 74, 20)

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(W - 120, 30, 115, 22)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px monospace'
  ctx.fillText(`Frame: ${store.frameCount}`, W - 114, 44)
}

function getHighlightLabel(): string {
  switch (store.currentHighlight) {
    case 'velocity': return '速度分布'
    case 'density': return '密度分布'
    case 'pressure': return '压力分布'
    case 'particles': return '粒子运动'
    default: return '无'
  }
}

function getHighlightColor(): string {
  switch (store.currentHighlight) {
    case 'velocity': return '#22c55e'
    case 'density': return '#3b82f6'
    case 'pressure': return '#f97316'
    case 'particles': return '#a855f7'
    default: return '#94a3b8'
  }
}

let raf: number | null = null
function animate() {
  draw()
  raf = requestAnimationFrame(animate)
}

function onClick(e: MouseEvent) {
  if (!store.engine || !canvas.value || isDragging) return
  const rect = canvas.value.getBoundingClientRect()
  const scaleX = W / rect.width
  const scaleY = H / rect.height
  const x = (e.clientX - rect.left) * scaleX
  const y = (e.clientY - rect.top) * scaleY
  const worldX = (x - W / 2 - store.camera.offsetX) / store.camera.scale + W / 2
  const worldY = (y - H / 2 - store.camera.offsetY) / store.camera.scale + H / 2
  store.engine.applyImpulse(worldX, worldY, 300)
}

function onWheel(e: WheelEvent) {
  if (!store.lectureMode) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.5, Math.min(3, store.camera.scale * delta))
    store.setCamera({
      scale: newScale,
      offsetX: store.camera.offsetX,
      offsetY: store.camera.offsetY,
    })
  }
}

function onMouseDown(e: MouseEvent) {
  if (store.lectureMode) return
  isDragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragOffsetX = store.camera.offsetX
  dragOffsetY = store.camera.offsetY
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging || store.lectureMode) return
  const dx = e.clientX - dragStartX
  const dy = e.clientY - dragStartY
  store.setCamera({
    scale: store.camera.scale,
    offsetX: dragOffsetX + dx,
    offsetY: dragOffsetY + dy,
  })
}

function onMouseUp() {
  isDragging = false
}

onMounted(() => {
  animate()
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('mousemove', onMouseMove)
})

watch(() => store.camera, () => {}, { deep: true })
</script>

<template>
  <div class="relative">
    <canvas
      ref="canvas"
      :width="W"
      :height="H"
      class="rounded-lg border border-gray-700 cursor-crosshair w-full max-w-[800px] select-none"
      :class="store.lectureMode ? 'cursor-default' : ''"
      @click="onClick"
      @wheel="onWheel"
      @mousedown="onMouseDown"
    />
  </div>
</template>
