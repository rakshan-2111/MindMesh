// ============================================================================
// MindMesh DAA Project - Admin Data & Realtime Service
// Manages State, Supabase Realtime Sync, Pipeline Triggering, and Live Feed
// ============================================================================

import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { buildMindMeshGraph } from "../lib/graphData";
import {
  MindMeshOptimizationPipeline,
  PipelineDonation,
  PipelineRecipient,
  PipelineVolunteer,
  PipelineExecutionResult,
} from "../lib/engine/pipeline";

export interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
  type: "provider" | "volunteer" | "algorithm" | "admin" | "system";
  meta?: any;
}

// Initial default demo state matching seed.sql
const DEFAULT_RECIPIENTS: PipelineRecipient[] = [
  {
    id: "44444444-4444-4444-4444-444444444441",
    name: "NGO Alpha",
    type: "NGO",
    requiredQuantity: 30,
    remainingDemand: 30,
    priority: 5,
    nodeId: "NGO_ALPHA",
    status: "available",
  },
  {
    id: "44444444-4444-4444-4444-444444444442",
    name: "Shelter Beta",
    type: "Shelter",
    requiredQuantity: 40,
    remainingDemand: 40,
    priority: 4,
    nodeId: "SHELTER_BETA",
    status: "available",
  },
  {
    id: "44444444-4444-4444-4444-444444444443",
    name: "Hostel Gamma",
    type: "Hostel",
    requiredQuantity: 20,
    remainingDemand: 20,
    priority: 3,
    nodeId: "HOSTEL_GAMMA",
    status: "available",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Community Center Delta",
    type: "Community Center",
    requiredQuantity: 25,
    remainingDemand: 25,
    priority: 2,
    nodeId: "COMMUNITY_DELTA",
    status: "available",
  },
];

const DEFAULT_VOLUNTEERS: PipelineVolunteer[] = [
  {
    id: "55555555-5555-5555-5555-555555555551",
    name: "Alex Chen (Volunteer 1)",
    vehicleCapacityKg: 50.0,
    currentNodeId: "DEPOT",
  },
  {
    id: "55555555-5555-5555-5555-555555555552",
    name: "Sarah Khan (Volunteer 2)",
    vehicleCapacityKg: 50.0,
    currentNodeId: "DEPOT",
  },
];

const DEFAULT_DONATIONS: PipelineDonation[] = [
  {
    id: "66666666-6666-6666-6666-666666666661",
    foodName: "Fresh Lunch Buffet Trays",
    quantity: 50,
    weightKg: 25.0,
    expiryTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    pickupLocation: "Campus Central Canteen",
    nodeId: "CANTEEN",
    isHighDemand: true,
  },
];

class MindMeshDataService {
  private donations: PipelineDonation[] = [...DEFAULT_DONATIONS];
  private recipients: PipelineRecipient[] = [...DEFAULT_RECIPIENTS];
  private volunteers: PipelineVolunteer[] = [...DEFAULT_VOLUNTEERS];
  private activityLogs: ActivityLog[] = [
    {
      id: "log-1",
      timestamp: new Date().toLocaleTimeString(),
      message: "MindMesh Control Center Initialized. DAA Algorithm Engine Ready.",
      type: "system",
    },
    {
      id: "log-2",
      timestamp: new Date().toLocaleTimeString(),
      message: "Provider (Android) connected: Campus Central Canteen",
      type: "provider",
    },
    {
      id: "log-3",
      timestamp: new Date().toLocaleTimeString(),
      message: "Volunteer (iPhone) online: Alex Chen (Vehicle: Bike, Capacity: 50kg)",
      type: "volunteer",
    },
  ];
  private lastPipelineResult: PipelineExecutionResult | null = null;
  private listeners: Set<() => void> = new Set();
  private graph = buildMindMeshGraph();

  constructor() {
    this.init();
  }

