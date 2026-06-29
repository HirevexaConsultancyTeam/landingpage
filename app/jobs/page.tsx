"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Briefcase, Building2, MapPin, Clock, Search, SlidersHorizontal, ChevronRight, Loader2 } from "lucide-react";

type Job = {
  id: string; company: string; role: string; openings: number;
  location?: string | null; jobType?: string | null; salary?: string | null;
  experience?: string | null; description?: string | null; deadline?: string | null;
  skills: string[]; isActive: boolean;
};

const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "bg-blue-50 text-blue-700 border-blue-100",
  INTERNSHIP: "bg-purple-50 text-purple-700 border-purple-100",
  PART_TIME: "bg-yellow-50 text-yellow-700 border-yellow-100",
  CONTRACT: "bg-orange-50 text-orange-700 border-orange-100",
  FREELANCE: "bg-green-50 text-green-700 border-green-100",
};
const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time", INTERNSHIP: "Internship",
  PART_TIME: "Part Time", CONTRACT: "Contract", FREELANCE: "Freelance",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/jobs")
      .then(r => r.json())
      .then(data => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => jobs.filter(j => {
    const matchSearch = j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.role.toLowerCase().includes(search.toLowerCase()) ||
      (j.location ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || j.jobType === typeFilter;
    return matchSearch && matchType;
  }), [jobs, search, typeFilter]);

  const totalOpenings = jobs.reduce((s, j) => s + j.openings, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="bg-gradient-to-br from-[#232F3E] to-[#1a2332] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-[#FF9900] text-xs font-semibold uppercase tracking-widest mb-3">Latest Openings</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Find Your Next Opportunity</h1>
          <p className="text-gray-400 text-sm mb-8">Browse the latest openings from our 380+ hiring partners.</p>
          <div className="flex flex-wrap gap-8">
            {[{ label: "Open Positions", value: totalOpenings, c: "text-[#FF9900]" },
              { label: "Active Jobs", value: jobs.length, c: "text-blue-400" },
              { label: "Companies Hiring", value: new Set(jobs.map(j => j.company)).size, c: "text-emerald-400" }].map(s => (
              <div key={s.label}>
                <p className={`text-2xl font-bold ${s.c}`}>{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search role, company, location..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#FF9900] shadow-sm" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {["ALL", "FULL_TIME", "INTERNSHIP", "PART_TIME", "CONTRACT"].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`flex-shrink-0 px-3 py-2.5 rounded-xl text-xs font-semibold border transition ${typeFilter === t ? "bg-[#232F3E] text-white border-[#232F3E]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
                {t === "ALL" ? "All" : JOB_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {!loading && <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-800">{filtered.length}</span> job{filtered.length !== 1 ? "s" : ""}</p>}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
            <p className="text-sm text-gray-500">Loading jobs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center bg-white rounded-2xl border border-gray-200">
            <Briefcase className="h-12 w-12 text-gray-200 mb-4" />
            <h3 className="font-bold text-gray-700">No jobs found</h3>
            <button onClick={() => { setSearch(""); setTypeFilter("ALL"); }} className="mt-4 text-[#FF9900] text-sm font-semibold hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(job => (
              <div key={job.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#232F3E] text-white flex items-center justify-center font-bold flex-shrink-0">{job.company[0]}</div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${job.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"}`}>
                      {job.isActive ? `${job.openings} Open` : "Closed"}
                    </span>
                  </div>
                  <h2 className="font-bold text-gray-900 mb-1 group-hover:text-[#FF9900] transition-colors">{job.role}</h2>
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5"><Building2 size={13} /> {job.company}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.location && <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1"><MapPin size={11} />{job.location}</span>}
                    {job.jobType && <span className={`text-xs font-medium rounded-lg px-2.5 py-1 border ${JOB_TYPE_COLORS[job.jobType] ?? "bg-gray-50 text-gray-500 border-gray-100"}`}>{JOB_TYPE_LABELS[job.jobType] ?? job.jobType}</span>}
                    {job.salary && <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1 font-medium">{job.salary}</span>}
                  </div>
                  {job.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{job.description}</p>}
                  {job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 3).map(s => <span key={s} className="text-xs bg-orange-50 text-orange-700 border border-orange-100 rounded-md px-2 py-0.5">{s}</span>)}
                      {job.skills.length > 3 && <span className="text-xs text-gray-400">+{job.skills.length - 3}</span>}
                    </div>
                  )}
                </div>
                <div className="px-5 pb-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  {job.deadline ? <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} />{new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span> : <span />}
                  <Link href={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold text-xs px-4 py-2 rounded-lg transition">
                    View <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}