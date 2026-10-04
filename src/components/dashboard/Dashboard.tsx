import React, { useState } from 'react';
import {
  Plus,
  Play,
  ArrowRight,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const Dashboard: React.FC = () => {
  const { projects, projectsLoaded, selectProject, navigateTo } = useProject();
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);

  const pipelineSteps = [
    {
      title: 'Source',
      description: 'Upload 1 master recording (podcast, interview, or tutorial)',
      metric: 'MP4 / MOV raw',
    },
    {
      title: 'Understand',
      description: 'AI indexes speech, key ideas, and topic boundaries',
      metric: 'Zero context loss',
    },
    {
      title: 'Extract',
      description: 'Isolate high-signal segments with verified timestamps',
      metric: '90%+ retention',
    },
    {
      title: 'Adapt',
      description: 'Auto-frame for 9:16 Reels, Shorts, and LinkedIn posts',
      metric: 'Multi-platform',
    },
    {
      title: 'Review',
      description: 'Creator adjusts hooks, captions, and exact boundaries',
      metric: 'Creator control',
    },
    {
      title: 'Export',
      description: 'Render full platform-ready package in one click',
      metric: '10+ assets',
    },
  ];

  const handleLaunchDemo = () => {
    selectProject('proj-ai-agents');
    navigateTo('content-map');
  };

  if (!projectsLoaded) {
    return (
      <div className="py-20 text-center text-sm" style={{ color: 'var(--color-text-muted)' }} role="status">
        Loading your workspace...
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-8 pb-16">
        <section className="max-w-3xl pt-2 md:pt-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent-terracotta)' }}>
            Your workspace
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl" style={{ color: 'var(--color-text-main)' }}>
            Your first project starts with a recording.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            There are no projects here yet. Add a source recording to start your content pipeline.
          </p>
        </section>

        <section
          className="flex min-h-72 flex-col items-center justify-center border border-dashed px-6 py-12 text-center"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card-elevated)' }}
        >
          <div
            className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'rgba(185, 237, 121, 0.14)', color: 'var(--color-accent-terracotta)' }}
          >
            <Layers className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-main)' }}>
            No projects yet
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Create a project to keep your recording, clips, and adaptations together.
          </p>
          <button
            onClick={() => navigateTo('upload')}
            className="clay-button-primary mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Create your first project
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section className="pt-2 md:pt-4 max-w-3xl">
        <h1
          className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.12]"
          style={{ color: 'var(--color-text-main)' }}
        >
          One recording.
          <br />
          <span className="wabi-font-serif italic font-normal">
            An entire content pipeline.
          </span>
        </h1>

        <p
          className="mt-3 text-base max-w-2xl leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          CreatorAI understands your long-form recording, finds the moments that matter, and turns
          one source file into editable clips and platform-native adaptations.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigateTo('upload')}
            className="flex items-center gap-2 px-5 py-2.5 clay-button-primary text-xs font-semibold cursor-pointer active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Project</span>
          </button>

          <button
            onClick={handleLaunchDemo}
            className="flex items-center gap-2 px-4 py-2.5 clay-button-secondary text-xs font-medium cursor-pointer active:scale-95"
          >
            <Play
              className="w-3.5 h-3.5 fill-current"
              style={{ color: 'var(--color-accent-terracotta)' }}
            />
            <span>View Demo (AI Agents Podcast)</span>
          </button>

        </div>
      </section>

      {/* Continue Creating Section (Prioritize Active Content First!) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-sm font-semibold uppercase tracking-wider font-mono"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Active Session
            </h2>
          </div>
          <button
            onClick={() => navigateTo('projects')}
            className="text-xs transition-colors hover:underline cursor-pointer"
            style={{ color: 'var(--color-accent-terracotta)' }}
          >
            All projects ({projects.length}) →
          </button>
        </div>

        <div
          className="p-5 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 clay-card shadow-md"
          style={{
            backgroundColor: 'var(--color-bg-card-elevated)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-start sm:items-center gap-4">
            <div
              className="relative w-36 sm:w-44 aspect-video rounded-xl overflow-hidden shrink-0 group border shadow-inner"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <img
                src="/src/assets/images/thumb_ai_agents_1791027508742.jpg"
                alt="AI Agents Podcast Thumbnail"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-stone-200">
                08:42
              </div>
            </div>

            <div>
              <div
                className="flex items-center gap-2 text-xs mb-0.5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <span>Podcast Master</span>
                <span aria-hidden="true">·</span>
                <span>Ready to Review</span>
              </div>
              <h3
                className="text-lg font-bold tracking-tight"
                style={{ color: 'var(--color-text-main)' }}
              >
                AI Agents Podcast
              </h3>
              <p
                className="text-xs mt-1 max-w-lg leading-relaxed"
                style={{ color: 'var(--color-text-muted)' }}
              >
                3 high-retention clips identified, 11 platform variations compiled with verified source timestamps.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:self-center shrink-0">
            <button
              onClick={() => {
                selectProject('proj-ai-agents');
                navigateTo('content-map');
              }}
              className="clay-button-primary flex items-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer active:scale-95 shadow-sm whitespace-nowrap"
            >
              <span>Open Content Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                selectProject('proj-ai-agents');
                navigateTo('studio');
              }}
              className="clay-button-secondary px-3.5 py-2 text-xs font-medium cursor-pointer active:scale-95"
            >
              Studio
            </button>
          </div>
        </div>
      </section>

      {/* Content Pipeline Overview */}
      <section
        className="p-5 md:p-6 rounded-3xl relative overflow-hidden space-y-4 clay-card"
        style={{
          backgroundColor: 'var(--color-bg-card-elevated)',
          borderColor: 'var(--color-border-subtle)',
        }}
      >
        <div>
          <h2
            className="text-base font-semibold tracking-tight"
            style={{ color: 'var(--color-text-main)' }}
          >
            How CreatorAI Works
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            From raw source recording to ready-to-publish assets.
          </p>
        </div>

        {/* 6 Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {pipelineSteps.map((step, idx) => {
            const isSelected = activePipelineStep === idx;
            return (
              <button
                key={step.title}
                onClick={() => setActivePipelineStep(idx)}
                className={`p-3 rounded-2xl text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between ${isSelected ? 'clay-card-elevated shadow-sm' : 'clay-card hover:opacity-90'
                  }`}
                style={{
                  backgroundColor: isSelected
                    ? 'var(--color-bg-card)'
                    : 'var(--color-bg-card-elevated)',
                  borderColor: isSelected
                    ? 'var(--color-accent-terracotta)'
                    : 'var(--color-border-subtle)',
                  borderWidth: isSelected ? 2 : 1,
                }}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span
                      className="font-mono text-[10px] font-semibold"
                      style={{
                        color: isSelected
                          ? 'var(--color-accent-terracotta)'
                          : 'var(--color-text-muted)',
                      }}
                    >
                      0{idx + 1}
                    </span>
                  </div>
                  <div
                    className="text-xs font-semibold mb-1"
                    style={{
                      color: isSelected
                        ? 'var(--color-accent-terracotta)'
                        : 'var(--color-text-main)',
                    }}
                  >
                    {step.title}
                  </div>
                  <div
                    className="text-[11px] leading-snug line-clamp-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {step.description}
                  </div>
                </div>

                <div
                  className="mt-2 pt-1.5 border-t flex items-center justify-between"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                >
                  <span
                    className="text-[10px] font-mono truncate"
                    style={{ color: 'var(--color-text-faint)' }}
                  >
                    {step.metric}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Detail */}
        <div
          className="p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs clay-card"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--color-accent-soft)',
                color: 'var(--color-accent-terracotta)',
              }}
            >
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span
                className="font-mono text-[10px] uppercase tracking-wider block"
                style={{ color: 'var(--color-accent-terracotta)' }}
              >
                Step 0{activePipelineStep + 1}: {pipelineSteps[activePipelineStep].title}
              </span>
              <p
                className="font-medium text-xs mt-0.5"
                style={{ color: 'var(--color-text-main)' }}
              >
                {pipelineSteps[activePipelineStep].description}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigateTo('content-map')}
            className="clay-button-primary px-3 py-1.5 text-xs inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto active:scale-95 shadow-sm"
          >
            <span>Explore in Content Map</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </section>

      {/* Recent Projects Grid */}
      <section className="space-y-3">
        <h2
          className="text-sm font-semibold uppercase tracking-wider font-mono"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Recent Recordings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => {
                selectProject(proj.id);
                navigateTo('content-map', proj.id);
              }}
              className="group p-3.5 rounded-3xl transition-all cursor-pointer flex flex-col justify-between clay-card hover:scale-[1.01] active:scale-98 shadow-sm"
              style={{
                backgroundColor: 'var(--color-bg-card-elevated)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div>
                <div
                  className="relative aspect-video rounded-2xl overflow-hidden border mb-2.5 shadow-inner"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                >
                  <img
                    src={proj.thumbnailUrl}
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-stone-200">
                    {Math.floor(proj.sourceVideo.duration / 60)}:
                    {String(proj.sourceVideo.duration % 60).padStart(2, '0')}
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 text-xs mb-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <span className="capitalize">{proj.contentType}</span>
                  <span aria-hidden="true">·</span>
                  <span>{proj.createdAt}</span>
                </div>

                <h3
                  className="text-sm font-semibold transition-colors"
                  style={{ color: 'var(--color-text-main)' }}
                >
                  {proj.title}
                </h3>
              </div>

              <div
                className="mt-3 pt-2.5 border-t flex items-center justify-between text-xs"
                style={{
                  borderColor: 'var(--color-border-subtle)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>{proj.generatedClipsCount} clips</span>
                <span
                  className="font-mono text-[11px]"
                  style={{ color: 'var(--color-accent-terracotta)' }}
                >
                  {proj.totalAssetsCount} assets
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
