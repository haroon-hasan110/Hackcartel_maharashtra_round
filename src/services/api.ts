import { Project, ContentAnalysis, ClipCandidate, PlatformAdaptation, GeneratedAsset } from '../types/project';
import { mockProjects } from '../data/mockProjects';
import { mockAiAgentsAnalysis } from '../data/mockAnalysis';
import { mockHooks, mockCaptions, mockPlatformAdaptations } from '../data/mockAdaptations';
import { mockAssets } from '../data/mockAssets';

export const AI_MODE = 'mock' as const;

// Artificial latency helper to simulate real production feel
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    await delay(120);
    return [...this.projects];
  }

  async getProjectById(id: string): Promise<Project | null> {
    await delay(100);
    const p = this.projects.find((proj) => proj.id === id);
    return p ? { ...p } : null;
  }

  async createProject(payload: CreateProjectPayload): Promise<Project> {
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
    // In mock mode, return rich content analysis grounded in the source video
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
