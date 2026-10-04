import { ScriptToVideoRequest, ScriptToVideoJob, ScriptScene } from '../types/scriptToVideo';

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }
  return payload as T;
}

export async function planScriptToVideo(request: ScriptToVideoRequest): Promise<ScriptToVideoJob> {
  const { job } = await postJson<{ job: ScriptToVideoJob }>('/api/script-to-video/plan', request);
  return job;
}

export async function generateScene(
  jobId: string,
  sceneId: string,
  customPrompt?: string
): Promise<{ job: ScriptToVideoJob; scene: ScriptScene }> {
  return postJson<{ job: ScriptToVideoJob; scene: ScriptScene }>('/api/script-to-video/generate-scene', {
    jobId,
    sceneId,
    customPrompt,
  });
}

export async function combineGeneratedScenes(jobId: string): Promise<ScriptToVideoJob> {
  const { job } = await postJson<{ job: ScriptToVideoJob }>('/api/script-to-video/combine', { jobId });
  return job;
}

export async function getScriptToVideoJob(jobId: string): Promise<ScriptToVideoJob> {
  const response = await fetch(`/api/script-to-video/jobs/${encodeURIComponent(jobId)}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Could not fetch job');
  }
  return payload.job as ScriptToVideoJob;
}

export async function loadDemoJob(): Promise<ScriptToVideoJob> {
  const { job } = await postJson<{ job: ScriptToVideoJob }>('/api/script-to-video/demo');
  return job;
}
