'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Framework, FrameworkType, Control } from '@/types/database';

// Default control sets for each framework
const SOC2_CONTROLS = [
  { control_id: 'CC1.1', title: 'Control Environment - Management Philosophy', category: 'Common Criteria', description: 'Management establishes responsibility and accountability for internal control.' },
  { control_id: 'CC2.1', title: 'Information & Communication - Security Information', category: 'Common Criteria', description: 'Relevant information is identified and communicated to meet control objectives.' },
  { control_id: 'CC3.1', title: 'Risk Assessment - Risk Identification', category: 'Common Criteria', description: 'The entity identifies risks that threaten the achievement of its objectives.' },
  { control_id: 'CC4.1', title: 'Monitoring Activities - Internal Monitoring', category: 'Common Criteria', description: 'Ongoing monitoring activities are used to evaluate internal control.' },
  { control_id: 'CC5.1', title: 'Control Activities - Policies and Procedures', category: 'Common Criteria', description: 'Control activities are deployed through policies and procedures.' },
  { control_id: 'CC6.1', title: 'Logical Access - Access Controls', category: 'Common Criteria', description: 'Logical access security software, infrastructure, and architectures.' },
  { control_id: 'CC6.2', title: 'Logical Access - Authentication', category: 'Common Criteria', description: 'New internal and external users are registered and authorized.' },
  { control_id: 'CC6.3', title: 'Logical Access - Role Assignment', category: 'Common Criteria', description: 'Internal users are authorized and restricted to provide access only to data.' },
  { control_id: 'CC7.1', title: 'System Operations - Threat Detection', category: 'Common Criteria', description: 'Vulnerabilities and threats are identified, monitored, and evaluated.' },
  { control_id: 'CC8.1', title: 'Change Management - Change Process', category: 'Common Criteria', description: 'Changes to infrastructure, data, software, and procedures are authorized.' },
  { control_id: 'CC9.1', title: 'Risk Mitigation - Risk Mitigation', category: 'Common Criteria', description: 'Risk mitigation activities are identified and assessed.' },
  { control_id: 'A1.1', title: 'Availability - Capacity Planning', category: 'Availability', description: 'Performance and capacity demands are evaluated.' },
  { control_id: 'C1.1', title: 'Confidentiality - Data Classification', category: 'Confidentiality', description: 'Confidential information is identified and classified.' },
];

const GDPR_CONTROLS = [
  { control_id: 'ART5', title: 'Principles of Processing Personal Data', category: 'Data Processing', description: 'Ensure lawfulness, fairness, transparency, purpose limitation, data minimisation.' },
  { control_id: 'ART6', title: 'Lawful Basis for Processing', category: 'Legal Basis', description: 'Document and maintain lawful bases for all personal data processing activities.' },
  { control_id: 'ART7', title: 'Consent Management', category: 'Consent', description: 'Demonstrate that consent is freely given, specific, informed and unambiguous.' },
  { control_id: 'ART12', title: 'Transparent Information', category: 'Data Subject Rights', description: 'Provide transparent information to data subjects about processing activities.' },
  { control_id: 'ART13', title: 'Privacy Notice', category: 'Data Subject Rights', description: 'Provide privacy notices at point of collection.' },
  { control_id: 'ART17', title: 'Right to Erasure', category: 'Data Subject Rights', description: 'Implement procedures to honor data subject erasure requests.' },
  { control_id: 'ART25', title: 'Data Protection by Design', category: 'Privacy Engineering', description: 'Implement data protection by design and by default.' },
  { control_id: 'ART28', title: 'Data Processing Agreements', category: 'Vendor Management', description: 'Execute DPAs with all data processors.' },
  { control_id: 'ART30', title: 'Records of Processing', category: 'Documentation', description: 'Maintain records of processing activities (ROPA).' },
  { control_id: 'ART32', title: 'Security of Processing', category: 'Security', description: 'Implement appropriate technical and organisational measures.' },
  { control_id: 'ART33', title: 'Breach Notification', category: 'Incident Response', description: 'Notify supervisory authority within 72 hours of a data breach.' },
];

const HIPAA_CONTROLS = [
  { control_id: 'HP-AC-1', title: 'Access Control Policy', category: 'Administrative Safeguards', description: 'Implement policies for accessing ePHI systems.' },
  { control_id: 'HP-AU-1', title: 'Audit Controls', category: 'Technical Safeguards', description: 'Implement hardware, software, and procedural mechanisms to record and examine activity.' },
  { control_id: 'HP-AA-1', title: 'Authentication', category: 'Technical Safeguards', description: 'Implement procedures to verify a person seeking access to ePHI is the one claimed.' },
  { control_id: 'HP-TR-1', title: 'Transmission Security', category: 'Technical Safeguards', description: 'Implement technical security measures to guard against unauthorized access to ePHI transmitted.' },
  { control_id: 'HP-BA-1', title: 'Business Associate Agreements', category: 'Administrative Safeguards', description: 'Execute BAAs with all business associates.' },
  { control_id: 'HP-RA-1', title: 'Risk Analysis', category: 'Administrative Safeguards', description: 'Conduct an accurate and thorough assessment of potential risks and vulnerabilities.' },
  { control_id: 'HP-RM-1', title: 'Risk Management', category: 'Administrative Safeguards', description: 'Implement security measures sufficient to reduce risks and vulnerabilities.' },
  { control_id: 'HP-SA-1', title: 'Security Awareness Training', category: 'Administrative Safeguards', description: 'Implement a security awareness and training program for all workforce members.' },
  { control_id: 'HP-IR-1', title: 'Incident Response', category: 'Administrative Safeguards', description: 'Implement policies and procedures to address security incidents.' },
  { control_id: 'HP-CP-1', title: 'Contingency Plan', category: 'Administrative Safeguards', description: 'Establish policies for responding to an emergency or occurrence that damages systems.' },
];

