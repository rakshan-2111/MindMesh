// ============================================================================
// MindMesh Mobile - Core Data Models
// ============================================================================

enum UserRole { provider, volunteer, admin, recipient }

class UserModel {
  final String id;
  final String name;
  final String email;
  final UserRole role;
  final String? phone;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: UserRole.values.firstWhere(
        (e) => e.name == json['role'],
        orElse: () => UserRole.provider,
      ),
      phone: json['phone'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'role': role.name,
    'phone': phone,
  };
}

enum DonationStatus { available, assigned, collected, delivered, expired, cancelled }

class DonationModel {
  final String id;
  final String providerId;
  final String foodName;
  final int quantity;
  final String unit;
  final double weightKg;
  final DateTime expiryTime;
  final String pickupLocation;
  final String nodeId;
  final double latitude;
  final double longitude;
  final DonationStatus status;
  final DateTime createdAt;

  DonationModel({
    required this.id,
    required this.providerId,
    required this.foodName,
    required this.quantity,
    this.unit = 'portions',
    required this.weightKg,
    required this.expiryTime,
    required this.pickupLocation,
    required this.nodeId,
    required this.latitude,
    required this.longitude,
    this.status = DonationStatus.available,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  factory DonationModel.fromJson(Map<String, dynamic> json) {
    return DonationModel(
      id: json['id'] ?? '',
      providerId: json['provider_id'] ?? '',
      foodName: json['food_name'] ?? '',
      quantity: json['quantity'] ?? 0,
      unit: json['unit'] ?? 'portions',
      weightKg: (json['weight_kg'] as num?)?.toDouble() ?? 0.0,
      expiryTime: DateTime.tryParse(json['expiry_time'] ?? '') ?? DateTime.now().add(const Duration(hours: 1)),
      pickupLocation: json['pickup_location'] ?? '',
      nodeId: json['node_id'] ?? 'CANTEEN',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 12.9730,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 77.5980,
      status: DonationStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => DonationStatus.available,
      ),
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'provider_id': providerId,
    'food_name': foodName,
    'quantity': quantity,
    'unit': unit,
    'weight_kg': weightKg,
    'expiry_time': expiryTime.toIso8601String(),
    'pickup_location': pickupLocation,
    'node_id': nodeId,
    'latitude': latitude,
    'longitude': longitude,
    'status': status.name,
    'created_at': createdAt.toIso8601String(),
  };
}

class RecipientModel {
  final String id;
  final String name;
  final String type;
  final int requiredQuantity;
  final int remainingDemand;
  final double latitude;
  final double longitude;
  final String nodeId;
  final int priority;
  final String status; // 'available' | 'unavailable'

  RecipientModel({
    required this.id,
    required this.name,
    required this.type,
    required this.requiredQuantity,
    required this.remainingDemand,
    required this.latitude,
    required this.longitude,
    required this.nodeId,
    required this.priority,
    required this.status,
  });

  factory RecipientModel.fromJson(Map<String, dynamic> json) {
    return RecipientModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? 'NGO',
      requiredQuantity: json['required_quantity'] ?? 0,
      remainingDemand: json['remaining_demand'] ?? 0,
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      nodeId: json['node_id'] ?? '',
      priority: json['priority'] ?? 1,
      status: json['status'] ?? 'available',
    );
  }
}

enum AssignmentStatus { pending, assigned, collected, delivered, updated, cancelled }

class AssignmentModel {
  final String id;
  final String donationId;
  final String recipientId;
  final String recipientName;
  final String volunteerId;
  final int quantity;
  final double weightKg;
  final String pickupLocation;
  final String deliveryLocation;
  final AssignmentStatus status;
  final DateTime assignedAt;
  final DateTime? completedAt;
  final List<String> routeNodes;
  final double totalDistance;
  final int estimatedTime;
  final String algorithmUsed;

  AssignmentModel({
    required this.id,
    required this.donationId,
    required this.recipientId,
    required this.recipientName,
    required this.volunteerId,
    required this.quantity,
    required this.weightKg,
    required this.pickupLocation,
    required this.deliveryLocation,
    this.status = AssignmentStatus.assigned,
    DateTime? assignedAt,
    this.completedAt,
    this.routeNodes = const [],
    this.totalDistance = 0.0,
    this.estimatedTime = 0,
    this.algorithmUsed = 'Dijkstra + Knapsack',
  }) : assignedAt = assignedAt ?? DateTime.now();

  AssignmentModel copyWith({
    AssignmentStatus? status,
    String? recipientName,
    List<String>? routeNodes,
    double? totalDistance,
    int? estimatedTime,
    DateTime? completedAt,
  }) {
    return AssignmentModel(
      id: id,
      donationId: donationId,
      recipientId: recipientId,
      recipientName: recipientName ?? this.recipientName,
      volunteerId: volunteerId,
      quantity: quantity,
      weightKg: weightKg,
      pickupLocation: pickupLocation,
      deliveryLocation: deliveryLocation,
      status: status ?? this.status,
      assignedAt: assignedAt,
      completedAt: completedAt ?? this.completedAt,
      routeNodes: routeNodes ?? this.routeNodes,
      totalDistance: totalDistance ?? this.totalDistance,
      estimatedTime: estimatedTime ?? this.estimatedTime,
      algorithmUsed: algorithmUsed,
    );
  }
}
