import type { ClipCandidate } from './project';

export type EditorAspectRatio = '9:16' | '16:9' | '1:1';
export type CaptionPosition = 'top' | 'center' | 'bottom';

export interface EditorState {
  projectId: string;
  clipId: string;
  sourceUrl: string;
  startTime: number;
  endTime: number;
  aspectRatio: EditorAspectRatio;
  cropPosition: number;
  hook: string;
  caption: string;
  captionsEnabled: boolean;
  captionPosition: CaptionPosition;
  updatedAt?: string;
}

export interface ClipExportJob {
  id: string;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  createdAt: string;
  edit: Omit<EditorState, 'sourceUrl' | 'updatedAt'> & { sourceVideoName: string };
  rendererAvailable: false;
}

export function createInitialEditorState(projectId: string, clip: ClipCandidate, sourceUrl = ''): EditorState {
  return {
    projectId,
    clipId: clip.id,
    sourceUrl,
    startTime: clip.startTime,
    endTime: clip.endTime,
    aspectRatio: clip.aspectRatio || '9:16',
    cropPosition: 50,
    hook: clip.hook,
    caption: clip.caption,
    captionsEnabled: true,
    captionPosition: 'bottom',
  };
}