/**
 * ACORD XML adapter for insurance carrier communication.
 * Converts ClaimForge claims to ACORD ClaimsSvc XML format and parses responses.
 */

import type { Claim, ClaimType } from '@/types/database';

// ── Carrier Registry ────────────────────────────────────────────────────────

export const CARRIER_REGISTRY: Record<string, { name: string; code: string; claimPrefix: string }> = {
  state_farm: { name: 'State Farm', code: 'SF', claimPrefix: 'SF' },
  allstate: { name: 'Allstate', code: 'ALL', claimPrefix: 'AL' },
  geico: { name: 'GEICO', code: 'GEI', claimPrefix: 'GE' },
  progressive: { name: 'Progressive', code: 'PRG', claimPrefix: 'PG' },
  liberty_mutual: { name: 'Liberty Mutual', code: 'LM', claimPrefix: 'LM' },
  nationwide: { name: 'Nationwide', code: 'NW', claimPrefix: 'NW' },
  usaa: { name: 'USAA', code: 'USAA', claimPrefix: 'UA' },
  travelers: { name: 'Travelers', code: 'TRV', claimPrefix: 'TV' },
  farmers: { name: 'Farmers', code: 'FRM', claimPrefix: 'FM' },
  american_family: { name: 'American Family', code: 'AF', claimPrefix: 'AF' },
};

// ── ACORD Claim Type Mapping ────────────────────────────────────────────────

const ACORD_CLAIM_TYPE_CODE: Record<ClaimType, string> = {
  auto: 'AUTO',
  property: 'PROP',
  health: 'HLTH',
  liability: 'LIAB',
};

const ACORD_LOB_CODE: Record<ClaimType, string> = {
  auto: 'AUTOP',
  property: 'HOME',
  health: 'HEALTH',
  liability: 'CGL',
};

// ── XML Escaping ────────────────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ── Generate Carrier-Specific Claim Number ──────────────────────────────────

export function generateClaimNumber(carrierCode: string, claimId: string): string {
  const registry = Object.values(CARRIER_REGISTRY).find((c) => c.code === carrierCode);
  const prefix = registry?.claimPrefix ?? 'XX';
  const year = new Date().getFullYear();
  const shortId = claimId.replace(/-/g, '').slice(0, 8).toUpperCase();
  return `${prefix}-${year}-${shortId}`;
}

// ── Claim → ACORD ClaimsSvc XML ─────────────────────────────────────────────

interface ClaimDocument {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

export function claimToAcordXml(
  claim: Claim,
  documents: ClaimDocument[],
  carrierCode: string,
): string {
  const now = new Date().toISOString();
  const claimTypeCode = ACORD_CLAIM_TYPE_CODE[claim.claim_type] ?? 'AUTO';
  const lobCode = ACORD_LOB_CODE[claim.claim_type] ?? 'AUTOP';
  const carrierClaimNum = generateClaimNumber(carrierCode, claim.id);

  const documentAttachments = documents
    .map(
      (doc) => `
      <Attachment>
        <AttachmentTypeCd>ClaimDocument</AttachmentTypeCd>
        <AttachmentDesc>${escapeXml(doc.title)}</AttachmentDesc>
        <FileName>${escapeXml(doc.file_name)}</FileName>
        <MIMEContentTypeCd>${escapeXml(doc.file_type)}</MIMEContentTypeCd>
        <FileSize>${doc.file_size}</FileSize>
        <AttachmentRef>${doc.id}</AttachmentRef>
      </Attachment>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ACORD xmlns="http://www.ACORD.org/standards/PC_Surety/ACORD1/xml/">
  <SignonRq>
    <SignonPswd>
      <CustId>
        <SPName>ClaimForge</SPName>
        <CustLoginId>API</CustLoginId>
      </CustId>
    </SignonPswd>
    <ClientDt>${now}</ClientDt>
    <CustLangPref>en-US</CustLangPref>
    <ClientApp>
      <Org>ClaimForge</Org>
      <Name>ClaimForge Platform</Name>
      <Version>1.0</Version>
    </ClientApp>
  </SignonRq>
  <ClaimsSvcRq>
    <RqUID>${crypto.randomUUID()}</RqUID>
    <TransactionRequestDt>${now}</TransactionRequestDt>
    <TransactionEffectiveDt>${now}</TransactionEffectiveDt>
    <CurCd>USD</CurCd>
    <ClaimsNotificationAddRq>
      <RqUID>${crypto.randomUUID()}</RqUID>
      <TransactionRequestDt>${now}</TransactionRequestDt>
      <ClaimsParty>
        <ClaimsPartyInfo>
          <ClaimsPartyRoleCd>Insured</ClaimsPartyRoleCd>
        </ClaimsPartyInfo>
        <GeneralPartyInfo>
          <NameInfo>
            <PersonName>
              <GivenName>${escapeXml(claim.claimant.split(' ')[0] ?? '')}</GivenName>
              <Surname>${escapeXml(claim.claimant.split(' ').slice(1).join(' ') || claim.claimant)}</Surname>
            </PersonName>
          </NameInfo>
        </GeneralPartyInfo>
      </ClaimsParty>
      <Policy>
        <PolicyNumber>${escapeXml(claim.policy_number ?? 'UNKNOWN')}</PolicyNumber>
        <LOBCd>${lobCode}</LOBCd>
      </Policy>
      <ClaimsOccurrence>
        <ClaimsOccurrenceRef>${claim.claim_number}</ClaimsOccurrenceRef>
        <CarrierClaimNumber>${carrierClaimNum}</CarrierClaimNumber>
        <LossDt>${claim.incident_date}</LossDt>
        <LossDesc>${escapeXml(claim.description)}</LossDesc>
        <ClaimTypeCd>${claimTypeCode}</ClaimTypeCd>
        ${claim.incident_location ? `<LossAddr><Addr1>${escapeXml(claim.incident_location)}</Addr1></LossAddr>` : ''}
        <ClaimStatusCd>Open</ClaimStatusCd>
        <ClaimsReportInfo>
          <ReportedDt>${claim.created_at}</ReportedDt>
        </ClaimsReportInfo>
      </ClaimsOccurrence>
      <ClaimsPayment>
        <ClaimsPaymentCovInfo>
          <ClaimAmt>
            <Amt>${claim.estimated_amount.toFixed(2)}</Amt>
            <CurCd>USD</CurCd>
          </ClaimAmt>
          ${claim.approved_amount !== null ? `<ApprovedAmt><Amt>${claim.approved_amount.toFixed(2)}</Amt><CurCd>USD</CurCd></ApprovedAmt>` : ''}
        </ClaimsPaymentCovInfo>
      </ClaimsPayment>
      ${claim.witnesses ? `<RemarkText>${escapeXml(claim.witnesses)}</RemarkText>` : ''}
      ${documentAttachments ? `<Attachments>${documentAttachments}\n      </Attachments>` : ''}
    </ClaimsNotificationAddRq>
  </ClaimsSvcRq>
</ACORD>`;
}

// ── Parse ACORD Response ────────────────────────────────────────────────────

export interface AcordResponse {
  success: boolean;
  statusCode: string;
  statusDescription: string;
  carrierClaimNumber: string | null;
  claimStatus: string | null;
  responseDate: string | null;
  errorMessages: string[];
  rawXml: string;
}

function extractTagValue(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match?.[1]?.trim() ?? null;
}

function extractAllTagValues(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'gi');
  const results: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    if (match[1]?.trim()) results.push(match[1].trim());
  }
  return results;
}

