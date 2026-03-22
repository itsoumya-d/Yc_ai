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
    title: `${post.title} | InvoiceAI`,
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
  'freelance-invoicing-guide': (
    <>
      <p>
        Invoicing is the moment when the creative work of freelancing meets the business reality of getting paid. Many talented freelancers undermine their financial stability not because their work is inadequate, but because their invoicing practice is — inconsistent terms, unclear payment expectations, and no follow-up system. A professional invoicing practice is not complicated, but it requires intentional setup.
      </p>

      <h2>Invoice Essentials: What Every Invoice Must Include</h2>
      <p>
        A professional invoice must contain: your full legal name or business name and contact information, the client&apos;s name and billing address, a unique invoice number for your records, the invoice date and the due date, an itemized list of services provided with rates and quantities, the total amount due, your accepted payment methods, and your payment terms. Missing any of these elements creates room for disputes, delayed payment, and accounting complications for both parties.
      </p>
      <p>
        Invoice numbers should be sequential and meaningful — a system like INV-2026-001 is more professional and searchable than random numbering. The due date should be explicit: &quot;Net 30&quot; is ambiguous if the client disputes when the clock started. &quot;Due by March 31, 2026&quot; is not.
      </p>

      <h2>Payment Terms: The Choices That Change Everything</h2>
      <p>
        Your payment terms are the single biggest driver of how quickly you get paid. Net 30 is the traditional standard, but it is almost never in a freelancer&apos;s interest. Net 15 or Net 7 terms are increasingly standard in the freelance market and are accepted by most clients without objection when stated clearly upfront. Upon receipt terms — payment due when the invoice is received — work well for shorter projects and established client relationships.
      </p>
      <p>
        Late payment fees change behavior. A 1.5 to 2% monthly fee on overdue invoices, clearly stated in your contract and on your invoices, signals that late payment has a cost. Many freelancers report that adding a late fee to their terms dramatically reduces the number of invoices that go overdue — even when the fee is rarely collected.
      </p>

      <h2>Deposits and Milestone Billing</h2>
      <p>
        For projects over a certain value — a threshold you define based on your typical project size — require a deposit before starting work. A 25 to 50% upfront payment protects you from non-payment, improves your cash flow, and filters out clients who are not serious. Milestone billing — invoicing at defined project phases rather than only at completion — reduces the risk of large unpaid invoices and creates natural checkpoints for client communication.
      </p>

      <h2>Follow-Up: The System That Gets You Paid</h2>
      <p>
        Most late payments are not deliberate — they are the result of invoices getting lost, approval workflows taking longer than expected, or clients simply forgetting. A systematic follow-up sequence ensures that invoices are not forgotten without requiring you to have awkward conversations. Send a friendly reminder three to five days before the due date, a polite follow-up on the due date if the invoice is unpaid, a firm but professional notice at seven days overdue, and a formal demand at 14 days. AI invoicing platforms automate this entire sequence, customizing tone by stage and eliminating the manual tracking burden entirely.
      </p>
    </>
  ),
  'getting-paid-faster': (
    <>
      <p>
        The average freelancer waits 38 days to receive payment after sending an invoice. This gap between work completed and money received is not just a cash flow problem — it is a time and energy drain that compounds across every client relationship. These eight strategies can bring that average down to 15 to 20 days or less without adversarial client conversations.
      </p>

      <h2>1. Shorten Your Payment Terms</h2>
      <p>
        The most direct way to get paid faster is to ask for payment sooner. Most freelancers default to Net 30 because it is traditional. Net 15 or Net 7 terms are accepted by the majority of clients when stated clearly in contracts and on invoices. If a client pushes back, the conversation itself is useful — it reveals payment process information that helps you plan.
      </p>

      <h2>2. Invoice Immediately</h2>
      <p>
        Every day between project completion and invoice delivery is a day added to your payment wait. Invoice on the day work is delivered, not at the end of the month. AI invoicing tools that generate invoices from project notes or descriptions eliminate the friction that causes invoice delays.
      </p>

      <h2>3. Offer Multiple Payment Methods</h2>
      <p>
        Clients who want to pay with ACH transfer, wire, credit card, or PayPal should be able to do so easily. Every friction point in the payment process adds days. A payment link embedded directly in the invoice — requiring no login, no portal navigation, no phone calls to accounting — removes the most common friction points in one step.
      </p>

      <h2>4. Require Deposits for New Clients</h2>
      <p>
        A 25 to 50% deposit before beginning work on any project with a new client accomplishes two things: it improves your cash flow on every project, and it reveals payment behavior before you have delivered anything. Clients who hesitate to pay a deposit are worth additional scrutiny. Clients who pay immediately demonstrate that payment is not going to be a problem.
      </p>

      <h2>5. Automate Your Follow-Up</h2>
      <p>
        Manual follow-up on overdue invoices is inconsistent — you remember some and forget others, and the awkwardness of asking for money often causes delays. An automated follow-up sequence that triggers at predefined intervals (three days before due, day of due, seven days overdue) is more consistent than any manual process and removes the personal friction from what is really a routine business communication.
      </p>

      <h2>6. Build Late Fees Into Your Contracts</h2>
      <p>
        A clearly stated late payment fee — 1.5% per month is standard — changes the incentive structure for payment timing. Most clients will not pay the fee, but its presence makes the cost of delay explicit. Some freelancers offer an early payment discount (2% for payment within 10 days) as an alternative approach; both work, and the right choice depends on which incentive is more aligned with your client base.
      </p>

      <h2>7. Know Your Clients&apos; Approval Processes</h2>
      <p>
        Many payment delays are caused by internal approval processes that the freelancer does not know exist. Ask new clients about their invoice approval workflow before sending your first invoice. Knowing that invoices require manager approval by the 15th of the month to be included in the month-end payment run allows you to time your submissions appropriately rather than missing the window and waiting an additional month.
      </p>

      <h2>8. Make the Relationship Personal</h2>
      <p>
        Clients who have a genuine relationship with you are faster payers than those who see you as a vendor number in their accounts payable system. Regular communication, genuine interest in their business goals, and responsiveness to their needs make your invoices more likely to be prioritized when payment processing decisions are made.
      </p>
    </>
  ),
  'freelance-cash-flow-management': (
    <>
      <p>
        The biggest financial challenge of freelancing is not income — it is income unpredictability. A month with three large projects is followed by a month with only one. A client delays payment unexpectedly. A promising project falls through at the last minute. The gross income of a successful freelancer can be excellent while the cash available in any given week swings wildly. Managing this volatility requires systems, not just discipline.
      </p>

      <h2>Separate Your Money Into Three Accounts</h2>
      <p>
        The foundational cash flow management habit for freelancers is using separate accounts for operating cash, tax reserves, and business savings. Every dollar of income that comes in gets allocated immediately: a percentage to tax reserve (typically 25 to 30% for self-employed in the US), a percentage to business savings, and the remainder to operating. This allocation happens at the moment of receipt, not at the end of the month when decisions are harder.
      </p>
      <p>
        The tax reserve account is non-negotiable. Self-employed freelancers pay estimated quarterly taxes, and the penalty for underpayment compounds. Having a dedicated tax account means the money is always there when taxes are due, regardless of what happened to cash flow in the preceding months.
      </p>

      <h2>Build a Cash Flow Forecast</h2>
      <p>
        A cash flow forecast tracks the money you expect to receive, the money you expect to pay, and the resulting balance in your operating account over the next 30 to 90 days. It is not a budget (which tracks all income and expenses over a period) but a timing view: when will the money arrive, when will the expenses hit, and what is my projected balance at each point?
      </p>
      <p>
        Building this forecast does not require complex tools. A simple spreadsheet with columns for expected invoice dates, historical client payment behavior, and known upcoming expenses gives you enough visibility to make decisions proactively. AI invoicing platforms automate much of this by predicting payment timing based on client history, alerting you to expected shortfalls before they happen.
      </p>

      <h2>The Operating Reserve: Your Cash Flow Insurance</h2>
      <p>
        An operating reserve — three to six months of average monthly expenses — is the single most important financial resilience measure for freelancers. When a large client delays payment, takes their business in-house unexpectedly, or when you want to take a sabbatical, the operating reserve is what allows you to continue operating without financial panic. Building this reserve from a percentage of every payment — even a small percentage — is more achievable than making a single large contribution when circumstances allow.
      </p>

      <h2>Smooth Your Income With Recurring Revenue</h2>
      <p>
        Retainer arrangements — where clients pay a fixed monthly amount for a defined scope of ongoing work — are the most effective structural solution to income volatility. A base of two or three retainer clients covering your core monthly expenses transforms cash flow from unpredictable to stable, with project work layered on top as variable income. Moving clients from project billing to retainer arrangements is easier than most freelancers expect — many clients prefer the predictability of retainers and are willing to pay a small premium for the reliability of reserved capacity.
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
                name: 'InvoiceAI',
                url: 'https://invoiceai.com',
              },
            }),
          }}
        />
      </div>
    </div>
  );
}
