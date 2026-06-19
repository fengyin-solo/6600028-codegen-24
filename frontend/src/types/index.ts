export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  density: number;
  pressure: number;
  fx: number;
  fy: number;
}

export interface SimParams {
  gravity: number;
  viscosity: number;
  restDensity: number;
  gasConstant: number;
  smoothingRadius: number;
  particleMass: number;
  dt: number;
  damping: number;
  boundaryStiffness: number;
}

export interface Preset {
  name: string;
  label: string;
  description: string;
  params: Partial<SimParams>;
  particleCount: number;
  initialConfig: 'dam' | 'drop' | 'fountain' | 'wave';
}

export interface CameraView {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface SceneStep {
  id: string;
  title: string;
  description: string;
  presetName?: string;
  paramChanges?: Partial<SimParams>;
  camera?: CameraView;
  duration: number;
  startPaused?: boolean;
  highlight?: 'particles' | 'density' | 'velocity' | 'pressure' | 'none';
  autoAdvance?: boolean;
}

export interface LectureScene {
  id: string;
  title: string;
  description: string;
  steps: SceneStep[];
}
