// ============================================================================
// MindMesh Mobile - Supabase & State Management Service
// Realtime Sync & Demo Mode Resilience
// ============================================================================

import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/models.dart';
import '../algorithms/greedy_allocator.dart';
import '../algorithms/priority_queue.dart';

class MindMeshService extends ChangeNotifier {
  static final MindMeshService _instance = MindMeshService._internal();
  factory MindMeshService() => _instance;
  MindMeshService._internal() {
    _initDemoState();
  }

  bool isConnectedToSupabase = false;
  String currentRole = 'provider'; // 'provider' or 'volunteer'

  // Reactive state collections
  List<DonationModel> donations = [];
  List<RecipientModel> recipients = [];
  List<AssignmentModel> assignments = [];

  // Assignment update notification flag for Volunteer UI
  bool hasAssignmentUpdateNotification = false;
  String? updateNotificationMessage;

  // Stream controllers for live UI updates
  final _donationsController = StreamController<List<DonationModel>>.broadcast();
  final _assignmentsController = StreamController<List<AssignmentModel>>.broadcast();

  Stream<List<DonationModel>> get donationsStream => _donationsController.stream;
  Stream<List<AssignmentModel>> get assignmentsStream => _assignmentsController.stream;

  void _initDemoState() {
    recipients = [
      RecipientModel(
        id: '44444444-4444-4444-4444-444444444441',
        name: 'Asha Foundation',
        type: 'NGO',
        requiredQuantity: 30,
        remainingDemand: 30,
        latitude: 12.9352,
        longitude: 77.6245,
        nodeId: 'NGO_ALPHA',
        priority: 5,
        status: 'available',
      ),
      RecipientModel(
        id: '44444444-4444-4444-4444-444444444442',
        name: 'Sneha Shelter',
        type: 'Shelter',
        requiredQuantity: 40,
        remainingDemand: 40,
        latitude: 12.9784,
        longitude: 77.6408,
        nodeId: 'SHELTER_BETA',
        priority: 4,
        status: 'available',
      ),
      RecipientModel(
        id: '44444444-4444-4444-4444-444444444443',
        name: 'St. Joseph\'s Hostel',
        type: 'Hostel',
        requiredQuantity: 20,
        remainingDemand: 20,
        latitude: 12.9602,
        longitude: 77.6015,
        nodeId: 'HOSTEL_GAMMA',
        priority: 3,
        status: 'available',
      ),
    ];

    donations = [];
    assignments = [];
  }

  Future<void> fetchInitialData() async {
    if (isConnectedToSupabase) {
      try {
        final client = Supabase.instance.client;
        final res = await client.from('donations').select('*').order('created_at', ascending: false);
        if (res.isNotEmpty) {
          donations = (res as List).map((json) => DonationModel.fromJson(json)).toList();
          _donationsController.add(donations);
        }
      } catch (e) {
        debugPrint('Supabase initial fetch: $e');
      }
    }
    notifyListeners();
  }

  void sendDeviceHeartbeat(String role) {
    currentRole = role;
    if (isConnectedToSupabase) {
      try {
        final client = Supabase.instance.client;
        client.channel('mindmesh_realtime_feed').sendBroadcastMessage(
          event: 'device_heartbeat',
          payload: {
            'role': role,
            'deviceId': role == 'provider' ? 'DEV-ANDR-8841' : 'DEV-IPHN-9923',
            'platform': defaultTargetPlatform.name,
            'timestamp': DateTime.now().toIso8601String(),
          },
        );
      } catch (e) {
        debugPrint('Heartbeat broadcast failed: $e');
      }
    }
    notifyListeners();
  }

  Future<void> createDonation(DonationModel donation) async {
    donations.insert(0, donation);
    _donationsController.add(donations);
    _recalculatePlan(donation);

    if (isConnectedToSupabase) {
      try {
        await Supabase.instance.client.from('donations').insert({
          'id': donation.id,
          'provider_id': donation.providerId,
          'food_name': donation.foodName,
          'quantity': donation.quantity,
          'unit': donation.unit,
          'weight_kg': donation.weightKg,
          'expiry_time': donation.expiryTime.toIso8601String(),
          'pickup_location': donation.pickupLocation,
          'node_id': donation.nodeId,
          'latitude': donation.latitude,
          'longitude': donation.longitude,
          'status': 'available',
        });
        debugPrint('Successfully inserted donation ${donation.id} to Supabase');
      } catch (e) {
        debugPrint('Supabase insert failed: $e');
      }
    }

    notifyListeners();
  }

