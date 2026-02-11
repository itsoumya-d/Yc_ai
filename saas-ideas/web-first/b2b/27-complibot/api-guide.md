# CompliBot -- API Integration Guide

## Integration Overview

CompliBot connects to eight external services to deliver its core value proposition: automated compliance for startups. Each integration serves a specific function in the compliance pipeline. This guide covers authentication, pricing, implementation patterns, error handling, alternatives, and cost projections for each API.

### Integration Map

| API                   | Function                              | Cost Model         | Auth Method            |
| --------------------- | ------------------------------------- | ------------------ | ---------------------- |
| OpenAI API            | Policy generation, gap analysis, AI   | Pay-per-token      | API key                |
| AWS SDK               | Infrastructure scanning (AWS)         | Free SDK           | IAM role (STS)         |
| Google Cloud API      | Infrastructure scanning (GCP)         | Free SDK           | Service account        |
| GitHub API            | Repository security scanning          | Free tier          | GitHub App (JWT)       |
| Slack API             | Task notifications, alerts            | Free               | Bot token (OAuth)      |
| Okta API / Auth0      | SSO, user management auditing         | Varies by plan     | API token / OAuth      |
| SendGrid              | Compliance reports, alert emails      | Free tier + paid   | API key                |
| Stripe                | Subscription billing                  | Percentage-based   | API key                |

---

## API 1: OpenAI API

### Purpose

OpenAI powers CompliBot's AI engine: generating compliance policies, performing gap analysis against frameworks, providing remediation guidance, and preparing audit responses. This is the most critical and expensive external dependency.

### Models Used

| Use Case                  | Model       | Avg Tokens (In/Out)  | Cost per Call   |
| ------------------------- | ----------- | -------------------- | --------------- |
| Policy generation         | GPT-4o      | 2,000 / 4,000       | ~$0.04          |
| Gap analysis              | GPT-4o      | 3,000 / 2,000       | ~$0.03          |
| Remediation guidance      | GPT-4o-mini | 1,500 / 1,000       | ~$0.001         |
| Evidence summarization    | GPT-4o-mini | 1,000 / 500          | ~$0.0005        |
| Audit prep Q&A            | GPT-4o      | 2,000 / 2,000       | ~$0.03          |
| Control mapping           | GPT-4o-mini | 1,000 / 800          | ~$0.0007        |

### Pricing (as of 2025)

| Model       | Input (per 1M tokens) | Output (per 1M tokens) | Context Window |
| ----------- | --------------------- | ---------------------- | -------------- |
| GPT-4o      | $2.50                 | $10.00                 | 128K tokens    |
| GPT-4o-mini | $0.15                 | $0.60                  | 128K tokens    |

### Authentication Setup

```typescript
// lib/ai/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  maxRetries: 3,
  timeout: 60000, // 60 second timeout for policy generation
});

export { openai };
```

### Implementation: Policy Generation

```typescript
// lib/ai/policy-generator.ts
import { openai } from './openai';

interface PolicyGenerationInput {
  framework: 'soc2' | 'gdpr' | 'hipaa' | 'iso27001';
  controlId: string;
  techStack: string[];
  employeeCount: number;
  industry: string;
  companyName: string;
}

export async function generatePolicy(input: PolicyGenerationInput): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: buildPolicySystemPrompt(input),
      },
      {
        role: 'user',
        content: `Generate a comprehensive ${input.framework} compliant policy for control ${input.controlId}.`,
      },
    ],
    temperature: 0.3, // Low temperature for consistent, professional output
    max_tokens: 4000,
    stream: true, // Stream for real-time display in policy editor
  });

  let policy = '';
  for await (const chunk of completion) {
    const content = chunk.choices[0]?.delta?.content || '';
    policy += content;
    // Emit to client via SSE for streaming display
  }

  return policy;
}
```

### Implementation: Gap Analysis

```typescript
// lib/ai/gap-analyzer.ts
import { openai } from './openai';

interface GapAnalysisInput {
  framework: string;
  scanResults: ScanFinding[];
  existingControls: OrgControl[];
}

interface Gap {
  controlId: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  remediation: string;
}

export async function analyzeGaps(input: GapAnalysisInput): Promise<Gap[]> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a compliance gap analysis engine. Analyze infrastructure scan results against ${input.framework} controls and identify gaps. Return structured JSON.`,
      },
      {
        role: 'user',
        content: JSON.stringify({
          scanResults: input.scanResults,
          existingControls: input.existingControls,
        }),
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 3000,
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return result.gaps as Gap[];
}
```

### Error Handling

```typescript
// lib/ai/error-handler.ts
import { APIError, RateLimitError, APIConnectionError } from 'openai';

