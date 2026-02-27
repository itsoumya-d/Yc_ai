import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/claim.dart';

class AiLetterService {
  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.example.com',
  );

  static Future<String> generateDisputeLetter({
    required ClaimType claimType,
    required String company,
    required double amount,
    required String description,
    String? additionalContext,
  }) async {
    // In production, this calls a real AI backend
    // For demo, return a dynamically generated template letter
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/generate-letter'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'claim_type': claimType.name,
          'company': company,
          'amount': amount,
          'description': description,
          'additional_context': additionalContext,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        return data['letter'] as String;
      }
    } catch (e) {
      // Fall through to mock generation
    }

    return _generateMockLetter(
      claimType: claimType,
      company: company,
      amount: amount,
      description: description,
    );
  }

  static String _generateMockLetter({
    required ClaimType claimType,
    required String company,
    required double amount,
    required String description,
  }) {
    final date = DateTime.now();
    final formattedDate = '${date.month}/${date.day}/${date.year}';

    final openingByType = switch (claimType) {
      ClaimType.chargeback =>
        'I am formally disputing an unauthorized charge on my account',
      ClaimType.refund =>
        'I am requesting a full refund for a recent purchase',
      ClaimType.billingError =>
        'I am writing to dispute an error on my recent bill',
      ClaimType.insurance =>
        'I am formally appealing a recent insurance claim decision',
      ClaimType.serviceFailed =>
        'I am requesting compensation for services that were not delivered as promised',
      ClaimType.subscriptionCancel =>
        'I am requesting the immediate cancellation of my subscription and a full refund',
    };

    final actionByType = switch (claimType) {
      ClaimType.chargeback =>
        'I request an immediate investigation and reversal of this unauthorized charge.',
      ClaimType.refund =>
        'I request a full refund of \$${amount.toStringAsFixed(2)} within 7 business days.',
      ClaimType.billingError =>
        'I request an immediate correction of this billing error and a credit to my account.',
      ClaimType.insurance =>
        'I request a full review of my claim and a written response within 30 days.',
      ClaimType.serviceFailed =>
        'I request a full refund of \$${amount.toStringAsFixed(2)} or equivalent credit.',
      ClaimType.subscriptionCancel =>
        'I request immediate cancellation and a full refund of \$${amount.toStringAsFixed(2)}.',
    };

    return '''$formattedDate

To Whom It May Concern,
$company Customer Service Department

Re: ${ claimType.label} — Amount: \$${amount.toStringAsFixed(2)}

Dear $company Customer Service Team,

$openingByType with $company in the amount of \$${amount.toStringAsFixed(2)}.

Issue Description:
$description

This matter requires your immediate attention as it directly impacts my account and represents a significant financial concern. I have documented this issue and am prepared to escalate this matter if it is not resolved in a timely manner.

I request that you:
1. Acknowledge receipt of this dispute within 3 business days
2. $actionByType
3. Provide me with a confirmation number and the name of the representative handling this case
4. Send written confirmation of the resolution to my email address on file

Please note that I am aware of my rights under applicable consumer protection laws, including the Fair Credit Billing Act where applicable. If this matter is not resolved satisfactorily within 10 business days, I will escalate to the appropriate regulatory agency and pursue all available legal remedies.

I appreciate your prompt attention to this matter and look forward to a swift and satisfactory resolution.

Sincerely,
[Your Name]
[Your Address]
[Your Phone Number]
[Your Email Address]
[Account/Order Number]''';
  }
}
