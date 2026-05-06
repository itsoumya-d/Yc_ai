import { useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { generateId, saveDesign, formatRelativeDate } from '@/lib/storage';
import { formatDimensions } from '@/lib/utils';
import type { Design } from '@/types/database';
import { Flame, Sparkles, Box, Upload, BookOpen, ArrowRight } from 'lucide-react';

const promptExamples = [
  'A phone stand with a cable management slot',
  'A minimalist desk organizer with 3 compartments',
  'A succulent planter shaped like a hedgehog',
  'A wall-mounted hook with geometric pattern',
];

export function WelcomeView() {
  const { setView, designs, addDesign, setActiveDesign } = useAppStore();

  const recentDesigns = designs
    .slice()
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

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

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-DEFAULT">
          <Flame className="h-8 w-8 text-white" />
        </div>

        <h1 className="forge-heading mb-2 text-3xl text-text-primary">Describe it. Print it.</h1>
        <p className="mb-8 text-sm text-text-secondary">
          Turn your ideas into 3D-printable models using natural language. Just describe what you want to create.
        </p>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          <button
            onClick={handleNewDesign}
            className="flex flex-col items-center gap-2 rounded-lg border border-border-default bg-bg-surface p-5 transition-colors hover:border-primary-DEFAULT hover:bg-bg-surface-raised"
          >
            <Sparkles className="h-6 w-6 text-primary-DEFAULT" />
            <span className="text-sm font-medium text-text-primary">New Design</span>
            <span className="text-xs text-text-tertiary">AI-powered generation</span>
          </button>
          <button
            className="flex flex-col items-center gap-2 rounded-lg border border-border-default bg-bg-surface p-5 transition-colors hover:border-accent-DEFAULT hover:bg-bg-surface-raised"
          >
            <Upload className="h-6 w-6 text-accent-DEFAULT" />
            <span className="text-sm font-medium text-text-primary">Import Model</span>
            <span className="text-xs text-text-tertiary">STL, OBJ, 3MF</span>
          </button>
          <button
            onClick={() => setView('marketplace')}
            className="flex flex-col items-center gap-2 rounded-lg border border-border-default bg-bg-surface p-5 transition-colors hover:border-primary-light hover:bg-bg-surface-raised"
          >
            <BookOpen className="h-6 w-6 text-primary-light" />
            <span className="text-sm font-medium text-text-primary">Browse Designs</span>
            <span className="text-xs text-text-tertiary">Community gallery</span>
          </button>
        </div>

        {/* Prompt Examples */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-medium text-text-tertiary">TRY DESCRIBING</h3>
          <div className="space-y-2">
            {promptExamples.map((p) => (
              <button
                key={p}
                onClick={handleNewDesign}
                className="flex w-full items-center justify-between rounded-md border border-border-subtle bg-bg-surface px-4 py-3 text-left text-sm text-text-secondary transition-colors hover:border-primary-DEFAULT hover:text-text-primary"
              >
                <span>{p}</span>
                <ArrowRight className="h-4 w-4 text-text-tertiary" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Designs */}
        {recentDesigns.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-medium text-text-tertiary">RECENT DESIGNS</h3>
            <div className="flex justify-center gap-3">
              {recentDesigns.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleOpenDesign(d)}
                  className="flex items-center gap-3 rounded-md border border-border-subtle bg-bg-surface px-4 py-3 text-left transition-colors hover:border-primary-DEFAULT"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-bg-surface-raised">
                    <Box className="h-5 w-5 text-primary-DEFAULT" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-text-primary">{d.name}</div>
                    <div className="text-[10px] text-text-tertiary">{formatRelativeDate(d.updated_at)} {'\u2022'} {formatDimensions(d.dimensions)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
