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
    title: `${post.title} | Petos`,
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
  'ai-veterinary-care-what-pet-owners-need-to-know': (
    <>
      <p>
        Artificial intelligence is quietly transforming veterinary medicine at a pace most pet
        owners have not noticed. From the AI-assisted diagnostic imaging your veterinarian uses
        to detect tumors earlier, to the symptom checker on your phone that helps you decide
        whether tonight&apos;s limp requires an emergency visit or can wait until morning, AI
        tools are already part of modern pet care. Understanding what they can and cannot do
        helps you use them effectively.
      </p>

      <h2>What AI Is Actually Good at in Veterinary Contexts</h2>

      <h3>Diagnostic Imaging Analysis</h3>
      <p>
        This is where AI has made the most significant clinical impact in veterinary medicine.
        Convolutional neural networks trained on thousands of radiographs, ultrasound images,
        and pathology slides can identify patterns associated with specific conditions —
        bone fractures, pulmonary abnormalities, cardiac changes — with accuracy comparable to
        specialist veterinarians. Several AI-assisted imaging platforms are now in regular use
        in referral practices, helping general practitioners provide faster diagnoses on complex
        cases without necessarily requiring a specialist referral.
      </p>

      <h3>Symptom Triage</h3>
      <p>
        AI symptom checkers do not diagnose — they triage. Given a description of symptoms,
        they estimate the urgency level and suggest whether immediate veterinary attention is
        required, a same-day appointment is warranted, or monitoring at home is appropriate.
        Well-designed systems are calibrated to err on the side of caution: when in doubt,
        they recommend professional evaluation.
      </p>
      <p>
        Used appropriately, AI triage tools reduce unnecessary emergency visits (which are
        expensive and stressful for animals) while providing guidance that helps pet owners
        recognize genuinely urgent symptoms. Studies show that pet owners who use AI triage
        tools are more likely to seek timely care for actually serious conditions and less
        likely to overreact to benign symptoms.
      </p>

      <h3>Health Trend Analysis</h3>
      <p>
        AI excels at pattern recognition across longitudinal data. Weight changes that occur
        gradually over months are difficult for pet owners to notice in daily interactions.
        Activity level declines that develop over weeks are easy to miss. AI health tracking
        tools that analyze data recorded over months can identify these trends early — when
        they are most actionable — rather than when they become obvious symptoms.
      </p>

      <h2>What AI Cannot Do</h2>
      <p>
        AI cannot perform a physical examination. The hands-on assessment of muscle tone,
        lymph node size, abdominal palpation, heart and lung auscultation, and mucous membrane
        color provides diagnostic information that no current AI system can replicate remotely.
        AI tools are decision support, not diagnosis.
      </p>
      <p>
        AI cannot prescribe medication, perform procedures, or provide the clinical judgment
        that comes from years of hands-on practice with hundreds of different animal
        presentations. It cannot see the subtle discomfort in a dog&apos;s eyes during
        palpation, or notice the slight asymmetry in a cat&apos;s pupil response that suggests
        a neurological concern.
      </p>

      <h2>How to Use AI Tools Effectively</h2>
      <p>
        Use AI symptom checkers as a first step, not a final answer. Use health tracking tools
        to provide your veterinarian with longitudinal data rather than relying on your memory
        of how your pet has been doing. Use telehealth platforms for triage and follow-up when
        appropriate, with in-person exams for anything that warrants physical assessment. The
        veterinarians who work most effectively with AI tools are those who see them as
        expanding their capacity, not replacing their expertise — the same should be true for
        pet owners.
      </p>
    </>
  ),
  'how-to-track-your-pets-health-data': (
    <>
      <p>
        Most veterinary appointments begin with the same question: &quot;How has she been?&quot;
        And most pet owners answer with some version of &quot;Pretty good, I think&quot; or
        &quot;Maybe a little less active lately?&quot; This vagueness is not a failure of
        attentiveness — it is the natural consequence of observing a gradual change without
        a baseline. Health tracking solves this by creating the baseline.
      </p>

      <h2>Why Health Data Changes Veterinary Outcomes</h2>
      <p>
        Many serious pet health conditions develop gradually. Chronic kidney disease, diabetes,
        hyperthyroidism in cats, and osteoarthritis in dogs all progress over months before
        they produce obvious symptoms. By the time a pet is visibly suffering, the disease has
        often progressed significantly. Early intervention — when treatment is most effective
        and least expensive — requires detecting these gradual changes before they become
        obvious.
      </p>
      <p>
        Longitudinal health data makes early detection possible. A weight chart that shows
        2 pounds of gradual weight loss over four months, combined with slightly increased
        water consumption and more frequent urination, is a clear signal for a diabetes
        workup — months before the more dramatic symptoms that typically prompt an emergency
        visit appear.
      </p>

      <h2>What to Track and How Often</h2>

      <h3>Weight</h3>
      <p>
        Weight is the most accessible and most informative metric for most pets. Weekly
        weighing at home (a kitchen scale works for cats and small dogs; a bathroom scale held
        while carrying the pet works for larger dogs) creates a trend line that reveals gradual
        changes invisible in daily observation. Record it with a note of anything unusual:
        changes in appetite, activity, or behavior.
      </p>

      <h3>Activity Level</h3>
      <p>
        Pet activity trackers (clip-on collar devices) now provide data comparable to human
        fitness trackers: daily steps, active hours, rest periods. Activity decline is one of
        the earliest behavioral indicators of pain, illness, or cognitive decline in senior
        pets. A tracking device that has established a pet&apos;s normal activity baseline
        makes meaningful changes immediately visible.
      </p>

      <h3>Food and Water Intake</h3>
      <p>
        Changes in food or water intake are among the most diagnostically significant early
        symptoms of many conditions. Increased water consumption is associated with kidney
        disease, diabetes, and hyperthyroidism. Decreased food intake can indicate dental pain,
        nausea, or systemic illness. Tracking these inputs does not require precision measurement
        — a consistent observation of whether your pet is eating and drinking normally,
        more, or less, noted daily, creates a useful record.
      </p>

      <h3>Symptoms and Behavioral Changes</h3>
      <p>
        A symptom journal — a simple dated log of any unusual behaviors, symptoms, or
        observations — is extraordinarily useful to veterinarians. When you can say &quot;The
        coughing started about 3 weeks ago, initially only at night, now throughout the day,
        and she has also been less interested in playing for about 6 weeks,&quot; the
        diagnostic picture is much clearer than &quot;She&apos;s been coughing lately.&quot;
      </p>

      <h2>Making It Sustainable</h2>
      <p>
        Health tracking works only if it is maintained consistently. The key is making it as
        frictionless as possible. A dedicated pet health app with quick-entry templates, automatic
        reminders, and easy veterinary sharing reduces the effort to the point where
        consistency becomes default rather than exceptional. The goal is not perfect data
        collection — it is a useful trend record that improves care quality over time.
      </p>
    </>
  ),
  'telehealth-for-pets-guide-2025': (
    <>
      <p>
        Pet telehealth was a niche service before 2020. The pandemic years pushed it into
        mainstream adoption out of necessity — and most pet owners who tried it did not go
        back to handling every concern with an in-person visit. In 2025, licensed veterinarians
        are available by video within minutes, the quality of remote triage is well-established,
        and the use cases have expanded significantly. Here is what you need to know.
      </p>

      <h2>What Pet Telehealth Can and Cannot Do</h2>

      <h3>What It Can Do Well</h3>
      <p>
        Telehealth is highly effective for a specific set of veterinary needs. Triage and
        urgency assessment — determining whether a symptom requires emergency care, a
        same-day appointment, or can be monitored — is the primary use case and the most
        well-validated application. Studies show that remote triage by licensed veterinarians
        achieves accuracy comparable to in-person triage for urgency categorization.
      </p>
      <p>
        Follow-up consultations for ongoing conditions are another high-value use case.
        A pet being managed for diabetes, heart disease, or arthritis does not need an
        in-person visit every time the owner has a question about medication, diet, or
        symptom changes. Video consultations allow the veterinarian to visually assess the
        pet, review shared health data, and adjust management recommendations without requiring
        the stress and expense of a clinic visit.
      </p>
      <p>
        Behavioral consultations translate particularly well to video. Many behavioral issues
        — anxiety, aggression, inappropriate elimination — are easier to assess in the pet&apos;s
        home environment than in a clinical setting. The home visit via video often provides
        more useful behavioral information than an in-person clinic visit where the pet&apos;s
        behavior is altered by the unfamiliar environment.
      </p>

      <h3>What Requires In-Person Care</h3>
      <p>
        Physical examination — palpation, auscultation, hands-on neurological assessment —
        cannot be performed remotely. Diagnostic procedures including bloodwork, imaging,
        urinalysis, and cultures require in-person visits. Any condition involving acute
        pain, respiratory distress, trauma, or suspected toxin ingestion should be directed
        immediately to an emergency clinic, not addressed through telehealth.
      </p>

      <h2>How to Choose a Pet Telehealth Platform</h2>
      <p>
        The most important criteria are: licensing (veterinarians must be licensed in your
        state), availability (24/7 access matters for after-hours triage), and integration
        with your pet&apos;s health records (so the consulting veterinarian has context).
        Platforms that integrate with your pet&apos;s health app, allowing the vet to review
        weight trends, medication history, and symptom logs during the consultation, provide
        significantly better care quality than platforms treating each consultation in isolation.
      </p>

      <h2>The Economics of Pet Telehealth</h2>
      <p>
        A telehealth triage consultation typically costs $25–75 — a fraction of the $150–300+
        cost of a same-day clinic visit and a small fraction of the $500–2,000 cost of an
        emergency clinic visit. For conditions that telehealth can appropriately triage as
        non-emergency, the cost savings are immediate. The larger saving is in avoided emergency
        visits for conditions that turned out not to require them — a benefit that is difficult
        to quantify but that pet owners using telehealth consistently report as significant.
      </p>

      <h2>The Future of Pet Telehealth</h2>
      <p>
        The integration of AI-assisted health monitoring with telehealth is the near-term
        frontier. Health tracking data that surfaces an anomaly triggers a telehealth
        consultation recommendation proactively, rather than waiting for the pet owner to
        notice a symptom. The veterinarian arrives at the video call with months of baseline
        health data and a specific anomaly to investigate. This model — continuous monitoring
        with intelligent escalation to human clinical judgment — represents the highest-quality
        version of ongoing pet healthcare management.
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
                name: 'Petos',
                url: 'https://petos.app',
              },
            }),
          }}
        />
      </div>
    </div>
  );
}
