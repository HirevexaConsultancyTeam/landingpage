"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  CheckCircle, Clock, AlertCircle, Briefcase, FileText,
  Calendar, TrendingUp, ChevronRight, User, Loader2,
  BookOpen, ArrowRight, LogOut, Star
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  APPLIED:              { label: "Applied",              color: "text-gray-600",    bg: "bg-gray-100",    dot: "bg-gray-400" },
  UNDER_REVIEW:         { label: "Under Review",         color: "text-amber-700",   bg: "bg-amber-50",    dot: "bg-amber-400" },
  INTERVIEW_SCHEDULED:  { label: "Interview Scheduled",  color: "text-blue-700",    bg: "bg-blue-50",     dot: "bg-blue-400" },
  OFFER_RECEIVED:       { label: "Offer Received!",      color: "text-emerald-700", bg: "bg-emerald-50",  dot: "bg-emerald-400" },
  PLACED:               { label: "Placed",               color: "text-emerald-700", bg: "bg-emerald-50",  dot: "bg-emerald-400" },
  REJECTED:             { label: "Rejected",             color: "text-red-600",     bg: "bg-red-50",      dot: "bg-red-400" },
};

type Application = { id: string; status: string; appliedAt: string; job: { company: string; role: string } };
type Document = { id: string; name: string; type: string; status: string; uploadedAt: string };
type Profile = {
  id: string; firstName: string; lastName: string;
  degree: string | null; branch: string | null; college: string | null; gradYear: string | null;
  city: string | null; skills: string[]; cgpa: string | null; experience: string | null;
  locations: string[]; applications: Application[]; documents: Document[];
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/candidate/profile").then(r => r.json())
        .then(d => { setProfile(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const apps = profile?.applications ?? [];
  const docs = profile?.documents ?? [];
  const offersCount = apps.filter(a => ["OFFER_RECEIVED","PLACED"].includes(a.status)).length;
  const interviewCount = apps.filter(a => a.status === "INTERVIEW_SCHEDULED").length;
  const hasResume = docs.some(d => d.type.toLowerCase() === "resume");

  const profileScore = (() => {
    if (!profile) return 0;
    const checks = [
      profile.firstName, profile.lastName, profile.city, profile.degree,
      profile.branch, profile.college, profile.gradYear, profile.cgpa,
      profile.experience, profile.skills.length > 0, profile.locations.length > 0, hasResume
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  })();

  const scoreColor = profileScore >= 80 ? "text-emerald-600" : profileScore >= 50 ? "text-amber-600" : "text-red-500";
  const scoreBg = profileScore >= 80 ? "bg-emerald-500" : profileScore >= 50 ? "bg-amber-400" : "bg-red-500";

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#FF9900]" size={32} /></div>
      </div>
    );
  }

  const TABS = ["overview", "applications", "documents"];

  return (
    <div className="min-h-screen bg-gray-50">
     
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Profile card */}
        <div className="bg-gradient-to-br from-[#232F3E] to-[#1a2332] rounded-2xl text-white p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FF9900] flex items-center justify-center text-gray-900 font-bold text-xl flex-shrink-0">
                {profile?.firstName?.[0] ?? session?.user?.email?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Welcome back</p>
                <p className="text-xl font-bold">{profile ? `${profile.firstName} ${profile.lastName}` : session?.user?.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {[profile?.degree, profile?.college, profile?.gradYear ? `${profile.gradYear} Passout` : null].filter(Boolean).join(" · ") || "Complete your profile to get started"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`text-sm font-bold ${scoreColor.replace("text-", "text-")} text-[#FF9900]`}>{profileScore}% Profile</p>
                <div className="w-36 h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full ${scoreBg} rounded-full transition-all`} style={{ width: `${profileScore}%` }} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Link href="/dashboard/profile" className="text-xs font-semibold bg-[#FF9900] text-gray-900 px-4 py-2 rounded-lg hover:bg-[#e88d00] transition text-center">
                  Edit Profile
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-xs text-gray-500 hover:text-white flex items-center justify-center gap-1 transition">
                  <LogOut size={10} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: "/jobs", icon: Briefcase, title: "Browse Jobs", desc: "Find the latest openings", color: "from-orange-50 to-amber-50 border-orange-100 hover:border-orange-300" },
            { href: "/dashboard/resume", icon: FileText, title: "Manage Resume", desc: hasResume ? "Resume uploaded ✓" : "Upload your resume", color: "from-blue-50 to-indigo-50 border-blue-100 hover:border-blue-300" },
            { href: "/dashboard/profile", icon: User, title: "Update Profile", desc: `${profileScore}% complete`, color: "from-emerald-50 to-teal-50 border-emerald-100 hover:border-emerald-300" },
          ].map(a => (
            <Link key={a.href} href={a.href} className={`bg-gradient-to-br ${a.color} border rounded-2xl p-5 transition group`}>
              <div className="flex items-center justify-between mb-3">
                <a.icon className="h-6 w-6 text-gray-700" />
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="font-bold text-gray-900">{a.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
            </Link>
          ))}
        </div>

        {/* Tabs */}
        <div>
          <div className="flex border-b border-gray-200 mb-5 overflow-x-auto">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-semibold capitalize whitespace-nowrap border-b-2 transition-colors ${tab === t ? "border-[#FF9900] text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                {t}{t === "applications" && ` (${apps.length})`}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === "overview" && (
            <div className="space-y-5">
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Applications", value: apps.length, sub: "Total sent", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Interviews", value: interviewCount, sub: "Scheduled", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Offers", value: offersCount, sub: "Received", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Profile", value: `${profileScore}%`, sub: profileScore >= 80 ? "Excellent" : profileScore >= 50 ? "Good" : "Needs work", icon: TrendingUp, color: "text-[#FF9900]", bg: "bg-orange-50" },
                ].map(k => (
                  <div key={k.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className={`w-9 h-9 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
                      <k.icon size={17} className={k.color} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{k.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
                    <p className={`text-xs font-semibold mt-1 ${k.color}`}>{k.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Recent applications */}
                <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Recent Applications</h3>
                    <button onClick={() => setTab("applications")} className="text-xs text-[#FF9900] hover:underline flex items-center gap-1 font-medium">
                      View all <ChevronRight size={12} />
                    </button>
                  </div>
                  {apps.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <Briefcase className="h-10 w-10 text-gray-200 mb-3" />
                      <p className="text-sm text-gray-500">No applications yet</p>
                      <Link href="/jobs" className="mt-3 text-xs text-[#FF9900] font-semibold hover:underline">Browse open jobs →</Link>
                    </div>
                  ) : apps.slice(0, 5).map(app => {
                    const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.APPLIED;
                    return (
                      <div key={app.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                        <div className="w-9 h-9 rounded-xl bg-[#232F3E] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {app.job.company[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{app.job.company}</p>
                          <p className="text-xs text-gray-500 truncate">{app.job.role}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                          </span>
                          <p className="text-xs text-gray-400">{new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Checklist */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Profile Checklist</h3>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF9900] rounded-full transition-all" style={{ width: `${profileScore}%` }} />
                    </div>
                  </div>
                  {[
                    { label: "Basic info filled", done: !!(profile?.firstName && profile?.lastName) },
                    { label: "Education added", done: !!(profile?.degree && profile?.college) },
                    { label: "Resume uploaded", done: hasResume },
                    { label: "Skills added", done: (profile?.skills.length ?? 0) > 0 },
                    { label: "Applied to a job", done: apps.length > 0 },
                    { label: "Interview scheduled", done: interviewCount > 0 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${item.done ? "bg-emerald-500" : "border-2 border-gray-200"}`}>
                        {item.done && <CheckCircle size={12} className="text-white fill-white" />}
                      </div>
                      <p className={`text-xs ${item.done ? "line-through text-gray-400" : "text-gray-700 font-medium"}`}>{item.label}</p>
                    </div>
                  ))}
                  <div className="p-4">
                    <Link href="/dashboard/profile" className="block w-full text-center bg-[#FF9900] text-gray-900 font-bold text-xs py-2.5 rounded-xl hover:bg-[#e88d00] transition">
                      Complete Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Applications tab */}
          {tab === "applications" && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">All Applications <span className="text-gray-400 font-normal">({apps.length})</span></h3>
              </div>
              {apps.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <Briefcase className="h-10 w-10 text-gray-200 mb-3" />
                  <p className="text-sm text-gray-500">No applications yet.</p>
                  <Link href="/jobs" className="mt-3 text-xs text-[#FF9900] font-semibold hover:underline">Browse jobs →</Link>
                </div>
              ) : apps.map(app => {
                const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.APPLIED;
                return (
                  <div key={app.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-[#232F3E] text-white flex items-center justify-center font-bold flex-shrink-0">{app.job.company[0]}</div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900">{app.job.company}</p>
                      <p className="text-xs text-gray-500">{app.job.role}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                    </span>
                    <p className="text-xs text-gray-400 w-16 text-right">{new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Documents tab */}
          {tab === "documents" && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">My Documents</h3>
              </div>
              {docs.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <FileText className="h-10 w-10 text-gray-200 mb-3" />
                  <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                </div>
              ) : (
                <div className="p-5 grid sm:grid-cols-2 gap-3">
                  {docs.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                      <FileText size={20} className="text-[#FF9900] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${doc.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : doc.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="p-5 border-t border-gray-100">
                <Link href="/dashboard/resume" className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 py-4 rounded-xl text-sm text-gray-500 hover:border-[#FF9900] hover:text-[#FF9900] transition font-medium">
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