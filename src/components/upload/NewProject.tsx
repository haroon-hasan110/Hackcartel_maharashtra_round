import React, { useState, useRef } from 'react';
import { UploadCloud, FileVideo, ArrowRight, X } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Project } from '../../types/project';

export const NewProject: React.FC = () => {
  const { startAnalysis } = useProject();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [contentType, setContentType] = useState<Project['contentType']>('podcast');
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
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      const url = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoPreviewUrl(url);
      if (!projectTitle) setProjectTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleScriptUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') setScriptText(e.target.result);
    };
    reader.readAsText(file);
  };

  const handleClearVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>
          Start a content project
        </h1>
        <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Upload a master recording to automatically generate highlight clips, hooks, and platform adaptations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold mb-1.5 font-mono tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            Project Name
          </label>
          <input
            type="text"
            placeholder="e.g. AI Agents Podcast Episode 42"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full px-4 py-2.5 text-sm placeholder-stone-400 focus:outline-none transition-all rounded-2xl border"
            style={{
              color: 'var(--color-text-main)',
              backgroundColor: 'rgba(255,255,255,0.10)',
              borderColor: 'rgba(120, 103, 90, 0.18)',
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 font-mono tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            Master Source Recording
          </label>

          {!videoFile ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-[28px] p-8 md:p-12 text-center cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: isDragging ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.10)',
                borderColor: isDragging ? 'var(--color-border-active)' : 'var(--color-border-subtle)',
                boxShadow: '0 12px 30px rgba(100, 80, 63, 0.06)',
              }}
            >
              <input ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,video/mov" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]); }} />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm" style={{ backgroundColor: 'rgba(185,237,121,0.12)', color: 'var(--color-accent-terracotta)' }}>
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-main)' }}>Drop your video here</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                or <span className="underline font-medium cursor-pointer" style={{ color: 'var(--color-accent-terracotta)' }}>browse files</span> from your computer
              </p>
              <div className="flex items-center justify-center gap-2 text-[11px] mt-4 font-mono" style={{ color: 'var(--color-text-faint)' }}>
                <span>MP4, MOV</span>
                <span aria-hidden="true">·</span>
                <span>Up to 4K resolution</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-[28px] space-y-3 border" style={{ backgroundColor: 'rgba(255,255,255,0.16)', borderColor: 'rgba(120,103,90,0.18)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: 'rgba(185,237,121,0.12)', color: 'var(--color-accent-terracotta)' }}>
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold truncate max-w-sm" style={{ color: 'var(--color-text-main)' }}>{videoFile.name}</p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{(videoFile.size / (1024 * 1024)).toFixed(1)} MB · Ready for analysis</p>
                  </div>
                </div>

                <button type="button" onClick={handleClearVideo} className="p-1.5 rounded-xl transition-opacity active:scale-95 cursor-pointer" style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'var(--color-text-muted)' }} title="Remove video">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-2xl px-3 py-2 text-[11px] border" style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(120,103,90,0.14)', color: 'var(--color-text-muted)' }}>
                <span>Ready for analysis</span>
                <span className="font-semibold" style={{ color: 'var(--color-accent-terracotta)' }}>AI pipeline queued</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold font-mono tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Content Type</label>
            <button type="button" className="text-[11px] font-medium" style={{ color: 'var(--color-accent-terracotta)' }}>Auto-detect</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setContentType(type.id)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-full border text-xs font-medium transition-all"
                style={{
                  backgroundColor: contentType === type.id ? 'rgba(185,237,121,0.12)' : 'rgba(255,255,255,0.06)',
                  borderColor: contentType === type.id ? 'rgba(185,237,121,0.42)' : 'var(--color-border-subtle)',
                  color: contentType === type.id ? 'var(--color-accent-terracotta)' : 'var(--color-text-main)',
                }}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border p-4" style={{ backgroundColor: 'rgba(255,255,255,0.10)', borderColor: 'rgba(120,103,90,0.18)' }}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <label className="block text-xs font-semibold font-mono tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Optional Script or Transcript</label>
              <button type="button" onClick={() => scriptInputRef.current?.click()} className="text-[11px] font-medium" style={{ color: 'var(--color-accent-terracotta)' }}>Upload Script</button>
              <input ref={scriptInputRef} type="file" accept=".txt,.md,.doc,.docx" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) handleScriptUpload(e.target.files[0]); }} />
            </div>

            <textarea
              rows={4}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Paste transcript or script if available (CreatorAI will sync timestamps directly to video)"
              className="w-full resize-none rounded-2xl border px-3 py-2.5 text-xs focus:outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(120,103,90,0.18)',
                color: 'var(--color-text-main)',
              }}
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="clay-button-primary flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all">
              <span>Start project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
