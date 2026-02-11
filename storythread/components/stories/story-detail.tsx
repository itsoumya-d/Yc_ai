'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { deleteStory } from '@/lib/actions/stories';
import { publishStory, unpublishStory } from '@/lib/actions/sharing';
import { ChapterList } from './chapter-list';
import { CharacterList } from '@/components/characters/character-list';
import { WorldElementList } from '@/components/world/world-element-list';
import { formatWordCount, getStatusLabel, getGenreLabel, getGenreEmoji } from '@/lib/utils';
import { Edit, Trash2, Download, Share2, Copy, Check, ExternalLink, X } from 'lucide-react';
import type { StoryWithDetails, StoryStatus, StoryGenre } from '@/types/database';
import { ExportModal } from './export-modal';

interface StoryDetailProps {
  story: StoryWithDetails;
}

export function StoryDetail({ story }: StoryDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPublished = story.status === 'published';
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/read/${story.id}` : '';

  async function handlePublish() {
    setPublishing(true);
    const result = await publishStory(story.id);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Story published', description: 'Your story is now publicly accessible.' });
      setShowSharePanel(true);
      router.refresh();
    }
    setPublishing(false);
  }

  async function handleUnpublish() {
    setPublishing(true);
    const result = await unpublishStory(story.id);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Story unpublished', description: 'Your story is no longer publicly accessible.' });
      setShowSharePanel(false);
      router.refresh();
    }
    setPublishing(false);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: 'Link copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this story? This will also delete all chapters, characters, and world elements.')) return;
    setDeleting(true);
    const result = await deleteStory(story.id);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      setDeleting(false);
      return;
    }
    toast({ title: 'Story deleted' });
    router.push('/stories');
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-12 items-center justify-center rounded-md bg-brand-50 text-2xl">
            {getGenreEmoji(story.genre)}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">{story.title}</h1>
            {story.description && (
              <p className="mt-1 max-w-2xl text-sm text-[var(--muted-foreground)]">{story.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={story.status as StoryStatus}>{getStatusLabel(story.status)}</Badge>
              <Badge variant={story.genre as StoryGenre}>{getGenreLabel(story.genre)}</Badge>
              <span className="text-sm text-[var(--muted-foreground)]">
                {formatWordCount(story.total_word_count)} words
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">
                {story.chapter_count} chapters
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {isPublished ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSharePanel(!showSharePanel)}
              className="bg-green-600 text-white hover:bg-green-700 border-green-600"
            >
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePublish}
              disabled={publishing}
              className="bg-green-600 text-white hover:bg-green-700 border-green-600"
            >
              <Share2 className="mr-1.5 h-4 w-4" /> {publishing ? 'Publishing...' : 'Publish'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportModalOpen(true)}
            className="bg-brand-600 text-white hover:bg-brand-700 border-brand-600"
          >
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>
          <Link href={`/stories/${story.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-1.5 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="mr-1.5 h-4 w-4" /> {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Share Panel */}
      {showSharePanel && isPublished && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-green-900">Public Share Link</h3>
            <button onClick={() => setShowSharePanel(false)} className="text-green-600 hover:text-green-800">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 rounded-md border border-green-300 bg-white px-3 py-2 text-sm text-gray-700"
            />
            <Button size="sm" variant="outline" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <a href={`/read/${story.id}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-green-700">
              Anyone with this link can read your published chapters.
            </p>
            <button
              onClick={handleUnpublish}
              disabled={publishing}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              {publishing ? 'Unpublishing...' : 'Unpublish story'}
            </button>
          </div>
        </div>
      )}

      <Tabs defaultValue="chapters" className="mt-8">
        <TabsList>
          <TabsTrigger value="chapters">Chapters ({story.chapters.length})</TabsTrigger>
          <TabsTrigger value="characters">Characters ({story.characters.length})</TabsTrigger>
          <TabsTrigger value="world">World ({story.world_elements.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="chapters">
          <ChapterList chapters={story.chapters} storyId={story.id} />
        </TabsContent>
        <TabsContent value="characters">
          <CharacterList characters={story.characters} storyId={story.id} />
        </TabsContent>
        <TabsContent value="world">
          <WorldElementList elements={story.world_elements} storyId={story.id} />
        </TabsContent>
      </Tabs>

      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        storyId={story.id}
        storyTitle={story.title}
      />
    </div>
  );
}
