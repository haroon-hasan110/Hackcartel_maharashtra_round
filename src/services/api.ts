import { Project, ContentAnalysis, ClipCandidate, PlatformAdaptation, GeneratedAsset } from '../types/project';
import { mockProjects } from '../data/mockProjects';
import { mockAiAgentsAnalysis } from '../data/mockAnalysis';
import { mockHooks, mockCaptions, mockPlatformAdaptations } from '../data/mockAdaptations';
import { mockAssets } from '../data/mockAssets';
import { supabase, hasSupabaseConfig } from '../lib/supabase';

export const AI_MODE = hasSupabaseConfig ? 'supabase' : 'mock';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
      thumbnailUrl: row.source_video?.thumbnailUrl || '/src/assets/images/thumb_ai_agents_1791027508742.jpg',
    },
    scriptText: row.script_text || '',
    analysis: row.analysis || undefined,
    generatedClipsCount: Number(row.generated_clips_count || 0),
    totalAssetsCount: Number(row.total_assets_count || 0),
    thumbnailUrl: row.thumbnail_url || '/src/assets/images/thumb_ai_agents_1791027508742.jpg',
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
      } catch (error) {
        console.error('Supabase getProjects failed, falling back to mocks:', error);
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
      } catch (error) {
        console.error('Supabase getProjectById failed, falling back to mocks:', error);
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
            thumbnailUrl: '/src/assets/images/thumb_ai_agents_1791027508742.jpg',
          },
          script_text: payload.scriptText || '',
          analysis: null,
          generated_clips_count: 0,
          total_assets_count: 0,
          thumbnail_url: '/src/assets/images/thumb_ai_agents_1791027508742.jpg',
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
        thumbnailUrl: '/src/assets/images/thumb_ai_agents_1791027508742.jpg',
      },
      scriptText: payload.scriptText,
      generatedClipsCount: 0,
      totalAssetsCount: 0,
      thumbnailUrl: '/src/assets/images/thumb_ai_agents_1791027508742.jpg',
    };

    this.projects.unshift(newProject);
    return newProject;
  }

  async analyzeProject(projectId: string): Promise<ContentAnalysis> {
    if (hasSupabaseConfig && supabase) {
      try {
        const project = await this.getProjectById(projectId);
        const analysis: ContentAnalysis = {
          ...mockAiAgentsAnalysis,
          id: `analysis-${projectId}`,
          projectId,
          sourceVideoName: project?.sourceVideo.filename || 'recording.mp4',
          durationSeconds: project?.sourceVideo.duration || 522,
        };

        const { error } = await supabase
          .from('projects')
          .update({
            analysis,
            status: 'analyzed',
            generated_clips_count: 1,
            total_assets_count: 11,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);

        if (!error) {
          return analysis;
        }
      } catch (error) {
        console.error('Supabase analyzeProject failed, falling back to mocks:', error);
      }
    }

    await delay(1800);
    const project = this.projects.find((p) => p.id === projectId);
    const analysis: ContentAnalysis = {
      ...mockAiAgentsAnalysis,
      id: `analysis-${projectId}`,
      projectId,
      sourceVideoName: project?.sourceVideo.filename || 'recording.mp4',
      durationSeconds: project?.sourceVideo.duration || 522,
    };

    if (project) {
      project.analysis = analysis;
      project.status = 'analyzed';
      project.totalAssetsCount = 11;
      project.generatedClipsCount = 1;
    }

    return analysis;
  }

  async generateClip(clipId: string): Promise<ClipCandidate> {
    await delay(1200);
    const found = mockAiAgentsAnalysis.clipOpportunities.find((c) => c.id === clipId);
    if (!found) {
      throw new Error(`Clip ${clipId} not found`);
    }
    const updated: ClipCandidate = {
      ...found,
      status: 'generated',
    };
    return updated;
  }

  async generateHook(clipId: string): Promise<string> {
    await delay(600);
    const hooks = mockHooks.filter((h) => h.clipId === clipId || true);
    const randomIndex = Math.floor(Math.random() * hooks.length);
    return hooks[randomIndex].hook;
  }

  async generateCaption(clipId: string): Promise<string> {
    await delay(600);
    const captions = mockCaptions.filter((c) => c.clipId === clipId || true);
    const randomIndex = Math.floor(Math.random() * captions.length);
    return captions[randomIndex].caption;
  }

  async generatePlatformAdaptation(
    clipId: string,
    platform: PlatformAdaptation['platform']
  ): Promise<PlatformAdaptation> {
    await delay(800);
    const match = mockPlatformAdaptations.find(
      (a) => a.clipId === clipId && a.platform === platform
    ) || mockPlatformAdaptations.find((a) => a.platform === platform);

    if (!match) {
      throw new Error('Adaptation failed');
    }
    return match;
  }

  async getAssets(): Promise<GeneratedAsset[]> {
    if (hasSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });

        if (!error && data) {
          return (data.map(normalizeAsset).filter(Boolean) as GeneratedAsset[]) || [];
        }
      } catch (error) {
        console.error('Supabase getAssets failed, falling back to mocks:', error);
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
}

export const api = new ContentApiService();
