import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/service.dart';

final mockServices = [
  GovernmentService(
    id: '1',
    name: 'Passport Renewal',
    category: 'passports',
    description: 'Renew your US passport for domestic and international travel. Available for adults with passports issued at age 16 or older.',
    requirements: [
      'Current US passport (must not be expired more than 5 years)',
      'Completed DS-82 form',
      'One passport photo (2x2 inches)',
      'Applicable fees',
    ],
    processingTime: '6-8 weeks (routine), 2-3 weeks (expedited)',
    fee: 130.0,
    formUrl: 'https://travel.state.gov/content/travel/en/passports/need-passport/under-16.html',
    steps: [
      ServiceStep(order: 1, title: 'Complete Form DS-82', description: 'Fill out the passport renewal application form online or by hand.'),
      ServiceStep(order: 2, title: 'Get passport photo', description: 'Take a recent 2x2 inch color photo against a white background.'),
      ServiceStep(order: 3, title: 'Prepare your current passport', description: 'Include your most recent passport — it will be returned to you.'),
      ServiceStep(order: 4, title: 'Pay fees', description: 'Pay the \$130 application fee plus any additional fees for expedited service.'),
      ServiceStep(order: 5, title: 'Mail your application', description: 'Send all materials to the address listed on the DS-82 form.'),
    ],
  ),
  GovernmentService(
    id: '2',
    name: 'Driver License Renewal',
    category: 'licenses',
    description: 'Renew your state driver license before it expires. Requirements vary by state. This guide covers general requirements.',
    requirements: [
      'Current driver license',
      'Proof of identity (birth certificate or passport)',
      'Proof of residence (utility bill or bank statement)',
      'Social Security number',
      'Payment for renewal fee',
    ],
    processingTime: '2-4 weeks by mail, same day in person',
    fee: 30.0,
    formUrl: 'https://www.dmv.org/renew-license.php',
    steps: [
      ServiceStep(order: 1, title: 'Check eligibility', description: 'Confirm you can renew online, by mail, or must visit the DMV in person.'),
      ServiceStep(order: 2, title: 'Gather documents', description: 'Collect your current license and any required identity documents.'),
      ServiceStep(order: 3, title: 'Complete vision test', description: 'Some renewals require a vision screening, especially if license is expired.'),
      ServiceStep(order: 4, title: 'Pay renewal fee', description: 'Pay the renewal fee online, by mail, or at the DMV.'),
      ServiceStep(order: 5, title: 'Receive new license', description: 'Get a temporary license to use while your permanent one is mailed.'),
    ],
  ),
  GovernmentService(
    id: '3',
    name: 'Business License',
    category: 'permits',
    description: 'Obtain a general business license to legally operate a business in your city or county.',
    requirements: [
      'Business name and structure (LLC, Sole Proprietor, etc.)',
      'Federal EIN number',
      'Business address',
      'Description of business activities',
      'Owner identification',
    ],
    processingTime: '1-4 weeks',
    fee: 75.0,
    formUrl: 'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    steps: [
      ServiceStep(order: 1, title: 'Register your business name', description: 'File a DBA (Doing Business As) if operating under a trade name.'),
      ServiceStep(order: 2, title: 'Obtain Federal EIN', description: 'Apply for an Employer Identification Number from the IRS (free).'),
      ServiceStep(order: 3, title: 'Complete application', description: 'Fill out the local business license application for your city/county.'),
      ServiceStep(order: 4, title: 'Pay license fee', description: 'Fees vary by location and business type, typically \$50-\$200.'),
      ServiceStep(order: 5, title: 'Display your license', description: 'Post your business license in a visible location at your place of business.'),
    ],
  ),
  GovernmentService(
    id: '4',
    name: 'SNAP Benefits (Food Stamps)',
    category: 'benefits',
    description: 'Apply for the Supplemental Nutrition Assistance Program to help purchase food for your household.',
    requirements: [
      'Proof of identity (driver license, passport)',
      'Proof of residence',
      'Proof of income (pay stubs, tax returns)',
      'Social Security numbers for all household members',
      'Bank account information',
    ],
    processingTime: '30 days (7 days if expedited)',
    fee: 0.0,
    formUrl: 'https://www.fns.usda.gov/snap/apply',
    steps: [
      ServiceStep(order: 1, title: 'Check eligibility', description: 'Review income and resource limits for your household size.'),
      ServiceStep(order: 2, title: 'Complete application', description: 'Apply online, by mail, or in person at your local SNAP office.'),
      ServiceStep(order: 3, title: 'Attend interview', description: 'Complete a required eligibility interview, usually by phone.'),
      ServiceStep(order: 4, title: 'Provide verification', description: 'Submit requested documents to verify your eligibility.'),
      ServiceStep(order: 5, title: 'Receive EBT card', description: 'If approved, receive an Electronic Benefits Transfer card to use at grocery stores.'),
    ],
  ),
  GovernmentService(
    id: '5',
    name: 'Income Tax Filing',
    category: 'taxes',
    description: 'File your annual federal and state income tax returns. Free filing available for qualifying individuals.',
    requirements: [
      'W-2 or 1099 forms from employers',
      'Social Security number',
      'Bank account for direct deposit',
      'Previous year tax return (for reference)',
      'Deduction records if itemizing',
    ],
    processingTime: 'Refund in 21 days (electronic), 6 weeks (paper)',
    fee: 0.0,
    formUrl: 'https://www.irs.gov/filing',
    steps: [
      ServiceStep(order: 1, title: 'Gather tax documents', description: 'Collect all W-2s, 1099s, and other income and deduction records.'),
      ServiceStep(order: 2, title: 'Choose filing method', description: 'Use IRS Free File, tax software, or a tax professional.'),
      ServiceStep(order: 3, title: 'Complete your return', description: 'Enter your income, deductions, and credits accurately.'),
      ServiceStep(order: 4, title: 'Review and submit', description: 'Double-check your return, then e-file or mail to the IRS.'),
      ServiceStep(order: 5, title: 'Track your refund', description: 'Use "Where\'s My Refund?" on the IRS website to track your refund status.'),
    ],
  ),
  GovernmentService(
    id: '6',
    name: 'Voter Registration',
    category: 'voting',
    description: 'Register to vote in federal, state, and local elections. Deadlines vary by state.',
    requirements: [
      'US citizenship',
      'State residency',
      'Age 18 by Election Day',
      'Driver license or state ID number, or last 4 digits of SSN',
      'Current address',
    ],
    processingTime: '1-2 weeks to process',
    fee: 0.0,
    formUrl: 'https://www.vote.gov/register/',
    steps: [
      ServiceStep(order: 1, title: 'Check your state deadline', description: 'Registration deadlines vary by state — some allow same-day registration.'),
      ServiceStep(order: 2, title: 'Choose registration method', description: 'Register online, by mail, or in person at your local election office or DMV.'),
      ServiceStep(order: 3, title: 'Complete the form', description: 'Provide your name, address, date of birth, and ID information.'),
      ServiceStep(order: 4, title: 'Verify registration', description: 'Confirm your registration is processed on your state\'s voter portal.'),
    ],
  ),
];

final searchQueryProvider = StateProvider<String>((ref) => '');
final selectedCategoryProvider = StateProvider<String?>((ref) => null);

final servicesProvider = Provider<List<GovernmentService>>((ref) {
  return mockServices;
});

final filteredServicesProvider = Provider<List<GovernmentService>>((ref) {
  final services = ref.watch(servicesProvider);
  final query = ref.watch(searchQueryProvider).toLowerCase();
  final category = ref.watch(selectedCategoryProvider);

  return services.where((service) {
    final matchesCategory = category == null || service.category == category;
    final matchesQuery = query.isEmpty ||
        service.name.toLowerCase().contains(query) ||
        service.description.toLowerCase().contains(query) ||
        service.category.toLowerCase().contains(query);
    return matchesCategory && matchesQuery;
  }).toList();
});

final serviceByIdProvider = Provider.family<GovernmentService?, String>((ref, id) {
  final services = ref.watch(servicesProvider);
  try {
    return services.firstWhere((s) => s.id == id);
  } catch (_) {
    return null;
  }
});
