import React, { useState } from 'react';
import { Sliders, Shield, HardDrive, Check, Sparkles, RefreshCw, Palette } from 'lucide-react';
import { useProject, ColorTheme } from '../../context/ProjectContext';

export const Settings: React.FC = () => {
  const { showNotification, theme, setTheme, navigateTo } = useProject();

  const [strictLineage, setStrictLineage] = useState(true);
  const [retentionThreshold, setRetentionThreshold] = useState(85);
  const [defaultFormat, setDefaultFormat] = useState('mp4');
  const [autoBurnSubtitles, setAutoBurnSubtitles] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification('System preferences saved');
  };

  const themeCards: {
    id: ColorTheme;
    name: string;
    sub: string;
    description: string;
    icon: string;
    swatches: string[];
  }[] = [
      {
        id: 'hero-canopy',
        name: 'Hero Canopy',
        sub: 'Obsidian & Lime',
        description: 'Near-black obsidian surfaces with a subtle green tint and luminous lime accents.',
        icon: '🏺',
        swatches: ['#090C09', '#151C15', '#B9ED79'],
      },
      {
        id: 'day-edit',
        name: 'Day Edit',
        sub: 'Daylight & Lime',
        description: 'A clear daylight workspace with soft surfaces and readable lime accents.',
        icon: '☀️',
        swatches: ['#F4F7F0', '#FFFFFF', '#B9ED79'],
      },
      {
        id: 'night-cut',
        name: 'Night Cut',
        sub: 'Cinematic Charcoal',
        description: 'A neutral charcoal editing surface with softened contrast and lime highlights.',
        icon: '🎬',
        swatches: ['#17191D', '#282C33', '#B9ED79'],
      },
    ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-main)' }}
        >
          Settings
        </h1>
        <p
          className="text-xs mt-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Configure workspace theme, compiler preferences, and export presets.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Workspace Theme & Claymorphism Selector */}
        <div
          className="p-5 rounded-3xl space-y-4 clay-card shadow-lg"
          style={{
            backgroundColor: 'var(--color-bg-card-elevated)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div
            className="flex items-center justify-between pb-2 border-b"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <Palette
                className="w-4 h-4"
                style={{ color: 'var(--color-accent-terracotta)' }}
              />
              <h2
                className="text-sm font-semibold"
                style={{ color: 'var(--color-text-main)' }}
              >
                Workspace Aesthetics & Color Tone
              </h2>
            </div>
            <span className="wabi-stamp text-[9px]">Claymorphic</span>
          </div>

          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Choose your visual environment. Wabi-Sabi celebrates raw organic materials, sculpted clay depth, and tactile serenity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themeCards.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    showNotification(`Switched to ${t.name}`);
                  }}
                  className={`p-3.5 rounded-2xl text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between ${isSelected ? 'clay-card-elevated shadow-md' : 'clay-card hover:opacity-90'
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
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{t.icon}</span>
                      {isSelected ? (
                        <span
                          className="w-2 h-2 rounded-full shadow-sm"
                          style={{ backgroundColor: 'var(--color-accent-terracotta)' }}
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          {t.swatches.map((c, i) => (
                            <span
                              key={i}
                              className="w-2.5 h-2.5 rounded-full border border-black/10"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div
                      className="text-xs font-semibold"
                      style={{
                        color: isSelected
                          ? 'var(--color-accent-terracotta)'
                          : 'var(--color-text-main)',
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      className="text-[10px] mt-0.5"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {t.sub}
                    </div>
                  </div>

                  <p
                    className="text-[10px] mt-2 pt-2 border-t leading-snug line-clamp-2"
                    style={{
                      color: 'var(--color-text-faint)',
                      borderColor: 'var(--color-border-subtle)',
                    }}
                  >
                    {t.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Grounding Engine */}
        <div
          className="p-5 rounded-3xl space-y-4 clay-card"
          style={{
            backgroundColor: 'var(--color-bg-card-elevated)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div
            className="flex items-center gap-2 pb-2 border-b"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <Shield
              className="w-4 h-4"
              style={{ color: 'var(--color-accent-terracotta)' }}
            />
            <h2
              className="text-sm font-semibold"
              style={{ color: 'var(--color-text-main)' }}
            >
              AI Grounding & Trust Engine
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start justify-between gap-4 cursor-pointer select-none">
              <div>
                <span
                  className="font-semibold block"
                  style={{ color: 'var(--color-text-main)' }}
                >
                  Strict Source Lineage Enforcement
                </span>
                <span
                  className="text-[11px] block mt-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Prohibits hallucinated claims; every generated hook and caption must map directly to raw speech timestamps.
                </span>
              </div>
              <input
                type="checkbox"
                checked={strictLineage}
                onChange={(e) => setStrictLineage(e.target.checked)}
                className="mt-1 rounded w-4 h-4 cursor-pointer accent-lime-400"
              />
            </label>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span
                  className="font-semibold"
                  style={{ color: 'var(--color-text-main)' }}
                >
                  Minimum Candidate Retention Score
                </span>
                <span
                  className="font-mono text-xs font-semibold"
                  style={{ color: 'var(--color-accent-terracotta)' }}
                >
                  {retentionThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                value={retentionThreshold}
                onChange={(e) => setRetentionThreshold(Number(e.target.value))}
                className="w-full accent-lime-400 cursor-pointer"
              />
              <span
                className="text-[10px] block mt-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Moments below this threshold will not be auto-suggested as primary clips.
              </span>
            </div>
          </div>
        </div>

        {/* Output & Encoding Presets */}
        <div
          className="p-5 rounded-3xl space-y-4 clay-card"
          style={{
            backgroundColor: 'var(--color-bg-card-elevated)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div
            className="flex items-center gap-2 pb-2 border-b"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <Sliders
              className="w-4 h-4"
              style={{ color: 'var(--color-accent-terracotta)' }}
            />
            <h2
              className="text-sm font-semibold"
              style={{ color: 'var(--color-text-main)' }}
            >
              Export & Encoding Presets
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label
                className="font-semibold block mb-1.5"
                style={{ color: 'var(--color-text-main)' }}
              >
                Default Master Video Codec
              </label>
              <select
                value={defaultFormat}
                onChange={(e) => setDefaultFormat(e.target.value)}
                className="w-full p-2.5 clay-input text-xs focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-bg-input)',
                  color: 'var(--color-text-main)',
                  borderColor: 'var(--color-border-subtle)',
                }}
              >
                <option value="mp4">H.264 / AAC (Standard High-Compatibility MP4)</option>
                <option value="prores">Apple ProRes 422 (Broadcast Archive Quality)</option>
                <option value="av1">AV1 Video Stream (Next-Gen Web)</option>
              </select>
            </div>

            <label className="flex items-start justify-between gap-4 cursor-pointer select-none">
              <div>
                <span
                  className="font-semibold block"
                  style={{ color: 'var(--color-text-main)' }}
                >
                  Auto-generate burn-in subtitle tracks
                </span>
                <span
                  className="text-[11px] block mt-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Synchronizes animated typography directly on 9:16 vertical exports.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoBurnSubtitles}
                onChange={(e) => setAutoBurnSubtitles(e.target.checked)}
                className="mt-1 rounded w-4 h-4 cursor-pointer accent-lime-400"
              />
            </label>
          </div>
        </div>

        {/* Cinematic Landing Experience */}
        <div
          className="p-5 rounded-3xl space-y-3 clay-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          style={{
            backgroundColor: 'var(--color-bg-card-elevated)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div>
            <div
              className="text-xs font-semibold"
              style={{ color: 'var(--color-text-main)' }}
            >
              Cinematic Video Hero
            </div>
            <div
              className="text-[11px] mt-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Revisit the full-screen ambient video showcase and initial creator presentation.
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('landing')}
            className="clay-button-secondary px-3.5 py-2 text-xs font-medium cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
          >
            Launch Hero Page
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="clay-button-primary px-5 py-2.5 text-xs font-semibold cursor-pointer active:scale-95 shadow-md"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