  private async init() {
    if (isSupabaseConfigured && supabase) {
      try {
        await this.fetchFromSupabase();
        this.subscribeRealtime();
      } catch (err) {
        console.warn("Supabase fetch failed, continuing with demo memory state:", err);
      }
    }
    // Run an initial pipeline run for demo display
    if (this.donations.length > 0) {
      this.runOptimization(this.donations[0].id);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public getDonations() {
    return this.donations;
  }

  public getRecipients() {
    return this.recipients;
  }

  public getVolunteers() {
    return this.volunteers;
  }

  public getActivityLogs() {
    return this.activityLogs;
  }

  public getLastPipelineResult() {
    return this.lastPipelineResult;
  }

  public getGraph() {
    return this.graph;
  }

  public addLog(message: string, type: ActivityLog["type"], meta?: any) {
    const log: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
      meta,
    };
    this.activityLogs.unshift(log);
    if (this.activityLogs.length > 50) this.activityLogs.pop();
    this.notify();
  }

  /**
   * Core Optimization Execution
   */
  public runOptimization(donationId: string): PipelineExecutionResult | null {
    const donation = this.donations.find((d) => d.id === donationId) || this.donations[0];
    if (!donation) return null;

    const availableVolunteer = this.volunteers[0];

    this.addLog(`Android posted Donation #${donation.id.slice(0, 4)}: ${donation.foodName} (${donation.quantity} portions)`, "provider");
    this.addLog("Priority Queue evaluating expiry urgency score...", "algorithm");

    const result = MindMeshOptimizationPipeline.execute({
      donation,
      recipients: this.recipients,
      volunteer: availableVolunteer,
      graph: this.graph,
      enableTsp: true,
    });

    this.lastPipelineResult = result;

    this.addLog(`Priority Score: ${result.priorityScore} pts. Running Greedy matching...`, "algorithm");
    const matchedNames = result.matchedAllocations.map((a) => `${a.recipient.name} (${a.allocatedQuantity})`).join(", ");
    this.addLog(`Matched with: ${matchedNames}`, "algorithm");

    this.addLog(`0/1 Knapsack packed ${result.knapsackOutcome.totalWeight}kg / ${availableVolunteer.vehicleCapacityKg}kg into volunteer carrier`, "algorithm");
    this.addLog(`Dijkstra & TSP optimal tour: ${result.routeSequence.join(" ➔ ")} (${result.totalDistanceKm} km)`, "algorithm");
    this.addLog(`iPhone assigned to volunteer ${availableVolunteer.name}. Realtime dispatch sent!`, "volunteer");

    this.notify();
    return result;
  }

  /**
   * Dynamic Re-optimization when a recipient status is changed (e.g. marked UNAVAILABLE)
   */
  public async toggleRecipientAvailability(recipientId: string) {
    const recipient = this.recipients.find((r) => r.id === recipientId);
    if (!recipient) return;

    const newStatus = recipient.status === "available" ? "unavailable" : "available";
    recipient.status = newStatus;

    this.addLog(
      `Recipient '${recipient.name}' marked ${newStatus.toUpperCase()}! Triggering dynamic re-optimization...`,
      "admin"
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("recipients")
          .update({ status: newStatus })
          .eq("id", recipientId);
      } catch (err) {
        console.error("Supabase update error:", err);
      }
    }

    // Re-run the optimization pipeline dynamically!
    if (this.donations.length > 0) {
      const updatedPlan = this.runOptimization(this.donations[0].id);
      this.addLog("Dynamic re-optimization complete. Volunteer iPhone notification: 'Assignment Updated'", "volunteer");
    }

    this.notify();
  }

  public addDonation(newDonation: PipelineDonation) {
    this.donations.unshift(newDonation);
    this.addLog(`New Donation created: ${newDonation.foodName} at ${newDonation.pickupLocation}`, "provider");
    this.runOptimization(newDonation.id);
  }

  private async fetchFromSupabase() {
    if (!supabase) return;
    const { data: recData } = await supabase.from("recipients").select("*");
    if (recData && recData.length > 0) {
      this.recipients = recData.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        requiredQuantity: r.required_quantity,
        remainingDemand: r.remaining_demand,
        priority: r.priority,
        nodeId: r.node_id,
        status: r.status,
      }));
    }

    const { data: donData } = await supabase.from("donations").select("*");
    if (donData && donData.length > 0) {
      this.donations = donData.map((d) => ({
        id: d.id,
        foodName: d.food_name,
        quantity: d.quantity,
        weightKg: d.weight_kg,
        expiryTime: d.expiry_time,
        pickupLocation: d.pickup_location,
        nodeId: d.node_id,
        isHighDemand: true,
      }));
    }
    this.notify();
  }

  private subscribeRealtime() {
    if (!supabase) return;

    supabase
      .channel("mindmesh_realtime_feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "donations" }, (payload) => {
        const d = payload.new as any;
        const newDonation: PipelineDonation = {
          id: d.id,
          foodName: d.food_name,
          quantity: d.quantity,
          weightKg: d.weight_kg,
          expiryTime: d.expiry_time,
          pickupLocation: d.pickup_location,
          nodeId: d.node_id,
          isHighDemand: true,
        };
        this.donations.unshift(newDonation);
        this.addLog(`Realtime Sync: Provider posted donation ${newDonation.foodName}`, "provider");
        this.runOptimization(newDonation.id);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "recipients" }, (payload) => {
        const r = payload.new as any;
        const local = this.recipients.find((item) => item.id === r.id);
        if (local) {
          local.status = r.status;
          this.addLog(`Realtime Sync: Recipient ${r.name} status updated to ${r.status}`, "system");
          if (this.donations.length > 0) {
            this.runOptimization(this.donations[0].id);
          }
        }
      })
      .subscribe();
  }
}

export const dataService = new MindMeshDataService();
