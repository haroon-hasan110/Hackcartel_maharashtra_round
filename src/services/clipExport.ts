import type { ClipExportJob, EditorState } from '../types/editor';

const jobsKey = 'creatorai:clip-export-jobs';

export async function createClipExportJob(state: EditorState, sourceVideoName: string): Promise<ClipExportJob> {
  if (state.endTime <= state.startTime) throw new Error('End time must be after start time.');
  if (!state.sourceUrl) throw new Error('Select a source video before exporting.');
  const job: ClipExportJob = {
    id: `export-${crypto.randomUUID()}`,
    status: 'queued',
    createdAt: new Date().toISOString(),
    edit: {
      projectId: state.projectId,
      clipId: state.clipId,
      startTime: state.startTime,
      endTime: state.endTime,
      aspectRatio: state.aspectRatio,
      cropPosition: state.cropPosition,
      hook: state.hook,
      caption: state.caption,
      captionsEnabled: state.captionsEnabled,
      captionPosition: state.captionPosition,
      sourceVideoName,
    },
    rendererAvailable: false,
  };
  const jobs = JSON.parse(localStorage.getItem(jobsKey) || '[]') as ClipExportJob[];
  localStorage.setItem(jobsKey, JSON.stringify([job, ...jobs]));
  return job;
}

export function downloadEditRecipe(job: ClipExportJob): void {
  const blob = new Blob([JSON.stringify(job, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${job.edit.clipId}-edit-recipe.json`;
  link.click();
  URL.revokeObjectURL(url);
}