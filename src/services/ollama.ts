interface OllamaChatResponse {
  message?: {
    content?: string;
  };
  error?: string;
}

const model = import.meta.env.VITE_OLLAMA_MODEL?.trim() || 'qwen3:8b';

async function chat(system: string, prompt: string, json = false): Promise<string> {
  let response: Response;

  try {
    response = await fetch('/ollama/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        stream: false,
        think: false,
        options: { num_predict: json ? 900 : 300 },
        ...(json ? { format: 'json' } : {}),
      }),
    });
  } catch {
    throw new Error('Could not reach Ollama. Start Ollama and check OLLAMA_BASE_URL.');
  }

  const result = (await response.json().catch(() => ({}))) as OllamaChatResponse;
  if (!response.ok) {
    throw new Error(result.error || `Ollama request failed (${response.status}).`);
  }

  const content = result.message?.content?.trim();
  if (!content) {
    throw new Error('Ollama returned an empty response.');
  }
  return content;
}

export function generateLocalText(system: string, prompt: string): Promise<string> {
  return chat(system, prompt);
}

export async function generateLocalJson<T>(system: string, prompt: string): Promise<T> {
  const content = await chat(system, prompt, true);
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error('Ollama returned invalid JSON. Try again or use a model with JSON support.');
  }
}