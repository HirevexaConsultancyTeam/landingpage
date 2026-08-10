// ============================================================================
//  DESTINATION:  app/jobs/page.tsx   (replaces existing)
// ============================================================================
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { Briefcase, Building2, MapPin, Clock, Search, ChevronRight, Loader2, Lock } from "lucide-react";

type Job = {
  id: string; company: string; role: string; openings: number;
  location?: string | null; jobType?: string | null; salary?: string | null;
  experience?: string | null; description?: string | null; deadline?: string | null;
  skills: string[]; isActive: boolean;
  /** Set by the API when the gated fields have been stripped. */
  locked: boolean;
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
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [session]); // refetch on login so gated fields appear without a reload

  const filtered = useMemo(
    () =>
      jobs.filter((j) => {
        const q = search.toLowerCase();
        const matchSearch =
          j.company.toLowerCase().includes(q) ||
          j.role.toLowerCase().includes(q) ||
          (j.location ?? "").toLowerCase().includes(q);
        const matchType = typeFilter === "ALL" || j.jobType === typeFilter;
        return matchSearch && matchType;
      }),
    [jobs, search, typeFilter]
  );

  const totalOpenings = jobs.reduce((s, j) => s + j.openings, 0);
  const anyLocked = jobs.some((j) => j.locked);

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-br from-[#232F3E] to-[#1a2332] text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#FF9900]">Latest Openings</p>
          <h1 className="mb-2 text-2xl font-bold sm:text-4xl">Find Your Next Opportunity</h1>
          <p className="mb-8 text-sm text-gray-400">Browse the latest openings from our 380+ hiring partners.</p>
          <div className="flex flex-wrap gap-6 sm:gap-8">
            {[
              { label: "Open Positions", value: totalOpenings, c: "text-[#FF9900]" },
              { label: "Active Jobs", value: jobs.length, c: "text-blue-400" },
              { label: "Companies Hiring", value: new Set(jobs.map((j) => j.company)).size, c: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label}>
                <p className={`text-2xl font-bold ${s.c}`}>{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6">

        {/* One banner rather than a lock on every card — repeating the message
            fifteen times reads as nagging. */}
        {!loading && anyLocked && (
          <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Lock size={15} className="text-[#FF9900]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Salary and full details are hidden</p>
                <p className="text-xs text-gray-500">
                  {session ? "Complete your one-time registration" : "Login and complete registration"} to see
                  salary, full descriptions and required skills — and to apply.
                </p>
              </div>
            </div>
            <Link
              href={session ? "/payment/registration" : "/login"}
              className="flex-shrink-0 rounded-xl bg-[#FF9900] px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-[#e88d00]"
            >
              {session ? "Complete Registration" : "Login"}
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search role, company, location..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none focus:border-[#FF9900]"
            />
          </div>
          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {["ALL", "FULL_TIME", "INTERNSHIP", "PART_TIME", "CONTRACT"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex-shrink-0 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                  typeFilter === t
                    ? "border-[#232F3E] bg-[#232F3E] text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {t === "ALL" ? "All" : JOB_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {!loading && (
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-800">{filtered.length}</span> job
            {filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
            <p className="text-sm text-gray-500">Loading jobs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white py-20 text-center">
            <Briefcase className="mb-4 h-12 w-12 text-gray-200" />
            <h3 className="font-bold text-gray-700">No jobs found</h3>
            <button
              onClick={() => { setSearch(""); setTypeFilter("ALL"); }}
              className="mt-4 text-sm font-semibold text-[#FF9900] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((job) => (
              <div
                key={job.id}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-orange-200 hover:shadow-md"
              >
                <div className="flex-1 p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#232F3E] font-bold text-white">
                      {job.company[0]}
                    </div>
                    <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${job.isActive ? "border-green-100 bg-green-50 text-green-700" : "border-gray-100 bg-gray-50 text-gray-400"}`}>
                      {job.isActive ? `${job.openings} Open` : "Closed"}
                    </span>
                  </div>

                  <h2 className="mb-1 font-bold text-gray-900 transition-colors group-hover:text-[#FF9900]">
                    {job.role}
                  </h2>
                  <p className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
                    <Building2 size={13} /> {job.company}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {job.location && (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
                        <MapPin size={11} />{job.location}
                      </span>
                    )}
                    {job.jobType && (
                      <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${JOB_TYPE_COLORS[job.jobType] ?? "border-gray-100 bg-gray-50 text-gray-500"}`}>
                        {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
                      </span>
                    )}
                    {job.salary ? (
                      <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        {job.salary}
                      </span>
                    ) : job.locked ? (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs text-gray-400">
                        <Lock size={10} /> Salary hidden
                      </span>
                    ) : null}
                  </div>

                  {job.description ? (
                    <p className="mb-3 line-clamp-2 text-xs text-gray-500">{job.description}</p>
                  ) : job.locked ? (
                    <p className="mb-3 text-xs italic text-gray-400">
                      Full description available after registration
                    </p>
                  ) : null}

                  {job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 3).map((s) => (
                        <span key={s} className="rounded-md border border-orange-100 bg-orange-50 px-2 py-0.5 text-xs text-orange-700">
                          {s}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="text-xs text-gray-400">+{job.skills.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 px-5 pb-5 pt-4">
                  {job.deadline ? (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} />
                      {new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  ) : (
                    <span />
                  )}
                  <Link
                    href={`/jobs/${job.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-2 text-xs font-bold text-gray-900 transition hover:bg-[#e88d00]"
                  >
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