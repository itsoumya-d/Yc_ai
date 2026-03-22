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
    title: `${post.title} | ClaimForge`,
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
  'personal-injury-claim-process': (
    <>
      <p>
        A personal injury claim involves far more steps than most claimants realize when they start the process. Understanding the timeline — and what happens at each stage — allows you to make informed decisions, avoid common mistakes, and set realistic expectations for both timeline and outcome. Here is a complete walkthrough of the process from incident to resolution.
      </p>

      <h2>Stage 1: Immediate Post-Incident (Days 1–7)</h2>
      <p>
        The first week after an injury is the most critical for building a strong claim. Seek medical treatment immediately, even if injuries seem minor — delayed treatment is one of the most common grounds for insurance companies to dispute claims. Document everything: photographs of the scene, your injuries, and any property damage; contact information for witnesses; police or incident reports; and a written account of events while your memory is fresh. The quality of evidence collected in the first days often determines the strength of the claim years later.
      </p>
      <p>
        Notify relevant parties as required. Some claims (workers compensation, government defendants) have strict notification deadlines. Consult an attorney before making any statements to insurance companies — initial recorded statements are frequently used against claimants during later negotiations.
      </p>

      <h2>Stage 2: Medical Treatment and Documentation (Weeks 1–6+)</h2>
      <p>
        Follow your treatment plan consistently. Gaps in treatment are interpreted by insurance adjusters as evidence that your injuries were not as serious as claimed. Keep records of every medical appointment, prescription, and out-of-pocket expense. Document how your injuries affect your daily life — missed work, inability to perform normal activities, and impact on family relationships are all compensable damages that require documentation to recover.
      </p>

      <h2>Stage 3: Claim Investigation (Weeks 2–8)</h2>
      <p>
        Once a claim is filed, the insurance company will conduct its own investigation. This includes reviewing police reports, gathering witness statements, analyzing medical records, and assessing liability. AI-powered case management tools can help you track all incoming evidence requests, maintain a complete document record, and identify gaps in your evidence before they become vulnerabilities. The insurer&apos;s investigation is not neutral — it is conducted to minimize liability. Your counter-investigation builds the evidentiary foundation for your demand.
      </p>

      <h2>Stage 4: Maximum Medical Improvement and Demand Letter (Months 3–12+)</h2>
      <p>
        The demand letter should not be sent until you have reached Maximum Medical Improvement (MMI) — the point where your injuries have stabilized and your total damages can be accurately calculated. Settling before MMI risks leaving future medical costs uncompensated. Once at MMI, your attorney calculates total damages including medical bills, lost wages, future medical costs, and pain and suffering, then sends a formal demand letter to the insurer.
      </p>

      <h2>Stage 5: Negotiation and Settlement or Litigation (Months 6–24+)</h2>
      <p>
        Most personal injury claims settle before trial. The insurer will respond to the demand with a counteroffer; negotiation typically involves multiple rounds before reaching an agreed settlement amount. If settlement cannot be reached, the claim proceeds to litigation — filing a lawsuit, discovery, depositions, and potentially trial. AI case management platforms significantly reduce the time and cost of litigation by automating document review, organizing evidence chronologically, and generating discovery responses from the existing case record.
      </p>
    </>
  ),
  'insurance-claim-denied': (
    <>
      <p>
        A denied insurance claim is not the end of the road. It is the beginning of an appeals process that, when executed correctly, results in claim approval in a significant percentage of cases. The key is understanding why the claim was denied, gathering the right evidence to address that specific reason, and navigating the appeals process with precision. Here is the step-by-step approach.
      </p>

      <h2>Step 1: Get the Denial in Writing and Understand It Completely</h2>
      <p>
        Request a written denial letter if you have not received one. The letter must specify the reason for denial — insurers are legally required to provide this. Common denial reasons include: the claimed event is not covered under the policy, the claim was filed outside the deadline, the insurer disputes that the event occurred as described, pre-existing condition exclusions apply, or the claimed damages are disputed. Each of these reasons requires a different response strategy. Responding to the wrong issue wastes time and weakens your appeal.
      </p>

      <h2>Step 2: Review Your Policy Carefully</h2>
      <p>
        Read your policy — including all exclusions and endorsements — in detail. Insurers sometimes deny claims under exclusions that do not actually apply, or misapply policy language. If you believe the insurer has misread the policy, your appeal should include a legal analysis of the correct policy interpretation. Ambiguous policy language is generally interpreted in favor of the insured, not the insurer.
      </p>

      <h2>Step 3: Gather the Evidence That Addresses the Denial Reason</h2>
      <p>
        If the denial was based on a factual dispute, your appeal must provide evidence directly addressing that dispute. Denial based on pre-existing conditions requires medical records establishing that the claimed condition is new or was materially aggravated by the covered event. Denial based on disputed causation requires expert opinions connecting the event to the claimed damages. AI document analysis tools can rapidly process large volumes of medical records, identifying the specific documentation that supports your position and flagging contradictions that need to be addressed.
      </p>

      <h2>Step 4: File a Formal Appeal Within the Deadline</h2>
      <p>
        Most insurance policies have an internal appeals process with strict deadlines — typically 30 to 180 days from the denial date. Missing this deadline may forfeit your right to appeal. Submit a written appeal that directly addresses each stated reason for denial, includes all supporting evidence, references specific policy language, and requests a written response within a defined timeframe.
      </p>

      <h2>Step 5: External Appeal and Regulatory Complaint</h2>
      <p>
        If the internal appeal is denied, most states offer an external appeal process through the state insurance commissioner. Filing a regulatory complaint is free, and the threat of regulatory scrutiny often motivates insurers to reconsider denials. An attorney specializing in insurance bad faith can evaluate whether the denial constitutes a breach of the insurer&apos;s duty of good faith — a claim that can result in damages beyond the original policy benefits.
      </p>
    </>
  ),
  'medical-malpractice-evidence': (
    <>
      <p>
        Medical malpractice cases are among the most evidence-intensive in personal injury law. Proving that a healthcare provider departed from the standard of care, and that this departure caused the claimed harm, requires a specific type of evidence gathered in a specific order. Cases that are strong on the facts but weak on documentation fail at the expert opinion stage. Cases that have excellent documentation but the wrong experts fail at trial. Understanding what evidence you need — and how to build it — is the foundation of a winnable case.
      </p>

      <h2>Act Immediately: The Evidence That Disappears</h2>
      <p>
        Some medical malpractice evidence has a short shelf life. Electronic health records can be amended after the fact; the original version may be lost if not preserved immediately. Incident reports prepared by hospital staff are subject to destruction after retention periods expire. Contemporaneous notes from nursing staff and other providers are often separated from the main medical record. Preserving records immediately — through a formal preservation demand to the hospital or provider — prevents evidence destruction that can occur through normal records management.
      </p>
      <p>
        Request complete medical records immediately, including all nursing notes, medication administration records, surgical reports, pathology reports, imaging studies and the actual images (not just reports), and all internal communications about the patient&apos;s care. AI document processing tools can organize thousands of pages of medical records chronologically and extract key clinical events, creating the timeline that forms the backbone of the malpractice narrative.
      </p>

      <h2>Expert Medical Opinion: The Core of Every Case</h2>
      <p>
        Medical malpractice cases cannot proceed without qualified expert testimony establishing the standard of care and the departure from it. The standard of care is what a reasonably competent healthcare provider in the same specialty would have done under the same circumstances. Your expert must be able to explain this standard clearly to a lay jury and articulate specifically how the defendant departed from it.
      </p>
      <p>
        Expert selection is the most consequential strategic decision in a medical malpractice case. The expert must be qualified in the specific specialty at issue, credible to a jury, and willing to testify. Defense counsel will attack the expert&apos;s qualifications and opinions aggressively. AI case analysis tools help identify the specific clinical issues at dispute, surface relevant medical literature establishing the standard of care, and organize the factual record that experts use as the basis for their opinions.
      </p>

      <h2>Causation Evidence: The Chain That Must Not Break</h2>
      <p>
        Proving that the provider&apos;s departure from the standard of care caused the claimed harm requires establishing a clear causal chain. This is often the most difficult element to prove because alternative causation arguments are available in virtually every case — the patient was already sick, the condition would have progressed regardless, or the harm would have occurred even with appropriate care.
      </p>
      <p>
        Medical literature supporting the causation theory, statistical evidence of outcomes for patients who receive proper versus improper care, and expert testimony specifically addressing the &quot;but for&quot; causation question are all required. Building this evidence requires systematic analysis of the medical record against the relevant medical literature — a task that AI-assisted case management platforms perform significantly faster than manual review.
      </p>

      <h2>Damages Documentation: Capturing the Full Impact</h2>
      <p>
        Damages in medical malpractice cases typically include past and future medical expenses, past and future lost earnings, and non-economic damages for pain, suffering, and loss of enjoyment of life. Each category requires specific evidence. Life care planners and vocational experts quantify future medical needs and earning capacity losses. Treating physicians document the long-term impact on physical function. Personal testimony and family member accounts establish the quality-of-life impact that juries find most compelling.
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
                name: 'ClaimForge',
                url: 'https://claimforge.com',
              },
            }),
          }}
        />
      </div>
    </div>
  );
}
