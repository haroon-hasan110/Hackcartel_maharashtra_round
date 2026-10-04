import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, ClipCandidate, ContentAnalysis, GeneratedAsset } from '../types/project';
import { mockProjects } from '../data/mockProjects';
import { mockAssets } from '../data/mockAssets';
import { mockAiAgentsClips } from '../data/mockAnalysis';
import { api } from '../services/api';
import { hasSupabaseConfig } from '../lib/supabase';

export type AppRoute =
  | 'landing'
  | 'dashboard'
  | 'projects'
  | 'upload'
  | 'processing'
  | 'content-map'
  | 'studio'
  | 'script-to-video'
  | 'repurpose'
  | 'assets'
  | 'settings'
  | 'project-detail';

export type ColorTheme = 'hero-canopy' | 'day-edit' | 'night-cut';

interface ProjectContextType {
  currentRoute: AppRoute;
  navigateTo: (route: AppRoute, projectId?: string, clipId?: string) => void;
  // Theme & Aesthetics
  theme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
  cycleTheme: () => void;
  projects: Project[];
  projectsLoaded: boolean;
  activeProject: Project;
  selectProject: (projectId: string) => void;
  activeClip: ClipCandidate;
  setActiveClip: (clip: ClipCandidate) => void;
  updateActiveClip: (updates: Partial<ClipCandidate>) => void;
  generateClip: (clipId: string) => Promise<void>;
  generatingClips: Record<string, boolean>;
  assets: GeneratedAsset[];
  // Export Drawer/Modal
  isExportOpen: boolean;
  exportItem: ClipCandidate | GeneratedAsset | null;
  openExport: (item?: ClipCandidate | GeneratedAsset) => void;
  closeExport: () => void;
  // Upload & Process
  pendingUpload: {
    file?: File;
    objectUrl?: string;
    title: string;
    scriptText: string;
    contentType: Project['contentType'];
  } | null;
  setPendingUpload: (upload: any) => void;
  startAnalysis: (uploadData: any) => Promise<void>;
  // Global Notification
  notification: string | null;
  showNotification: (msg: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const emptyProjectTemplate: Project = {
  id: '',
  title: 'No project yet',
  contentType: 'podcast',
  status: 'draft',
  createdAt: '',
  updatedAt: '',
  sourceVideo: {
    filename: '',
    duration: 0,
    sizeFormatted: '',
    aspectRatio: '16:9',
  },
  scriptText: '',
  generatedClipsCount: 0,
  totalAssetsCount: 0,
  thumbnailUrl: '',
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('landing');
  const [theme, setThemeState] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem('creatorai_theme');
    if (saved === 'hero-canopy' || saved === 'day-edit' || saved === 'night-cut') {
      return saved as ColorTheme;
    }
    return 'hero-canopy';
  });

  const setTheme = (newTheme: ColorTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('creatorai_theme', newTheme);
  };

  const cycleTheme = () => {
    setThemeState((curr) => {
      let next: ColorTheme = 'hero-canopy';
      if (curr === 'hero-canopy') next = 'day-edit';
      else if (curr === 'day-edit') next = 'night-cut';
      localStorage.setItem('creatorai_theme', next);
      return next;
    });
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [activeClip, setActiveClip] = useState<ClipCandidate>(mockAiAgentsClips[0]);
  const [generatingClips, setGeneratingClips] = useState<Record<string, boolean>>({});
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportItem, setExportItem] = useState<ClipCandidate | GeneratedAsset | null>(null);