export async function withOpenAIErrorHandling<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof RateLimitError) {
      // Retry with exponential backoff (handled by SDK maxRetries)
      // Log for monitoring: approaching rate limits
      console.error('OpenAI rate limit hit:', error.message);
      throw new AppError('AI service is busy. Please retry in a moment.', 429);
    }
    if (error instanceof APIConnectionError) {
      console.error('OpenAI connection failed:', error.message);
      throw new AppError('AI service temporarily unavailable.', 503);
    }
    if (error instanceof APIError && error.status === 400) {
      // Token limit exceeded -- input too large
      console.error('OpenAI input too large:', error.message);
      throw new AppError('Input data too large for analysis. Try reducing scope.', 400);
    }
    throw error;
  }
}
```

### Cost Projections

| Scale          | Monthly AI Calls           | Estimated Monthly Cost | Per-Customer Cost |
| -------------- | -------------------------- | ---------------------- | ----------------- |
| 1K customers   | 150K calls                 | $1,200 - $2,000       | $1.50             |
| 10K customers  | 1.2M calls                 | $8,000 - $15,000      | $1.15             |
| 100K customers | 8M calls                   | $50,000 - $90,000     | $0.70             |

Cost decreases per customer at scale because: (1) caching prevents redundant calls for common policy templates, (2) batch processing reduces overhead, (3) GPT-4o-mini handles an increasing share of tasks as prompt libraries mature.

### Alternatives

| Alternative      | Pros                                      | Cons                                     |
| ---------------- | ----------------------------------------- | ---------------------------------------- |
| Anthropic Claude | Strong reasoning, longer context           | Higher per-token cost at volume           |
| Google Gemini    | Competitive pricing, good at structured    | Less mature for compliance domain         |
| Self-hosted LLM  | No per-call cost, full data control        | Massive infra cost, lower quality         |
| Fine-tuned model | Better compliance outputs, lower costs     | 3-6 month investment, training data needed|

**Recommendation**: Start with OpenAI GPT-4o and GPT-4o-mini. Evaluate fine-tuning at 5K+ customers when compliance-specific training data is available. Maintain Anthropic as a fallback provider.

---

## API 2: AWS SDK (JavaScript v3)

### Purpose

The AWS SDK scans customer AWS infrastructure for compliance gaps. It reads IAM configurations, S3 bucket policies, CloudTrail settings, encryption status, VPC security groups, and more. This is a read-only integration using cross-account IAM roles.

### Services Used

| AWS Service       | SDK Package                          | Compliance Checks                              |
| ----------------- | ------------------------------------ | ---------------------------------------------- |
| IAM               | `@aws-sdk/client-iam`               | Users, roles, policies, MFA, password policy   |
| S3                | `@aws-sdk/client-s3`                | Bucket ACLs, public access, encryption         |
| CloudTrail        | `@aws-sdk/client-cloudtrail`        | Trail status, multi-region, log validation     |
| Config            | `@aws-sdk/client-config-service`    | Config rules, compliance status                |
| KMS               | `@aws-sdk/client-kms`               | Key policies, rotation, usage                  |
| EC2               | `@aws-sdk/client-ec2`               | Security groups, VPCs, flow logs               |
| Organizations     | `@aws-sdk/client-organizations`     | Multi-account structure, SCPs                  |
| GuardDuty         | `@aws-sdk/client-guardduty`         | Threat detection status                        |
| RDS               | `@aws-sdk/client-rds`               | Encryption, backup, public access              |

### Pricing

The AWS SDK itself is free. There is no cost for making API calls to read configurations. The customer pays for their own AWS resources. CompliBot incurs zero AWS API costs for scanning.

### Authentication: Cross-Account IAM Role

CompliBot uses STS AssumeRole to access customer AWS accounts. The customer creates a read-only IAM role in their account with a trust policy that allows CompliBot's AWS account to assume it.

```typescript
// lib/scanners/aws/auth.ts
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { IAMClient } from '@aws-sdk/client-iam';

const stsClient = new STSClient({ region: 'us-east-1' });

export async function getCustomerAWSClient(
  roleArn: string,
  externalId: string
) {
  const assumeRole = await stsClient.send(
    new AssumeRoleCommand({
      RoleArn: roleArn,
      ExternalId: externalId, // Prevents confused deputy attack
      RoleSessionName: `complibot-scan-${Date.now()}`,
      DurationSeconds: 3600,
    })
  );

  const credentials = {
    accessKeyId: assumeRole.Credentials!.AccessKeyId!,
    secretAccessKey: assumeRole.Credentials!.SecretAccessKey!,
    sessionToken: assumeRole.Credentials!.SessionToken!,
  };

  return new IAMClient({ region: 'us-east-1', credentials });
}
```

### Implementation: IAM Scanner

```typescript
// lib/scanners/aws/iam-scanner.ts
import {
  IAMClient,
  ListUsersCommand,
  ListMFADevicesCommand,
  GetAccountPasswordPolicyCommand,
  paginateListUsers,
} from '@aws-sdk/client-iam';

interface IAMFinding {
  resource: string;
  check: string;
  status: 'pass' | 'fail';
  severity: 'critical' | 'high' | 'medium' | 'low';
  detail: string;
  controlIds: string[];
}