const ISO27001_CONTROLS = [
  { control_id: 'A.5.1', title: 'Information Security Policies', category: 'Policies', description: 'A set of policies for information security shall be defined, approved, and communicated.' },
  { control_id: 'A.6.1', title: 'Internal Organization', category: 'Organization', description: 'All information security responsibilities shall be defined and allocated.' },
  { control_id: 'A.7.1', title: 'Human Resource Security', category: 'HR Security', description: 'Background verification checks shall be carried out on all candidates for employment.' },
  { control_id: 'A.8.1', title: 'Asset Management', category: 'Asset Management', description: 'Assets associated with information and information processing facilities shall be identified.' },
  { control_id: 'A.9.1', title: 'Access Control Policy', category: 'Access Control', description: 'An access control policy shall be established, documented, and reviewed.' },
  { control_id: 'A.10.1', title: 'Cryptographic Controls', category: 'Cryptography', description: 'A policy on the use of cryptographic controls shall be developed and implemented.' },
  { control_id: 'A.11.1', title: 'Physical Security', category: 'Physical Security', description: 'Security perimeters shall be defined and used to protect areas that contain sensitive information.' },
  { control_id: 'A.12.1', title: 'Operational Security', category: 'Operations', description: 'Operating procedures shall be documented and made available to all users who need them.' },
  { control_id: 'A.13.1', title: 'Network Security Management', category: 'Communications', description: 'Networks shall be managed and controlled to protect information in systems and applications.' },
  { control_id: 'A.14.1', title: 'Security in Development', category: 'System Development', description: 'Information security related requirements shall be included in software development.' },
  { control_id: 'A.15.1', title: 'Supplier Security', category: 'Supplier Relations', description: 'Information security requirements for mitigating risks associated with supplier access.' },
  { control_id: 'A.16.1', title: 'Incident Management', category: 'Incident Response', description: 'Responsibilities and procedures shall be established to ensure a quick and effective response.' },
  { control_id: 'A.17.1', title: 'Business Continuity', category: 'Business Continuity', description: 'Requirements for information security and continuity shall be determined.' },
];

const FRAMEWORK_CONTROLS: Record<FrameworkType, typeof SOC2_CONTROLS> = {
  soc2: SOC2_CONTROLS,
  gdpr: GDPR_CONTROLS,
  hipaa: HIPAA_CONTROLS,
  iso27001: ISO27001_CONTROLS,
};

export async function getFrameworks(): Promise<{ data?: Framework[]; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
  if (!profile?.organization_id) return { data: [] };

  const { data, error } = await supabase
    .from('frameworks')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: true });

  if (error) return { error: error.message };
  return { data: data as Framework[] };
}

export async function enableFramework(frameworkType: FrameworkType): Promise<{ data?: Framework; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();

  // Create org if needed
  if (!profile?.organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .insert({ name: 'My Organization', industry: null, size: null })
      .select()
      .single();
    if (org) {
      await supabase.from('profiles').upsert({ id: user.id, organization_id: org.id });
      profile = { organization_id: org.id };
    }
  }

  if (!profile?.organization_id) return { error: 'Failed to create organization' };
  const orgId = profile.organization_id;

  // Check if already exists
  const { data: existing } = await supabase
    .from('frameworks')
    .select('*')
    .eq('organization_id', orgId)
    .eq('type', frameworkType)
    .single();

  let framework: Framework;
  if (existing) {
    const { data, error } = await supabase
      .from('frameworks')
      .update({ enabled: true, status: 'in_progress' })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return { error: error.message };
    framework = data as Framework;
  } else {
    const { data, error } = await supabase
      .from('frameworks')
      .insert({
        organization_id: orgId,
        type: frameworkType,
        status: 'in_progress',
        compliance_score: 0,
        enabled: true,
        start_date: new Date().toISOString(),
        target_date: null,
      })
      .select()
      .single();
    if (error) return { error: error.message };
    framework = data as Framework;

    // Create default controls
    const controls = FRAMEWORK_CONTROLS[frameworkType];
    const controlRows = controls.map((c) => ({
      framework_id: framework.id,
      organization_id: orgId,
      control_id: c.control_id,
      title: c.title,
      description: c.description,
      category: c.category,
      status: 'not_started' as const,
      severity: 'medium' as const,
      owner: null,
      notes: null,
      due_date: null,
    }));
    await supabase.from('controls').insert(controlRows);
  }

  revalidatePath('/frameworks');
  revalidatePath('/dashboard');
  return { data: framework };
}

export async function disableFramework(frameworkId: string): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('frameworks')
    .update({ enabled: false })
    .eq('id', frameworkId);

  if (error) return { error: error.message };
  revalidatePath('/frameworks');
  return {};
}
