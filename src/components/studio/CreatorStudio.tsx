import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Check,
  RefreshCw,
  Film,
  Crop,
  Layers,
  ArrowRight,
  Maximize2,
  Sliders,
  Type,
  AlignLeft,
  Download,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../services/api';

export const CreatorStudio: React.FC = () => {
  const {
    activeProject,
    activeClip,
    setActiveClip,
    updateActiveClip,
    openExport,
    showNotification,
  } = useProject();

  // Local state for live editing
  const [startTime, setStartTime] = useState(activeClip.startTime);
  const [endTime, setEndTime] = useState(activeClip.endTime);
  const [hookText, setHookText] = useState(activeClip.hook);
  const [captionText, setCaptionText] = useState(activeClip.caption);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>(
    activeClip.aspectRatio || '9:16'
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayTime, setCurrentPlayTime] = useState(activeClip.startTime);
  const [isRegeneratingHook, setIsRegeneratingHook] = useState(false);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync when activeClip changes
  useEffect(() => {
    setStartTime(activeClip.startTime);
    setEndTime(activeClip.endTime);
    setHookText(activeClip.hook);
    setCaptionText(activeClip.caption);
    setAspectRatio(activeClip.aspectRatio || '9:16');
    setCurrentPlayTime(activeClip.startTime);
    setHasUnsavedEdits(false);
  }, [activeClip.id]);

  const clipDuration = Math.max(1, endTime - startTime);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatTimecode = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  // Timeline scrub simulation loop
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentPlayTime((prev) => {
          if (prev >= endTime) {
            return startTime;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, startTime, endTime]);

  const handleApplyEdits = () => {
    updateActiveClip({
      startTime,
      endTime,
      hook: hookText,
      caption: captionText,
      aspectRatio,
      durationSeconds: clipDuration,
    });
    setHasUnsavedEdits(false);
    showNotification('AI suggestions applied and saved to project');
  };

  const handleResetToAI = () => {
    const original = activeProject.analysis?.clipOpportunities.find(
      (c) => c.id === activeClip.id
    );
    if (original) {
      setStartTime(original.startTime);
      setEndTime(original.endTime);
      setHookText(original.hook);
      setCaptionText(original.caption);
      setAspectRatio(original.aspectRatio || '9:16');
      setHasUnsavedEdits(false);
      showNotification('Reset to initial AI suggestion');
    }
  };

  const handleRegenerateHook = async () => {
    setIsRegeneratingHook(true);
    try {
      const newHook = await api.generateHook(activeClip.id);
      setHookText(newHook);
      setHasUnsavedEdits(true);
      showNotification('New hook variation synthesized');
    } catch {
      showNotification('Could not generate new hook');
    } finally {
      setIsRegeneratingHook(false);
    }
  };

  // Video aspect ratio styling
  const getPlayerContainerStyle = () => {
    if (aspectRatio === '9:16') {
      return 'aspect-[9/16] max-h-[500px] mx-auto';
    }
    if (aspectRatio === '1:1') {
      return 'aspect-square max-h-[440px] mx-auto';
    }
    return 'aspect-video w-full';
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight flex items-center gap-3"
            style={{ color: 'var(--color-text-main)' }}
          >
            <span>Creator Studio</span>
            <span
              className="text-xs font-mono font-medium px-2 py-0.5 rounded-lg clay-chip"
              style={{
                backgroundColor: 'var(--color-bg-card-elevated)',
                color: 'var(--color-accent-terracotta)',
              }}
            >
              {aspectRatio}
            </span>
          </h1>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Trim clip boundaries, customize hooks, and adjust aspect framing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedEdits && (
            <span className="text-[11px] text-amber-500 font-mono hidden md:inline">
              ● Unsaved modifications
            </span>
          )}
          <button
            onClick={handleApplyEdits}
            className="clay-button-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold cursor-pointer active:scale-95 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Changes</span>
          </button>
          <button
            onClick={() => openExport(activeClip)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#141824] hover:bg-[#1B2130] rounded-md transition-colors border border-white/[0.08]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Clip</span>
          </button>
        </div>
      </div>

      {/* 3-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (3 cols): Media & Candidate Clips */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
              Clips & Assets
            </h2>
            <span className="text-[10px] font-mono text-neutral-400">
              {activeProject.analysis?.clipOpportunities.length || 0} Ready
            </span>
          </div>

          <div className="space-y-2">
            {activeProject.analysis?.clipOpportunities.map((clip) => {
              const isSelected = activeClip.id === clip.id;
              return (
                <div
                  key={clip.id}
                  onClick={() => setActiveClip(clip)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                    isSelected
                      ? 'border-cyan-500/60 bg-[#0F131D] shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                      : 'border-white/[0.06] bg-[#0C0E15]/60 hover:border-white/[0.12] hover:bg-[#0F121C]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                    <span className="font-mono text-cyan-400">
                      {formatSeconds(clip.startTime)} → {formatSeconds(clip.endTime)}
                    </span>
                    <span className="font-mono">{clip.durationSeconds}s</span>
                  </div>
                  <h3 className="font-semibold text-white truncate">{clip.title}</h3>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1 italic">
                    "{clip.hook}"
                  </p>
                </div>
              );
            })}
          </div>

          {/* Master Source Reference Box */}
          <div className="p-3.5 rounded-xl bg-[#0C0E15]/80 border border-white/[0.06] text-[11px] text-neutral-400 space-y-1">
            <span className="font-semibold text-neutral-300 block font-mono uppercase tracking-wider text-[10px]">
              Source Master File
            </span>
            <p className="truncate text-white font-mono">
              {activeProject.sourceVideo.filename}
            </p>
            <div className="mt-1 flex items-center justify-between pt-1 border-t border-white/[0.06]">
              <span>{formatSeconds(activeProject.sourceVideo.duration)} total</span>
              <span className="text-emerald-400 font-mono">Synchronized</span>
            </div>
          </div>
        </div>

        {/* Center Column (5 cols): Canvas Video Player & Studio Timeline */}
        <div className="lg:col-span-5 space-y-4">
          {/* Framed Video Player */}
          <div className="p-3.5 rounded-xl bg-[#06080C] border border-white/[0.08] flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden shadow-2xl">
            {/* Top Aspect ratio quick switches */}
            <div className="w-full flex items-center justify-between mb-2.5 text-xs px-1">
              <div className="flex items-center gap-1.5">
                {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => {
                      setAspectRatio(ratio);
                      setHasUnsavedEdits(true);
                    }}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      aspectRatio === ratio
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-neutral-400 hover:text-white bg-[#0F121A] border border-white/[0.05]'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {aspectRatio === '9:16' ? 'Reels / Shorts' : aspectRatio === '1:1' ? 'Square Feed' : 'Landscape'}
              </span>
            </div>

            {/* Simulated Live Aspect Framing Container */}
            <div
              className={`relative rounded-lg overflow-hidden bg-black border border-white/[0.08] shadow-2xl transition-all duration-300 ${getPlayerContainerStyle()}`}
            >
              <img
                src={activeClip.thumbnailUrl || activeProject.thumbnailUrl}
                alt={activeClip.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {/* Dynamic Overlay Hook for preview */}
              <div className="absolute top-6 inset-x-4 p-2.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-center animate-fade-in shadow-lg">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-0.5 tracking-wider">
                  HOOK PREVIEW
                </span>
                <p className="text-white text-xs font-semibold line-clamp-2 leading-snug">
                  {hookText}
                </p>
              </div>

              {/* Simulated Captions at lower third */}
              <div className="absolute bottom-6 inset-x-4 p-2 rounded-md bg-black/80 backdrop-blur-sm text-center">
                <p className="text-[11px] text-yellow-300 font-medium leading-tight">
                  {activeClip.transcriptExcerpt.slice(0, 75)}...
                </p>
              </div>

              {/* Play / Pause Center Overlay on hover */}
              <div
                onClick={handlePlayPause}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-black/70 border border-white/25 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-xl">
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </div>
              </div>

              {/* Timecode overlay */}
              <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/85 font-mono text-[9px] text-neutral-300 border border-white/[0.08]">
                {formatSeconds(currentPlayTime)} / {formatSeconds(endTime)}
              </div>
            </div>
          </div>

          {/* Interactive Bottom Timeline Controls */}
          <div className="p-4 rounded-xl bg-[#0D1017]/80 border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold text-white">Clip Trimming Timeline</span>
              </div>
              <span className="text-cyan-400 font-mono text-[11px]">
                Length: {clipDuration} seconds
              </span>
            </div>

            {/* Slider visual representation */}
            <div className="relative pt-2 pb-1">
              <div className="h-6 bg-[#06080C] rounded border border-white/[0.08] relative flex items-center overflow-hidden">
                {/* Active Highlight Range */}
                <div
                  className="absolute top-0 bottom-0 bg-cyan-500/25 border-l-2 border-r-2 border-cyan-400"
                  style={{
                    left: `${((startTime - activeClip.startTime + 10) / (clipDuration + 20)) * 100}%`,
                    width: `${(clipDuration / (clipDuration + 20)) * 100}%`,
                  }}
                />
                {/* Simulated Waveform ticks */}
                <div className="w-full flex items-center justify-between px-2 opacity-30">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-neutral-400"
                      style={{ height: `${(i % 5 + 1) * 3 + 4}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Numerical sliders for start and end times */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">
                    Start Boundary
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={Math.max(0, activeClip.startTime - 30)}
                      max={endTime - 5}
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(Number(e.target.value));
                        setHasUnsavedEdits(true);
                      }}
                      className="w-full accent-cyan-400"
                    />
                    <span className="text-xs font-mono text-white bg-[#06080C] px-2 py-1 rounded border border-white/[0.08]">
                      {formatSeconds(startTime)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">
                    End Boundary
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={startTime + 5}
                      max={activeClip.endTime + 30}
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(Number(e.target.value));
                        setHasUnsavedEdits(true);
                      }}
                      className="w-full accent-cyan-400"
                    />
                    <span className="text-xs font-mono text-white bg-[#06080C] px-2 py-1 rounded border border-white/[0.08]">
                      {formatSeconds(endTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): AI Edit Controls Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4.5 rounded-xl bg-[#0D1017]/90 border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  AI Edit Controls
                </h3>
                <span className="text-[11px] text-neutral-400">
                  Editable AI suggestion
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetToAI}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                title="Reset to default AI values"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Timecode Inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">
                  Start Timecode
                </label>
                <div className="p-2.5 rounded-md bg-[#07090E] border border-white/[0.08] font-mono text-white text-xs">
                  {formatTimecode(startTime)}
                </div>
              </div>
              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">
                  End Timecode
                </label>
                <div className="p-2.5 rounded-md bg-[#07090E] border border-white/[0.08] font-mono text-white text-xs">
                  {formatTimecode(endTime)}
                </div>
              </div>
            </div>

            {/* Hook Input & Regenerate */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Opening Hook
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateHook}
                  disabled={isRegeneratingHook}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isRegeneratingHook ? 'animate-spin' : ''}`}
                  />
                  <span>Regenerate Hook</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={hookText}
                onChange={(e) => {
                  setHookText(e.target.value);
                  setHasUnsavedEdits(true);
                }}
                className="w-full p-2.5 bg-[#07090E] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/80 leading-relaxed font-medium transition-colors"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block font-mono">
                Estimated hook retention: 92% at 3s
              </span>
            </div>

            {/* Caption Input */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Accompanying Caption
              </label>
              <textarea
                rows={4}
                value={captionText}
                onChange={(e) => {
                  setCaptionText(e.target.value);
                  setHasUnsavedEdits(true);
                }}
                className="w-full p-2.5 bg-[#07090E] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/80 leading-relaxed font-mono transition-colors"
              />
            </div>

            {/* Selection Factors Evidence */}
            <div className="p-3 rounded-lg bg-[#07090E] border border-white/[0.05] space-y-1.5 text-[11px]">
              <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                Grounding Factors
              </span>
              <p className="text-neutral-300">
                Segment isolated as a standalone thesis with zero cross-cut jarring.
              </p>
              <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-mono">
                <Check className="w-3 h-3" />
                <span>Lineage verified: {formatSeconds(startTime)} → {formatSeconds(endTime)}</span>
              </div>
            </div>

            {/* Actions in Panel */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleApplyEdits}
                className="w-full py-2.5 px-4 rounded-md text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 shadow-[0_1px_8px_rgba(6,182,212,0.25)]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply AI Edit</span>
              </button>

              <button
                type="button"
                onClick={handleResetToAI}
                className="w-full py-2 px-3 rounded-md text-xs font-medium text-neutral-400 hover:text-white bg-[#07090E] hover:bg-white/[0.04] border border-white/[0.08] transition-colors"
              >
                Reset to AI Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