export async function scanIAM(client: IAMClient): Promise<IAMFinding[]> {
  const findings: IAMFinding[] = [];

  // Check 1: Password policy
  try {
    const passwordPolicy = await client.send(
      new GetAccountPasswordPolicyCommand({})
    );
    const policy = passwordPolicy.PasswordPolicy!;

    if (!policy.RequireUppercaseCharacters) {
      findings.push({
        resource: 'IAM Password Policy',
        check: 'Password requires uppercase characters',
        status: 'fail',
        severity: 'medium',
        detail: 'IAM password policy does not require uppercase characters.',
        controlIds: ['CC6.1', 'CC6.3'],
      });
    }

    if ((policy.MinimumPasswordLength || 0) < 14) {
      findings.push({
        resource: 'IAM Password Policy',
        check: 'Minimum password length >= 14',
        status: 'fail',
        severity: 'medium',
        detail: `Password minimum length is ${policy.MinimumPasswordLength}. Recommended: 14+.`,
        controlIds: ['CC6.1'],
      });
    }
  } catch (error) {
    if ((error as any).name === 'NoSuchEntityException') {
      findings.push({
        resource: 'IAM Password Policy',
        check: 'Password policy exists',
        status: 'fail',
        severity: 'high',
        detail: 'No IAM password policy is configured.',
        controlIds: ['CC6.1', 'CC6.3'],
      });
    }
  }

  // Check 2: MFA for all users
  const paginator = paginateListUsers({ client }, {});
  for await (const page of paginator) {
    for (const user of page.Users || []) {
      const mfaDevices = await client.send(
        new ListMFADevicesCommand({ UserName: user.UserName })
      );
      if ((mfaDevices.MFADevices || []).length === 0) {
        findings.push({
          resource: `IAM User: ${user.UserName}`,
          check: 'MFA enabled for user',
          status: 'fail',
          severity: user.UserName === 'root' ? 'critical' : 'high',
          detail: `User ${user.UserName} does not have MFA enabled.`,
          controlIds: ['CC6.1', 'CC6.6'],
        });
      }
    }
  }

  return findings;
}
```

### Error Handling

```typescript
// Common AWS SDK error patterns
export async function withAWSErrorHandling<T>(
  fn: () => Promise<T>,
  integrationId: string
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (error.name === 'AccessDeniedException' || error.name === 'UnauthorizedAccess') {
      throw new AppError(
        'CompliBot does not have sufficient permissions. Please verify the IAM role.',
        403
      );
    }
    if (error.name === 'ThrottlingException' || error.name === 'TooManyRequestsException') {
      // Implement exponential backoff
      await delay(Math.pow(2, retryCount) * 1000);
      // Retry logic
    }
    if (error.name === 'ExpiredTokenException') {
      // Re-assume role and retry
      throw new AppError('AWS session expired. Reinitializing scan.', 401);
    }
    throw error;
  }
}
```

### Cost Projections

| Scale          | API Calls/Month | AWS SDK Cost | Infrastructure Cost |
| -------------- | --------------- | ------------ | ------------------- |
| 1K customers   | 2M calls        | $0           | $0                  |
| 10K customers  | 20M calls       | $0           | $0                  |
| 100K customers | 200M calls      | $0           | $0                  |

AWS SDK calls are free. The only cost is CompliBot's own compute (Vercel serverless functions) to run the scans. At 100K customers, scanning compute may require dedicated workers (estimated $2,000-$5,000/month on dedicated infrastructure).

### Alternatives

| Alternative           | Pros                                    | Cons                                    |
| --------------------- | --------------------------------------- | --------------------------------------- |
| AWS Config Rules      | Native compliance checks, auto-remediate | Customer must enable Config (adds cost) |
| AWS Security Hub      | Aggregated findings, multi-standard     | Requires customer setup, additional cost|
| Prowler (open-source) | Community-maintained checks             | Must self-host, slower updates          |
| Cloud Custodian       | Policy-as-code, flexible                | Complex to configure, self-hosted       |

**Recommendation**: Direct SDK scanning gives CompliBot full control over check logic, presentation, and mapping to compliance controls. AWS Config Rules can supplement as an optional integration for customers who already have it enabled.

---

## API 3: Google Cloud API

### Purpose

Scans customer GCP infrastructure for compliance gaps. Covers IAM bindings, Cloud Storage permissions, audit logging, encryption, firewall rules, and Security Command Center findings.

### Services Used

| GCP Service                 | NPM Package                              | Compliance Checks                        |
| --------------------------- | ---------------------------------------- | ---------------------------------------- |
| Resource Manager            | `@google-cloud/resource-manager`         | Projects, folders, org policies          |
| IAM                         | `@google-cloud/iam`                      | Roles, bindings, service accounts        |
| Cloud Storage               | `@google-cloud/storage`                  | Bucket ACLs, uniform access, encryption  |
| Cloud Logging               | `@google-cloud/logging`                  | Audit log configuration                  |
| KMS                         | `@google-cloud/kms`                      | Key rings, rotation, permissions         |
| Compute Engine              | `@google-cloud/compute`                  | Firewall rules, network policies         |
| Security Command Center     | `@google-cloud/security-center`          | Vulnerability findings, asset inventory  |

### Pricing

Google Cloud client libraries are free. No cost for API calls to read configurations. Customer pays for their own GCP resources. CompliBot incurs zero GCP API costs.

### Authentication: Service Account

```typescript
// lib/scanners/gcp/auth.ts
import { IAMClient } from '@google-cloud/iam';
import { Storage } from '@google-cloud/storage';
import { GoogleAuth } from 'google-auth-library';

export function getCustomerGCPClient(serviceAccountKey: string) {
  const credentials = JSON.parse(serviceAccountKey);

  const auth = new GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/cloud-platform.read-only',
      'https://www.googleapis.com/auth/iam.readonly',
    ],
  });

  const storage = new Storage({ authClient: auth.getClient() });
  return { auth, storage };
}
```

### Implementation: Storage Scanner

```typescript
// lib/scanners/gcp/storage-scanner.ts
import { Storage } from '@google-cloud/storage';

