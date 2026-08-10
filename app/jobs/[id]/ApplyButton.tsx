// ============================================================================
//  DESTINATION:  app/jobs/[id]/ApplyButton.tsx   (replaces existing)
//  Now takes two extra props: loggedIn, registrationPaid
// ============================================================================
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle, Loader2, Send, LogIn, Lock } from "lucide-react";
import { toast } from "sonner";

type ApplyButtonProps = {
  jobId: string;
  hasApplied: boolean;
  loggedIn: boolean;
  registrationPaid: boolean;
};

export default function ApplyButton({
  jobId,
  hasApplied,
  loggedIn,
  registrationPaid,
}: ApplyButtonProps) {
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
      if (res.status === 402) {
        toast.error("Complete your registration to apply.");
        router.push("/payment/registration");
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
      <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700">
        <CheckCircle size={16} className="text-emerald-500" />
        Application Submitted
      </div>
    );
  }

  // Logged out — send them to login rather than letting them click through to
  // a 401 they'd have to interpret.
  if (!loggedIn) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => router.push("/login")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF9900] py-3 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-[#e88d00]"
        >
          <LogIn size={15} /> Login to Apply
        </button>
        <p className="text-center text-xs text-gray-400">
          New here?{" "}
          <button onClick={() => router.push("/login")} className="font-semibold text-[#FF9900] hover:underline">
            Create an account
          </button>
        </p>
      </div>
    );
  }

  // Logged in but registration unpaid.
  if (!registrationPaid) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => router.push("/payment/registration")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF9900] py-3 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-[#e88d00]"
        >
          <Lock size={15} /> Register to Apply
        </button>
        <p className="text-center text-xs text-gray-400">
          One-time registration unlocks applications and full job details.
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={apply}
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF9900] py-3 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-[#e88d00] hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <><Loader2 size={15} className="animate-spin" /> Applying...</>
      ) : (
        <><Send size={14} /> Apply Now</>
      )}
    </button>
  );
}