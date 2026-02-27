import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/claim.dart';

final _mockClaims = [
  Claim(
    id: 'c1',
    type: ClaimType.chargeback,
    company: 'Netflix',
    amount: 49.98,
    description: 'Charged twice for the same month. First charge on Jan 1st and again on Jan 3rd.',
    status: ClaimStatus.won,
    evidenceUrls: ['bank_statement.pdf', 'screenshot.png'],
    createdAt: DateTime.now().subtract(const Duration(days: 45)),
    resolution: 'Bank sided with consumer. Full refund of \$49.98 credited.',
    generatedLetter: 'Dear Netflix, I am disputing a duplicate charge...',
    recoveredAmount: 49.98,
  ),
  Claim(
    id: 'c2',
    type: ClaimType.refund,
    company: 'Amazon',
    amount: 89.99,
    description: 'Received damaged item. Seller refused to issue refund despite photos of damage.',
    status: ClaimStatus.pending,
    evidenceUrls: ['damage_photo_1.jpg', 'damage_photo_2.jpg', 'chat_screenshot.png'],
    createdAt: DateTime.now().subtract(const Duration(days: 12)),
    generatedLetter: 'Dear Amazon Customer Service, I am requesting a refund...',
  ),
  Claim(
    id: 'c3',
    type: ClaimType.billingError,
    company: 'Verizon',
    amount: 145.00,
    description: 'Billed for international roaming I never activated. I was in the US the entire month.',
    status: ClaimStatus.filed,
    evidenceUrls: ['bill_screenshot.pdf'],
    createdAt: DateTime.now().subtract(const Duration(days: 7)),
    generatedLetter: 'Dear Verizon Billing Department, I am disputing an erroneous charge...',
  ),
];

class ClaimsNotifier extends StateNotifier<List<Claim>> {
  ClaimsNotifier() : super(_mockClaims);

  void addClaim(Claim claim) {
    state = [claim, ...state];
  }

  void updateClaim(Claim updated) {
    state = state.map((c) => c.id == updated.id ? updated : c).toList();
  }

  void updateClaimStatus(String id, ClaimStatus status, {String? resolution, double? recoveredAmount}) {
    state = state.map((c) {
      if (c.id == id) {
        return c.copyWith(
          status: status,
          resolution: resolution,
          recoveredAmount: recoveredAmount,
        );
      }
      return c;
    }).toList();
  }

  void deleteClaim(String id) {
    state = state.where((c) => c.id != id).toList();
  }

  void updateGeneratedLetter(String id, String letter) {
    state = state.map((c) {
      if (c.id == id) return c.copyWith(generatedLetter: letter);
      return c;
    }).toList();
  }
}

final claimsProvider = StateNotifierProvider<ClaimsNotifier, List<Claim>>((ref) {
  return ClaimsNotifier();
});

final claimByIdProvider = Provider.family<Claim?, String>((ref, id) {
  final claims = ref.watch(claimsProvider);
  try {
    return claims.firstWhere((c) => c.id == id);
  } catch (_) {
    return null;
  }
});

final claimStatsProvider = Provider<Map<String, dynamic>>((ref) {
  final claims = ref.watch(claimsProvider);

  final totalClaimed = claims.fold<double>(0, (sum, c) => sum + c.amount);
  final recovered = claims
      .where((c) => c.recoveredAmount != null)
      .fold<double>(0, (sum, c) => sum + c.recoveredAmount!);
  final won = claims.where((c) => c.status == ClaimStatus.won).length;
  final total = claims.where((c) => c.status != ClaimStatus.draft).length;

  return {
    'totalClaimed': totalClaimed,
    'recovered': recovered,
    'successRate': total > 0 ? (won / total) * 100 : 0.0,
    'activeClaims': claims.where((c) => c.status == ClaimStatus.pending || c.status == ClaimStatus.filed).length,
    'wonClaims': won,
  };
});

final claimsFilterProvider = StateProvider<ClaimStatus?>((ref) => null);

final filteredClaimsProvider = Provider<List<Claim>>((ref) {
  final claims = ref.watch(claimsProvider);
  final filter = ref.watch(claimsFilterProvider);

  if (filter == null) return claims;
  return claims.where((c) => c.status == filter).toList();
});
