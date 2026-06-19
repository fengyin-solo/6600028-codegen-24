<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useFluidStore } from './store/fluid'
import { PRESETS, LECTURE_SCENES } from './utils/sph-engine'
import FluidCanvas from './components/FluidCanvas.vue'
import ControlPanel from './components/ControlPanel.vue'

const store = useFluidStore()

const highlightLegend = computed(() => {
  switch (store.currentHighlight) {
    case 'velocity':
      return { label: '速度', colors: ['#3b82f6', '#22c55e', '#ef4444'], labels: ['慢', '中', '快'] }
    case 'density':
      return { label: '密度', colors: ['#06b6d4', '#0ea5e9', '#1e40af'], labels: ['低', '中', '高'] }
    case 'pressure':
      return { label: '压力', colors: ['#3b82f6', '#8b5cf6', '#ef4444'], labels: ['低', '中', '高'] }
    case 'particles':
      return { label: '粒子', colors: ['#3b82f6', '#22c55e', '#ef4444'], labels: ['低速', '中速', '高速'] }
    default:
      return null
  }
})

onMounted(() => {
  store.initSimulation(PRESETS[0])
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
    <header class="bg-gray-800 border-b border-gray-700 px-6 py-4 relative">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-white tracking-wide">流体力学 SPH 粒子模拟器</h1>
          <p class="text-xs text-gray-500 mt-1">Smoothed Particle Hydrodynamics — 点击画布施加冲量</p>
        </div>
        <div v-if="store.lectureMode" class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-purple-900/50 border border-purple-600 rounded-full px-3 py-1">
            <span class="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
            <span class="text-xs font-semibold text-purple-300">{{ store.currentScene?.title }}</span>
          </div>
        </div>
      </div>

      <div v-if="store.lectureMode" class="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-700">
        <div
          class="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 transition-all duration-100"
          :style="{ width: `${((store.currentStepIndex + store.stepProgress) / store.totalStepsInScene) * 100}%` }"
        ></div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden p-4 gap-4 relative">
      <div class="flex-1 flex flex-col items-start gap-2 relative">
        <FluidCanvas />

        <div
          v-if="store.lectureMode && highlightLegend"
          class="absolute top-3 left-3 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700"
        >
          <div class="text-xs font-semibold text-gray-300 mb-2">{{ highlightLegend.label }}图例</div>
          <div class="flex items-center gap-2">
            <div v-for="(color, i) in highlightLegend.colors" :key="i" class="flex items-center gap-1">
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: color }"
              ></div>
              <span class="text-xs text-gray-400">{{ highlightLegend.labels[i] }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="store.lectureMode"
          class="w-full max-w-[800px] bg-gray-800/95 backdrop-blur-sm border border-purple-700/50 rounded-lg p-4 shadow-lg"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-mono bg-purple-700 text-purple-100 px-2 py-0.5 rounded">
                  Step {{ store.currentStepIndex + 1 }} / {{ store.totalStepsInScene }}
                </span>
                <span
                  v-if="store.currentStep?.autoAdvance"
                  class="text-xs text-green-400 flex items-center gap-1"
                >
                  <span class="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  自动推进
                </span>
                <span
                  v-else
                  class="text-xs text-yellow-400"
                >
                  手动推进
                </span>
              </div>
              <h2 class="text-lg font-bold text-white">{{ store.currentStep?.title }}</h2>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="store.prevStep()"
                :disabled="store.isFirstStep"
                class="px-3 py-1.5 text-sm rounded transition disabled:opacity-30 disabled:cursor-not-allowed bg-gray-700 hover:bg-gray-600 text-gray-200"
              >
                ← 上一步
              </button>
              <button
                @click="store.nextStep()"
                :disabled="store.isLastStep"
                class="px-4 py-1.5 text-sm rounded font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/50"
              >
                下一步 →
              </button>
            </div>
          </div>
          <p class="text-sm text-gray-300 leading-relaxed">{{ store.currentStep?.description }}</p>
          <div v-if="store.currentStep?.paramChanges" class="mt-3 flex flex-wrap items-center gap-2">
            <span class="text-xs text-gray-500">当前参数:</span>
            <span
              v-for="(val, key) in store.currentStep?.paramChanges"
              :key="key"
              class="text-xs px-2 py-1 rounded bg-purple-900/60 text-purple-200 font-mono border border-purple-700/50"
            >
              {{ key }} = {{ typeof val === 'number' ? val.toFixed(1) : val }}
            </span>
          </div>
          <div class="mt-3">
            <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>本步骤进度</span>
              <span>{{ (store.stepProgress * 100).toFixed(0) }}%</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-1.5">
              <div
                class="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-100"
                :style="{ width: `${store.stepProgress * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-shrink-0">
        <ControlPanel />
      </div>
    </div>

    <footer class="bg-gray-800 border-t border-gray-700 px-6 py-2 flex items-center gap-6 text-xs">
      <div class="flex items-center gap-2">
        <span class="text-gray-500">FPS:</span>
        <span class="text-green-400 font-mono">{{ store.fps }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-gray-500">粒子:</span>
        <span class="text-blue-400 font-mono">{{ store.particleArray.length }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-gray-500">平均密度:</span>
        <span class="text-yellow-400 font-mono">{{ store.avgDensity.toFixed(1) }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-gray-500">最大速度:</span>
        <span class="text-red-400 font-mono">{{ store.maxVelocity.toFixed(1) }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-gray-500">当前预设:</span>
        <span class="text-purple-400">{{ store.currentPreset.label }}</span>
      </div>
      <div v-if="store.lectureMode" class="flex items-center gap-2">
        <span class="text-gray-500">讲解场景:</span>
        <span class="text-fuchsia-400">{{ store.currentScene?.title }}</span>
      </div>
      <div class="flex items-center gap-2 ml-auto">
        <span class="text-gray-500">帧数:</span>
        <span class="text-gray-300 font-mono">{{ store.frameCount }}</span>
      </div>
    </footer>
  </div>
</template>
