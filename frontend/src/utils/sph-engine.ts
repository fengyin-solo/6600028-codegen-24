import type { Particle, SimParams, Preset, LectureScene } from '../types'

export const DEFAULT_PARAMS: SimParams = {
  gravity: 9.8,
  viscosity: 1.0,
  restDensity: 1000,
  gasConstant: 2000,
  smoothingRadius: 16,
  particleMass: 2.5,
  dt: 0.004,
  damping: 0.5,
  boundaryStiffness: 10000,
}

export const PRESETS: Preset[] = [
  {
    name: 'dam',
    label: '溃坝模拟',
    description: '左侧水体突然释放，观察水流冲击和扩散',
    params: { gravity: 9.8, viscosity: 1.0, gasConstant: 2000, smoothingRadius: 16 },
    particleCount: 800,
    initialConfig: 'dam',
  },
  {
    name: 'drop',
    label: '水滴下落',
    description: '圆形水滴从高处自由落体，撞击底部表面',
    params: { gravity: 12.0, viscosity: 0.8, gasConstant: 1500, smoothingRadius: 14 },
    particleCount: 600,
    initialConfig: 'drop',
  },
  {
    name: 'fountain',
    label: '喷泉效果',
    description: '底部中心持续向上喷射粒子',
    params: { gravity: 8.0, viscosity: 1.2, gasConstant: 2500, smoothingRadius: 18 },
    particleCount: 1000,
    initialConfig: 'fountain',
  },
  {
    name: 'wave',
    label: '波浪运动',
    description: '正弦波初始分布，观察波浪传播和干涉',
    params: { gravity: 6.0, viscosity: 0.5, gasConstant: 1800, smoothingRadius: 15 },
    particleCount: 900,
    initialConfig: 'wave',
  },
]

