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
    name: "Asha Foundation",
    type: "NGO",
    requiredQuantity: 30,
    remainingDemand: 30,
    priority: 5,
    nodeId: "NGO_ALPHA",
    status: "available",
  },
  {
    id: "44444444-4444-4444-4444-444444444442",
    name: "Sneha Shelter",
    type: "Shelter",
    requiredQuantity: 40,
    remainingDemand: 40,
    priority: 4,
    nodeId: "SHELTER_BETA",
    status: "available",
  },
  {
    id: "44444444-4444-4444-4444-444444444443",
    name: "St. Joseph's Hostel",
    type: "Hostel",
    requiredQuantity: 20,
    remainingDemand: 20,
    priority: 3,
    nodeId: "HOSTEL_GAMMA",
    status: "available",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Hosur Road Community Center",
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
    name: "Ravi Kumar",
    vehicleCapacityKg: 50.0,
    currentNodeId: "DEPOT",
  },
  {
    id: "55555555-5555-5555-5555-555555555552",
    name: "Priya Sharma",
    vehicleCapacityKg: 50.0,
    currentNodeId: "DEPOT",
  },
];

export interface DevicePresence {
  id: string;
  roleTitle: string;
  role: "provider" | "engine" | "volunteer";
  deviceModel: string;
  platform: string;
  assignedEntity: string;
  graphNode: string;
  status: string;
  taskBadgeVariant: "success" | "info" | "warning" | "neutral" | "critical";
  allottedTask: string;
  latency: string;
  throughput: string;
  linkQuality: string;
  battery: string;
  inUse: boolean;
}

class MindMeshDataService {
  private donations: PipelineDonation[] = [];
  private recipients: PipelineRecipient[] = [...DEFAULT_RECIPIENTS];
  private volunteers: PipelineVolunteer[] = [...DEFAULT_VOLUNTEERS];
  private providerInUse: boolean = false;
  private volunteerInUse: boolean = false;
  private lastHeartbeatProvider: number = 0;
  private lastHeartbeatVolunteer: number = 0;

  private activityLogs: ActivityLog[] = [
    {
      id: "log-init",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      message: "Operations engine online. Awaiting mobile devices and surplus events.",
      type: "system",
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
        console.warn("Supabase fetch failed:", err);
      }
    }
    // Only optimize if real donations exist
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

