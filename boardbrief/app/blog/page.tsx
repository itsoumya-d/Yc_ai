import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | BoardBrief',
  description:
    'Expert insights on board meeting management, governance best practices, and board resolution templates for startup founders.',
  openGraph: {
    title: 'Blog | BoardBrief',
    description:
      'Expert insights on board meeting management, governance best practices, and board resolution templates.',
    type: 'website',
  },
};

export const POSTS = [
  {
    slug: 'board-meeting-minutes-template',
    title: 'The Complete Board Meeting Minutes Template (Free Download)',
    date: '2026-03-01',
    readTime: '5 min',
    excerpt:
      'Save hours on board admin with this comprehensive template for recording legally sound meeting minutes.',
  },
  {
    slug: 'startup-board-governance',
    title: "Startup Board Governance: A Founder's Guide to Running Effective Board Meetings",
    date: '2026-02-15',
    readTime: '7 min',
    excerpt:
      'Everything you need to know about running professional board meetings, from quorum to resolutions.',
  },
  {
    slug: 'board-resolution-examples',
    title: '10 Board Resolution Examples Every Startup Board Needs',
    date: '2026-02-01',
    readTime: '6 min',
    excerpt:
      'Real board resolution templates for equity grants, appointing officers, approving budgets, and more.',
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
            Board governance guides, meeting management tips, and resolution templates for startup founders.
          </p>
        </div>

        <div className="space-y-8">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-border p-6 hover:border-amber-400/40 transition-colors"
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
              <h2 className="text-xl font-semibold text-foreground group-hover:text-amber-600 transition-colors mb-2">
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
