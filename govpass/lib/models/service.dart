class GovernmentService {
  final String id;
  final String name;
  final String category;
  final String description;
  final List<String> requirements;
  final String processingTime;
  final double fee;
  final String? formUrl;
  final List<ServiceStep> steps;

  const GovernmentService({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.requirements,
    required this.processingTime,
    required this.fee,
    this.formUrl,
    required this.steps,
  });

  factory GovernmentService.fromJson(Map<String, dynamic> json) {
    return GovernmentService(
      id: json['id'] as String,
      name: json['name'] as String,
      category: json['category'] as String,
      description: json['description'] as String,
      requirements: List<String>.from(json['requirements'] as List),
      processingTime: json['processing_time'] as String,
      fee: (json['fee'] as num).toDouble(),
      formUrl: json['form_url'] as String?,
      steps: (json['steps'] as List)
          .map((s) => ServiceStep.fromJson(s as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'description': description,
      'requirements': requirements,
      'processing_time': processingTime,
      'fee': fee,
      'form_url': formUrl,
      'steps': steps.map((s) => s.toJson()).toList(),
    };
  }
}

class ServiceStep {
  final int order;
  final String title;
  final String description;

  const ServiceStep({
    required this.order,
    required this.title,
    required this.description,
  });

  factory ServiceStep.fromJson(Map<String, dynamic> json) {
    return ServiceStep(
      order: json['order'] as int,
      title: json['title'] as String,
      description: json['description'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'order': order,
      'title': title,
      'description': description,
    };
  }
}
