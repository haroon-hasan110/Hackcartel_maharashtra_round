import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  Film,
  ArrowRight,
  ExternalLink,
  Sliders,
  ChevronRight,
  Bookmark,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { ClipCandidate, TimelineSegment, SegmentType } from '../../types/project';

export const ContentMap: React.FC = () => {
  const {
    activeProject,
    activeClip,
    setActiveClip,
    generateClip,
    generatingClips,
    navigateTo,
    openExport,
  } = useProject();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(134); // starts at 02:14
  const [isMuted, setIsMuted] = useState(false);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>('seg-3');
  const videoRef = useRef<HTMLVideoElement>(null);

  const duration = activeProject.sourceVideo.duration || 522; // 08:42

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handlePreviewClip = (clip: ClipCandidate) => {
    setActiveClip(clip);
    handleSeek(clip.startTime);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = clip.startTime;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleSegmentClick = (segment: TimelineSegment) => {
    setActiveSegmentId(segment.id);
    handleSeek(segment.startTime);
    // Find matching clip candidate if any
    const matchingClip = activeProject.analysis?.clipOpportunities.find(
      (c) => Math.abs(c.startTime - segment.startTime) < 30
    );
    if (matchingClip) {
      setActiveClip(matchingClip);
    }
  };

  const getSegmentColor = (type: SegmentType) => {
    switch (type) {
      case 'hook':
        return 'bg-amber-500/30 border-amber-400 text-amber-300';
      case 'insight':
        return 'bg-cyan-500/30 border-cyan-400 text-cyan-300';
      case 'story':
        return 'bg-purple-500/30 border-purple-400 text-purple-300';
      case 'takeaway':
        return 'bg-emerald-500/30 border-emerald-400 text-emerald-300';
      case 'statement':
      default:
        return 'bg-blue-500/30 border-blue-400 text-blue-300';
    }
  };

  const getSegmentTagLabel = (type: SegmentType) => {
    switch (type) {
      case 'hook':
        return 'Hook';
      case 'insight':
        return 'Insight';
      case 'story':
        return 'Story';
      case 'takeaway':
        return 'Key Takeaway';
      case 'statement':
      default:
        return 'Strong Statement';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--color-text-main)' }}
          >
            AI Content Map
          </h1>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            High-signal segments and topic boundaries identified in {activeProject.title}.
          </p>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('studio')}
            className="clay-button-secondary px-3.5 py-1.5 text-xs font-medium cursor-pointer active:scale-95"
          >
            Open in Studio
          </button>
          <button
            onClick={() => navigateTo('repurpose')}
            className="clay-button-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold cursor-pointer active:scale-95 shadow-sm"
          >
            <span>Repurpose</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Top Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3.5 rounded-xl bg-[#0C0E16]/90 border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)] text-xs">
        <div>
          <span className="text-[11px] text-neutral-400 block font-mono uppercase tracking-wider">Source</span>
          <span className="text-white font-semibold truncate block mt-0.5" title={activeProject.title}>
            {activeProject.title}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-neutral-400 block font-mono uppercase tracking-wider">Duration</span>
          <span className="text-white font-semibold font-mono block mt-0.5">
            {formatSeconds(duration)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-neutral-400 block font-mono uppercase tracking-wider">Topics</span>
          <span className="text-white font-semibold block mt-0.5">
            {activeProject.analysis?.topics?.length || 4} Detected
          </span>
        </div>
        <div>
          <span className="text-[11px] text-neutral-400 block font-mono uppercase tracking-wider">Clip Opportunities</span>
          <span className="text-cyan-400 font-semibold block mt-0.5">
            {activeProject.analysis?.clipOpportunities?.length || 3} High Signal
          </span>
        </div>
        <div>
          <span className="text-[11px] text-neutral-400 block font-mono uppercase tracking-wider">Potential Assets</span>
          <span className="text-white font-semibold block mt-0.5">
            {activeProject.analysis?.insights.totalReusableAssets || 11} Variations
          </span>
        </div>
      </div>

      {/* Main Workspace: Left Video + Timeline, Right Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Large Source Video + Timeline */}
        <div className="lg:col-span-7 space-y-4">
          {/* Large Video Player */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl group">
            {activeProject.sourceVideo.objectUrl ? (
              <video
                ref={videoRef}
                src={activeProject.sourceVideo.objectUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={() => {
                  if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                }}
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              /* Simulated High-Res Master Frame Placeholder */
              <div className="w-full h-full relative">
                <img
                  src={activeProject.thumbnailUrl}
                  alt={activeProject.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Active time banner overlay */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-sm border border-white/10 text-[11px] font-mono text-cyan-300">
                  SOURCE MASTER: {formatSeconds(currentTime)} / {formatSeconds(duration)}
                </div>
              </div>
            )}

            {/* In-Video Grounding Timestamp Watermark */}
            <div className="absolute bottom-12 left-4 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md border border-white/10 text-[11px] text-neutral-300 hidden sm:flex items-center gap-2 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"></span>
              <span>Grounding: {formatSeconds(currentTime)} · {activeClip.topic}</span>
            </div>

            {/* Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/85 to-transparent p-3 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current text-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-current text-white ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => handleSeek(0)}
                  className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
                  title="Rewind to start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <span className="font-mono text-[11px] text-neutral-300">
                  {formatSeconds(currentTime)} / {formatSeconds(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                  PRORES LINEAGE
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Multi-Segment Timeline */}
          <div className="p-4 rounded-xl bg-[#0D1017]/80 border border-white/[0.08] shadow-[0_6px_20px_rgba(0,0,0,0.3)] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Source Timeline</span>
                <span className="text-neutral-400 text-[11px]">
                  (Click any detected segment to scrub)
                </span>
              </div>
              <span className="font-mono text-cyan-400 text-[11px]">
                {formatSeconds(currentTime)}
              </span>
            </div>

            {/* Timeline Bar Track */}
            <div
              className="relative h-10 bg-[#06080C] rounded-lg border border-white/[0.08] p-1 flex items-center overflow-hidden cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                handleSeek(pos * duration);
              }}
            >
              {/* Playhead Indicator Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-20 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              >
                <div className="w-2 h-2 -ml-[3px] bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(6,182,212,1)]" />
              </div>

              {/* Detected Segments Blocks */}
              {activeProject.analysis?.timelineSegments.map((segment) => {
                const leftPercent = (segment.startTime / duration) * 100;
                const widthPercent = ((segment.endTime - segment.startTime) / duration) * 100;
                const isCurrent =
                  currentTime >= segment.startTime && currentTime <= segment.endTime;
                const isSelected = activeSegmentId === segment.id;

                return (
                  <div
                    key={segment.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSegmentClick(segment);
                    }}
                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                    className={`absolute top-1 bottom-1 rounded border text-[10px] px-1 flex items-center justify-center truncate transition-all z-10 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/40 text-white font-semibold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : isCurrent
                        ? 'border-white/40 bg-white/15 text-white'
                        : getSegmentColor(segment.type)
                    }`}
                    title={`${segment.label} (${formatSeconds(segment.startTime)} - ${formatSeconds(segment.endTime)})`}
                  >
                    <span className="truncate text-[9px] font-medium hidden sm:inline">
                      {segment.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Timeline Scale & Legend */}
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono px-0.5">
              <span>00:00</span>
              <span>02:00</span>
              <span>04:00</span>
              <span>06:00</span>
              <span>{formatSeconds(duration)}</span>
            </div>

            {/* Segment Type Legend */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/[0.06] text-[11px] text-neutral-400">
              <span className="text-neutral-400">Types:</span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Hook
              </span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Insight
              </span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span> Story
              </span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Key Takeaway
              </span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span> Strong Statement
              </span>
            </div>
          </div>

          {/* Transcript Grounding Excerpt */}
          <div className="p-4 rounded-xl bg-[#0D1017]/60 border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Live Grounded Transcript</span>
              <span className="font-mono text-neutral-400 text-[11px]">
                Aligned with playback
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {activeProject.analysis?.transcripts.map((t) => {
                const isActiveWord = currentTime >= t.startTime && currentTime <= t.endTime;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSeek(t.startTime)}
                    className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isActiveWord
                        ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-white'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02]'
                    }`}
                  >
                    <span className="font-medium text-neutral-300 mr-2 font-mono">
                      [{formatSeconds(t.startTime)}] {t.speaker}:
                    </span>
                    <span>{t.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Content Opportunities */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Content Opportunities</h2>
              <p className="text-[11px] text-neutral-400">
                Identified from complete thoughts & high retention hooks
              </p>
            </div>
            <div className="text-[11px] text-cyan-400 font-mono">
              3 Candidates
            </div>
          </div>

          {/* Opportunity Cards */}
          <div className="space-y-4">
            {activeProject.analysis?.clipOpportunities.map((candidate, idx) => {
              const isSelected = activeClip.id === candidate.id;
              const isGenerating = generatingClips[candidate.id];
              const isGenerated = candidate.status === 'generated';

              return (
                <div
                  key={candidate.id}
                  className={`p-4 rounded-xl border transition-all text-xs space-y-3.5 ${
                    isSelected
                      ? 'border-cyan-500/60 bg-[#0F131D] shadow-[0_8px_30px_-6px_rgba(0,0,0,0.7)]'
                      : 'border-white/[0.06] bg-[#0C0E15]/60 hover:border-white/[0.12] hover:bg-[#0F121C]'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-1">
                        <span className="font-mono text-cyan-400">
                          {formatSeconds(candidate.startTime)} → {formatSeconds(candidate.endTime)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-neutral-300">{candidate.topic}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white">
                        {candidate.title}
                      </h3>
                    </div>

                    {/* AI Score with Tooltip/Context */}
                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs font-semibold text-cyan-300">
                        {candidate.score}%
                      </div>
                      <div className="text-[10px] text-neutral-400">Signal Score</div>
                    </div>
                  </div>

                  {/* Transcript Excerpt */}
                  <div className="p-2.5 rounded-lg bg-[#07090E] border border-white/[0.05] text-neutral-300 text-xs italic leading-relaxed">
                    "{candidate.transcriptExcerpt}"
                  </div>

                  {/* AI Trust Design: Why Selected Compact Evidence */}
                  <div className="pt-1">
                    <div className="text-[11px] font-medium text-neutral-400 mb-1.5 flex items-center justify-between">
                      <span>Why selected?</span>
                      <span className="text-neutral-400 font-mono text-[10px]">
                        AI suggests · Creator decides
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-neutral-300">
                      {candidate.selectionFactors.map((factor) => (
                        <div key={factor} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hook preview */}
                  <div className="pt-2 border-t border-white/[0.06]">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-0.5">
                      Suggested Opening Hook
                    </span>
                    <p className="text-white font-medium text-xs">
                      "{candidate.hook}"
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handlePreviewClip(candidate)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#141824] hover:bg-[#1B2130] text-neutral-200 border border-white/[0.08] transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current text-cyan-400" />
                      <span>Preview</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {isGenerated ? (
                        <>
                          <button
                            onClick={() => {
                              setActiveClip(candidate);
                              navigateTo('studio');
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-neutral-200 hover:text-white bg-[#141824] hover:bg-[#1B2130] border border-white/[0.08] transition-colors"
                          >
                            <span>Studio</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setActiveClip(candidate);
                              openExport(candidate);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm"
                          >
                            <span>Generated ✓</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => generateClip(candidate.id)}
                          disabled={isGenerating}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-all shadow-[0_1px_8px_rgba(6,182,212,0.25)]"
                        >
                          {isGenerating ? (
                            <>
                              <div className="w-3 h-3 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <span>Generate Clip</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
