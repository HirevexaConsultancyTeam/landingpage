"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const I = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#FF9900] bg-white";

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company: "", role: "", location: "", jobType: "FULL_TIME", experience: "FRESHER",
    salary: "", skills: "", openings: 1, description: "", deadline: "",
  });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/jobs/create", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed"); return; }
      toast.success("Job created successfully");
      router.push("/admin/jobs");
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin/jobs")} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details to publish a job opening</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-gray-500">Basic Info</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Company Name *</label>
              <input className={I} placeholder="e.g. TCS" value={form.company} onChange={e => set("company", e.target.value)} required /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Job Role *</label>
              <input className={I} placeholder="e.g. Software Engineer" value={form.role} onChange={e => set("role", e.target.value)} required /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Location</label>
              <input className={I} placeholder="e.g. Bangalore / Remote" value={form.location} onChange={e => set("location", e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Salary</label>
              <input className={I} placeholder="e.g. ₹6–8 LPA" value={form.salary} onChange={e => set("salary", e.target.value)} /></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide text-gray-500">Job Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Job Type</label>
              <select className={I} value={form.jobType} onChange={e => set("jobType", e.target.value)}>
                {[["FULL_TIME","Full Time"],["INTERNSHIP","Internship"],["PART_TIME","Part Time"],["CONTRACT","Contract"],["FREELANCE","Freelance"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Experience</label>
              <select className={I} value={form.experience} onChange={e => set("experience", e.target.value)}>
                {[["FRESHER","Fresher"],["ONE_TO_THREE","1–3 Years"],["THREE_TO_FIVE","3–5 Years"],["FIVE_PLUS","5+ Years"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Openings</label>
              <input type="number" min={1} className={I} value={form.openings} onChange={e => set("openings", Number(e.target.value))} /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Application Deadline</label>
              <input type="date" className={I} value={form.deadline} onChange={e => set("deadline", e.target.value)} /></div>
          </div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Skills Required</label>
            <input className={I} placeholder="Java, Python, SQL, Excel (comma separated)" value={form.skills} onChange={e => set("skills", e.target.value)} /></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Job Description</label>
            <textarea rows={6} className={I + " resize-none"} placeholder="Describe the role, responsibilities, and requirements..." value={form.description} onChange={e => set("description", e.target.value)} /></div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/admin/jobs")} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold py-3 rounded-xl text-sm transition disabled:opacity-60">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : "Create Job"}
          </button>
        </div>
      </form>
    </div>
  );
}