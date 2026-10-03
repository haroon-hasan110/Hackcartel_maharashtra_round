import React, { useState, useEffect } from 'react';
import { Check, Film, FileText, Layers, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const ProcessingExperience: React.FC = () => {
  const { activeProject, navigateTo } = useProject();

  const stages = [
    { title: 'Reading source file', desc: 'Decoding audio tracks & video keyframes' },
    { title: 'Understanding speech', desc: 'Transcribing speech with millisecond word timestamps' },
    { title: 'Mapping topics', desc: 'Detecting thematic shifts & conceptual boundaries' },
    { title: 'Connecting script to footage', desc: 'Aligning spoken cadence with narrative outline' },
    { title: 'Finding content opportunities', desc: 'Scoring complete thoughts and high-retention openings' },
    { title: 'Preparing reusable assets', desc: 'Generating platform-native hooks, captions & vertical crops' },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < stages.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 650);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-xl bg-[#0D1017] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
        {/* Subtle top glow */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-20 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Heading */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full mb-3 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-calm-pulse shadow-[0_0_6px_rgba(6,182,212,1)]"></span>
            <span>COMPILER INGESTION ACTIVE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            CreatorAI is compiling your content
          </h2>
          <p className="text-xs text-neutral-400 mt-1.5">
            Structuring <span className="text-neutral-200 font-medium">{activeProject.title}</span> into verified modular assets
          </p>
        </div>

        {/* Visual Architecture Representation */}
        <div className="mb-8 p-4 rounded-xl bg-[#07090E] border border-white/[0.06] flex items-center justify-between text-xs shadow-inner">
          <div className="flex flex-col items-center gap-1.5 text-center flex-1">
            <div className="w-10 h-10 rounded-lg bg-[#0F131C] border border-white/[0.08] flex items-center justify-center text-neutral-300">
              <Film className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-neutral-300">Video Master</span>
          </div>

          <div className="text-neutral-500 font-mono px-1">+</div>

          <div className="flex flex-col items-center gap-1.5 text-center flex-1">
            <div className="w-10 h-10 rounded-lg bg-[#0F131C] border border-white/[0.08] flex items-center justify-center text-neutral-300">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-neutral-300">Script & Audio</span>
          </div>

          <ArrowRight className="w-4 h-4 text-cyan-400 mx-1 shrink-0" />

          <div className="flex flex-col items-center gap-1.5 text-center flex-1">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-medium text-cyan-300">AI Compiler</span>
          </div>

          <ArrowRight className="w-4 h-4 text-cyan-400 mx-1 shrink-0" />

          <div className="flex flex-col items-center gap-1.5 text-center flex-1">
            <div className="w-10 h-10 rounded-lg bg-[#0F131C] border border-white/[0.08] flex items-center justify-center text-neutral-300">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-neutral-300">Content Map</span>
          </div>
        </div>

        {/* Sequential Stages */}
        <div className="space-y-2.5">
          {stages.map((stg, idx) => {
            const isDone = currentStep > idx;
            const isCurrent = currentStep === idx;
            return (
              <div
                key={stg.title}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                  isDone
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-neutral-200'
                    : isCurrent
                    ? 'border-cyan-500/50 bg-cyan-500/5 text-white ring-1 ring-cyan-500/20 shadow-sm'
                    : 'border-white/[0.04] bg-[#07090E]/60 text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-medium ${
                      isDone
                        ? 'bg-emerald-400 text-neutral-950 font-semibold'
                        : isCurrent
                        ? 'bg-cyan-400 text-neutral-950 font-semibold animate-calm-pulse'
                        : 'bg-white/[0.06] text-neutral-500'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-white">{stg.title}</span>
                    <span className="text-neutral-400 text-[11px] ml-2 hidden sm:inline">
                      — {stg.desc}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-mono shrink-0">
                  {isDone ? (
                    <span className="text-emerald-400">Indexed ✓</span>
                  ) : isCurrent ? (
                    <span className="text-cyan-400">Compiling...</span>
                  ) : (
                    <span className="text-neutral-400">Queued</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action button if simulation reached final stage or user wants to jump */}
        {currentStep >= stages.length && (
          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center animate-fade-in">
            <button
              onClick={() => navigateTo('content-map')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-[0_2px_12px_rgba(6,182,212,0.3)] active:scale-[0.98]"
            >
              <span>View Compiled Content Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
