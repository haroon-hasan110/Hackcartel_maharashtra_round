import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(root, '..', '.env.local') });
dotenv.config({ path: path.join(root, '..', '.env') });

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const required = ['MORPHIC_API_KEY', 'MORPHIC_ORG_ID', 'MORPHIC_PROJECT_ID', 'MORPHIC_WORKFLOW_ID'];

function fail(message) {
  console.error(`Morphic smoke test failed: ${message}`);
  process.exit(1);
}

async function readJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    fail(`${response.url} returned ${response.status}: ${payload.error || JSON.stringify(payload)}`);
  }
  return payload;
}

const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  fail(`Missing env: ${missing.join(', ')} (set them in .env.local)`);
}

const config = await readJson(await fetch(`${baseUrl}/api/morphic/config`));
if (!config.configured) {
  fail(`Server reports Morphic is not configured: ${(config.missing || []).join(', ')}`);
}

const schema = await readJson(await fetch(`${baseUrl}/api/morphic/workflow-inputs`));
const workflowName = schema.workflow?.name || schema.workflow?.id || 'unknown';
const inputKeys = (schema.inputs || []).map((input) => input.key).join(', ') || '(none)';
console.log(`Morphic smoke OK: workflow "${workflowName}" with inputs ${inputKeys}`);
