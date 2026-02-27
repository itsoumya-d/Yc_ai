import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/claim.dart';
import '../../providers/claims_provider.dart';
import '../../services/ai_letter_service.dart';
import '../../theme/app_theme.dart';

class NewClaimScreen extends ConsumerStatefulWidget {
  const NewClaimScreen({super.key});

  @override
  ConsumerState<NewClaimScreen> createState() => _NewClaimScreenState();
}

class _NewClaimScreenState extends ConsumerState<NewClaimScreen> {
  final _pageController = PageController();
  int _currentStep = 0;

  ClaimType? _selectedType;
  final _companyController = TextEditingController();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();

  bool _isGeneratingLetter = false;
  String? _generatedLetter;

  @override
  void dispose() {
    _pageController.dispose();
    _companyController.dispose();
    _amountController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _generateLetter() async {
    if (_selectedType == null ||
        _companyController.text.isEmpty ||
        _amountController.text.isEmpty ||
        _descriptionController.text.isEmpty) {
      return;
    }

    setState(() => _isGeneratingLetter = true);

    try {
      final letter = await AiLetterService.generateDisputeLetter(
        claimType: _selectedType!,
        company: _companyController.text,
        amount: double.tryParse(_amountController.text) ?? 0,
        description: _descriptionController.text,
      );
      setState(() {
        _generatedLetter = letter;
        _isGeneratingLetter = false;
      });
      _goToStep(3);
    } catch (e) {
      setState(() => _isGeneratingLetter = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to generate letter. Please try again.')),
        );
      }
    }
  }

