import React, { useState } from 'react';
import {
  Search,
  Filter,
  Film,
  Music,
  FileText,
  Download,
  Layers,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { GeneratedAsset } from '../../types/project';

export const Assets: React.FC = () => {
  const { assets, openExport, showNotification } = useProject();

  const [activeTab, setActiveTab] = useState<
    'all' | 'video' | 'clip' | 'audio' | 'script'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.sourceProjectTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    return asset.assetType === activeTab;
  });

  const getAssetIcon = (type: GeneratedAsset['assetType']) => {
    switch (type) {
      case 'clip':
      case 'video':
        return <Film className="w-4 h-4 text-cyan-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-purple-400" />;
      case 'script':
        return <FileText className="w-4 h-4 text-amber-400" />;
      default:
        return <Layers className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Compiled Content Archive</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400 font-medium">Source Grounded</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Asset Library</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Every output maintains full cryptographic lineage to its source timestamp.
          </p>
        </div>

        <button
          onClick={() => openExport()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-all self-start sm:self-auto shadow-[0_1px_8px_rgba(6,182,212,0.25)]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Batch Export</span>
        </button>
      </div>

      {/* Filter Tabs and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Segmented Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#0D1017] border border-white/[0.06] rounded-xl self-start">
          {[
            { id: 'all', label: 'All' },
            { id: 'clip', label: 'Clips' },
            { id: 'video', label: 'Videos' },
            { id: 'audio', label: 'Audio Stems' },
            { id: 'script', label: 'Transcripts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#181D2A] text-white border border-white/[0.08] shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assets by filename or source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0D1017] border border-white/[0.06] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/80 transition-colors font-sans"
          />
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="p-4 rounded-2xl bg-[#0D1017]/70 border border-white/[0.06] hover:border-white/[0.14] hover:bg-[#11141E] transition-all flex flex-col justify-between group space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          >
            <div>
              {/* Thumbnail or Icon Preview */}
              {asset.thumbnailUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-white/[0.08] mb-3">
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {asset.duration && (
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-mono text-neutral-300 border border-white/[0.08]">
                      {asset.duration}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-[#06080C] border border-white/[0.06] mb-3 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-[#0F121A] border border-white/[0.06] flex items-center justify-center mb-2">
                    {getAssetIcon(asset.assetType)}
                  </div>
                  <span className="text-xs font-mono text-neutral-400 truncate max-w-full">
                    {asset.format}
                  </span>
                </div>
              )}

              {/* Title & Filename */}
              <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                {asset.title}
              </h3>
              <p className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                {asset.filename}
              </p>

              {/* Critical Source Relationship */}
              <div className="mt-3 p-2.5 rounded-lg bg-[#07090E] border border-white/[0.05] text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Derived from:</span>
                  <span className="text-neutral-200 font-medium truncate max-w-[150px]">
                    {asset.sourceProjectTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Source:</span>
                  <span className="font-mono text-cyan-400">
                    {asset.sourceTimeRange}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer with size, date, download action */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
              <span className="font-mono text-[11px]">{asset.size}</span>
              <button
                onClick={() => openExport(asset as any)}
                className="flex items-center gap-1 text-neutral-300 hover:text-cyan-400 font-medium transition-colors"
              >
                <span>Export</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
