import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownToLine, ChevronDown, FileText, Film, FolderOpen, Loader2, Maximize, Music, Pause, Play, Redo2, RotateCcw, Save, Search, Undo2, Upload, Volume2, VolumeX, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../services/api';
import { createClipExportJob, downloadEditRecipe } from '../../services/clipExport';
import { loadEditorState, saveEditorState } from '../../services/editorPersistence';
import type { ClipCandidate } from '../../types/project';
import { createInitialEditorState, type CaptionPosition, type ClipExportJob, type EditorAspectRatio, type EditorState } from '../../types/editor';
import demoStudioVideo from '../../assets/videos/creator-studio-demo.mp4';
import './creatorStudio.css';

const formatTime = (seconds: number) => {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(Math.floor(safe % 60)).padStart(2, '0')}`;
};

const aspectRatios: EditorAspectRatio[] = ['9:16', '16:9', '1:1'];
type LibraryTab = 'media' | 'clips' | 'transcript';
const demoStudioDuration = 8.33;
const demoAudioLevels = [12, 18, 28, 20, 38, 54, 31, 22, 45, 70, 48, 30, 18, 39, 58, 76, 49, 27, 42, 64, 34, 21, 53, 72, 46, 29, 18, 40, 61, 35, 24, 49, 67, 42, 19, 33, 57, 75, 44, 26, 16, 37, 58, 32, 21, 46, 69, 39, 24, 52, 73, 43, 28, 18, 41, 62, 36, 23, 48, 66, 40, 20, 35, 56, 31, 18, 43, 60, 34, 22, 47, 70, 41, 25, 17, 37, 55, 31, 20, 46, 63, 36, 24, 51, 68, 39, 23, 15, 33, 52, 29, 18, 42, 60, 34, 22, 48, 65, 38, 20];
const emptyClipList: ClipCandidate[] = [];

export const CreatorStudio: React.FC = () => {
  const { activeProject, activeClip, setActiveClip, updateActiveClip, showNotification } = useProject();
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const sourcePickerRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<EditorState>(createInitialEditorState(activeProject.id, activeClip));
  const originalClipRef = useRef<ClipCandidate>(activeClip);
  const undoRef = useRef<EditorState[]>([]);
  const redoRef = useRef<EditorState[]>([]);
  const rangeDragRef = useRef<{ x: number; start: number; end: number } | null>(null);
  const selectionPlaybackRef = useRef(false);
  const [editor, setEditor] = useState(editorRef.current);
  const [sourceOverride, setSourceOverride] = useState('');
  const [duration, setDuration] = useState(0);
  const [playhead, setPlayhead] = useState(activeClip.startTime);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [videoError, setVideoError] = useState(false);
  const [aiHook, setAiHook] = useState(activeClip.hook);
  const [aiCaption, setAiCaption] = useState(activeClip.caption);
  const [generating, setGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('unsaved');
  const [showExport, setShowExport] = useState(false);
  const [exportJob, setExportJob] = useState<ClipExportJob | null>(null);
  const [isUploadingToYoutube, setIsUploadingToYoutube] = useState(false);
  const [youtubeUploadProgress, setYoutubeUploadProgress] = useState(0);
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [youtubeStatusMessage, setYoutubeStatusMessage] = useState('Checking YouTube configuration...');
  const youtubeFileInputRef = useRef<HTMLInputElement>(null);
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('clips');
  const [timelineZoom, setTimelineZoom] = useState<1 | 2 | 4>(1);

  const isSeededDemoProject = activeProject.id === 'proj-ai-agents'
    && activeProject.title === 'AI Agents Podcast'
    && activeProject.sourceVideo.filename === 'ai_agents_podcast_master_ep42.mp4';
  const isDemoPreview = isSeededDemoProject && !sourceOverride && !activeProject.sourceVideo.objectUrl;
  const sourceUrl = sourceOverride || activeProject.sourceVideo.objectUrl || (isDemoPreview ? demoStudioVideo : '');
  const sourceDuration = duration || (isDemoPreview ? demoStudioDuration : activeProject.sourceVideo.duration || 0);
  const sourceClips = activeProject.analysis?.clipOpportunities || emptyClipList;
  const demoClipLength = demoStudioDuration / Math.max(sourceClips.length, 1);
  const clips = useMemo(() => isDemoPreview
    ? sourceClips.map((clip, index) => ({
      ...clip,
      startTime: index * demoClipLength,
      endTime: index === sourceClips.length - 1 ? demoStudioDuration : (index + 1) * demoClipLength,
      durationSeconds: index === sourceClips.length - 1 ? demoStudioDuration - index * demoClipLength : demoClipLength,
    }))
    : sourceClips, [isDemoPreview, sourceClips, demoClipLength]);
  const studioActiveClip = useMemo(() => clips.find((clip) => clip.id === activeClip.id) || activeClip, [clips, activeClip]);
  const sourceFilename = isDemoPreview ? 'creator-studio-demo.mp4' : activeProject.sourceVideo.filename || 'No source video';
  const sourceSize = isDemoPreview ? '5.0 MB · bundled demo' : activeProject.sourceVideo.sizeFormatted || 'Local file';

  const updateEditor = useCallback((change: Partial<EditorState> | ((current: EditorState) => EditorState)) => {
    const previous = editorRef.current;
    const next = typeof change === 'function' ? change(previous) : { ...previous, ...change };
    if (JSON.stringify(previous) === JSON.stringify(next)) return;
    undoRef.current = [...undoRef.current.slice(-39), previous];
    redoRef.current = [];
    editorRef.current = next;
    setEditor(next);
    setSaveStatus('unsaved');
  }, []);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    const max = Number.isFinite(video.duration) ? video.duration : sourceDuration;
    video.currentTime = Math.max(0, Math.min(max || time, time));
    setPlayhead(video.currentTime);
  }, [sourceDuration]);
  useEffect(() => {
    let ignore = false;
    void api.getYouTubeConfigStatus().then((status) => {
      if (!ignore) {
        setYoutubeReady(status.ready);
        setYoutubeStatusMessage(status.message);
      }
    }).catch(() => {
      if (!ignore) {
        setYoutubeReady(false);
        setYoutubeStatusMessage('YouTube upload is unavailable until backend credentials are configured.');
      }
    });
    return () => { ignore = true; };
  }, []);

  const togglePlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      return;
    }
    if (selectionPlaybackRef.current && (video.currentTime < editorRef.current.startTime || video.currentTime >= editorRef.current.endTime)) {
      video.currentTime = editorRef.current.startTime;
    }
    try {
      await video.play();
    } catch {
      showNotification('Video could not be played.');
    }
  }, [showNotification]);

  const playSelection = useCallback(async () => {
    const video = videoRef.current;
    if (!video || editor.endTime <= editor.startTime) return;
    selectionPlaybackRef.current = true;
    video.currentTime = editor.startTime;
    setPlayhead(editor.startTime);
    try {
      await video.play();
    } catch {
      selectionPlaybackRef.current = false;
      showNotification('Video could not be played.');
    }
  }, [editor.endTime, editor.startTime, showNotification]);

  useEffect(() => {
    let cancelled = false;
    const initial = createInitialEditorState(activeProject.id, studioActiveClip, sourceUrl);
    originalClipRef.current = studioActiveClip;
    editorRef.current = initial;
    setEditor(initial);
    undoRef.current = [];
    redoRef.current = [];
    setPlayhead(studioActiveClip.startTime);
    setAiHook(studioActiveClip.hook);
    setAiCaption(studioActiveClip.caption);
    void loadEditorState(activeProject.id, activeClip.id).then((saved) => {
      if (cancelled) return;
      if (!saved) {
        setSaveStatus('unsaved');
        return;
      }
      const restored = { ...saved, sourceUrl, startTime: Math.max(0, saved.startTime), endTime: Math.max(saved.startTime + 0.1, saved.endTime) };
      editorRef.current = restored;
      setEditor(restored);
      setPlayhead(restored.startTime);
      setSaveStatus('saved');
    }).catch(() => {
      if (!cancelled) showNotification('Could not load the saved edit.');
    });
    return () => { cancelled = true; };
  }, [activeClip.id, activeProject.id, sourceUrl, showNotification, studioActiveClip]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackRate;
  }, [playbackRate, sourceUrl]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      if (event.code === 'Space') { event.preventDefault(); void togglePlayback(); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); seek((videoRef.current?.currentTime || 0) - 5); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); seek((videoRef.current?.currentTime || 0) + 5); }
      else if (event.key.toLowerCase() === 'i') {
        const time = videoRef.current?.currentTime || 0;
        updateEditor((current) => ({ ...current, startTime: Math.min(time, current.endTime - 0.1) }));
      } else if (event.key.toLowerCase() === 'o') {
        const time = videoRef.current?.currentTime || 0;
        updateEditor((current) => ({ ...current, endTime: Math.max(time, current.startTime + 0.1) }));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [seek, togglePlayback, updateEditor]);

  useEffect(() => {
    if (!sourceOverride) return undefined;
    return () => URL.revokeObjectURL(sourceOverride);
  }, [sourceOverride]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setPlayhead(video.currentTime);
    if (selectionPlaybackRef.current && video.currentTime >= editorRef.current.endTime) {
      video.pause();
      video.currentTime = editorRef.current.endTime;
      setPlayhead(video.currentTime);
      selectionPlaybackRef.current = false;
    }
  };

  const handleSourceFile = (file?: File) => {
    if (!file) return;
    if (sourceOverride) URL.revokeObjectURL(sourceOverride);
    const url = URL.createObjectURL(file);
    setSourceOverride(url);
    setVideoError(false);
    editorRef.current = { ...editorRef.current, sourceUrl: url };
    setEditor((current) => ({ ...current, sourceUrl: url }));
  };

  const clampRange = (start: number, end: number) => {
    const limit = sourceDuration || Math.max(activeClip.endTime, end);
    const safeStart = Math.max(0, Math.min(start, limit - 0.1));
    return { startTime: safeStart, endTime: Math.max(safeStart + 0.1, Math.min(end, limit)) };
  };

  const setTrim = (key: 'startTime' | 'endTime', value: number) => {
    updateEditor((current) => key === 'startTime'
      ? { ...current, ...clampRange(value, current.endTime) }
      : { ...current, ...clampRange(current.startTime, value) });
  };

  const onRangePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    undoRef.current = [...undoRef.current.slice(-39), editorRef.current];
    redoRef.current = [];
    rangeDragRef.current = { x: event.clientX, start: editor.startTime, end: editor.endTime };
  };

  const onRangePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!rangeDragRef.current || !timelineRef.current || !sourceDuration) return;
    const width = timelineRef.current.getBoundingClientRect().width;
    const delta = ((event.clientX - rangeDragRef.current.x) / width) * sourceDuration;
    const length = rangeDragRef.current.end - rangeDragRef.current.start;
    const start = Math.max(0, Math.min(sourceDuration - length, rangeDragRef.current.start + delta));
    const next = { ...editorRef.current, startTime: start, endTime: start + length };
    editorRef.current = next;
    setEditor(next);
    setSaveStatus('unsaved');
  };

  const undo = () => {
    const previous = undoRef.current.pop();
    if (!previous) return;
    redoRef.current.push(editorRef.current);
    editorRef.current = previous;
    setEditor(previous);
    setSaveStatus('unsaved');
    seek(Math.max(previous.startTime, Math.min(playhead, previous.endTime)));
  };

  const redo = () => {
    const next = redoRef.current.pop();
    if (!next) return;
    undoRef.current.push(editorRef.current);
    editorRef.current = next;
    setEditor(next);
    setSaveStatus('unsaved');
  };

  const resetEdit = () => {
    const original = createInitialEditorState(activeProject.id, originalClipRef.current, sourceUrl);
    updateEditor(original);
    seek(original.startTime);
  };
  const handleYoutubeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    try {
      setIsUploadingToYoutube(true);
      const response = await api.uploadToYouTube({
        file: selectedFile,
        title: `${activeProject.title} - ${activeClip.title}`,
        description: `${editor.hook}\n\n${editor.caption}\n\nGenerated by CreatorAI`,
        privacyStatus: 'private',
        tags: ['creatorai', activeProject.contentType, 'youtube'],
        onProgress: setYoutubeUploadProgress,
      });
      showNotification(`Upload sent to YouTube successfully (${response.result?.id ?? 'video uploaded'})`);
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'YouTube upload failed');
    } finally {
      setIsUploadingToYoutube(false);
      setYoutubeUploadProgress(0);
      event.target.value = '';
    }
  };

  const saveEdit = async () => {
    if (editor.startTime < 0 || editor.endTime <= editor.startTime || (sourceDuration && editor.endTime > sourceDuration)) {
      showNotification('End time must be after start time and within the source duration.');
      return;
    }
    setSaveStatus('saving');
    try {
      const result = await saveEditorState(editor);
      updateActiveClip({ startTime: editor.startTime, endTime: editor.endTime, durationSeconds: editor.endTime - editor.startTime, aspectRatio: editor.aspectRatio, hook: editor.hook, caption: editor.caption });
      setSaveStatus('saved');
      showNotification(result.cloudSynced ? 'Edit saved and synced.' : 'Edit saved on this device.');
    } catch {
      setSaveStatus('unsaved');
      showNotification('Could not save your edit.');
    }
  };

  const applySuggestion = (updates: Partial<EditorState>) => {
    updateEditor(updates);
    if (updates.startTime !== undefined) seek(updates.startTime);
  };

  const refreshSuggestions = async () => {
    setGenerating(true);
    try {
      const original = originalClipRef.current;
      const [hook, caption] = await Promise.all([api.generateHook(original.id, original), api.generateCaption(original.id, original)]);
      setAiHook(hook);
      setAiCaption(caption);
      showNotification('Qwen prepared hook and caption suggestions.');
    } catch {
      showNotification('Could not generate suggestions. Check that Ollama is running.');
    } finally {
      setGenerating(false);
    }
  };

  const markMoment = () => {
    const time = videoRef.current?.currentTime ?? playhead;
    if (time < editor.endTime - 0.1) setTrim('startTime', time);
    else setTrim('endTime', time);
  };

  const seekFromTimeline = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('.cs-timeline-clip, .cs-trim-selection, .cs-trim-input') || !timelineRef.current || !sourceDuration) return;
    const bounds = timelineRef.current.getBoundingClientRect();
    seek(((event.clientX - bounds.left) / bounds.width) * sourceDuration);
  };

  const selectionStart = sourceDuration ? (editor.startTime / sourceDuration) * 100 : 0;
  const selectionWidth = sourceDuration ? ((editor.endTime - editor.startTime) / sourceDuration) * 100 : 0;
  const playheadPosition = sourceDuration ? (playhead / sourceDuration) * 100 : 0;
  const timelineTickCount = 8 * timelineZoom;
  const timelineTicks = Array.from({ length: timelineTickCount + 1 }, (_, index) => sourceDuration * index / timelineTickCount);
  const timePosition = (time: number) => sourceDuration ? Math.max(0, Math.min(100, (time / sourceDuration) * 100)) : 0;
  const transcript = activeProject.analysis?.transcripts || [];
  const activeTranscript = transcript.find((segment) => playhead >= segment.startTime && playhead <= segment.endTime);

  if (!activeClip.id) return <div className="cs-empty">Select a clip from Content Map to start editing.</div>;

  return (
    <section className="creator-studio cs-root" aria-label="Creator Studio editor">
      <header className="cs-toolbar">
        <div className="cs-project-identity">
          <span className="cs-kicker">Creator Studio</span>
          <h1>{activeProject.title}</h1>
          <p><span className={`cs-save-dot cs-save-${saveStatus}`} />{saveStatus === 'saving' ? 'Saving' : saveStatus === 'unsaved' ? 'Unsaved changes' : 'Saved locally'}<span className="cs-divider">/</span>{activeClip.title}</p>
        </div>
        <div className="cs-composition" aria-label="Composition details">
          <span>Composition</span>
          <strong>{editor.aspectRatio}</strong>
          <span>{formatTime(editor.endTime - editor.startTime)} selected</span>
        </div>
        <div className="cs-toolbar-actions">
          <button type="button" className="cs-icon-button" aria-label="Undo" title="Undo" onClick={undo} disabled={!undoRef.current.length}><Undo2 /></button>
          <button type="button" className="cs-icon-button" aria-label="Redo" title="Redo" onClick={redo} disabled={!redoRef.current.length}><Redo2 /></button>
          <button type="button" className="cs-icon-button" aria-label="Reset edit" title="Reset edit" onClick={resetEdit}><RotateCcw /></button>
          <button type="button" className="cs-button cs-save-button" onClick={() => void saveEdit()} disabled={saveStatus === 'saving'}><Save /><span>Save</span></button>
          <button
            type="button"
            className="cs-button cs-upload-button"
            onClick={() => youtubeFileInputRef.current?.click()}
            disabled={isUploadingToYoutube || !youtubeReady}
            title={youtubeReady ? 'Upload source video to YouTube' : youtubeStatusMessage}
          >
            {isUploadingToYoutube ? <Loader2 className="cs-spinning" /> : <Upload />}
            <span>{isUploadingToYoutube ? `${youtubeUploadProgress}%` : 'YouTube'}</span>
          </button>
          <input ref={youtubeFileInputRef} className="cs-hidden-input" type="file" accept="video/*" onChange={handleYoutubeUpload} />
          <button type="button" className="cs-button cs-export-button" onClick={() => { setShowExport(true); setExportJob(null); }} disabled={!sourceUrl} title={!sourceUrl ? 'Select a source video before exporting' : 'Export clip settings'}><ArrowDownToLine /><span>Export</span></button>
        </div>
      </header>

      <div className="cs-workspace">
        <aside className="cs-library" aria-label="Clip library">
          <div className="cs-panel-heading"><div><span className="cs-kicker">Project media</span><h2>Library</h2></div><button type="button" className="cs-icon-button" onClick={() => sourcePickerRef.current?.click()} aria-label="Import source video" title="Import source video"><Upload /></button></div>
          <input ref={sourcePickerRef} className="cs-hidden-input" type="file" accept="video/*" onChange={(event) => handleSourceFile(event.target.files?.[0])} />
          <nav className="cs-library-tabs" aria-label="Library sections">
            {(['media', 'clips', 'transcript'] as LibraryTab[]).map((tab) => (
              <button type="button" key={tab} aria-pressed={libraryTab === tab} onClick={() => setLibraryTab(tab)}>
                {tab === 'media' ? <Film /> : tab === 'clips' ? <FolderOpen /> : <FileText />}
                <span>{tab === 'transcript' ? 'Text' : tab[0].toUpperCase() + tab.slice(1)}</span>
              </button>
            ))}
          </nav>

          <div className="cs-library-content">
            {libraryTab === 'media' && (
              <div className="cs-media-list">
                <button type="button" className="cs-source-card" onClick={() => sourcePickerRef.current?.click()}>
                  <span className="cs-source-thumb">
                    {activeProject.thumbnailUrl && <img src={activeProject.thumbnailUrl} alt="" loading="lazy" />}
                    <span className="cs-media-type"><Film /> Source video</span>
                  </span>
                  <span className="cs-source-meta"><strong>{activeProject.sourceVideo.filename || 'No source video selected'}</strong><small>{formatTime(sourceDuration)} · {activeProject.sourceVideo.sizeFormatted || 'Local file'}</small></span>
                </button>
                <div className="cs-embedded-audio"><Music /><span><strong>Original audio</strong><small>Embedded in source video</small></span></div>
              </div>
            )}

            {libraryTab === 'clips' && (
              <div className="cs-library-list" aria-label="Generated clip suggestions">
                {clips.length ? clips.map((clip, index) => (
                  <button type="button" key={clip.id} className={`cs-library-clip ${clip.id === activeClip.id ? 'is-active' : ''}`} onClick={() => { setActiveClip(clip); seek(clip.startTime); }}>
                    <span className="cs-library-clip-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="cs-library-clip-copy"><strong>{clip.title}</strong><small>{formatTime(clip.startTime)}–{formatTime(clip.endTime)} · {clip.topic}</small></span>
                    <span className={`cs-clip-status status-${clip.status}`} title={clip.status}>{clip.status === 'generated' ? 'Ready' : 'Suggested'}</span>
                  </button>
                )) : <p className="cs-empty-copy">No clip suggestions in this project.</p>}
              </div>
            )}

            {libraryTab === 'transcript' && (
              <div className="cs-transcript-list" aria-label="Transcript segments">
                {transcript.length ? transcript.map((segment) => (
                  <button type="button" key={segment.id} className={`cs-transcript-item ${activeTranscript?.id === segment.id ? 'is-active' : ''}`} onClick={() => seek(segment.startTime)}>
                    <time>{formatTime(segment.startTime)}</time><span>{segment.text}</span>
                  </button>
                )) : activeProject.scriptText ? <p className="cs-script-text">{activeProject.scriptText}</p> : <p className="cs-empty-copy">No script or transcript is available.</p>}
              </div>
            )}
          </div>
          <footer className="cs-library-footer"><span>{clips.length} clip suggestions</span><span>{transcript.length ? `${transcript.length} transcript segments` : 'Text source'}</span></footer>
        </aside>

        <main className="cs-preview-column" aria-label="Video preview">
          <div className="cs-preview-toolbar">
            <div className="cs-selected-clip"><span className="cs-live-indicator" /><span>{activeClip.title}</span></div>
            <div className="cs-ratio-control" role="group" aria-label="Preview aspect ratio">
              {aspectRatios.map((ratio) => <button type="button" key={ratio} aria-pressed={editor.aspectRatio === ratio} onClick={() => updateEditor({ aspectRatio: ratio })}>{ratio}</button>)}
            </div>
          </div>
          <div className="cs-preview-stage">
            <div ref={previewRef} className={`cs-video-frame ratio-${editor.aspectRatio.replace(':', '-')}`} style={{ '--cs-crop': `${editor.cropPosition}%` } as React.CSSProperties}>
              {sourceUrl && !videoError ? (
                <video
                  ref={videoRef}
                  src={sourceUrl}
                  preload="metadata"
                  playsInline
                  aria-label={`Source video: ${activeProject.sourceVideo.filename}`}
                  onLoadedMetadata={(event) => { const actual = event.currentTarget.duration; if (Number.isFinite(actual) && actual > 0) { setDuration(actual); if (editorRef.current.endTime > actual) setTrim('endTime', actual); } }}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onError={() => setVideoError(true)}
                />
              ) : (
                <div className="cs-video-empty"><Film /><strong>{videoError ? 'Video could not be loaded' : 'No source video selected'}</strong><button type="button" onClick={() => sourcePickerRef.current?.click()}>Choose a source file</button></div>
              )}
              {sourceUrl && !videoError && editor.hook && <div className="cs-hook-overlay">{editor.hook}</div>}
              {sourceUrl && !videoError && editor.captionsEnabled && editor.caption && <div className={`cs-caption-overlay caption-${editor.captionPosition}`}>{editor.caption}</div>}
            </div>
          </div>

          <div className="cs-playback-bar">
            <button type="button" className="cs-icon-button cs-play-button" onClick={() => void togglePlayback()} aria-label={playing ? 'Pause video' : 'Play video'} disabled={!sourceUrl}>{playing ? <Pause /> : <Play />}</button>
            <span className="cs-timecode">{formatTime(playhead)}<span>/</span>{formatTime(sourceDuration)}</span>
            <input aria-label="Seek video" className="cs-seek-range" type="range" min="0" max={sourceDuration || 1} step="0.05" value={Math.min(playhead, sourceDuration || 0)} onChange={(event) => seek(Number(event.target.value))} disabled={!sourceUrl} />
            <button type="button" className="cs-icon-button" aria-label={muted ? 'Unmute video' : 'Mute video'} title={muted ? 'Unmute' : 'Mute'} onClick={() => { if (!videoRef.current) return; videoRef.current.muted = !videoRef.current.muted; setMuted(videoRef.current.muted); }} disabled={!sourceUrl}>{muted ? <VolumeX /> : <Volume2 />}</button>
            <input aria-label="Volume" className="cs-volume-range" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => { const value = Number(event.target.value); setVolume(value); if (videoRef.current) { videoRef.current.volume = value; videoRef.current.muted = value === 0; setMuted(value === 0); } }} disabled={!sourceUrl} />
            <select aria-label="Playback speed" className="cs-speed-select" value={playbackRate} onChange={(event) => setPlaybackRate(Number(event.target.value))} disabled={!sourceUrl}>{[0.5, 1, 1.25, 1.5, 2].map((rate) => <option key={rate} value={rate}>{rate}×</option>)}</select>
            <button type="button" className="cs-icon-button" aria-label="Fullscreen" title="Fullscreen" onClick={() => void previewRef.current?.requestFullscreen()} disabled={!sourceUrl}><Maximize /></button>
          </div>
          <div className="cs-preview-footer">
            <button type="button" className="cs-button cs-secondary-button" onClick={() => void playSelection()} disabled={!sourceUrl}><Play /> Play selection</button>
            <button type="button" className="cs-button cs-secondary-button" onClick={markMoment} disabled={!sourceUrl}>Mark {playhead < editor.endTime - 0.1 ? 'in' : 'out'}</button>
            <span>Selection {formatTime(editor.startTime)}–{formatTime(editor.endTime)}</span>
          </div>
        </main>

        <aside className="cs-inspector" aria-label="Clip inspector">
          <div className="cs-panel-heading"><div><span className="cs-kicker">Inspector</span><h2>Clip settings</h2></div><span className="cs-inspector-index">01</span></div>
          <div className="cs-inspector-scroll">
            <details className="cs-inspector-section" open>
              <summary><span>Timing</span><span className="cs-summary-meta">{formatTime(editor.endTime - editor.startTime)}</span><ChevronDown /></summary>
              <div className="cs-time-inputs">
                <label>In<input aria-label="Clip start time in seconds" type="number" min="0" max={Math.max(0, editor.endTime - 0.1)} step="0.1" value={editor.startTime.toFixed(1)} onChange={(event) => setTrim('startTime', Number(event.target.value))} /></label>
                <label>Out<input aria-label="Clip end time in seconds" type="number" min={editor.startTime + 0.1} max={sourceDuration || undefined} step="0.1" value={editor.endTime.toFixed(1)} onChange={(event) => setTrim('endTime', Number(event.target.value))} /></label>
              </div>
              <div className="cs-range-actions"><button type="button" onClick={() => applySuggestion({ startTime: activeClip.startTime, endTime: activeClip.endTime })}>Reset to source clip</button><span>{formatTime(sourceDuration)} total</span></div>
            </details>

            <details className="cs-inspector-section" open>
              <summary><span>Frame</span><span className="cs-summary-meta">{editor.aspectRatio}</span><ChevronDown /></summary>
              <div className="cs-inspector-body">
                <div className="cs-control-heading"><span>Aspect ratio</span></div>
                <div className="cs-ratio-control cs-ratio-control-wide" role="group" aria-label="Set aspect ratio">{aspectRatios.map((ratio) => <button type="button" key={ratio} aria-pressed={editor.aspectRatio === ratio} onClick={() => updateEditor({ aspectRatio: ratio })}>{ratio}</button>)}</div>
                <label className="cs-field-label" htmlFor="studio-crop">Horizontal crop <span>{Math.round(editor.cropPosition)}%</span></label>
                <div className="cs-crop-presets"><button type="button" onClick={() => updateEditor({ cropPosition: 0 })}>Left</button><button type="button" onClick={() => updateEditor({ cropPosition: 50 })}>Center</button><button type="button" onClick={() => updateEditor({ cropPosition: 100 })}>Right</button></div>
                <input id="studio-crop" aria-label="Horizontal crop position" className="cs-range" type="range" min="0" max="100" value={editor.cropPosition} onChange={(event) => updateEditor({ cropPosition: Number(event.target.value) })} />
              </div>
            </details>

            <details className="cs-inspector-section" open>
              <summary><span>Text & captions</span><span className="cs-summary-meta">{editor.captionsEnabled ? 'On' : 'Off'}</span><ChevronDown /></summary>
              <div className="cs-inspector-body">
                <label className="cs-field-label" htmlFor="studio-hook">Hook</label>
                <textarea id="studio-hook" rows={2} value={editor.hook} onChange={(event) => updateEditor({ hook: event.target.value })} />
                <div className="cs-caption-heading"><label className="cs-field-label" htmlFor="studio-caption">Caption</label><label className="cs-toggle"><input type="checkbox" checked={editor.captionsEnabled} onChange={(event) => updateEditor({ captionsEnabled: event.target.checked })} /><span>Show</span></label></div>
                <textarea id="studio-caption" rows={3} value={editor.caption} onChange={(event) => updateEditor({ caption: event.target.value })} />
                <label className="cs-field-label" htmlFor="studio-caption-position">Position</label>
                <select id="studio-caption-position" value={editor.captionPosition} onChange={(event) => updateEditor({ captionPosition: event.target.value as CaptionPosition })}>{(['top', 'center', 'bottom'] as CaptionPosition[]).map((position) => <option key={position} value={position}>{position[0].toUpperCase() + position.slice(1)}</option>)}</select>
              </div>
            </details>

            <details className="cs-inspector-section" open>
              <summary><span>Suggestions</span><button type="button" className="cs-inline-action" onClick={(event) => { event.preventDefault(); void refreshSuggestions(); }} disabled={generating}>{generating ? 'Generating…' : 'Refresh'}</button><ChevronDown /></summary>
              <div className="cs-inspector-body cs-suggestion-list">
                <Suggestion label="Suggested trim" value={`${formatTime(activeClip.startTime)}–${formatTime(activeClip.endTime)}`} onApply={() => applySuggestion({ startTime: activeClip.startTime, endTime: activeClip.endTime })} />
                <Suggestion label="Suggested hook" value={aiHook} onApply={() => applySuggestion({ hook: aiHook })} />
                <Suggestion label="Suggested caption" value={aiCaption} onApply={() => applySuggestion({ caption: aiCaption })} />
              </div>
            </details>
          </div>
        </aside>
      </div>

      <section className="cs-timeline-dock" aria-label="Editing timeline">
        <header className="cs-timeline-heading">
          <div><span className="cs-kicker">Sequence</span><h2>Timeline</h2></div>
          <div className="cs-timeline-tools">
            <span className="cs-timeline-duration">{formatTime(sourceDuration)}</span>
            <div className="cs-zoom-control" role="group" aria-label="Timeline zoom">
              <button type="button" aria-label="Zoom out timeline" title="Zoom out" onClick={() => setTimelineZoom((zoom) => zoom === 4 ? 2 : 1)} disabled={timelineZoom === 1}><ZoomOut /></button>
              <span>{timelineZoom}×</span>
              <button type="button" aria-label="Zoom in timeline" title="Zoom in" onClick={() => setTimelineZoom((zoom) => zoom === 1 ? 2 : 4)} disabled={timelineZoom === 4}><ZoomIn /></button>
            </div>
          </div>
        </header>
        <div className="cs-timeline-scroll" aria-label="Scrollable timeline tracks">
          <div className="cs-timeline-canvas" style={{ width: `${timelineZoom * 100}%` }}>
            <div className="cs-ruler-row"><div className="cs-track-label">TIME</div><div className="cs-ruler-content">{timelineTicks.map((time, index) => <span key={index} style={{ left: `${(index / timelineTickCount) * 100}%` }}>{formatTime(time)}</span>)}</div></div>

            <div className="cs-track-row">
              <div className="cs-track-label"><Film /><span>CLIPS</span></div>
              <div className="cs-track-content cs-clips-track" onPointerDown={seekFromTimeline}>
                {clips.map((clip, index) => {
                  const left = timePosition(clip.startTime);
                  const width = Math.max(2, timePosition(clip.endTime) - left);
                  return <button type="button" key={clip.id} className={`cs-timeline-clip ${clip.id === activeClip.id ? 'is-selected' : ''}`} style={{ left: `${left}%`, width: `${width}%` }} title={`${clip.title} · ${formatTime(clip.startTime)}–${formatTime(clip.endTime)}`} onClick={() => { setActiveClip(clip); seek(clip.startTime); }}><span>{String(index + 1).padStart(2, '0')}</span><strong>{clip.title}</strong></button>;
                })}
                <div className="cs-track-playhead" style={{ left: `${playheadPosition}%` }} aria-hidden="true" />
              </div>
            </div>

            <div className="cs-track-row">
              <div className="cs-track-label"><span className="cs-track-grip">⋮⋮</span><span>TRIM</span></div>
              <div className="cs-track-content cs-trim-track" ref={timelineRef} onPointerDown={seekFromTimeline}>
                <div className="cs-trim-selection" style={{ left: `${selectionStart}%`, width: `${selectionWidth}%` }} onPointerDown={onRangePointerDown} onPointerMove={onRangePointerMove} onPointerUp={() => { rangeDragRef.current = null; }} onPointerCancel={() => { rangeDragRef.current = null; }} role="presentation"><span className="cs-trim-handle cs-trim-handle-start" /><span className="cs-trim-handle cs-trim-handle-end" /></div>
                <input aria-label="Set trim start" className="cs-trim-input cs-trim-start" type="range" min="0" max={sourceDuration || 1} step="0.1" value={Math.min(editor.startTime, sourceDuration || 0)} onChange={(event) => setTrim('startTime', Number(event.target.value))} />
                <input aria-label="Set trim end" className="cs-trim-input cs-trim-end" type="range" min="0" max={sourceDuration || 1} step="0.1" value={Math.min(editor.endTime, sourceDuration || 0)} onChange={(event) => setTrim('endTime', Number(event.target.value))} />
                <div className="cs-track-playhead" style={{ left: `${playheadPosition}%` }} aria-hidden="true" />
              </div>
            </div>

            <div className="cs-track-row">
              <div className="cs-track-label"><Music /><span>AUDIO</span></div>
              <div className="cs-track-content cs-audio-track"><div className="cs-source-audio-block" style={{ width: sourceDuration ? '100%' : '0%' }}>{isDemoPreview && <span className="cs-demo-waveform" title="Illustrative demo waveform" aria-hidden="true">{demoAudioLevels.map((level, index) => <i key={index} style={{ height: `${level}%` }} />)}</span>}<Music /><span>{isDemoPreview ? 'Demo audio' : 'Source audio'} · embedded in video</span></div><div className="cs-track-playhead" style={{ left: `${playheadPosition}%` }} aria-hidden="true" /></div>
            </div>

            <div className="cs-track-row">
              <div className="cs-track-label"><FileText /><span>CAPTIONS</span></div>
              <div className="cs-track-content cs-caption-track">
                {editor.caption ? <div className={`cs-caption-block ${editor.captionsEnabled ? '' : 'is-disabled'}`} style={{ left: `${selectionStart}%`, width: `${selectionWidth}%` }} title={editor.caption}>{editor.captionsEnabled ? editor.caption : 'Captions hidden'}</div> : <span className="cs-track-empty">No caption text</span>}
                <div className="cs-track-playhead" style={{ left: `${playheadPosition}%` }} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
        <footer className="cs-timeline-footer"><span>In <strong>{formatTime(editor.startTime)}</strong></span><span>Out <strong>{formatTime(editor.endTime)}</strong></span><span className="cs-shortcuts">Space play/pause · ←/→ seek · I/O mark in/out</span></footer>
      </section>

      {showExport && <div className="cs-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowExport(false); }}><section className="cs-export-dialog" role="dialog" aria-modal="true" aria-labelledby="studio-export-title"><header><div><span className="cs-kicker">Export settings</span><h2 id="studio-export-title">{activeClip.title}</h2></div><button type="button" className="cs-icon-button" aria-label="Close export dialog" onClick={() => setShowExport(false)}><X /></button></header>{!exportJob ? <><dl className="cs-export-summary"><div><dt>Duration</dt><dd>{formatTime(editor.endTime - editor.startTime)}</dd></div><div><dt>Aspect</dt><dd>{editor.aspectRatio}</dd></div><div><dt>Captions</dt><dd>{editor.captionsEnabled ? 'On' : 'Off'}</dd></div><div><dt>Hook</dt><dd>{editor.hook ? 'On' : 'Off'}</dd></div></dl><p className="cs-export-note">This queues the edit settings and downloads an edit recipe. Video rendering is not connected.</p><button type="button" className="cs-button cs-export-button cs-export-start" onClick={() => void createClipExportJob(editor, activeProject.sourceVideo.filename).then(setExportJob).catch(() => showNotification('Export failed. Check the selected time range.'))}><ArrowDownToLine /><span>Queue edit recipe</span></button></> : <><div className="cs-job-status"><span className="cs-job-dot" /><strong>Queued locally</strong><span>{exportJob.id}</span></div><p className="cs-export-note">No video has been encoded. Download the recipe for the configured renderer.</p><button type="button" className="cs-button cs-export-button cs-export-start" onClick={() => downloadEditRecipe(exportJob)}><ArrowDownToLine /><span>Download edit recipe</span></button></>}</section></div>}
    </section>
  );
};

function Suggestion({ label, value, onApply }: { label: string; value: string; onApply: () => void }) {
  return <div className="cs-suggestion"><div><span>{label}</span><p>{value || 'No suggestion available.'}</p></div><button type="button" onClick={onApply}>Apply</button></div>;
}