import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | Petos',
  description:
    'Expert guides on pet health, vet costs, pet insurance, and AI-powered veterinary care tools for pet owners.',
  openGraph: {
    title: 'Blog | Petos',
    description:
      'Expert guides on pet health, vet costs, pet insurance, and using AI to keep your pets healthier.',
    type: 'website',
  },
};

export const POSTS = [
  {
    slug: 'pet-health-monitoring-guide',
    title: "The Pet Owner's Guide to Monitoring Your Pet's Health at Home",
    date: '2026-03-01',
    readTime: '6 min',
    excerpt:
      'What to track, how often to track it, and the early warning signs that most pet owners miss until it\'s too late.',
  },
  {
    slug: 'vet-costs-guide',
    title: 'How to Manage Vet Costs Without Compromising Your Pet\'s Care',
    date: '2026-02-15',
    readTime: '7 min',
    excerpt:
      'Veterinary costs are rising faster than inflation. Here is how to plan, budget, and make smart decisions without cutting corners on care.',
  },
  {
    slug: 'pet-insurance-worth-it',
    title: 'Is Pet Insurance Worth It? An Honest Breakdown for 2026',
    date: '2026-02-01',
    readTime: '8 min',
    excerpt:
      'We ran the numbers on pet insurance for dogs and cats. Here is what actually determines whether insurance saves you money — and when to skip it.',
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
            Pet health insights, vet cost guides, and tips for keeping your pets healthier longer.
          </p>
        </div>

        <div className="space-y-8">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-border p-6 hover:border-emerald-400/40 transition-colors"
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
              <h2 className="text-xl font-semibold text-foreground group-hover:text-emerald-600 transition-colors mb-2">
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
