import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { POSTS } from '../page';

export async function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} | StoryThread`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

const articleContent: Record<string, React.ReactNode> = {
  'collaborative-writing-tips': (
    <>
      <p>
        Co-writing a novel, series, or long-form fiction project sounds romantic until the first real creative disagreement. One writer wants to kill the beloved side character; the other treats this as sacrilege. One partner writes three chapters in a week; the other has produced nothing. One vision for the ending diverges entirely from the other&apos;s. These conflicts are not signs that the collaboration is failing — they are normal. The difference between co-writing partnerships that produce great work and ones that collapse is having the structures in place to navigate disagreement productively.
      </p>

      <h2>1. Define Ownership Before You Write a Single Word</h2>
      <p>
        The most important conversation to have before starting a collaborative project is who owns what. Ownership of a character, a subplot, or a thematic thread means that your co-author can provide input but you have final say. This does not mean that partner&apos;s work is off-limits for revision — it means that in a genuine impasse, one voice wins. Defining this in advance prevents the paralysis of having two equally invested writers unable to resolve disagreements because neither can yield.
      </p>

      <h2>2. Write a Project Bible Before You Start</h2>
      <p>
        A project bible is a shared document that establishes everything canonical about your story: character descriptions, voice notes, backstory, world rules, timeline, and the agreed-upon direction for major plot arcs. Working from a shared bible prevents the inconsistencies that plague collaborative fiction — a character who speaks differently in chapters written by different authors, a timeline that contradicts itself across sections, a world rule that one author forgets and violates. It also resolves many disagreements before they arise, because the canonical reference exists to be consulted.
      </p>

      <h2>3. Establish a Communication Cadence</h2>
      <p>
        Regular synchronous check-ins — weekly video calls or in-person meetings — prevent the accumulation of unresolved issues that sink collaborations. Asynchronous writing works well for production; synchronous conversation works for creative direction, conflict resolution, and maintaining shared vision. The ratio that works for most successful co-writing partnerships is one synchronous planning session per week and asynchronous production in between.
      </p>

      <h2>4. Agree on a Revision Protocol</h2>
      <p>
        Revising a co-author&apos;s prose without discussion is the fastest way to create resentment. Establish a clear protocol: what changes can either author make without discussion (copyediting, continuity fixes), what changes require a comment or note to the partner (structural changes within a chapter), and what changes require discussion before implementation (plot direction, character arc changes, anything that affects both partners&apos; work). Platforms with inline commenting and version history make this protocol much easier to maintain.
      </p>

      <h2>5. Separate the Work From the Relationship</h2>
      <p>
        Creative criticism of your co-author&apos;s prose is not criticism of your co-author. Establishing this early — and returning to it when things get tense — is essential for the longevity of any co-writing partnership. The work can be strengthened by honest feedback. The friendship or professional relationship cannot survive if creative feedback becomes personal. Some of the most successful long-running co-writing partnerships maintain this separation by treating the manuscript as a third party that both authors serve, rather than as an extension of either author&apos;s identity.
      </p>

      <h2>6. Handle IP and Revenue Clearly</h2>
      <p>
        Intellectual property ownership and revenue sharing arrangements should be documented in writing before the project begins. Who owns the copyright? What percentage of revenue does each author receive? What happens if one partner wants to exit the project? These are uncomfortable conversations to have at the beginning of an exciting creative endeavor, but they are far less uncomfortable than trying to resolve disputes after a book has found an audience.
      </p>

      <h2>7. Celebrate Progress Together</h2>
      <p>
        Co-writing projects often run for months or years, and the motivation that felt abundant at the start can erode through the long middle of a large project. Deliberately celebrating milestones — completing a draft, reaching a word count target, receiving positive feedback — maintains the shared enthusiasm that makes the collaboration sustainable over the long term.
      </p>
    </>
  ),
  'storytelling-structure-guide': (
    <>
      <p>
        The difference between a story that grips readers and one that loses them is rarely the quality of the writing — it is the quality of the underlying structure. Story structure is not a formula that constrains creativity; it is a framework that channels creative energy toward the elements that make stories work. Understanding the major structural frameworks gives you a toolkit to diagnose what is not working in a draft, decide consciously which structure suits your story, and depart from convention intentionally rather than accidentally.
      </p>

      <h2>The Three-Act Structure: The Foundation</h2>
      <p>
        The three-act structure is the oldest and most universal storytelling framework in Western fiction. Act one establishes the world and the protagonist, introduces the central conflict, and ends with an inciting incident that forces the protagonist into the story&apos;s main action. Act two is the longest section — the protagonist pursues a goal, faces escalating obstacles, and reaches a midpoint that changes the stakes before a dark moment near the end of act two that brings them to their lowest point. Act three is the resolution: the protagonist acts on what they have learned, confronts the final obstacle, and the story reaches its conclusion.
      </p>
      <p>
        The three-act structure works for almost every story length and genre. Its weakness is that it is a high-level scaffold that tells you where the major beats should fall without telling you how to fill the space in between.
      </p>

      <h2>Save the Cat Beat Sheet</h2>
      <p>
        Blake Snyder&apos;s Save the Cat beat sheet breaks the three-act structure into 15 specific beats with approximate page or word count positions. The &quot;save the cat&quot; moment — where the protagonist does something likable early in the story — is one example; the beat sheet includes the theme stated, the fun and games section, the bad guys closing in, and the all-is-lost moment. For writers who struggle with pacing, the beat sheet provides concrete targets: your midpoint should fall at the 50% mark, your dark night of the soul at around 75%.
      </p>

      <h2>The Hero&apos;s Journey</h2>
      <p>
        Joseph Campbell&apos;s Hero&apos;s Journey describes the mythological pattern underlying stories across cultures: the hero receives a call to adventure, crosses a threshold into an unfamiliar world, faces tests and allies and enemies, reaches an ordeal, is transformed, and returns with a boon for their community. This structure works particularly well for epic fantasy, coming-of-age stories, and any narrative where the protagonist&apos;s internal transformation mirrors their external journey.
      </p>

      <h2>The Story Circle</h2>
      <p>
        Dan Harmon&apos;s Story Circle distills Campbell into eight steps that can be applied at any scale — to a novel, a chapter, or a single scene. You (the character), need (the desire), go (crossing a threshold), search (navigating unfamiliar territory), find (getting what they were looking for), take (paying the price), return (coming back with new understanding), change (having been transformed by the experience). The Story Circle is particularly useful for serial fiction writers who need a reliable structure for individual episodes within a larger arc.
      </p>

      <h2>Choosing Your Structure</h2>
      <p>
        Different structures suit different stories. Tightly plotted thrillers benefit from the precise beat sheet approach. Mythically resonant fantasy often maps naturally onto the Hero&apos;s Journey. Character-driven literary fiction may work better with a loose three-act scaffold and deep character development between the structural beats. The most important thing is to choose consciously rather than having no structure at all — and to understand the structure well enough to know when and why to deviate from it.
      </p>
    </>
  ),
  'serial-fiction-audience-building': (
    <>
      <p>
        The serial fiction market has grown dramatically over the past five years. Platforms like Wattpad, Royal Road, and Scribble Hub collectively reach hundreds of millions of readers. Successful serial writers at the top of these platforms earn six-figure incomes from their work. But the path from first chapter to sustainable readership is neither fast nor automatic — it requires strategic thinking about discoverability, retention, and community in addition to quality writing.
      </p>

      <h2>Start With a Backlog, Not a Launch</h2>
      <p>
        The most common mistake new serial writers make is publishing their first chapter and then writing the rest of the story in real time. This approach fails for two reasons. First, reader feedback in the first weeks is crucial — if your opening premise does not resonate, it is far easier to revise it before you have 50 chapters of downstream story that depends on it. Second, writing-as-you-publish creates pressure that degrades quality when life intervenes and posting consistency — which drives reader retention more than any other factor — collapses.
      </p>
      <p>
        Complete at least 10 to 15 chapters before publishing chapter one. This backlog gives you time to absorb early feedback, maintain posting consistency through creative blocks, and make structural adjustments without disrupting the published narrative.
      </p>

      <h2>Discoverability: Getting Found in a Crowded Market</h2>
      <p>
        Platform algorithms surface serial fiction through tags, genre categories, engagement signals (comments, favorites, follows), and posting consistency. Tag selection is the highest-leverage discoverability action: specific tags outperform broad ones because they match readers who are actively looking for exactly what you have written. A reader searching for &quot;slow-burn fantasy romance with enemies to lovers&quot; is more likely to convert to a loyal follower than one who stumbles across a story tagged only &quot;fantasy.&quot;
      </p>
      <p>
        Posting consistency is the most important algorithmic signal for most platforms. Stories that update on a predictable schedule receive sustained platform promotion; stories that post erratically drop out of recommendation feeds. Decide on a posting cadence you can sustain — weekly is more achievable than daily, and consistency matters more than frequency.
      </p>

      <h2>Retention: Keeping Readers Coming Back</h2>
      <p>
        Retention in serial fiction depends on three elements: chapter-ending momentum (readers must want to know what happens next), posting consistency (readers must be able to trust that the next chapter will arrive), and community engagement (readers who feel connected to the author are far more likely to remain through slower periods). Respond to comments, thank readers for milestones, and engage with the community that forms around your work. This investment pays compounding returns as loyal readers become advocates who drive organic discovery.
      </p>

      <h2>Monetization in 2026</h2>
      <p>
        The monetization landscape for serial fiction has matured significantly. Platform revenue sharing, Patreon or Ko-fi subscriptions for early chapter access, merchandise, and direct sales of compiled ebook and print editions all contribute to the income of successful serial writers. Most authors build multiple revenue streams over time rather than relying exclusively on any single source. The foundation of all monetization is a loyal readership — which comes from consistent quality and genuine community engagement, not from aggressive monetization tactics that alienate readers early.
      </p>
    </>
  ),
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const content = articleContent[slug];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All posts
        </Link>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {post.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime} read
          </span>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-6">{post.title}</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none">{content}</div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: post.title,
              datePublished: post.date,
              description: post.excerpt,
              publisher: {
                '@type': 'Organization',
                name: 'StoryThread',
                url: 'https://storythread.com',
              },
            }),
          }}
        />
      </div>
    </div>
  );
}
