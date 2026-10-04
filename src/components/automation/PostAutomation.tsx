import React, { useMemo, useRef, useState } from 'react';
import { Check, FileVideo, Loader2, Send, Sparkles, Twitter, Upload, Youtube } from 'lucide-react';
import { api } from '../../services/api';
import { useProject } from '../../context/ProjectContext';

type XDraft = { hook: string; postBody: string };

export const PostAutomation: React.FC = () => {
  const { activeClip, activeProject, showNotification } = useProject();
  const [prompt, setPrompt] = useState('Turn this clip into a sharp, useful X post for creators. Lead with the main insight and end with a practical takeaway.');
  const [draft, setDraft] = useState<XDraft>({ hook: '', postBody: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [youtubeTitle, setYoutubeTitle] = useState(activeClip.title || 'CreatorAI clip');
  const [youtubeDescription, setYoutubeDescription] = useState(activeClip.caption || '');
  const [youtubeTags, setYoutubeTags] = useState('creatorai, content, video');
  const [youtubeFile, setYoutubeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const postText = useMemo(() => `${draft.hook}${draft.postBody ? `\n\n${draft.postBody}` : ''}`.trim(), [draft]);
  const characterCount = postText.length;

  const generatePost = async () => {
    if (!prompt.trim()) {
      showNotification('Tell the assistant what kind of X post to write.');
      return;
    }
    setIsGenerating(true);
    try {
      const generated = await api.generateXPostFromPrompt(prompt.trim());
      setDraft(generated);
      showNotification('X post generated with Ollama');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not generate the X post.');
    } finally {
      setIsGenerating(false);
    }
  };

  const publishPost = async () => {
    if (!postText || characterCount > 280) return;
    setIsPublishing(true);
    try {
      await api.publishXPost({ clipId: activeClip.id || 'prompt-post', hook: draft.hook, postBody: draft.postBody });
      showNotification('X post published successfully');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not publish to X.');
    } finally {
      setIsPublishing(false);
    }
  };

  const uploadToYouTube = async () => {
    if (!youtubeFile) {
      fileInputRef.current?.click();
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    try {
      await api.uploadToYouTube({
        file: youtubeFile,
        title: youtubeTitle.trim() || activeClip.title || 'CreatorAI clip',
        description: youtubeDescription,
        tags: youtubeTags.split(',').map((tag) => tag.trim()).filter(Boolean),
        onProgress: setUploadProgress,
      });
      showNotification('Video uploaded to YouTube');
      setYoutubeFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not upload to YouTube.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="max-w-3xl">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-accent-terracotta)' }}>
          Distribution workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>
          Post Automation
        </h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          Give Ollama a direction, shape the result, then send it straight to X or YouTube.
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="clay-card rounded-2xl p-5 md:p-6 space-y-5" style={{ backgroundColor: 'var(--color-bg-card-elevated)', borderColor: 'var(--color-border-subtle)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white"><Twitter className="h-4 w-4" /></div>
                <div>
                  <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-main)' }}>X Post Generator</h2>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Ollama assistant</p>
                </div>
              </div>
            </div>
            <span className="rounded-full border px-2.5 py-1 font-mono text-[10px]" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>280 max</span>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold" style={{ color: 'var(--color-text-main)' }}>What should the assistant write?</span>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={5} className="w-full resize-y rounded-xl border bg-transparent p-3 text-sm outline-none" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }} placeholder="Example: Write a contrarian post about why creators should keep editorial control..." />
          </label>

          <button type="button" onClick={() => void generatePost()} disabled={isGenerating} className="clay-button-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold disabled:opacity-50">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? 'Writing with Ollama...' : 'Generate X post'}
          </button>

          <div className="border-t pt-5" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-main)' }}>Editable draft</span>
              <span className={`font-mono text-[11px] ${characterCount > 280 ? 'text-red-500' : ''}`} style={characterCount <= 280 ? { color: 'var(--color-text-muted)' } : undefined}>{characterCount}/280</span>
            </div>
            <textarea aria-label="X post draft" value={postText} onChange={(event) => setDraft({ hook: '', postBody: event.target.value })} rows={8} className="w-full resize-y rounded-xl border bg-transparent p-3 text-sm leading-relaxed outline-none" style={{ borderColor: characterCount > 280 ? '#ef4444' : 'var(--color-border)', color: 'var(--color-text-main)' }} placeholder="Your generated post will appear here." />
            <p className="mt-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Edit the complete post above. The first line is sent as the post hook.</p>
          </div>

          <button type="button" onClick={() => void publishPost()} disabled={!postText || characterCount > 280 || isPublishing} className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40">
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isPublishing ? 'Publishing to X...' : 'Post directly to X'}
          </button>
        </section>

        <section className="clay-card rounded-2xl p-5 md:p-6 space-y-5" style={{ backgroundColor: 'var(--color-bg-card-elevated)', borderColor: 'var(--color-border-subtle)' }}>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white"><Youtube className="h-4 w-4" /></div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-main)' }}>YouTube Upload</h2>
              <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Send a finished video to your channel</p>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={(event) => setYoutubeFile(event.target.files?.[0] || null)} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center gap-3 rounded-xl border border-dashed p-4 text-left transition-colors hover:border-red-500" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}>
            <FileVideo className="h-5 w-5" style={{ color: '#ef4444' }} />
            <span className="min-w-0 flex-1 truncate text-xs">{youtubeFile?.name || 'Choose a video file'}</span>
            <Upload className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>

          <label className="block"><span className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--color-text-main)' }}>Title</span><input value={youtubeTitle} onChange={(event) => setYoutubeTitle(event.target.value)} className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }} /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--color-text-main)' }}>Description</span><textarea value={youtubeDescription} onChange={(event) => setYoutubeDescription(event.target.value)} rows={4} className="w-full resize-y rounded-xl border bg-transparent p-3 text-sm outline-none" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }} /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--color-text-main)' }}>Tags</span><input value={youtubeTags} onChange={(event) => setYoutubeTags(event.target.value)} className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }} /></label>

          {isUploading && <div><div className="mb-1 flex justify-between text-[11px]" style={{ color: 'var(--color-text-muted)' }}><span>Uploading</span><span>{uploadProgress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-black/10"><div className="h-full bg-red-500 transition-all" style={{ width: `${uploadProgress}%` }} /></div></div>}
          <button type="button" onClick={() => void uploadToYouTube()} disabled={isUploading} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white transition-opacity disabled:opacity-50">
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {isUploading ? 'Uploading...' : youtubeFile ? 'Upload to YouTube' : 'Choose video to upload'}
          </button>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>Uses the existing YouTube API connection. Configure Google OAuth credentials in the backend before uploading.</p>
        </section>
      </div>

      <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}><Check className="h-3.5 w-3.5" style={{ color: 'var(--color-accent-terracotta)' }} />Source context: {activeProject.title} / {activeClip.title}</div>
    </div>
  );
};
