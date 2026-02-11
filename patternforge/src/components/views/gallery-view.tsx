import { useState, useMemo, useCallback } from 'react';
import { cn, formatDimensions, formatBytes, getPrintReadinessColor, getPrintReadinessLabel } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { generateId, saveDesign, deleteDesign as deleteDesignStorage, formatRelativeDate } from '@/lib/storage';
import type { Design } from '@/types/database';
import { Search, Grid3X3, List, Plus, Box, Trash2 } from 'lucide-react';

type ViewMode = 'grid' | 'list';

export function GalleryView() {
  const { setView, designs, addDesign, removeDesign, setActiveDesign } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() =>
    designs.filter((d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
    [designs, searchQuery],
  );

  const handleNewDesign = useCallback(() => {
    const design: Design = {
      id: generateId(),
      name: 'Untitled Design',
      prompt: '',
      status: 'draft',
      print_readiness: 'warning',
      dimensions: { x: 0, y: 0, z: 0 },
      vertices: 0,
      faces: 0,
      file_size_bytes: 0,
      material: 'pla',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [],
    };
    addDesign(design);
    saveDesign(design);
    setActiveDesign(design.id);
    setView('studio');
  }, [addDesign, setActiveDesign, setView]);

  const handleOpenDesign = useCallback((design: Design) => {
    setActiveDesign(design.id);
    setView('studio');
  }, [setActiveDesign, setView]);

  const handleDeleteDesign = useCallback((id: string) => {
    removeDesign(id);
    deleteDesignStorage(id);
  }, [removeDesign]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="forge-heading text-lg text-text-primary">My Designs</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{filtered.length} design{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search designs..."
              className="h-9 w-56 rounded-md border border-border-default bg-bg-surface-raised pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-DEFAULT focus:outline-none"
            />
          </div>
          <div className="flex rounded-md border border-border-default">
            <button onClick={() => setViewMode('grid')} className={cn('p-1.5', viewMode === 'grid' ? 'bg-primary-muted text-primary-DEFAULT' : 'text-text-tertiary')}>
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={cn('border-l border-border-default p-1.5', viewMode === 'list' ? 'bg-primary-muted text-primary-DEFAULT' : 'text-text-tertiary')}>
              <List className="h-4 w-4" />
            </button>
          </div>
          <button onClick={handleNewDesign} className="inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-3 py-2 text-sm font-medium text-white hover:bg-primary-light">
            <Plus className="h-4 w-4" /> New Design
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {designs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-surface-raised">
              <Box className="h-8 w-8 text-text-tertiary" />
            </div>
            <h2 className="text-lg font-medium text-text-primary">No designs yet</h2>
            <p className="mt-2 max-w-sm text-sm text-text-secondary">
              Create your first 3D-printable design by describing what you want to build.
            </p>
            <button onClick={handleNewDesign} className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">
              <Plus className="h-4 w-4" /> New Design
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-4">
            {filtered.map((d) => (
              <div key={d.id} className="group rounded-lg border border-border-default bg-bg-surface overflow-hidden transition-colors hover:border-primary-DEFAULT">
                <button onClick={() => handleOpenDesign(d)} className="w-full text-left">
                  <div className="flex h-40 items-center justify-center bg-bg-viewport">
                    <Box className="h-16 w-16 text-primary-DEFAULT opacity-30 group-hover:opacity-50 transition-opacity" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-text-primary">{d.name}</div>
                        <div className="dimension-text mt-0.5 text-text-tertiary">{formatDimensions(d.dimensions)}</div>
                      </div>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getPrintReadinessColor(d.print_readiness))}>
                        {getPrintReadinessLabel(d.print_readiness)}
                      </span>
                    </div>
                    {d.tags.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        {d.tags.map((t) => (
                          <span key={t} className="rounded bg-bg-surface-raised px-1.5 py-0.5 text-[10px] text-text-tertiary">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-text-tertiary">{formatRelativeDate(d.updated_at)}</span>
                      <span className="text-[10px] text-text-tertiary">{formatBytes(d.file_size_bytes)}</span>
                    </div>
                  </div>
                </button>
                <div className="flex justify-end px-3 pb-2">
                  <button
                    onClick={() => handleDeleteDesign(d.id)}
                    className="rounded p-1 text-text-tertiary opacity-0 transition-opacity hover:text-status-error group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((d) => (
              <div key={d.id} className="group flex items-center gap-4 rounded-lg border border-border-default bg-bg-surface p-3 hover:border-primary-DEFAULT">
                <button onClick={() => handleOpenDesign(d)} className="flex flex-1 items-center gap-4 text-left">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-bg-viewport">
                    <Box className="h-6 w-6 text-primary-DEFAULT opacity-40" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary">{d.name}</div>
                    <div className="dimension-text text-text-tertiary">{formatDimensions(d.dimensions)} {'\u2022'} {d.vertices.toLocaleString()} vertices</div>
                  </div>
                </button>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getPrintReadinessColor(d.print_readiness))}>
                  {getPrintReadinessLabel(d.print_readiness)}
                </span>
                <span className="text-xs text-text-tertiary">{formatRelativeDate(d.updated_at)}</span>
                <button
                  onClick={() => handleDeleteDesign(d.id)}
                  className="rounded p-1 text-text-tertiary opacity-0 transition-opacity hover:text-status-error group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
