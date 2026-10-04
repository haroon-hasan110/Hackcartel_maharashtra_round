import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Clapperboard, Film, LoaderCircle, RefreshCw, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './morphicStudio.css';

interface WorkflowInput {
  key: string;
  title?: string;
  description?: string;
  accepts: 'value' | 'url' | 'option';
  type: string;
  required?: boolean;
  allow_multiple?: boolean;
  allowed_values?: string[];
  allow_custom?: boolean;
  options?: Array<{ id: string; label?: string; description?: string }>;
  default_value?: unknown;
  max_bytes?: number;
}

interface WorkflowSchema {
  workflow?: { id: string; name: string; version_id: string; credits_estimate?: number; duration_seconds_estimate?: number };
  inputs?: WorkflowInput[];
}

interface MorphicAsset {
  id: string;
  kind: 'video' | 'image' | 'audio' | 'document';
  mime_type?: string;
  duration_seconds?: number;
  url: string;
  url_expires_at?: string;
}

interface MorphicRun {
  id: string;
  status: string;
  workflow_id?: string;
  project_id?: string;
  chat_id?: string;
  poll_after_seconds?: number;
  assets?: MorphicAsset[];
  error?: { user_readable_message?: string; error_code?: string } | string | null;
  created_at?: string;
  completed_at?: string;
  credits_used?: number;
}

const storedRunKey = 'creatorai:morphic:last-run';
const terminalStatuses = new Set(['succeeded', 'failed', 'expired']);
const inputNeedsScript = (input: WorkflowInput) => /script|prompt|story|brief|idea|concept|narration/i.test(`${input.key} ${input.title || ''}`);

class MorphicRequestError extends Error {
  hint?: string;

  constructor(message: string, hint?: string) {
    super(message);
    this.name = 'MorphicRequestError';
    this.hint = hint;
  }
}

async function readJson(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new MorphicRequestError(payload.error || 'Morphic request failed.', payload.hint);
  }
  return payload;
}

async function morphicFetch(url: string, init: RequestInit = {}) {
  const sessionResult = supabase ? await supabase.auth.getSession() : null;
  const headers = new Headers(init.headers);
  const accessToken = sessionResult?.data.session?.access_token;
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  return fetch(url, { ...init, headers });
}