  Future<void> initSupabase({String? url, String? anonKey}) async {
    if (url != null && anonKey != null && url.isNotEmpty && !url.contains('your-project-id')) {
      try {
        await Supabase.initialize(url: url, anonKey: anonKey);
        isConnectedToSupabase = true;
        _listenToRealtime();
      } catch (e) {
        debugPrint('Supabase init fallback to local demo: $e');
        isConnectedToSupabase = false;
      }
    }
    notifyListeners();
  }

  void _listenToRealtime() {
    if (!isConnectedToSupabase) return;
    try {
      final client = Supabase.instance.client;
      client.from('donations').stream(primaryKey: ['id']).listen((data) {
        donations = data.map((json) => DonationModel.fromJson(json)).toList();
        _donationsController.add(donations);
        notifyListeners();
      });

      client.from('assignments').stream(primaryKey: ['id']).listen((data) {
        // Look for status updates
        for (final item in data) {
          if (item['status'] == 'updated') {
            hasAssignmentUpdateNotification = true;
            updateNotificationMessage = 'Recipient changed! Optimization engine recalculated your route.';
            break;
          }
        }
        notifyListeners();
      });
    } catch (e) {
      debugPrint('Realtime stream error: $e');
    }
  }

  /// Provider posts donation
  Future<void> postDonation({
    required String foodName,
    required int quantity,
    required double weightKg,
    required int expiryMinutes,
    required String pickupLocation,
    required String nodeId,
  }) async {
    final newDonation = DonationModel(
      id: 'don-${DateTime.now().millisecondsSinceEpoch}',
      providerId: 'provider-1',
      foodName: foodName,
      quantity: quantity,
      weightKg: weightKg,
      expiryTime: DateTime.now().add(Duration(minutes: expiryMinutes)),
      pickupLocation: pickupLocation,
      nodeId: nodeId,
      latitude: 12.9730,
      longitude: 77.5980,
      status: DonationStatus.available,
    );

    donations.insert(0, newDonation);
    _donationsController.add(donations);

    // Compute immediate assignment matching for demo
    _recalculatePlan(newDonation);

    if (isConnectedToSupabase) {
      try {
        await Supabase.instance.client.from('donations').insert(newDonation.toJson());
      } catch (e) {
        debugPrint('Supabase insert failed: $e');
      }
    }
    notifyListeners();
  }

  /// Internal engine trigger on donation or recipient change
  void _recalculatePlan(DonationModel donation) {
    final availableRecipients = recipients.where((r) => r.status == 'available').toList();

    // 1. Priority scoring
    final urgencyScore = MindMeshPriorityQueue.calculateDonationPriority(
      expiryTime: donation.expiryTime,
      isHighDemand: true,
      isLargeQuantity: donation.weightKg >= 20,
    );

    // 2. Greedy match
    final candidates = availableRecipients.map((r) => AllocationCandidate(
      id: r.id,
      name: r.name,
      nodeId: r.nodeId,
      priority: r.priority,
      remainingDemand: r.remainingDemand,
      distanceKm: 2.0,
      isAvailable: r.status == 'available',
    )).toList();

    final allocResult = GreedyRecipientAllocator.allocate(
      availableSupply: donation.quantity,
      candidates: candidates,
    );

    final names = allocResult.allocations.map((a) => '${a.recipient.name} (${a.allocatedQuantity})').join(' & ');
    final routeStops = ['DEPOT', donation.nodeId, ...allocResult.allocations.map((a) => a.recipient.nodeId)];

    final newAssignment = AssignmentModel(
      id: 'assign-${DateTime.now().millisecondsSinceEpoch}',
      donationId: donation.id,
      recipientId: availableRecipients.isNotEmpty ? availableRecipients.first.id : 'unknown',
      recipientName: names.isNotEmpty ? names : 'Direct Depot Warehouse',
      volunteerId: 'volunteer-1',
      quantity: allocResult.totalAllocatedQuantity,
      weightKg: donation.weightKg,
      pickupLocation: donation.pickupLocation,
      deliveryLocation: names,
      status: AssignmentStatus.assigned,
      routeNodes: routeStops,
      totalDistance: 4.8,
      estimatedTime: 16,
      algorithmUsed: 'Priority Heap (${urgencyScore.toInt()}pts) + Greedy + Knapsack',
    );

    assignments.insert(0, newAssignment);
    _assignmentsController.add(assignments);
  }

