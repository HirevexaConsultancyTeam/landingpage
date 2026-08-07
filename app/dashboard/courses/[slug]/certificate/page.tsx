"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Award, Loader2, Lock } from "lucide-react";

export default function CertificatePage() {
  const { slug } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/courses/${slug}`).then(r => r.json()).then(async data => {
      setCourse(data);
      const certs = await axios.get("/api/certificates");
      const existing = certs.data.find((c: any) => c.courseId === data.id);
      if (existing) setCert(existing);
    }).finally(() => setLoading(false));
  }, [slug]);

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      const res = await axios.post("/api/certificates", { courseId: course.id });
      setCert(res.data);
      toast.success("Certificate generated!");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not generate certificate yet.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" /></div>;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl">
        {cert ? (
          <>
            <Award size={40} className="text-[#FF9900] mx-auto mb-3" />
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">HireVexa Consultancy · Certificate of Completion</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-sm text-gray-500 mb-1">Final Score: <span className="font-bold text-emerald-600">{cert.finalScore}%</span></p>
            <p className="text-xs text-gray-400 mt-4">Certificate ID: {cert.code}</p>
          </>
        ) : (
          <>
            <Lock size={32} className="text-gray-300 mx-auto mb-3" />
            <h1 className="text-lg font-bold text-gray-900 mb-2">Certificate Not Yet Available</h1>
            <p className="text-sm text-gray-500 mb-4">Complete all lessons and pass every module quiz to unlock it.</p>
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <button onClick={generate} disabled={generating}
              className="bg-[#FF9900] text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm disabled:opacity-50">
              {generating ? "Checking..." : "Try Generate Certificate"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}