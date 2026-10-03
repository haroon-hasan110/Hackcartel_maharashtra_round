import React, { useState, useEffect } from 'react';
import {
    Play,
    Pause,
    RotateCcw,
    RefreshCw,
    Check,
    Download,
    Sliders,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../services/api';

export const CreatorStudio: React.FC = () => {
    const {
        activeProject,
        activeClip,
        setActiveClip,
        updateActiveClip,
        openExport,
        showNotification,
    } = useProject();

    const [startTime, setStartTime] = useState(activeClip.startTime);
    const [endTime, setEndTime] = useState(activeClip.endTime);
    const [hookText, setHookText] = useState(activeClip.hook);
    const [captionText, setCaptionText] = useState(activeClip.caption);
    const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>(activeClip.aspectRatio || '9:16');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlayTime, setCurrentPlayTime] = useState(activeClip.startTime);
    const [isRegeneratingHook, setIsRegeneratingHook] = useState(false);
    const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);

    useEffect(() => {
        setStartTime(activeClip.startTime);
        setEndTime(activeClip.endTime);
        setHookText(activeClip.hook);
        setCaptionText(activeClip.caption);
        setAspectRatio(activeClip.aspectRatio || '9:16');
        setCurrentPlayTime(activeClip.startTime);
        setHasUnsavedEdits(false);
    }, [activeClip]);

    const clipDuration = Math.max(1, endTime - startTime);

    const formatSeconds = (sec: number) => {
        const minutes = Math.floor(sec / 60);
        const seconds = Math.floor(sec % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const formatTimecode = (sec: number) => {
        const hours = Math.floor(sec / 3600);
        const minutes = Math.floor((sec % 3600) / 60);
        const seconds = Math.floor(sec % 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const handlePlayPause = () => setIsPlaying((value) => !value);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setCurrentPlayTime((prev) => (prev >= endTime ? startTime : prev + 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying, startTime, endTime]);

    const handleApplyEdits = () => {
        updateActiveClip({
            startTime,
            endTime,
            hook: hookText,
            caption: captionText,
            aspectRatio,
            durationSeconds: clipDuration,
        });
        setHasUnsavedEdits(false);
        showNotification('AI suggestions applied and saved to project');
    };

    const handleResetToAI = () => {
        const original = activeProject.analysis?.clipOpportunities.find((clip) => clip.id === activeClip.id);
        if (!original) return;

        setStartTime(original.startTime);
        setEndTime(original.endTime);
        setHookText(original.hook);
        setCaptionText(original.caption);
        setAspectRatio(original.aspectRatio || '9:16');
        setHasUnsavedEdits(false);
        showNotification('Reset to initial AI suggestion');
    };

    const handleRegenerateHook = async () => {
        setIsRegeneratingHook(true);
        try {
            const newHook = await api.generateHook(activeClip.id);
            setHookText(newHook);
            setHasUnsavedEdits(true);
            showNotification('New hook variation synthesized');
        } catch {
            showNotification('Could not generate new hook');
        } finally {
            setIsRegeneratingHook(false);
        }
    };

    const getPlayerContainerStyle = () => {
        if (aspectRatio === '9:16') return 'aspect-[9/16] max-h-[500px] mx-auto';
        if (aspectRatio === '1:1') return 'aspect-square max-h-[440px] mx-auto';
        return 'aspect-video w-full';
    };

    const ratioOptions = ['9:16', '16:9', '1:1'] as const;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1
                        className="text-2xl font-bold tracking-tight flex items-center gap-3"
                        style={{ color: 'var(--color-text-main)' }}
                    >
                        <span>Creator Studio</span>
                        <span
                            className="text-xs font-mono font-medium px-2 py-0.5 rounded-lg border"
                            style={{
                                backgroundColor: 'var(--color-bg-card-hover)',
                                borderColor: 'var(--color-border-subtle)',
                                color: 'var(--color-accent-terracotta)',
                            }}
                        >
                            {aspectRatio}
                        </span>
                    </h1>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        Trim clip boundaries, customize hooks, and adjust aspect framing.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {hasUnsavedEdits && (
                        <span className="text-[11px] text-amber-500 font-mono hidden md:inline">● Unsaved modifications</span>
                    )}
                    <button
                        type="button"
                        onClick={handleApplyEdits}
                        className="clay-button-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold cursor-pointer active:scale-95 shadow-sm"
                    >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply Changes</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => openExport(activeClip)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors border"
                        style={{
                            backgroundColor: 'var(--color-bg-card-hover)',
                            borderColor: 'var(--color-border-subtle)',
                            color: 'var(--color-text-main)',
                        }}
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Clip</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-main)' }}>
                            Clips & Assets
                        </h2>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                            {(activeProject.analysis?.clipOpportunities.length ?? 0)} Ready
                        </span>
                    </div>

                    <div className="space-y-2">
                        {activeProject.analysis?.clipOpportunities.map((clip) => {
                            const isSelected = activeClip.id === clip.id;
                            return (
                                <div
                                    key={clip.id}
                                    onClick={() => setActiveClip(clip)}
                                    className={`p-3 rounded-2xl border cursor-pointer transition-all text-xs ${isSelected ? 'shadow-sm' : ''}`}
                                    style={{
                                        backgroundColor: isSelected ? 'var(--color-bg-card)' : 'var(--color-bg-card-hover)',
                                        borderColor: isSelected ? 'var(--color-border-active)' : 'var(--color-border-subtle)',
                                    }}
                                >
                                    <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: 'var(--color-text-muted)' }}>
                                        <span className="font-mono" style={{ color: 'var(--color-accent-terracotta)' }}>
                                            {formatSeconds(clip.startTime)} → {formatSeconds(clip.endTime)}
                                        </span>
                                        <span className="font-mono">{clip.durationSeconds}s</span>
                                    </div>
                                    <h3 className="font-semibold truncate" style={{ color: 'var(--color-text-main)' }}>
                                        {clip.title}
                                    </h3>
                                    <p className="text-[11px] mt-1 line-clamp-1 italic" style={{ color: 'var(--color-text-muted)' }}>
                                        "{clip.hook}"
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div
                        className="p-3.5 rounded-2xl border text-[11px] space-y-1"
                        style={{
                            backgroundColor: 'var(--color-bg-card-hover)',
                            borderColor: 'var(--color-border-subtle)',
                            color: 'var(--color-text-muted)',
                        }}
                    >
                        <span className="font-semibold block font-mono uppercase tracking-wider text-[10px]" style={{ color: 'var(--color-text-main)' }}>
                            Source Master File
                        </span>
                        <p className="truncate font-mono" style={{ color: 'var(--color-text-main)' }}>
                            {activeProject.sourceVideo.filename}
                        </p>
                        <div className="mt-1 flex items-center justify-between pt-1 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                            <span>{formatSeconds(activeProject.sourceVideo.duration)} total</span>
                            <span className="font-mono" style={{ color: 'var(--color-accent-terracotta)' }}>Synchronized</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                    <div
                        className="p-3.5 rounded-2xl border flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden"
                        style={{
                            backgroundColor: 'var(--color-bg-card-elevated)',
                            borderColor: 'var(--color-border-subtle)',
                        }}
                    >
                        <div className="w-full flex items-center justify-between mb-2.5 text-xs px-1">
                            <div className="flex items-center gap-1.5">
                                {ratioOptions.map((ratio) => (
                                    <button
                                        key={ratio}
                                        type="button"
                                        onClick={() => {
                                            setAspectRatio(ratio);
                                            setHasUnsavedEdits(true);
                                        }}
                                        className="px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors border"
                                        style={{
                                            backgroundColor: aspectRatio === ratio ? 'var(--color-accent-soft)' : 'var(--color-bg-card-hover)',
                                            borderColor: aspectRatio === ratio ? 'var(--color-border-active)' : 'var(--color-border-subtle)',
                                            color: aspectRatio === ratio ? 'var(--color-accent-terracotta)' : 'var(--color-text-main)',
                                        }}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                            <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                                {aspectRatio === '9:16' ? 'Reels / Shorts' : aspectRatio === '1:1' ? 'Square Feed' : 'Landscape'}
                            </span>
                        </div>

                        <div
                            className={`relative rounded-lg overflow-hidden border shadow-2xl transition-all duration-300 ${getPlayerContainerStyle()}`}
                            style={{
                                backgroundColor: 'var(--color-bg-input)',
                                borderColor: 'var(--color-border-subtle)',
                            }}
                        >
                            <img
                                src={activeClip.thumbnailUrl || activeProject.thumbnailUrl}
                                alt={activeClip.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                            />

                            <div
                                className="absolute top-6 inset-x-4 p-2.5 rounded-md bg-black/80 backdrop-blur-md border text-center shadow-lg"
                                style={{ borderColor: 'var(--color-border-subtle)' }}
                            >
                                <span className="text-[10px] uppercase font-bold block mb-0.5 tracking-wider" style={{ color: 'var(--color-accent-terracotta)' }}>
                                    HOOK PREVIEW
                                </span>
                                <p className="text-white text-xs font-semibold line-clamp-2 leading-snug">{hookText}</p>
                            </div>

                            <div className="absolute bottom-6 inset-x-4 p-2 rounded-md bg-black/80 backdrop-blur-sm text-center">
                                <p className="text-[11px] font-medium leading-tight" style={{ color: 'var(--color-accent-terracotta)' }}>
                                    {activeClip.transcriptExcerpt.slice(0, 75)}...
                                </p>
                            </div>

                            <div
                                onClick={handlePlayPause}
                                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 cursor-pointer transition-colors group"
                            >
                                <div
                                    className="w-12 h-12 rounded-full bg-black/70 border flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-xl"
                                    style={{ borderColor: 'var(--color-border)' }}
                                >
                                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                                </div>
                            </div>

                            <div
                                className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/85 font-mono text-[9px] border"
                                style={{ color: 'var(--color-text-main)', borderColor: 'var(--color-border-subtle)' }}
                            >
                                {formatSeconds(currentPlayTime)} / {formatSeconds(endTime)}
                            </div>
                        </div>
                    </div>

                    <div
                        className="p-4 rounded-2xl border space-y-3"
                        style={{
                            backgroundColor: 'var(--color-bg-card-hover)',
                            borderColor: 'var(--color-border-subtle)',
                        }}
                    >
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <Sliders className="w-3.5 h-3.5" style={{ color: 'var(--color-accent-terracotta)' }} />
                                <span className="font-semibold" style={{ color: 'var(--color-text-main)' }}>Clip Trimming Timeline</span>
                            </div>
                            <span className="font-mono" style={{ color: 'var(--color-accent-terracotta)' }}>
                                Length: {clipDuration} seconds
                            </span>
                        </div>

                        <div className="relative pt-2 pb-1">
                            <div
                                className="h-6 rounded border relative flex items-center overflow-hidden"
                                style={{ backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-border-subtle)' }}
                            >
                                <div
                                    className="absolute top-0 bottom-0 border-l-2 border-r-2"
                                    style={{
                                        left: `${((startTime - activeClip.startTime + 10) / (clipDuration + 20)) * 100}%`,
                                        width: `${(clipDuration / (clipDuration + 20)) * 100}%`,
                                        backgroundColor: 'var(--color-accent-soft)',
                                        borderColor: 'var(--color-border-active)',
                                    }}
                                />
                                <div className="w-full flex items-center justify-between px-2 opacity-30">
                                    {Array.from({ length: 24 }).map((_, index) => (
                                        <div key={index} className="w-0.5 bg-neutral-400" style={{ height: `${(index % 5 + 1) * 3 + 4}px` }} />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <div>
                                    <label className="text-[11px] block mb-1" style={{ color: 'var(--color-text-muted)' }}>
                                        Start Boundary
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min={Math.max(0, activeClip.startTime - 30)}
                                            max={endTime - 5}
                                            value={startTime}
                                            onChange={(e) => {
                                                setStartTime(Number(e.target.value));
                                                setHasUnsavedEdits(true);
                                            }}
                                            className="w-full accent-lime-400"
                                        />
                                        <span
                                            className="text-xs font-mono px-2 py-1 rounded border"
                                            style={{
                                                backgroundColor: 'var(--color-bg-input)',
                                                borderColor: 'var(--color-border-subtle)',
                                                color: 'var(--color-text-main)',
                                            }}
                                        >
                                            {formatSeconds(startTime)}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] block mb-1" style={{ color: 'var(--color-text-muted)' }}>
                                        End Boundary
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min={startTime + 5}
                                            max={activeClip.endTime + 30}
                                            value={endTime}
                                            onChange={(e) => {
                                                setEndTime(Number(e.target.value));
                                                setHasUnsavedEdits(true);
                                            }}
                                            className="w-full accent-lime-400"
                                        />
                                        <span
                                            className="text-xs font-mono px-2 py-1 rounded border"
                                            style={{
                                                backgroundColor: 'var(--color-bg-input)',
                                                borderColor: 'var(--color-border-subtle)',
                                                color: 'var(--color-text-main)',
                                            }}
                                        >
                                            {formatSeconds(endTime)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <div
                        className="p-4.5 rounded-2xl border space-y-4"
                        style={{
                            backgroundColor: 'var(--color-bg-card-hover)',
                            borderColor: 'var(--color-border-subtle)',
                        }}
                    >
                        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider font-mono" style={{ color: 'var(--color-text-main)' }}>
                                    AI Edit Controls
                                </h3>
                                <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                                    Editable AI suggestion
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleResetToAI}
                                className="text-[11px] flex items-center gap-1 transition-colors"
                                style={{ color: 'var(--color-text-muted)' }}
                                title="Reset to default AI values"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reset</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <label className="text-[11px] block mb-1" style={{ color: 'var(--color-text-muted)' }}>
                                    Start Timecode
                                </label>
                                <div
                                    className="p-2.5 rounded-md border font-mono text-xs"
                                    style={{
                                        backgroundColor: 'var(--color-bg-input)',
                                        borderColor: 'var(--color-border-subtle)',
                                        color: 'var(--color-text-main)',
                                    }}
                                >
                                    {formatTimecode(startTime)}
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] block mb-1" style={{ color: 'var(--color-text-muted)' }}>
                                    End Timecode
                                </label>
                                <div
                                    className="p-2.5 rounded-md border font-mono text-xs"
                                    style={{
                                        backgroundColor: 'var(--color-bg-input)',
                                        borderColor: 'var(--color-border-subtle)',
                                        color: 'var(--color-text-main)',
                                    }}
                                >
                                    {formatTimecode(endTime)}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-medium" style={{ color: 'var(--color-text-main)' }}>
                                    Opening Hook
                                </label>
                                <button
                                    type="button"
                                    onClick={handleRegenerateHook}
                                    disabled={isRegeneratingHook}
                                    className="text-[11px] flex items-center gap-1 transition-colors disabled:opacity-50"
                                    style={{ color: 'var(--color-accent-terracotta)' }}
                                >
                                    <RefreshCw className={`w-3 h-3 ${isRegeneratingHook ? 'animate-spin' : ''}`} />
                                    <span>Regenerate</span>
                                </button>
                            </div>
                            <textarea
                                rows={3}
                                value={hookText}
                                onChange={(e) => {
                                    setHookText(e.target.value);
                                    setHasUnsavedEdits(true);
                                }}
                                className="w-full p-2.5 rounded-lg border text-xs focus:outline-none leading-relaxed font-medium"
                                style={{
                                    backgroundColor: 'var(--color-bg-input)',
                                    borderColor: 'var(--color-border-subtle)',
                                    color: 'var(--color-text-main)',
                                }}
                            />
                            <span className="text-[10px] mt-1 block font-mono" style={{ color: 'var(--color-text-muted)' }}>
                                Estimated hook retention: 92% at 3s
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-main)' }}>
                                Accompanying Caption
                            </label>
                            <textarea
                                rows={4}
                                value={captionText}
                                onChange={(e) => {
                                    setCaptionText(e.target.value);
                                    setHasUnsavedEdits(true);
                                }}
                                className="w-full p-2.5 rounded-lg border text-xs focus:outline-none leading-relaxed font-mono"
                                style={{
                                    backgroundColor: 'var(--color-bg-input)',
                                    borderColor: 'var(--color-border-subtle)',
                                    color: 'var(--color-text-main)',
                                }}
                            />
                        </div>

                        <div
                            className="p-3 rounded-lg border space-y-1.5 text-[11px]"
                            style={{
                                backgroundColor: 'var(--color-bg-input)',
                                borderColor: 'var(--color-border-subtle)',
                            }}
                        >
                            <span className="font-semibold uppercase tracking-wider text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                                Grounding Factors
                            </span>
                            <p style={{ color: 'var(--color-text-main)' }}>
                                Segment isolated as a standalone thesis with zero cross-cut jarring.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