  const [pendingUpload, setPendingUpload] = useState<{
    file?: File;
    objectUrl?: string;
    title: string;
    scriptText: string;
    contentType: Project['contentType'];
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) ||
    projects[0] ||
    (hasSupabaseConfig ? emptyProjectTemplate : mockProjects[0]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const navigateTo = (route: AppRoute, projectId?: string, clipId?: string) => {
    if (projectId) {
      setActiveProjectId(projectId);
    }
    if (clipId) {
      const match = activeProject.analysis?.clipOpportunities.find((c) => c.id === clipId);
      if (match) setActiveClip(match);
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    const p = projects.find((x) => x.id === projectId);
    if (p?.analysis?.clipOpportunities?.[0]) {
      setActiveClip(p.analysis.clipOpportunities[0]);
    }
  };

  const updateActiveClip = (updates: Partial<ClipCandidate>) => {
    setActiveClip((prev) => {
      const updated = { ...prev, ...updates };
      // Also update in project analysis if present
      setProjects((prevProjects) =>
        prevProjects.map((proj) => {
          if (proj.id !== activeProject.id || !proj.analysis) return proj;
          return {
            ...proj,
            analysis: {
              ...proj.analysis,
              clipOpportunities: proj.analysis.clipOpportunities.map((c) =>
                c.id === updated.id ? updated : c
              ),
            },
          };
        })
      );
      return updated;
    });
  };

  const generateClip = async (clipId: string) => {
    setGeneratingClips((prev) => ({ ...prev, [clipId]: true }));
    try {
      const clip = activeProject.analysis?.clipOpportunities.find((candidate) => candidate.id === clipId);
      const result = await api.generateClip(clipId, clip);
      setProjects((prevProjects) =>
        prevProjects.map((proj) => {
          if (proj.id !== activeProject.id || !proj.analysis) return proj;
          return {
            ...proj,
            generatedClipsCount: proj.generatedClipsCount + 1,
            analysis: {
              ...proj.analysis,
              clipOpportunities: proj.analysis.clipOpportunities.map((c) =>
                c.id === clipId ? { ...c, status: 'generated' } : c
              ),
            },
          };
        })
      );
      if (activeClip.id === clipId) {
        setActiveClip((prev) => ({ ...prev, status: 'generated' }));
      }
      showNotification(`Clip "${result.title}" compiled successfully`);
    } catch (e) {
      showNotification('Failed to generate clip');
    } finally {
      setGeneratingClips((prev) => ({ ...prev, [clipId]: false }));
    }
  };

  const startAnalysis = async (uploadData: any) => {
    setCurrentRoute('processing');
    const newProj = await api.createProject({
      title: uploadData.title || (uploadData.file?.name ? uploadData.file.name.replace(/\.[^/.]+$/, '') : 'New Content Pipeline'),
      contentType: uploadData.contentType || 'podcast',
      sourceFile: uploadData.file,
      sourceUrl: uploadData.objectUrl,
      scriptText: uploadData.scriptText,
      durationSeconds: 522,
    });

    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);

    try {
      const analysis = await api.analyzeProject(newProj.id);
      setProjects((prev) =>
        prev.map((p) => (p.id === newProj.id ? { ...p, analysis, status: 'analyzed' } : p))
      );
      if (analysis.clipOpportunities?.[0]) {
        setActiveClip(analysis.clipOpportunities[0]);
      }
      setCurrentRoute('content-map');
      showNotification('Qwen analysis complete: Content Map is ready');
    } catch (error) {
      console.error('Qwen analysis failed:', error);
      setCurrentRoute('upload');
      const message = error instanceof Error && error.message.startsWith('Add a transcript')
        ? error.message
        : 'Qwen analysis failed. Check that Ollama is running and the selected model is available.';
      showNotification(message);
    }
  };

  const openExport = (item?: ClipCandidate | GeneratedAsset) => {
    setExportItem(item || activeClip);
    setIsExportOpen(true);
  };

  const closeExport = () => {
    setIsExportOpen(false);
    setExportItem(null);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [loadedProjects, loadedAssets] = await Promise.all([
          api.getProjects(),
          api.getAssets(),
        ]);

        const safeProjects = hasSupabaseConfig ? loadedProjects : loadedProjects.length > 0 ? loadedProjects : mockProjects;
        const safeAssets = hasSupabaseConfig ? loadedAssets : loadedAssets.length > 0 ? loadedAssets : mockAssets;

        setProjects(safeProjects);
        setAssets(safeAssets);
        setActiveProjectId(safeProjects[0]?.id || '');
        setProjectsLoaded(true);

        if (safeProjects[0]?.analysis?.clipOpportunities?.[0]) {
          setActiveClip(safeProjects[0].analysis.clipOpportunities[0]);
        }
      } catch (error) {
        console.error('Failed to load initial project data:', error);
        if (hasSupabaseConfig) {
          setProjects([]);
          setAssets([]);
          setActiveProjectId('');
          setProjectsLoaded(true);
          return;
        }
        setProjects(mockProjects);
        setAssets(mockAssets);
        setActiveProjectId(mockProjects[0].id);
        setProjectsLoaded(true);
      }
    };

    loadInitialData();
  }, []);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (pendingUpload?.objectUrl) {
        URL.revokeObjectURL(pendingUpload.objectUrl);
      }
    };
  }, [pendingUpload]);

  return (
    <ProjectContext.Provider
      value={{
        currentRoute,
        navigateTo,
        theme,
        setTheme,
        cycleTheme,
        projects,
        projectsLoaded,
        activeProject,
        selectProject,
        activeClip,
        setActiveClip,
        updateActiveClip,
        generateClip,
        generatingClips,
        assets,
        isExportOpen,
        exportItem,
        openExport,
        closeExport,
        pendingUpload,
        setPendingUpload,
        startAnalysis,
        notification,
        showNotification,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