export const MorphicStudio: React.FC = () => {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [schema, setSchema] = useState<WorkflowSchema | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errorHint, setErrorHint] = useState('');
  const idempotencyRef = useRef<{ serializedInputs: string; key: string } | null>(null);
  const [run, setRun] = useState<MorphicRun | null>(() => {
    try {
      const stored = localStorage.getItem(storedRunKey);
      return stored ? (JSON.parse(stored) as MorphicRun) : null;
    } catch {
      return null;
    }
  });

  const scriptInput = useMemo(
    () => schema?.inputs?.find((input) => inputNeedsScript(input) && input.accepts === 'value')
      || schema?.inputs?.find((input) => input.accepts === 'value' && input.type === 'string'),
    [schema]
  );

  const loadWorkflow = async () => {
    setLoading(true);
    setError('');
    setErrorHint('');
    try {
      const config = await readJson(await morphicFetch('/api/morphic/config'));
      setConfigured(config.configured);
      setMissing(config.missing || []);
      if (!config.configured) {
        setSchema(null);
        return;
      }
      const result = await readJson(await morphicFetch('/api/morphic/workflow-inputs')) as WorkflowSchema;
      setSchema(result);
      const defaults: Record<string, unknown> = {};
      for (const input of result.inputs || []) {
        if (input.default_value !== undefined) defaults[input.key] = input.default_value;
        else if (input.allow_multiple) defaults[input.key] = [];
      }
      setValues(defaults);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load the Morphic workflow.');
      setErrorHint(loadError instanceof MorphicRequestError ? loadError.hint || '' : '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadWorkflow(); }, []);

  useEffect(() => {
    if (run) localStorage.setItem(storedRunKey, JSON.stringify(run));
  }, [run]);

  useEffect(() => {
    if (!run?.id || terminalStatuses.has(run.status)) return undefined;
    const controller = new AbortController();
    let retryTimer: number | undefined;

    const poll = async () => {
      try {
        const response = await morphicFetch(`/api/morphic/runs/${encodeURIComponent(run.id)}`, { signal: controller.signal });
        const payload = await readJson(response);
        const updated = payload.run as MorphicRun;
        setRun(updated);
        if (!terminalStatuses.has(updated.status) && !controller.signal.aborted) {
          retryTimer = window.setTimeout(poll, 15_000);
        }
      } catch (pollError) {
        if (controller.signal.aborted) return;
        setError(pollError instanceof Error ? pollError.message : 'Could not check generation status.');
        setErrorHint(pollError instanceof MorphicRequestError ? pollError.hint || '' : '');
        retryTimer = window.setTimeout(poll, 30_000);
      }
    };

    void poll();
    return () => {
      controller.abort();
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, [run?.id, run?.status]);

  const updateValue = (input: WorkflowInput, rawValue: unknown) => {
    setValues((current) => ({ ...current, [input.key]: rawValue }));
  };

  const prepareInput = (input: WorkflowInput): unknown => {
    const value = values[input.key];
    if (input.accepts === 'url' && typeof value === 'string' && input.allow_multiple) {
      return value.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
    }
    return value;
  };

  const startRun = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!schema?.workflow) return;
    setSubmitting(true);
    setError('');
    setErrorHint('');
    try {
      const inputs = Object.fromEntries((schema.inputs || [])
        .filter((input) => values[input.key] !== undefined && values[input.key] !== '')
        .map((input) => [input.key, prepareInput(input)]));
      const serializedInputs = JSON.stringify(inputs);
      if (idempotencyRef.current?.serializedInputs !== serializedInputs) {
        idempotencyRef.current = { serializedInputs, key: crypto.randomUUID() };
      }
      const payload = await readJson(await morphicFetch('/api/morphic/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, idempotencyKey: idempotencyRef.current.key }),
      }));
      idempotencyRef.current = null;
      setRun(payload.run as MorphicRun);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not start video generation.');
      setErrorHint(submitError instanceof MorphicRequestError ? submitError.hint || '' : '');
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (input: WorkflowInput) => {
    const value = values[input.key];
    const label = input.title || input.key;
    const common = { id: `morphic-${input.key}`, required: Boolean(input.required && input.default_value === undefined) };
    if (input.accepts === 'option') {
      const options = input.options || (input.allowed_values || []).map((id) => ({ id, label: id }));
      return <select {...common} value={String(value ?? '')} onChange={(event) => updateValue(input, event.target.value)}>
        <option value="">Choose an option</option>
        {options.map((option) => <option key={option.id} value={option.id}>{option.label || option.id}</option>)}
      </select>;
    }
    if (input.accepts === 'url') {
      const urlValue = Array.isArray(value) ? value.join('\n') : String(value ?? '');
      return <textarea {...common} rows={input.allow_multiple ? 3 : 1} value={urlValue} placeholder="https://..." onChange={(event) => updateValue(input, event.target.value)} />;
    }
    if (input.type === 'boolean') {
      return <input {...common} type="checkbox" checked={Boolean(value)} onChange={(event) => updateValue(input, event.target.checked)} />;
    }
    if (input.type === 'number') {
      return <input {...common} type="number" value={String(value ?? '')} onChange={(event) => updateValue(input, event.target.value === '' ? '' : Number(event.target.value))} />;
    }
    if (input.type === 'string') {
      const longText = input.key === scriptInput?.key || inputNeedsScript(input) || String(value || '').length > 90;
      return longText
        ? <textarea {...common} rows={input === scriptInput ? 9 : 4} value={String(value ?? '')} onChange={(event) => updateValue(input, event.target.value)} placeholder={input === scriptInput ? 'Paste a script or describe the video you want Morphic to create...' : undefined} />
        : <input {...common} type="text" value={String(value ?? '')} onChange={(event) => updateValue(input, event.target.value)} />;
    }
    return <input {...common} type="text" value={String(value ?? '')} onChange={(event) => updateValue(input, event.target.value)} />;
  };

  return (
    <section className="morphic-studio">
      <header className="morphic-header">
        <div className="morphic-title-mark"><Clapperboard aria-hidden="true" /><span>Morphic Partner API</span></div>
        <button type="button" className="morphic-refresh" onClick={() => void loadWorkflow()} disabled={loading} aria-label="Refresh Morphic workflow" title="Refresh workflow"><RefreshCw className={loading ? 'morphic-spinning' : ''} /></button>
      </header>

      <div className="morphic-intro">
        <div>
          <h1>Script to Video</h1>
          <p>Run your configured Morphic Studio workflow and follow the generated assets here.</p>
        </div>
        {schema?.workflow && <div className="morphic-workflow-meta"><strong>{schema.workflow.name}</strong><span>{schema.workflow.duration_seconds_estimate ? `~${Math.ceil(schema.workflow.duration_seconds_estimate / 60)} min typical` : 'Morphic workflow'}</span></div>}
      </div>

      {loading && <div className="morphic-loading"><LoaderCircle className="morphic-spinning" /> Loading Morphic workflow…</div>}

      {!loading && configured === false && <section className="morphic-config-state" role="status">
        <h2>Connect your Morphic workflow</h2>
        <p>Configure the server-side values in your ignored <code>.env.local</code>. The API key stays on the server and is never sent to the browser.</p>
        <ul>{missing.map((name) => <li key={name}><code>{name}</code></li>)}</ul>
        <p>Create a Morphic Studio workflow that accepts script text and outputs a video, then set its workflow ID, organization ID, and canvas project ID. Use a rotated Partner API key with <code>workflows:read</code>, <code>runs:write</code>, and <code>runs:read</code> scopes.</p>
      </section>}

      {!loading && configured && schema && <div className="morphic-layout">
        <form className="morphic-form" onSubmit={(event) => void startRun(event)}>
          <div className="morphic-form-heading"><div><span>NEW GENERATION</span><h2>{schema.workflow?.name || 'Create a video'}</h2></div><Video aria-hidden="true" /></div>
          {(schema.inputs || []).map((input) => <label className="morphic-field" key={input.key} htmlFor={`morphic-${input.key}`}>
            <span>{input.title || input.key}{input.required && <b aria-label="required"> *</b>}</span>
            {input.description && <small>{input.description}</small>}
            {renderInput(input)}
            {input.accepts === 'url' && <small>Use a public HTTPS file URL. Morphic cannot fetch files from your computer.</small>}
          </label>)}
          {schema.workflow?.credits_estimate && <p className="morphic-cost-note">Typical workflow usage: about {schema.workflow.credits_estimate.toLocaleString()} Morphic credits. Actual usage can vary.</p>}
          <button type="submit" className="morphic-submit" disabled={submitting || !schema.inputs?.length}>
            {submitting ? <><LoaderCircle className="morphic-spinning" /> Starting…</> : <><Film /> Generate video</>}
          </button>
        </form>

        <section className="morphic-run-panel" aria-live="polite">
          <div className="morphic-run-heading"><div><span>GENERATION</span><h2>{run ? 'Latest run' : 'No run yet'}</h2></div>{run && <StatusBadge status={run.status} />}</div>
          {!run ? <div className="morphic-run-empty"><Clapperboard /><p>Your Morphic run status and generated video will appear here.</p></div> : <>
            <dl className="morphic-run-details"><div><dt>Run ID</dt><dd>{run.id}</dd></div>{run.credits_used !== undefined && <div><dt>Credits used</dt><dd>{run.credits_used.toLocaleString()}</dd></div>}{run.created_at && <div><dt>Started</dt><dd>{new Date(run.created_at).toLocaleString()}</dd></div>}</dl>
            {run.status === 'needs_input' && <p className="morphic-run-note">This workflow needs an answer in Morphic Studio before it can continue.</p>}
            {run.status === 'failed' && <p className="morphic-run-error">{typeof run.error === 'string' ? run.error : run.error?.user_readable_message || run.error?.error_code || 'Morphic could not complete this workflow.'}</p>}
            {run.status === 'expired' && <p className="morphic-run-error">This Morphic run expired before it completed.</p>}
            {!terminalStatuses.has(run.status) && <p className="morphic-run-note"><LoaderCircle className="morphic-spinning" /> Morphic is processing this run. This panel updates automatically.</p>}
            {run.status === 'succeeded' && (!run.assets || run.assets.length === 0) && <p className="morphic-run-note">The workflow completed but did not declare an output asset. Mark its video output as a workflow output in Morphic Studio.</p>}
            {run.assets?.map((asset) => <article className="morphic-asset" key={asset.id}>
              {asset.kind === 'video' ? <video src={asset.url} controls preload="metadata" /> : <div className="morphic-asset-file"><Film /><span>{asset.kind.toUpperCase()}</span></div>}
              <div className="morphic-asset-meta"><span>{asset.kind}{asset.duration_seconds ? ` · ${asset.duration_seconds}s` : ''}</span><a href={asset.url} target="_blank" rel="noreferrer">Open output <ArrowUpRight /></a></div>
              {asset.url_expires_at && <small>Temporary Morphic download link expires {new Date(asset.url_expires_at).toLocaleString()}.</small>}
            </article>)}
          </>}
        </section>
      </div>}

      {error && <div className="morphic-error" role="alert">{error}{errorHint && <p className="morphic-run-note">{errorHint}</p>}</div>}
    </section>
  );
};

function StatusBadge({ status }: { status: string }) {
  return <span className={`morphic-status status-${status.replace(/[^a-z0-9-]/gi, '')}`}>{status.replace('_', ' ')}</span>;
}
