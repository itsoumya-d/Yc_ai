'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Framework, FrameworkType } from '@/types/database';
import { getOrg } from './orgs';

// ---------------------------------------------------------------------------
// Predefined control libraries per framework type
// ---------------------------------------------------------------------------
const FRAMEWORK_CONTROLS: Record<
  FrameworkType,
  Array<{ control_code: string; title: string; description: string; category: string }>
> = {
  soc2: [
    { control_code: 'CC1.1', title: 'Board Oversight', description: 'The entity demonstrates commitment to integrity and ethical values; board provides oversight of compliance.', category: 'Control Environment' },
    { control_code: 'CC1.2', title: 'Independence & Oversight Structure', description: 'Board exercises oversight responsibility independent of management for compliance, operations, and controls.', category: 'Control Environment' },
    { control_code: 'CC1.3', title: 'Organizational Structure & Reporting', description: 'Management establishes structures, reporting lines, and appropriate authorities to pursue objectives.', category: 'Control Environment' },
    { control_code: 'CC2.1', title: 'Information Quality', description: 'The entity obtains or generates and uses relevant, quality information to support the functioning of internal control.', category: 'Communication & Information' },
    { control_code: 'CC2.2', title: 'Internal Communication', description: 'Internal communication supports the functioning of internal control, including communication of objectives and responsibilities.', category: 'Communication & Information' },
    { control_code: 'CC3.1', title: 'Risk Identification & Analysis', description: 'The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks.', category: 'Risk Assessment' },
    { control_code: 'CC3.2', title: 'Fraud Risk Assessment', description: 'The entity identifies and assesses risks of fraud for the achievement of objectives.', category: 'Risk Assessment' },
    { control_code: 'CC6.1', title: 'Logical Access Controls', description: 'Logical access security software, infrastructure, and architectures have been implemented to protect against threats.', category: 'Logical & Physical Access' },
    { control_code: 'CC6.2', title: 'Authentication', description: 'Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users.', category: 'Logical & Physical Access' },
    { control_code: 'CC6.3', title: 'Role-Based Access', description: 'The entity authorizes, modifies, or removes access to data, software, functions, and other protected resources based on roles.', category: 'Logical & Physical Access' },
    { control_code: 'CC6.7', title: 'Encryption in Transit & at Rest', description: 'The entity restricts the transmission, movement, and removal of information to authorized users and processes, and protects it during transmission.', category: 'Logical & Physical Access' },
    { control_code: 'CC7.1', title: 'Vulnerability Management', description: 'The entity uses detection and monitoring procedures to identify changes to configurations that introduce new vulnerabilities.', category: 'System Operations' },
    { control_code: 'CC7.2', title: 'Monitoring & Anomaly Detection', description: 'The entity monitors system components and the operation of those components for anomalies indicative of malicious acts, natural disasters, and errors.', category: 'System Operations' },
    { control_code: 'CC7.3', title: 'Incident Response', description: 'The entity evaluates security events to determine whether they could or have resulted in a failure to meet its objectives.', category: 'System Operations' },
    { control_code: 'CC8.1', title: 'Change Management Process', description: 'The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures.', category: 'Change Management' },
    { control_code: 'CC9.1', title: 'Risk Mitigation', description: 'The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions.', category: 'Risk Mitigation' },
    { control_code: 'CC9.2', title: 'Vendor Risk Management', description: 'The entity assesses and manages risks associated with vendors and business partners.', category: 'Risk Mitigation' },
  ],
  gdpr: [
    { control_code: 'GDPR-5.1a', title: 'Lawful Basis for Processing', description: 'Personal data shall be processed lawfully, fairly and in a transparent manner. Document and maintain records of lawful basis for each processing activity.', category: 'Lawfulness & Transparency' },
    { control_code: 'GDPR-5.1b', title: 'Purpose Limitation', description: 'Personal data must be collected for specified, explicit and legitimate purposes and not further processed in a manner incompatible with those purposes.', category: 'Lawfulness & Transparency' },
    { control_code: 'GDPR-5.1c', title: 'Data Minimisation', description: 'Personal data must be adequate, relevant and limited to what is necessary in relation to the purposes for which they are processed.', category: 'Data Minimisation' },
    { control_code: 'GDPR-5.1e', title: 'Storage Limitation', description: 'Personal data must be kept in a form which permits identification of data subjects for no longer than is necessary.', category: 'Data Minimisation' },
    { control_code: 'GDPR-5.1f', title: 'Integrity & Confidentiality', description: 'Personal data must be processed in a manner that ensures appropriate security, including protection against unauthorised or unlawful processing.', category: 'Security' },
    { control_code: 'GDPR-13', title: 'Privacy Notice at Collection', description: 'Provide data subjects with required information (identity of controller, purposes, legal basis, retention period, rights) at the time personal data is collected.', category: 'Transparency' },
    { control_code: 'GDPR-17', title: 'Right to Erasure', description: 'Implement mechanisms to delete personal data upon valid request from a data subject without undue delay.', category: 'Data Subject Rights' },
    { control_code: 'GDPR-20', title: 'Right to Data Portability', description: 'Provide data subjects with a machine-readable copy of their personal data upon request.', category: 'Data Subject Rights' },
    { control_code: 'GDPR-25', title: 'Privacy by Design & Default', description: 'Implement appropriate technical and organisational measures for data protection principles to be integrated into processing from design.', category: 'Privacy by Design' },
    { control_code: 'GDPR-30', title: 'Records of Processing Activities', description: 'Maintain a comprehensive record of all data processing activities including purposes, categories of data, recipients, and retention periods.', category: 'Accountability' },
    { control_code: 'GDPR-32', title: 'Security of Processing', description: 'Implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk, including encryption and pseudonymisation.', category: 'Security' },
    { control_code: 'GDPR-33', title: 'Breach Notification (72h)', description: 'Notify the supervisory authority within 72 hours of becoming aware of a personal data breach. Document all breaches.', category: 'Incident Management' },
    { control_code: 'GDPR-37', title: 'Data Protection Officer', description: 'Determine if a DPO is required and appoint one if necessary. Ensure DPO has sufficient resources and access to management.', category: 'Accountability' },
  ],
  hipaa: [
    { control_code: 'HIPAA-164.308a1', title: 'Security Management Process', description: 'Implement policies and procedures to prevent, detect, contain, and correct security violations. Conduct periodic risk analysis.', category: 'Administrative Safeguards' },
    { control_code: 'HIPAA-164.308a2', title: 'Assigned Security Responsibility', description: 'Identify the security official responsible for developing and implementing policies and procedures for HIPAA Security Rule.', category: 'Administrative Safeguards' },
    { control_code: 'HIPAA-164.308a3', title: 'Workforce Security', description: 'Implement policies and procedures to ensure workforce members have appropriate access to ePHI and prevent unauthorised access.', category: 'Administrative Safeguards' },
    { control_code: 'HIPAA-164.308a4', title: 'Information Access Management', description: 'Implement policies and procedures for authorising access to ePHI. Document access authorisation processes.', category: 'Administrative Safeguards' },
    { control_code: 'HIPAA-164.308a5', title: 'Security Awareness & Training', description: 'Implement a security awareness and training programme for all workforce members including management.', category: 'Administrative Safeguards' },
    { control_code: 'HIPAA-164.308a6', title: 'Security Incident Procedures', description: 'Implement policies and procedures to address security incidents including identifying and responding to suspected/known incidents.', category: 'Administrative Safeguards' },
    { control_code: 'HIPAA-164.308a7', title: 'Contingency Plan', description: 'Establish and implement policies and procedures for responding to emergency or other occurrences that damage systems containing ePHI.', category: 'Administrative Safeguards' },
    { control_code: 'HIPAA-164.310a', title: 'Facility Access Controls', description: 'Implement policies and procedures to limit physical access to electronic information systems while ensuring authorised access.', category: 'Physical Safeguards' },
    { control_code: 'HIPAA-164.310b', title: 'Workstation Use Policy', description: 'Implement policies and procedures that specify proper functions to be performed and physical attributes of the workstation environment.', category: 'Physical Safeguards' },
    { control_code: 'HIPAA-164.310d', title: 'Device & Media Controls', description: 'Implement policies and procedures that govern receipt, removal, backup, storage, and disposal of hardware and electronic media containing ePHI.', category: 'Physical Safeguards' },
    { control_code: 'HIPAA-164.312a1', title: 'Technical Access Control', description: 'Implement technical policies and procedures for electronic information systems to allow access only to persons or software programs with access rights.', category: 'Technical Safeguards' },
    { control_code: 'HIPAA-164.312b', title: 'Audit Controls', description: 'Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems containing ePHI.', category: 'Technical Safeguards' },
    { control_code: 'HIPAA-164.312e1', title: 'Transmission Security (Encryption)', description: 'Implement technical security measures to guard against unauthorised access to ePHI transmitted over an electronic communications network.', category: 'Technical Safeguards' },
  ],
  iso27001: [
    { control_code: 'A.5.1', title: 'Policies for Information Security', description: 'A set of policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.', category: 'Information Security Policies' },
    { control_code: 'A.6.1', title: 'Internal Organisation', description: 'All information security responsibilities shall be defined and allocated. Segregation of duties shall be implemented.', category: 'Organisation' },
    { control_code: 'A.8.1', title: 'Responsibility for Assets', description: 'Assets associated with information and information processing facilities shall be identified and an inventory shall be drawn up and maintained.', category: 'Asset Management' },
    { control_code: 'A.8.2', title: 'Information Classification', description: 'Information shall be classified in terms of legal requirements, value, criticality and sensitivity to unauthorised disclosure or modification.', category: 'Asset Management' },
    { control_code: 'A.9.1', title: 'Access Control Policy', description: 'An access control policy shall be established, documented and reviewed based on business and information security requirements.', category: 'Access Control' },
    { control_code: 'A.9.2', title: 'User Access Management', description: 'A formal user registration and de-registration process shall be implemented to enable assignment of access rights.', category: 'Access Control' },
    { control_code: 'A.9.4', title: 'System & Application Access Control', description: 'Access to systems and applications shall be controlled by a secure log-on procedure. Password management systems shall ensure quality passwords.', category: 'Access Control' },
    { control_code: 'A.10.1', title: 'Cryptographic Controls', description: 'A policy on the use of cryptographic controls for protection of information shall be developed and implemented. Key management shall be in place.', category: 'Cryptography' },
    { control_code: 'A.12.1', title: 'Operational Procedures & Responsibilities', description: 'Operating procedures shall be documented and made available to all users who need them. Changes to business processes shall be controlled.', category: 'Operations Security' },
    { control_code: 'A.12.4', title: 'Logging & Monitoring', description: 'Event logs recording user activities, exceptions, faults and information security events shall be produced, kept and regularly reviewed.', category: 'Operations Security' },
    { control_code: 'A.12.6', title: 'Technical Vulnerability Management', description: 'Information about technical vulnerabilities of information systems being used shall be obtained in a timely fashion and the organisation\'s exposure evaluated.', category: 'Operations Security' },
    { control_code: 'A.16.1', title: 'Management of Incidents & Improvements', description: 'Responsibilities and procedures shall be established to ensure a quick, effective, and orderly response to information security incidents.', category: 'Incident Management' },
    { control_code: 'A.17.1', title: 'Information Security Continuity', description: 'The organisation shall determine its requirements for information security and the continuity of information security management in adverse situations.', category: 'Business Continuity' },
    { control_code: 'A.18.1', title: 'Compliance with Legal Requirements', description: 'All relevant legislative statutory, regulatory, contractual requirements and the organisation\'s approach to meet these requirements shall be explicitly identified, documented and kept up to date.', category: 'Compliance' },
  ],
  pci_dss: [
    { control_code: 'PCI-1', title: 'Install & Maintain Network Security Controls', description: 'Install and maintain a firewall/router configuration to protect cardholder data. Document network security policies and procedures.', category: 'Network Security' },
    { control_code: 'PCI-2', title: 'Apply Secure Configurations', description: 'Do not use vendor-supplied defaults for system passwords and other security parameters. Apply secure configuration standards to all system components.', category: 'Secure Configuration' },
    { control_code: 'PCI-3', title: 'Protect Stored Account Data', description: 'Protect stored cardholder data using encryption, truncation, masking, or hashing. Never store sensitive authentication data after authorisation.', category: 'Data Protection' },
    { control_code: 'PCI-4', title: 'Encrypt Cardholder Data in Transit', description: 'Encrypt transmission of cardholder data across open, public networks using strong cryptography.', category: 'Data Protection' },
    { control_code: 'PCI-5', title: 'Protect Systems Against Malicious Software', description: 'Deploy anti-malware software on all systems commonly affected by malicious software. Keep all anti-malware mechanisms current.', category: 'Malware Protection' },
    { control_code: 'PCI-6', title: 'Develop & Maintain Secure Systems & Software', description: 'Develop and maintain secure systems and software. Address security vulnerabilities. Protect public-facing web applications.', category: 'Secure Development' },
    { control_code: 'PCI-7', title: 'Restrict Access to System Components', description: 'Limit access to system components and cardholder data to only those individuals whose job requires such access. Implement access control systems.', category: 'Access Control' },
    { control_code: 'PCI-8', title: 'Identify Users & Authenticate Access', description: 'Assign a unique ID to each person with computer access. Implement strong authentication for user and administrator access.', category: 'Access Control' },
    { control_code: 'PCI-9', title: 'Restrict Physical Access to Cardholder Data', description: 'Restrict physical access to systems in the cardholder data environment. Implement controls to distinguish between on-site and off-site personnel.', category: 'Physical Security' },
    { control_code: 'PCI-10', title: 'Log & Monitor All Access to System Components', description: 'Implement audit logs and review them to identify anomalies or suspicious activity. Retain audit log history for at least 12 months.', category: 'Logging & Monitoring' },
    { control_code: 'PCI-11', title: 'Test Security of Systems & Networks Regularly', description: 'Run internal and external vulnerability scans at least quarterly. Perform penetration testing at least annually.', category: 'Security Testing' },
    { control_code: 'PCI-12', title: 'Support Information Security with Policies', description: 'Establish, publish, maintain, and disseminate a security policy that addresses all PCI DSS requirements. Conduct annual risk assessments.', category: 'Policy & Procedures' },
  ],
};