export function parseAcordResponse(xml: string): AcordResponse {
  const statusCode = extractTagValue(xml, 'StatusCd') ?? extractTagValue(xml, 'MsgStatusCd') ?? 'UNKNOWN';
  const statusDescription =
    extractTagValue(xml, 'StatusDesc') ??
    extractTagValue(xml, 'MsgStatusDesc') ??
    'No description provided';
  const carrierClaimNumber =
    extractTagValue(xml, 'CarrierClaimNumber') ?? extractTagValue(xml, 'ClaimNumber') ?? null;
  const claimStatus =
    extractTagValue(xml, 'ClaimStatusCd') ?? extractTagValue(xml, 'StatusCd') ?? null;
  const responseDate =
    extractTagValue(xml, 'TransactionResponseDt') ?? extractTagValue(xml, 'ResponseDt') ?? null;
  const errorMessages = extractAllTagValues(xml, 'ErrorMsg').concat(
    extractAllTagValues(xml, 'MsgText'),
  );

  const successCodes = ['0', '200', 'SUCCESS', 'ACCEPTED', 'ACK'];
  const success = successCodes.includes(statusCode.toUpperCase());

  return {
    success,
    statusCode,
    statusDescription,
    carrierClaimNumber,
    claimStatus,
    responseDate,
    errorMessages,
    rawXml: xml,
  };
}

// ── Map carrier status to ClaimForge status ─────────────────────────────────

export type CarrierClaimStatus =
  | 'pending'
  | 'submitted'
  | 'acknowledged'
  | 'under_review'
  | 'approved'
  | 'denied'
  | 'appealed';

export function mapCarrierStatus(carrierStatusCd: string | null): CarrierClaimStatus {
  if (!carrierStatusCd) return 'pending';
  const normalized = carrierStatusCd.toUpperCase().trim();

  const statusMap: Record<string, CarrierClaimStatus> = {
    OPEN: 'submitted',
    RECEIVED: 'acknowledged',
    ACK: 'acknowledged',
    ACKNOWLEDGED: 'acknowledged',
    UNDER_REVIEW: 'under_review',
    INVESTIGATING: 'under_review',
    IN_PROGRESS: 'under_review',
    APPROVED: 'approved',
    PAID: 'approved',
    SETTLED: 'approved',
    DENIED: 'denied',
    REJECTED: 'denied',
    CLOSED_DENIED: 'denied',
    APPEALED: 'appealed',
    REOPENED: 'appealed',
  };

  return statusMap[normalized] ?? 'pending';
}