interface GCPFinding {
  resource: string;
  check: string;
  status: 'pass' | 'fail';
  severity: 'critical' | 'high' | 'medium' | 'low';
  detail: string;
  controlIds: string[];
}

export async function scanCloudStorage(
  storage: Storage,
  projectId: string
): Promise<GCPFinding[]> {
  const findings: GCPFinding[] = [];
  const [buckets] = await storage.getBuckets({ project: projectId });

  for (const bucket of buckets) {
    const [metadata] = await bucket.getMetadata();

    // Check 1: Uniform bucket-level access
    if (!metadata.iamConfiguration?.uniformBucketLevelAccess?.enabled) {
      findings.push({
        resource: `gs://${bucket.name}`,
        check: 'Uniform bucket-level access enabled',
        status: 'fail',
        severity: 'high',
        detail: `Bucket ${bucket.name} does not have uniform bucket-level access enabled. ACLs may allow unintended access.`,
        controlIds: ['CC6.1', 'CC6.3'],
      });
    }

    // Check 2: Encryption with CMEK
    if (!metadata.encryption?.defaultKmsKeyName) {
      findings.push({
        resource: `gs://${bucket.name}`,
        check: 'Customer-managed encryption key (CMEK)',
        status: 'fail',
        severity: 'medium',
        detail: `Bucket ${bucket.name} uses Google-managed encryption. CMEK recommended for compliance.`,
        controlIds: ['CC6.1', 'CC6.7'],
      });
    }

    // Check 3: Public access prevention
    if (metadata.iamConfiguration?.publicAccessPrevention !== 'enforced') {
      findings.push({
        resource: `gs://${bucket.name}`,
        check: 'Public access prevention enforced',
        status: 'fail',
        severity: 'critical',
        detail: `Bucket ${bucket.name} does not enforce public access prevention.`,
        controlIds: ['CC6.1', 'CC6.6'],
      });
    }
  }

  return findings;
}
```

### Error Handling

```typescript
export async function withGCPErrorHandling<T>(
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (error.code === 403) {
      throw new AppError(
        'Insufficient GCP permissions. Ensure the service account has Security Reviewer role.',
        403
      );
    }
    if (error.code === 429) {
      // Rate limit: implement exponential backoff
      throw new AppError('GCP rate limit reached. Retrying scan.', 429);
    }
    if (error.code === 404) {
      throw new AppError('GCP project not found. Verify project ID.', 404);
    }
    throw error;
  }
}
```

### Cost Projections

| Scale          | API Calls/Month | GCP SDK Cost | Notes                     |
| -------------- | --------------- | ------------ | ------------------------- |
| 1K customers   | 500K calls      | $0           | Free read-only API calls  |
| 10K customers  | 5M calls        | $0           | Free read-only API calls  |
| 100K customers | 50M calls       | $0           | Free read-only API calls  |

### Alternatives

| Alternative                    | Pros                              | Cons                               |
| ------------------------------ | --------------------------------- | ---------------------------------- |
| Security Command Center (SCC)  | Native GCP findings, auto-detect  | Premium tier costly, customer setup|
| Forseti Security (deprecated)  | Open-source, comprehensive        | No longer maintained               |
| ScoutSuite (open-source)       | Multi-cloud scanning              | Must self-host, Python-based       |

**Recommendation**: Direct client library scanning for consistent control over check logic. Optionally ingest SCC findings for customers who have it enabled.

---

## API 4: GitHub API

### Purpose

Scans customer GitHub organizations for security posture: branch protection rules, access controls, 2FA enforcement, secret scanning, Dependabot status, and webhook configurations. Maps findings to compliance controls.

### Pricing

| Tier       | Rate Limit            | Cost   | Notes                          |
| ---------- | --------------------- | ------ | ------------------------------ |
| Free       | 5,000 requests/hour   | $0     | Per installation               |
| GitHub Enterprise | 15,000 req/hour | N/A    | Customer's plan, not CompliBot |

CompliBot authenticates as a GitHub App, which gets 5,000 requests/hour per installation. This is sufficient for scanning even large organizations.

### Authentication: GitHub App

```typescript
// lib/scanners/github/auth.ts
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

export async function getGitHubClient(installationId: number) {
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
    installationId,
  });

  const { token } = await auth({ type: 'installation' });

  return new Octokit({
    auth: token,
    throttle: {
      onRateLimit: (retryAfter: number) => {
        console.warn(`GitHub rate limit hit. Retrying after ${retryAfter}s`);
        return true; // Auto-retry
      },
      onSecondaryRateLimit: () => {
        console.warn('GitHub secondary rate limit hit.');
        return true;
      },
    },
  });
}
```

### Implementation: Repository Security Scanner

```typescript
// lib/scanners/github/repo-scanner.ts
import { Octokit } from '@octokit/rest';

interface GitHubFinding {
  resource: string;
  check: string;
  status: 'pass' | 'fail';
  severity: 'critical' | 'high' | 'medium' | 'low';
  detail: string;
  controlIds: string[];
}

