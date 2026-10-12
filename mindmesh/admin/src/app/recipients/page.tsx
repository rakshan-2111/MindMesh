"use client";

import React, { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { dataService } from "@/services/dataService";
import { PipelineRecipient, PipelineExecutionResult } from "@/lib/engine/pipeline";
import { AlertTriangle, Check, X } from "lucide-react";

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<PipelineRecipient[]>([]);
  const [lastResult, setLastResult] = useState<PipelineExecutionResult | null>(null);
  const [confirmRecipient, setConfirmRecipient] = useState<PipelineRecipient | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setRecipients([...dataService.getRecipients()]);
      setLastResult(dataService.getLastPipelineResult());
    };
    update();
    const unsubscribe = dataService.subscribe(update);
    return () => unsubscribe();
  }, []);

  const handleToggleClick = (recipient: PipelineRecipient) => {
    if (recipient.status === "available") {
      // Opening confirmation dialog for marking unavailable
      setConfirmRecipient(recipient);
    } else {
      // Directly mark available
      dataService.toggleRecipientAvailability(recipient.id);
      showToast("Plan updated. Recipient marked available for new distributions.");
    }
  };

  const handleConfirmUnavailable = async () => {
    if (!confirmRecipient) return;
    await dataService.toggleRecipientAvailability(confirmRecipient.id);
    setConfirmRecipient(null);
    showToast("Plan updated. 1 stop changed and volunteers notified.");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const columns: Column<PipelineRecipient>[] = [
    {
      header: "Organization Name",
      cell: (r) => (
        <div>
          <div className="font-medium text-[#17201C]">{r.name}</div>
          <div className="text-[11px] text-[#7C867F]">{r.type} · Bengaluru</div>
        </div>
      ),
    },
    {
      header: "Required Demand",
      align: "right",
      width: "140px",
      cell: (r) => (
        <span className="font-mono text-xs tabular-nums font-medium text-[#17201C]">
          {r.requiredQuantity} portions
        </span>
      ),
    },
    {
      header: "Received Today",
      align: "right",
      width: "140px",
      cell: (r) => {
        const alloc = lastResult?.matchedAllocations.find(
          (a) => a.recipient.id === r.id
        );
        const received = alloc ? alloc.allocatedQuantity : 0;
        return (
          <span className="font-mono text-xs tabular-nums text-[#55605A]">
            {received} portions
          </span>
        );
      },
    },
    {
      header: "Status",
      width: "130px",
      cell: (r) => {
        const isAvail = r.status === "available";
        return (
          <StatusBadge
            label={isAvail ? "Available" : "Unavailable"}
            variant={isAvail ? "success" : "warning"}
          />
        );
      },
    },
    {
      header: "Availability Control",
      align: "right",
      width: "160px",
      cell: (r) => {
        const isAvail = r.status === "available";
        return (
          <button
            onClick={() => handleToggleClick(r)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-medium border transition-colors ${
              isAvail
                ? "bg-white border-[#E3E7E4] text-[#17201C] hover:bg-[#FDECEA] hover:border-[#FCD7D4] hover:text-[#B42318]"
                : "bg-[#1F5D46] border-[#1F5D46] text-white hover:bg-[#184A38]"
            }`}
          >
            {isAvail ? "Mark unavailable" : "Mark available"}
          </button>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Recipients & Demands" />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Page header text */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#17201C]">
              Recipient Shelters & Community Demands
            </h2>
            <p className="text-xs text-[#55605A] mt-0.5">
              Verified partner NGOs and hostels in Bengaluru receiving food distributions.
            </p>
          </div>
          <div className="text-xs text-[#7C867F] font-mono tabular-nums">
            {recipients.length} registered facilities
          </div>
        </div>

        {/* Data table */}
        <div className="bg-white border border-[#E3E7E4] rounded-[10px] overflow-hidden">
          <DataTable
            columns={columns}
            data={recipients}
            keyExtractor={(r) => r.id}
            emptyMessage="No recipient facilities registered."
          />
        </div>
      </main>

      {/* Confirmation Dialog when marking Unavailable */}
      {confirmRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/25"
            onClick={() => setConfirmRecipient(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-[10px] border border-[#E3E7E4] shadow-xl p-5 z-10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FEF3E2] text-[#A15C07] flex items-center justify-center shrink-0">
                <AlertTriangle size={16} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#17201C]">
                  Mark {confirmRecipient.name} as unavailable?
                </h3>
                <p className="text-xs text-[#55605A] mt-1 leading-relaxed">
                  2 assignments will be updated and volunteers notified. Surplus food will be redirected to other pending shelters automatically.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="default"
                onClick={() => setConfirmRecipient(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="default"
                onClick={handleConfirmUnavailable}
              >
                Confirm unavailable
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Non-blocking result toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#17201C] text-white px-4 py-2.5 rounded-[8px] text-xs shadow-lg flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check size={14} className="text-[#1F7A4D]" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/60 hover:text-white"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
