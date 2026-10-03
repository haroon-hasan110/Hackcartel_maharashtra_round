import React, { useState } from 'react';
import {
  Menu,
  ChevronDown,
  CheckCircle2,
  Bell,
  Check,
  Sparkles,
} from 'lucide-react';
import { useProject, ColorTheme } from '../../context/ProjectContext';

interface TopBarProps {
  onToggleMobile: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobile }) => {
  const {
    activeProject,
    projects,
    selectProject,
    navigateTo,
    openExport,
    theme,
    setTheme,
  } = useProject();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const themeOptions: {
    id: ColorTheme;
    name: string;
    sub: string;
    icon: string;
    swatch: string[];
  }[] = [
    {
      id: 'wabi-sabi',
      name: 'Wabi-Sabi Clay',
      sub: 'Warm Earth & Linen',
      icon: '🏺',
      swatch: ['#F5F1E9', '#E4DCD0', '#C86848'],
    },
    {
      id: 'sumi-clay',
      name: 'Sumi Stone',
      sub: 'Charcoal & Terracotta',
      icon: '🍵',
      swatch: ['#1A1816', '#24211E', '#DF7D56'],
    },
    {
      id: 'cinematic',
      name: 'Midnight Slate',
      sub: 'Studio Dark',
      icon: '🎬',
      swatch: ['#0F1218', '#151922', '#06B6D4'],
    },
  ];

  const currentThemeObj = themeOptions.find((t) => t.id === theme) || themeOptions[0];

  return (
    <header
      className="sticky top-0 z-30 h-14 backdrop-blur-md px-4 md:px-6 flex items-center justify-between border-b transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-bg-topbar)',
        borderColor: 'var(--color-border-subtle)',
        color: 'var(--color-text-main)',
      }}
    >
      {/* Left zone: Mobile toggle & active project breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-1.5 rounded-md hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Project Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-left clay-card cursor-pointer"
            style={{
              backgroundColor: 'var(--color-bg-card-elevated)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <span
              className="text-xs font-semibold max-w-[160px] md:max-w-[240px] truncate"
              style={{ color: 'var(--color-text-main)' }}
            >
              {activeProject.title}
            </span>
            <span
              className="text-[11px] font-mono hidden sm:inline"
              style={{ color: 'var(--color-text-muted)' }}
            >
              ·{' '}
              {activeProject.sourceVideo.duration
                ? `${Math.floor(activeProject.sourceVideo.duration / 60)}:${String(
                    activeProject.sourceVideo.duration % 60
                  ).padStart(2, '0')}`
                : '08:42'}
            </span>
            <ChevronDown
              className="w-3.5 h-3.5 ml-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div
                className="absolute left-0 mt-2 w-72 rounded-2xl border z-20 py-1.5 overflow-hidden shadow-2xl clay-card"
                style={{
                  backgroundColor: 'var(--color-bg-card-elevated)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div
                  className="px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider border-b"
                  style={{
                    color: 'var(--color-text-muted)',
                    borderColor: 'var(--color-border-subtle)',
                  }}
                >
                  Select Project
                </div>
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      selectProject(proj.id);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs transition-colors hover:opacity-90 cursor-pointer"
                    style={{
                      backgroundColor:
                        proj.id === activeProject.id
                          ? 'rgba(200, 104, 72, 0.12)'
                          : 'transparent',
                      color:
                        proj.id === activeProject.id
                          ? 'var(--color-accent-terracotta)'
                          : 'var(--color-text-main)',
                      fontWeight: proj.id === activeProject.id ? 600 : 400,
                    }}
                  >
                    <span className="truncate">{proj.title}</span>
                    <span
                      className="text-[10px] font-mono"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {proj.totalAssetsCount} assets
                    </span>
                  </button>
                ))}
                <div
                  className="border-t mt-1 pt-1.5 px-2"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                >
                  <button
                    onClick={() => {
                      navigateTo('upload');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
                    style={{ color: 'var(--color-accent-terracotta)' }}
                  >
                    <span>+ New Project...</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sync Status */}
        <div
          className="hidden md:flex items-center gap-1.5 text-[11px] pl-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <CheckCircle2
            className="w-3.5 h-3.5"
            style={{ color: 'var(--color-accent-matcha)' }}
          />
          <span>Saved</span>
        </div>
      </div>

      {/* Right zone: Theme Toggle & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Return to Hero Page */}
        <button
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer clay-chip hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-bg-card-elevated)',
            color: 'var(--color-text-main)',
          }}
          title="Return to Hero Page"
        >
          <Sparkles
            className="w-3.5 h-3.5"
            style={{ color: 'var(--color-accent-terracotta)' }}
          />
          <span className="hidden sm:inline">Hero Page</span>
        </button>

        {/* Clean Theme Toggle Button */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer clay-chip"
            style={{
              backgroundColor: 'var(--color-bg-card-elevated)',
              color: 'var(--color-text-main)',
            }}
            title="Theme Palette"
          >
            <span className="text-sm">{currentThemeObj.icon}</span>
            <span className="hidden sm:inline text-xs font-medium">
              {currentThemeObj.name}
            </span>
            <ChevronDown
              className="w-3 h-3 ml-0.5 opacity-60"
              style={{ color: 'var(--color-text-muted)' }}
            />
          </button>

          {showThemeMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowThemeMenu(false)}
              />
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl border p-1.5 z-20 shadow-2xl clay-card"
                style={{
                  backgroundColor: 'var(--color-bg-card-elevated)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div
                  className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border-b mb-1"
                  style={{
                    color: 'var(--color-text-muted)',
                    borderColor: 'var(--color-border-subtle)',
                  }}
                >
                  Theme Palette
                </div>

                <div className="space-y-1">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTheme(opt.id);
                        setShowThemeMenu(false);
                      }}
                      className="w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-all active:scale-[0.98] cursor-pointer"
                      style={{
                        backgroundColor:
                          theme === opt.id
                            ? 'rgba(200, 104, 72, 0.12)'
                            : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{opt.icon}</span>
                        <div>
                          <div
                            className="font-semibold text-xs flex items-center gap-1.5"
                            style={{
                              color:
                                theme === opt.id
                                  ? 'var(--color-accent-terracotta)'
                                  : 'var(--color-text-main)',
                            }}
                          >
                            <span>{opt.name}</span>
                            {theme === opt.id && (
                              <Check className="w-3 h-3 text-emerald-600" />
                            )}
                          </div>
                          <div
                            className="text-[10px]"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {opt.sub}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {opt.swatch.map((c, i) => (
                          <span
                            key={i}
                            className="w-2.5 h-2.5 rounded-full border border-black/10"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Primary Export CTA */}
        <button
          onClick={() => openExport()}
          className="clay-button-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
        >
          <span>Export Pipeline</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-full hover:opacity-85 relative transition-all active:scale-95 clay-chip cursor-pointer"
            style={{
              backgroundColor: 'var(--color-bg-card-elevated)',
              color: 'var(--color-text-muted)',
            }}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl border p-3 z-20 shadow-2xl clay-card"
                style={{
                  backgroundColor: 'var(--color-bg-card-elevated)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div
                  className="text-xs font-semibold mb-2"
                  style={{ color: 'var(--color-text-main)' }}
                >
                  Updates
                </div>
                <div className="space-y-2 text-xs">
                  <div
                    className="p-2.5 rounded-xl border clay-card"
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      borderColor: 'var(--color-border-subtle)',
                    }}
                  >
                    <p style={{ color: 'var(--color-text-main)' }}>
                      Pipeline ready for{' '}
                      <span className="font-semibold">{activeProject.title}</span>
                    </p>
                    <span
                      className="text-[10px] mt-0.5 block font-mono"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      3 clips · 11 modular assets
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Creator Avatar */}
        <div
          className="flex items-center gap-2 pl-2 border-l"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <img
            src="/src/assets/images/avatar_creator_1791027561231.jpg"
            alt="Creator Avatar"
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover ring-2"
            style={{ borderColor: 'var(--color-accent-terracotta)' }}
          />
        </div>
      </div>
    </header>
  );
};
