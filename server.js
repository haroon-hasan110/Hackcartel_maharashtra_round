import dotenv from 'dotenv';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(root, '.env.local') });
dotenv.config({ path: path.join(root, '.env') });
const app = express();
const port = Number(process.env.PORT || 3000);
const production = process.argv.includes('--production') || process.env.NODE_ENV === 'production';
const morphicBaseUrl = process.env.MORPHIC_BASE_URL || 'https://api.morphic.com/v1/partner';
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const authClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

app.use(express.json({ limit: '1mb' }));

function morphicConfiguration() {
  const missing = ['MORPHIC_API_KEY', 'MORPHIC_ORG_ID', 'MORPHIC_PROJECT_ID', 'MORPHIC_WORKFLOW_ID']
    .filter((name) => !process.env[name]?.trim());
  return { configured: missing.length === 0, missing };
}

function morphicWorkflowId() {
  return process.env.MORPHIC_WORKFLOW_ID.trim().replace(/^WF-/i, '');
}

function requireMorphicConfig(_request, response, next) {
  const config = morphicConfiguration();
  if (!config.configured) {
    response.status(503).json({
      error: 'Morphic is not configured on this server.',
      missing: config.missing,
    });
    return;
  }
  next();
}

async function requireSignedInUser(request, response, next) {
  if (!production) {
    next();
    return;
  }
  if (!authClient) {
    response.status(503).json({ error: 'Supabase authentication must be configured before enabling Morphic in production.' });
    return;
  }
  const token = request.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    response.status(401).json({ error: 'Sign in before using Morphic generation.' });
    return;
  }
  try {
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) {
      response.status(401).json({ error: 'Your session is invalid or expired. Sign in again.' });
      return;
    }
    next();
  } catch {
    response.status(503).json({ error: 'Could not verify your session. Try again.' });
  }
}

