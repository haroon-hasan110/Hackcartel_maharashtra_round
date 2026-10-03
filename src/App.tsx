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

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 2800);
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
      video.play().catch(() => {});
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
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
            style={{
              backgroundColor: 'var(--color-accent-terracotta)',
              boxShadow: '0 2px 8px rgba(191, 92, 56, 0.3)',
            }}
          >
            <Layers className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[#2A2420] font-semibold text-sm tracking-tight block leading-tight">
              CreatorAI
            </span>
          </div>
        </button>

        <button
          onClick={() => navigateTo('dashboard')}
          className="ceramic-matte-secondary px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <span>Open Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--color-accent-terracotta)' }} />
        </button>
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border border-[#DFD6C8] bg-[#EFE8DC] text-[#6E6357] shadow-sm mb-5">
            <span className="w-2 h-2 rounded-full bg-[#BF5C38] shadow-[0_0_6px_rgba(191,92,56,0.5)]" />
            <span className="tracking-wider text-[11px] uppercase">AI CREATOR OPERATING SYSTEM</span>
          </div>

          {/* Main Heading: Tightly spaced, Instrument Serif typography */}
          <h1
            style={{ fontFamily: "'Instrument Serif', serif" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#231F1C] tracking-tight leading-[0.92] md:leading-[0.9] mb-7 md:mb-8"
          >
            <span className="block">One recording.</span>
            <span className="block text-[#BF5C38] italic font-normal">An entire content pipeline.</span>
          </h1>

          {/* Description */}
          <p className="max-w-[680px] text-[#5C5248] text-base md:text-lg leading-relaxed px-4 font-normal mb-8">
            CreatorAI understands your content, finds the moments that matter, and transforms
            one recording into editable content for every platform.
          </p>

          {/* CTA Group: Vertical Stack */}
          <div className="flex flex-col items-center gap-4">
            {/* Primary CTA: Matte Ceramic Terracotta Button */}
            <button
              onClick={() => navigateTo('upload')}
              className="ceramic-matte-primary pl-6 pr-2 py-2 flex items-center gap-3.5 group cursor-pointer active:scale-[0.98] transition-all duration-200 focus:outline-none"
            >
              <span className="text-white text-sm font-semibold tracking-wide">
                Start with your source
              </span>
              <div className="bg-[#FAF7F2] rounded-full p-2.5 sm:p-3 text-[#BF5C38] group-hover:scale-105 active:scale-95 transition-transform duration-200 shadow-sm border border-[#E2D8CA]">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </button>

            {/* Secondary CTA: Matte Ceramic Bisque Button */}
            <button
              onClick={() => navigateTo('content-map')}
              className="ceramic-matte-secondary px-8 py-3 text-xs sm:text-sm font-semibold cursor-pointer active:scale-[0.98] transition-all focus:outline-none"
            >
              See how CreatorAI works
            </button>

            {/* Product Message / Principle */}
            <p className="text-[#8A7D71] text-xs tracking-wide font-mono mt-1">
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
