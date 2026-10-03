import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileVideo,
  ArrowRight,
  X,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Project } from '../../types/project';

export const NewProject: React.FC = () => {
  const { startAnalysis } = useProject();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [contentType, setContentType] = useState<Project['contentType']>('podcast');

  // Options checklist
  const [options, setOptions] = useState({
    understandVideo: true,
    understandScript: true,
    findClipOpportunities: true,
    generateHooks: true,
    generateAdaptations: true,
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scriptInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && (file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov'))) {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      const url = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoPreviewUrl(url);
      if (!projectTitle) {
        setProjectTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleScriptUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setScriptText(e.target.result);
      }
    };
    reader.readAsText(file);
  };

  const handleClearVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoFile(null);
    setVideoPreviewUrl(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startAnalysis({
      title: projectTitle || 'AI Agents Podcast Episode 42',
      file: videoFile || undefined,
      objectUrl: videoPreviewUrl || undefined,
      scriptText,
      contentType,
      options,
    });
  };

  const contentTypes: { id: Project['contentType']; label: string; icon: string }[] = [
    { id: 'podcast', label: 'Podcast', icon: '🎙️' },
    { id: 'interview', label: 'Interview', icon: '💬' },
    { id: 'tutorial', label: 'Tutorial', icon: '📐' },
    { id: 'talking_head', label: 'Talking Head', icon: '👤' },
    { id: 'educational', label: 'Educational', icon: '📚' },
    { id: 'other', label: 'Other', icon: '✨' },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-8">
      {/* Clean, Direct Header */}
      <div>
        <h1
          className="text-2xl md:text-3xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-main)' }}
        >
          Start a content project
        </h1>
        <p
          className="text-xs md:text-sm mt-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Upload a master recording to automatically generate highlight clips, hooks, and platform adaptations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name Input */}
        <div>
          <label
            className="block text-xs font-semibold mb-1.5 font-mono tracking-wide"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Project Name
          </label>
          <input
            type="text"
            placeholder="e.g. AI Agents Podcast Episode 42"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full px-4 py-2.5 clay-input text-sm placeholder-stone-400 focus:outline-none transition-all"
            style={{
              color: 'var(--color-text-main)',
              backgroundColor: 'var(--color-bg-input)',
              borderColor: 'var(--color-border-subtle)',
            }}
          />
        </div>

        {/* Master Source Recording (Clay Canvas Dropzone) */}
        <div>
          <label
            className="block text-xs font-semibold mb-1.5 font-mono tracking-wide"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Master Source Recording
          </label>

          {!videoFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 md:p-12 text-center cursor-pointer transition-all duration-200 clay-card ${
                isDragging ? 'scale-[1.01] shadow-xl' : 'hover:scale-[1.002]'
              }`}
              style={{
                backgroundColor: isDragging
                  ? 'var(--color-bg-card-hover)'
                  : 'var(--color-bg-card)',
                borderColor: isDragging
                  ? 'var(--color-accent-terracotta)'
                  : 'var(--color-border)',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/mov"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm"
                style={{
                  backgroundColor: 'rgba(200, 104, 72, 0.14)',
                  color: 'var(--color-accent-terracotta)',
                }}
              >
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--color-text-main)' }}
              >
                Drop your video here
              </h3>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                or{' '}
                <span
                  className="underline font-medium cursor-pointer"
                  style={{ color: 'var(--color-accent-terracotta)' }}
                >
                  browse files
                </span>{' '}
                from your computer
              </p>
              <div
                className="flex items-center justify-center gap-2 text-[11px] mt-4 font-mono"
                style={{ color: 'var(--color-text-faint)' }}
              >
                <span>MP4, MOV</span>
                <span aria-hidden="true">·</span>
                <span>Up to 4K resolution</span>
              </div>
            </div>
          ) : (
            /* Selected File Preview */
            <div
              className="p-4 rounded-3xl space-y-3 clay-card"
              style={{
                backgroundColor: 'var(--color-bg-card-elevated)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{
                      backgroundColor: 'rgba(200, 104, 72, 0.16)',
                      color: 'var(--color-accent-terracotta)',
                    }}
                  >
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold truncate max-w-sm"
                      style={{ color: 'var(--color-text-main)' }}
                    >
                      {videoFile.name}
                    </p>
                    <p
                      className="text-[10px] font-mono mt-0.5"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {(videoFile.size / (1024 * 1024)).toFixed(1)} MB · Ready for analysis
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearVideo}
                  className="p-1.5 rounded-xl hover:opacity-80 transition-opacity active:scale-95 clay-chip cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    color: 'var(--color-text-muted)',
                  }}
                  title="Remove video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video Preview */}
              {videoPreviewUrl && (
                <div
                  className="relative aspect-video rounded-2xl overflow-hidden border shadow-inner"
                  style={{
                    backgroundColor: '#000000',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Optional Script Section */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              className="text-xs font-semibold font-mono tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Optional Script or Transcript
            </label>
            <button
              type="button"
              onClick={() => scriptInputRef.current?.click()}
              className="text-xs font-medium transition-colors cursor-pointer"
              style={{ color: 'var(--color-accent-terracotta)' }}
            >
              Upload Script (.txt, .srt)
            </button>
            <input
              ref={scriptInputRef}
              type="file"
              accept=".txt,.srt,.vtt,.json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleScriptUpload(e.target.files[0]);
                }
              }}
            />
          </div>
          <textarea
            rows={3}
            placeholder="Paste transcript or script if available (CreatorAI will sync text timestamps directly to video)"
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            className="w-full p-3.5 clay-input text-xs leading-relaxed font-mono placeholder-stone-400 focus:outline-none transition-all"
            style={{
              color: 'var(--color-text-main)',
              backgroundColor: 'var(--color-bg-input)',
              borderColor: 'var(--color-border-subtle)',
            }}
          />
        </div>

        {/* Content Type Selector */}
        <div>
          <label
            className="block text-xs font-semibold mb-2 font-mono tracking-wide"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Content Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {contentTypes.map((type) => {
              const isSelected = contentType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setContentType(type.id)}
                  className={`py-2 px-3 rounded-2xl text-center text-xs font-medium transition-all active:scale-95 cursor-pointer flex flex-col items-center gap-1 ${
                    isSelected ? 'clay-button-primary shadow-sm' : 'clay-button-secondary'
                  }`}
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--color-accent-terracotta)'
                      : 'var(--color-bg-card-elevated)',
                    color: isSelected ? '#FFFFFF' : 'var(--color-text-main)',
                    borderColor: isSelected
                      ? 'transparent'
                      : 'var(--color-border-subtle)',
                  }}
                >
                  <span className="text-sm">{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Analysis Options */}
        <div
          className="p-4 rounded-3xl space-y-3 clay-card"
          style={{
            backgroundColor: 'var(--color-bg-card-elevated)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <div
            className="text-xs font-semibold font-mono uppercase tracking-wider"
            style={{ color: 'var(--color-text-main)' }}
          >
            Compiler Options
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 'understandVideo', label: 'Index video & visual scene changes' },
              { id: 'understandScript', label: 'Index speech timestamps & sentences' },
              { id: 'findClipOpportunities', label: 'Find clip opportunities (90%+ retention)' },
              { id: 'generateHooks', label: 'Generate 5 high-impact opening hooks' },
              { id: 'generateAdaptations', label: 'Generate Reels, Shorts & LinkedIn copy' },
            ].map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2.5 text-xs cursor-pointer select-none"
                style={{ color: 'var(--color-text-main)' }}
              >
                <input
                  type="checkbox"
                  checked={options[opt.id as keyof typeof options]}
                  onChange={(e) =>
                    setOptions({ ...options, [opt.id]: e.target.checked })
                  }
                  className="rounded w-4 h-4 cursor-pointer accent-orange-600"
                />
                <span className="leading-snug">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Primary CTA */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-6 clay-button-primary text-sm font-semibold cursor-pointer active:scale-[0.98] shadow-md"
          >
            <span>Analyze with CreatorAI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
