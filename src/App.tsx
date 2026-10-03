import React, { useEffect, useRef, useState } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Globe, ArrowRight, Instagram, Youtube, Sparkles, CheckCircle2, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ExportModal } from './components/layout/ExportModal';
import { Dashboard } from './components/dashboard/Dashboard';
import { Projects } from './components/projects/Projects';
import { NewProject } from './components/upload/NewProject';
import { ProcessingExperience } from './components/processing/ProcessingExperience';
import { ContentMap } from './components/content-map/ContentMap';
import { CreatorStudio } from './components/studio/CreatorStudio';
import { Repurpose } from './components/repurpose/Repurpose';
import { Assets } from './components/assets/Assets';
import { Settings } from './components/settings/Settings';
import { supabase } from './lib/supabase';

// ============================================================================
// Cinematic Landing Page Hero
// ============================================================================
const LandingHero: React.FC = () => {
  const { navigateTo } = useProject();
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const fadingOutRef = useRef<boolean>(false);
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef<boolean>(false);

  const [notification, setNotification] = useState<string | null>(null);
  const [dragProgress, setDragProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const sliderTrackRef = useRef<HTMLDivElement | null>(null);
  const dragStartXRef = useRef(0);
  const dragBaseRef = useRef(0);
  const didDragRef = useRef(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
      showNotification('Google auth is not enabled yet');
      return;
    }

    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      console.error('Google sign-in failed:', error);
      showNotification('Google auth is not enabled in Supabase');
    }

    setAuthLoading(false);
  };

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const getMaxTravel = () => {
    const track = sliderTrackRef.current;
    if (!track) return 180;
    return Math.max(24, track.clientWidth - 56);
  };

  const triggerStartAction = () => {
    if (isCompleting) return;
    setIsCompleting(true);
    setDragProgress(1);
    window.setTimeout(() => {
      navigateTo('upload');
    }, 220);
  };

  // Cancels any currently running animation frame
  const cancelFade = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  // 500ms requestAnimationFrame-based fade system
  // Fades resume from current opacity instead of snapping
  const fadeTo = (targetOpacity: number, durationMs: number = 500, onComplete?: () => void) => {
    cancelFade();
    const video = videoRef.current;
    if (!video) return;

    const startOpacity = parseFloat(video.style.opacity || '0');
    if (Math.abs(startOpacity - targetOpacity) < 0.005) {
      video.style.opacity = targetOpacity.toString();
      if (onComplete) onComplete();
      return;
    }

    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const current = startOpacity + (targetOpacity - startOpacity) * progress;

      if (videoRef.current) {
        videoRef.current.style.opacity = current.toFixed(4);
      }

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        rafIdRef.current = null;
        if (onComplete) onComplete();
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
  };

  // Video event handlers
  const handleCanPlay = () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => { });
      fadeTo(1, 500);
    }
  };

  // Fade out when 0.55s remain before video ends
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const remaining = video.duration - video.currentTime;
    if (!fadingOutRef.current && remaining <= 0.55 && remaining > 0) {
      fadingOutRef.current = true;
      fadeTo(0, 500);
    }
  };

  // On ended: opacity = 0, wait 100ms, currentTime = 0, play(), fade back in
  const handleEnded = () => {
    cancelFade();
    const video = videoRef.current;
    if (!video) return;

    video.style.opacity = '0';

    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
    }

    loopTimeoutRef.current = setTimeout(() => {
      if (!videoRef.current) return;
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .then(() => {
          fadingOutRef.current = false;
          fadeTo(1, 500);
        })
        .catch(() => {
          fadingOutRef.current = false;
          fadeTo(1, 500);
        });
    }, 100);
  };

  // Initial load fade-in and cleanup
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.style.opacity = '0';
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            hasStartedRef.current = true;
            fadeTo(1, 500);
          })
          .catch(() => {
            // Autoplay handled on interaction or onCanPlay
          });
      }
    }

    return () => {
      cancelFade();
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="premium-hero-shell min-h-screen overflow-hidden relative flex flex-col justify-between selection:bg-[#C76E4F]/20 selection:text-[#231D1A]">
      {/* Background Video with atmospheric premium blend */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260724_061251_5b1af666-7df5-4284-abea-a19a14d1cc10.mp4"
        playsInline
        muted
        autoPlay
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="absolute inset-x-0 -top-[20.4%] w-full h-[120%] object-cover translate-y-[17%] pointer-events-none select-none z-0"
        style={{ opacity: 0, filter: 'brightness(0.68) saturate(0.72) contrast(1.06) blur(0.2px)' }}
      />

      {/* Clean neutral vignette without fog */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),rgba(11,11,11,0.46)_48%,rgba(0,0,0,0.72)_100%)] pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/10 via-transparent to-[#050505]/40 pointer-events-none z-[1]" />
      <div className="absolute inset-0 wabi-texture pointer-events-none z-[1] opacity-20" />

      {/* Top Header Navigation Bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full"
      >
        <button
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer group"
          title="Open Workspace"
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#07170e] shadow-sm transition-transform group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #effec4 0%, #bce27d 42%, #8ad06a 100%)',
              boxShadow: '0 0 18px rgba(162, 226, 104, 0.44)',
            }}
          >
            <Layers className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[#F0F5E9] font-semibold text-sm tracking-tight block leading-tight">
              CreatorAI
            </span>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 rounded-full border"
            style={{
              background: 'rgba(16, 20, 16, 0.45)',
              borderColor: 'rgba(177, 226, 134, 0.38)',
              boxShadow: '0 0 0 1px rgba(177, 226, 134, 0.15), 0 12px 24px rgba(0,0,0,0.18)',
              color: '#eff8db',
            }}
          >
            <span>{authLoading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <button
            onClick={() => navigateTo('dashboard')}
            className="px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 rounded-full border"
            style={{
              background: 'rgba(16, 20, 16, 0.45)',
              borderColor: 'rgba(177, 226, 134, 0.38)',
              boxShadow: '0 0 0 1px rgba(177, 226, 134, 0.15), 0 12px 24px rgba(0,0,0,0.18)',
              color: '#eff8db',
            }}
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" style={{ color: '#d8f0a4' }} />
          </button>
        </div>
      </motion.header>

      {/* Hero Content Section: Vertically balanced around 50%-55% viewport height */}
      <section className="relative z-10 flex flex-1 items-center justify-center px-6 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full max-w-[900px] flex-col items-center text-center translate-y-[2%] md:translate-y-[4%]"
        >
          {/* Eyebrow */}
          <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border border-[#b6d98b]/50 bg-[#0b120e]/60 text-[#e8f9c7] shadow-[0_0_20px_rgba(125,184,78,0.2)] mb-5">
            <span className="w-2 h-2 rounded-full bg-[#c9ee88] shadow-[0_0_8px_rgba(201,238,136,0.8)]" />
            <span className="tracking-wider text-[11px] uppercase">AI CREATOR OPERATING SYSTEM</span>
          </div>

          {/* Main Heading: Tightly spaced, Instrument Serif typography */}
          <h1
            style={{ fontFamily: "'Instrument Serif', serif" }}
            className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[0.92] md:leading-[0.9] mb-7 md:mb-8"
          >
            <span className="block">One recording.</span>
            <span className="block italic font-normal text-[#d5f3a5] drop-shadow-[0_0_24px_rgba(174,230,118,0.28)]">An entire content pipeline.</span>
          </h1>

          {/* Description */}
          <p className="hero-subtitle max-w-[680px] text-[#dfe9d3]/85 text-base md:text-lg leading-relaxed px-4 font-normal mb-8">
            CreatorAI understands your content, finds the moments that matter, and transforms
            one recording into editable content for every platform.
          </p>

          {/* CTA Group: Vertical Stack */}
          <div className="flex flex-col items-center gap-4">
            {/* Primary CTA: Green glow pill */}
            <button
              onClick={(event) => {
                if (isDragging || isCompleting || didDragRef.current) {
                  event.preventDefault();
                  event.stopPropagation();
                  didDragRef.current = false;
                  return;
                }
                navigateTo('upload');
              }}
              className="hero-cta-primary pl-6 pr-2 py-2 flex items-center gap-3.5 group cursor-pointer active:scale-[0.98] transition-all duration-200 focus:outline-none relative overflow-hidden select-none"
              style={{
                background: 'linear-gradient(115deg, rgba(231,255,186,0.92) 0%, rgba(208,242,135,0.86) 48%, rgba(140,217,106,0.82) 100%)',
                color: '#07180e',
                borderColor: 'rgba(240,255,220,0.72)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.18), 0 24px 40px rgba(151, 213, 96, 0.28), inset 0 1px 0 rgba(255,255,255,0.78)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'none',
              }}
            >
              <div
                ref={sliderTrackRef}
                className="absolute inset-y-1.5 left-3 right-3 rounded-full overflow-hidden pointer-events-none"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-150 ease-out"
                  style={{
                    width: `${Math.max(18, dragProgress * (getMaxTravel() + 8))}px`,
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.3) 42%, rgba(255,255,255,0.16) 100%)',
                    opacity: isDragging || dragProgress > 0 ? 1 : 0,
                    filter: isDragging ? 'brightness(1.2)' : 'brightness(1)',
                  }}
                />
              </div>

              {!isDragging && dragProgress === 0 && !isCompleting && (
                <span className="absolute right-16 top-1/2 -translate-y-1/2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#20331c] opacity-70 z-10">
                  Drag to start
                </span>
              )}

              <span className="text-sm font-bold tracking-wide relative z-10" style={{ color: '#0d1d11' }}>
                Start with your source
              </span>

              <div
                onPointerDown={(event) => {
                  if (isCompleting) return;
                  event.preventDefault();
                  event.stopPropagation();
                  didDragRef.current = false;
                  setIsDragging(true);
                  dragStartXRef.current = event.clientX;
                  dragBaseRef.current = dragProgress;
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  if (!isDragging || isCompleting) return;
                  const maxTravel = getMaxTravel();
                  const deltaX = event.clientX - dragStartXRef.current;
                  const nextProgress = clamp(
                    dragBaseRef.current + deltaX / Math.max(maxTravel, 1),
                    0,
                    1
                  );

                  if (Math.abs(deltaX) > 2) {
                    didDragRef.current = true;
                  }

                  setDragProgress(nextProgress);

                  if (nextProgress >= 0.92) {
                    setIsDragging(false);
                    triggerStartAction();
                  }
                }}
                onPointerUp={() => {
                  if (!isDragging) return;
                  setIsDragging(false);
                  if (dragProgress < 0.92) {
                    setDragProgress(0);
                  }
                }}
                onPointerCancel={() => {
                  if (!isDragging) return;
                  setIsDragging(false);
                  if (dragProgress < 0.92) {
                    setDragProgress(0);
                  }
                }}
                onPointerLeave={() => {
                  if (!isDragging) return;
                  setIsDragging(false);
                  if (dragProgress < 0.92) {
                    setDragProgress(0);
                  }
                }}
                className="relative z-20 flex items-center justify-center rounded-full bg-[#f4fdf0] p-2.5 sm:p-3 text-[#0f1e13] transition-transform duration-200 ease-out shadow-sm border border-[#d8efb1]"
                style={{
                  transform: `translateX(${dragProgress * getMaxTravel()}px)`,
                  boxShadow: isDragging ? '0 12px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <ArrowRight className="hero-arrow-motion w-4 h-4 stroke-[2.5]" />
              </div>
            </button>

            {/* Secondary CTA: dark translucent green border */}
            <button
              onClick={() => navigateTo('content-map')}
              className="hero-cta-secondary px-8 py-3 text-xs sm:text-sm font-semibold cursor-pointer active:scale-[0.98] transition-all focus:outline-none border"
              style={{
                background: 'rgba(14, 19, 16, 0.36)',
                borderColor: 'rgba(178, 226, 129, 0.3)',
                color: '#edf8de',
                boxShadow: '0 12px 26px rgba(0,0,0,0.16), inset 0 1px 1px rgba(255,255,255,0.1)',
              }}
            >
              See how CreatorAI works
            </button>

            {/* Product Message / Principle */}
            <p className="text-[#d2e9bb]/80 text-xs tracking-wide font-mono mt-1">
              AI suggests · Creator decides
            </p>
          </div>
        </motion.div>
      </section>

      {/* Social / Product Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex justify-center gap-3 pb-8 pt-2"
      >
        <button
          onClick={() => showNotification('Connecting to Instagram Reels pipeline')}
          className="ceramic-matte-secondary rounded-full p-3 text-[#5C5248] hover:text-[#2A2420] active:scale-95 transition-all focus:outline-none group cursor-pointer"
          aria-label="Instagram"
        >
          <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={() => showNotification('Connecting to YouTube Shorts pipeline')}
          className="ceramic-matte-secondary rounded-full p-3 text-[#5C5248] hover:text-[#2A2420] active:scale-95 transition-all focus:outline-none group cursor-pointer"
          aria-label="YouTube"
        >
          <Youtube className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={() => showNotification('CreatorAI Platform Global Node')}
          className="ceramic-matte-secondary rounded-full p-3 text-[#5C5248] hover:text-[#2A2420] active:scale-95 transition-all focus:outline-none group cursor-pointer"
          aria-label="CreatorAI website"
        >
          <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      </motion.footer>

      {/* Micro-interaction Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl ceramic-matte-secondary text-[#2A2420] shadow-xl text-xs font-mono tracking-wide animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-[#BF5C38] shrink-0" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Existing CreatorAI Core Application Shell
// ============================================================================
const AppContent: React.FC = () => {
  const { currentRoute, notification, theme } = useProject();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'upload':
        return <NewProject />;
      case 'processing':
        return <ProcessingExperience />;
      case 'content-map':
        return <ContentMap />;
      case 'studio':
        return <CreatorStudio />;
      case 'repurpose':
        return <Repurpose />;
      case 'assets':
        return <Assets />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div
      className={`min-h-screen theme-${theme} transition-colors duration-300 flex flex-col font-sans relative`}
      style={{
        backgroundColor: 'var(--color-bg-app)',
        color: 'var(--color-text-main)',
      }}
    >
      {/* Persistent Left Sidebar */}
      <Sidebar
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area offset by sidebar on lg+ */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar onToggleMobile={() => setIsMobileNavOpen(!isMobileNavOpen)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl w-full mx-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Export Drawer/Modal */}
      <ExportModal />

      {/* Global Notification Toast */}
      {notification && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-medium animate-fade-in clay-card"
          style={{
            backgroundColor: 'var(--color-bg-card-elevated)',
            color: 'var(--color-text-main)',
            borderColor: 'var(--color-border)',
          }}
        >
          <CheckCircle2
            className="w-4 h-4 shrink-0"
            style={{ color: 'var(--color-accent-terracotta)' }}
          />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Main Root Router
// ============================================================================
const MainRouter: React.FC = () => {
  const { currentRoute } = useProject();

  if (currentRoute === 'landing') {
    return <LandingHero />;
  }

  return <AppContent />;
};

export default function App() {
  return (
    <ProjectProvider>
      <MainRouter />
    </ProjectProvider>
  );
}
