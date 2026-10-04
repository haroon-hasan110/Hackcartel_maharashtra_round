import { Project, ContentAnalysis, ClipCandidate, PlatformAdaptation, GeneratedAsset, Topic, TimelineSegment, TranscriptSegment } from '../types/project';
import { mockProjects } from '../data/mockProjects';
import { mockAiAgentsAnalysis } from '../data/mockAnalysis';
import { mockAssets } from '../data/mockAssets';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { generateLocalJson, generateLocalText } from './ollama';
import aiAgentsThumbnail from '../assets/images/thumb_ai_agents_1791027508742.jpg';

export const AI_MODE = 'ollama';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const YOUTUBE_API_PATH = '/youtube';

export interface YouTubeVideo {
  id?: { videoId?: string } | string;
  snippet?: {
    title?: string;
    description?: string;
    thumbnails?: { medium?: { url?: string }; high?: { url?: string } };
    channelTitle?: string;
  };
  views?: number;
  likes?: number;
  comments?: number;
  engagement_rate_percent?: number;
}

const platformFormats: Record<PlatformAdaptation['platform'], string> = {
  instagram: '9:16 Vertical Reel',
  youtube: '9:16 YouTube Short',
  linkedin: 'Professional editorial post with clip',
  x: 'Concise post with video',
};

