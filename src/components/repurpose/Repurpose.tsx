import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Film,
  Instagram,
  Youtube,
  Twitter,
  ExternalLink,
  Sliders,
  Layers,
  Share2,
  Send,
  Upload,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../services/api';
import { ClipCandidate, PlatformAdaptation } from '../../types/project';

const platforms: PlatformAdaptation['platform'][] = ['instagram', 'youtube', 'x'];

const createAdaptationDraft = (
  clip: ClipCandidate,
  platform: PlatformAdaptation['platform']
): PlatformAdaptation => {
  const formatByPlatform: Record<PlatformAdaptation['platform'], string> = {
    instagram: '9:16 Vertical Reel',
    youtube: '9:16 YouTube Short',
    x: 'Concise post with video',
  };
  const body = clip.caption || clip.transcriptExcerpt;
  return {
    id: `draft-${clip.id}-${platform}`,
    clipId: clip.id,
    platform,
    format: formatByPlatform[platform],
    hook: clip.hook,
    title: platform === 'youtube' ? clip.title : undefined,
    body,
    hashtags: [],
  };
};

export const Repurpose: React.FC = () => {
  const { activeProject, activeClip, openExport, showNotification } = useProject();

  const [adaptations, setAdaptations] = useState<PlatformAdaptation[]>(() =>
    platforms.map((platform) => createAdaptationDraft(activeClip, platform))
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generatingPlatform, setGeneratingPlatform] = useState<PlatformAdaptation['platform'] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<string | null>(null);
  const [isPublishingX, setIsPublishingX] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [isUploadingAll, setIsUploadingAll] = useState(false);

  useEffect(() => {
    setAdaptations(platforms.map((platform) => createAdaptationDraft(activeClip, platform)));
    try {
      const savedJob = JSON.parse(sessionStorage.getItem('creatorai:last-script-video-job') || 'null');
      setGeneratedVideoUrl(typeof savedJob?.finalVideoUrl === 'string' ? savedJob.finalVideoUrl : '');
    } catch {
      setGeneratedVideoUrl('');
    }
  }, [activeClip.id]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotification('Copied to clipboard');
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    try {
      for (const platform of platforms) {
        const adaptation = await api.generatePlatformAdaptation(activeClip.id, platform, activeClip);
        setAdaptations((previous) => [
          ...previous.filter((item) => item.platform !== platform),
          adaptation,
        ]);
      }
      showNotification('Qwen generated all platform variations');
    } catch (error) {
      console.error('Qwen platform generation failed:', error);
      showNotification('Could not generate all variations. Check that Ollama is running.');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleUpdateBody = (id: string, newBody: string) => {
    setAdaptations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, body: newBody } : item))
    );
  };

  const handleRegenerateItem = async (platform: PlatformAdaptation['platform']) => {
    setGeneratingPlatform(platform);
    try {
      const adaptation = await api.generatePlatformAdaptation(activeClip.id, platform, activeClip);
      setAdaptations((previous) => [
        ...previous.filter((item) => item.platform !== platform),
        adaptation,
      ]);
      showNotification(`Qwen regenerated ${platform} copy`);
    } catch (error) {
      console.error(`Qwen ${platform} generation failed:`, error);
      showNotification(`Could not regenerate ${platform} copy. Check that Ollama is running.`);
    } finally {
      setGeneratingPlatform(null);
    }
  };

  const handlePublishX = async () => {
    setIsPublishingX(true);
    try {
      await api.publishXPost({
        clipId: xAdaptation.clipId,
        hook: xAdaptation.hook,
        postBody: xAdaptation.body,
      });
      showNotification('X post published successfully');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not publish to X.');
    } finally {
      setIsPublishingX(false);
    }
  };

  const handleUploadAll = async () => {
    if (!generatedVideoUrl) {
      showNotification('Generate a Script-to-Video asset first.');
      return;
    }

    setIsUploadingAll(true);
    try {
      await api.uploadGeneratedVideoToAll({
        videoUrl: generatedVideoUrl,
        title: activeClip.title || 'CreatorAI generated video',
        description: xAdaptation.body,
        hook: xAdaptation.hook,
        postBody: xAdaptation.body,
        tags: ['creatorai', 'shorts', 'content'],
      });
      showNotification('Video uploaded to YouTube and X');
    } catch (error) {
      console.error('Upload to all failed:', error);
      showNotification(error instanceof Error ? error.message : 'Could not upload video to all platforms.');
    } finally {
      setIsUploadingAll(false);
    }
  };

  const igAdaptation = adaptations.find((a) => a.platform === 'instagram')!;
  const ytAdaptation = adaptations.find((a) => a.platform === 'youtube')!;
  const xAdaptation = adaptations.find((a) => a.platform === 'x')!;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--color-text-main)' }}
          >
            Turn one moment into more content
          </h1>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Platform-native variations adapted from your recording.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => void handleGenerateAll()}
            disabled={isGeneratingAll || generatingPlatform !== null || isUploadingAll}
            className="clay-button-primary flex items-center gap-2 px-4 py-2 text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAll ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAll ? 'Synthesizing...' : 'Generate All Variations'}</span>
          </button>
          <button
            onClick={() => void handleUploadAll()}
            disabled={!generatedVideoUrl || isUploadingAll || isGeneratingAll}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            title={generatedVideoUrl ? 'Upload the latest Script-to-Video asset to YouTube and X' : 'Generate a Script-to-Video asset first'}
          >
            <Upload className={`h-3.5 w-3.5 ${isUploadingAll ? 'animate-pulse' : ''}`} />
            <span>{isUploadingAll ? 'Uploading...' : 'Upload to All'}</span>
          </button>
        </div>
      </div>

      {/* Selected Source Clip Reference Banner */}
      <div className="p-4 rounded-xl bg-[#0D1017]/90 border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
              <span className="text-neutral-300">Selected Source Moment:</span>
              <span className="text-cyan-400">
                {formatSeconds(activeClip.startTime)} → {formatSeconds(activeClip.endTime)}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5">
              "{activeClip.title}"
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="hidden sm:inline font-mono text-[11px]">Source: {activeProject.title}</span>
          <button
            onClick={() => openExport(activeClip)}
            className="px-3 py-1.5 rounded-md bg-[#141824] hover:bg-[#1B2130] text-white font-medium transition-colors border border-white/[0.08]"
          >
            Export Package
          </button>
        </div>
      </div>

      {/* Platform Variations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Instagram Reels */}
        <div className="p-5 rounded-2xl bg-[#0D1017] border border-white/[0.07] hover:border-white/[0.14] transition-all flex flex-col justify-between space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                  <Instagram className="w-4 h-4" />
                </div>
                <span>Instagram Reels</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                9:16 Vertical
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-semibold text-neutral-400 font-mono">
                  Visual Hook
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">92% retention</span>
              </div>
              <p className="text-xs font-semibold text-white p-2.5 rounded-lg bg-[#07090E] border border-white/[0.06] leading-relaxed">
                "{igAdaptation.hook}"
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1 font-mono">
                Feed Caption & Call-to-Action
              </span>
              {editingId === igAdaptation.id ? (
                <textarea
                  rows={6}
                  value={igAdaptation.body}
                  onChange={(e) => handleUpdateBody(igAdaptation.id, e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#07090E] border border-cyan-500/80 text-xs text-white leading-relaxed focus:outline-none font-mono"
                />
              ) : (
                <div className="p-2.5 rounded-lg bg-[#07090E] border border-white/[0.06] text-xs text-neutral-300 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                  {igAdaptation.body}
                </div>
              )}
            </div>

            {igAdaptation.hashtags && (
              <div className="text-[11px] text-cyan-400/90 font-mono">
                {igAdaptation.hashtags.join(' ')}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <button
              onClick={() => void handleRegenerateItem('instagram')}
              disabled={isGeneratingAll || generatingPlatform !== null}
              className="text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generatingPlatform === 'instagram' ? 'animate-spin' : ''}`} />
              <span>{generatingPlatform === 'instagram' ? 'Generating...' : 'Regenerate'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setEditingId(editingId === igAdaptation.id ? null : igAdaptation.id)
                }
                className="px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-[#141824] hover:bg-[#1B2130] border border-white/[0.08] rounded-md transition-colors"
              >
                {editingId === igAdaptation.id ? 'Done' : 'Edit'}
              </button>
              <button
                onClick={() =>
                  handleCopy(
                    igAdaptation.id,
                    `${igAdaptation.hook}\n\n${igAdaptation.body}\n\n${igAdaptation.hashtags?.join(' ')}`
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-semibold text-xs rounded-md transition-all shadow-[0_1px_8px_rgba(6,182,212,0.25)] active:scale-[0.98]"
              >
                {copiedId === igAdaptation.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={() => void handlePublishX()}
                disabled={isPublishingX}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white font-semibold text-xs rounded-md transition-all disabled:opacity-50 active:scale-[0.98]"
                title="Publish this edited post to X"
              >
                <Send className={`w-3.5 h-3.5 ${isPublishingX ? 'animate-pulse' : ''}`} />
                <span>{isPublishingX ? 'Publishing...' : 'Publish'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. YouTube Shorts */}
        <div className="p-5 rounded-2xl bg-[#0D1017] border border-white/[0.07] hover:border-white/[0.14] transition-all flex flex-col justify-between space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center text-white shadow-sm">
                  <Youtube className="w-4 h-4" />
                </div>
                <span>YouTube Shorts</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                9:16 Short
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-semibold text-neutral-400 font-mono">
                  Optimized Title
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">SEO Ranked</span>
              </div>
              <p className="text-xs font-semibold text-white p-2.5 rounded-lg bg-[#07090E] border border-white/[0.06] leading-relaxed">
                {ytAdaptation.title || 'AI Agents Are Changing Small Teams #Shorts'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1 font-mono">
                Short Description & Tags
              </span>
              {editingId === ytAdaptation.id ? (
                <textarea
                  rows={6}
                  value={ytAdaptation.body}
                  onChange={(e) => handleUpdateBody(ytAdaptation.id, e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#07090E] border border-cyan-500/80 text-xs text-white leading-relaxed focus:outline-none font-mono"
                />
              ) : (
                <div className="p-2.5 rounded-lg bg-[#07090E] border border-white/[0.06] text-xs text-neutral-300 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto font-mono">
                  {ytAdaptation.body}
                </div>
              )}
            </div>

            {ytAdaptation.hashtags && (
              <div className="text-[11px] text-cyan-400/90 font-mono">
                {ytAdaptation.hashtags.join(' ')}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <button
              onClick={() => void handleRegenerateItem('youtube')}
              disabled={isGeneratingAll || generatingPlatform !== null}
              className="text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generatingPlatform === 'youtube' ? 'animate-spin' : ''}`} />
              <span>{generatingPlatform === 'youtube' ? 'Generating...' : 'Regenerate'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setEditingId(editingId === ytAdaptation.id ? null : ytAdaptation.id)
                }
                className="px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-[#141824] hover:bg-[#1B2130] border border-white/[0.08] rounded-md transition-colors"
              >
                {editingId === ytAdaptation.id ? 'Done' : 'Edit'}
              </button>
              <button
                onClick={() =>
                  handleCopy(
                    ytAdaptation.id,
                    `${ytAdaptation.title}\n\n${ytAdaptation.body}\n\n${ytAdaptation.hashtags?.join(' ')}`
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-semibold text-xs rounded-md transition-all shadow-[0_1px_8px_rgba(6,182,212,0.25)] active:scale-[0.98]"
              >
                {copiedId === ytAdaptation.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. X Post */}
        <div className="p-5 rounded-2xl bg-[#0D1017] border border-white/[0.07] hover:border-white/[0.14] transition-all flex flex-col justify-between space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <div className="w-7 h-7 rounded-md bg-[#0A66C2] flex items-center justify-center text-white shadow-sm">
                  <Twitter className="w-4 h-4" />
                </div>
                <span>X Assistant</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Editorial
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-semibold text-neutral-400 font-mono">
                  Curated Hook & Frame
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Direct Thesis</span>
              </div>
              <p className="text-xs font-semibold text-white p-2.5 rounded-lg bg-[#07090E] border border-white/[0.06] leading-relaxed">
                "{xAdaptation.hook}"
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1 font-mono">
                Structured Post Body
              </span>
              {editingId === xAdaptation.id ? (
                <textarea
                  rows={6}
                  value={xAdaptation.body}
                  onChange={(e) => handleUpdateBody(xAdaptation.id, e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#07090E] border border-cyan-500/80 text-xs text-white leading-relaxed focus:outline-none font-sans"
                />
              ) : (
                <div className="p-2.5 rounded-lg bg-[#07090E] border border-white/[0.06] text-xs text-neutral-300 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto font-sans">
                  {xAdaptation.body}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <button
              onClick={() => void handleRegenerateItem('x')}
              disabled={isGeneratingAll || generatingPlatform !== null}
              className="text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generatingPlatform === 'x' ? 'animate-spin' : ''}`} />
              <span>{generatingPlatform === 'x' ? 'Generating...' : 'Regenerate'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setEditingId(editingId === xAdaptation.id ? null : xAdaptation.id)
                }
                className="px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-[#141824] hover:bg-[#1B2130] border border-white/[0.08] rounded-md transition-colors"
              >
                {editingId === xAdaptation.id ? 'Done' : 'Edit'}
              </button>
              <button
                onClick={() =>
                  handleCopy(xAdaptation.id, `${xAdaptation.hook}\n\n${xAdaptation.body}`)
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-semibold text-xs rounded-md transition-all shadow-[0_1px_8px_rgba(6,182,212,0.25)] active:scale-[0.98]"
              >
                {copiedId === xAdaptation.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