async function morphicRequest(endpoint, options = {}) {
  const response = await fetch(`${morphicBaseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.MORPHIC_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.description
      || payload.error?.user_readable_message
      || payload.error?.error_code
      || (typeof payload.error === 'string' ? payload.error : null)
      || payload.message
      || `Morphic request failed (${response.status}).`;
    const error = new Error(message);
    error.statusCode = response.status;
    if (/project not found/i.test(message)) {
      error.hint = 'Use the canvas project id from your Morphic Studio editor URL (…/editor/<project_id>/canvas), not the id from /projects/….';
    }
    throw error;
  }
  return payload;
}

app.get('/api/morphic/config', (_request, response) => {
  response.json(morphicConfiguration());
});

app.get('/api/morphic/workflow-inputs', requireSignedInUser, requireMorphicConfig, async (_request, response) => {
  try {
    const workflowId = encodeURIComponent(morphicWorkflowId());
    const payload = await morphicRequest(`/workflows/${workflowId}/inputs`);
    response.json(payload);
  } catch (error) {
    response.status(error.statusCode || 502).json({
      error: error.message || 'Could not read the Morphic workflow.',
      hint: error.hint,
    });
  }
});

async function convertTextToHttpsUrl(scriptText) {
  if (typeof scriptText !== 'string' || !scriptText.trim()) return scriptText;
  if (scriptText.trim().startsWith('https://') || scriptText.trim().startsWith('http://')) {
    return scriptText.trim();
  }
  try {
    const res = await fetch('https://dpaste.org/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ content: scriptText, format: 'url', expiry: '1' })
    });
    if (!res.ok) throw new Error(`Text host returned ${res.status}`);
    const rawUrl = (await res.text()).trim() + '/raw';
    return rawUrl;
  } catch (err) {
    console.error('Failed to convert text script to HTTPS URL:', err);
    throw new Error('Could not host plain text script. Please try again.');
  }
}

app.post('/api/morphic/runs', requireSignedInUser, requireMorphicConfig, async (request, response) => {
  const inputs = request.body?.inputs;
  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) {
    response.status(400).json({ error: 'Provide workflow inputs as an object.' });
    return;
  }

  try {
    const workflowId = encodeURIComponent(morphicWorkflowId());
    const { workflow, inputs: contract } = await morphicRequest(`/workflows/${workflowId}/inputs`);
    const missingInput = contract.find((input) => input.required && inputs[input.key] === undefined && input.default_value === undefined);
    if (missingInput) {
      response.status(400).json({ error: `Complete the required field: ${missingInput.title || missingInput.key}.` });
      return;
    }

    const processedInputs = { ...inputs };
    for (const input of contract) {
      const rawValue = processedInputs[input.key];
      if (input.accepts === 'url') {
        if (typeof rawValue === 'string' && rawValue.trim() && !rawValue.trim().startsWith('https://') && !rawValue.trim().startsWith('http://')) {
          // Plain text script provided! Convert to public HTTPS URL with text/plain Content-Type
          processedInputs[input.key] = await convertTextToHttpsUrl(rawValue);
        } else if (rawValue !== undefined && rawValue !== '') {
          const values = Array.isArray(rawValue) ? rawValue : [rawValue];
          if (values.some((value) => typeof value !== 'string' || !value.startsWith('https://'))) {
            response.status(400).json({ error: `${input.title || input.key} must be valid text or a public HTTPS URL.` });
            return;
          }
        }
      }
    }

    const payload = await morphicRequest('/workflow-runs', {
      method: 'POST',
      body: JSON.stringify({
        org_id: process.env.MORPHIC_ORG_ID.trim(),
        project_id: process.env.MORPHIC_PROJECT_ID.trim(),
        workflow_id: morphicWorkflowId(),
        workflow_version_id: workflow.version_id,
        idempotency_key: request.body?.idempotencyKey || randomUUID(),
        inputs: processedInputs,
      }),
    });
    response.status(202).json(payload);
  } catch (error) {
    response.status(error.statusCode || 502).json({
      error: error.message || 'Could not start the Morphic workflow.',
      hint: error.hint,
    });
  }
});

app.get('/api/morphic/runs/:runId', requireSignedInUser, requireMorphicConfig, async (request, response) => {
  try {
    const runId = encodeURIComponent(request.params.runId);
    const payload = await morphicRequest(`/workflow-runs/${runId}?wait=45`);
    response.json(payload);
  } catch (error) {
    response.status(error.statusCode || 502).json({
      error: error.message || 'Could not read the Morphic run.',
      hint: error.hint,
    });
  }
});

// ============================================================================
// Script to Video Pipeline Service
// ============================================================================
const scriptToVideoJobs = new Map();

const SAMPLE_SCENE_VIDEOS_916 = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://vjs.zencdn.net/v/oceans.mp4',
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4',
];

const SAMPLE_SCENE_VIDEOS_169 = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://vjs.zencdn.net/v/oceans.mp4',
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4',
];

function planScenesFromScript(scriptText, visualDirection = '', aspectRatio = '9:16') {
  const cleaned = scriptText.trim();
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  let chunks = [];
  if (sentences.length <= 3) {
    chunks = sentences.length ? sentences : [cleaned];
  } else if (sentences.length === 4) {
    chunks = [sentences[0], sentences[1], `${sentences[2]} ${sentences[3]}`];
  } else {
    const chunkSize = Math.ceil(sentences.length / 4);
    for (let i = 0; i < sentences.length; i += chunkSize) {
      chunks.push(sentences.slice(i, i + chunkSize).join(' '));
    }
    if (chunks.length > 5) chunks = chunks.slice(0, 5);
  }

  const defaultStyles = visualDirection || 'Cinematic lighting, modern studio aesthetic, vibrant color palette, 4K quality';
  const cameras = ['Cinematic slow zoom', 'Dynamic tracking shot', 'Medium close-up Panning', 'High angle wide shot', 'Slow push-in focus'];
  const lightings = ['Warm studio key light', 'Dramatic rim lighting', 'Soft natural window glow', 'Neon accent backlight'];
  const transitions = ['Fade to next', 'Cut to action', 'Cross dissolve', 'Match cut'];

  const scenes = chunks.map((narrative, index) => {
    const sceneNum = String(index + 1).padStart(2, '0');
    const camera = cameras[index % cameras.length];
    const lighting = lightings[index % lightings.length];
    const transition = transitions[index % transitions.length];

    const visualPrompt = `${defaultStyles}. ${camera}. ${lighting}. Narrative: "${narrative}". Aspect ratio: ${aspectRatio}. Consistent character and environment styling.`;

    return {
      id: `scene_${sceneNum}`,
      sceneIndex: index + 1,
      duration: 8,
      narrative,
      visualPrompt,
      camera,
      lighting,
      audioDirection: 'Ambient background score with subtle voice narration track',
      transition,
      status: 'queued',
      videoUrl: undefined,
    };
  });

  return {
    title: cleaned.slice(0, 40) + (cleaned.length > 40 ? '...' : ''),
    style: defaultStyles,
    scenes,
  };
}

app.post('/api/script-to-video/plan', async (request, response) => {
  const { script, visualDirection, aspectRatio = '9:16', referenceImageUrl } = request.body || {};

  if (!script || typeof script !== 'string' || !script.trim()) {
    response.status(400).json({ error: 'Please enter a script first.' });
    return;
  }

  if (script.trim().length < 10) {
    response.status(400).json({ error: 'Script is too short. Please enter at least a complete sentence.' });
    return;
  }

  const validRatios = ['9:16', '16:9', '1:1'];
  const ratio = validRatios.includes(aspectRatio) ? aspectRatio : '9:16';

  const plan = planScenesFromScript(script, visualDirection, ratio);
  const jobId = `stv_job_${randomUUID()}`;

  const job = {
    id: jobId,
    script: script.trim(),
    visualDirection: visualDirection?.trim() || '',
    aspectRatio: ratio,
    referenceImageUrl: referenceImageUrl?.trim() || '',
    title: plan.title,
    style: plan.style,
    status: 'PLANNING',
    scenes: plan.scenes,
    currentSceneIndex: 0,
    totalDuration: plan.scenes.length * 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  scriptToVideoJobs.set(jobId, job);
  response.status(201).json({ job });
});

app.post('/api/script-to-video/generate-scene', async (request, response) => {
  const { jobId, sceneId, customPrompt } = request.body || {};

  if (!jobId || !sceneId) {
    response.status(400).json({ error: 'Provide jobId and sceneId.' });
    return;
  }

  const job = scriptToVideoJobs.get(jobId);
  if (!job) {
    response.status(404).json({ error: 'Script to Video job not found.' });
    return;
  }

  const sceneIndex = job.scenes.findIndex((s) => s.id === sceneId);
  if (sceneIndex === -1) {
    response.status(404).json({ error: 'Scene not found.' });
    return;
  }

  const scene = job.scenes[sceneIndex];
  if (customPrompt) {
    scene.visualPrompt = customPrompt.trim();
  }

  scene.status = 'generating';
  job.status = 'GENERATING';
  job.currentSceneIndex = sceneIndex;
  job.updatedAt = new Date().toISOString();

  const pool = job.aspectRatio === '16:9' ? SAMPLE_SCENE_VIDEOS_169 : SAMPLE_SCENE_VIDEOS_916;
  const videoUrl = pool[sceneIndex % pool.length];

  scene.videoUrl = videoUrl;
  scene.status = 'ready';

  const allReady = job.scenes.every((s) => s.status === 'ready');
  if (allReady) {
    job.status = 'COMBINING';
  }

  job.updatedAt = new Date().toISOString();
  response.json({ job, scene });
});

app.post('/api/script-to-video/combine', async (request, response) => {
  const { jobId } = request.body || {};
  const job = scriptToVideoJobs.get(jobId);

  if (!job) {
    response.status(404).json({ error: 'Job not found.' });
    return;
  }

  const unready = job.scenes.filter((s) => s.status !== 'ready');
  if (unready.length > 0) {
    response.status(400).json({ error: 'All scenes must be generated before combining.' });
    return;
  }

  job.finalVideoUrl = job.scenes[0].videoUrl;
  job.status = 'READY';
  job.updatedAt = new Date().toISOString();

  response.json({ job });
});

app.get('/api/script-to-video/jobs/:jobId', (request, response) => {
  const job = scriptToVideoJobs.get(request.params.jobId);
  if (!job) {
    response.status(404).json({ error: 'Job not found.' });
    return;
  }
  response.json({ job });
});

app.post('/api/script-to-video/demo', (_request, response) => {
  const demoScript = `AI is changing the way small teams build products. Instead of hiring large departments, small teams can now use intelligent tools to research, design, build, and launch faster.`;
  const plan = planScenesFromScript(demoScript, 'Modern tech studio, warm cinematic lighting, 4K', '9:16');
  const jobId = `stv_job_demo_${randomUUID().slice(0, 8)}`;

  const pool = SAMPLE_SCENE_VIDEOS_916;
  plan.scenes.forEach((scene, idx) => {
    scene.status = 'ready';
    scene.videoUrl = pool[idx % pool.length];
  });

  const job = {
    id: jobId,
    script: demoScript,
    visualDirection: 'Modern tech studio, warm cinematic lighting, 4K',
    aspectRatio: '9:16',
    referenceImageUrl: '',
    title: 'AI Product Building Revolution',
    style: 'Modern tech studio, warm cinematic lighting, 4K',
    status: 'READY',
    scenes: plan.scenes,
    currentSceneIndex: plan.scenes.length - 1,
    finalVideoUrl: plan.scenes[0].videoUrl,
    totalDuration: plan.scenes.length * 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  scriptToVideoJobs.set(jobId, job);
  response.json({ job });
});

if (production) {
  app.use(express.static(path.join(root, 'dist')));
  app.get('*', (_request, response) => response.sendFile(path.join(root, 'dist', 'index.html')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    configFile: path.join(root, 'vite.config.ts'),
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  app.get('*', async (_request, response, next) => {
    try {
      const html = await readFile(path.join(root, 'index.html'), 'utf8');
      response.status(200).type('html').send(await vite.transformIndexHtml('/', html));
    } catch (error) {
      next(error);
    }
  });
}

app.listen(port, process.env.HOST || (production ? '0.0.0.0' : '127.0.0.1'), () => {
  console.log(`CreatorAI ${production ? 'server' : 'dev server'} listening on http://localhost:${port}`);
});
