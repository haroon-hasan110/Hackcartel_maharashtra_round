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
    if (filterTab === 'recent') return true; // mock recent
    if (filterTab === 'drafts') return project.status === 'draft';
    if (filterTab === 'completed') return project.status === 'analyzed' || project.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Content Projects</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your master source recordings and compiled content pipelines
          </p>
        </div>

        <button
          onClick={() => navigateTo('upload')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-all self-start sm:self-auto shadow-[0_1px_8px_rgba(6,182,212,0.25)]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Interactive Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#0D1017] border border-white/[0.06] rounded-xl self-start">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'recent', label: 'Recent' },
            { id: 'drafts', label: 'Drafts' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterTab === tab.id
                  ? 'bg-[#181D2A] text-white border border-white/[0.08] shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0D1017] border border-white/[0.06] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="p-4 rounded-2xl bg-[#0D1017]/70 border border-white/[0.06] hover:border-white/[0.14] hover:bg-[#11141E] transition-all flex flex-col justify-between group shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
            >
              <div>
                {/* Thumbnail */}
                <div
                  onClick={() => {
                    selectProject(proj.id);
                    navigateTo('content-map', proj.id);
                  }}
                  className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/[0.08] cursor-pointer mb-3.5"
                >
                  <img
                    src={proj.thumbnailUrl}
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-mono text-neutral-300 border border-white/[0.08]">
                    {Math.floor(proj.sourceVideo.duration / 60)}:
                    {String(proj.sourceVideo.duration % 60).padStart(2, '0')}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                  <span className="capitalize">{proj.contentType}</span>
                  <span aria-hidden="true">·</span>
                  <span>{proj.updatedAt}</span>
                </div>

                <h3
                  onClick={() => {
                    selectProject(proj.id);
                    navigateTo('content-map', proj.id);
                  }}
                  className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {proj.title}
                </h3>

                <p className="text-xs text-neutral-400 mt-1 line-clamp-2 font-mono text-[11px]">
                  {proj.sourceVideo.filename} ({proj.sourceVideo.sizeFormatted})
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div className="text-xs text-neutral-400">
                  <span className="text-white font-medium">{proj.generatedClipsCount}</span> clips ·{' '}
                  <span className="text-white font-medium">{proj.totalAssetsCount}</span> assets
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      selectProject(proj.id);
                      navigateTo('content-map', proj.id);
                    }}
                    className="p-1.5 rounded-md hover:bg-white/[0.05] text-neutral-300 hover:text-cyan-400 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>Open</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center border border-dashed border-white/[0.08] rounded-2xl bg-[#0C0E15]/50">
          <FolderOpen className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No projects found</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No recordings match "${searchQuery}". Try a different keyword.`
              : 'Upload your first recording and let CreatorAI compile it into an entire content pipeline.'}
          </p>
          <button
            onClick={() => navigateTo('upload')}
            className="mt-4 px-4 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-all shadow-[0_1px_8px_rgba(6,182,212,0.25)]"
          >
            Start New Project
          </button>
        </div>
      )}
    </div>
  );
};