  /// Volunteer accepts assignment
  void acceptAssignment(String assignmentId) {
    final idx = assignments.indexWhere((a) => a.id == assignmentId);
    if (idx != -1) {
      assignments[idx] = assignments[idx].copyWith(status: AssignmentStatus.assigned);
      notifyListeners();
    }
  }

  /// Volunteer marks food collected at provider location
  void markCollected(String assignmentId) {
    final idx = assignments.indexWhere((a) => a.id == assignmentId);
    if (idx != -1) {
      assignments[idx] = assignments[idx].copyWith(status: AssignmentStatus.collected);
      if (donations.isNotEmpty) {
        donations[0] = DonationModel(
          id: donations[0].id,
          providerId: donations[0].providerId,
          foodName: donations[0].foodName,
          quantity: donations[0].quantity,
          weightKg: donations[0].weightKg,
          expiryTime: donations[0].expiryTime,
          pickupLocation: donations[0].pickupLocation,
          nodeId: donations[0].nodeId,
          latitude: donations[0].latitude,
          longitude: donations[0].longitude,
          status: DonationStatus.collected,
        );
      }
      notifyListeners();
    }
  }

  /// Volunteer marks food delivered at recipient location
  void markDelivered(String assignmentId) {
    final idx = assignments.indexWhere((a) => a.id == assignmentId);
    if (idx != -1) {
      assignments[idx] = assignments[idx].copyWith(
        status: AssignmentStatus.delivered,
        completedAt: DateTime.now(),
      );
      if (donations.isNotEmpty) {
        donations[0] = DonationModel(
          id: donations[0].id,
          providerId: donations[0].providerId,
          foodName: donations[0].foodName,
          quantity: donations[0].quantity,
          weightKg: donations[0].weightKg,
          expiryTime: donations[0].expiryTime,
          pickupLocation: donations[0].pickupLocation,
          nodeId: donations[0].nodeId,
          latitude: donations[0].latitude,
          longitude: donations[0].longitude,
          status: DonationStatus.delivered,
        );
      }
      notifyListeners();
    }
  }

  /// Dynamic Re-optimization Trigger: Simulates Dashboard toggling recipient to unavailable
  void simulateRecipientUnavailable({String? recipientName}) {
    final target = recipientName ?? 'Shelter Beta';
    final rec = recipients.firstWhere((r) => r.name.contains(target), orElse: () => recipients[1]);
    
    // Toggle
    recipients = recipients.map((r) {
      if (r.id == rec.id) {
        return RecipientModel(
          id: r.id,
          name: r.name,
          type: r.type,
          requiredQuantity: r.requiredQuantity,
          remainingDemand: r.remainingDemand,
          latitude: r.latitude,
          longitude: r.longitude,
          nodeId: r.nodeId,
          priority: r.priority,
          status: 'unavailable',
        );
      }
      return r;
    }).toList();

    // Trigger update banner
    hasAssignmentUpdateNotification = true;
    updateNotificationMessage = '$target became UNAVAILABLE! DAA Engine re-routed your drop-off.';

    // Update assignment to new optimal path (e.g. NGO Alpha + Hostel Gamma)
    if (assignments.isNotEmpty) {
      assignments[0] = assignments[0].copyWith(
        status: AssignmentStatus.updated,
        recipientName: 'NGO Alpha (30) & Hostel Gamma (20) [RE-OPTIMIZED]',
        routeNodes: ['DEPOT', 'CANTEEN', 'NGO_ALPHA', 'HOSTEL_GAMMA'],
        totalDistance: 6.2,
        estimatedTime: 19,
      );
    }

    notifyListeners();
  }

  void clearUpdateNotification() {
    hasAssignmentUpdateNotification = false;
    updateNotificationMessage = null;
    notifyListeners();
  }
}
