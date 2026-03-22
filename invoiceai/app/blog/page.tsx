import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | InvoiceAI',
  description:
    'Expert insights on freelance invoicing, getting paid on time, managing cash flow, and the business side of independent work.',
  openGraph: {
    title: 'Blog | InvoiceAI',
    description:
      'Expert insights on freelance invoicing, getting paid on time, and managing cash flow.',
    type: 'website',
  },
};

export const POSTS = [
  {
    slug: 'freelance-invoicing-guide',
    title: 'The Freelancer\'s Complete Guide to Professional Invoicing',
    date: '2026-03-01',
    readTime: '7 min',
    excerpt:
      'Everything a freelancer needs to know about creating invoices that get paid — payment terms, late fees, client communication, and follow-up strategies.',
  },
  {
    slug: 'getting-paid-faster',
    title: 'How to Get Paid Faster: 8 Proven Strategies for Freelancers',
    date: '2026-02-15',
    readTime: '5 min',
    excerpt:
      'Stop waiting 45+ days for payment. These tactics reduce your average payment time dramatically without damaging client relationships.',
  },
  {
    slug: 'freelance-cash-flow-management',
    title: 'Cash Flow Management for Freelancers: A Practical Guide',
    date: '2026-02-01',
    readTime: '6 min',
    excerpt:
      'The irregular income of freelancing does not have to mean financial stress. Here is how to build a cash flow system that gives you stability and visibility.',
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
            Expert insights on invoicing, cash flow, and getting paid faster.
          </p>
        </div>

        <div className="space-y-8">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-border p-6 hover:border-primary/40 transition-colors"
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
              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
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
