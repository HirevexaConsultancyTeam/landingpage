"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

type ApplyButtonProps = { jobId: string; hasApplied: boolean };

export default function ApplyButton({ jobId, hasApplied }: ApplyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(hasApplied);

  async function apply() {
    if (loading || applied) return;
    try {
      setLoading(true);
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();

      if (res.status === 401) {
        toast.error("Please login to continue.");
        router.push("/login");
        return;
      }
      if (res.status === 400) {
        if (data.error?.toLowerCase().includes("already")) {
          setApplied(true);
          toast.info("You have already applied for this job.");
          return;
        }
        toast.error(data.error || "Unable to apply.");
        return;
      }
      if (!res.ok) {
        toast.error(data.error || "Failed to submit application.");
        return;
      }
      setApplied(true);
      toast.success("Application submitted successfully!");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold py-3 rounded-xl text-sm">
        <CheckCircle size={16} className="text-emerald-500" />
        Application Submitted
      </div>
    );
  }

  return (
    <button
      onClick={apply}
      disabled={loading}
      className="w-full inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold py-3 rounded-xl text-sm transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:scale-[1.01] active:scale-[0.99]"
    >
      {loading ? (
        <><Loader2 size={15} className="animate-spin" /> Applying...</>
      ) : (
        <><Send size={14} /> Apply Now</>
      )}
    </button>
  );
}