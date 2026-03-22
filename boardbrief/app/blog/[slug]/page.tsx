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
    title: `${post.title} | BoardBrief`,
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
  'board-meeting-minutes-template': (
    <>
      <p>
        Board meeting minutes are not just administrative paperwork — they are legal documents that protect directors, establish corporate history, and serve as the authoritative record of every decision your board makes. A poorly drafted set of minutes can expose directors to personal liability and create disputes that cost far more to resolve than the time you saved by cutting corners.
      </p>
      <p>
        This template covers everything you need to record legally sound, complete board meeting minutes. It works for Series A through pre-IPO boards and is designed to be adapted to your company&apos;s specific governance requirements.
      </p>

      <h2>The Essential Template Structure</h2>

      <h3>Meeting Header</h3>
      <p>
        Begin every set of minutes with: the full legal name of the corporation, the date, time, and location of the meeting (or platform name if virtual), the type of meeting (regular board meeting, special meeting, annual meeting), the names of directors present and their titles, the names of directors absent, whether a quorum was achieved and how it was determined, the names of officers and other attendees present, and the name of the individual recording the minutes.
      </p>

      <h3>Call to Order and Quorum Confirmation</h3>
      <p>
        Record who called the meeting to order, the exact time, and the confirmation that a quorum was achieved. If you are operating under a shareholders agreement or bylaws with specific quorum requirements, reference those requirements explicitly. For example: &quot;Pursuant to Section 4.3 of the Company&apos;s Bylaws, a quorum of the Board of Directors requires a majority of directors then in office. [X] of [Y] directors currently serving are present, constituting a quorum.&quot;
      </p>

      <h3>Approval of Prior Minutes</h3>
      <p>
        Note whether the minutes from the previous meeting were circulated in advance, whether directors had the opportunity to review them, and the vote to approve them. If any corrections were made, note them specifically.
      </p>

      <h3>Resolutions Section</h3>
      <p>
        This is the most legally significant section. For each resolution: record the exact resolution language, the name of the director who moved the resolution, the name of the director who seconded it, the vote tally (for, against, abstain), and any director who recused themselves due to a conflict of interest and the reason for recusal. The resolution language should be precise enough to stand alone as a binding corporate decision without reference to the discussion that preceded it.
      </p>

      <h3>Action Items and Next Steps</h3>
      <p>
        Record every action item with a clear owner name, a specific deliverable description, and a target completion date. Review action items from the previous meeting and record their status. Unresolved action items should be carried forward with updated status notes.
      </p>

      <h3>Adjournment</h3>
      <p>
        Record the time of adjournment and note who moved to adjourn. These details matter when questions arise about whether proper notice was provided for any subsequent meeting.
      </p>

      <h2>After the Meeting: The Approval Process</h2>
      <p>
        Circulate draft minutes to all directors within five business days of the meeting while recollections are fresh. Directors should review for factual accuracy, not for style. Incorporate any corrections and circulate the final version. Once approved by the board (typically at the following meeting or via written consent), the minutes are signed by the secretary and filed in the corporate minute book. Digital platforms that manage this workflow with e-signature and automatic filing significantly reduce the administrative burden.
      </p>
    </>
  ),
  'startup-board-governance': (
    <>
      <p>
        For many founders, the first formal board meeting is a rite of passage — and often a stressful one. The shift from an advisory board of supporters to a fiduciary board with real authority changes the dynamics significantly. Understanding the governance framework before you are in the room is the difference between running a productive meeting and feeling like you are on trial.
      </p>

      <h2>Understanding Board Composition and Dynamics</h2>
      <p>
        A typical early-stage startup board includes the CEO, one or two co-founders, one or two investor-designated directors, and ideally one or two independent directors. Each group has different incentives, different information asymmetries, and different concerns. The investor director is evaluating whether the company is on track relative to the investment thesis. The independent director brings perspective without a financial stake. The founder directors are often the most informed but the most emotionally invested. Managing these dynamics effectively is a core governance skill.
      </p>

      <h2>Quorum, Notice, and Meeting Validity</h2>
      <p>
        Before any meeting can transact business, you need a quorum — typically a majority of the directors then in office, though your bylaws may specify otherwise. Failing to achieve quorum and proceeding anyway is a governance error that can invalidate decisions made at the meeting. Review your bylaws before each meeting and confirm attendance in advance to avoid this problem. Most bylaws also require advance notice of board meetings — typically 48 to 72 hours for regular meetings, with specific rules for special meetings. If you call a meeting without proper notice, decisions made at that meeting may be challenged.
      </p>

      <h2>Running the Meeting: Agenda and Time Management</h2>
      <p>
        The most effective board meetings are built around a clear agenda distributed in advance with supporting materials. Directors should arrive having read the board pack — not use the first 30 minutes of the meeting getting oriented. A well-structured agenda allocates time for: prior minutes approval, CEO update, financial review with variance discussion, key strategic and operational items, governance matters (equity approvals, policy changes), and open discussion. Two hours is typically sufficient for a monthly or quarterly board meeting. Meetings that consistently run long are a signal that the agenda is too ambitious or the board pack is not doing its job of providing context in advance.
      </p>

      <h2>Resolutions: When and How to Use Them</h2>
      <p>
        Many significant corporate actions require formal board approval via resolution: option grants and equity plan amendments, debt and equity financing, significant contracts above threshold amounts defined in your bylaws, officer appointments and compensation, strategic transactions, and any matter requiring board approval under your shareholders agreement. AI-assisted board management platforms can identify which upcoming decisions require formal resolutions and generate compliant resolution language automatically — reducing both the legal cost and the risk of proceeding without required approvals.
      </p>

      <h2>Building a High-Performing Board Relationship</h2>
      <p>
        The best board relationships are built on consistent, transparent communication between meetings. Monthly written updates to the board — including the things that are not going well — create the trust that allows boards to be genuinely helpful rather than interrogative. Directors who are surprised by bad news in a board meeting become concerned about what else they do not know. Directors who receive regular honest updates feel informed and are far more likely to provide constructive support when challenges arise.
      </p>
    </>
  ),
  'board-resolution-examples': (
    <>
      <p>
        Board resolutions are the formal mechanism by which a corporation&apos;s board of directors approves significant decisions. Unlike informal consensus in a meeting, resolutions create a legally binding record of corporate action that can be enforced, cited in due diligence, and used to demonstrate proper governance to investors, auditors, and courts. Getting the language right matters.
      </p>
      <p>
        Here are ten essential board resolution templates for startup boards, with notes on when each is required and what language elements are most important.
      </p>

      <h2>1. Stock Option Grant Resolution</h2>
      <p>
        Option grants are typically the most frequent board resolution for early-stage startups. The resolution must specify: the grantee name, the number of options, the exercise price (which must be at or above the 409A fair market value), the vesting schedule (cliff and vesting period), whether the options are ISOs or NSOs, and whether acceleration provisions apply. Many companies require individual board approval for grants above a threshold, with the CEO authorized to make smaller grants without full board approval.
      </p>

      <h2>2. Officer Appointment Resolution</h2>
      <p>
        Appointing or changing officers (CEO, CFO, President, Secretary) requires board action. The resolution should name the individual, specify the title and any change in title, confirm the effective date, and authorize execution of any employment agreement. If the officer is also a director, their voting on their own appointment raises conflict of interest considerations that should be addressed in the minutes.
      </p>

      <h2>3. Financing Round Approval Resolution</h2>
      <p>
        Closing an equity financing round requires the board to approve: the issuance of the securities, the form of investment documents, the price per share or conversion terms, the authorization for any new class of stock, and the authorization for officers to execute all documents required to close the financing. This resolution is typically reviewed by legal counsel before approval.
      </p>

      <h2>4. Annual Budget Approval Resolution</h2>
      <p>
        Most boards approve the annual operating budget, creating a formal authorization for management to spend within the approved plan. The resolution should attach or reference the approved budget by version and date, specify any categories requiring separate board approval for overruns, and note the period covered.
      </p>

      <h2>5. Bank Account and Signatory Authorization Resolution</h2>
      <p>
        Opening bank accounts or changing authorized signatories requires a board resolution that banks will retain in their records. The resolution specifies the institution, the type of account, the authorized signatories, and any signature requirements (single vs. dual signature for transactions above a threshold).
      </p>

      <h2>6. Key Contract Approval Resolution</h2>
      <p>
        Contracts above material thresholds — typically defined in your bylaws or shareholders agreement — require board approval. The resolution should identify the contract by counterparty and subject matter, summarize the key commercial terms, and authorize a specific officer to execute.
      </p>

      <h2>7. Equity Incentive Plan Amendment Resolution</h2>
      <p>
        Increasing the share pool under your equity incentive plan or amending plan terms requires board approval and typically also stockholder approval. The resolution should specify the number of additional shares being authorized, the amended total pool size, and whether stockholder approval is being sought concurrently.
      </p>

      <h2>8. Debt Authorization Resolution</h2>
      <p>
        Taking on debt — whether a venture debt facility, convertible note, or credit line — requires board authorization. The resolution should describe the debt instrument, the lender, the principal amount, the key terms (interest rate, maturity, conversion features if applicable), and any security interest being granted.
      </p>

      <h2>9. Director Compensation Resolution</h2>
      <p>
        If your independent directors receive compensation (cash retainer, equity grants), this must be formally approved by the board. The resolution sets the compensation structure and is typically renewed or confirmed annually.
      </p>

      <h2>10. Strategic Transaction Authorization Resolution</h2>
      <p>
        Mergers, acquisitions, asset sales, or other strategic transactions require the most detailed board resolutions, typically drafted with legal counsel. These resolutions authorize engagement of advisors, approve the transaction structure, confirm compliance with fiduciary duties, and authorize officers to execute all related documents.
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
                name: 'BoardBrief',
                url: 'https://boardbrief.com',
              },
            }),
          }}
        />
      </div>
    </div>
  );
}
