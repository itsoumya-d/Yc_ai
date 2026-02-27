'use server';

import { createClient } from '@/lib/supabase/server';
import type { Policy, FrameworkType } from '@/types/database';
import { getOrg } from './orgs';
import OpenAI from 'openai';

export async function getPolicies(): Promise<Policy[]> {
  const supabase = await createClient();
  const org = await getOrg();
  if (!org) return [];

  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as Policy[];
}

const FRAMEWORK_LABELS: Record<FrameworkType, string> = {
  soc2: 'SOC 2',
  gdpr: 'GDPR',
  hipaa: 'HIPAA',
  iso27001: 'ISO 27001',
  pci_dss: 'PCI DSS',
};

const POLICY_TYPE_DESCRIPTIONS: Record<string, string> = {
  access_control: 'Access Control Policy covering user provisioning, de-provisioning, role-based access, and least-privilege principles.',
  data_retention: 'Data Retention and Deletion Policy defining retention schedules, archival procedures, and secure data destruction.',
  incident_response: 'Incident Response Policy outlining detection, containment, eradication, recovery, and post-incident review procedures.',
  acceptable_use: 'Acceptable Use Policy defining permitted and prohibited uses of organizational IT assets and data.',
  encryption: 'Encryption Policy specifying encryption standards for data at rest and in transit.',
  vulnerability_management: 'Vulnerability Management Policy covering scanning, patching, and remediation timelines.',
  vendor_management: 'Vendor and Third-Party Risk Management Policy for due diligence and ongoing oversight.',
  business_continuity: 'Business Continuity and Disaster Recovery Policy for maintaining operations during disruptions.',
  change_management: 'Change Management Policy for controlled system and software changes.',
  privacy: 'Privacy Policy documenting personal data collection, processing, and individual rights.',
};

export async function generatePolicy(
  orgId: string,
  frameworkType: FrameworkType,
  policyType: string
): Promise<{ policy: Policy | null; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { policy: null, error: 'Not authenticated' };

  const frameworkLabel = FRAMEWORK_LABELS[frameworkType] ?? frameworkType.toUpperCase();
  const policyDescription = POLICY_TYPE_DESCRIPTIONS[policyType] ?? policyType;
  const policyTitle = `${frameworkLabel} ${policyType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Policy`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let content: string;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a compliance expert specializing in ${frameworkLabel}.
Generate a comprehensive, production-ready policy document in Markdown format.
The policy should be professional, detailed, and directly usable by a business.
Include: Purpose, Scope, Policy Statements, Roles & Responsibilities, Procedures,
Enforcement, Exceptions process, Review cycle, and Document control section.
Use proper Markdown headers (##, ###), bullet points, and tables where appropriate.
Do not include placeholder text - write fully formed policy content.`,
        },
        {
          role: 'user',
          content: `Generate a ${policyTitle} for compliance with ${frameworkLabel}.
This is a ${policyDescription}
The policy should align with ${frameworkLabel} requirements and best practices.
Make it comprehensive and ready to use, approximately 800-1200 words.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    content = completion.choices[0]?.message?.content ?? '';
  } catch (err) {
    return { policy: null, error: `OpenAI error: ${err instanceof Error ? err.message : 'Unknown error'}` };
  }

  const { data, error } = await supabase
    .from('policies')
    .insert({
      org_id: orgId,
      title: policyTitle,
      content,
      framework_types: [frameworkType],
      status: 'draft',
      version: 1,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return { policy: null, error: error.message };
  return { policy: data as Policy, error: null };
}

export async function updatePolicyStatus(
  id: string,
  status: Policy['status']
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const org = await getOrg();
  if (!org) return { error: 'No organization found' };

  const { error } = await supabase
    .from('policies')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('org_id', org.id);

  if (error) return { error: error.message };
  return { error: null };
}