  void _goToStep(int step) {
    setState(() => _currentStep = step);
    _pageController.animateToPage(
      step,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  void _submitClaim() {
    final claim = Claim(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      type: _selectedType!,
      company: _companyController.text,
      amount: double.tryParse(_amountController.text) ?? 0,
      description: _descriptionController.text,
      status: ClaimStatus.filed,
      evidenceUrls: [],
      createdAt: DateTime.now(),
      generatedLetter: _generatedLetter,
    );

    ref.read(claimsProvider.notifier).addClaim(claim);
    context.go('/claims/${claim.id}');
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Claim filed successfully!'),
        backgroundColor: AppTheme.successGreen,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('New Claim'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.go('/dashboard'),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(
            value: (_currentStep + 1) / 4,
            backgroundColor: Colors.white.withOpacity(0.3),
            valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
          ),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: List.generate(4, (index) {
                return Expanded(
                  child: Row(
                    children: [
                      _StepIndicator(
                        step: index + 1,
                        isActive: _currentStep == index,
                        isCompleted: _currentStep > index,
                        label: ['Type', 'Details', 'Review', 'Letter'][index],
                      ),
                      if (index < 3)
                        Expanded(
                          child: Container(
                            height: 2,
                            color: _currentStep > index
                                ? AppTheme.primaryOrange
                                : const Color(0xFFE2E8F0),
                          ),
                        ),
                    ],
                  ),
                );
              }),
            ),
          ),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _Step1TypeSelection(
                  selected: _selectedType,
                  onSelect: (type) {
                    setState(() => _selectedType = type);
                    _goToStep(1);
                  },
                ),
                _Step2Details(
                  companyController: _companyController,
                  amountController: _amountController,
                  descriptionController: _descriptionController,
                  claimType: _selectedType,
                  onBack: () => _goToStep(0),
                  onNext: () => _goToStep(2),
                ),
                _Step3Review(
                  type: _selectedType,
                  company: _companyController.text,
                  amount: _amountController.text,
                  description: _descriptionController.text,
                  isLoading: _isGeneratingLetter,
                  onBack: () => _goToStep(1),
                  onGenerateLetter: _generateLetter,
                ),
                _Step4Letter(
                  letter: _generatedLetter ?? '',
                  onBack: () => _goToStep(2),
                  onSubmit: _submitClaim,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StepIndicator extends StatelessWidget {
  final int step;
  final bool isActive;
  final bool isCompleted;
  final String label;

  const _StepIndicator({
    required this.step,
    required this.isActive,
    required this.isCompleted,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: isCompleted
                ? AppTheme.primaryOrange
                : isActive
                    ? AppTheme.primaryOrange
                    : Colors.white,
            shape: BoxShape.circle,
            border: Border.all(
              color: isCompleted || isActive
                  ? AppTheme.primaryOrange
                  : const Color(0xFFE2E8F0),
              width: 2,
            ),
          ),
          child: Center(
            child: isCompleted
                ? const Icon(Icons.check, size: 14, color: Colors.white)
                : Text(
                    '$step',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isActive ? Colors.white : const Color(0xFF94A3B8),
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: isActive ? AppTheme.primaryOrange : const Color(0xFF94A3B8),
          ),
        ),
      ],
    );
  }
}

class _Step1TypeSelection extends StatelessWidget {
  final ClaimType? selected;
  final ValueChanged<ClaimType> onSelect;

  const _Step1TypeSelection({required this.selected, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'What type of claim is this?',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          const Text(
            'Select the category that best describes your dispute',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
          ),
          const SizedBox(height: 20),
          ...ClaimType.values.map((type) {
            final isSelected = selected == type;
            return GestureDetector(
              onTap: () => onSelect(type),
              child: Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isSelected ? AppTheme.primaryOrange.withOpacity(0.08) : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? AppTheme.primaryOrange : const Color(0xFFE2E8F0),
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.arrow_forward_ios,
                      size: 16,
                      color: isSelected ? AppTheme.primaryOrange : const Color(0xFFCBD5E1),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            type.label,
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: isSelected ? AppTheme.primaryOrange : const Color(0xFF1E293B),
                            ),
                          ),
                          Text(
                            type.description,
                            style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _Step2Details extends StatelessWidget {
  final TextEditingController companyController;
  final TextEditingController amountController;
  final TextEditingController descriptionController;
  final ClaimType? claimType;
  final VoidCallback onBack;
  final VoidCallback onNext;

  const _Step2Details({
    required this.companyController,
    required this.amountController,
    required this.descriptionController,
    required this.claimType,
    required this.onBack,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Tell us about your ${claimType?.label ?? 'claim'}',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          TextField(
            controller: companyController,
            decoration: const InputDecoration(
              labelText: 'Company / Merchant Name',
              prefixIcon: Icon(Icons.business_outlined),
              hintText: 'e.g., Netflix, Amazon, Verizon',
            ),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Amount in Dispute',
              prefixIcon: Icon(Icons.attach_money),
              hintText: '0.00',
            ),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: descriptionController,
            maxLines: 5,
            decoration: const InputDecoration(
              labelText: 'Describe the Issue',
              hintText: 'Explain what happened in detail. Include dates, order numbers, and any communication with the company...',
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onBack,
                  child: const Text('Back'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    if (companyController.text.isEmpty || amountController.text.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please fill in all required fields')),
                      );
                      return;
                    }
                    onNext();
                  },
                  child: const Text('Review'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Step3Review extends StatelessWidget {
  final ClaimType? type;
  final String company;
  final String amount;
  final String description;
  final bool isLoading;
  final VoidCallback onBack;
  final VoidCallback onGenerateLetter;

  const _Step3Review({
    required this.type,
    required this.company,
    required this.amount,
    required this.description,
    required this.isLoading,
    required this.onBack,
    required this.onGenerateLetter,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Review Your Claim',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          const Text(
            'Confirm the details below, then we\'ll generate your dispute letter',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
          ),
          const SizedBox(height: 20),
          _ReviewRow(label: 'Claim Type', value: type?.label ?? ''),
          _ReviewRow(label: 'Company', value: company),
          _ReviewRow(label: 'Amount', value: '\$$amount'),
          const SizedBox(height: 8),
          const Text(
            'Issue Description',
            style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 4),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              description,
              style: const TextStyle(fontSize: 13, height: 1.5),
            ),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF7ED),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.primaryOrange.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.auto_awesome, color: AppTheme.primaryOrange, size: 20),
                const SizedBox(width: 10),
                const Expanded(
                  child: Text(
                    'Our AI will generate a professional dispute letter based on your details',
                    style: TextStyle(fontSize: 13, color: AppTheme.darkOrange, height: 1.4),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onBack,
                  child: const Text('Back'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: isLoading ? null : onGenerateLetter,
                  icon: isLoading
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.auto_awesome),
                  label: Text(isLoading ? 'Generating...' : 'Generate Letter'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ReviewRow extends StatelessWidget {
  final String label;
  final String value;

  const _ReviewRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class _Step4Letter extends StatelessWidget {
  final String letter;
  final VoidCallback onBack;
  final VoidCallback onSubmit;

  const _Step4Letter({
    required this.letter,
    required this.onBack,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Your Dispute Letter',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      'AI-generated letter ready to send',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.successGreen.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.auto_awesome, size: 13, color: AppTheme.successGreen),
                    const SizedBox(width: 4),
                    const Text(
                      'AI Generated',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppTheme.successGreen,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: SelectableText(
                letter,
                style: const TextStyle(
                  fontSize: 13,
                  height: 1.6,
                  fontFamily: 'monospace',
                ),
              ),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onBack,
                  child: const Text('Back'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onSubmit,
                  icon: const Icon(Icons.send),
                  label: const Text('File Claim'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
