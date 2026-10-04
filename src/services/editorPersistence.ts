import type { EditorState } from '../types/editor';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

const storageKey = (projectId: string, clipId: string) => `creatorai:editor:${projectId}:${clipId}`;

export async function loadEditorState(projectId: string, clipId: string): Promise<EditorState | null> {
  try {
    const saved = localStorage.getItem(storageKey(projectId, clipId));
    if (saved) return JSON.parse(saved) as EditorState;
  } catch {
    // Fall through to the project store when local storage is unavailable.
  }

  if (!hasSupabaseConfig || !supabase) return null;
  const { data, error } = await supabase.from('projects').select('analysis').eq('id', projectId).maybeSingle();
  if (error) throw error;
  const saved = data?.analysis?.editorStates?.[clipId];
  return saved ? (saved as EditorState) : null;
}

export async function saveEditorState(state: EditorState): Promise<{ cloudSynced: boolean }> {
  const persistedState = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(storageKey(state.projectId, state.clipId), JSON.stringify(persistedState));
  if (!hasSupabaseConfig || !supabase) return { cloudSynced: false };

  void (async () => {
    const { data, error } = await supabase
      .from('projects').select('analysis').eq('id', state.projectId).maybeSingle();
    if (error || !data) return;

    await supabase.from('projects').update({
      analysis: {
        ...(data.analysis || {}),
        editorStates: { ...(data.analysis?.editorStates || {}), [state.clipId]: persistedState },
      },
      updated_at: persistedState.updatedAt,
    }).eq('id', state.projectId);
  })().catch((error) => console.error('Editor cloud sync failed:', error));

  return { cloudSynced: false };
}