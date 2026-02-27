import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/will_item.dart';
import '../models/directive.dart';
import '../models/digital_asset.dart';
import '../models/contact.dart';

class PlanningState {
  final List<WillItem> willItems;
  final List<AdvanceDirective> directives;
  final List<DigitalAsset> digitalAssets;
  final List<ImportantContact> contacts;
  final Map<String, dynamic> funeralPreferences;
  final List<String> vaultDocuments;

  const PlanningState({
    this.willItems = const [],
    this.directives = const [],
    this.digitalAssets = const [],
    this.contacts = const [],
    this.funeralPreferences = const {},
    this.vaultDocuments = const [],
  });

  double get completionPercentage {
    int total = 0;
    int completed = 0;

    total += 1; if (willItems.isNotEmpty) completed += 1;
    total += 1; if (directives.isNotEmpty) completed += 1;
    total += 1; if (digitalAssets.isNotEmpty) completed += 1;
    total += 1; if (contacts.isNotEmpty) completed += 1;
    total += 1; if (funeralPreferences.isNotEmpty) completed += 1;
    total += 1; if (vaultDocuments.isNotEmpty) completed += 1;

    return total > 0 ? (completed / total) * 100 : 0;
  }

  PlanningState copyWith({
    List<WillItem>? willItems,
    List<AdvanceDirective>? directives,
    List<DigitalAsset>? digitalAssets,
    List<ImportantContact>? contacts,
    Map<String, dynamic>? funeralPreferences,
    List<String>? vaultDocuments,
  }) {
    return PlanningState(
      willItems: willItems ?? this.willItems,
      directives: directives ?? this.directives,
      digitalAssets: digitalAssets ?? this.digitalAssets,
      contacts: contacts ?? this.contacts,
      funeralPreferences: funeralPreferences ?? this.funeralPreferences,
      vaultDocuments: vaultDocuments ?? this.vaultDocuments,
    );
  }
}

class PlanningNotifier extends StateNotifier<PlanningState> {
  PlanningNotifier() : super(_mockInitialState());

  static PlanningState _mockInitialState() {
    return PlanningState(
      willItems: [
        WillItem(
          id: 'w1',
          type: WillItemType.property,
          description: 'Primary residence at 123 Oak Street',
          beneficiary: 'Sarah Johnson (spouse)',
          estimatedValue: 450000,
        ),
        WillItem(
          id: 'w2',
          type: WillItemType.financial,
          description: 'Retirement account (401k) at Fidelity',
          beneficiary: 'Sarah Johnson (spouse)',
          estimatedValue: 120000,
        ),
        WillItem(
          id: 'w3',
          type: WillItemType.pets,
          description: 'Golden retriever "Buddy"',
          beneficiary: 'Michael Johnson (brother)',
          estimatedValue: null,
        ),
      ],
      directives: [
        AdvanceDirective(
          id: 'd1',
          type: DirectiveType.healthcareProxy,
          content: 'Sarah Johnson is designated as my healthcare proxy with full authority to make medical decisions on my behalf.',
          signed: true,
          attorneyName: 'Robert Lee, Esq.',
          signedDate: DateTime(2023, 6, 15),
        ),
      ],
      digitalAssets: [
        DigitalAsset(
          id: 'da1',
          platform: 'Gmail',
          username: 'johndoe@gmail.com',
          passwordHint: 'Hint in password manager under "Google"',
          instructions: 'Please download any important emails and then close or memorialize the account.',
          category: DigitalAssetCategory.email,
        ),
        DigitalAsset(
          id: 'da2',
          platform: 'Coinbase',
          username: 'johndoe@gmail.com',
          passwordHint: 'Hardware wallet in safe deposit box',
          instructions: 'Contact Coinbase support with death certificate. Seed phrase is in the fireproof safe.',
          category: DigitalAssetCategory.crypto,
          hasMonetaryValue: true,
        ),
      ],
      contacts: [
        ImportantContact(
          id: 'c1',
          name: 'Robert Lee',
          role: ContactRole.attorney,
          phone: '(555) 234-5678',
          email: 'rlee@leelaw.com',
          notes: 'Has original copy of will',
        ),
        ImportantContact(
          id: 'c2',
          name: 'Sarah Johnson',
          role: ContactRole.executor,
          phone: '(555) 345-6789',
          email: 'sarah.j@email.com',
          relationship: 'Spouse',
        ),
      ],
      funeralPreferences: {
        'type': 'cremation',
        'ceremony': 'small private service',
        'readings': 'Psalm 23',
        'music': '"What a Wonderful World" by Louis Armstrong',
        'venue': 'Riverside Chapel',
        'reception': true,
      },
      vaultDocuments: ['birth_certificate.pdf', 'passport_scan.pdf', 'insurance_policy.pdf'],
    );
  }

  void addWillItem(WillItem item) {
    state = state.copyWith(willItems: [...state.willItems, item]);
  }

  void removeWillItem(String id) {
    state = state.copyWith(
      willItems: state.willItems.where((i) => i.id != id).toList(),
    );
  }

  void updateWillItem(WillItem updated) {
    state = state.copyWith(
      willItems: state.willItems.map((i) => i.id == updated.id ? updated : i).toList(),
    );
  }

  void addDirective(AdvanceDirective directive) {
    state = state.copyWith(directives: [...state.directives, directive]);
  }

  void removeDirective(String id) {
    state = state.copyWith(
      directives: state.directives.where((d) => d.id != id).toList(),
    );
  }

  void addDigitalAsset(DigitalAsset asset) {
    state = state.copyWith(digitalAssets: [...state.digitalAssets, asset]);
  }

  void removeDigitalAsset(String id) {
    state = state.copyWith(
      digitalAssets: state.digitalAssets.where((a) => a.id != id).toList(),
    );
  }

  void addContact(ImportantContact contact) {
    state = state.copyWith(contacts: [...state.contacts, contact]);
  }

  void removeContact(String id) {
    state = state.copyWith(
      contacts: state.contacts.where((c) => c.id != id).toList(),
    );
  }

  void updateFuneralPreferences(Map<String, dynamic> preferences) {
    state = state.copyWith(funeralPreferences: preferences);
  }

  void addVaultDocument(String name) {
    state = state.copyWith(vaultDocuments: [...state.vaultDocuments, name]);
  }

  void removeVaultDocument(String name) {
    state = state.copyWith(
      vaultDocuments: state.vaultDocuments.where((d) => d != name).toList(),
    );
  }
}

final planningProvider = StateNotifierProvider<PlanningNotifier, PlanningState>((ref) {
  return PlanningNotifier();
});
