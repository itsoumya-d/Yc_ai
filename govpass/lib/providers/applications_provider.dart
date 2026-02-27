import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/application.dart';

final mockApplications = [
  Application(
    id: 'app1',
    serviceId: '1',
    serviceName: 'Passport Renewal',
    status: ApplicationStatus.processing,
    submittedAt: DateTime.now().subtract(const Duration(days: 14)),
    notes: 'Applied for expedited processing',
    documents: ['ds82_form.pdf', 'passport_photo.jpg'],
    statusHistory: [
      StatusUpdate(
        status: ApplicationStatus.submitted,
        date: DateTime.now().subtract(const Duration(days: 14)),
        message: 'Application received',
      ),
      StatusUpdate(
        status: ApplicationStatus.processing,
        date: DateTime.now().subtract(const Duration(days: 10)),
        message: 'Application under review',
      ),
    ],
  ),
  Application(
    id: 'app2',
    serviceId: '6',
    serviceName: 'Voter Registration',
    status: ApplicationStatus.approved,
    submittedAt: DateTime.now().subtract(const Duration(days: 30)),
    notes: 'Registered for upcoming election',
    documents: [],
    statusHistory: [
      StatusUpdate(
        status: ApplicationStatus.submitted,
        date: DateTime.now().subtract(const Duration(days: 30)),
        message: 'Registration form submitted',
      ),
      StatusUpdate(
        status: ApplicationStatus.processing,
        date: DateTime.now().subtract(const Duration(days: 28)),
        message: 'Verifying eligibility',
      ),
      StatusUpdate(
        status: ApplicationStatus.approved,
        date: DateTime.now().subtract(const Duration(days: 25)),
        message: 'Registration confirmed',
      ),
    ],
  ),
];

class ApplicationsNotifier extends StateNotifier<List<Application>> {
  ApplicationsNotifier() : super(mockApplications);

  void addApplication(Application application) {
    state = [...state, application];
  }

  void updateApplicationStatus(String id, ApplicationStatus newStatus, String? message) {
    state = state.map((app) {
      if (app.id == id) {
        final update = StatusUpdate(
          status: newStatus,
          date: DateTime.now(),
          message: message,
        );
        return app.copyWith(
          status: newStatus,
          statusHistory: [...app.statusHistory, update],
        );
      }
      return app;
    }).toList();
  }

  void removeApplication(String id) {
    state = state.where((app) => app.id != id).toList();
  }
}

final applicationsProvider = StateNotifierProvider<ApplicationsNotifier, List<Application>>((ref) {
  return ApplicationsNotifier();
});

final applicationByIdProvider = Provider.family<Application?, String>((ref, id) {
  final apps = ref.watch(applicationsProvider);
  try {
    return apps.firstWhere((a) => a.id == id);
  } catch (_) {
    return null;
  }
});
