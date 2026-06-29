"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, BookOpen, Briefcase, FileText, Save, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type Application = {
  id: string; status: string; notes: string | null; interviewDate: string | null;
  offerSalary: string | null; rejectionReason: string | null;
  candidate: {
    firstName: string; lastName: string; city: string | null; degree: string | null;
    branch: string | null; college: string | null; cgpa: string | null;
    experience: string; skills: string[]; resumeUrl: string | null;
    user: { email: string };
  };
  job: { company: string; role: string; location: string | null; salary: string | null; jobType: string | null };
};

const STATUS_OPTIONS = [
  { value: "APPLIED", label: "Applied", color: "bg-blue-50 text-blue-700" },
  { value: "UNDER_REVIEW", label: "Under Review", color: "bg-yellow-50 text-yellow-700" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled", color: "bg-purple-50 text-purple-700" },
  { value: "OFFER_RECEIVED", label: "Offer Received", color: "bg-emerald-50 text-emerald-700" },
  { value: "PLACED", label: "Placed ✓", color: "bg-green-50 text-green-700" },
  { value: "REJECTED", label: "Rejected", color: "bg-red-50 text-red-700" },
];

const STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-blue-50 text-blue-700 border-blue-100",
  UNDER_REVIEW: "bg-yellow-50 text-yellow-700 border-yellow-100",
  INTERVIEW_SCHEDULED: "bg-purple-50 text-purple-700 border-purple-100",
  OFFER_RECEIVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  PLACED: "bg-green-50 text-green-700 border-green-100",
  REJECTED: "bg-red-50 text-red-700 border-red-100",
};

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [form, setForm] = useState({ status: "APPLIED", notes: "", interviewDate: "", offerSalary: "", rejectionReason: "" });

  useEffect(() => {
    fetch(`/api/admin/applications/${id}`)
      .then(r => r.json())
      .then(data => {
        setApplication(data);
        setForm({
          status: data.status,
          notes: data.notes || "",
          interviewDate: data.interviewDate ? data.interviewDate.substring(0, 10) : "",
          offerSalary: data.offerSalary || "",
          rejectionReason: data.rejectionReason || "",
        });
      })
      .catch(() => toast.error("Failed to load application"))
      .finally(() => setLoading(false));
  }, [id]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Application updated successfully");
      const data = await res.json();
      setApplication(prev => prev ? { ...prev, ...data } : prev);
    } catch {
      toast.error("Failed to update application");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="h-7 w-7 animate-spin text-[#FF9900]" />
    </div>
  );
  if (!application) return <div className="text-center py-20 text-gray-500">Application not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/admin/applications")}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {application.candidate.firstName} {application.candidate.lastName}
          </h1>
          <p className="text-sm text-gray-500">{application.candidate.user.email}</p>
        </div>
        <span className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[application.status]}`}>
          {STATUS_OPTIONS.find(s => s.value === application.status)?.label}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — candidate info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Candidate */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <User size={15} className="text-blue-600" />
              </div>
              <h2 className="font-bold text-gray-900">Candidate Profile</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "City", value: application.candidate.city },
                { label: "Experience", value: application.candidate.experience },
                { label: "Degree", value: application.candidate.degree },
                { label: "Branch", value: application.candidate.branch },
                { label: "College", value: application.candidate.college },
                { label: "CGPA", value: application.candidate.cgpa },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          {application.candidate.skills.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                  <BookOpen size={15} className="text-[#FF9900]" />
                </div>
                <h2 className="font-bold text-gray-900">Skills</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {application.candidate.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                <Briefcase size={15} className="text-purple-600" />
              </div>
              <h2 className="font-bold text-gray-900">Applied For</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Company", value: application.job.company },
                { label: "Role", value: application.job.role },
                { label: "Location", value: application.job.location },
                { label: "Salary", value: application.job.salary },
                { label: "Job Type", value: application.job.jobType?.replace(/_/g, " ") },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Resume */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <FileText size={15} className="text-emerald-600" />
              </div>
              <h2 className="font-bold text-gray-900">Resume</h2>
            </div>
            {application.candidate.resumeUrl ? (
              <a href={application.candidate.resumeUrl} target="_blank"
                className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold text-sm px-4 py-2.5 rounded-xl transition">
                <FileText size={14} /> View Resume
              </a>
            ) : (
              <p className="text-sm text-gray-400">No resume uploaded yet.</p>
            )}
          </div>
        </div>

        {/* Right — actions */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Update Application</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Status</label>
                <div className="grid grid-cols-1 gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s.value} onClick={() => setForm(f => ({ ...f, status: s.value }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition text-left ${
                        form.status === s.value ? `${s.color} border-current` : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}>
                      {form.status === s.value && <CheckCircle size={12} className="flex-shrink-0" />}
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {form.status === "INTERVIEW_SCHEDULED" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Interview Date</label>
                  <input type="date" value={form.interviewDate} onChange={e => setForm(f => ({ ...f, interviewDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#FF9900]" />
                </div>
              )}

              {(form.status === "OFFER_RECEIVED" || form.status === "PLACED") && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Offer Salary</label>
                  <input type="text" value={form.offerSalary} onChange={e => setForm(f => ({ ...f, offerSalary: e.target.value }))}
                    placeholder="e.g. ₹6 LPA"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#FF9900]" />
                </div>
              )}

              {form.status === "REJECTED" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Rejection Reason</label>
                  <textarea value={form.rejectionReason} onChange={e => setForm(f => ({ ...f, rejectionReason: e.target.value }))}
                    rows={2} placeholder="Optional reason..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#FF9900] resize-none" />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Internal Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3} placeholder="Add notes about this candidate..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#FF9900] resize-none" />
              </div>

              <button onClick={save} disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold py-3 rounded-xl text-sm transition disabled:opacity-60">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}