export const LECTURE_SCENES: LectureScene[] = [
  {
    id: 'intro-sph',
    title: 'SPH 流体力学入门',
    description: '通过溃坝、水滴、喷泉和波浪四个经典场景，逐步理解光滑粒子流体动力学的核心概念',
    steps: [
      {
        id: 'intro-1',
        title: '场景一：溃坝模拟 — 初始状态',
        description: '这是经典的溃坝问题。左侧 1/3 区域充满静止的水粒子。点击"下一步"观察堤坝溃决后水流的运动。粒子颜色代表速度：蓝色=慢，绿色=中，红色=快。',
        presetName: 'dam',
        camera: { scale: 1, offsetX: 0, offsetY: 0 },
        duration: 6000,
        startPaused: true,
        highlight: 'particles',
        autoAdvance: false,
      },
      {
        id: 'intro-2',
        title: '溃坝模拟 — 水流冲击',
        description: '水流在重力作用下向右加速。可以看到前端形成的水跃现象，以及粒子碰撞边界后的反弹。注意高速运动的粒子呈现红色。',
        duration: 8000,
        highlight: 'velocity',
        autoAdvance: true,
      },
      {
        id: 'intro-3',
        title: '溃坝模拟 — 增大粘性',
        description: '现在将粘性系数从 1.0 提高到 4.0。粘性模拟流体的内摩擦，观察水流变得更加"粘稠"，粒子速度衰减更快，运动更加平缓。',
        paramChanges: { viscosity: 4.0 },
        duration: 6000,
        highlight: 'velocity',
        autoAdvance: true,
      },
      {
        id: 'intro-4',
        title: '场景二：水滴下落 — 自由落体',
        description: '切换到水滴场景。一团圆形的水从高空自由下落。高重力参数（12）模拟快速下落效果。',
        presetName: 'drop',
        camera: { scale: 1, offsetX: 0, offsetY: 0 },
        duration: 6000,
        highlight: 'particles',
        autoAdvance: true,
      },
      {
        id: 'intro-5',
        title: '水滴下落 — 撞击与飞溅',
        description: '观察水滴撞击底部后的飞溅效果。粒子向四周扩散，形成水波纹。边界反弹力模拟了固体壁面的约束作用。',
        duration: 8000,
        highlight: 'velocity',
        autoAdvance: true,
      },
      {
        id: 'intro-6',
        title: '场景三：喷泉效果 — 持续喷射',
        description: '喷泉场景展示粒子从底部持续向上喷射。初始速度赋予粒子向上的动能，重力则将它们拉回，形成优美的抛物线轨迹。',
        presetName: 'fountain',
        camera: { scale: 1, offsetX: 0, offsetY: 0 },
        duration: 8000,
        highlight: 'velocity',
        autoAdvance: true,
      },
      {
        id: 'intro-7',
        title: '喷泉效果 — 改变重力',
        description: '将重力从 8.0 降到 3.0，模拟月球重力环境。喷泉喷得更高、更慢，粒子在空中停留时间更长，呈现出轻盈飘逸的效果。',
        paramChanges: { gravity: 3.0 },
        duration: 8000,
        highlight: 'velocity',
        autoAdvance: true,
      },
      {
        id: 'intro-8',
        title: '场景四：波浪运动 — 正弦波传播',
        description: '最后观察波浪场景。初始粒子按正弦波分布。低粘性（0.5）让波浪能够传播更远而不快速衰减，观察波峰和波谷的运动。',
        presetName: 'wave',
        camera: { scale: 1, offsetX: 0, offsetY: 0 },
        duration: 10000,
        highlight: 'density',
        autoAdvance: true,
      },
      {
        id: 'intro-9',
        title: '总结：SPH 的核心思想',
        description: 'SPH 将流体离散为大量粒子，每个粒子携带质量、速度、密度等属性。通过核函数（Kernel）计算邻近粒子的相互作用：Poly6 核计算密度，Spiky 核计算压力，粘性核计算内摩擦力。这就是我们看到的这些美丽流体现象背后的数学原理！',
        duration: 10000,
        startPaused: true,
        highlight: 'none',
        autoAdvance: false,
      },
    ],
  },
  {
    id: 'param-deep-dive',
    title: '参数深入探究',
    description: '逐个调节 SPH 模拟的关键参数，直观理解每个参数对流体行为的影响',
    steps: [
      {
        id: 'param-1',
        title: '基准场景 — 标准溃坝',
        description: '以标准溃坝场景为基准。默认参数：重力=9.8，粘性=1.0，光滑半径=16。接下来我们逐个改变参数，对比观察效果差异。',
        presetName: 'dam',
        camera: { scale: 1, offsetX: 0, offsetY: 0 },
        duration: 6000,
        startPaused: true,
        highlight: 'particles',
        autoAdvance: false,
      },
      {
        id: 'param-2',
        title: '重力参数 — 零重力环境',
        description: '将重力设为 0。粒子保持初始静止状态，没有外力驱动。这就像太空中的水球，不会自然流动。',
        paramChanges: { gravity: 0 },
        duration: 5000,
        highlight: 'velocity',
        autoAdvance: true,
      },
      {
        id: 'param-3',
        title: '重力参数 — 超重力',
        description: '将重力提高到 20（约 2G）。水流加速更快，冲击更猛烈，水花更高。这模拟了在强重力行星上的流体行为。',
        paramChanges: { gravity: 20 },
        duration: 6000,
        highlight: 'velocity',
        autoAdvance: true,
      },
      {
        id: 'param-4',
        title: '重置为基准 — 低粘性',
        description: '回到基准参数，现在关注粘性。当前粘性=0.2（接近水的低粘性），流体流动性好，粒子运动自由。',
        presetName: 'dam',
        paramChanges: { viscosity: 0.2 },
        duration: 5000,
        highlight: 'velocity',
        autoAdvance: true,
      },
      {
        id: 'param-5',
        title: '粘性参数 — 高粘性（蜂蜜）',
        description: '将粘性提高到 5.0，模拟蜂蜜或糖浆等高粘度流体。流动变得极其缓慢，粒子之间仿佛被"粘"在一起，整体运动更加连贯。',
        paramChanges: { viscosity: 5.0 },
        duration: 8000,
        highlight: 'velocity',
        autoAdvance: true,
      },
      {
        id: 'param-6',
        title: '重置为基准 — 光滑半径',
        description: '回到基准参数。光滑半径决定了粒子之间的"作用范围"。当前光滑半径=16，是标准值。',
        presetName: 'dam',
        duration: 5000,
        highlight: 'density',
        autoAdvance: true,
      },
      {
        id: 'param-7',
        title: '光滑半径 — 小范围（稀疏粒子）',
        description: '将光滑半径缩小到 10。每个粒子只与非常近的邻居相互作用，流体显得更加"颗粒化"和不稳定，可能出现粒子穿透现象。',
        paramChanges: { smoothingRadius: 10 },
        duration: 6000,
        highlight: 'density',
        autoAdvance: true,
      },
      {
        id: 'param-8',
        title: '光滑半径 — 大范围（连贯流体）',
        description: '将光滑半径增大到 30。每个粒子影响更多邻居，流体显得更连贯、更"果冻状"，但计算量也更大。过大的光滑半径会让流体缺乏细节。',
        paramChanges: { smoothingRadius: 30 },
        duration: 6000,
        highlight: 'density',
        autoAdvance: true,
      },
      {
        id: 'param-9',
        title: '总结：参数调节的艺术',
        description: '重力控制整体加速度，粘性控制能量耗散速度，光滑半径控制粒子相互作用范围。这三个参数的微妙平衡，决定了流体是像水、蜂蜜还是果冻！',
        duration: 8000,
        startPaused: true,
        highlight: 'none',
        autoAdvance: false,
      },
    ],
  },
]

