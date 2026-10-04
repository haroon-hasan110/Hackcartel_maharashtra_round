import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, Loader2, Maximize, Pause, Play, Redo2, RotateCcw, Save, Undo2, Upload, Volume2, VolumeX, X } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../services/api';
import { createClipExportJob, downloadEditRecipe } from '../../services/clipExport';
import { loadEditorState, saveEditorState } from '../../services/editorPersistence';
import type { ClipCandidate } from '../../types/project';
import { createInitialEditorState, type CaptionPosition, type ClipExportJob, type EditorAspectRatio, type EditorState } from '../../types/editor';
import './creatorStudio.css';

const formatTime = (seconds: number) => {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(Math.floor(safe % 60)).padStart(2, '0')}`;
};

const aspectRatios: EditorAspectRatio[] = ['9:16', '16:9', '1:1'];

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

  const sourceUrl = sourceOverride || activeProject.sourceVideo.objectUrl || '';
  const sourceDuration = duration || activeProject.sourceVideo.duration || 0;
  const clips = activeProject.analysis?.clipOpportunities || [];

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
    const initial = createInitialEditorState(activeProject.id, activeClip, sourceUrl);
    originalClipRef.current = activeClip;
    editorRef.current = initial;
    setEditor(initial);
    undoRef.current = [];
    redoRef.current = [];
    setPlayhead(activeClip.startTime);
    setAiHook(activeClip.hook);
    setAiCaption(activeClip.caption);
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
  }, [activeClip.id, activeProject.id, sourceUrl, showNotification]);

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
    if (target.closest('.studio-timeline-selection, .studio-trim-input') || !timelineRef.current || !sourceDuration) return;
    const bounds = timelineRef.current.getBoundingClientRect();
    seek(((event.clientX - bounds.left) / bounds.width) * sourceDuration);
  };

  const selectionStart = sourceDuration ? (editor.startTime / sourceDuration) * 100 : 0;
  const selectionWidth = sourceDuration ? ((editor.endTime - editor.startTime) / sourceDuration) * 100 : 0;
  const playheadPosition = sourceDuration ? (playhead / sourceDuration) * 100 : 0;
  const transcript = activeProject.analysis?.transcripts || [];
  const activeTranscript = transcript.find((segment) => playhead >= segment.startTime && playhead <= segment.endTime);

  if (!activeClip.id) return <div className="studio-empty">Select a clip from Content Map to start editing.</div>;

  return (
    <section className="creator-studio" aria-label="Creator Studio editor">
      <header className="studio-header">
        <div><h1>Creator Studio</h1><p>{activeProject.title} <span>/</span> {activeClip.title}</p></div>
        <div className="studio-header-actions">
          <span className={`studio-save-state studio-save-${saveStatus}`} role="status">{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'unsaved' ? 'Unsaved' : 'Saved'}</span>
          <button type="button" className="studio-icon-button" aria-label="Undo" title="Undo" onClick={undo} disabled={!undoRef.current.length}><Undo2 /></button>
          <button type="button" className="studio-icon-button" aria-label="Redo" title="Redo" onClick={redo} disabled={!redoRef.current.length}><Redo2 /></button>
          <button type="button" className="studio-button studio-button-secondary" onClick={resetEdit}><RotateCcw /> Reset edit</button>
          <button type="button" className="studio-button studio-button-secondary" onClick={() => void saveEdit()} disabled={saveStatus === 'saving'}><Save /> Save Edit</button>
          <button type="button" className="studio-button studio-button-primary" onClick={() => { setShowExport(true); setExportJob(null); }} disabled={!sourceUrl} title={!sourceUrl ? 'Select a source video before exporting' : 'Export clip settings'}><ArrowDownToLine /> Export Clip</button>
        </div>
      </header>

      <div className="studio-workspace">
        <aside className="studio-assets" aria-label="Media and transcript">
          <section className="studio-section">
            <div className="studio-section-heading"><h2>Source</h2></div>
            <div className="studio-source-name">{activeProject.sourceVideo.filename || 'No source video'}</div>
            <div className="studio-muted">{formatTime(sourceDuration)} total</div>
            <button type="button" className="studio-link-button" onClick={() => sourcePickerRef.current?.click()}>{sourceUrl ? 'Replace source video' : 'Select source video'}</button>
            <input ref={sourcePickerRef} className="studio-visually-hidden" type="file" accept="video/*" onChange={(event) => handleSourceFile(event.target.files?.[0])} />
          </section>
          <section className="studio-section">
            <div className="studio-section-heading"><h2>Generated clips</h2><span>{clips.length}</span></div>
            {clips.length ? clips.map((clip, index) => <button type="button" key={clip.id} className={`studio-clip-item ${clip.id === activeClip.id ? 'is-active' : ''}`} onClick={() => setActiveClip(clip)}><span>Clip {String(index + 1).padStart(2, '0')}</span><strong>{clip.title}</strong><small>{formatTime(clip.startTime)} - {formatTime(clip.endTime)}</small></button>) : <p className="studio-muted">No clips in this project yet.</p>}
          </section>
          <section className="studio-section studio-transcript-section">
            <div className="studio-section-heading"><h2>Script / transcript</h2></div>
            {transcript.length ? transcript.map((segment) => <button type="button" key={segment.id} className={`studio-transcript-line ${activeTranscript?.id === segment.id ? 'is-current' : ''}`} onClick={() => seek(segment.startTime)}><time>{formatTime(segment.startTime)}</time><span>{segment.text}</span></button>) : activeProject.scriptText ? <p className="studio-script-text">{activeProject.scriptText}</p> : <p className="studio-muted">No transcript available for this source.</p>}
          </section>
        </aside>

        <main className="studio-preview-column">
          <div className="studio-preview-toolbar"><div className="studio-segment-label">{activeClip.title}</div><div className="studio-ratio-control" role="group" aria-label="Preview aspect ratio">{aspectRatios.map((ratio) => <button type="button" key={ratio} aria-pressed={editor.aspectRatio === ratio} onClick={() => updateEditor({ aspectRatio: ratio })}>{ratio}</button>)}</div></div>
          <div className="studio-preview-stage">
            <div ref={previewRef} className={`studio-video-frame ratio-${editor.aspectRatio.replace(':', '-')}`} style={{ '--studio-crop': `${editor.cropPosition}%` } as React.CSSProperties}>
              {sourceUrl && !videoError ? <video ref={videoRef} src={sourceUrl} preload="metadata" playsInline aria-label={`Source video: ${activeProject.sourceVideo.filename}`} onLoadedMetadata={(event) => { const actual = event.currentTarget.duration; setDuration(actual); if (actual > 0 && editorRef.current.endTime > actual) setTrim('endTime', actual); }} onTimeUpdate={handleTimeUpdate} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setVideoError(true)} /> : <div className="studio-video-empty"><div><Play aria-hidden="true" /><strong>{videoError ? 'Video could not be loaded.' : 'Select a source video to preview.'}</strong><span>Reconnect the source video to preview this edit.</span></div></div>}
              {sourceUrl && !videoError && editor.hook && <div className="studio-hook-overlay">{editor.hook}</div>}
              {sourceUrl && !videoError && editor.captionsEnabled && editor.caption && <div className={`studio-caption-overlay caption-${editor.captionPosition}`}>{editor.caption}</div>}
            </div>
          </div>
          <div className="studio-player-controls">
            <button type="button" className="studio-icon-button" onClick={() => void togglePlayback()} aria-label={playing ? 'Pause video' : 'Play video'} disabled={!sourceUrl}>{playing ? <Pause /> : <Play />}</button>
            <span className="studio-time-readout">{formatTime(playhead)} <span>/</span> {formatTime(sourceDuration)}</span>
            <input aria-label="Seek video" className="studio-seek-range" type="range" min="0" max={sourceDuration || 1} step="0.05" value={Math.min(playhead, sourceDuration || 0)} onChange={(event) => seek(Number(event.target.value))} disabled={!sourceUrl} />
            <button type="button" className="studio-icon-button" aria-label={muted ? 'Unmute video' : 'Mute video'} onClick={() => { if (!videoRef.current) return; videoRef.current.muted = !videoRef.current.muted; setMuted(videoRef.current.muted); }} disabled={!sourceUrl}>{muted ? <VolumeX /> : <Volume2 />}</button>
            <input aria-label="Volume" className="studio-volume-range" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => { const value = Number(event.target.value); setVolume(value); if (videoRef.current) { videoRef.current.volume = value; videoRef.current.muted = value === 0; setMuted(value === 0); } }} disabled={!sourceUrl} />
            <select aria-label="Playback speed" value={playbackRate} onChange={(event) => setPlaybackRate(Number(event.target.value))}>{[0.5, 1, 1.25, 1.5, 2].map((rate) => <option key={rate} value={rate}>{rate}x</option>)}</select>
            <button type="button" className="studio-icon-button" aria-label="Fullscreen" onClick={() => void previewRef.current?.requestFullscreen()} disabled={!sourceUrl}><Maximize /></button>
          </div>
          <div className="studio-selection-controls"><button type="button" className="studio-button studio-button-primary" onClick={() => void playSelection()} disabled={!sourceUrl}><Play /> Play selection</button><button type="button" className="studio-button studio-button-secondary" onClick={() => { const time = videoRef.current?.currentTime ?? playhead; setTrim(time < editor.endTime - 0.1 ? 'startTime' : 'endTime', time); }} disabled={!sourceUrl}>Mark {playhead < editor.endTime - 0.1 ? 'start' : 'end'}</button><span>Selected {formatTime(editor.startTime)} - {formatTime(editor.endTime)}</span></div>
        </main>

        <aside className="studio-edit-panel" aria-label="Edit controls">
          <section className="studio-section studio-ai-section">
            <div className="studio-section-heading"><h2>AI suggestion</h2><button type="button" className="studio-link-button" onClick={() => void refreshSuggestions()} disabled={generating}>{generating ? 'Generating...' : 'Refresh'}</button></div>
            <Suggestion label="Suggested trim" value={`${formatTime(activeClip.startTime)} - ${formatTime(activeClip.endTime)}`} onApply={() => applySuggestion({ startTime: activeClip.startTime, endTime: activeClip.endTime })} />
            <Suggestion label="Suggested hook" value={aiHook} onApply={() => applySuggestion({ hook: aiHook })} />
            <Suggestion label="Suggested caption" value={aiCaption} onApply={() => applySuggestion({ caption: aiCaption })} />
          </section>
          <section className="studio-section">
            <div className="studio-section-heading"><h2>Clip</h2></div>
            <div className="studio-time-inputs"><label>Start<input aria-label="Clip start time in seconds" type="number" min="0" max={Math.max(0, editor.endTime - 0.1)} step="0.1" value={editor.startTime.toFixed(1)} onChange={(event) => setTrim('startTime', Number(event.target.value))} /></label><label>End<input aria-label="Clip end time in seconds" type="number" min={editor.startTime + 0.1} max={sourceDuration || undefined} step="0.1" value={editor.endTime.toFixed(1)} onChange={(event) => setTrim('endTime', Number(event.target.value))} /></label></div>
          </section>
          <section className="studio-section">
            <div className="studio-section-heading"><h2>Reframe</h2><span>{Math.round(editor.cropPosition)}%</span></div>
            <div className="studio-crop-shortcuts"><button type="button" onClick={() => updateEditor({ cropPosition: 0 })}>Left</button><button type="button" onClick={() => updateEditor({ cropPosition: 50 })}>Center</button><button type="button" onClick={() => updateEditor({ cropPosition: 100 })}>Right</button></div>
            <input aria-label="Horizontal crop position" className="studio-full-range" type="range" min="0" max="100" value={editor.cropPosition} onChange={(event) => updateEditor({ cropPosition: Number(event.target.value) })} />
          </section>
          <section className="studio-section">
            <div className="studio-section-heading"><h2>Content</h2></div>
            <label className="studio-field-label" htmlFor="studio-hook">Hook</label><textarea id="studio-hook" rows={2} value={editor.hook} onChange={(event) => updateEditor({ hook: event.target.value })} />
            <div className="studio-content-heading"><label className="studio-field-label" htmlFor="studio-caption">Caption</label><label className="studio-toggle"><input type="checkbox" checked={editor.captionsEnabled} onChange={(event) => updateEditor({ captionsEnabled: event.target.checked })} /> Show</label></div>
            <textarea id="studio-caption" rows={3} value={editor.caption} onChange={(event) => updateEditor({ caption: event.target.value })} />
            <label className="studio-field-label" htmlFor="studio-caption-position">Caption position</label><select id="studio-caption-position" value={editor.captionPosition} onChange={(event) => updateEditor({ captionPosition: event.target.value as CaptionPosition })}>{(['top', 'center', 'bottom'] as CaptionPosition[]).map((position) => <option key={position} value={position}>{position[0].toUpperCase() + position.slice(1)}</option>)}</select>
          </section>
        </aside>

        <section className="studio-timeline" aria-label="Clip trim timeline">
          <div className="studio-section-heading"><h2>Timeline</h2><span>{formatTime(editor.endTime - editor.startTime)} selected</span></div>
          <div className="studio-timeline-track" ref={timelineRef} onPointerDown={seekFromTimeline}>
            <div className="studio-timeline-selection" style={{ left: `${selectionStart}%`, width: `${selectionWidth}%` }} onPointerDown={onRangePointerDown} onPointerMove={onRangePointerMove} onPointerUp={() => { rangeDragRef.current = null; }} onPointerCancel={() => { rangeDragRef.current = null; }} role="presentation"><span className="studio-trim-handle start" /><span className="studio-trim-handle end" /></div>
            <div className="studio-playhead" style={{ left: `${playheadPosition}%` }} aria-hidden="true" />
            <input aria-label="Set trim start" className="studio-trim-input trim-start" type="range" min="0" max={sourceDuration || 1} step="0.1" value={Math.min(editor.startTime, sourceDuration || 0)} onChange={(event) => setTrim('startTime', Number(event.target.value))} />
            <input aria-label="Set trim end" className="studio-trim-input trim-end" type="range" min="0" max={sourceDuration || 1} step="0.1" value={Math.min(editor.endTime, sourceDuration || 0)} onChange={(event) => setTrim('endTime', Number(event.target.value))} />
          </div>
          <div className="studio-timeline-scale"><span>00:00:00</span><span>{formatTime(sourceDuration / 2)}</span><span>{formatTime(sourceDuration)}</span></div>
          <input aria-label="Seek timeline playhead" className="studio-full-range studio-timeline-seek" type="range" min="0" max={sourceDuration || 1} step="0.05" value={Math.min(playhead, sourceDuration || 0)} onChange={(event) => seek(Number(event.target.value))} disabled={!sourceUrl} />
          <div className="studio-timeline-values"><span>In {formatTime(editor.startTime)}</span><span>Out {formatTime(editor.endTime)}</span><span>Space play/pause · arrows seek · I/O mark in/out</span></div>
        </section>
      </div>

      {showExport && <div className="studio-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowExport(false); }}><section className="studio-export-dialog" role="dialog" aria-modal="true" aria-labelledby="studio-export-title"><header><div><h2 id="studio-export-title">Export Clip</h2><p>{activeClip.title}</p></div><button type="button" className="studio-icon-button" aria-label="Close export dialog" onClick={() => setShowExport(false)}><X /></button></header>{!exportJob ? <><dl className="studio-export-summary"><div><dt>Duration</dt><dd>{formatTime(editor.endTime - editor.startTime)}</dd></div><div><dt>Format</dt><dd>{editor.aspectRatio}</dd></div><div><dt>Caption</dt><dd>{editor.captionsEnabled ? 'Enabled' : 'Disabled'}</dd></div><div><dt>Hook</dt><dd>{editor.hook ? 'Enabled' : 'Disabled'}</dd></div></dl><p className="studio-export-note">No video renderer is connected. This queues your edit settings and creates an edit recipe; it does not render an MP4.</p><button type="button" className="studio-button studio-button-primary studio-export-start" onClick={() => void createClipExportJob(editor, activeProject.sourceVideo.filename).then(setExportJob).catch(() => showNotification('Export failed. Check the selected time range.'))}><ArrowDownToLine /> Queue export</button></> : <><div className="studio-job-status"><span className="studio-job-dot" /><strong>Queued</strong><span>{exportJob.id}</span></div><p className="studio-export-note">The job is saved locally and waiting for a renderer. Your source video has not been encoded.</p><button type="button" className="studio-button studio-button-primary studio-export-start" onClick={() => downloadEditRecipe(exportJob)}><ArrowDownToLine /> Download edit recipe</button></>}</section></div>}
    </section>
  );
};

function Suggestion({ label, value, onApply }: { label: string; value: string; onApply: () => void }) {
  return <div className="studio-suggestion"><div><span>{label}</span><p>{value || 'No suggestion available.'}</p></div><button type="button" onClick={onApply}>Apply</button></div>;
}