// ============================================================================
//  DESTINATION:  app/admin/jobs/create/page.tsx   (replaces existing)
// ============================================================================
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const I = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#FF9900] bg-white";

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company: "", role: "", location: "", jobType: "FULL_TIME", experience: "FRESHER",
    salary: "", skills: "", openings: 1, description: "", deadline: "",
    applyUrl: "",
  });
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Catch a bad URL here rather than storing it and finding out when a
    // candidate clicks a dead link.
    if (form.applyUrl.trim()) {
      try {
        const u = new URL(form.applyUrl.trim());
        if (!["http:", "https:"].includes(u.protocol)) throw new Error();
      } catch {
        toast.error("Apply URL must be a full link starting with https://");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, applyUrl: form.applyUrl.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed"); return; }
      toast.success("Job created successfully");
      router.push("/admin/jobs");
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin/jobs")} className="rounded-xl border border-gray-200 p-2 transition hover:bg-gray-50">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
          <p className="mt-0.5 text-sm text-gray-500">Fill in the details to publish a job opening</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Basic Info</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Company Name *</label>
              <input className={I} placeholder="e.g. TCS" value={form.company} onChange={e => set("company", e.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Job Role *</label>
              <input className={I} placeholder="e.g. Software Engineer" value={form.role} onChange={e => set("role", e.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Location</label>
              <input className={I} placeholder="e.g. Bangalore / Remote" value={form.location} onChange={e => set("location", e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Salary</label>
              <input className={I} placeholder="e.g. ₹6–8 LPA" value={form.salary} onChange={e => set("salary", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Job Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Job Type</label>
              <select className={I} value={form.jobType} onChange={e => set("jobType", e.target.value)}>
                {[["FULL_TIME","Full Time"],["INTERNSHIP","Internship"],["PART_TIME","Part Time"],["CONTRACT","Contract"],["FREELANCE","Freelance"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Experience</label>
              <select className={I} value={form.experience} onChange={e => set("experience", e.target.value)}>
                {[["FRESHER","Fresher"],["ONE_TO_THREE","1–3 Years"],["THREE_TO_FIVE","3–5 Years"],["FIVE_PLUS","5+ Years"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Openings</label>
              <input type="number" min={1} className={I} value={form.openings} onChange={e => set("openings", Number(e.target.value))} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Application Deadline</label>
              <input type="date" className={I} value={form.deadline} onChange={e => set("deadline", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Skills Required</label>
            <input className={I} placeholder="Java, Python, SQL, Excel (comma separated)" value={form.skills} onChange={e => set("skills", e.target.value)} />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <ExternalLink size={12} /> Apply URL
            </label>
            <input
              type="url"
              className={I}
              placeholder="https://careers.company.com/job/12345"
              value={form.applyUrl}
              onChange={e => set("applyUrl", e.target.value)}
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Optional. Shown to registered candidates as a link to the company&apos;s own posting.
              They can still apply through HireVexa — this doesn&apos;t replace the apply button.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Job Description</label>
            <textarea rows={6} className={I + " resize-none"} placeholder="Describe the role, responsibilities, and requirements..." value={form.description} onChange={e => set("description", e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/admin/jobs")} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold transition hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF9900] py-3 text-sm font-bold text-gray-900 transition hover:bg-[#e88d00] disabled:opacity-60">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : "Create Job"}
          </button>
        </div>
      </form>
    </div>
  );
}