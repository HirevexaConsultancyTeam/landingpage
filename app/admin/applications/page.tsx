"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, Loader2, FileText, Filter } from "lucide-react";

type Application = {
  id: string; status: string; appliedAt: string;
  candidate: { id: string; firstName: string; lastName: string; resumeUrl: string | null; user: { email: string } };
  job: { id: string; company: string; role: string };
};

const STATUS_STYLES: Record<string, string> = {
  APPLIED: "bg-blue-50 text-blue-700 border-blue-100",
  UNDER_REVIEW: "bg-yellow-50 text-yellow-700 border-yellow-100",
  INTERVIEW_SCHEDULED: "bg-purple-50 text-purple-700 border-purple-100",
  OFFER_RECEIVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  PLACED: "bg-green-50 text-green-700 border-green-100",
  REJECTED: "bg-red-50 text-red-700 border-red-100",
};

const ALL_STATUSES = ["ALL", "APPLIED", "UNDER_REVIEW", "INTERVIEW_SCHEDULED", "OFFER_RECEIVED", "PLACED", "REJECTED"];

function toLabel(s: string) { return s.replace(/_/g, " "); }

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/admin/applications")
      .then(r => r.json())
      .then(data => setApplications(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return applications.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        a.candidate.firstName.toLowerCase().includes(q) ||
        a.candidate.lastName.toLowerCase().includes(q) ||
        a.candidate.user.email.toLowerCase().includes(q) ||
        a.job.company.toLowerCase().includes(q) ||
        a.job.role.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [applications, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">{applications.length} total applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, company..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-orange-100 bg-white" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#FF9900] bg-white appearance-none">
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s === "ALL" ? "All Status" : toLabel(s)}</option>)}
          </select>
        </div>
      </div>

      {/* Status count pills */}
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.filter(s => s !== "ALL").map(s => {
          const count = applications.filter(a => a.status === s).length;
          if (!count) return null;
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition ${statusFilter === s ? STATUS_STYLES[s] : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"}`}>
              {toLabel(s)} <span className="bg-white/60 px-1 rounded-full">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-[#FF9900]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-10 w-10 text-gray-200 mb-3" />
            <p className="font-semibold text-gray-600">No applications found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Candidate</th>
                    <th className="px-5 py-3">Company / Role</th>
                    <th className="px-5 py-3">Applied</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Resume</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">{a.candidate.firstName} {a.candidate.lastName}</p>
                        <p className="text-xs text-gray-400">{a.candidate.user.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{a.job.company}</p>
                        <p className="text-xs text-gray-400">{a.job.role}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {new Date(a.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[a.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {toLabel(a.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {a.candidate.resumeUrl
                          ? <a href={a.candidate.resumeUrl} target="_blank" className="text-xs font-semibold text-[#FF9900] hover:underline">View</a>
                          : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/admin/applications/${a.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map(a => (
                <div key={a.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{a.candidate.firstName} {a.candidate.lastName}</p>
                      <p className="text-xs text-gray-400">{a.candidate.user.email}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ml-2 ${STATUS_STYLES[a.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {toLabel(a.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1"><span className="font-medium">{a.job.company}</span> · {a.job.role}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">{new Date(a.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                    <Link href={`/admin/applications/${a.id}`}
                      className="text-xs font-semibold text-[#FF9900] hover:underline">
                      Open →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}