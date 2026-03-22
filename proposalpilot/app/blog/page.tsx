import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | ProposalPilot',
  description:
    'Expert guides on writing winning proposals, pricing services, closing clients, and improving your proposal win rate.',
  openGraph: {
    title: 'Blog | ProposalPilot',
    description:
      'Expert guides on writing winning proposals, pricing services, and closing clients.',
    type: 'website',
  },
};

export const POSTS = [
  {
    slug: 'winning-proposal-writing-guide',
    title: 'How to Write a Winning Proposal: The Complete Guide for Agencies and Consultants',
    date: '2026-03-01',
    readTime: '8 min',
    excerpt:
      'The structure, psychology, and tactics that separate winning proposals from the ones that go unanswered.',
  },
  {
    slug: 'pricing-services-guide',
    title: 'How to Price Your Services (Without Leaving Money on the Table)',
    date: '2026-02-15',
    readTime: '7 min',
    excerpt:
      'Value-based pricing, retainer structures, and project pricing — a practical guide to pricing services confidently and profitably.',
  },
  {
    slug: 'closing-clients-proposal-follow-up',
    title: 'The Follow-Up Strategy That Closes More Proposals',
    date: '2026-02-01',
    readTime: '5 min',
    excerpt:
      'Most proposals die in silence. Here is the follow-up cadence that turns interested prospects into signed clients without being annoying.',
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
            Proposal strategy, service pricing, and client-closing guides for agencies and consultants.
          </p>
        </div>

        <div className="space-y-8">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-border p-6 hover:border-blue-400/40 transition-colors"
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
              <h2 className="text-xl font-semibold text-foreground group-hover:text-blue-600 transition-colors mb-2">
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
