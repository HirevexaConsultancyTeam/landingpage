"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { FileText, Upload, Eye, Trash2, RefreshCw, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

export default function ResumePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/candidate/resume").then(r => r.json())
      .then(d => { if (d.resumeUrl) setResumeUrl(d.resumeUrl); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  async function uploadResume(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploading(true);
      const res = await fetch("/api/resume/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setResumeUrl(data.url);
    } catch { alert("Upload failed."); } finally { setUploading(false); }
  }

  async function deleteResume() {
    if (!confirm("Delete your current resume?")) return;
    const res = await fetch("/api/candidate/resume", { method: "DELETE" });
    if (res.ok) setResumeUrl("");
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#FF9900]" size={28} /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Resume</h1>
        <p className="text-sm text-gray-500 mb-8">Upload your latest resume in PDF, DOC, or DOCX format.</p>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {resumeUrl ? (
            <div className="p-8">
              <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-xl mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-emerald-800">Resume Uploaded</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Your resume is active and visible to recruiters.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#232F3E] text-white font-semibold text-sm px-5 py-3 rounded-xl hover:bg-gray-800 transition">
                  <Eye size={15} /> View Resume
                </a>
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FF9900] text-gray-900 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-[#e88d00] transition">
                  <RefreshCw size={15} /> Replace
                </button>
                <button onClick={deleteResume}
                  className="inline-flex items-center justify-center gap-2 border border-red-200 text-red-600 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-red-50 transition">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
                <FileText className="h-9 w-9 text-gray-400" />
              </div>
              <h2 className="font-bold text-gray-800 text-lg mb-2">No resume uploaded yet</h2>
              <p className="text-sm text-gray-500 mb-8 max-w-xs">Upload your resume to start applying for jobs. Supported formats: PDF, DOC, DOCX.</p>
              <button onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-[#FF9900] text-gray-900 font-bold px-8 py-3.5 rounded-xl hover:bg-[#e88d00] transition shadow-sm">
                <Upload size={16} /> Upload Resume
              </button>
            </div>
          )}
          <input ref={fileInputRef} hidden type="file" accept=".pdf,.doc,.docx" onChange={uploadResume} />
          {uploading && (
            <div className="px-8 pb-6 flex items-center gap-3 text-[#FF9900]">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Uploading your resume...</span>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h3 className="font-bold text-blue-800 text-sm mb-2">Resume Tips</h3>
          <ul className="space-y-1.5 text-xs text-blue-700">
            {["Keep it to 1–2 pages maximum", "Use clear section headings and bullet points", "Highlight your projects and internships", "Include relevant skills and tools", "Proofread before uploading"].map(tip => (
              <li key={tip} className="flex items-start gap-2"><CheckCircle size={12} className="mt-0.5 flex-shrink-0" />{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}