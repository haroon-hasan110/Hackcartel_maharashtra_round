export type AspectRatio = '16:9' | '9:16' | '1:1';

export type ScriptToVideoRequest = {
  script: string;
  visualDirection?: string;
  aspectRatio: AspectRatio;
  referenceImageUrl?: string;
};

export type ScriptScene = {
  id: string;
  sceneIndex: number;
  duration: number;
  narrative: string;
  visualPrompt: string;
  camera?: string;
  lighting?: string;
  audioDirection?: string;
  transition?: string;
  status: 'queued' | 'generating' | 'ready' | 'failed';
  videoUrl?: string;
  error?: string;
};

export type ScriptToVideoJobStatus =
  | 'QUEUED'
  | 'PLANNING'
  | 'GENERATING'
  | 'COMBINING'
  | 'READY'
  | 'FAILED';

export type ScriptToVideoJob = {
  id: string;
  projectId?: string;
  script: string;
  visualDirection?: string;
  aspectRatio: AspectRatio;
  referenceImageUrl?: string;
  title: string;
  style: string;
  status: ScriptToVideoJobStatus;
  scenes: ScriptScene[];
  currentSceneIndex?: number;
  finalVideoUrl?: string;
  totalDuration?: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
};
