<script setup lang="ts">
import { useFluidStore } from '../store/fluid'
import { PRESETS, LECTURE_SCENES } from '../utils/sph-engine'
import type { Preset } from '../types'

const store = useFluidStore()

function selectPreset(preset: Preset) {
  if (store.lectureMode) return
  store.initSimulation(preset)
}

function toggleRun() {
  if (store.isRunning) {
    store.stop()
  } else {
    store.start()
  }
}

function reset() {
  store.reset()
}

function stepOnce() {
  store.stepOnce()
}

function onGravity(e: Event) {
  if (store.lectureMode) return
  store.updateParam('gravity', parseFloat((e.target as HTMLInputElement).value))
}
function onViscosity(e: Event) {
  if (store.lectureMode) return
  store.updateParam('viscosity', parseFloat((e.target as HTMLInputElement).value))
}
function onSmoothingRadius(e: Event) {
  if (store.lectureMode) return
  store.updateParam('smoothingRadius', parseFloat((e.target as HTMLInputElement).value))
}
function onParticleCount(e: Event) {
  if (store.lectureMode) return
  store.particleCount = parseInt((e.target as HTMLInputElement).value)
}
function onDt(e: Event) {
  if (store.lectureMode) return
  store.updateParam('dt', parseFloat((e.target as HTMLInputElement).value))
}

function enterLecture(sceneIndex: number) {
  store.enterLectureMode(sceneIndex)
}

function exitLecture() {
  store.exitLectureMode()
}

function selectScene(idx: number) {
  store.selectLectureScene(idx)
}
</script>

