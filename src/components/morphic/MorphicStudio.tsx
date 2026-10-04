import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clapperboard,
  Download,
  Edit3,
  Film,
  Image as ImageIcon,
  Layers,
  LoaderCircle,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
  Video,
} from 'lucide-react';
import {
  combineGeneratedScenes,
  generateScene,
  getScriptToVideoJob,
  loadDemoJob,
  planScriptToVideo,
} from '../../services/scriptToVideo';
import { AspectRatio, ScriptScene, ScriptToVideoJob, ScriptToVideoJobStatus } from '../../types/scriptToVideo';
import './morphicStudio.css';

export const MorphicStudio: React.FC = () => {
  // Input form state
  const [script, setScript] = useState('');
  const [visualDirection, setVisualDirection] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [refImagePreview, setRefImagePreview] = useState<string | null>(null);

  // Job & Pipeline state
  const [job, setJob] = useState<ScriptToVideoJob | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);

  // UI / Editing state
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // Reference Image Upload Handler
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setReferenceImageUrl(result);
      setRefImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const removeReferenceImage = () => {
    setReferenceImageUrl('');
    setRefImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Primary Pipeline Handler: SCRIPT -> SCENE PLAN -> VIDEO GENERATION -> COMBINE -> READY
  const startScriptToVideoPipeline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!script.trim()) {
      setError('Please enter a script first.');
      return;
    }

    if (script.trim().length < 10) {
      setError('Please enter at least a complete sentence for your script.');
      return;
    }

    setError(null);
    setLoadingPlan(true);

    try {
      // Step 1: AI Scene Planner
      const newJob = await planScriptToVideo({
        script: script.trim(),
        visualDirection: visualDirection.trim() || undefined,
        aspectRatio,
        referenceImageUrl: referenceImageUrl.trim() || undefined,
      });

      setJob(newJob);
      setLoadingPlan(false);

      // Step 2: Sequential Scene Generation
      let currentJobState = newJob;
      for (const scene of newJob.scenes) {
        setJob((prev) => (prev ? { ...prev, currentSceneIndex: scene.sceneIndex - 1, status: 'GENERATING' } : prev));
        const { job: updatedJob } = await generateScene(newJob.id, scene.id);
        currentJobState = updatedJob;
        setJob(updatedJob);
      }

      // Step 3: Combine Scenes into Final Video
      setJob((prev) => (prev ? { ...prev, status: 'COMBINING' } : prev));
      const finalJob = await combineGeneratedScenes(newJob.id);
      setJob(finalJob);
      setActiveSceneId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video generation failed.');
      setLoadingPlan(false);
      setJob((prev) => (prev ? { ...prev, status: 'FAILED' } : null));
    }
  };

  // Single Scene Retry / Regeneration
  const retrySingleScene = async (sceneId: string, promptOverride?: string) => {
    if (!job) return;
    setError(null);
    try {
      const { job: updatedJob } = await generateScene(job.id, sceneId, promptOverride);
      setJob(updatedJob);
      setEditingSceneId(null);

      // Check if all scenes are ready, then re-combine
      const allReady = updatedJob.scenes.every((s) => s.status === 'ready');
      if (allReady) {
        const finalJob = await combineGeneratedScenes(job.id);
        setJob(finalJob);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scene generation failed.');
    }
  };

  // Load Demo Job
  const triggerDemoMode = async () => {
    setError(null);
    setLoadingPlan(true);
    try {
      const demoJob = await loadDemoJob();
      setScript(demoJob.script);
      setVisualDirection(demoJob.visualDirection || '');
      setAspectRatio(demoJob.aspectRatio);
      setJob(demoJob);
      setActiveSceneId(null);
    } catch (err) {
      setError('Could not load Demo job.');
    } finally {
      setLoadingPlan(false);
    }
  };

  // Currently playing video URL
  const currentVideoUrl = useMemo(() => {
    if (!job) return null;
    if (activeSceneId) {
      const scene = job.scenes.find((s) => s.id === activeSceneId);
      if (scene?.videoUrl) return scene.videoUrl;
    }
    return job.finalVideoUrl || job.scenes.find((s) => s.videoUrl)?.videoUrl || null;
  }, [job, activeSceneId]);

  return (
    <div className="stv-container">
      {/* Workspace Header */}
      <header className="stv-header">
        <div className="stv-header-title">
          <Clapperboard className="w-5 h-5 text-terracotta" />
          <div>
            <h1>Script to Video</h1>
            <p>Turn text scripts into multi-scene cinematic videos with AI scene planning and video generation.</p>
          </div>
        </div>
        <div className="stv-header-actions">
          <button type="button" className="stv-btn-secondary" onClick={triggerDemoMode} disabled={loadingPlan}>
            <Sparkles className="w-4 h-4" />
            <span>Load Demo Script</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Workspace Layout */}
      <div className="stv-grid">
        {/* LEFT COLUMN: SCRIPT INPUT FORM */}
        <section className="stv-panel stv-form-panel">
          <div className="stv-panel-title">
            <Layers className="w-4 h-4 text-accent" />
            <h2>1. Script & Parameters</h2>
          </div>

          <form onSubmit={startScriptToVideoPipeline} className="stv-form">
            {/* Script Textarea */}
            <div className="stv-field">
              <label htmlFor="script-input">
                Script <span className="text-terracotta">*</span>
              </label>
              <textarea
                id="script-input"
                rows={7}
                value={script}
                onChange={(e) => {
                  setScript(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Describe the video you want to create, or paste your script here..."
                required
              />
            </div>

            {/* Optional Visual Direction */}
            <div className="stv-field">
              <label htmlFor="visual-direction">Optional Visual Direction</label>
              <textarea
                id="visual-direction"
                rows={3}
                value={visualDirection}
                onChange={(e) => setVisualDirection(e.target.value)}
                placeholder="Style, mood, camera direction, environment, pacing..."
              />
            </div>

            {/* Aspect Ratio Selector */}
            <div className="stv-field">
              <label>Aspect Ratio</label>
              <div className="stv-aspect-options">
                {(['9:16', '16:9', '1:1'] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    className={`stv-aspect-btn ${aspectRatio === ratio ? 'active' : ''}`}
                    onClick={() => setAspectRatio(ratio)}
                  >
                    <span>{ratio}</span>
                    <small>{ratio === '9:16' ? 'Vertical (Reels/Shorts)' : ratio === '16:9' ? 'Landscape (YouTube)' : 'Square'}</small>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Reference Image */}
            <div className="stv-field">
              <label>Optional Reference Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {refImagePreview ? (
                <div className="stv-image-preview">
                  <img src={refImagePreview} alt="Reference preview" />
                  <button type="button" onClick={removeReferenceImage} className="stv-remove-img" title="Remove image">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="stv-upload-box"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-5 h-5 text-muted" />
                  <span>Upload Reference Image</span>
                </button>
              )}
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="stv-error-box" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              className="stv-btn-primary"
              disabled={loadingPlan || job?.status === 'GENERATING' || job?.status === 'PLANNING'}
            >
              {loadingPlan || job?.status === 'PLANNING' ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  <span>Planning Scenes with AI...</span>
                </>
              ) : job?.status === 'GENERATING' ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  <span>Generating Video Scenes...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  <span>Generate Video</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* CENTER COLUMN: MAIN VIDEO PREVIEW & WORKSPACE */}
        <section className="stv-panel stv-preview-panel">
          <div className="stv-panel-title">
            <Video className="w-4 h-4 text-accent" />
            <h2>
              {activeSceneId
                ? `Scene ${job?.scenes.find((s) => s.id === activeSceneId)?.sceneIndex} Preview`
                : job?.status === 'READY'
                ? 'Final Combined Video'
                : 'Video Preview'}
            </h2>
          </div>

          {/* Initial State - Before Generation */}
          {!job && !loadingPlan && (
            <div className="stv-preview-empty">
              <Clapperboard className="w-12 h-12 text-muted opacity-40" />
              <h3>Ready to Generate Video</h3>
              <p>Type your script on the left and click Generate Video. AI will plan scenes and generate your video automatically.</p>
            </div>
          )}

          {/* Loading / Progress Checklist State */}
          {(loadingPlan || (job && job.status !== 'READY' && job.status !== 'FAILED')) && (
            <div className="stv-progress-card">
              <h3>Generating Video Pipeline</h3>
              <div className="stv-checklist">
                <div className={`stv-step ${job ? 'done' : 'active'}`}>
                  {job ? <Check className="w-4 h-4 text-green-400" /> : <LoaderCircle className="w-4 h-4 animate-spin text-terracotta" />}
                  <span>Planning Scenes (Gemini AI)</span>
                </div>

                {job?.scenes.map((sc, idx) => (
                  <div
                    key={sc.id}
                    className={`stv-step ${sc.status === 'ready' ? 'done' : sc.status === 'generating' ? 'active' : 'queued'}`}
                  >
                    {sc.status === 'ready' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : sc.status === 'generating' ? (
                      <LoaderCircle className="w-4 h-4 animate-spin text-terracotta" />
                    ) : (
                      <div className="stv-dot" />
                    )}
                    <span>Generating Scene {idx + 1} ({sc.duration}s)</span>
                  </div>
                ))}

                <div className={`stv-step ${job?.status === 'READY' ? 'done' : job?.status === 'COMBINING' ? 'active' : 'queued'}`}>
                  {job?.status === 'READY' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : job?.status === 'COMBINING' ? (
                    <LoaderCircle className="w-4 h-4 animate-spin text-terracotta" />
                  ) : (
                    <div className="stv-dot" />
                  )}
                  <span>Combining Segments into Final Video</span>
                </div>
              </div>
            </div>
          )}

          {/* Active Video Player Display */}
          {currentVideoUrl && (
            <div className="stv-player-container">
              <video
                ref={videoPlayerRef}
                src={currentVideoUrl}
                controls
                autoPlay
                preload="metadata"
                className={`stv-video-player aspect-${aspectRatio.replace(':', '-')}`}
              />
              <div className="stv-player-controls-bar">
                {activeSceneId && (
                  <button type="button" className="stv-btn-sm" onClick={() => setActiveSceneId(null)}>
                    <span>View Final Video</span>
                  </button>
                )}
                {job?.finalVideoUrl && (
                  <a href={job.finalVideoUrl} download="final_video.mp4" target="_blank" rel="noreferrer" className="stv-btn-primary-sm">
                    <Download className="w-4 h-4" />
                    <span>Export Video</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: SCENE BREAKDOWN & EDITABLE PROMPTS */}
        <section className="stv-panel stv-scenes-panel">
          <div className="stv-panel-title">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2>Scene Plan ({job?.scenes.length || 0})</h2>
          </div>

          {!job?.scenes.length ? (
            <div className="stv-scenes-empty">
              <p>Scene breakdown will appear here after AI planning.</p>
            </div>
          ) : (
            <div className="stv-scenes-list">
              {job.scenes.map((scene, idx) => {
                const isSelected = activeSceneId === scene.id;
                const isEditing = editingSceneId === scene.id;

                return (
                  <article key={scene.id} className={`stv-scene-card ${isSelected ? 'active' : ''}`}>
                    <header className="stv-scene-card-header">
                      <div className="stv-scene-badge">
                        <span>Scene {String(idx + 1).padStart(2, '0')}</span>
                        <small>0:0{idx * 8}–0:0{(idx + 1) * 8}s</small>
                      </div>
                      <span className={`stv-status-chip status-${scene.status}`}>{scene.status}</span>
                    </header>

                    <p className="stv-scene-narrative">"{scene.narrative}"</p>

                    {/* Editable Prompt Section */}
                    {isEditing ? (
                      <div className="stv-prompt-editor">
                        <textarea
                          rows={3}
                          value={editedPrompt}
                          onChange={(e) => setEditedPrompt(e.target.value)}
                        />
                        <div className="stv-editor-actions">
                          <button
                            type="button"
                            className="stv-btn-primary-sm"
                            onClick={() => retrySingleScene(scene.id, editedPrompt)}
                          >
                            <span>Regenerate Scene</span>
                          </button>
                          <button type="button" className="stv-btn-sm" onClick={() => setEditingSceneId(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="stv-scene-prompt">
                        <strong>Visual Direction:</strong> {scene.visualPrompt}
                      </p>
                    )}

                    <footer className="stv-scene-actions">
                      {scene.videoUrl && (
                        <button
                          type="button"
                          className="stv-btn-sm"
                          onClick={() => setActiveSceneId(scene.id)}
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                      )}
                      {!isEditing && (
                        <button
                          type="button"
                          className="stv-btn-sm"
                          onClick={() => {
                            setEditingSceneId(scene.id);
                            setEditedPrompt(scene.visualPrompt);
                          }}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Prompt</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="stv-btn-sm"
                        onClick={() => retrySingleScene(scene.id)}
                        title="Retry scene video generation"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
