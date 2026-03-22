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
    title: `${post.title} | ProposalPilot`,
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
  'how-to-write-winning-business-proposal-2025': (
    <>
      <p>
        A business proposal is the most important sales document you will ever create for a
        specific opportunity. Yet most proposals read like product brochures: what we do, who
        we are, how much it costs. The proposals that win are different — they are written from
        the client&apos;s perspective, lead with their problem, and make the case for your
        specific solution rather than your general capabilities.
      </p>

      <h2>The Psychology of a Winning Proposal</h2>
      <p>
        Before writing a single word, understand that the person reading your proposal is
        asking one question: &quot;Will this vendor solve my problem?&quot; Not &quot;are they
        impressive?&quot; or &quot;do they have a great case studies section?&quot; The client
        is evaluating risk. They are about to spend money and trust a team to deliver something
        important. Your proposal must reduce perceived risk at every step.
      </p>

      <h2>The Winning Proposal Structure</h2>

      <h3>1. Executive Summary (Lead With Their Problem)</h3>
      <p>
        The executive summary is not a summary of your company. It is a concise statement of
        the client&apos;s problem and your proposed solution. A decision-maker who reads only
        the executive summary should understand: what the problem is, why it matters, what you
        are proposing to do about it, and what outcome they can expect. Two to three paragraphs,
        maximum.
      </p>

      <h3>2. Understanding of Requirements</h3>
      <p>
        Demonstrate that you listened. Restate the client&apos;s goals and requirements in your
        own words, with enough specificity to prove genuine comprehension. This section builds
        confidence that you understand the actual problem, not a generic version of it.
      </p>

      <h3>3. Proposed Approach</h3>
      <p>
        Describe your approach in phases with clear deliverables at each phase. Clients want
        to understand the process, not just the outcome. Specificity builds confidence.
        &quot;We will conduct 8 stakeholder interviews in weeks 1–2&quot; is more reassuring
        than &quot;we will begin with a discovery phase.&quot;
      </p>

      <h3>4. Timeline and Milestones</h3>
      <p>
        A visual timeline with named milestones outperforms a written schedule. Use it to show
        when the client can expect key deliverables and what their involvement is at each stage.
        Proposals that show clear structure make clients more comfortable with the investment.
      </p>

      <h3>5. Pricing</h3>
      <p>
        Never bury pricing. Present it clearly with each line item justified by a deliverable.
        Provide two to three pricing options — a standard scope, a reduced scope with explicit
        tradeoffs, and an expanded scope with premium deliverables. Options give the client a
        sense of control and reduce the impulse to request a discount on your primary offer.
      </p>

      <h3>6. Social Proof</h3>
      <p>
        One highly relevant case study is worth more than five generic testimonials. Find the
        past project that most closely mirrors the current opportunity and lead with it. If you
        do not have a directly relevant case study, describe analogous experience and extrapolate
        the parallel explicitly.
      </p>

      <h2>After Submission: The Follow-Up Strategy</h2>
      <p>
        A proposal without a follow-up plan is a lottery ticket. Send a follow-up email 48
        hours after submission asking if the client has any questions. Schedule a proposal
        review call if possible — proposals discussed on a call close at 2–3x the rate of
        proposals submitted and never discussed. Use analytics to see what sections the client
        spent time on and prepare to address the areas they lingered on or skipped.
      </p>
    </>
  ),
  'ai-proposal-generation-vs-manual-writing': (
    <>
      <p>
        AI proposal generation tools can now produce a complete, structured business proposal
        in under 60 seconds from a brief description of the project. This seems almost
        impossibly fast given that skilled writers typically spend 3–8 hours crafting a
        high-quality proposal. So what is the real story? Is AI-generated content better,
        worse, or different — and does it actually improve your win rate?
      </p>

      <h2>What AI Proposal Generation Actually Does</h2>
      <p>
        AI proposal tools are not generating proposals from thin air. They are combining your
        input (project description, client name, scope, budget) with a large library of
        proposal patterns, persuasive structures, and industry-specific language to produce
        a first draft. The better platforms incorporate your past winning proposals as
        training data and your content library (case studies, bios, pricing blocks) to
        personalize the output.
      </p>

      <h2>Time Comparison</h2>
      <p>
        Manual proposal writing: 3–8 hours for a quality proposal. AI-assisted proposal
        writing: 30–60 minutes for the same quality output — primarily the time to brief the
        AI, review the draft, personalize key sections, and finalize. For agencies sending
        10–20 proposals per month, this represents 25–70 hours of time savings monthly.
      </p>

      <h2>Quality Analysis</h2>

      <h3>Structure and Completeness</h3>
      <p>
        AI consistently produces well-structured proposals that include all required sections.
        Human writers, especially under time pressure, often omit sections or rush through
        them. On structural completeness, AI matches or outperforms human-written proposals.
      </p>

      <h3>Personalization and Specificity</h3>
      <p>
        This is where human judgment adds the most value. AI can reference client-provided
        information but cannot draw on the nuanced understanding of the client&apos;s political
        environment, unstated priorities, or the interpersonal dynamics observed during sales
        calls. The best AI-assisted proposals combine AI structure and language with
        human-added specificity in key sections.
      </p>

      <h3>Win Rate Impact</h3>
      <p>
        Studies of AI proposal generation platforms consistently find win rate improvements of
        15–30% over baseline — but not primarily because the AI writes better prose. The
        improvement comes from higher proposal volume (teams can respond to more opportunities),
        faster response times (proposals submitted within 24 hours have higher win rates), and
        more consistent quality across the entire portfolio.
      </p>

      <h2>The Hybrid Approach</h2>
      <p>
        The most effective approach uses AI for structure, language, and completeness while
        reserving human effort for client-specific customization. AI writes the executive
        summary, approach section, and standard deliverable descriptions. The account manager
        personalizes the understanding of requirements, the relevant case study selection, and
        the pricing justification. The result combines the efficiency of AI with the
        relationship intelligence of the human who knows the client.
      </p>

      <h2>Conclusion</h2>
      <p>
        For most agencies and consultants sending 5+ proposals per month, AI proposal
        generation delivers compelling ROI through time savings and volume improvements. The
        key is using AI as a starting point and first draft, not as a complete replacement
        for client-specific thinking.
      </p>
    </>
  ),
  'proposal-win-rate-metrics-that-matter': (
    <>
      <p>
        Most agencies and consultants track one proposal metric: win rate. Won divided by
        total proposals submitted. This number feels definitive, but in isolation it tells
        you almost nothing useful. A 40% win rate on highly qualified opportunities is better
        than a 60% win rate on poorly qualified ones. Understanding what is actually driving
        your wins and losses requires a more nuanced measurement framework.
      </p>

      <h2>The Five Metrics That Matter</h2>

      <h3>1. Win Rate by Opportunity Source</h3>
      <p>
        Inbound referrals close at dramatically higher rates than cold outbound prospects —
        typically 2–3x. Calculating win rate by source reveals which channels are worth
        investing in and which are consuming proposal writing time with low probability of
        success. If your cold outbound win rate is 15% and your referral win rate is 55%,
        the economics of your new business investment should reflect that reality.
      </p>

      <h3>2. Average Deal Velocity</h3>
      <p>
        Deal velocity measures the average time from proposal submission to decision. Long
        deal cycles are expensive — they consume follow-up time, create uncertainty, and
        delay revenue. Tracking velocity by deal size and source reveals where deals get
        stuck and where they move quickly. Proposals that receive questions within 24 hours
        close significantly faster than those where silence follows submission.
      </p>

      <h3>3. Proposal Engagement Rate</h3>
      <p>
        Modern proposal platforms track when clients open your proposal, which sections they
        view, how much time they spend on pricing versus approach, and whether they share
        it internally. A proposal that is never opened is effectively lost. A proposal viewed
        multiple times by multiple stakeholders is moving through an internal evaluation
        process. Engagement data tells you which opportunities deserve follow-up investment
        and which have already been decided.
      </p>

      <h3>4. Lost Reason Distribution</h3>
      <p>
        Systematically tracking why you lose is more valuable than tracking your win rate.
        Common loss reasons: lost to a competitor (indicates competitive positioning issues),
        lost on price (indicates value communication or qualification issues), lost because the
        project was cancelled (indicates forecast accuracy issues), and no decision (indicates
        qualification or urgency issues). Each has a different fix.
      </p>

      <h3>5. Revenue per Proposal Submitted</h3>
      <p>
        Revenue per proposal submitted combines win rate, average deal size, and proposal
        volume into a single efficiency metric. Improving this metric can come from three
        directions: winning more (higher win rate), winning more valuable deals (higher
        average deal size), or writing fewer proposals on unqualified opportunities (better
        qualification). Tracking this metric monthly reveals which improvement lever is moving
        and which needs attention.
      </p>

      <h2>Building a Measurement System</h2>
      <p>
        Capturing these metrics requires discipline at proposal submission (recording source,
        estimated value, opportunity type) and at the outcome stage (recording win/loss
        reason, actual value, and velocity). Modern proposal platforms automate much of this
        data collection through CRM integration and built-in analytics.
      </p>

      <h2>Using Data to Improve</h2>
      <p>
        The value of these metrics is in the action they drive. If referral win rates are
        dramatically higher, invest in referral programs. If pricing is the most common loss
        reason, investigate whether it reflects a genuine price sensitivity issue or a value
        communication failure. If deal velocity is slowing, identify at which stage it is
        stalling and design an intervention. Metrics without action are just reports.
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
                name: 'ProposalPilot',
                url: 'https://proposalpilot.com',
              },
            }),
          }}
        />
      </div>
    </div>
  );
}