export async function getFrameworks(): Promise<Framework[]> {
  const supabase = await createClient();
  const org = await getOrg();
  if (!org) return [];

  const { data, error } = await supabase
    .from('frameworks')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data as Framework[];
}

/**
 * Seeds standard controls for a framework into the database.
 * Called when a framework is first created (first enable).
 */
async function seedFrameworkControls(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orgId: string,
  frameworkId: string,
  frameworkType: FrameworkType
) {
  const controls = FRAMEWORK_CONTROLS[frameworkType] ?? [];
  if (controls.length === 0) return;

  // Check if controls already exist (avoid double-seeding)
  const { count } = await supabase
    .from('controls')
    .select('id', { count: 'exact', head: true })
    .eq('framework_id', frameworkId);

  if (count && count > 0) return;

  const rows = controls.map((c) => ({
    org_id: orgId,
    framework_id: frameworkId,
    control_code: c.control_code,
    title: c.title,
    description: c.description,
    category: c.category,
    status: 'non_compliant' as const,
    evidence_count: 0,
  }));

  await supabase.from('controls').insert(rows);

  // Update framework control counts
  await supabase
    .from('frameworks')
    .update({ controls_total: rows.length, controls_compliant: 0, compliance_score: 0 })
    .eq('id', frameworkId);
}