// SPH Kernel constants
const PI = Math.PI

// Poly6 kernel for density computation
function poly6(r: number, h: number): number {
  if (r >= h) return 0
  const h2 = h * h
  const r2 = r * r
  const coeff = 315 / (64 * PI * Math.pow(h, 9))
  return coeff * Math.pow(h2 - r2, 3)
}

// Spiky kernel gradient for pressure force
function spikyGrad(r: number, h: number): number {
  if (r >= h || r < 1e-6) return 0
  const coeff = -45 / (PI * Math.pow(h, 6))
  return coeff * Math.pow(h - r, 2)
}

// Viscosity kernel Laplacian for viscosity force
function viscosityLaplacian(r: number, h: number): number {
  if (r >= h) return 0
  const coeff = 45 / (PI * Math.pow(h, 6))
  return coeff * (h - r)
}

export class SPHEngine {
  particles: Particle[] = []
  params: SimParams
  width: number
  height: number
  private grid: Map<number, number[]> = new Map()
  private cellSize: number = 0

  constructor(count: number, width: number, height: number, params?: Partial<SimParams>) {
    this.width = width
    this.height = height
    this.params = { ...DEFAULT_PARAMS, ...params }
    this.cellSize = this.params.smoothingRadius
  }

  initParticles(config: 'dam' | 'drop' | 'fountain' | 'wave', count?: number) {
    const n = count ?? this.particles.length || 800
    this.particles = []

    switch (config) {
      case 'dam': {
        // Particles in left 1/3, full height
        const spacing = 8
        const cols = Math.floor(this.width / 3 / spacing)
        const rows = Math.floor(this.height / spacing) - 2
        let placed = 0
        for (let j = 0; j < rows && placed < n; j++) {
          for (let i = 0; i < cols && placed < n; i++) {
            this.particles.push(this.createParticle(
              20 + i * spacing + (Math.random() - 0.5) * 2,
              10 + j * spacing + (Math.random() - 0.5) * 2
            ))
            placed++
          }
        }
        break
      }
      case 'drop': {
        // Circular blob at top center
        const cx = this.width / 2
        const cy = this.height * 0.25
        const radius = Math.sqrt(n) * 4
        let placed = 0
        for (let j = -radius; j < radius && placed < n; j += 6) {
          for (let i = -radius; i < radius && placed < n; i += 6) {
            if (i * i + j * j < radius * radius) {
              this.particles.push(this.createParticle(
                cx + i + (Math.random() - 0.5) * 2,
                cy + j + (Math.random() - 0.5) * 2
              ))
              placed++
            }
          }
        }
        // Fill remaining randomly within the circle
        while (this.particles.length < n) {
          const angle = Math.random() * 2 * PI
          const r = Math.sqrt(Math.random()) * radius
          this.particles.push(this.createParticle(
            cx + r * Math.cos(angle),
            cy + r * Math.sin(angle)
          ))
        }
        break
      }
      case 'fountain': {
        // Emit from bottom center
        const cx = this.width / 2
        for (let i = 0; i < n; i++) {
          const spread = 30
          const p = this.createParticle(
            cx + (Math.random() - 0.5) * spread,
            this.height - 20 - Math.random() * 30
          )
          p.vy = -80 - Math.random() * 60
          p.vx = (Math.random() - 0.5) * 40
          this.particles.push(p)
        }
        break
      }
      case 'wave': {
        // Sine wave pattern
        const spacing = 7
        const cols = Math.floor(this.width * 0.8 / spacing)
        const rows = Math.floor(n / cols)
        let placed = 0
        for (let i = 0; i < cols && placed < n; i++) {
          const waveHeight = 40 * Math.sin((i / cols) * 2 * PI)
          for (let j = 0; j < rows + 5 && placed < n; j++) {
            const x = this.width * 0.1 + i * spacing
            const y = this.height * 0.5 + waveHeight + j * spacing
            if (y < this.height - 5) {
              this.particles.push(this.createParticle(x, y))
              placed++
            }
          }
        }
        while (this.particles.length < n) {
          this.particles.push(this.createParticle(
            Math.random() * this.width * 0.8 + this.width * 0.1,
            Math.random() * this.height * 0.4 + this.height * 0.3
          ))
        }
        break
      }
    }
  }

