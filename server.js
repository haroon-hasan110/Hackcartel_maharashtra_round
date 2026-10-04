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

    for (const input of contract) {
      if (input.accepts === 'url') {
        const values = inputs[input.key] === undefined ? [] : (Array.isArray(inputs[input.key]) ? inputs[input.key] : [inputs[input.key]]);
        if (values.some((value) => typeof value !== 'string' || !value.startsWith('https://'))) {
          response.status(400).json({ error: `${input.title || input.key} must be a public HTTPS URL.` });
          return;
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
        inputs,
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