export async function scanRepositories(
  octokit: Octokit,
  org: string
): Promise<GitHubFinding[]> {
  const findings: GitHubFinding[] = [];

  // Get all repositories
  const repos = await octokit.paginate(octokit.repos.listForOrg, {
    org,
    per_page: 100,
  });

  for (const repo of repos) {
    if (repo.archived) continue;

    // Check 1: Branch protection on default branch
    try {
      const protection = await octokit.repos.getBranchProtection({
        owner: org,
        repo: repo.name,
        branch: repo.default_branch,
      });

      // Check: require PR reviews
      if (!protection.data.required_pull_request_reviews) {
        findings.push({
          resource: `${org}/${repo.name}`,
          check: 'Pull request reviews required',
          status: 'fail',
          severity: 'high',
          detail: `Repository ${repo.name} does not require PR reviews before merging to ${repo.default_branch}.`,
          controlIds: ['CC8.1', 'CC6.1'],
        });
      }

      // Check: require status checks
      if (!protection.data.required_status_checks) {
        findings.push({
          resource: `${org}/${repo.name}`,
          check: 'Status checks required before merge',
          status: 'fail',
          severity: 'medium',
          detail: `Repository ${repo.name} does not require status checks before merging.`,
          controlIds: ['CC8.1'],
        });
      }
    } catch (error: any) {
      if (error.status === 404) {
        findings.push({
          resource: `${org}/${repo.name}`,
          check: 'Branch protection enabled',
          status: 'fail',
          severity: 'high',
          detail: `Repository ${repo.name} has no branch protection on ${repo.default_branch}.`,
          controlIds: ['CC8.1', 'CC6.1'],
        });
      }
    }
  }

  // Check 2: Organization 2FA enforcement
  try {
    const orgData = await octokit.orgs.get({ org });
    if (!orgData.data.two_factor_requirement_enabled) {
      findings.push({
        resource: `Organization: ${org}`,
        check: '2FA required for all members',
        status: 'fail',
        severity: 'critical',
        detail: `Organization ${org} does not enforce two-factor authentication for all members.`,
        controlIds: ['CC6.1', 'CC6.6'],
      });
    }
  } catch (error) {
    // Handle permission errors
  }

  return findings;
}
```

### Error Handling

- **404 Not Found**: Branch protection not configured (this is a finding, not an error)
- **403 Forbidden**: Insufficient GitHub App permissions, prompt user to update installation
- **422 Unprocessable**: Branch does not exist, skip check and log
- **Rate limiting**: Octokit throttle plugin handles automatically with retry

### Cost Projections

| Scale          | API Calls/Month | Cost | Notes                               |
| -------------- | --------------- | ---- | ----------------------------------- |
| 1K customers   | 500K calls      | $0   | Well within 5K/hour per installation|
| 10K customers  | 5M calls        | $0   | Per-installation limits scale        |
| 100K customers | 50M calls       | $0   | May need to optimize call patterns   |

### Alternatives

| Alternative         | Pros                                  | Cons                              |
| ------------------- | ------------------------------------- | --------------------------------- |
| GitLab API          | Covers GitLab users                   | Different API surface, extra work |
| Bitbucket API       | Covers Atlassian ecosystem            | Smaller market share for startups |
| GitHub Advanced Security | Native secret/code scanning      | Customer cost, Enterprise only    |

**Recommendation**: GitHub App with REST API for MVP. Add GraphQL for bulk organization queries at scale. GitLab support in Year 2.

---

## API 5: Slack API

### Purpose

Sends compliance-related notifications to customer Slack workspaces: task assignments, deadline reminders, monitoring alerts, policy acknowledgment requests, and daily compliance digests.

### Pricing

Slack API is free for bot integrations. No per-message cost. The Slack App is distributed through Slack's App Directory (free to list).

### Authentication: Bot Token via OAuth

```typescript
// lib/integrations/slack/client.ts
import { WebClient } from '@slack/web-api';

export function getSlackClient(botToken: string) {
  return new WebClient(botToken, {
    retryConfig: {
      retries: 3,
      factor: 2,
    },
  });
}
```

### Implementation: Task Notification

```typescript
// lib/integrations/slack/notifications.ts
import { WebClient } from '@slack/web-api';