interface LocalAnalysisDraft {
  topics?: string[];
  clips?: Array<{
    title?: string;
    start?: number;
    end?: number;
    topic?: string;
    excerpt?: string;
    hook?: string;
  }>;
  summary?: string;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

const clampTime = (value: unknown, duration: number) => {
  const parsed = Number(value);
  return Math.max(0, Math.min(duration, Number.isFinite(parsed) ? parsed : 0));
};

function normalizeLocalAnalysis(
  project: Project,
  draft: LocalAnalysisDraft
): ContentAnalysis {
  const durationSeconds = project.sourceVideo.duration || 522;
  const draftClips = Array.isArray(draft.clips) ? draft.clips : [];
  const topicNames = (Array.isArray(draft.topics) ? draft.topics : [])
    .filter((topic): topic is string => typeof topic === 'string' && Boolean(topic.trim()));

  if (topicNames.length === 0 || draftClips.length === 0) {
    throw new Error('Qwen returned incomplete analysis. Try again with a fuller transcript.');
  }

  const clipOpportunities = draftClips
    .filter((clip) => Boolean(clip.title?.trim()) && Boolean(clip.excerpt?.trim()))
    .map((clip, index) => {
      const startTime = clampTime(clip.start, durationSeconds);
      const endTime = Math.max(startTime, clampTime(clip.end, durationSeconds));
      return {
        id: `clip-${project.id}-${index + 1}`,
        title: clip.title!.trim(),
        startTime,
        endTime,
        topic: clip.topic || topicNames[0],
        score: Math.max(60, 92 - index * 6),
        selectionFactors: ['Transcript-supported moment'],
        transcriptExcerpt: clip.excerpt!.trim(),
        hook: clip.hook?.trim() || clip.title!.trim(),
        caption: clip.excerpt!.trim(),
        status: 'idle' as const,
        aspectRatio: '9:16' as const,
        durationSeconds: Math.round(Math.max(0, endTime - startTime)),
        thumbnailUrl: project.thumbnailUrl,
      };
    })
    .filter((clip) => clip.durationSeconds > 0);

  if (clipOpportunities.length === 0) {
    throw new Error('Qwen returned no usable clips. Try again with a fuller transcript.');
  }

  const topics: Topic[] = topicNames.slice(0, 3).map((name, index) => {
    const relatedClips = clipOpportunities.filter((clip) => clip.topic.toLowerCase() === name.toLowerCase());
    const firstClip = relatedClips[0] || clipOpportunities[0];
    const lastClip = relatedClips[relatedClips.length - 1] || firstClip;
    return {
      id: `topic-${index + 1}`,
      name,
      relevance: Math.max(65, 94 - index * 8),
      segmentCount: relatedClips.length,
      timeRange: `${formatTime(firstClip.startTime)} - ${formatTime(lastClip.endTime)}`,
    };
  });

  const timelineSegments: TimelineSegment[] = clipOpportunities.map((clip, index) => ({
    id: `segment-${index + 1}`,
    type: 'insight',
    label: clip.title,
    startTime: clip.startTime,
    endTime: clip.endTime,
    summary: clip.transcriptExcerpt,
  }));
  const transcripts: TranscriptSegment[] = clipOpportunities.map((clip, index) => ({
    id: `transcript-${index + 1}`,
    startTime: clip.startTime,
    endTime: clip.endTime,
    speaker: 'Speaker',
    text: clip.transcriptExcerpt,
  }));

  return {
    id: `analysis-${project.id}`,
    projectId: project.id,
    sourceVideoName: project.sourceVideo.filename,
    durationSeconds,
    topics,
    timelineSegments,
    clipOpportunities,
    transcripts,
    insights: {
      primaryTopic: topics[0].name,
      highPotentialClipsCount: clipOpportunities.filter((clip) => clip.score >= 80).length,
      peakOpportunityRange: `${formatTime(clipOpportunities[0].startTime)} - ${formatTime(clipOpportunities[0].endTime)}`,
      totalReusableAssets: clipOpportunities.length,
      summary: draft.summary?.trim() || `Qwen identified ${clipOpportunities.length} clip opportunities from the supplied transcript.`,
    },
  };
}

async function analyzeTranscriptWithOllama(project: Project, transcript: string): Promise<ContentAnalysis> {
  const maxCharacters = 24000;
  const sourceText = transcript.slice(0, maxCharacters);
  const truncationNote = transcript.length > maxCharacters
    ? '\nOnly the first 24,000 characters are included.'
    : '';
  const draft = await generateLocalJson<LocalAnalysisDraft>(
    'Analyze creator transcripts and return only valid JSON. Ground every topic, clip, hook, caption, and summary in the supplied text. Do not invent quotations or factual claims. Timestamps are rough estimates based on text order and total duration unless timestamps are explicitly present in the transcript.',
    `Analyze this ${project.contentType} transcript for a ${durationSecondsLabel(project.sourceVideo.duration)} recording. Return compact JSON: {"topics":["short topic"],"clips":[{"title":"short title","start":0,"end":30,"topic":"topic","excerpt":"exact transcript quote","hook":"short hook"}],"summary":"one sentence"}. Provide at most 3 topics and 3 clips. Keep fields brief and times within the duration. Estimate times proportionally if the transcript has no timestamps.\n\nTranscript:\n${sourceText}${truncationNote}`
  );

  return normalizeLocalAnalysis(project, draft);
}

function durationSecondsLabel(seconds: number): string {
  return `${Math.max(1, Math.round(seconds || 522))} second`;
}

const normalizeProject = (row: any): Project | null => {
  if (!row) return null;

  return {
    id: String(row.id),
    title: row.title || 'Untitled Recording',
    contentType: (row.content_type || 'podcast') as Project['contentType'],
    status: (row.status || 'draft') as Project['status'],
    createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Just now',
    updatedAt: row.updated_at ? new Date(row.updated_at).toLocaleDateString() : 'Just now',
    sourceVideo: {
      filename: row.source_video?.filename || 'uploaded_recording.mp4',
      duration: Number(row.source_video?.duration || 522),
      sizeFormatted: row.source_video?.sizeFormatted || '1.42 GB',
      aspectRatio: row.source_video?.aspectRatio || '16:9',
      localFile: undefined,
      objectUrl: row.source_video?.objectUrl,
      thumbnailUrl: row.source_video?.thumbnailUrl || aiAgentsThumbnail,
    },
    scriptText: row.script_text || '',
    analysis: row.analysis || undefined,
    generatedClipsCount: Number(row.generated_clips_count || 0),
    totalAssetsCount: Number(row.total_assets_count || 0),
    thumbnailUrl: row.thumbnail_url || aiAgentsThumbnail,
  };
};

const normalizeAsset = (row: any): GeneratedAsset | null => {
  if (!row) return null;

  return {
    id: String(row.id),
    title: row.title || 'Generated Asset',
    filename: row.filename || 'asset',
    assetType: (row.asset_type || 'video') as GeneratedAsset['assetType'],
    format: row.format || 'mp4',
    size: row.size || '0 MB',
    sourceProjectId: row.project_id || 'unknown-project',
    sourceProjectTitle: row.metadata?.sourceProjectTitle || 'Unknown Project',
    sourceTimeRange: row.metadata?.sourceTimeRange || '0:00 - 0:30',
    createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Just now',
    thumbnailUrl: row.metadata?.thumbnailUrl,
  };
};

export interface CreateProjectPayload {
  title: string;
  contentType: Project['contentType'];
  sourceFile?: File;
  sourceUrl?: string;
  durationSeconds?: number;
  scriptText?: string;
  options?: {
    understandVideo: boolean;
    understandScript: boolean;
    findClipOpportunities: boolean;
    generateHooks: boolean;
    generateAdaptations: boolean;
  };
}

class ContentApiService {
  private projects: Project[] = [...mockProjects];
  private assets: GeneratedAsset[] = [...mockAssets];
  private generatedClips = new Map<string, ClipCandidate>();

