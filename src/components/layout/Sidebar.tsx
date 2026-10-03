import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  MapPin,
  Film,
  Repeat,
  Library,
  Settings,
  Plus,
  Layers,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useProject, AppRoute } from '../../context/ProjectContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { currentRoute, navigateTo, theme, cycleTheme } = useProject();

  const navItems: { label: string; route: AppRoute; icon: React.ElementType }[] = [
    { label: 'Home', route: 'dashboard', icon: LayoutDashboard },
    { label: 'Projects', route: 'projects', icon: FolderKanban },
    { label: 'Content Map', route: 'content-map', icon: MapPin },
    { label: 'Creator Studio', route: 'studio', icon: Film },
    { label: 'Repurpose', route: 'repurpose', icon: Repeat },
    { label: 'Assets', route: 'assets', icon: Library },
  ];

  const handleNav = (route: AppRoute) => {
    navigateTo(route);
    if (onCloseMobile) onCloseMobile();
  };

  const themeDisplay = {
    'wabi-sabi': { label: 'Wabi-Sabi Clay', icon: '🏺' },
    'sumi-clay': { label: 'Sumi Stone', icon: '🍵' },
    'cinematic': { label: 'Midnight Slate', icon: '🎬' },
  }[theme];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col justify-between transition-all duration-200 lg:translate-x-0 border-r ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{
        backgroundColor: 'var(--color-bg-sidebar)',
        borderColor: 'var(--color-border-subtle)',
        color: 'var(--color-text-main)',
      }}
    >
      <div className="p-4 flex flex-col gap-5">
        {/* Clean Logo */}
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            onClick={() => handleNav('landing')}
            className="flex items-center gap-2.5 text-left focus:outline-none rounded-xl cursor-pointer group"
            title="Go to Hero Page"
          >
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
              style={{
                backgroundColor: 'var(--color-accent-terracotta)',
              }}
            >
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span
                className="text-base font-semibold tracking-tight block leading-tight group-hover:opacity-85"
                style={{ color: 'var(--color-text-main)' }}
              >
                CreatorAI
              </span>
            </div>
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => handleNav('upload')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold clay-button-primary cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Project</span>
        </button>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1">
          <div
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => handleNav(item.route)}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-all text-left cursor-pointer ${
                  isActive ? 'clay-card' : 'hover:opacity-85'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--color-bg-card-elevated)' : 'transparent',
                  color: isActive
                    ? 'var(--color-accent-terracotta)'
                    : 'var(--color-text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  borderColor: isActive ? 'var(--color-border)' : 'transparent',
                }}
              >
                <Icon
                  className="w-4 h-4 transition-colors"
                  style={{
                    color: isActive
                      ? 'var(--color-accent-terracotta)'
                      : 'var(--color-text-muted)',
                  }}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Clean Utility Footer */}
      <div
        className="p-4 border-t flex flex-col gap-2"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <button
          onClick={() => handleNav('settings')}
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors text-left hover:opacity-85 cursor-pointer"
          style={{
            color:
              currentRoute === 'settings'
                ? 'var(--color-accent-terracotta)'
                : 'var(--color-text-muted)',
            fontWeight: currentRoute === 'settings' ? 600 : 500,
          }}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>


      </div>
    </aside>
  );
};
