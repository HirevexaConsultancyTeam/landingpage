"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, BookOpen, Briefcase, FileText, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Candidate = {
  id: string; firstName: string; lastName: string; city: string | null;
  degree: string | null; branch: string | null; college: string | null; cgpa: string | null;
  experience: string; skills: string[]; resumeUrl: string | null; status: string;
  user: { email: string };
  applications: { id: string; status: string; appliedAt: string; job: { company: string; role: string } }[];
  documents: { id: string; name: string; type: string; url: string }[];
};

const APP_STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-blue-50 text-blue-700",
  UNDER_REVIEW: "bg-yellow-50 text-yellow-700",
  INTERVIEW_SCHEDULED: "bg-purple-50 text-purple-700",
  OFFER_RECEIVED: "bg-emerald-50 text-emerald-700",
  PLACED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
};

const CAND_STATUS_COLORS: Record<string, string> = {
  ONBOARDING: "bg-gray-100 text-gray-600",
  RESUME_REVIEW: "bg-blue-50 text-blue-700",
  INTERVIEW_STAGE: "bg-purple-50 text-purple-700",
  OFFER_RECEIVED: "bg-emerald-50 text-emerald-700",
  PLACED: "bg-green-50 text-green-700",
};

export default function CandidateDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    fetch(`/api/admin/candidates/${id}`)
      .then(r => r.json())
      .then(data => { if (data.error) throw new Error(); setCandidate(data); })
      .catch(() => { toast.error("Failed to load candidate"); router.push("/admin/candidates"); })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="h-7 w-7 animate-spin text-[#FF9900]" /></div>;
  if (!candidate) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/admin/candidates")}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition flex-shrink-0">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0 flex items-start sm:items-center gap-3 flex-col sm:flex-row">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{candidate.firstName} {candidate.lastName}</h1>
            <p className="text-sm text-gray-500">{candidate.user.email}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${CAND_STATUS_COLORS[candidate.status] ?? "bg-gray-100 text-gray-600"}`}>
            {candidate.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Profile */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <User size={15} className="text-blue-600" />
              </div>
              <h2 className="font-bold text-gray-900">Profile</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "City", value: candidate.city },
                { label: "Experience", value: candidate.experience },
                { label: "Degree", value: candidate.degree },
                { label: "Branch", value: candidate.branch },
                { label: "College", value: candidate.college },
                { label: "CGPA", value: candidate.cgpa },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          {candidate.skills.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                  <BookOpen size={15} className="text-[#FF9900]" />
                </div>
                <h2 className="font-bold text-gray-900">Skills</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map(s => (
                  <span key={s} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Applications */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                <Briefcase size={15} className="text-purple-600" />
              </div>
              <h2 className="font-bold text-gray-900">Applications ({candidate.applications.length})</h2>
            </div>
            {candidate.applications.length === 0 ? (
              <p className="text-sm text-gray-400">No applications yet.</p>
            ) : (
              <div className="space-y-2">
                {candidate.applications.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{a.job.role}</p>
                      <p className="text-xs text-gray-500">{a.job.company} · {new Date(a.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${APP_STATUS_COLORS[a.status] ?? "bg-gray-50 text-gray-600"}`}>
                      {a.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Resume */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <FileText size={15} className="text-emerald-600" />
              </div>
              <h2 className="font-bold text-gray-900">Resume</h2>
            </div>
            {candidate.resumeUrl ? (
              <a href={candidate.resumeUrl} target="_blank"
                className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold text-sm px-4 py-2.5 rounded-xl transition w-full justify-center">
                <ExternalLink size={14} /> View Resume
              </a>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400">No resume uploaded</p>
                <p className="text-xs text-gray-300 mt-1">Candidate hasn't uploaded a resume yet</p>
              </div>
            )}
          </div>

          {/* Documents */}
          {candidate.documents.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                  <FileText size={15} className="text-gray-600" />
                </div>
                <h2 className="font-bold text-gray-900">Documents</h2>
              </div>
              <div className="space-y-2">
                {candidate.documents.map(doc => (
                  <a key={doc.id} href={doc.url} target="_blank"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                    <ExternalLink size={13} className="text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}