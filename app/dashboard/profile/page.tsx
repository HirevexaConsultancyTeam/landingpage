// ============================================================================
//  DESTINATION:  app/dashboard/profile/page.tsx   (replaces existing)
//  Requires lib/constants.ts
// ============================================================================
"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ArrowLeft, Save, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  LOCATION_OPTIONS,
  DEGREE_OPTIONS,
  EXP_OPTIONS,
  JOB_TYPE_OPTIONS,
  SALARY_OPTIONS,
  GRAD_YEARS,
} from "@/lib/constants";

type Profile = {
  firstName: string; lastName: string; city: string; degree: string; branch: string;
  college: string; gradYear: string; cgpa: string; experience: string; jobType: string;
  salary: string; locations: string[]; skills: string[]; resumeUrl: string | null;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    firstName: "", lastName: "", city: "", degree: "", branch: "", college: "",
    gradYear: "", cgpa: "", experience: "fresher", jobType: "", salary: "",
    locations: [], skills: [], resumeUrl: null,
  });

  useEffect(() => {
    fetch("/api/candidate/profile")
      .then((r) => r.json())
      .then((d) => setProfile({ ...d, locations: d.locations || [], skills: d.skills || [] }))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = (k: keyof Profile, v: string | string[] | null) =>
    setProfile((p) => ({ ...p, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/candidate/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) { toast.error("Failed to update profile."); return; }
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const profileScore = useMemo(() => {
    const checks = [
      profile.firstName, profile.lastName, profile.city, profile.degree, profile.branch,
      profile.college, profile.gradYear, profile.cgpa, profile.jobType, profile.salary,
      profile.experience, profile.resumeUrl, profile.skills.length > 0, profile.locations.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/10 transition bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
  const sectionClass = "bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-[#FF9900]" size={28} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-800">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="mt-1 text-sm text-gray-500">
              Keep your information up to date for better job matches.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
            <div className="text-right">
              <p className="text-xs text-gray-500">Profile Completion</p>
              <p className="text-2xl font-bold text-[#FF9900]">{profileScore}%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none" stroke="#FF9900" strokeWidth="3"
                  strokeDasharray={`${profileScore} ${100 - profileScore}`} strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <form onSubmit={save} className="space-y-6">
          {/* Personal */}
          <div className={sectionClass}>
            <h2 className="border-b border-gray-100 pb-3 text-base font-bold text-gray-900">
              Personal Information
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {([["firstName", "First Name"], ["lastName", "Last Name"], ["city", "Current City"]] as const).map(
                ([k, l]) => (
                  <div key={k}>
                    <label className={labelClass}>{l}</label>
                    <input value={profile[k]} onChange={(e) => set(k, e.target.value)} className={inputClass} />
                  </div>
                )
              )}
              <div>
                <label className={labelClass}>Experience</label>
                <select value={profile.experience} onChange={(e) => set("experience", e.target.value)} className={inputClass}>
                  {EXP_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className={sectionClass}>
            <h2 className="border-b border-gray-100 pb-3 text-base font-bold text-gray-900">Education</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Degree</label>
                <select value={profile.degree} onChange={(e) => set("degree", e.target.value)} className={inputClass}>
                  <option value="">Select Degree</option>
                  {DEGREE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              {([["branch", "Branch / Stream"], ["college", "College / University"], ["cgpa", "CGPA"]] as const).map(
                ([k, l]) => (
                  <div key={k}>
                    <label className={labelClass}>{l}</label>
                    <input value={profile[k]} onChange={(e) => set(k, e.target.value)} className={inputClass} />
                  </div>
                )
              )}
              <div>
                <label className={labelClass}>Graduation Year</label>
                <select value={profile.gradYear} onChange={(e) => set("gradYear", e.target.value)} className={inputClass}>
                  <option value="">Select Year</option>
                  {GRAD_YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className={sectionClass}>
            <h2 className="border-b border-gray-100 pb-3 text-base font-bold text-gray-900">Job Preferences</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Preferred Job Type</label>
                <select value={profile.jobType} onChange={(e) => set("jobType", e.target.value)} className={inputClass}>
                  <option value="">Select</option>
                  {JOB_TYPE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Expected Salary</label>
                <select value={profile.salary} onChange={(e) => set("salary", e.target.value)} className={inputClass}>
                  <option value="">Select</option>
                  {SALARY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Preferred Locations</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {LOCATION_OPTIONS.map((loc) => {
                  const active = profile.locations.includes(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() =>
                        set("locations", active ? profile.locations.filter((l) => l !== loc) : [...profile.locations, loc])
                      }
                      className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                        active
                          ? "border-[#232F3E] bg-[#232F3E] text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Skills <span className="font-normal text-gray-400">(comma separated)</span>
              </label>
              <textarea
                rows={3}
                value={profile.skills.join(", ")}
                onChange={(e) => set("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                className={`${inputClass} resize-none`}
                placeholder="React, Node.js, Python, SQL..."
              />
            </div>
          </div>

          {/* Resume */}
          <div className={sectionClass}>
            <h2 className="border-b border-gray-100 pb-3 text-base font-bold text-gray-900">Resume</h2>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${profile.resumeUrl ? "bg-emerald-100" : "bg-gray-200"}`}>
                  <CheckCircle size={18} className={profile.resumeUrl ? "text-emerald-600" : "text-gray-400"} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {profile.resumeUrl ? "Resume uploaded" : "No resume yet"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profile.resumeUrl ? "Active and visible to recruiters" : "Upload to start applying"}
                  </p>
                </div>
              </div>
              <Link href="/dashboard/resume" className="text-xs font-semibold text-[#FF9900] hover:underline">
                {profile.resumeUrl ? "Update →" : "Upload →"}
              </Link>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/dashboard" className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF9900] px-8 py-3 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-[#e88d00] disabled:opacity-60"
            >
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}