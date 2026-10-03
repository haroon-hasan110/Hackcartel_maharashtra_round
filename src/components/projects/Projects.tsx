import React, { useState } from 'react';
import { Plus, Search, Filter, Clock, Film, Layers, ArrowUpRight, FolderOpen } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const Projects: React.FC = () => {
  const { projects, selectProject, navigateTo } = useProject();
  const [filterTab, setFilterTab] = useState<'all' | 'recent' | 'drafts' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.contentType.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'all') return true;
    if (filterTab === 'recent') return true;
    if (filterTab === 'drafts') return project.status === 'draft';
    if (filterTab === 'completed') return project.status === 'analyzed' || project.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>
            Content Projects
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Manage your master source recordings and compiled content pipelines
          </p>
        </div>

        <button
          onClick={() => navigateTo('upload')}
          className="clay-button-primary flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-full transition-all self-start sm:self-auto shadow-sm border"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 p-1 rounded-full self-start border" style={{ backgroundColor: 'var(--color-bg-card-elevated)', borderColor: 'var(--color-border-subtle)' }}>
          {[
            { id: 'all', label: 'Recent' },
            { id: 'recent', label: 'Recent' },
            { id: 'drafts', label: 'Drafts' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
              style={{
                backgroundColor: filterTab === tab.id ? 'var(--color-bg-card-hover)' : 'transparent',
                color: filterTab === tab.id ? 'var(--color-text-main)' : 'var(--color-text-muted)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-full text-xs focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--color-bg-input)',
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-main)',
            }}
          />
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="p-4 rounded-[26px] border transition-all flex flex-col justify-between group"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-subtle)',
                boxShadow: 'var(--clay-outer-shadow)',
              }}
            >
              <div>
                <div
                  onClick={() => {
                    selectProject(proj.id);
                    navigateTo('content-map', proj.id);
                  }}
                  className="relative aspect-video rounded-[18px] overflow-hidden border cursor-pointer mb-3.5"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                >
                  <img
                    src={proj.thumbnailUrl}
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-stone-200 border border-white/10">
                    {Math.floor(proj.sourceVideo.duration / 60)}:
                    {String(proj.sourceVideo.duration % 60).padStart(2, '0')}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="capitalize">{proj.contentType}</span>
                  <span aria-hidden="true">·</span>
                  <span>{proj.updatedAt}</span>
                </div>

                <h3
                  onClick={() => {
                    selectProject(proj.id);
                    navigateTo('content-map', proj.id);
                  }}
                  className="text-base font-bold transition-colors cursor-pointer"
                  style={{ color: 'var(--color-text-main)' }}
                >
                  {proj.title}
                </h3>

                <p className="text-xs mt-1 line-clamp-2 font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  {proj.sourceVideo.filename} ({proj.sourceVideo.sizeFormatted})
                </p>
              </div>

              <div className="mt-5 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="font-medium" style={{ color: 'var(--color-text-main)' }}>{proj.generatedClipsCount}</span> clips ·{' '}
                  <span className="font-medium" style={{ color: 'var(--color-text-main)' }}>{proj.totalAssetsCount}</span> assets
                </div>

                <button
                  onClick={() => {
                    selectProject(proj.id);
                    navigateTo('content-map', proj.id);
                  }}
                  className="px-2.5 py-1.5 rounded-full border text-xs font-medium transition-colors"
                  style={{
                    borderColor: 'var(--color-border-subtle)',
                    color: 'var(--color-text-main)',
                    backgroundColor: 'var(--color-bg-card-hover)',
                  }}
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center border border-dashed rounded-2xl" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-bg-card)' }}>
          <FolderOpen className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-main)' }}>No projects found</h3>
          <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            {searchQuery
              ? `No recordings match "${searchQuery}". Try a different keyword.`
              : 'Upload your first recording and let CreatorAI compile it into an entire content pipeline.'}
          </p>
          <button
            onClick={() => navigateTo('upload')}
            className="clay-button-primary mt-4 px-4 py-2 text-xs font-semibold rounded-full transition-all"
          >
            Start New Project
          </button>
        </div>
      )}
    </div>
  );
};
