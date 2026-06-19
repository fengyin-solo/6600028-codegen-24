import { defineStore } from 'pinia'
import { SPHEngine, DEFAULT_PARAMS, PRESETS, LECTURE_SCENES } from '../utils/sph-engine'
import type { SimParams, Preset, Particle, LectureScene, SceneStep, CameraView } from '../types'

export const useFluidStore = defineStore('fluid', {
  state: () => ({
    engine: null as SPHEngine | null,
    isRunning: false,
    particleCount: 800,
    currentPreset: PRESETS[0],
    params: { ...DEFAULT_PARAMS } as SimParams,
    fps: 0,
    frameCount: 0,
    _animId: null as number | null,
    _lastTime: 0,
    _fpsAccum: 0,
    _fpsFrames: 0,
    camera: { scale: 1, offsetX: 0, offsetY: 0 } as CameraView,
    lectureMode: false,
    currentSceneIndex: 0,
    currentStepIndex: 0,
    stepTimer: null as ReturnType<typeof setTimeout> | null,
    stepProgress: 0,
    stepStartTime: 0,
    currentHighlight: 'none' as 'particles' | 'density' | 'velocity' | 'pressure' | 'none',
    _progressAnimId: null as number | null,
  }),
  getters: {
    particleArray: (state) => state.engine?.particles ?? [],
    avgDensity: (state) => {
      if (!state.engine || state.engine.particles.length === 0) return 0
      const sum = state.engine.particles.reduce((s, p) => s + p.density, 0)
      return sum / state.engine.particles.length
    },
    maxVelocity: (state) => {
      if (!state.engine || state.engine.particles.length === 0) return 0
      return Math.max(...state.engine.particles.map(p => Math.sqrt(p.vx * p.vx + p.vy * p.vy)))
    },
    currentScene: (state): LectureScene | null => {
      if (!state.lectureMode) return null
      return LECTURE_SCENES[state.currentSceneIndex] ?? null
    },
    currentStep: (state): SceneStep | null => {
      if (!state.lectureMode) return null
      const scene = LECTURE_SCENES[state.currentSceneIndex]
      if (!scene) return null
      return scene.steps[state.currentStepIndex] ?? null
    },
    totalStepsInScene: (state): number => {
      const scene = LECTURE_SCENES[state.currentSceneIndex]
      return scene?.steps.length ?? 0
    },
    isLastStep: (state): boolean => {
      const scene = LECTURE_SCENES[state.currentSceneIndex]
      if (!scene) return true
      return state.currentStepIndex >= scene.steps.length - 1
    },
    isFirstStep: (state): boolean => {
      return state.currentStepIndex === 0
    },
  },
  actions: {
    initSimulation(preset?: Preset) {
      if (preset) {
        this.currentPreset = preset
        this.params = { ...DEFAULT_PARAMS, ...preset.params }
        this.particleCount = preset.particleCount
      }
      const canvas = { width: 800, height: 500 }
      this.engine = new SPHEngine(this.particleCount, canvas.width, canvas.height, this.params)
      this.engine.initParticles(this.currentPreset.initialConfig, this.particleCount)
      this.frameCount = 0
      this.fps = 0
    },
    start() {
      if (this.isRunning || !this.engine) return
      this.isRunning = true
      this._lastTime = performance.now()
      this._fpsAccum = 0
      this._fpsFrames = 0
      const loop = (now: number) => {
        if (!this.isRunning || !this.engine) return
        const elapsed = now - this._lastTime
        this._lastTime = now
        this._fpsAccum += elapsed
        this._fpsFrames++
        if (this._fpsAccum >= 500) {
          this.fps = Math.round(this._fpsFrames / (this._fpsAccum / 1000))
          this._fpsAccum = 0
          this._fpsFrames = 0
        }
        const subSteps = 3
        for (let s = 0; s < subSteps; s++) {
          this.engine.step()
        }
        this.frameCount++
        this._animId = requestAnimationFrame(loop)
      }
      this._animId = requestAnimationFrame(loop)
    },
    stop() {
      this.isRunning = false
      if (this._animId !== null) {
        cancelAnimationFrame(this._animId)
        this._animId = null
      }
    },
    reset() {
      this.stop()
      this.initSimulation(this.currentPreset)
    },
    stepOnce() {
      if (!this.engine || this.isRunning) return
      const subSteps = 3
      for (let s = 0; s < subSteps; s++) {
        this.engine.step()
      }
      this.frameCount++
    },
    updateParam(key: keyof SimParams, value: number) {
      this.params[key] = value
      if (this.engine) {
        this.engine.params[key] = value
        if (key === 'smoothingRadius') {
          this.engine['cellSize'] = value
        }
      }
    },
    setCamera(camera: CameraView) {
      this.camera = { ...camera }
    },
    resetCamera() {
      this.camera = { scale: 1, offsetX: 0, offsetY: 0 }
    },
    enterLectureMode(sceneIndex: number = 0) {
      this.stop()
      this._clearStepTimer()
      this.lectureMode = true
      this.currentSceneIndex = sceneIndex
      this.currentStepIndex = 0
      this.resetCamera()
      this._applyStep()
    },
    exitLectureMode() {
      this._clearStepTimer()
      this.lectureMode = false
      this.currentSceneIndex = 0
      this.currentStepIndex = 0
      this.stepProgress = 0
      this.currentHighlight = 'none'
      this.resetCamera()
    },
    goToStep(stepIndex: number) {
      const scene = LECTURE_SCENES[this.currentSceneIndex]
      if (!scene) return
      if (stepIndex < 0 || stepIndex >= scene.steps.length) return
      this._clearStepTimer()
      this.currentStepIndex = stepIndex
      this._applyStep()
    },
    nextStep() {
      if (this.isLastStep) return
      this.goToStep(this.currentStepIndex + 1)
    },
    prevStep() {
      if (this.isFirstStep) return
      this.goToStep(this.currentStepIndex - 1)
    },
    selectLectureScene(sceneIndex: number) {
      if (sceneIndex < 0 || sceneIndex >= LECTURE_SCENES.length) return
      this.stop()
      this._clearStepTimer()
      this.currentSceneIndex = sceneIndex
      this.currentStepIndex = 0
      this.resetCamera()
      this._applyStep()
    },
    _applyStep() {
      const step = this.currentStep
      if (!step) return

      if (step.presetName) {
        const preset = PRESETS.find(p => p.name === step.presetName)
        if (preset) {
          this.initSimulation(preset)
        }
      }

      if (step.paramChanges) {
        for (const [key, value] of Object.entries(step.paramChanges)) {
          this.updateParam(key as keyof SimParams, value as number)
        }
      }

      if (step.camera) {
        this.setCamera(step.camera)
      }

      if (step.highlight) {
        this.currentHighlight = step.highlight
      }

      if (step.startPaused) {
        this.stop()
      } else {
        this.start()
      }

      this.stepProgress = 0
      this.stepStartTime = performance.now()
      this._startStepTimer()
    },
    _startStepTimer() {
      this._clearStepTimer()
      const step = this.currentStep
      if (!step) return

      const updateProgress = () => {
        const elapsed = performance.now() - this.stepStartTime
        this.stepProgress = Math.min(elapsed / step.duration, 1)
        if (this.stepProgress < 1) {
          this._progressAnimId = requestAnimationFrame(updateProgress)
        }
      }
      updateProgress()

      if (step.autoAdvance && !this.isLastStep) {
        this.stepTimer = setTimeout(() => {
          if (!this.isLastStep) {
            this.nextStep()
          }
        }, step.duration)
      }
    },
    _clearStepTimer() {
      if (this.stepTimer !== null) {
        clearTimeout(this.stepTimer)
        this.stepTimer = null
      }
      if (this._progressAnimId !== null) {
        cancelAnimationFrame(this._progressAnimId)
        this._progressAnimId = null
      }
      this.stepProgress = 0
    },
  },
})