  private findClip(clipId: string, clipContext?: ClipCandidate): ClipCandidate | undefined {
    return (clipContext?.id === clipId ? clipContext : undefined)
      || this.generatedClips.get(clipId)
      || mockAiAgentsAnalysis.clipOpportunities.find((clip) => clip.id === clipId);
  }

  async getProjects(): Promise<Project[]> {
    if (hasSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return (data.map(normalizeProject).filter(Boolean) as Project[]) || [];
        }

        if (error) {
          console.error('Supabase getProjects returned an error:', error);
        }

        return [];
      } catch (error) {
        console.error('Supabase getProjects failed, falling back to mocks:', error);
        return [];
      }
    }

    await delay(120);
    return [...this.projects];
  }

  async getProjectById(id: string): Promise<Project | null> {
    if (hasSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();

        if (!error && data) {
          return normalizeProject(data);
        }

        return null;
      } catch (error) {
        console.error('Supabase getProjectById failed, falling back to mocks:', error);
        return null;
      }
    }

    await delay(100);
    const p = this.projects.find((proj) => proj.id === id);
    return p ? { ...p } : null;
  }

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    if (hasSupabaseConfig && supabase) {
      try {
        const newProjectRecord = {
          title: payload.title || 'Untitled Recording',
          content_type: payload.contentType || 'podcast',
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          source_video: {
            filename: payload.sourceFile?.name || 'uploaded_recording.mp4',
            duration: payload.durationSeconds || 522,
            sizeFormatted: payload.sourceFile
              ? `${(payload.sourceFile.size / (1024 * 1024)).toFixed(1)} MB`
              : '1.42 GB',
            aspectRatio: '16:9',
            objectUrl: payload.sourceUrl,
            thumbnailUrl: aiAgentsThumbnail,
          },
          script_text: payload.scriptText || '',
          analysis: null,
          generated_clips_count: 0,
          total_assets_count: 0,
          thumbnail_url: aiAgentsThumbnail,
        };

        const { data, error } = await supabase
          .from('projects')
          .insert(newProjectRecord)
          .select()
          .single();

        if (!error && data) {
          return normalizeProject(data) as Project;
        }
      } catch (error) {
        console.error('Supabase createProject failed, falling back to mocks:', error);
      }
    }

    await delay(300);
    const newId = `proj-${Date.now()}`;
    const newProject: Project = {
      id: newId,
      title: payload.title || 'Untitled Recording',
      contentType: payload.contentType || 'podcast',
      status: 'draft',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      sourceVideo: {
        filename: payload.sourceFile?.name || 'uploaded_recording.mp4',
        duration: payload.durationSeconds || 522,
        sizeFormatted: payload.sourceFile
          ? `${(payload.sourceFile.size / (1024 * 1024)).toFixed(1)} MB`
          : '1.42 GB',
        aspectRatio: '16:9',
        localFile: payload.sourceFile,
        objectUrl: payload.sourceUrl,
        thumbnailUrl: aiAgentsThumbnail,
      },
      scriptText: payload.scriptText,
      generatedClipsCount: 0,
      totalAssetsCount: 0,
      thumbnailUrl: aiAgentsThumbnail,
    };

    this.projects.unshift(newProject);
    return newProject;
  }

  async analyzeProject(projectId: string): Promise<ContentAnalysis> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    const transcript = project.scriptText?.trim();
    if (!transcript) {
      throw new Error('Add a transcript or script to run Qwen analysis. Video transcription is not configured yet.');
    }

    const analysis = await analyzeTranscriptWithOllama(project, transcript);
    analysis.clipOpportunities.forEach((clip) => this.generatedClips.set(clip.id, clip));

    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase
        .from('projects')
        .update({
          analysis,
          status: 'analyzed',
          generated_clips_count: analysis.clipOpportunities.length,
          total_assets_count: analysis.insights.totalReusableAssets,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) throw new Error(`Could not save Qwen analysis: ${error.message}`);
    } else {
      const localProject = this.projects.find((candidate) => candidate.id === projectId);
      if (localProject) {
        localProject.analysis = analysis;
        localProject.status = 'analyzed';
        localProject.generatedClipsCount = analysis.clipOpportunities.length;
        localProject.totalAssetsCount = analysis.insights.totalReusableAssets;
      }
    }
    return analysis;
  }

  async generateClip(clipId: string, clipContext?: ClipCandidate): Promise<ClipCandidate> {
    await delay(1200);
    const found = this.findClip(clipId, clipContext);
    if (!found) {
      throw new Error(`Clip ${clipId} not found`);
    }
    const updated: ClipCandidate = {
      ...found,
      status: 'generated',
    };
    return updated;
  }

  async generateHook(clipId: string, clipContext?: ClipCandidate): Promise<string> {
    const clip = this.findClip(clipId, clipContext);
    if (!clip) throw new Error(`Clip ${clipId} not found`);

    return generateLocalText(
      'Write concise, compelling social video hooks grounded only in the supplied clip context. Return only the hook.',
      `Write one hook of at most 12 words for this clip.\nTitle: ${clip.title}\nTopic: ${clip.topic}\nTranscript: ${clip.transcriptExcerpt}`
    );
  }

  async generateCaption(clipId: string, clipContext?: ClipCandidate): Promise<string> {
    const clip = this.findClip(clipId, clipContext);
    if (!clip) throw new Error(`Clip ${clipId} not found`);

    return generateLocalText(
      'Write accurate, readable social video captions grounded only in the supplied clip context. Return only the caption.',
      `Write a concise caption for this clip.\nTitle: ${clip.title}\nTopic: ${clip.topic}\nTranscript: ${clip.transcriptExcerpt}`
    );
  }

  async generatePlatformAdaptation(
    clipId: string,
    platform: PlatformAdaptation['platform'],
    clipContext?: ClipCandidate
  ): Promise<PlatformAdaptation> {
    const clip = this.findClip(clipId, clipContext);

    if (!clip) throw new Error(`Clip ${clipId} not found`);
    const format = platformFormats[platform];

    const generated = await generateLocalJson<Pick<PlatformAdaptation, 'format' | 'hook' | 'title' | 'body' | 'hashtags' | 'callToAction'>>(
      'Adapt video content for the requested social platform. Use only the supplied context. Return concise valid JSON with format, hook, title, body, hashtags, and callToAction fields. Keep hashtags as an array of strings.',
      `Adapt this clip for ${platform}. Preserve its meaning and do not invent claims.\nFormat: ${format}\nTitle: ${clip.title}\nTopic: ${clip.topic}\nTranscript: ${clip.transcriptExcerpt}`
    );

    if (!generated.format || !generated.hook || !generated.body) {
      throw new Error('Ollama returned an incomplete platform adaptation.');
    }

    return {
      id: `adaptation-${clipId}-${platform}`,
      clipId,
      platform,
      format: generated.format || format,
      hook: generated.hook,
      title: generated.title,
      body: generated.body,
      hashtags: Array.isArray(generated.hashtags) ? generated.hashtags : [],
      callToAction: generated.callToAction,
    };
  }

  async getAssets(): Promise<GeneratedAsset[]> {
    if (hasSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });

        if (!error && data) {
          return (data.map(normalizeAsset).filter(Boolean) as GeneratedAsset[]) || [];
        }

        if (error) {
          console.error('Supabase getAssets returned an error:', error);
        }

        return [];
      } catch (error) {
        console.error('Supabase getAssets failed, falling back to mocks:', error);
        return [];
      }
    }

    await delay(100);
    return [...this.assets];
  }

  async exportAsset(
    assetId: string,
    format: string = 'mp4'
  ): Promise<{ downloadUrl: string; filename: string }> {
    await delay(1500);
    return {
      downloadUrl: '#',
      filename: `creator_ai_export_${Date.now()}.${format}`,
    };
  }

  async getYouTubeConfigStatus(): Promise<{ ready: boolean; message: string }> {
    try {
      const response = await fetch(`${YOUTUBE_API_PATH}/config-status`);
      const data = await response.json().catch(() => ({ ready: false, message: 'Unable to reach YouTube config endpoint.' }));

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to check YouTube config status.');
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unable to reach YouTube config endpoint.');
    }
  }

  async getYouTubeRecommendations(query: string, region = 'IN', maxResults = 8): Promise<YouTubeVideo[]> {
    const response = await fetch(`${YOUTUBE_API_PATH}/recommendations?query=${encodeURIComponent(query)}&region=${region}&max_results=${maxResults}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.detail || 'Unable to load YouTube recommendations.');
    return data.items || [];
  }

  async getYouTubeEngagement(videoIds: string[]): Promise<YouTubeVideo[]> {
    if (!videoIds.length) return [];
    const response = await fetch(`${YOUTUBE_API_PATH}/engagement?video_ids=${encodeURIComponent(videoIds.join(','))}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.detail || 'Unable to extract YouTube numbers.');
    return data.items || [];
  }

  async uploadToYouTube(payload: {
    file: File;
    title: string;
    description?: string;
    privacyStatus?: string;
    tags?: string[];
    onProgress?: (progress: number) => void;
  }): Promise<{ status: string; result: Record<string, unknown> }> {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('title', payload.title);
    formData.append('description', payload.description || '');
    formData.append('privacy_status', payload.privacyStatus || 'private');
    formData.append('tags', (payload.tags || []).join(','));

    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('POST', `${YOUTUBE_API_PATH}/upload`);
      request.responseType = 'json';
      payload.onProgress?.(1);
      request.upload.addEventListener('loadstart', () => payload.onProgress?.(1));
      request.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          payload.onProgress?.(Math.round((event.loaded / event.total) * 100));
        }
      });
      request.addEventListener('load', () => {
        const data = request.response || {};
        if (request.status < 200 || request.status >= 300) {
          reject(new Error(data?.detail || 'YouTube upload failed'));
          return;
        }
        resolve(data);
      });
      request.addEventListener('error', () => reject(new Error('Could not reach the YouTube upload server.')));
      request.addEventListener('abort', () => reject(new Error('YouTube upload was cancelled.')));
      request.send(formData);
    });
  }
}

export const api = new ContentApiService();