export async function toggleFramework(
  frameworkType: FrameworkType,
  enabled: boolean
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const org = await getOrg();
  if (!org) return { error: 'No organization found' };

  // Check if framework exists
  const { data: existing } = await supabase
    .from('frameworks')
    .select('id')
    .eq('org_id', org.id)
    .eq('framework_type', frameworkType)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('frameworks')
      .update({ enabled })
      .eq('id', existing.id);
    if (error) return { error: error.message };
  } else {
    // Create framework record and seed its controls
    const { data: newFramework, error: insertError } = await supabase
      .from('frameworks')
      .insert({
        org_id: org.id,
        framework_type: frameworkType,
        enabled,
        compliance_score: 0,
        controls_total: 0,
        controls_compliant: 0,
      })
      .select('id')
      .single();

    if (insertError || !newFramework) return { error: insertError?.message ?? 'Failed to create framework' };

    // Seed standard controls for this framework
    await seedFrameworkControls(supabase, org.id, newFramework.id, frameworkType);
  }

  revalidatePath('/frameworks');
  revalidatePath('/dashboard');
  return { error: null };
}

/**
 * Recalculates and updates the compliance score for a framework based on its controls.
 * Call after any control status change.
 */
export async function recalculateFrameworkScore(frameworkId: string): Promise<void> {
  const supabase = await createClient();

  const { data: controls } = await supabase
    .from('controls')
    .select('status')
    .eq('framework_id', frameworkId);

  if (!controls) return;

  const total = controls.length;
  const compliant = controls.filter((c) => c.status === 'compliant').length;
  const score = total > 0 ? Math.round((compliant / total) * 100) : 0;

  await supabase
    .from('frameworks')
    .update({ controls_total: total, controls_compliant: compliant, compliance_score: score })
    .eq('id', frameworkId);
}
