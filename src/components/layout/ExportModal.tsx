import React, { useState } from 'react';
import { X, Download, CheckCircle2, Film, Layers, FileText, Music, Sparkles } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../services/api';

export const ExportModal: React.FC = () => {
  const { isExportOpen, closeExport, exportItem, activeProject, showNotification, theme } = useProject();

  const [selectedFormat, setSelectedFormat] = useState<'mp4' | 'prores' | 'wav' | 'srt'>('mp4');
  const [selectedResolution, setSelectedResolution] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [includeCaptions, setIncludeCaptions] = useState(true);
  const [includeGroundingTag, setIncludeGroundingTag] = useState(true);
  const [exportState, setExportState] = useState<'idle' | 'exporting' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);

  if (!isExportOpen) return null;

  const itemTitle = exportItem
    ? 'title' in exportItem
      ? exportItem.title
      : 'Active Content Asset'
    : activeProject.title;

  const handleStartExport = async () => {
    setExportState('exporting');
    setProgress(15);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 300);

    try {
      await api.exportAsset(exportItem ? exportItem.id : activeProject.id, selectedFormat);
      clearInterval(interval);
      setProgress(100);
      setExportState('complete');
      showNotification('Export generated and ready to download');
    } catch {
      clearInterval(interval);
      setExportState('idle');
      showNotification('Export failed. Please retry.');
    }
  };

  const handleReset = () => {
    setExportState('idle');
    setProgress(0);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in theme-${theme}`}>
      <div
        className="relative w-full max-w-lg rounded-3xl p-6 overflow-hidden clay-card shadow-2xl"
        style={{
          backgroundColor: 'var(--color-bg-card-elevated)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-main)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between pb-4 border-b"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h3
                className="text-sm font-semibold"
                style={{ color: 'var(--color-text-main)' }}
              >
                Export Content Package
              </h3>
              <span className="wabi-stamp text-[9px]">侘寂 · Artifact</span>
            </div>
            <p
              className="text-xs mt-0.5 truncate max-w-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Source: <span className="font-medium" style={{ color: 'var(--color-text-main)' }}>{activeProject.title}</span>
            </p>
          </div>
          <button
            onClick={() => {
              handleReset();
              closeExport();
            }}
            className="p-1.5 rounded-xl hover:opacity-80 transition-opacity active:scale-95 clay-chip cursor-pointer"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              color: 'var(--color-text-muted)',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {exportState === 'idle' && (
          <div className="space-y-5 py-4">
            {/* Target Asset preview banner */}
            <div
              className="p-3.5 rounded-2xl flex items-center gap-3 clay-card"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  backgroundColor: 'rgba(200, 104, 72, 0.16)',
                  color: 'var(--color-accent-terracotta)',
                }}
              >
                <Film className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: 'var(--color-text-main)' }}
                >
                  {itemTitle}
                </p>
                <div
                  className="flex items-center gap-2 text-[11px] mt-0.5 font-mono"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <span>Source verified</span>
                  <span aria-hidden="true">·</span>
                  <span>Master ProRes Lineage</span>
                </div>
              </div>
            </div>

            {/* Format Picker */}
            <div>
              <label
                className="block text-xs font-semibold mb-2 font-mono tracking-wide"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Output Preset
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFormat('mp4')}
                  className={`p-3 rounded-2xl text-left text-xs transition-all active:scale-98 cursor-pointer ${
                    selectedFormat === 'mp4' ? 'clay-card-elevated' : 'clay-card hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: selectedFormat === 'mp4' ? 'var(--color-bg-card)' : 'var(--color-bg-card-elevated)',
                    borderColor: selectedFormat === 'mp4' ? 'var(--color-accent-terracotta)' : 'var(--color-border-subtle)',
                    borderWidth: selectedFormat === 'mp4' ? 2 : 1,
                  }}
                >
                  <div
                    className="font-semibold"
                    style={{
                      color: selectedFormat === 'mp4' ? 'var(--color-accent-terracotta)' : 'var(--color-text-main)',
                    }}
                  >
                    H.264 MP4
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    Optimized for social platforms
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat('prores')}
                  className={`p-3 rounded-2xl text-left text-xs transition-all active:scale-98 cursor-pointer ${
                    selectedFormat === 'prores' ? 'clay-card-elevated' : 'clay-card hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: selectedFormat === 'prores' ? 'var(--color-bg-card)' : 'var(--color-bg-card-elevated)',
                    borderColor: selectedFormat === 'prores' ? 'var(--color-accent-terracotta)' : 'var(--color-border-subtle)',
                    borderWidth: selectedFormat === 'prores' ? 2 : 1,
                  }}
                >
                  <div
                    className="font-semibold"
                    style={{
                      color: selectedFormat === 'prores' ? 'var(--color-accent-terracotta)' : 'var(--color-text-main)',
                    }}
                  >
                    Apple ProRes 422
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    Lossless master archive
                  </div>
                </button>
              </div>
            </div>

            {/* Resolution Selector */}
            <div>
              <label
                className="block text-xs font-semibold mb-2 font-mono tracking-wide"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Framing & Aspect Ratio
              </label>
              <div className="flex gap-2">
                {[
                  { id: '9:16', label: '9:16 Vertical (1080×1920)', sub: 'Reels / Shorts / TikTok' },
                  { id: '16:9', label: '16:9 Landscape (1920×1080)', sub: 'YouTube / Web' },
                  { id: '1:1', label: '1:1 Square (1080×1080)', sub: 'LinkedIn / Feed' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setSelectedResolution(ratio.id as any)}
                    className={`flex-1 p-2.5 rounded-2xl border text-left text-xs transition-all active:scale-98 cursor-pointer ${
                      selectedResolution === ratio.id ? 'clay-card-elevated' : 'clay-card'
                    }`}
                    style={{
                      backgroundColor: selectedResolution === ratio.id ? 'var(--color-bg-card)' : 'var(--color-bg-card-elevated)',
                      borderColor: selectedResolution === ratio.id ? 'var(--color-accent-terracotta)' : 'var(--color-border-subtle)',
                      borderWidth: selectedResolution === ratio.id ? 2 : 1,
                    }}
                  >
                    <div
                      className="font-medium font-mono"
                      style={{
                        color: selectedResolution === ratio.id ? 'var(--color-accent-terracotta)' : 'var(--color-text-main)',
                      }}
                    >
                      {ratio.id}
                    </div>
                    <div className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {ratio.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div
              className="space-y-2 pt-2 border-t"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <label className="flex items-center justify-between text-xs py-1 cursor-pointer select-none">
                <span style={{ color: 'var(--color-text-main)' }}>Burn-in synchronized subtitles</span>
                <input
                  type="checkbox"
                  checked={includeCaptions}
                  onChange={(e) => setIncludeCaptions(e.target.checked)}
                  className="rounded w-4 h-4 cursor-pointer accent-orange-600"
                />
              </label>

              <label className="flex items-center justify-between text-xs py-1 cursor-pointer select-none">
                <span style={{ color: 'var(--color-text-main)' }}>Include verified timestamp badge</span>
                <input
                  type="checkbox"
                  checked={includeGroundingTag}
                  onChange={(e) => setIncludeGroundingTag(e.target.checked)}
                  className="rounded w-4 h-4 cursor-pointer accent-orange-600"
                />
              </label>
            </div>
          </div>
        )}

        {/* Exporting Progress State */}
        {exportState === 'exporting' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: 'rgba(200, 104, 72, 0.16)',
                color: 'var(--color-accent-terracotta)',
              }}
            >
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div className="text-center">
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--color-text-main)' }}
              >
                Compiling Platform Assets...
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Encoding {selectedFormat.toUpperCase()} with burned subtitles & source lineage
              </p>
            </div>

            <div className="w-full max-w-xs space-y-1.5 pt-2">
              <div
                className="w-full h-2 rounded-full overflow-hidden clay-chip"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: 'var(--color-accent-terracotta)',
                  }}
                />
              </div>
              <div
                className="text-right text-[11px] font-mono"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {progress}%
              </div>
            </div>
          </div>
        )}

        {/* Complete State */}
        {exportState === 'complete' && (
          <div className="py-8 flex flex-col items-center text-center space-y-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: 'rgba(94, 117, 88, 0.2)',
                color: 'var(--color-accent-matcha)',
              }}
            >
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--color-text-main)' }}
              >
                Export Ready
              </p>
              <p
                className="text-xs mt-1 max-w-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Your compiled asset package is processed and ready for distribution.
              </p>
            </div>
            <div
              className="w-full p-3.5 rounded-2xl text-left text-xs font-mono space-y-1 clay-card"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-subtle)',
                color: 'var(--color-text-main)',
              }}
            >
              <div className="flex justify-between py-0.5">
                <span style={{ color: 'var(--color-text-muted)' }}>File:</span>
                <span className="truncate max-w-[200px] font-semibold">{itemTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span style={{ color: 'var(--color-text-muted)' }}>Format:</span>
                <span>{selectedResolution} @ 60fps</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span style={{ color: 'var(--color-text-muted)' }}>Lineage:</span>
                <span style={{ color: 'var(--color-accent-matcha)' }}>Grounding verified</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div
          className="pt-4 border-t flex items-center justify-end gap-3"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          {exportState === 'idle' ? (
            <>
              <button
                type="button"
                onClick={closeExport}
                className="px-3.5 py-1.5 text-xs rounded-xl hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartExport}
                className="clay-button-primary flex items-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer active:scale-95 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Compile & Export</span>
              </button>
            </>
          ) : exportState === 'complete' ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 text-xs rounded-xl hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Export Another Format
              </button>
              <a
                href="#download"
                onClick={(e) => {
                  e.preventDefault();
                  showNotification('Downloading exported media file...');
                  closeExport();
                  handleReset();
                }}
                className="clay-button-primary flex items-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer active:scale-95 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Media</span>
              </a>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