  public getDevices(): DevicePresence[] {
    const hasActiveDonation = this.donations.length > 0;
    const hasActiveRoute = this.lastPipelineResult !== null;

    return [
      {
        id: "DEV-ANDR-8841",
        roleTitle: "Food Provider Terminal",
        role: "provider",
        deviceModel: "Android Smartphone (Samsung Galaxy / Pixel 8)",
        platform: "Android 14 · Flutter Engine",
        assignedEntity: "CHRIST Canteen A, Central Campus",
        graphNode: "CANTEEN",
        status: this.providerInUse ? "Online & In Use" : "Offline (Standby)",
        taskBadgeVariant: this.providerInUse ? "success" : "neutral",
        allottedTask: hasActiveDonation
          ? `Surplus Active: ${this.donations[0].foodName} (${this.donations[0].quantity} portions)`
          : "Idle (Waiting for surplus batch)",
        latency: this.providerInUse ? "14 ms" : "Disconnected",
        throughput: this.providerInUse ? "WebSocket Active" : "No traffic",
        linkQuality: this.providerInUse ? "Wi-Fi 5 GHz · 54 Mbps" : "Offline",
        battery: this.providerInUse ? "89%" : "—",
        inUse: this.providerInUse,
      },
      {
        id: "DEV-MCBK-0100",
        roleTitle: "Operations Engine & Control Center",
        role: "engine",
        deviceModel: "Apple MacBook Pro (Apple Silicon M-Series)",
        platform: "macOS Sonoma · Next.js 16 + Turbopack",
        assignedEntity: "Bengaluru Central Logistics Hub",
        graphNode: "DEPOT",
        status: "Active Engine",
        taskBadgeVariant: "info",
        allottedTask: hasActiveRoute
          ? `Optimizing Route #${this.lastPipelineResult?.routeSequence.join(" → ")}`
          : "Idle (Monitoring for surplus postings)",
        latency: "< 1 ms (Local Memory + DP Cache)",
        throughput: "368 optimizations/sec",
        linkQuality: "Gigabit Host (Active)",
        battery: "AC Connected",
        inUse: true,
      },
      {
        id: "DEV-IPHN-9923",
        roleTitle: "Volunteer Courier Mobile",
        role: "volunteer",
        deviceModel: "Apple iPhone 15 Pro",
        platform: "iOS 17 · Flutter Cupertino",
        assignedEntity: "Ravi Kumar (Courier #55555555)",
        graphNode: "DEPOT → CANTEEN → NGO_ALPHA",
        status: this.volunteerInUse
          ? (hasActiveRoute ? "On Active Tour" : "Online & Standby")
          : "Offline (Standby)",
        taskBadgeVariant: this.volunteerInUse ? (hasActiveRoute ? "info" : "success") : "neutral",
        allottedTask: hasActiveRoute
          ? `Executing Route (${this.lastPipelineResult?.totalDistanceKm} km · ${this.lastPipelineResult?.estimatedMinutes} min ETA)`
          : "Standby (No active tour assigned)",
        latency: this.volunteerInUse ? "22 ms" : "Disconnected",
        throughput: this.volunteerInUse ? "Location Sync Live" : "No traffic",
        linkQuality: this.volunteerInUse ? "Cellular 5G" : "Offline",
        battery: this.volunteerInUse ? "78%" : "—",
        inUse: this.volunteerInUse,
      },
    ];
  }

  public setDeviceActive(role: "provider" | "volunteer", active: boolean) {
    if (role === "provider") this.providerInUse = active;
    if (role === "volunteer") this.volunteerInUse = active;
    this.notify();
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

    const result = MindMeshOptimizationPipeline.execute({
      donation,
      recipients: this.recipients,
      volunteer: availableVolunteer,
      graph: this.graph,
      enableTsp: true,
    });

    this.lastPipelineResult = result;

    const matchedNames = result.matchedAllocations
      .map((a) => `${a.recipient.name} (${a.allocatedQuantity} portions)`)
      .join(" and ");

    this.addLog(`Matched with ${matchedNames || "nearby shelters"}`, "admin");
    this.addLog(`Assigned to ${availableVolunteer.name}. Vehicle load: ${result.knapsackOutcome.totalWeight} kg.`, "volunteer");
    this.addLog(`Route planned: ${result.totalDistanceKm} km across ${result.routeSequence.length} stops.`, "admin");

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

    if (newStatus === "unavailable") {
      this.addLog(`Plan updated. ${recipient.name} marked unavailable. Assignments refreshed.`, "admin");
    } else {
      this.addLog(`${recipient.name} marked available. Ready for incoming requests.`, "admin");
    }

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

  public async addDonation(newDonation: PipelineDonation) {
    this.donations.unshift(newDonation);
    this.addLog(`New Donation created: ${newDonation.foodName} at ${newDonation.pickupLocation}`, "provider");
    this.runOptimization(newDonation.id);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("donations").insert({
          id: newDonation.id,
          food_name: newDonation.foodName,
          quantity: newDonation.quantity,
          weight_kg: newDonation.weightKg,
          expiry_time: typeof newDonation.expiryTime === "string" ? newDonation.expiryTime : newDonation.expiryTime.toISOString(),
          pickup_location: newDonation.pickupLocation,
          node_id: newDonation.nodeId,
          status: "available",
          latitude: 12.9345,
          longitude: 77.606,
        });
      } catch (err) {
        console.error("Supabase insert donation error:", err);
      }
    }
    this.notify();
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