export async function sendTaskAssignmentNotification(
  client: WebClient,
  channel: string,
  task: {
    title: string;
    priority: string;
    assignee: string;
    dueDate: string;
    controlId: string;
    taskUrl: string;
  }
) {
  const severityEmoji =
    task.priority === 'critical' ? ':red_circle:' :
    task.priority === 'high' ? ':large_orange_circle:' :
    task.priority === 'medium' ? ':large_yellow_circle:' :
    ':large_blue_circle:';

  await client.chat.postMessage({
    channel,
    text: `New compliance task assigned to ${task.assignee}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${severityEmoji} *New Compliance Task*\n*${task.title}*`,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Assignee:*\n${task.assignee}` },
          { type: 'mrkdwn', text: `*Priority:*\n${task.priority}` },
          { type: 'mrkdwn', text: `*Due Date:*\n${task.dueDate}` },
          { type: 'mrkdwn', text: `*Control:*\n\`${task.controlId}\`` },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Task' },
            url: task.taskUrl,
            style: 'primary',
          },
        ],
      },
    ],
  });
}
```

### Slack App Setup

1. Create Slack App at api.slack.com/apps
2. Request scopes: `chat:write`, `channels:read`, `users:read`, `commands`
3. Enable OAuth 2.0 redirect to `/api/integrations/slack/callback`
4. Enable slash commands: `/complibot status`, `/complibot gaps`, `/complibot tasks`
5. Configure event subscriptions for interactive messages (button clicks)

### Error Handling

- **`channel_not_found`**: Channel was deleted or bot removed, notify admin in-app
- **`not_in_channel`**: Bot needs to be invited to the channel, send setup instructions
- **`ratelimited`**: Slack rate limit (1 message/second per channel), implement queue
- **`invalid_auth`**: Bot token revoked, mark integration as disconnected

### Cost Projections

| Scale          | Messages/Month | Cost | Notes                           |
| -------------- | -------------- | ---- | ------------------------------- |
| 1K customers   | 50K messages   | $0   | Free tier covers all usage      |
| 10K customers  | 500K messages  | $0   | Free tier covers all usage      |
| 100K customers | 5M messages    | $0   | Free tier covers all usage      |

### Alternatives

| Alternative      | Pros                           | Cons                             |
| ---------------- | ------------------------------ | -------------------------------- |
| Microsoft Teams  | Enterprise market share        | More complex API, webhook-based  |
| Discord          | Developer-friendly             | Not enterprise-appropriate       |
| Email (SendGrid) | Universal reach                | Lower engagement than Slack      |

**Recommendation**: Slack for MVP. Microsoft Teams in Year 2 (post-MVP Feature F12). Many enterprise customers use Teams, and adding support unlocks a significant market segment.

---

## API 6: Okta API / Auth0

### Purpose

Two functions: (1) SSO integration so CompliBot customers can use their corporate identity provider for login, and (2) auditing the customer's identity provider configuration for compliance (MFA enforcement, user lifecycle, session policies).

### Okta Pricing

| Tier             | Cost           | Features                                        |
| ---------------- | -------------- | ----------------------------------------------- |
| Okta Workforce   | $2-6/user/mo   | Customer's cost for their Okta instance         |
| Okta API access  | Included       | Read-only API access for scanning               |
| Auth0 (B2C/B2B)  | Free to $23/MAU| Alternative identity provider                   |

CompliBot does not pay for Okta. The customer has their own Okta instance. CompliBot uses Okta's API to scan the customer's identity configuration.

### Authentication: API Token

```typescript
// lib/scanners/okta/client.ts
import { Client as OktaClient } from '@okta/okta-sdk-nodejs';

export function getOktaClient(orgUrl: string, apiToken: string) {
  return new OktaClient({
    orgUrl, // e.g., https://acme-corp.okta.com
    token: apiToken,
  });
}
```

### Implementation: Identity Compliance Scanner

```typescript
// lib/scanners/okta/identity-scanner.ts
import { Client as OktaClient } from '@okta/okta-sdk-nodejs';

interface IdentityFinding {
  resource: string;
  check: string;
  status: 'pass' | 'fail';
  severity: string;
  detail: string;
  controlIds: string[];
}

export async function scanOktaIdentity(
  client: OktaClient
): Promise<IdentityFinding[]> {
  const findings: IdentityFinding[] = [];

  // Check 1: MFA enrollment policy
  const policies = await client.listPolicies({ type: 'MFA_ENROLL' });
  let mfaRequired = false;
  for await (const policy of policies) {
    if (policy.status === 'ACTIVE') {
      mfaRequired = true;
    }
  }
  if (!mfaRequired) {
    findings.push({
      resource: 'Okta MFA Policy',
      check: 'MFA enrollment policy active',
      status: 'fail',
      severity: 'critical',
      detail: 'No active MFA enrollment policy found. All users should be required to enroll in MFA.',
      controlIds: ['CC6.1', 'CC6.6'],
    });
  }

  // Check 2: Deactivated users
  const users = await client.listUsers({ filter: 'status eq "DEPROVISIONED"' });
  let deprovisionedCount = 0;
  for await (const user of users) {
    deprovisionedCount++;
  }
  // This is informational -- deprovisioned users should eventually be deleted

  return findings;
}
```

### For CompliBot's Own SSO

CompliBot uses Supabase Auth's built-in SAML/OIDC support for enterprise SSO. Customers on the Enterprise plan can configure SSO with their Okta, Azure AD, or Google Workspace identity provider through CompliBot's settings page.

### Cost Projections

| Scale          | API Calls/Month | Cost | Notes                               |
| -------------- | --------------- | ---- | ----------------------------------- |
| 1K customers   | 100K calls      | $0   | Customer's Okta plan includes API   |
| 10K customers  | 1M calls        | $0   | Customer's Okta plan includes API   |
| 100K customers | 10M calls       | $0   | Customer's Okta plan includes API   |

### Alternatives

| Alternative       | Pros                                | Cons                             |
| ----------------- | ----------------------------------- | -------------------------------- |
| Azure AD / Entra  | Massive enterprise market share     | Microsoft-specific API patterns  |
| Google Workspace   | Strong in cloud-native startups     | Less enterprise identity features|
| JumpCloud          | Growing in SMB market               | Smaller market share             |
| OneLogin           | Good SAML/OIDC support              | Being absorbed into OneIdentity  |

**Recommendation**: Okta for MVP (dominant in the startup-to-enterprise segment). Add Azure AD/Entra ID support in Year 2 for the Microsoft-centric enterprise market.

---

## API 7: SendGrid

### Purpose

Sends transactional emails: compliance report delivery, alert notifications (for users not on Slack), policy acknowledgment requests, audit room invitations, weekly compliance digest emails, and team invitation emails.

### Pricing

| Tier       | Emails/Month | Cost       | Notes                                |
| ---------- | ------------ | ---------- | ------------------------------------ |
| Free       | 100/day      | $0         | Sufficient for development and MVP   |
| Essentials | 100K/month   | $19.95/mo  | No dedicated IP, basic analytics     |
| Pro        | 100K/month   | $89.95/mo  | Dedicated IP, advanced analytics     |
| Premier    | Custom       | Custom     | SLA, dedicated support               |

### Authentication

```typescript
// lib/integrations/email/sendgrid.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export { sgMail };
```

### Implementation: Compliance Report Delivery

```typescript
// lib/integrations/email/report-sender.ts
import { sgMail } from './sendgrid';

