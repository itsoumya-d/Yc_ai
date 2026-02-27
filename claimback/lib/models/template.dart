enum TemplateCategory {
  airline,
  hotel,
  creditCard,
  insurance,
  subscription,
  ecommerce,
  telecom,
  general,
}

extension TemplateCategoryExtension on TemplateCategory {
  String get label {
    switch (this) {
      case TemplateCategory.airline:
        return 'Airlines';
      case TemplateCategory.hotel:
        return 'Hotels';
      case TemplateCategory.creditCard:
        return 'Credit Cards';
      case TemplateCategory.insurance:
        return 'Insurance';
      case TemplateCategory.subscription:
        return 'Subscriptions';
      case TemplateCategory.ecommerce:
        return 'E-Commerce';
      case TemplateCategory.telecom:
        return 'Telecom';
      case TemplateCategory.general:
        return 'General';
    }
  }
}

class DisputeTemplate {
  final String id;
  final String name;
  final String type;
  final TemplateCategory companyCategory;
  final String templateText;
  final double successRate;
  final List<String> customizationFields;

  const DisputeTemplate({
    required this.id,
    required this.name,
    required this.type,
    required this.companyCategory,
    required this.templateText,
    required this.successRate,
    this.customizationFields = const [],
  });
}

final mockTemplates = [
  DisputeTemplate(
    id: 't1',
    name: 'Flight Cancellation Refund',
    type: 'refund',
    companyCategory: TemplateCategory.airline,
    successRate: 0.82,
    customizationFields: ['airline_name', 'flight_number', 'date', 'amount'],
    templateText: '''Dear [Airline Name] Customer Relations,

I am writing to request a full refund for Flight [Flight Number] on [Date], which was cancelled by your airline.

Under the Department of Transportation regulations, I am entitled to a full refund when an airline cancels a flight, regardless of the reason. I purchased this ticket on [Purchase Date] for \$[Amount].

I request a full refund of \$[Amount] to my original payment method within 7 business days, as required by law.

Please confirm receipt of this request and provide a refund confirmation number.

Sincerely,
[Your Name]
[Your Contact Information]''',
  ),
  DisputeTemplate(
    id: 't2',
    name: 'Hotel No-Show / Billing Dispute',
    type: 'billingError',
    companyCategory: TemplateCategory.hotel,
    successRate: 0.71,
    customizationFields: ['hotel_name', 'dates', 'reservation_number', 'amount'],
    templateText: '''Dear [Hotel Name] Billing Department,

I am disputing a charge of \$[Amount] on my account for reservation [Reservation Number], which does not reflect the agreed-upon rate.

I reserved a room from [Check-in Date] to [Check-out Date] at a confirmed rate of \$[Agreed Rate] per night. However, I was charged \$[Charged Amount], which is \$[Difference] more than agreed.

I request an immediate correction of this billing error and confirmation within 5 business days.

Sincerely,
[Your Name]''',
  ),
  DisputeTemplate(
    id: 't3',
    name: 'Unauthorized Credit Card Charge',
    type: 'chargeback',
    companyCategory: TemplateCategory.creditCard,
    successRate: 0.88,
    customizationFields: ['card_issuer', 'merchant', 'amount', 'date'],
    templateText: '''Dear [Card Issuer] Disputes Department,

I am formally disputing a charge of \$[Amount] from [Merchant Name] that appeared on my statement dated [Date]. I did not authorize this transaction and do not recognize this charge.

Pursuant to the Fair Credit Billing Act (FCBA), I request:
1. Immediate provisional credit for the disputed amount
2. An investigation into this unauthorized charge
3. Written confirmation of the dispute receipt

The charge details are:
- Merchant: [Merchant Name]
- Amount: \$[Amount]
- Date: [Date]
- Last 4 digits of card: [XXXX]

Please investigate and remove this unauthorized charge.

Sincerely,
[Your Name]''',
  ),
  DisputeTemplate(
    id: 't4',
    name: 'Insurance Claim Denial Appeal',
    type: 'insurance',
    companyCategory: TemplateCategory.insurance,
    successRate: 0.65,
    customizationFields: ['insurance_company', 'policy_number', 'claim_number', 'amount'],
    templateText: '''Dear [Insurance Company] Appeals Department,

I am formally appealing the denial of claim number [Claim Number] under policy [Policy Number] for \$[Amount].

The claim was denied on [Denial Date]. I believe this denial was incorrect for the following reasons:

[Describe why the denial is wrong — e.g., the service is covered under Section X of my policy, my doctor confirmed medical necessity, etc.]

I am attaching the following supporting documentation:
- Copy of my policy
- Medical records / invoices
- Denial letter

I request a full review of this claim and ask for a written response within 30 days.

Sincerely,
[Your Name]''',
  ),
  DisputeTemplate(
    id: 't5',
    name: 'Subscription Cancellation & Refund',
    type: 'refund',
    companyCategory: TemplateCategory.subscription,
    successRate: 0.77,
    customizationFields: ['company_name', 'subscription_type', 'amount', 'date'],
    templateText: '''Dear [Company Name] Customer Service,

I am requesting the immediate cancellation of my [Subscription Name] subscription and a refund of \$[Amount] for the most recent billing period.

I attempted to cancel my subscription on [Date] but was billed on [Billing Date] without authorization. This charge should not have occurred as I had requested cancellation prior to the billing date.

Please:
1. Confirm my subscription is cancelled effective immediately
2. Refund \$[Amount] to my original payment method
3. Send written confirmation of cancellation

I expect this to be resolved within 5 business days.

Sincerely,
[Your Name]''',
  ),
];
