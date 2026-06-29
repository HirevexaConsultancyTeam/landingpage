"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const I = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#FF9900] bg-white";

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company: "", role: "", location: "", jobType: "FULL_TIME", experience: "FRESHER",
    salary: "", skills: "", openings: 1, description: "", deadline: "",
  });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch(`/api/admin/jobs/${id}`).then(r => r.json()).then(data => {
      setForm({
        company: data.company || "", role: data.role || "", location: data.location || "",
        jobType: data.jobType || "FULL_TIME", experience: data.experience || "FRESHER",
        salary: data.salary || "", skills: data.skills?.join(", ") || "",
        openings: data.openings || 1, description: data.description || "",
        deadline: data.deadline ? data.deadline.substring(0, 10) : "",
      });
    }).catch(() => toast.error("Failed to load job")).finally(() => setLoading(false));
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) { toast.error("Update failed"); return; }
      toast.success("Job updated successfully");
      router.push("/admin/jobs");
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="h-7 w-7 animate-spin text-[#FF9900]" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin/jobs")} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update the job details below</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide text-gray-500">Basic Info</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Company Name *</label>
              <input className={I} value={form.company} onChange={e => set("company", e.target.value)} required /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Job Role *</label>
              <input className={I} value={form.role} onChange={e => set("role", e.target.value)} required /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Location</label>
              <input className={I} value={form.location} onChange={e => set("location", e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Salary</label>
              <input className={I} value={form.salary} onChange={e => set("salary", e.target.value)} /></div>
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
            <input className={I} placeholder="Java, Python, SQL (comma separated)" value={form.skills} onChange={e => set("skills", e.target.value)} /></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Job Description</label>
            <textarea rows={6} className={I + " resize-none"} value={form.description} onChange={e => set("description", e.target.value)} /></div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/admin/jobs")} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold py-3 rounded-xl text-sm transition disabled:opacity-60">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Update Job"}
          </button>
        </div>
      </form>
    </div>
  );
}