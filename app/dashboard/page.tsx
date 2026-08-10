// ============================================================================
//  DESTINATION:  app/dashboard/page.tsx   (replaces existing)
//
//  Applications now come from /api/applications rather than being read off the
//  profile payload. That endpoint selects fields explicitly and never returns
//  recruiters' internal notes.
//
//  NOTE: this makes `3-dashboard-applications-page.tsx` unnecessary — don't add
//  that file, the tab here does the job.
// ============================================================================
"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  CheckCircle, Briefcase, FileText,
  Calendar, TrendingUp, ChevronRight, User, Loader2,
  ArrowRight, LogOut, Info, CalendarDays, IndianRupee,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  APPLIED:             { label: "Applied",             color: "text-gray-600",    bg: "bg-gray-100",   dot: "bg-gray-400" },
  UNDER_REVIEW:        { label: "Under Review",        color: "text-amber-700",   bg: "bg-amber-50",   dot: "bg-amber-400" },
  INTERVIEW_SCHEDULED: { label: "Interview Scheduled", color: "text-blue-700",    bg: "bg-blue-50",    dot: "bg-blue-400" },
  OFFER_RECEIVED:      { label: "Offer Received!",     color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-400" },
  PLACED:              { label: "Placed",              color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-400" },
  // "Rejected" reads harshly on someone's own dashboard. The admin panel still
  // says Rejected; this is the same value phrased for the person reading it.
  REJECTED:            { label: "Not Selected",        color: "text-red-600",     bg: "bg-red-50",     dot: "bg-red-400" },
};

type Application = {
  id: string;
  status: string;
  appliedAt: string;
  interviewDate: string | null;
  offerSalary: string | null;
  rejectionReason: string | null;
  job: { id: string; company: string; role: string; location: string | null; jobType: string | null };
};
type Document = { id: string; name: string; type: string; status: string; uploadedAt: string };
type Profile = {
  id: string; firstName: string; lastName: string;
  degree: string | null; branch: string | null; college: string | null; gradYear: string | null;
  city: string | null; skills: string[]; cgpa: string | null; experience: string | null;
  locations: string[]; documents: Document[];
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    Promise.all([
      fetch("/api/candidate/profile").then((r) => r.json()),
      fetch("/api/applications").then((r) => r.json()),
    ])
      .then(([p, a]) => {
        setProfile(p);
        setApps(Array.isArray(a) ? a : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  const docs = profile?.documents ?? [];
  const offersCount = apps.filter((a) => ["OFFER_RECEIVED", "PLACED"].includes(a.status)).length;
  const interviewCount = apps.filter((a) => a.status === "INTERVIEW_SCHEDULED").length;
  const hasResume = docs.some((d) => d.type.toLowerCase() === "resume");

  const profileScore = (() => {
    if (!profile) return 0;
    const checks = [
      profile.firstName, profile.lastName, profile.city, profile.degree,
      profile.branch, profile.college, profile.gradYear, profile.cgpa,
      profile.experience, profile.skills.length > 0, profile.locations.length > 0, hasResume,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  })();

  const scoreBg = profileScore >= 80 ? "bg-emerald-500" : profileScore >= 50 ? "bg-amber-400" : "bg-red-500";

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-[#FF9900]" size={32} />
        </div>
      </div>
    );
  }

  const TABS = ["overview", "applications", "documents"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">

        {/* Profile card */}
        <div className="rounded-2xl bg-gradient-to-br from-[#232F3E] to-[#1a2332] p-5 text-white sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FF9900] text-xl font-bold text-gray-900">
                {profile?.firstName?.[0] ?? session?.user?.email?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0">
                <p className="mb-0.5 text-xs text-gray-400">Welcome back</p>
                <p className="text-xl font-bold">
                  {profile ? `${profile.firstName} ${profile.lastName}` : session?.user?.email}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {[profile?.degree, profile?.college, profile?.gradYear ? `${profile.gradYear} Passout` : null]
                    .filter(Boolean)
                    .join(" · ") || "Complete your profile to get started"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-[#FF9900]">{profileScore}% Profile</p>
                <div className="mt-1.5 h-1.5 w-36 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full ${scoreBg} rounded-full transition-all`} style={{ width: `${profileScore}%` }} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Link href="/dashboard/profile" className="rounded-lg bg-[#FF9900] px-4 py-2 text-center text-xs font-semibold text-gray-900 transition hover:bg-[#e88d00]">
                  Edit Profile
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center justify-center gap-1 text-xs text-gray-500 transition hover:text-white">
                  <LogOut size={10} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { href: "/jobs", icon: Briefcase, title: "Browse Jobs", desc: "Find the latest openings", color: "from-orange-50 to-amber-50 border-orange-100 hover:border-orange-300" },
            { href: "/dashboard/resume", icon: FileText, title: "Manage Resume", desc: hasResume ? "Resume uploaded ✓" : "Upload your resume", color: "from-blue-50 to-indigo-50 border-blue-100 hover:border-blue-300" },
            { href: "/dashboard/courses", icon: User, title: "My Courses", desc: "Continue learning", color: "from-emerald-50 to-teal-50 border-emerald-100 hover:border-emerald-300" },
          ].map((a) => (
            <Link key={a.href} href={a.href} className={`bg-gradient-to-br ${a.color} group rounded-2xl border p-5 transition`}>
              <div className="mb-3 flex items-center justify-between">
                <a.icon className="h-6 w-6 text-gray-700" />
                <ArrowRight className="h-4 w-4 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-gray-700" />
              </div>
              <p className="font-bold text-gray-900">{a.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{a.desc}</p>
            </Link>
          ))}
        </div>

        {/* Tabs */}
        <div>
          <div className="mb-5 flex overflow-x-auto border-b border-gray-200">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-semibold capitalize transition-colors ${
                  tab === t ? "border-[#FF9900] text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t}
                {t === "applications" && ` (${apps.length})`}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Applications", value: apps.length, sub: "Total sent", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Interviews", value: interviewCount, sub: "Scheduled", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Offers", value: offersCount, sub: "Received", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Profile", value: `${profileScore}%`, sub: profileScore >= 80 ? "Excellent" : profileScore >= 50 ? "Good" : "Needs work", icon: TrendingUp, color: "text-[#FF9900]", bg: "bg-orange-50" },
                ].map((k) => (
                  <div key={k.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className={`h-9 w-9 ${k.bg} mb-3 flex items-center justify-center rounded-xl`}>
                      <k.icon size={17} className={k.color} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{k.value}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{k.label}</p>
                    <p className={`mt-1 text-xs font-semibold ${k.color}`}>{k.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:col-span-2">
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h3 className="font-bold text-gray-900">Recent Applications</h3>
                    <button onClick={() => setTab("applications")} className="flex items-center gap-1 text-xs font-medium text-[#FF9900] hover:underline">
                      View all <ChevronRight size={12} />
                    </button>
                  </div>
                  {apps.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <Briefcase className="mb-3 h-10 w-10 text-gray-200" />
                      <p className="text-sm text-gray-500">No applications yet</p>
                      <Link href="/jobs" className="mt-3 text-xs font-semibold text-[#FF9900] hover:underline">
                        Browse open jobs →
                      </Link>
                    </div>
                  ) : (
                    apps.slice(0, 5).map((app) => {
                      const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.APPLIED;
                      return (
                        <div key={app.id} className="flex items-center gap-3 border-b border-gray-50 px-5 py-3.5 transition last:border-0 hover:bg-gray-50">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#232F3E] text-sm font-bold text-white">
                            {app.job.company[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900">{app.job.company}</p>
                            <p className="truncate text-xs text-gray-500">{app.job.role}</p>
                          </div>
                          <div className="flex flex-shrink-0 flex-col items-end gap-1">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                            <p className="text-xs text-gray-400">
                              {new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-5 py-4">
                    <h3 className="font-bold text-gray-900">Profile Checklist</h3>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-[#FF9900] transition-all" style={{ width: `${profileScore}%` }} />
                    </div>
                  </div>
                  {[
                    { label: "Basic info filled", done: !!(profile?.firstName && profile?.lastName) },
                    { label: "Education added", done: !!(profile?.degree && profile?.college) },
                    { label: "Resume uploaded", done: hasResume },
                    { label: "Skills added", done: (profile?.skills.length ?? 0) > 0 },
                    { label: "Applied to a job", done: apps.length > 0 },
                    { label: "Interview scheduled", done: interviewCount > 0 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 border-b border-gray-50 px-5 py-3 last:border-0">
                      <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${item.done ? "bg-emerald-500" : "border-2 border-gray-200"}`}>
                        {item.done && <CheckCircle size={12} className="fill-white text-white" />}
                      </div>
                      <p className={`text-xs ${item.done ? "text-gray-400 line-through" : "font-medium text-gray-700"}`}>
                        {item.label}
                      </p>
                    </div>
                  ))}
                  <div className="p-4">
                    <Link href="/dashboard/profile" className="block w-full rounded-xl bg-[#FF9900] py-2.5 text-center text-xs font-bold text-gray-900 transition hover:bg-[#e88d00]">
                      Complete Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Applications tab — full detail including recruiter feedback */}
          {tab === "applications" && (
            <div className="space-y-4">
              {apps.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white py-16 text-center">
                  <Briefcase className="mb-3 h-10 w-10 text-gray-200" />
                  <p className="text-sm text-gray-500">No applications yet.</p>
                  <Link href="/jobs" className="mt-3 text-xs font-semibold text-[#FF9900] hover:underline">
                    Browse jobs →
                  </Link>
                </div>
              ) : (
                apps.map((app) => {
                  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.APPLIED;
                  const isRejected = app.status === "REJECTED";

                  return (
                    <div
                      key={app.id}
                      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${isRejected ? "border-red-100" : "border-gray-200"}`}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#232F3E] font-bold text-white">
                              {app.job.company[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900">{app.job.role}</p>
                              <p className="text-sm text-gray-500">{app.job.company}</p>
                              <p className="mt-0.5 text-xs text-gray-400">
                                Applied{" "}
                                {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "short", year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </div>

                        {app.status === "INTERVIEW_SCHEDULED" && app.interviewDate && (
                          <div className="mt-3 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                            <CalendarDays size={15} className="flex-shrink-0 text-blue-600" />
                            <p className="text-sm text-blue-800">
                              Interview on{" "}
                              <span className="font-bold">
                                {new Date(app.interviewDate).toLocaleDateString("en-IN", {
                                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                                })}
                              </span>
                            </p>
                          </div>
                        )}

                        {(app.status === "OFFER_RECEIVED" || app.status === "PLACED") && app.offerSalary && (
                          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                            <IndianRupee size={15} className="flex-shrink-0 text-emerald-600" />
                            <p className="text-sm text-emerald-800">
                              Offer: <span className="font-bold">{app.offerSalary}</span>
                            </p>
                          </div>
                        )}

                        {/* Only the reason a recruiter chose to share reaches
                            here. Internal notes are never sent to this page. */}
                        {isRejected && (
                          <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-4">
                            <div className="flex items-start gap-2">
                              <Info size={14} className="mt-0.5 flex-shrink-0 text-red-500" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wide text-red-700">Feedback</p>
                                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-red-800">
                                  {app.rejectionReason || "No specific feedback was provided for this application."}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {isRejected && (
                        <div className="border-t border-red-100 bg-red-50/40 px-5 py-3">
                          <p className="text-xs text-gray-600">
                            One rejection isn&apos;t the end of the road.{" "}
                            <Link href="/jobs" className="font-semibold text-[#FF9900] hover:underline">
                              Browse other openings
                            </Link>{" "}
                            or{" "}
                            <Link href="/dashboard/courses" className="font-semibold text-[#FF9900] hover:underline">
                              strengthen your profile
                            </Link>
                            .
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Documents */}
          {tab === "documents" && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4">
                <h3 className="font-bold text-gray-900">My Documents</h3>
              </div>
              {docs.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <FileText className="mb-3 h-10 w-10 text-gray-200" />
                  <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                </div>
              ) : (
                <div className="grid gap-3 p-5 sm:grid-cols-2">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50">
                      <FileText size={20} className="flex-shrink-0 text-[#FF9900]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${doc.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : doc.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-gray-100 p-5">
                <Link href="/dashboard/resume" className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-4 text-sm font-medium text-gray-500 transition hover:border-[#FF9900] hover:text-[#FF9900]">
                  <FileText size={16} /> Upload / Manage Resume
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}