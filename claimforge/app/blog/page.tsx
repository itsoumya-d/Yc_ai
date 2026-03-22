import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | ClaimForge',
  description:
    'Expert insights on insurance claims, personal injury law, denied claims appeals, and building stronger legal cases with AI.',
  openGraph: {
    title: 'Blog | ClaimForge',
    description:
      'Expert insights on insurance claims, personal injury law, and building stronger legal cases.',
    type: 'website',
  },
};

export const POSTS = [
  {
    slug: 'personal-injury-claim-process',
    title: 'The Personal Injury Claim Process: A Complete Timeline',
    date: '2026-03-01',
    readTime: '7 min',
    excerpt:
      'From incident to settlement — understanding each stage of a personal injury claim and how to maximize recovery.',
  },
  {
    slug: 'insurance-claim-denied',
    title: "Insurance Claim Denied? Here's What to Do Next",
    date: '2026-02-15',
    readTime: '5 min',
    excerpt:
      'Step-by-step guide for appealing a denied insurance claim and the evidence that changes outcomes.',
  },
  {
    slug: 'medical-malpractice-evidence',
    title: 'How to Build a Strong Medical Malpractice Case',
    date: '2026-02-01',
    readTime: '6 min',
    excerpt:
      'The critical evidence you need to gather immediately and how AI is transforming case preparation.',
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
            Claims strategy, legal evidence guides, and insurance insights for attorneys and claimants.
          </p>
        </div>

        <div className="space-y-8">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-border p-6 hover:border-red-400/40 transition-colors"
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
              <h2 className="text-xl font-semibold text-foreground group-hover:text-red-600 transition-colors mb-2">
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
