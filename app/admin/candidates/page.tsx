"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Loader2, Users, FileText } from "lucide-react";

type Candidate = {
  id: string; firstName: string; lastName: string; city: string | null;
  degree: string | null; college: string | null; resumeUrl: string | null;
  status: string;
  user: { email: string };
  _count: { applications: number };
};

const STATUS_COLORS: Record<string, string> = {
  ONBOARDING: "bg-gray-50 text-gray-600 border-gray-200",
  RESUME_REVIEW: "bg-blue-50 text-blue-700 border-blue-100",
  INTERVIEW_STAGE: "bg-purple-50 text-purple-700 border-purple-100",
  OFFER_RECEIVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  PLACED: "bg-green-50 text-green-700 border-green-100",
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/candidates")
      .then(r => r.json())
      .then(data => setCandidates(data.candidates ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return candidates;
    return candidates.filter(c =>
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.user.email.toLowerCase().includes(q) ||
      (c.college?.toLowerCase().includes(q) ?? false)
    );
  }, [candidates, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-sm text-gray-500 mt-1">{candidates.length} registered candidates</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or college..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#FF9900] bg-white" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-[#FF9900]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users className="h-10 w-10 text-gray-200 mb-3" />
            <p className="font-semibold text-gray-600">No candidates found</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Candidate</th>
                    <th className="px-5 py-3">Education</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-center">Apps</th>
                    <th className="px-5 py-3">Resume</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-gray-400">{c.user.email}</p>
                        {c.city && <p className="text-xs text-gray-400">{c.city}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700">{c.degree || "—"}</p>
                        {c.college && <p className="text-xs text-gray-400 truncate max-w-[160px]">{c.college}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[c.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {c.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                          {c._count.applications}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {c.resumeUrl
                          ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><FileText size={11} /> Uploaded</span>
                          : <span className="text-xs text-red-400 font-semibold">Missing</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/admin/candidates/${c.id}`}
                          className="text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map(c => (
                <div key={c.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-gray-400">{c.user.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ml-2 ${STATUS_COLORS[c.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  {c.degree && <p className="text-xs text-gray-500 mb-1">{c.degree}{c.college ? ` · ${c.college}` : ""}</p>}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">{c._count.applications} applications · {c.resumeUrl ? "Resume ✓" : "No resume"}</p>
                    <Link href={`/admin/candidates/${c.id}`} className="text-xs font-semibold text-[#FF9900] hover:underline">View →</Link>
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