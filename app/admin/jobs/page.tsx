"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Loader2, Briefcase, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

type Job = { id: string; company: string; role: string; openings: number; isActive: boolean; _count: { applications: number } };

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchJobs(); }, []);

  async function fetchJobs() {
    try {
      const res = await fetch("/api/admin/jobs");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load jobs"); }
    finally { setLoading(false); }
  }

  async function toggleJob(id: string) {
    try {
      const res = await fetch(`/api/admin/jobs/${id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      toast.success(data.isActive ? "Job activated" : "Job deactivated");
      fetchJobs();
    } catch { toast.error("Failed to update"); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/jobs/${deleteId}`, { method: "DELETE" });
      toast.success("Job deleted");
      setDeleteId(null);
      fetchJobs();
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return jobs.filter(j => j.company.toLowerCase().includes(q) || j.role.toLowerCase().includes(q));
  }, [jobs, search]);

  const activeCount = jobs.filter(j => j.isActive).length;
  const totalApps = jobs.reduce((a, j) => a + j._count.applications, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all job postings</p>
        </div>
        <Link href="/admin/jobs/create"
          className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold px-4 py-2.5 rounded-xl text-sm transition">
          <Plus size={16} /> Create Job
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Jobs", value: jobs.length, color: "text-gray-900" },
          { label: "Active", value: activeCount, color: "text-emerald-600" },
          { label: "Applications", value: totalApps, color: "text-blue-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by company or role..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#FF9900] bg-white" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-[#FF9900]" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Briefcase className="h-10 w-10 text-gray-200 mb-3" />
            <p className="font-semibold text-gray-600">No jobs found</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Company / Role</th>
                    <th className="px-5 py-3 text-center">Openings</th>
                    <th className="px-5 py-3 text-center">Applications</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">{job.company}</p>
                        <p className="text-xs text-gray-400">{job.role}</p>
                      </td>
                      <td className="px-5 py-4 text-center text-gray-700">{job.openings}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                          {job._count.applications}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${job.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                          {job.isActive ? "Active" : "Closed"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/jobs/${job.id}/edit`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
                            <Pencil size={14} />
                          </Link>
                          <button onClick={() => toggleJob(job.id)}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${job.isActive ? "text-orange-600 hover:bg-orange-50" : "text-emerald-600 hover:bg-emerald-50"}`}>
                            {job.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button onClick={() => setDeleteId(job.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map(job => (
                <div key={job.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{job.company}</p>
                      <p className="text-xs text-gray-500">{job.role}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${job.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                      {job.isActive ? "Active" : "Closed"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">{job._count.applications} applications · {job.openings} openings</p>
                    <div className="flex gap-3">
                      <Link href={`/admin/jobs/${job.id}/edit`} className="text-xs text-blue-600 font-semibold">Edit</Link>
                      <button onClick={() => toggleJob(job.id)} className="text-xs text-orange-600 font-semibold">{job.isActive ? "Deactivate" : "Activate"}</button>
                      <button onClick={() => setDeleteId(job.id)} className="text-xs text-red-600 font-semibold">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="font-bold text-gray-900 mb-2">Delete Job?</h2>
            <p className="text-sm text-gray-500 mb-5">This will permanently delete this job posting.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}