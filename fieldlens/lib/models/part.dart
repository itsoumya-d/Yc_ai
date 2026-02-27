class Part {
  final String id;
  final String name;
  final String partNumber;
  final String description;
  final List<String> suppliers;
  final double? estimatedCost;
  final String? trade;
  final List<String> compatibleWith;

  const Part({
    required this.id,
    required this.name,
    required this.partNumber,
    required this.description,
    required this.suppliers,
    this.estimatedCost,
    this.trade,
    this.compatibleWith = const [],
  });

  factory Part.fromJson(Map<String, dynamic> json) {
    return Part(
      id: json['id'] as String,
      name: json['name'] as String,
      partNumber: json['part_number'] as String,
      description: json['description'] as String,
      suppliers: List<String>.from(json['suppliers'] as List? ?? []),
      estimatedCost: (json['estimated_cost'] as num?)?.toDouble(),
      trade: json['trade'] as String?,
      compatibleWith: List<String>.from(json['compatible_with'] as List? ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'part_number': partNumber,
      'description': description,
      'suppliers': suppliers,
      'estimated_cost': estimatedCost,
      'trade': trade,
      'compatible_with': compatibleWith,
    };
  }

  static List<Part> sampleData() {
    return [
      Part(
        id: 'p1',
        name: 'P-Trap 1.5"',
        partNumber: 'PT-150-PVC',
        description: 'PVC P-trap for standard kitchen and bathroom drains. Prevents sewer gases from entering the home.',
        suppliers: ['Home Depot', 'Lowes', 'Ferguson'],
        estimatedCost: 8.99,
        trade: 'plumbing',
        compatibleWith: ['1.5" drain lines', '1.25" drain lines (with adapter)'],
      ),
      Part(
        id: 'p2',
        name: 'GFCI Outlet 15A',
        partNumber: 'GFCI-15A-WH',
        description: 'Ground Fault Circuit Interrupter outlet for wet areas. Required by NEC in bathrooms, kitchens, garages.',
        suppliers: ['Leviton', 'Lutron', 'Home Depot'],
        estimatedCost: 14.99,
        trade: 'electrical',
        compatibleWith: ['15A circuits', '20A circuits (use 20A rated unit for 20A)'],
      ),
      Part(
        id: 'p3',
        name: 'Wax Ring for Toilet',
        partNumber: 'WR-STD-3-4',
        description: 'Standard wax seal for toilet-to-flange connection. Prevents leaks and odors.',
        suppliers: ['Fluidmaster', 'Danco', 'Home Depot'],
        estimatedCost: 5.49,
        trade: 'plumbing',
        compatibleWith: ['Standard 3" and 4" toilet flanges'],
      ),
      Part(
        id: 'p4',
        name: 'Capacitor 5/370V',
        partNumber: 'CAP-5-370-OVAL',
        description: 'Run capacitor for AC condenser fan motor. Common failure point in HVAC systems.',
        suppliers: ['Grainger', 'HVAC Distributors'],
        estimatedCost: 12.50,
        trade: 'hvac',
        compatibleWith: ['Most 1/6 HP to 1/4 HP condenser fan motors'],
      ),
      Part(
        id: 'p5',
        name: 'Slip Joint Washers',
        partNumber: 'SJW-150-10PK',
        description: 'Rubber washers for PVC and ABS slip-joint connections. Pack of 10.',
        suppliers: ['Home Depot', 'Lowes', 'Ace Hardware'],
        estimatedCost: 3.99,
        trade: 'plumbing',
        compatibleWith: ['1.5" slip joint fittings', '1.25" slip joint fittings'],
      ),
    ];
  }
}
