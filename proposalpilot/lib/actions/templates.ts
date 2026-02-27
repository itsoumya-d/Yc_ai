'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Template, TemplateSection } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getTemplates(): Promise<ActionResult<Template[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('templates').select('*').or(`user_id.eq.${user.id},is_default.eq.true`).order('is_default', { ascending: false }).order('name');
  if (error) return { error: error.message };
  return { data: data as Template[] };
}

export async function getTemplateSections(templateId: string): Promise<ActionResult<TemplateSection[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('template_sections').select('*').eq('template_id', templateId).order('order_index');
  if (error) return { error: error.message };
  return { data: data as TemplateSection[] };
}

export async function createTemplate(formData: FormData): Promise<ActionResult<Template>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase.from('templates').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    industry: formData.get('industry') as string || null,
    category: formData.get('category') as string || 'custom',
    is_default: false,
  }).select().single();

  if (error) return { error: error.message };
  revalidatePath('/templates');
  return { data: data as Template };
}

export async function deleteTemplate(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_default', false);

  if (error) return { error: error.message };
  revalidatePath('/templates');
  return {};
}

/**
 * Seed default industry templates if none exist.
 */
export async function seedDefaultTemplates(): Promise<void> {
  const supabase = await createClient();

  const { count } = await supabase
    .from('templates')
    .select('id', { count: 'exact', head: true })
    .eq('is_default', true);

  if ((count ?? 0) > 0) return;

  const defaults = [
    {
      name: 'Software Development',
      description: 'Full-stack software development proposal with technical scope, timeline, and deliverables.',
      industry: 'Technology',
      category: 'development',
      sections: [
        { title: 'Executive Summary', content: 'We propose to develop a [description] solution that will [business outcome]. Our team brings [X] years of experience.', order_index: 0 },
        { title: 'Project Scope', content: '## In Scope\n- [Feature 1]\n- [Feature 2]\n\n## Out of Scope\n- [Exclusion 1]', order_index: 1 },
        { title: 'Technical Approach', content: '### Technology Stack\n- Frontend: [Framework]\n- Backend: [Framework]\n- Database: [DB]', order_index: 2 },
        { title: 'Timeline & Milestones', content: '| Milestone | Duration | Deliverable |\n|-----------|----------|-------------|\n| Phase 1: Setup | 1 week | Dev environment |\n| Phase 2: Core | 4 weeks | MVP |', order_index: 3 },
        { title: 'Investment', content: '| Service | Rate | Estimate |\n|---------|------|----------|\n| Development | $XXX/hr | XX hrs |\n\n**Total: $XX,XXX**', order_index: 4 },
        { title: 'Terms & Conditions', content: '1. 50% deposit required to begin work.\n2. Payment due within 30 days of invoice.\n3. Proposal valid for 30 days.', order_index: 5 },
      ],
    },
    {
      name: 'Digital Marketing Campaign',
      description: 'Comprehensive digital marketing proposal covering SEO, paid ads, and content strategy.',
      industry: 'Marketing',
      category: 'marketing',
      sections: [
        { title: 'Executive Summary', content: 'We propose a comprehensive digital marketing strategy to grow [client]\'s online presence by [X]% over [timeframe].', order_index: 0 },
        { title: 'Strategy & Services', content: '## SEO Strategy\n[Approach]\n\n## Paid Media\n[PPC/social]\n\n## Content Marketing\n[Content plan]', order_index: 1 },
        { title: 'KPIs & Metrics', content: '| Metric | Current | 3-Month Target |\n|--------|---------|---------------|\n| Organic Traffic | - | +20% |\n| Conversion Rate | - | 2% |', order_index: 2 },
        { title: 'Investment', content: '## Monthly Retainer\n| Service | Cost |\n|---------|------|\n| SEO & Content | $X,XXX |\n| Paid Ads | $X,XXX |\n\n**Total: $X,XXX/month**', order_index: 3 },
        { title: 'Terms', content: 'Minimum 3-month commitment. 30-day notice for cancellation. Ad spend billed separately.', order_index: 4 },
      ],
    },
    {
      name: 'Brand Identity Design',
      description: 'Creative brand identity proposal including logo, brand guidelines, and collateral.',
      industry: 'Design',
      category: 'design',
      sections: [
        { title: 'Introduction', content: 'We\'re excited to create a complete brand identity system for [client] that reflects your values.', order_index: 0 },
        { title: 'Scope of Work', content: '## Included\n- Logo design (3 concepts, 2 revisions)\n- Color palette\n- Typography system\n- Brand guidelines\n- Business card design', order_index: 1 },
        { title: 'Design Process', content: '1. **Discovery** (Week 1)\n2. **Concepts** (Week 2-3)\n3. **Refinement** (Week 4)\n4. **Delivery** (Week 5)', order_index: 2 },
        { title: 'Investment', content: '| Package | Price |\n|---------|-------|\n| Core Brand Identity | $X,XXX |\n\n50% deposit to begin. Balance on delivery.', order_index: 3 },
      ],
    },
    {
      name: 'Business Consulting',
      description: 'Management consulting proposal for strategy, operations, or organizational improvement.',
      industry: 'Consulting',
      category: 'consulting',
      sections: [
        { title: 'Executive Summary', content: 'We propose a [X]-week engagement to [objective]. Our methodology has helped [X]+ companies achieve [outcome].', order_index: 0 },
        { title: 'Proposed Approach', content: '### Phase 1: Assessment (Weeks 1-2)\n- Stakeholder interviews\n- Process mapping\n\n### Phase 2: Strategy (Weeks 3-4)\n- Recommendations\n\n### Phase 3: Implementation (Weeks 5-8)\n- Change management', order_index: 1 },
        { title: 'Expected Outcomes', content: '- [Outcome 1] by [timeframe]\n- ROI of [X]x within [Y] months', order_index: 2 },
        { title: 'Investment', content: '| Role | Rate | Hours | Cost |\n|------|------|-------|------|\n| Consultant | $XXX/hr | XX | $XX,XXX |\n\n**Total: $XX,XXX**', order_index: 3 },
      ],
    },
    {
      name: 'Website Design & Development',
      description: 'Complete website redesign proposal including UX, development, and launch.',
      industry: 'Web Design',
      category: 'web',
      sections: [
        { title: 'Project Overview', content: 'We will design and develop a new website for [client] that is fast, mobile-responsive, and conversion-optimized.', order_index: 0 },
        { title: 'What\'s Included', content: '✓ UX wireframes\n✓ Visual design (desktop + mobile)\n✓ CMS setup\n✓ [X] core pages\n✓ SEO optimization\n✓ 30-day post-launch support', order_index: 1 },
        { title: 'Timeline', content: '| Phase | Duration |\n|-------|----------|\n| Discovery | 1 week |\n| Design | 2 weeks |\n| Development | 3 weeks |\n| Launch | 1 week |', order_index: 2 },
        { title: 'Investment', content: '| Service | Cost |\n|---------|------|\n| Design | $X,XXX |\n| Development | $X,XXX |\n\n**Total: $XX,XXX**', order_index: 3 },
        { title: 'Terms', content: '40% deposit to begin, 30% at design approval, 30% at launch. Hosting and domain not included.', order_index: 4 },
      ],
    },
  ];

  for (const template of defaults) {
    const { sections, ...templateData } = template;
    const { data: created } = await supabase
      .from('templates')
      .insert({ ...templateData, user_id: null, is_default: true })
      .select()
      .single();

    if (created) {
      await supabase.from('template_sections').insert(
        sections.map((s) => ({ template_id: created.id, ...s }))
      );
    }
  }
}