  private createParticle(x: number, y: number): Particle {
    return { x, y, vx: 0, vy: 0, density: 0, pressure: 0, fx: 0, fy: 0 }
  }

  private buildGrid() {
    this.grid.clear()
    this.cellSize = this.params.smoothingRadius
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]
      const cx = Math.floor(p.x / this.cellSize)
      const cy = Math.floor(p.y / this.cellSize)
      const key = cx * 10000 + cy
      const cell = this.grid.get(key)
      if (cell) {
        cell.push(i)
      } else {
        this.grid.set(key, [i])
      }
    }
  }

  private getNeighbors(px: number, py: number): number[] {
    const result: number[] = []
    const cx = Math.floor(px / this.cellSize)
    const cy = Math.floor(py / this.cellSize)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = (cx + dx) * 10000 + (cy + dy)
        const cell = this.grid.get(key)
        if (cell) {
          for (const idx of cell) {
            result.push(idx)
          }
        }
      }
    }
    return result
  }

  step() {
    const { gravity, viscosity, restDensity, gasConstant, smoothingRadius, particleMass, dt, damping } = this.params
    const h = smoothingRadius
    const m = particleMass
    const n = this.particles.length

    // Step 1: Build spatial hash grid
    this.buildGrid()

    // Step 2: Compute density for each particle
    for (let i = 0; i < n; i++) {
      const pi = this.particles[i]
      let density = 0
      const neighbors = this.getNeighbors(pi.x, pi.y)
      for (const j of neighbors) {
        const pj = this.particles[j]
        const dx = pi.x - pj.x
        const dy = pi.y - pj.y
        const r = Math.sqrt(dx * dx + dy * dy)
        density += m * poly6(r, h)
      }
      pi.density = Math.max(density, restDensity * 0.1)
      // Step 3: Compute pressure
      pi.pressure = gasConstant * (pi.density - restDensity)
    }

    // Step 4-5: Compute forces (pressure + viscosity)
    for (let i = 0; i < n; i++) {
      const pi = this.particles[i]
      let fpx = 0, fpy = 0
      let fvx = 0, fvy = 0

      const neighbors = this.getNeighbors(pi.x, pi.y)
      for (const j of neighbors) {
        if (i === j) continue
        const pj = this.particles[j]
        const dx = pi.x - pj.x
        const dy = pi.y - pj.y
        const r = Math.sqrt(dx * dx + dy * dy)
        if (r < 1e-6 || r >= h) continue

        // Direction unit vector
        const nx = dx / r
        const ny = dy / r

        // Pressure force (Spiky gradient)
        const pressureForce = -m * (pi.pressure + pj.pressure) / (2 * pj.density) * spikyGrad(r, h)
        fpx += pressureForce * nx
        fpy += pressureForce * ny

        // Viscosity force (Laplacian)
        const viscForce = viscosity * m / pj.density * viscosityLaplacian(r, h)
        fvx += viscForce * (pj.vx - pi.vx)
        fvy += viscForce * (pj.vy - pi.vy)
      }

      // Step 6: Sum forces + gravity
      pi.fx = fpx + fvx
      pi.fy = fpy + fvy + pi.density * gravity * 10  // gravity scaled
    }

    // Step 7: Update velocity + position (Symplectic Euler)
    for (let i = 0; i < n; i++) {
      const p = this.particles[i]
      const ax = p.fx / p.density
      const ay = p.fy / p.density
      p.vx += ax * dt
      p.vy += ay * dt
      p.x += p.vx * dt
      p.y += p.vy * dt

      // Step 8: Boundary collision
      const margin = 5
      if (p.x < margin) {
        p.x = margin
        p.vx = Math.abs(p.vx) * damping
      }
      if (p.x > this.width - margin) {
        p.x = this.width - margin
        p.vx = -Math.abs(p.vx) * damping
      }
      if (p.y < margin) {
        p.y = margin
        p.vy = Math.abs(p.vy) * damping
      }
      if (p.y > this.height - margin) {
        p.y = this.height - margin
        p.vy = -Math.abs(p.vy) * damping
      }
    }
  }

  applyImpulse(x: number, y: number, strength: number) {
    const radius = 80
    for (const p of this.particles) {
      const dx = p.x - x
      const dy = p.y - y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < radius && dist > 0.1) {
        const factor = strength * (1 - dist / radius)
        p.vx += (dx / dist) * factor
        p.vy += (dy / dist) * factor
      }
    }
  }
}
