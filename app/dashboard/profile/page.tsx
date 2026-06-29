"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ArrowLeft, Save, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type Profile = {
  firstName: string; lastName: string; city: string; degree: string; branch: string;
  college: string; gradYear: string; cgpa: string; experience: string; jobType: string;
  salary: string; locations: string[]; skills: string[]; resumeUrl: string | null;
};

const LOCATION_OPTIONS = ["Delhi NCR","Mumbai","Bangalore","Hyderabad","Chennai","Pune","Kolkata","Any Location"];
const DEGREE_OPTIONS = ["B.Tech / B.E.","BCA","B.Sc","B.Com","BBA","MCA","MBA","M.Tech"];
const EXP_OPTIONS = ["fresher","0-1 years","1-2 years","2-5 years"];
const JOB_TYPE_OPTIONS = ["Full-time Employment","Internship + PPO","Remote / WFH","Startup","Government / PSU"];
const SALARY_OPTIONS = ["2–4 LPA","4–6 LPA","6–10 LPA","10+ LPA"];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    firstName: "", lastName: "", city: "", degree: "", branch: "", college: "",
    gradYear: "", cgpa: "", experience: "fresher", jobType: "", salary: "",
    locations: [], skills: [], resumeUrl: null,
  });

  useEffect(() => {
    fetch("/api/candidate/profile").then(r => r.json())
      .then(d => setProfile({ ...d, locations: d.locations || [], skills: d.skills || [] }))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const set = (k: keyof Profile, v: any) => setProfile(p => ({ ...p, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/candidate/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile),
      });
      if (!res.ok) { toast.error("Failed to update profile."); return; }
      toast.success("Profile updated successfully.");
    } catch { toast.error("Something went wrong."); } finally { setSaving(false); }
  }

  const profileScore = useMemo(() => {
    const checks = [profile.firstName, profile.lastName, profile.city, profile.degree, profile.branch,
      profile.college, profile.gradYear, profile.cgpa, profile.jobType, profile.salary, profile.experience,
      profile.resumeUrl, profile.skills.length > 0, profile.locations.length > 0];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/10 transition bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
  const sectionClass = "bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5";

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#FF9900]" size={28} /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Keep your information up to date for better job matches.</p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
            <div className="text-right">
              <p className="text-xs text-gray-500">Profile Completion</p>
              <p className="text-2xl font-bold text-[#FF9900]">{profileScore}%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#FF9900" strokeWidth="3"
                  strokeDasharray={`${profileScore} ${100 - profileScore}`} strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <form onSubmit={save} className="space-y-6">
          {/* Personal */}
          <div className={sectionClass}>
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {[["firstName","First Name"], ["lastName","Last Name"], ["city","Current City"]].map(([k, l]) => (
                <div key={k}>
                  <label className={labelClass}>{l}</label>
                  <input value={(profile as any)[k]} onChange={e => set(k as any, e.target.value)} className={inputClass} />
                </div>
              ))}
              <div>
                <label className={labelClass}>Experience</label>
                <select value={profile.experience} onChange={e => set("experience", e.target.value)} className={inputClass}>
                  {EXP_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className={sectionClass}>
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Education</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Degree</label>
                <select value={profile.degree} onChange={e => set("degree", e.target.value)} className={inputClass}>
                  <option value="">Select Degree</option>
                  {DEGREE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              {[["branch","Branch / Stream"], ["college","College / University"], ["cgpa","CGPA"]].map(([k, l]) => (
                <div key={k}>
                  <label className={labelClass}>{l}</label>
                  <input value={(profile as any)[k]} onChange={e => set(k as any, e.target.value)} className={inputClass} />
                </div>
              ))}
              <div>
                <label className={labelClass}>Graduation Year</label>
                <select value={profile.gradYear} onChange={e => set("gradYear", e.target.value)} className={inputClass}>
                  <option value="">Select Year</option>
                  {Array.from({ length: 10 }, (_, i) => 2024 + i).map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className={sectionClass}>
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Job Preferences</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Preferred Job Type</label>
                <select value={profile.jobType} onChange={e => set("jobType", e.target.value)} className={inputClass}>
                  <option value="">Select</option>
                  {JOB_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Expected Salary</label>
                <select value={profile.salary} onChange={e => set("salary", e.target.value)} className={inputClass}>
                  <option value="">Select</option>
                  {SALARY_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Preferred Locations</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {LOCATION_OPTIONS.map(loc => {
                  const active = profile.locations.includes(loc);
                  return (
                    <button key={loc} type="button"
                      onClick={() => set("locations", active ? profile.locations.filter(l => l !== loc) : [...profile.locations, loc])}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${active ? "bg-[#232F3E] text-white border-[#232F3E]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass}>Skills <span className="text-gray-400 font-normal">(comma separated)</span></label>
              <textarea rows={3} value={profile.skills.join(", ")}
                onChange={e => set("skills", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                className={`${inputClass} resize-none`} placeholder="React, Node.js, Python, SQL..." />
            </div>
          </div>

          {/* Resume */}
          <div className={sectionClass}>
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Resume</h2>
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile.resumeUrl ? "bg-emerald-100" : "bg-gray-200"}`}>
                  <CheckCircle size={18} className={profile.resumeUrl ? "text-emerald-600" : "text-gray-400"} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{profile.resumeUrl ? "Resume uploaded" : "No resume yet"}</p>
                  <p className="text-xs text-gray-500">{profile.resumeUrl ? "Active and visible to recruiters" : "Upload to start applying"}</p>
                </div>
              </div>
              <Link href="/dashboard/resume" className="text-xs font-semibold text-[#FF9900] hover:underline">
                {profile.resumeUrl ? "Update →" : "Upload →"}
              </Link>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link href="/dashboard" className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </Link>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 bg-[#FF9900] text-gray-900 font-bold px-8 py-3 rounded-xl text-sm hover:bg-[#e88d00] disabled:opacity-60 transition shadow-sm">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}