interface ReportEmailParams {
  recipientEmail: string;
  recipientName: string;
  reportType: string;
  framework: string;
  period: string;
  pdfBuffer: Buffer;
  complianceScore: number;
}

export async function sendComplianceReport(params: ReportEmailParams) {
  const msg = {
    to: params.recipientEmail,
    from: {
      email: 'reports@complibot.io',
      name: 'CompliBot',
    },
    subject: `${params.reportType} - ${params.framework} - ${params.period}`,
    templateId: 'd-compliance-report-template-id',
    dynamicTemplateData: {
      recipientName: params.recipientName,
      reportType: params.reportType,
      framework: params.framework,
      period: params.period,
      complianceScore: params.complianceScore,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    },
    attachments: [
      {
        content: params.pdfBuffer.toString('base64'),
        filename: `CompliBot-${params.framework}-Report-${params.period}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  };

  try {
    await sgMail.send(msg);
  } catch (error: any) {
    if (error.code === 429) {
      // Rate limited -- queue for retry
      throw new AppError('Email service rate limited. Report queued for delivery.', 429);
    }
    throw error;
  }
}
```

### Email Types and Templates

| Email Type                   | Trigger                          | Frequency            |
| ---------------------------- | -------------------------------- | -------------------- |
| Compliance report (PDF)      | User generates report            | On-demand            |
| Critical alert notification  | Monitoring detects critical gap  | Real-time            |
| Task assignment              | Task assigned to user            | Real-time            |
| Deadline reminder            | Task due in 3 days / overdue     | Daily check          |
| Policy acknowledgment        | New policy published             | Per-policy           |
| Weekly compliance digest     | Automated weekly summary         | Weekly               |
| Audit room invitation        | Admin invites auditor            | Per-audit            |
| Team member invitation       | Admin invites team member        | Per-invite           |

### Cost Projections

| Scale          | Emails/Month | Monthly Cost | Per-Customer Cost |
| -------------- | ------------ | ------------ | ----------------- |
| 1K customers   | 15K emails   | $19.95       | $0.02             |
| 10K customers  | 150K emails  | $89.95       | $0.009            |
| 100K customers | 1.5M emails  | $450         | $0.005            |

### Alternatives

| Alternative     | Pros                                  | Cons                              |
| --------------- | ------------------------------------- | --------------------------------- |
| Amazon SES      | Extremely cheap ($0.10/1K emails)     | More setup, less analytics        |
| Postmark        | Excellent deliverability              | More expensive at volume          |
| Resend          | Modern API, React Email templates     | Newer, smaller scale              |
| Mailgun         | Good API, flexible                    | Deliverability requires warmup    |

**Recommendation**: SendGrid for MVP (reliable, good templates, reasonable pricing). Evaluate Amazon SES at 100K+ customers for cost savings if deliverability is proven.

---

## API 8: Stripe

### Purpose

Handles all subscription billing for CompliBot: plan selection, payment processing, subscription management, usage-based billing for add-ons, invoice generation, and customer portal for self-service billing management.

### Pricing

| Component        | Rate                                  | Notes                            |
| ---------------- | ------------------------------------- | -------------------------------- |
| Transaction fee  | 2.9% + $0.30 per transaction          | Standard card processing         |
| Billing          | 0.5% of recurring revenue             | Stripe Billing for subscriptions |
| Invoicing        | 0.4% of invoice amount                | For enterprise annual invoicing  |
| Tax              | 0.5% per transaction                  | Stripe Tax (optional)            |

### Authentication

```typescript
// lib/billing/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export { stripe };
```

### Implementation: Subscription Management

```typescript
// lib/billing/subscriptions.ts
import { stripe } from './stripe';

const PRICE_IDS = {
  startup_monthly: 'price_startup_monthly_299',
  startup_annual: 'price_startup_annual_2990',
  growth_monthly: 'price_growth_monthly_599',
  growth_annual: 'price_growth_annual_5990',
  enterprise_monthly: 'price_enterprise_monthly_999',
  enterprise_annual: 'price_enterprise_annual_9990',
};

export async function createSubscription(
  customerId: string,
  plan: keyof typeof PRICE_IDS
) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: PRICE_IDS[plan] }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      complibot_plan: plan,
    },
  });

  return subscription;
}

export async function handleSubscriptionWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created':
      // Provision plan in database
      break;
    case 'customer.subscription.updated':
      // Handle plan changes (upgrade/downgrade)
      break;
    case 'customer.subscription.deleted':
      // Deprovision plan, move to free tier
      break;
    case 'invoice.payment_failed':
      // Send dunning email, mark account as past-due
      break;
  }
}
```

### Webhook Setup

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/billing/stripe';
import { handleSubscriptionWebhook } from '@/lib/billing/subscriptions';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  await handleSubscriptionWebhook(event);
  return new Response('OK', { status: 200 });
}
```

### Error Handling

- **Card declined**: Display user-friendly message, suggest alternative payment method
- **Webhook signature mismatch**: Reject and log for security monitoring
- **Subscription past due**: Grace period (7 days), then restrict to read-only mode
- **Duplicate webhook**: Idempotency keys prevent duplicate processing

### Cost Projections

| Scale          | MRR         | Stripe Fees (3.4% effective) | Net Revenue     |
| -------------- | ----------- | ---------------------------- | --------------- |
| 1K customers   | $150K       | $5,100/mo                    | $144,900/mo     |
| 10K customers  | $1.2M       | $40,800/mo                   | $1,159,200/mo   |
| 100K customers | $8M         | $272,000/mo                  | $7,728,000/mo   |

Note: Effective rate of 3.4% includes base transaction fee (2.9% + $0.30) plus Billing fee (0.5%). For enterprise annual contracts paid by invoice or ACH, the rate drops significantly (0.8% for ACH + 0.5% Billing = 1.3%).

### Alternatives

| Alternative    | Pros                                    | Cons                              |
| -------------- | --------------------------------------- | --------------------------------- |
| Paddle         | Handles sales tax as MoR               | Higher fees, less flexibility     |
| Chargebee      | Advanced subscription management        | Additional cost on top of gateway |
| LemonSqueezy   | Simple setup, MoR model                | Less enterprise-ready             |
| Custom (Braintree) | Lower processing fees              | More implementation work          |

**Recommendation**: Stripe is the clear choice for B2B SaaS subscriptions. The ecosystem (Billing, Tax, Invoicing, Customer Portal) reduces implementation time significantly. Negotiate volume pricing at $1M+ MRR.

---

## Total API Cost Summary

### Monthly Cost by Scale

| API             | 1K Customers | 10K Customers | 100K Customers |
| --------------- | ------------ | ------------- | -------------- |
| OpenAI          | $1,600       | $11,500       | $70,000        |
| AWS SDK         | $0           | $0            | $0             |
| Google Cloud    | $0           | $0            | $0             |
| GitHub          | $0           | $0            | $0             |
| Slack           | $0           | $0            | $0             |
| Okta / Auth0    | $0           | $0            | $0             |
| SendGrid        | $20          | $90           | $450           |
| Stripe          | $5,100       | $40,800       | $272,000       |
| **Total**       | **$6,720**   | **$52,390**   | **$342,450**   |
| **% of MRR**    | **4.5%**     | **4.4%**      | **4.3%**       |

### Key Insight

API costs remain remarkably stable at approximately 4.3-4.5% of MRR across all scales. Stripe processing is the dominant cost (76% of total API spend), followed by OpenAI (24%). All infrastructure scanning APIs (AWS, GCP, GitHub) are free, which is a significant structural advantage. The primary optimization lever is OpenAI cost (caching, model selection, fine-tuning), while Stripe fees can be reduced through volume negotiation and ACH adoption for enterprise customers.

---

## Rate Limiting Strategy

CompliBot implements its own rate limiting to protect both external APIs and its own infrastructure:

| API          | CompliBot Internal Limit        | External Limit           | Strategy                    |
| ------------ | ------------------------------- | ------------------------ | --------------------------- |
| OpenAI       | 50 requests/min per org         | Varies by plan           | Queue with priority          |
| AWS SDK      | 20 requests/sec per scan        | Service-specific         | Paginate, backoff on throttle|
| GCP API      | 20 requests/sec per scan        | 600 requests/min         | Paginate, backoff on throttle|
| GitHub       | 30 requests/sec per scan        | 5,000/hour per install   | Paginate, conditional req    |
| Slack        | 1 message/sec per channel       | 1 message/sec per channel| Queue messages               |
| SendGrid     | 100 emails/sec                  | Varies by plan           | Queue with backpressure      |
| Stripe       | No additional limit             | 100 requests/sec         | Webhook-driven, not polling  |

---

## Environment Variables Reference

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...

# AWS (CompliBot's own account for STS)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# GitHub App
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
GITHUB_APP_WEBHOOK_SECRET=whsec_...

# Slack
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_SIGNING_SECRET=...

# SendGrid
SENDGRID_API_KEY=SG....

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Okta (for CompliBot's own SSO, not customer scanning)
# Customer Okta credentials are stored encrypted in the database

# Encryption
ENCRYPTION_KEY=... # 256-bit AES key for encrypting customer credentials
```

---

*Every API integration in CompliBot follows the same pattern: authenticate securely, read data with minimum required permissions, handle errors gracefully, and map findings to compliance controls. The total API cost at 4.3-4.5% of MRR keeps unit economics healthy at every scale.*