<template>
  <div class="w-72 bg-gray-800 rounded-lg border border-gray-700 p-4 flex flex-col gap-4 overflow-auto h-full">
    <div v-if="store.lectureMode" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
          <span class="inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
          讲解模式
        </h3>
        <button
          @click="exitLecture"
          class="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition"
        >
          退出
        </button>
      </div>

      <div>
        <label class="text-xs text-gray-400 mb-1 block">选择讲解场景</label>
        <select
          :value="store.currentSceneIndex"
          @change="selectScene(parseInt(($event.target as HTMLSelectElement).value))"
          class="w-full bg-gray-900 text-gray-200 text-xs rounded px-2 py-1.5 border border-gray-600 focus:border-purple-500 outline-none"
        >
          <option v-for="(scene, idx) in LECTURE_SCENES" :key="scene.id" :value="idx">
            {{ scene.title }}
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">{{ store.currentScene?.description }}</p>
      </div>

      <div class="bg-gray-900 rounded-lg p-3 border border-gray-700">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-purple-300">
            步骤 {{ store.currentStepIndex + 1 }} / {{ store.totalStepsInScene }}
          </span>
          <span class="text-xs text-gray-500">
            {{ (store.stepProgress * 100).toFixed(0) }}%
          </span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-1.5 mb-3">
          <div
            class="bg-purple-500 h-1.5 rounded-full transition-all duration-100"
            :style="{ width: `${store.stepProgress * 100}%` }"
          ></div>
        </div>
        <h4 class="text-sm font-semibold text-white mb-1.5">{{ store.currentStep?.title }}</h4>
        <p class="text-xs text-gray-400 leading-relaxed">{{ store.currentStep?.description }}</p>
        <div v-if="store.currentStep?.paramChanges" class="mt-2 pt-2 border-t border-gray-700">
          <span class="text-xs text-gray-500">参数变更: </span>
          <span
            v-for="(val, key) in store.currentStep?.paramChanges"
            :key="key"
            class="inline-block text-xs bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded mr-1"
          >
            {{ key }}={{ typeof val === 'number' ? val.toFixed(1) : val }}
          </span>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          @click="store.prevStep()"
          :disabled="store.isFirstStep"
          class="flex-1 py-2 rounded text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed bg-gray-700 hover:bg-gray-600 text-gray-200"
        >
          ← 上一步
        </button>
        <button
          @click="store.nextStep()"
          :disabled="store.isLastStep"
          class="flex-1 py-2 rounded text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700 text-white"
        >
          下一步 →
        </button>
      </div>

      <div class="grid grid-cols-3 gap-1">
        <button
          v-for="(step, idx) in store.currentScene?.steps"
          :key="step.id"
          @click="store.goToStep(idx)"
          class="text-xs py-1.5 rounded transition"
          :class="store.currentStepIndex === idx
            ? 'bg-purple-600 text-white'
            : idx < store.currentStepIndex
            ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'"
        >
          {{ idx + 1 }}
        </button>
      </div>

      <div class="flex gap-2">
        <button
          @click="toggleRun"
          class="flex-1 py-2 rounded text-sm font-medium transition"
          :class="store.isRunning
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'"
        >
          {{ store.isRunning ? '暂停' : '播放' }}
        </button>
        <button
          @click="reset"
          class="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 rounded text-sm transition"
        >
          重置此步
        </button>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div class="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-lg p-3 border border-purple-700/50">
        <h3 class="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">课堂演示</h3>
        <p class="text-xs text-gray-400 mb-2">开启讲解模式，自动按步骤演示 SPH 流体力学核心概念</p>
        <div class="flex flex-col gap-1.5">
          <button
            v-for="(scene, idx) in LECTURE_SCENES"
            :key="scene.id"
            @click="enterLecture(idx)"
            class="text-left text-xs px-3 py-2 rounded bg-purple-700/60 hover:bg-purple-600/80 text-purple-100 transition"
          >
            <span class="font-semibold">{{ scene.title }}</span>
            <span class="text-purple-300 block mt-0.5">{{ scene.steps.length }} 个步骤</span>
          </button>
        </div>
      </div>

      <div>
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">预设场景</h3>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="preset in PRESETS"
            :key="preset.name"
            @click="selectPreset(preset)"
            class="text-xs px-2 py-2 rounded transition text-left"
            :class="store.currentPreset.name === preset.name
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
          >
            {{ preset.label }}
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1">{{ store.currentPreset.description }}</p>
      </div>

      <div class="flex gap-2">
        <button
          @click="toggleRun"
          class="flex-1 py-2 rounded text-sm font-medium transition"
          :class="store.isRunning
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'"
        >
          {{ store.isRunning ? '暂停' : '开始' }}
        </button>
        <button
          @click="reset"
          class="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 rounded text-sm transition"
        >
          重置
        </button>
        <button
          @click="stepOnce"
          :disabled="store.isRunning"
          class="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-200 py-2 rounded text-sm transition"
        >
          单步
        </button>
      </div>

      <div class="space-y-3">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">模拟参数</h3>

        <div>
          <label class="flex justify-between text-xs text-gray-400 mb-1">
            <span>重力</span>
            <span class="text-gray-300">{{ store.params.gravity.toFixed(1) }}</span>
          </label>
          <input
            type="range" min="0" max="20" step="0.1"
            :value="store.params.gravity"
            @input="onGravity"
            class="w-full accent-blue-500 h-1.5"
          />
        </div>

        <div>
          <label class="flex justify-between text-xs text-gray-400 mb-1">
            <span>粘性</span>
            <span class="text-gray-300">{{ store.params.viscosity.toFixed(1) }}</span>
          </label>
          <input
            type="range" min="0" max="5" step="0.1"
            :value="store.params.viscosity"
            @input="onViscosity"
            class="w-full accent-blue-500 h-1.5"
          />
        </div>

        <div>
          <label class="flex justify-between text-xs text-gray-400 mb-1">
            <span>光滑半径</span>
            <span class="text-gray-300">{{ store.params.smoothingRadius.toFixed(0) }}</span>
          </label>
          <input
            type="range" min="10" max="50" step="1"
            :value="store.params.smoothingRadius"
            @input="onSmoothingRadius"
            class="w-full accent-blue-500 h-1.5"
          />
        </div>

        <div>
          <label class="flex justify-between text-xs text-gray-400 mb-1">
            <span>粒子数量</span>
            <span class="text-gray-300">{{ store.particleCount }}</span>
          </label>
          <input
            type="range" min="200" max="2000" step="50"
            :value="store.particleCount"
            @input="onParticleCount"
            class="w-full accent-blue-500 h-1.5"
          />
          <p class="text-xs text-gray-600 mt-0.5">重置后生效</p>
        </div>

        <div>
          <label class="flex justify-between text-xs text-gray-400 mb-1">
            <span>时间步长</span>
            <span class="text-gray-300">{{ store.params.dt.toFixed(4) }}</span>
          </label>
          <input
            type="range" min="0.001" max="0.02" step="0.001"
            :value="store.params.dt"
            @input="onDt"
            class="w-full accent-blue-500 h-1.5"
          />
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">视角控制</h3>
        <button
          @click="store.resetCamera()"
          class="w-full text-xs py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition"
        >
          重置视角
        </button>
        <p class="text-xs text-gray-600">滚轮缩放 · 拖拽平移</p>
      </div>

      <div class="mt-auto pt-3 border-t border-gray-700">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">运行状态</h3>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-gray-900 rounded px-2 py-1.5">
            <span class="text-gray-500">FPS</span>
            <p class="text-green-400 font-mono text-sm">{{ store.fps }}</p>
          </div>
          <div class="bg-gray-900 rounded px-2 py-1.5">
            <span class="text-gray-500">粒子数</span>
            <p class="text-blue-400 font-mono text-sm">{{ store.particleArray.length }}</p>
          </div>
          <div class="bg-gray-900 rounded px-2 py-1.5">
            <span class="text-gray-500">平均密度</span>
            <p class="text-yellow-400 font-mono text-sm">{{ store.avgDensity.toFixed(0) }}</p>
          </div>
          <div class="bg-gray-900 rounded px-2 py-1.5">
            <span class="text-gray-500">最大速度</span>
            <p class="text-red-400 font-mono text-sm">{{ store.maxVelocity.toFixed(1) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
