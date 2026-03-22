import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | StoryThread',
  description:
    'Expert insights for writers on collaborative fiction, storytelling craft, serial writing strategies, and building an audience.',
  openGraph: {
    title: 'Blog | StoryThread',
    description:
      'Expert insights for writers on collaborative fiction, storytelling craft, and building an audience.',
    type: 'website',
  },
};

export const POSTS = [
  {
    slug: 'collaborative-writing-tips',
    title: 'The Art of Collaborative Writing: 7 Tips for Co-Authors Who Want to Stay Friends',
    date: '2026-03-01',
    readTime: '6 min',
    excerpt:
      'Co-writing a novel is exciting until the first creative disagreement. These proven strategies keep collaborative projects moving forward without destroying the partnership.',
  },
  {
    slug: 'storytelling-structure-guide',
    title: "The Storytelling Structures Every Fiction Writer Needs to Know",
    date: '2026-02-15',
    readTime: '8 min',
    excerpt:
      'From the Hero\'s Journey to Save the Cat — a practical guide to the narrative frameworks that make stories compelling and how to choose the right one for your project.',
  },
  {
    slug: 'serial-fiction-audience-building',
    title: 'How to Build a Loyal Audience for Your Serial Fiction in 2026',
    date: '2026-02-01',
    readTime: '7 min',
    excerpt:
      'The tactics top serial fiction writers use to grow engaged readerships on Wattpad, Royal Road, and their own platforms.',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Blog</h1>
          <p className="text-lg text-muted-foreground">
            Craft advice, collaboration guides, and audience-building tips for fiction writers.
          </p>
        </div>

        <div className="space-y-8">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-border p-6 hover:border-violet-400/40 transition-colors"
            >
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readTime} read
                </span>
              </div>
              <h2 className="text-xl font-semibold text-foreground group-hover:text-violet-600 transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
